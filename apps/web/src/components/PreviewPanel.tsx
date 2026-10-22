'use client';
import React, { useState } from 'react';
import { ExternalLink, RotateCw, Globe, Play, Square } from 'lucide-react';

interface PreviewPanelProps {
  previewUrl?: string;
  isRunning: boolean;
  onStart: () => Promise<void>;
  onStop: () => Promise<void>;
}

export function PreviewPanel({ previewUrl, isRunning, onStart, onStop }: PreviewPanelProps) {
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const reloadIframe = () => {
    setIframeKey((prev) => prev + 1);
  };

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      if (isRunning) {
        await onStop();
      } else {
        await onStart();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 border border-gray-800 rounded-lg overflow-hidden">
      {/* Browser Bar */}
      <div className="h-10 bg-gray-900 border-b border-gray-800 px-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>

          <div className="ml-2 flex items-center gap-1.5 px-3 py-1 rounded-md bg-gray-950 border border-gray-800 text-gray-400 font-mono text-[11px] w-72 truncate">
            <Globe className="w-3 h-3 text-sky-400 shrink-0" />
            <span className="truncate">{previewUrl || 'http://localhost:5100'}</span>
          </div>

          <button
            onClick={reloadIframe}
            disabled={!isRunning}
            className="p-1 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
            title="Reload Preview"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {previewUrl && isRunning && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 text-[11px] transition-colors"
            >
              <span>Open Tab</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          <button
            onClick={handleToggle}
            disabled={isLoading}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
              isRunning
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm'
            }`}
          >
            {isRunning ? (
              <>
                <Square className="w-3 h-3 fill-current" />
                <span>Stop App</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>{isLoading ? 'Starting...' : 'Start App'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preview Viewport */}
      <div className="flex-1 bg-gray-900/50 flex items-center justify-center relative overflow-hidden">
        {isRunning && previewUrl ? (
          <iframe
            key={iframeKey}
            src={previewUrl}
            title="Application Live Preview"
            className="w-full h-full border-none bg-white"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        ) : (
          <div className="text-center p-6 max-w-sm">
            <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center mx-auto text-gray-500 mb-3">
              <Globe className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-gray-300">Live Preview Standby</h4>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              Click &quot;Start App&quot; or run the generation pipeline to launch this application in an isolated sandbox.
            </p>
            <button
              onClick={handleToggle}
              disabled={isLoading}
              className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-medium transition-all shadow-md shadow-sky-500/20"
            >
              Start Application
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
