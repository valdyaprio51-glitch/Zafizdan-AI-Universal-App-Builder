import { EventEmitter } from 'events';

export interface QueueJob<T = unknown> {
  id: string;
  name: string;
  data: T;
  priority?: number;
  attemptsMade: number;
  maxAttempts: number;
  status: 'waiting' | 'active' | 'completed' | 'failed';
  error?: string;
  result?: unknown;
  createdAt: Date;
  processedAt?: Date;
  finishedAt?: Date;
}

export type JobHandler<T = unknown, R = unknown> = (job: QueueJob<T>) => Promise<R>;

export interface IJobQueue<T = unknown> {
  add(name: string, data: T, options?: { priority?: number; maxAttempts?: number }): Promise<QueueJob<T>>;
  process(handler: JobHandler<T>): void;
  getJob(id: string): Promise<QueueJob<T> | undefined>;
  getWaitingCount(): Promise<number>;
  getActiveCount(): Promise<number>;
}

export class MemoryJobQueue<T = unknown> extends EventEmitter implements IJobQueue<T> {
  private jobs = new Map<string, QueueJob<T>>();
  private waitingQueue: string[] = [];
  private activeJobs = new Set<string>();
  private handler?: JobHandler<T>;
  private concurrency: number;
  private isProcessing = false;

  constructor(concurrency = 3) {
    super();
    this.concurrency = concurrency;
  }

  async add(name: string, data: T, options?: { priority?: number; maxAttempts?: number }): Promise<QueueJob<T>> {
    const id = `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const job: QueueJob<T> = {
      id,
      name,
      data,
      priority: options?.priority ?? 10,
      attemptsMade: 0,
      maxAttempts: options?.maxAttempts ?? 3,
      status: 'waiting',
      createdAt: new Date(),
    };

    this.jobs.set(id, job);
    this.waitingQueue.push(id);

    // Sort by priority (lower number = higher priority)
    this.waitingQueue.sort((a, b) => {
      const jobA = this.jobs.get(a);
      const jobB = this.jobs.get(b);
      return (jobA?.priority ?? 10) - (jobB?.priority ?? 10);
    });

    this.emit('waiting', job);
    this.checkNext();

    return job;
  }

  process(handler: JobHandler<T>): void {
    this.handler = handler;
    this.checkNext();
  }

  async getJob(id: string): Promise<QueueJob<T> | undefined> {
    return this.jobs.get(id);
  }

  async getWaitingCount(): Promise<number> {
    return this.waitingQueue.length;
  }

  async getActiveCount(): Promise<number> {
    return this.activeJobs.size;
  }

  private async checkNext(): Promise<void> {
    if (!this.handler || this.isProcessing) return;
    if (this.activeJobs.size >= this.concurrency || this.waitingQueue.length === 0) return;

    this.isProcessing = true;

    try {
      while (this.activeJobs.size < this.concurrency && this.waitingQueue.length > 0) {
        const jobId = this.waitingQueue.shift();
        if (!jobId) break;

        const job = this.jobs.get(jobId);
        if (!job) continue;

        this.activeJobs.add(jobId);
        job.status = 'active';
        job.processedAt = new Date();
        job.attemptsMade++;

        this.emit('active', job);

        // Run job asynchronously
        this.runJob(job);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async runJob(job: QueueJob<T>): Promise<void> {
    try {
      if (!this.handler) throw new Error('No job handler registered');

      const result = await this.handler(job);
      job.status = 'completed';
      job.result = result;
      job.finishedAt = new Date();
      this.activeJobs.delete(job.id);

      this.emit('completed', job, result);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      job.error = errorMessage;

      if (job.attemptsMade < job.maxAttempts) {
        // Retry with backoff
        job.status = 'waiting';
        this.activeJobs.delete(job.id);
        const backoffMs = Math.min(1000 * Math.pow(2, job.attemptsMade), 10000);
        setTimeout(() => {
          this.waitingQueue.push(job.id);
          this.checkNext();
        }, backoffMs);
        this.emit('retrying', job, err);
      } else {
        job.status = 'failed';
        job.finishedAt = new Date();
        this.activeJobs.delete(job.id);
        this.emit('failed', job, err);
      }
    } finally {
      this.checkNext();
    }
  }
}
