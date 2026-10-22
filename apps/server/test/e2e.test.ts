import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import { prisma } from '../src/prisma';
import { pipelineOrchestrator } from '../src/core/pipeline/pipeline.orchestrator';
import { workspaceManager } from '../src/file-engine/workspace.manager';

async function runE2ETest() {
  console.log('🚀 Running End-to-End Vertical Slice Pipeline Test...\n');

  // Ensure default user exists
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'e2e-test@zafizdan.ai',
        name: 'E2E Test User',
        passwordHash: 'test_hash',
        role: 'admin',
      },
    });
  }

  // 1. Create project
  const projectName = 'SaaS Inventory Management';
  const prompt =
    'Buatkan aplikasi SaaS inventory management dengan Next.js, ASP.NET Core Web API, SQL Server, JWT authentication, role-based access control, dashboard analytics, product management, stock movement, reporting, Docker, dan automated testing.';

  const project = await prisma.project.create({
    data: {
      name: projectName,
      slug: 'saas-inventory-mgmt',
      description: 'End-to-End verified inventory SaaS application',
      prompt,
      status: 'DRAFT',
      workspacePath: './workspaces/saas-inventory-mgmt',
      userId: user.id,
      configuration: {
        create: {
          appName: 'SaaSInventoryMgmt',
          frontend: 'nextjs',
          backend: 'aspnet_core',
          database: 'sqlite',
          auth: 'jwt',
          authorization: 'rbac',
          dockerEnabled: true,
        },
      },
    },
    include: { configuration: true },
  });

  console.log(`Created Project: ${project.id} - ${project.name}`);

  // 2. Create Generation Job
  const job = await prisma.generationJob.create({
    data: {
      projectId: project.id,
      status: 'PENDING',
      progress: 0,
    },
  });

  console.log(`Created Generation Job: ${job.id}`);

  // 3. Execute 11-Stage Pipeline
  console.log('Executing 11-Stage Pipeline...');
  await pipelineOrchestrator.runPipeline(project.id, job.id);

  // 4. Verification
  const updatedJob = await prisma.generationJob.findUnique({
    where: { id: job.id },
    include: { steps: true },
  });

  assert.strictEqual(updatedJob?.status, 'COMPLETED', 'Job must be COMPLETED');
  assert.strictEqual(updatedJob?.progress, 100, 'Progress must be 100%');
  console.log(`✔ Generation Job completed with ${updatedJob.steps.length} stages recorded.`);

  const updatedProject = await prisma.project.findUnique({
    where: { id: project.id },
    include: { runtimes: true, snapshots: true },
  });

  assert.strictEqual(updatedProject?.status, 'RUNNING', 'Project status must be RUNNING');
  assert.strictEqual(updatedProject.runtimes.length > 0, true, 'Runtime instance must exist');
  assert.strictEqual(updatedProject.snapshots.length > 0, true, 'Snapshot must be created');
  console.log(`✔ Runtime verified running at ${updatedProject.runtimes[0].previewUrl}`);

  // 5. Verify physical files on disk
  const workspacePath = workspaceManager.getProjectWorkspace(project.id);
  const prdExists = fs.existsSync(path.join(workspacePath, 'docs/PRD.md'));
  const programCsExists = fs.existsSync(path.join(workspacePath, 'backend/Program.cs'));
  const frontendAppExists = fs.existsSync(path.join(workspacePath, 'frontend/src/app/page.tsx'));
  const dockerComposeExists = fs.existsSync(path.join(workspacePath, 'docker-compose.yml'));

  assert.strictEqual(prdExists, true, 'docs/PRD.md must exist on disk');
  assert.strictEqual(programCsExists, true, 'backend/Program.cs must exist on disk');
  assert.strictEqual(frontendAppExists, true, 'frontend/src/app/page.tsx must exist on disk');
  assert.strictEqual(dockerComposeExists, true, 'docker-compose.yml must exist on disk');
  console.log('✔ Physical project workspace files verified on disk.');

  // 6. Test ZIP export
  const zip = await workspaceManager.exportToZip(project.id);
  assert.strictEqual(zip.length > 500, true, 'Exported ZIP must contain files');
  console.log(`✔ ZIP Export verified (${zip.length} bytes).`);

  console.log('\n🎉 END-TO-END VERTICAL SLICE TEST PASSED PERFECTLY!\n');
}

runE2ETest().catch((err) => {
  console.error('❌ E2E Test failed:', err);
  process.exit(1);
});
