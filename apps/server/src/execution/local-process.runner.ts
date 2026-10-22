import { spawn, ChildProcess } from 'child_process';
import { IExecutionRunner, ExecutionOptions, ExecutionResult, RunningInstance } from './interfaces';
import { CommandSanitizer } from '../core/security/command-sanitizer';

export class LocalProcessRunner implements IExecutionRunner {
  private activeProcesses = new Map<string, ChildProcess>();

  async execute(commandStr: string, options: ExecutionOptions): Promise<ExecutionResult> {
    const startTime = Date.now();
    const sanitized = CommandSanitizer.sanitize(commandStr);
    const timeoutMs = options.timeoutMs ?? 120000; // 2 minutes default

    return new Promise((resolve) => {
      let stdout = '';
      let stderr = '';
      let timedOut = false;

      // In Windows, npm / npx might be cmd scripts
      const isWindows = process.platform === 'win32';
      let executable = sanitized.command;
      if (isWindows) {
        if (executable === 'npm') executable = 'npm.cmd';
        else if (executable === 'npx') executable = 'npx.cmd';
      }

      let child: ChildProcess;
      try {
        child = spawn(executable, sanitized.args, {
          cwd: options.cwd,
          env: { ...process.env, ...options.env },
          shell: false,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return resolve({
          exitCode: 1,
          stdout: '',
          stderr: `Failed to spawn process: ${msg}`,
          durationMs: Date.now() - startTime,
          timedOut: false,
        });
      }

      const timer = setTimeout(() => {
        timedOut = true;
        this.killProcess(child);
      }, timeoutMs);

      child.stdout?.on('data', (data) => {
        const text = data.toString('utf8');
        stdout += text;
        options.onStdout?.(text);
      });

      child.stderr?.on('data', (data) => {
        const text = data.toString('utf8');
        stderr += text;
        options.onStderr?.(text);
      });

      child.on('close', (code) => {
        clearTimeout(timer);
        resolve({
          exitCode: code ?? (timedOut ? 124 : 0),
          stdout,
          stderr: timedOut ? `${stderr}\nExecution timed out after ${timeoutMs}ms` : stderr,
          durationMs: Date.now() - startTime,
          timedOut,
        });
      });

      child.on('error', (err) => {
        clearTimeout(timer);
        resolve({
          exitCode: 1,
          stdout,
          stderr: `${stderr}\nProcess error: ${err.message}`,
          durationMs: Date.now() - startTime,
          timedOut: false,
        });
      });
    });
  }

  async startService(
    projectId: string,
    commandStr: string,
    port: number,
    options: ExecutionOptions
  ): Promise<RunningInstance> {
    const sanitized = CommandSanitizer.sanitize(commandStr);
    const isWindows = process.platform === 'win32';
    const executable = isWindows && !sanitized.command.endsWith('.exe') && !sanitized.command.endsWith('.cmd')
      ? `${sanitized.command}.cmd`
      : sanitized.command;

    const child = spawn(executable, sanitized.args, {
      cwd: options.cwd,
      env: { ...process.env, ...options.env, PORT: String(port) },
      shell: isWindows,
    });

    const instanceId = `inst_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.activeProcesses.set(instanceId, child);

    child.stdout?.on('data', (data) => {
      options.onStdout?.(data.toString('utf8'));
    });

    child.stderr?.on('data', (data) => {
      options.onStderr?.(data.toString('utf8'));
    });

    const previewUrl = `http://localhost:${port}`;

    const stop = async () => {
      this.killProcess(child);
      this.activeProcesses.delete(instanceId);
    };

    return {
      id: instanceId,
      projectId,
      pid: child.pid,
      port,
      previewUrl,
      startedAt: new Date(),
      stop,
    };
  }

  async isDockerAvailable(): Promise<boolean> {
    try {
      const res = await this.execute('docker --version', { cwd: process.cwd(), timeoutMs: 3000 });
      return res.exitCode === 0;
    } catch {
      return false;
    }
  }

  private killProcess(child: ChildProcess): void {
    if (!child.pid) return;
    try {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', child.pid.toString(), '/f', '/t']);
      } else {
        child.kill('SIGTERM');
      }
    } catch (e) {
      console.warn(`Could not kill process ${child.pid}:`, e);
    }
  }
}

export const localProcessRunner = new LocalProcessRunner();

