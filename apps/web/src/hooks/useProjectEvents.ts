'use client';
import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export interface PipelineProgressState {
  currentStage?: string;
  stageIndex: number;
  totalStages: number;
  percentage: number;
  status: string;
  planSummary?: string;
  message?: string;
  previewUrl?: string;
  logs: Array<{ timestamp: string; message: string; type: string }>;
}

export function useProjectEvents(projectId: string) {
  const [progress, setProgress] = useState<PipelineProgressState>({
    stageIndex: 0,
    totalStages: 11,
    percentage: 0,
    status: 'IDLE',
    logs: [],
  });

  useEffect(() => {
    if (!projectId) return;

    const eventSource = new EventSource(api.getEventsUrl(projectId));

    const appendLog = (message: string, type = 'info') => {
      setProgress((prev) => ({
        ...prev,
        logs: [
          ...prev.logs,
          { timestamp: new Date().toLocaleTimeString(), message, type },
        ].slice(-300), // keep last 300 logs
      }));
    };

    eventSource.onopen = () => {
      appendLog('Connected to real-time development pipeline', 'success');
    };

    eventSource.addEventListener('planning.started', (e) => {
      const data = JSON.parse(e.data);
      setProgress((prev) => ({ ...prev, status: 'PLANNING', percentage: 5 }));
      appendLog(data.payload?.message || 'Analyzing architecture specifications...', 'info');
    });

    eventSource.addEventListener('planning.completed', (e) => {
      const data = JSON.parse(e.data);
      setProgress((prev) => ({
        ...prev,
        planSummary: data.payload?.plan?.summary,
        percentage: 15,
      }));
      appendLog('Architectural blueprint formulated.', 'success');
    });

    eventSource.addEventListener('stage.started', (e) => {
      const data = JSON.parse(e.data);
      setProgress((prev) => ({
        ...prev,
        currentStage: data.payload?.stage,
        stageIndex: data.payload?.stageIndex || prev.stageIndex,
        percentage: data.payload?.percentage || prev.percentage,
        status: 'GENERATING',
      }));
      appendLog(data.payload?.message || `Stage started: ${data.payload?.stage}`, 'info');
    });

    eventSource.addEventListener('stage.completed', (e) => {
      const data = JSON.parse(e.data);
      setProgress((prev) => ({
        ...prev,
        percentage: data.payload?.percentage || prev.percentage,
      }));
      appendLog(`✔ Stage completed: ${data.payload?.stage}`, 'success');
    });

    eventSource.addEventListener('file.created', (e) => {
      const data = JSON.parse(e.data);
      appendLog(`Created file: ${data.payload?.path} (${data.payload?.size} bytes)`, 'file');
    });

    eventSource.addEventListener('runtime.started', (e) => {
      const data = JSON.parse(e.data);
      setProgress((prev) => ({
        ...prev,
        status: 'RUNNING',
        previewUrl: data.payload?.previewUrl,
      }));
      appendLog(`🚀 Application running at ${data.payload?.previewUrl}`, 'success');
    });

    eventSource.addEventListener('test.completed', (e) => {
      const data = JSON.parse(e.data);
      appendLog(
        `Automated test run: ${data.payload?.passed ? 'PASSED' : 'FAILED'} - ${data.payload?.output}`,
        data.payload?.passed ? 'success' : 'warn'
      );
    });

    eventSource.addEventListener('progress.updated', (e) => {
      const data = JSON.parse(e.data);
      setProgress((prev) => ({
        ...prev,
        percentage: data.payload?.percentage ?? prev.percentage,
        status: data.payload?.status || prev.status,
      }));
      if (data.payload?.message) {
        appendLog(data.payload.message, 'success');
      }
    });

    eventSource.onerror = () => {
      // EventSource reconnects automatically
    };

    return () => {
      eventSource.close();
    };
  }, [projectId]);

  return progress;
}
