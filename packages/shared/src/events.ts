// Pipeline and Runtime Real-time Events

import { PipelineStage, ProjectStatus, ExecutionLogEntry } from './types';

export enum EventType {
  JOB_CREATED = 'job.created',
  PLANNING_STARTED = 'planning.started',
  PLANNING_COMPLETED = 'planning.completed',
  STAGE_STARTED = 'stage.started',
  STAGE_COMPLETED = 'stage.completed',
  FILE_CREATED = 'file.created',
  FILE_UPDATED = 'file.updated',
  DEPENDENCY_INSTALL_STARTED = 'dependency.install.started',
  DEPENDENCY_INSTALL_COMPLETED = 'dependency.install.completed',
  TEST_STARTED = 'test.started',
  TEST_COMPLETED = 'test.completed',
  BUILD_STARTED = 'build.started',
  BUILD_COMPLETED = 'build.completed',
  REPAIR_STARTED = 'repair.started',
  REPAIR_COMPLETED = 'repair.completed',
  RUNTIME_STARTED = 'runtime.started',
  RUNTIME_STOPPED = 'runtime.stopped',
  JOB_FAILED = 'job.failed',
  LOG_APPENDED = 'log.appended',
  PROGRESS_UPDATED = 'progress.updated',
}

export interface BaseEventPayload {
  projectId: string;
  jobId: string;
  timestamp: string;
}

export interface PipelineProgressEvent extends BaseEventPayload {
  stage: PipelineStage;
  stageIndex: number;
  totalStages: number;
  percentage: number;
  message: string;
  details?: Record<string, unknown>;
}

export interface FileEventPayload extends BaseEventPayload {
  path: string;
  size: number;
  action: 'create' | 'update' | 'delete';
}

export interface TestEventPayload extends BaseEventPayload {
  passed: boolean;
  totalTests: number;
  failedTests: number;
  durationMs: number;
  output: string;
}

export interface RuntimeEventPayload extends BaseEventPayload {
  status: ProjectStatus;
  port?: number;
  previewUrl?: string;
  error?: string;
}

export interface LogEventPayload extends BaseEventPayload {
  log: ExecutionLogEntry;
}

export interface PipelineEvent {
  id: string;
  type: EventType;
  projectId: string;
  jobId: string;
  timestamp: string;
  payload: Record<string, unknown>;
}
