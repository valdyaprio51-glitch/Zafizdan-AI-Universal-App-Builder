'use client';
import React, { useRef, useEffect } from 'react';
import { Terminal, Copy, Check } from 'lucide-react';

interface LogEntry {
  timestamp: string;
  message: string;
  type: string;
}

interface TerminalViewerProps {
  logs: LogEntry[];
}

export function TerminalViewer({ logs }: TerminalViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const copyLogs = () => {
    const text = logs.map((l) => `[${l.timestamp}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-emerald-400';
      case 'warn':
        return 'text-amber-400';
      case 'error':
        return 'text-rose-400';
      case 'file':
        return 'text-sky-300';
      default:
        return 'text-gray-300';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#090d16] border border-gray-800 rounded-lg overflow-hidden font-mono text-xs">
      {/* Terminal Title Bar */}
      <div className="h-8 bg-gray-900 border-b border-gray-800 px-3 flex items-center justify-between text-gray-400">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider">
            Process Execution Console & Logs
          </span>
        </div>
        <button
          onClick={copyLogs}
          className="flex items-center gap-1 text-[11px] hover:text-white transition-colors"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Terminal Output */}
      <div
        ref={containerRef}
        className="flex-1 p-3 overflow-y-auto space-y-1 selection:bg-sky-500/30 text-[11px]"
      >
        {logs.map((log, index) => (
          <div key={index} className="flex items-start gap-2 leading-relaxed">
            <span className="text-gray-600 select-none shrink-0">[{log.timestamp}]</span>
            <span className={getLogColor(log.type)}>{log.message}</span>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-gray-600 italic">Waiting for execution output...</div>
        )}
      </div>
    </div>
  );
}
