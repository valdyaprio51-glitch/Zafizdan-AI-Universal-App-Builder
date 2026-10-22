'use client';
import React, { useEffect, useState } from 'react';
import { Cpu, CheckCircle2, Shield, Plus, Key } from 'lucide-react';
import { api } from '../../lib/api';

export default function ProvidersPage() {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getAIProviders()
      .then((data) => {
        setProviders(data);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">AI Engine Providers</h1>
          <p className="text-xs text-gray-400 mt-1">
            Configure multi-provider routing (Google Gemini, OpenAI, Anthropic, Ollama, and Offline Mock).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 text-center py-10 text-gray-500 text-xs">
            Loading AI providers...
          </div>
        ) : (
          providers.map((p) => (
            <div
              key={p.id}
              className="p-5 rounded-xl bg-gray-900/60 border border-gray-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-200">{p.name}</h3>
                    <div className="text-[10px] text-gray-500 font-mono uppercase">{p.type}</div>
                  </div>
                </div>
                {p.isDefault && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/30">
                    DEFAULT
                  </span>
                )}
              </div>

              <div className="pt-2 border-t border-gray-800/80 space-y-1.5 text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>Context Limit:</span>
                  <span className="font-mono text-gray-200">{p.capabilities.maxContextTokens.toLocaleString()} tokens</span>
                </div>
                <div className="flex justify-between">
                  <span>Supported Models:</span>
                  <span className="font-mono text-gray-300">{p.capabilities.supportedModels.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Secret Security:</span>
                  <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
                    <Shield className="w-3 h-3" /> AES-256-GCM Encrypted
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
