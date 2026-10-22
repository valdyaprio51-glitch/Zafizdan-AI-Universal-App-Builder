import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../prisma';

export const statsRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/v1/stats
  fastify.get('/stats', async () => {
    const totalProjects = await prisma.project.count();
    const runningApps = await prisma.runtimeInstance.count({ where: { status: 'RUNNING' } });
    const successfulBuilds = await prisma.buildRun.count({ where: { status: 'SUCCESS' } });
    const failedBuilds = await prisma.buildRun.count({ where: { status: 'FAILED' } });
    const activeJobs = await prisma.generationJob.count({ where: { status: 'PROCESSING' } });

    const usageRecords = await prisma.usageRecord.findMany({
      select: { totalCost: true, promptTokens: true, completionTokens: true },
    });

    const totalCost = usageRecords.reduce((acc, u) => acc + u.totalCost, 0);
    const totalTokens = usageRecords.reduce((acc, u) => acc + u.promptTokens + u.completionTokens, 0);

    const totalBuildAttempts = successfulBuilds + failedBuilds;
    const buildSuccessRate = totalBuildAttempts > 0 ? Math.round((successfulBuilds / totalBuildAttempts) * 100) : 100;

    const recentProjects = await prisma.project.findMany({
      take: 5,
      orderBy: { updatedAt: 'desc' },
      include: {
        configuration: true,
        runtimes: { where: { status: 'RUNNING' } },
      },
    });

    return {
      totalProjects,
      runningApps,
      successfulBuilds,
      failedBuilds,
      activeJobs,
      totalCost,
      totalTokens,
      buildSuccessRate,
      recentProjects,
    };
  });
};

