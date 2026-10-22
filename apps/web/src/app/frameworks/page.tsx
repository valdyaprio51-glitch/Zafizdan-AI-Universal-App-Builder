'use client';
import React, { useEffect, useState } from 'react';
import { Layers, CheckCircle2, Code2, Database } from 'lucide-react';
import { api } from '../../lib/api';

export default function FrameworksPage() {
  const [frameworks, setFrameworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getFrameworks()
      .then((data) => {
        setFrameworks(data);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Framework & Language Adapters</h1>
        <p className="text-xs text-gray-400 mt-1">
          Catalog of supported frontend, backend, database, and container deployment adapters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center py-10 text-gray-500 text-xs">
            Loading framework metadata...
          </div>
        ) : (
          frameworks.map((f) => (
            <div
              key={f.id}
              className="p-5 rounded-xl bg-gray-900/60 border border-gray-800 space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-gray-800 text-gray-400">
                    {f.category}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" /> Ready
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-gray-100">{f.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{f.description}</p>
              </div>

              <div className="pt-3 border-t border-gray-800/80 text-[11px] font-mono text-gray-500 flex justify-between">
                <span>Version: {f.version}</span>
                <span>Runtimes: {f.supportedRuntimes.join(', ')}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
