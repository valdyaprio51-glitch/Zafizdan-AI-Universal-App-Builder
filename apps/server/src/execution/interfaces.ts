export interface ExecutionOptions {
  cwd: string;
  env?: Record<string, string>;
  timeoutMs?: number;
  onStdout?: (data: string) => void;
  onStderr?: (data: string) => void;
}

export interface ExecutionResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
  timedOut: boolean;
}

export interface RunningInstance {
  id: string;
  projectId: string;
  pid?: number;
  port: number;
  previewUrl: string;
  startedAt: Date;
  stop: () => Promise<void>;
}

export interface IExecutionRunner {
  execute(command: string, options: ExecutionOptions): Promise<ExecutionResult>;
  startService(
    projectId: string,
    command: string,
    port: number,
    options: ExecutionOptions
  ): Promise<RunningInstance>;
  isDockerAvailable(): Promise<boolean>;
}
