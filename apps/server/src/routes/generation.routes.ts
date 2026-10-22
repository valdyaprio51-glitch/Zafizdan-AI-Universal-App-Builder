import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../prisma';
import { eventBroadcaster } from '../core/events/event-broadcaster';
import { pipelineOrchestrator } from '../core/pipeline/pipeline.orchestrator';

export const generationRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /api/v1/projects/:id/generate
  fastify.post('/:id/generate', async (request, reply) => {
    const { id } = request.params as { id: string };
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return reply.status(404).send({ error: 'Project not found' });

    const job = await prisma.generationJob.create({
      data: {
        projectId: id,
        status: 'PENDING',
        progress: 0,
      },
    });

    // Run asynchronously
    pipelineOrchestrator.runPipeline(id, job.id).catch((err) => {
      console.error('Error starting pipeline:', err);
    });

    return reply.status(202).send({
      message: 'Generation job scheduled',
      jobId: job.id,
    });
  });

  // GET /api/v1/projects/:id/generation-status
  fastify.get('/:id/generation-status', async (request, reply) => {
    const { id } = request.params as { id: string };
    const job = await prisma.generationJob.findFirst({
      where: { projectId: id },
      orderBy: { createdAt: 'desc' },
      include: { steps: { orderBy: { createdAt: 'asc' } } },
    });

    if (!job) return reply.status(404).send({ error: 'No generation job found' });
    return job;
  });

  // GET /api/v1/projects/:id/events (Server-Sent Events for real-time progress)
  fastify.get('/:id/events', async (request, reply) => {
    const { id } = request.params as { id: string };

    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache, no-transform');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.setHeader('Access-Control-Allow-Origin', '*');

    // Send initial connection event
    reply.raw.write(`event: connected\ndata: ${JSON.stringify({ connected: true, projectId: id })}\n\n`);

    // Stream existing history first
    const history = eventBroadcaster.getHistory(id);
    for (const evt of history) {
      reply.raw.write(`event: ${evt.type}\ndata: ${JSON.stringify(evt)}\n\n`);
    }

    // Subscribe to new real-time events
    const unsubscribe = eventBroadcaster.subscribe(id, (evt) => {
      try {
        reply.raw.write(`event: ${evt.type}\ndata: ${JSON.stringify(evt)}\n\n`);
      } catch (err) {
        console.error('Error writing SSE stream:', err);
      }
    });

    request.raw.on('close', () => {
      unsubscribe();
    });
  });
};
