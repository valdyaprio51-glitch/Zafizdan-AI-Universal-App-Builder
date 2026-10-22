import { EventEmitter } from 'events';
import { EventType, PipelineEvent } from '@zafizdan/shared';
import * as crypto from 'crypto';

export class EventBroadcaster {
  private static instance: EventBroadcaster;
  private emitter = new EventEmitter();
  private subscribers = new Map<string, Set<(event: PipelineEvent) => void>>();
  private eventHistory = new Map<string, PipelineEvent[]>();

  private constructor() {
    this.emitter.setMaxListeners(100);
  }

  static getInstance(): EventBroadcaster {
    if (!EventBroadcaster.instance) {
      EventBroadcaster.instance = new EventBroadcaster();
    }
    return EventBroadcaster.instance;
  }

  emit(projectId: string, jobId: string, type: EventType, payload: Record<string, unknown>): PipelineEvent {
    const event: PipelineEvent = {
      id: crypto.randomUUID(),
      type,
      projectId,
      jobId,
      timestamp: new Date().toISOString(),
      payload,
    };

    // Store in history (last 500 events per project)
    if (!this.eventHistory.has(projectId)) {
      this.eventHistory.set(projectId, []);
    }
    const history = this.eventHistory.get(projectId)!;
    history.push(event);
    if (history.length > 500) {
      history.shift();
    }

    // Notify project-specific subscribers
    const projectSubs = this.subscribers.get(projectId);
    if (projectSubs) {
      for (const listener of projectSubs) {
        try {
          listener(event);
        } catch (err) {
          console.error(`Error notifying event listener for project ${projectId}:`, err);
        }
      }
    }

    // Global listener
    this.emitter.emit('event', event);

    return event;
  }

  subscribe(projectId: string, listener: (event: PipelineEvent) => void): () => void {
    if (!this.subscribers.has(projectId)) {
      this.subscribers.set(projectId, new Set());
    }
    this.subscribers.get(projectId)!.add(listener);

    return () => {
      const set = this.subscribers.get(projectId);
      if (set) {
        set.delete(listener);
        if (set.size === 0) {
          this.subscribers.delete(projectId);
        }
      }
    };
  }

  getHistory(projectId: string): PipelineEvent[] {
    return this.eventHistory.get(projectId) || [];
  }
}

export const eventBroadcaster = EventBroadcaster.getInstance();

