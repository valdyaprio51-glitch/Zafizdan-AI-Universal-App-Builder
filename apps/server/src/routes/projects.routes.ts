import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../prisma';
import { CreateProjectSchema } from '@zafizdan/shared';
import { workspaceManager } from '../file-engine/workspace.manager';
import { pipelineOrchestrator } from '../core/pipeline/pipeline.orchestrator';

export const projectsRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/v1/projects
  fastify.get('/', async () => {
    const projects = await prisma.project.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        configuration: true,
        runtimes: { where: { status: 'RUNNING' } },
        generationJobs: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
    return projects;
  });

  // GET /api/v1/projects/:id
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        configuration: true,
        runtimes: true,
        generationJobs: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { steps: { orderBy: { createdAt: 'asc' } } },
        },
        buildRuns: { orderBy: { createdAt: 'desc' }, take: 5 },
        testRuns: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });

    if (!project) {
      return reply.status(404).send({ error: 'Project not found' });
    }

    return project;
  });

  // POST /api/v1/projects
  fastify.post('/', async (request, reply) => {
    const parseResult = CreateProjectSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({ error: 'Validation failed', details: parseResult.error.format() });
    }

    const { name, prompt, description, config } = parseResult.data;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Ensure a default user exists for demo/local usage
    let defaultUser = await prisma.user.findFirst();
    if (!defaultUser) {
      defaultUser = await prisma.user.create({
        data: {
          email: 'developer@zafizdan.ai',
          name: 'Lead Developer',
          passwordHash: 'insecure_default_hash_for_demo',
          role: 'admin',
        },
      });
    }

    // 1. Create project
    const project = await prisma.project.create({
      data: {
        name,
        slug,
        description: description || prompt.slice(0, 150),
        prompt,
        status: 'DRAFT',
        workspacePath: `./workspaces/${slug}`,
        userId: defaultUser.id,
        configuration: {
          create: {
            appName: name,
            description,
            appType: config?.appType || 'full_stack',
            frontend: config?.frontend || 'nextjs',
            backend: config?.backend || 'aspnet_core',
            database: config?.database || 'sqlite',
            auth: config?.auth || 'jwt',
            authorization: config?.authorization || 'rbac',
            language: config?.language || 'typescript',
            uiLibrary: config?.uiLibrary || 'tailwind',
            dockerEnabled: config?.dockerEnabled ?? true,
            aiProviderId: config?.aiProviderId,
          },
        },
      },
      include: { configuration: true },
    });

    // Initialize workspace directory
    workspaceManager.getProjectWorkspace(project.id);

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: defaultUser.id,
        projectId: project.id,
        action: 'PROJECT_CREATED',
        resource: 'project',
        details: JSON.stringify({ name, prompt }),
      },
    });

    // Automatically trigger generation job if in one-command mode
    const job = await prisma.generationJob.create({
      data: {
        projectId: project.id,
        status: 'PENDING',
        progress: 0,
      },
    });

    // Trigger pipeline asynchronously in background
    pipelineOrchestrator.runPipeline(project.id, job.id).catch((err) => {
      console.error(`Pipeline execution error for project ${project.id}:`, err);
    });

    return reply.status(201).send({ project, jobId: job.id });
  });

  // DELETE /api/v1/projects/:id
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      workspaceManager.deleteFile(id, ''); // Remove project directory
      await prisma.project.delete({ where: { id } });
      return { success: true, message: 'Project deleted' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return reply.status(500).send({ error: `Failed to delete project: ${msg}` });
    }
  });
};

