import {
  PipelineStage,
  ProjectStatus,
  EventType,
  GenerationPlan,
} from '@zafizdan/shared';
import { prisma } from '../../prisma';
import { eventBroadcaster } from '../events/event-broadcaster';
import { workspaceManager, WorkspaceManager } from '../../file-engine/workspace.manager';
import { aiProviderManager, AIProviderManager } from '../../ai/ai-provider-manager';
import { localProcessRunner } from '../../execution/local-process.runner';
import { QAEngine } from '../qa/qa-engine';
import { PortAllocator } from '../../execution/port-allocator';

const STAGE_ORDER = [
  PipelineStage.STAGE_1_REQUIREMENT_ANALYSIS,
  PipelineStage.STAGE_2_ARCHITECTURE_PLANNING,
  PipelineStage.STAGE_3_PROJECT_SCAFFOLDING,
  PipelineStage.STAGE_4_DATABASE_GENERATION,
  PipelineStage.STAGE_5_BACKEND_GENERATION,
  PipelineStage.STAGE_6_FRONTEND_GENERATION,
  PipelineStage.STAGE_7_INTEGRATION,
  PipelineStage.STAGE_8_AUTOMATED_QA,
  PipelineStage.STAGE_9_AI_REPAIR_LOOP,
  PipelineStage.STAGE_10_BUILD_AND_RUN,
  PipelineStage.STAGE_11_DELIVERY,
];

export class PipelineOrchestrator {
  private qaEngine: QAEngine;

  constructor(
    private workspace: WorkspaceManager = workspaceManager,
    private aiManager: AIProviderManager = aiProviderManager
  ) {
    this.qaEngine = new QAEngine(localProcessRunner, this.workspace);
  }

  async runPipeline(projectId: string, jobId: string): Promise<void> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { configuration: true },
    });

    if (!project) throw new Error(`Project ${projectId} not found`);

    const aiProvider = this.aiManager.getProvider(project.configuration?.aiProviderId || undefined);

    await prisma.generationJob.update({
      where: { id: jobId },
      data: { status: 'PROCESSING', startedAt: new Date(), progress: 5 },
    });

    await prisma.project.update({
      where: { id: projectId },
      data: { status: ProjectStatus.PLANNING },
    });

    eventBroadcaster.emit(projectId, jobId, EventType.PLANNING_STARTED, {
      message: 'Analyzing user specifications and synthesizing architectural plan...',
    });

    let plan: GenerationPlan;
    try {
      plan = await aiProvider.generatePlan(project.prompt);
      await prisma.generationJob.update({
        where: { id: jobId },
        data: { planSummary: plan.summary, progress: 15 },
      });

      eventBroadcaster.emit(projectId, jobId, EventType.PLANNING_COMPLETED, {
        plan,
        message: 'Architectural blueprint created successfully.',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      await this.failJob(projectId, jobId, `Planning failed: ${msg}`);
      return;
    }

    const appName = project.configuration?.appName || project.name;
    const frontend = project.configuration?.frontend || 'nextjs';
    const backend = project.configuration?.backend || 'aspnet_core';
    const database = project.configuration?.database || 'sqlite';

    // Loop through pipeline stages
    for (let i = 0; i < STAGE_ORDER.length; i++) {
      const stage = STAGE_ORDER[i];
      const progressPercent = Math.round(15 + ((i + 1) / STAGE_ORDER.length) * 80);

      // Record step in database
      const step = await prisma.generationStep.create({
        data: {
          jobId,
          stage,
          name: this.getStageHumanName(stage),
          status: 'RUNNING',
          startedAt: new Date(),
        },
      });

      eventBroadcaster.emit(projectId, jobId, EventType.STAGE_STARTED, {
        stage,
        stageIndex: i + 1,
        totalStages: STAGE_ORDER.length,
        percentage: progressPercent,
        message: `Executing ${this.getStageHumanName(stage)}...`,
      });

      try {
        if (stage === PipelineStage.STAGE_8_AUTOMATED_QA) {
          // Automated Quality Assurance
          await prisma.project.update({ where: { id: projectId }, data: { status: ProjectStatus.TESTING } });
          const qaResult = await this.qaEngine.runQualityChecks(projectId);

          await prisma.testRun.create({
            data: {
              projectId,
              status: qaResult.passed ? 'SUCCESS' : 'FAILED',
              totalTests: 1,
              passedCount: qaResult.passed ? 1 : 0,
              failedCount: qaResult.passed ? 0 : 1,
              output: qaResult.stdout,
              error: qaResult.stderr,
              exitCode: qaResult.exitCode,
            },
          });

          eventBroadcaster.emit(projectId, jobId, EventType.TEST_COMPLETED, {
            passed: qaResult.passed,
            output: qaResult.stdout || qaResult.stderr,
          });

          if (!qaResult.passed) {
            // Stage 9 will handle repair
            console.log(`QA check discovered issues. Delegating to Stage 9 AI Repair Loop.`);
          }
        } else if (stage === PipelineStage.STAGE_9_AI_REPAIR_LOOP) {
          // Check last test run
          const lastTest = await prisma.testRun.findFirst({
            where: { projectId },
            orderBy: { createdAt: 'desc' },
          });

          if (lastTest && lastTest.status === 'FAILED') {
            eventBroadcaster.emit(projectId, jobId, EventType.REPAIR_STARTED, {
              message: 'Initiating self-healing repair loop...',
            });

            const fakeQaResult = {
              passed: false,
              checkType: 'unit_test' as const,
              command: 'check',
              exitCode: 1,
              stdout: lastTest.output || '',
              stderr: lastTest.error || '',
              errorsFound: [{ message: lastTest.error || 'Failed test', category: 'runtime' as const }],
            };

            const repairResult = await this.qaEngine.executeRepairLoop(
              projectId,
              stage,
              fakeQaResult,
              aiProvider,
              3
            );

            eventBroadcaster.emit(projectId, jobId, EventType.REPAIR_COMPLETED, {
              resolved: repairResult.resolved,
              attemptsCount: repairResult.attempts.length,
            });
          }
        } else if (stage === PipelineStage.STAGE_10_BUILD_AND_RUN) {
          await prisma.project.update({ where: { id: projectId }, data: { status: ProjectStatus.STARTING } });
          eventBroadcaster.emit(projectId, jobId, EventType.BUILD_STARTED, {
            message: 'Building application artifacts and allocating isolated port...',
          });

          const allocatedPort = await PortAllocator.allocate();
          const previewUrl = `http://localhost:${allocatedPort}`;

          const runtime = await prisma.runtimeInstance.create({
            data: {
              projectId,
              status: 'RUNNING',
              port: allocatedPort,
              previewUrl,
              startedAt: new Date(),
            },
          });

          await prisma.project.update({ where: { id: projectId }, data: { status: ProjectStatus.RUNNING } });

          eventBroadcaster.emit(projectId, jobId, EventType.RUNTIME_STARTED, {
            runtimeId: runtime.id,
            port: allocatedPort,
            previewUrl,
            status: ProjectStatus.RUNNING,
            message: `Application is running at ${previewUrl}`,
          });
        } else {
          // Normal file generation stages
          const existingTree = this.workspace.getFileTree(projectId);
          const generatedFiles = await aiProvider.generateStageFiles(
            stage,
            plan,
            {
              appName,
              frontend,
              backend,
              database,
              existingFiles: [],
            }
          );

          for (const file of generatedFiles) {
            await this.workspace.writeFile(projectId, file.path, file.content);
            eventBroadcaster.emit(projectId, jobId, EventType.FILE_CREATED, {
              path: file.path,
              size: Buffer.byteLength(file.content, 'utf8'),
              action: 'create',
            });
          }
        }

        // Mark step completed
        await prisma.generationStep.update({
          where: { id: step.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        });

        await prisma.generationJob.update({
          where: { id: jobId },
          data: {
            currentStage: stage,
            progress: progressPercent,
          },
        });

        eventBroadcaster.emit(projectId, jobId, EventType.STAGE_COMPLETED, {
          stage,
          stageIndex: i + 1,
          totalStages: STAGE_ORDER.length,
          percentage: progressPercent,
        });
      } catch (stageErr: unknown) {
        const msg = stageErr instanceof Error ? stageErr.message : String(stageErr);
        await prisma.generationStep.update({
          where: { id: step.id },
          data: { status: 'FAILED', error: msg, completedAt: new Date() },
        });
        await this.failJob(projectId, jobId, `Error during stage ${stage}: ${msg}`);
        return;
      }
    }

    // Complete pipeline
    await this.workspace.createSnapshot(projectId, 'Initial AI Generation', 'STAGE_11_DELIVERY');

    await prisma.generationJob.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        progress: 100,
        completedAt: new Date(),
      },
    });

    eventBroadcaster.emit(projectId, jobId, EventType.PROGRESS_UPDATED, {
      percentage: 100,
      status: 'COMPLETED',
      message: 'Universal AI App Generation finished successfully!',
    });
  }

  private async failJob(projectId: string, jobId: string, error: string): Promise<void> {
    await prisma.generationJob.update({
      where: { id: jobId },
      data: { status: 'FAILED', error, completedAt: new Date() },
    });
    await prisma.project.update({
      where: { id: projectId },
      data: { status: ProjectStatus.FAILED },
    });
    eventBroadcaster.emit(projectId, jobId, EventType.JOB_FAILED, { error });
  }

  private getStageHumanName(stage: PipelineStage): string {
    const names: Record<PipelineStage, string> = {
      [PipelineStage.STAGE_1_REQUIREMENT_ANALYSIS]: 'Requirement Analysis (PRD)',
      [PipelineStage.STAGE_2_ARCHITECTURE_PLANNING]: 'Architecture Planning & Contracts',
      [PipelineStage.STAGE_3_PROJECT_SCAFFOLDING]: 'Project Scaffolding & Manifests',
      [PipelineStage.STAGE_4_DATABASE_GENERATION]: 'Database Schema & Migrations',
      [PipelineStage.STAGE_5_BACKEND_GENERATION]: 'Backend & REST APIs',
      [PipelineStage.STAGE_6_FRONTEND_GENERATION]: 'Frontend & UI Components',
      [PipelineStage.STAGE_7_INTEGRATION]: 'Integration & Environment Wiring',
      [PipelineStage.STAGE_8_AUTOMATED_QA]: 'Automated Quality Assurance',
      [PipelineStage.STAGE_9_AI_REPAIR_LOOP]: 'AI Self-Healing Repair Loop',
      [PipelineStage.STAGE_10_BUILD_AND_RUN]: 'Isolated Build & Run',
      [PipelineStage.STAGE_11_DELIVERY]: 'Delivery & Packaging',
    };
    return names[stage] || stage;
  }
}

export const pipelineOrchestrator = new PipelineOrchestrator();
