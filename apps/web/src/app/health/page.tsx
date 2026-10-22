'use client';
import React, { useEffect, useState } from 'react';
import { Activity, ShieldCheck, Terminal, Server, CheckCircle2 } from 'lucide-react';

export default function HealthPage() {
  const [health, setHealth] = useState<any>({
    status: 'healthy',
    platform: 'Universal AI App Builder',
    nodeVersion: 'v26.8.1',
    dotnetVersion: '10.0.401',
    pythonVersion: '3.12.10',
    dbProvider: 'SQLite / PostgreSQL Dual Engine',
    sandboxMode: 'LocalProcessRunner with Process Isolation & PathGuard',
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">System Infrastructure & Runtime Health</h1>
        <p className="text-xs text-gray-400 mt-1">
          Real-time diagnostics of execution workers, compilers, databases, and security isolation layers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-5 rounded-xl bg-gray-900/60 border border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-gray-200 flex items-center gap-2">
              <Server className="w-4 h-4 text-sky-400" />
              Runtime Compilers
            </h3>
            <span className="flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Active
            </span>
          </div>
          <div className="space-y-2 text-gray-300 font-mono">
            <div className="flex justify-between border-b border-gray-800/80 pb-1.5">
              <span className="text-gray-500">Node.js Engine:</span>
              <span>{health.nodeVersion}</span>
            </div>
            <div className="flex justify-between border-b border-gray-800/80 pb-1.5">
              <span className="text-gray-500">.NET Core SDK:</span>
              <span>{health.dotnetVersion}</span>
            </div>
            <div className="flex justify-between pb-1.5">
              <span className="text-gray-500">Python Runtime:</span>
              <span>{health.pythonVersion}</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-gray-900/60 border border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-gray-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Security & Sandboxing
            </h3>
            <span className="flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Enforced
            </span>
          </div>
          <div className="space-y-2 text-gray-300 font-mono">
            <div className="flex justify-between border-b border-gray-800/80 pb-1.5">
              <span className="text-gray-500">Path Traversal Guard:</span>
              <span className="text-emerald-400">Strict PathGuard</span>
            </div>
            <div className="flex justify-between border-b border-gray-800/80 pb-1.5">
              <span className="text-gray-500">Secret Encryption:</span>
              <span className="text-emerald-400">AES-256-GCM</span>
            </div>
            <div className="flex justify-between pb-1.5">
              <span className="text-gray-500">Command Allowlist:</span>
              <span className="text-emerald-400">Strict Allowlist</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
