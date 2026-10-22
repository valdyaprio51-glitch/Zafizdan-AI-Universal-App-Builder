'use client';
import React, { useState } from 'react';
import { Sparkles, Settings2, ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import {
  ApplicationType,
  FrontendFramework,
  BackendFramework,
  DatabaseType,
  AuthStrategy,
  AuthorizationStrategy,
} from '@zafizdan/shared';

interface PromptWizardProps {
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

const PRESET_PROMPTS = [
  {
    title: 'SaaS Inventory Management',
    prompt:
      'Buatkan aplikasi SaaS inventory management dengan Next.js, ASP.NET Core Web API, SQL Server / SQLite, JWT authentication, role-based access control, dashboard analytics, product management, stock movement, reporting, Docker, dan automated testing.',
  },
  {
    title: 'Cloud E-Commerce Platform',
    prompt:
      'Buatkan e-commerce marketplace dengan Next.js App Router, Node.js REST API, PostgreSQL, stripe payments integration, customer cart, order management, dan JWT authentication.',
  },
  {
    title: 'Real-time AI Chatbot SaaS',
    prompt:
      'Buatkan platform AI chatbot multimodal dengan Next.js, FastAPI backend, SQLite memory vector storage, multi-model switcher, dan session management.',
  },
];

export function PromptWizard({ onSubmit, isLoading }: PromptWizardProps) {
  const [mode, setMode] = useState<'one-command' | 'advanced'>('one-command');
  const [appName, setAppName] = useState('Universal Inventory SaaS');
  const [prompt, setPrompt] = useState(PRESET_PROMPTS[0].prompt);

  // Advanced configurations
  const [appType, setAppType] = useState<ApplicationType>(ApplicationType.FULL_STACK);
  const [frontend, setFrontend] = useState<FrontendFramework>(FrontendFramework.NEXTJS);
  const [backend, setBackend] = useState<BackendFramework>(BackendFramework.ASPNET_CORE);
  const [database, setDatabase] = useState<DatabaseType>(DatabaseType.SQLITE);
  const [auth, setAuth] = useState<AuthStrategy>(AuthStrategy.JWT);
  const [authorization, setAuthorization] = useState<AuthorizationStrategy>(AuthorizationStrategy.RBAC);
  const [dockerEnabled, setDockerEnabled] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: appName,
      prompt,
      mode,
      config: {
        appType,
        frontend,
        backend,
        database,
        auth,
        authorization,
        dockerEnabled,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Mode Selector Tabs */}
      <div className="flex p-1 bg-gray-900 border border-gray-800 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setMode('one-command')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            mode === 'one-command'
              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>One-Command Mode</span>
        </button>
        <button
          type="button"
          onClick={() => setMode('advanced')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            mode === 'advanced'
              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>Advanced Configuration</span>
        </button>
      </div>

      {/* Project Name Field */}
      <div>
        <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
          Project Name
        </label>
        <input
          type="text"
          value={appName}
          onChange={(e) => setAppName(e.target.value)}
          required
          placeholder="e.g., Enterprise Inventory Manager"
          className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-sky-500 transition-colors"
        />
      </div>

      {/* Natural Language Prompt Area */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
            Natural Language Specification Prompt
          </label>
          <span className="text-[11px] text-gray-500">Describe your application once.</span>
        </div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          required
          rows={4}
          placeholder="Describe your desired frontend, backend, database, features, and security requirements..."
          className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-sm text-gray-100 focus:outline-none focus:border-sky-500 transition-colors leading-relaxed selection:bg-sky-500/30 font-mono"
        />
      </div>

      {/* Preset Inspiration Pills */}
      <div>
        <div className="text-[11px] text-gray-500 mb-2 font-medium">Quick Inspiration Presets:</div>
        <div className="flex flex-wrap gap-2">
          {PRESET_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setAppName(p.title);
                setPrompt(p.prompt);
              }}
              className="px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs text-gray-300 transition-colors"
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Configuration Section */}
      {mode === 'advanced' && (
        <div className="p-5 rounded-xl bg-gray-900/60 border border-gray-800 space-y-4">
          <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
            <Settings2 className="w-3.5 h-3.5" />
            Stack & Architecture Customization
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Frontend Framework</label>
              <select
                value={frontend}
                onChange={(e) => setFrontend(e.target.value as FrontendFramework)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-200"
              >
                <option value={FrontendFramework.NEXTJS}>Next.js App Router (React)</option>
                <option value={FrontendFramework.REACT_VITE}>React + Vite</option>
                <option value={FrontendFramework.VUE_NUXT}>Vue + Nuxt</option>
                <option value={FrontendFramework.HTML_CSS_JS}>HTML + CSS + JS</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Backend Framework</label>
              <select
                value={backend}
                onChange={(e) => setBackend(e.target.value as BackendFramework)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-200"
              >
                <option value={BackendFramework.ASPNET_CORE}>ASP.NET Core Web API (C#)</option>
                <option value={BackendFramework.NODE_EXPRESS}>Node.js + Express (TS)</option>
                <option value={BackendFramework.PYTHON_FASTAPI}>Python FastAPI</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Database Engine</label>
              <select
                value={database}
                onChange={(e) => setDatabase(e.target.value as DatabaseType)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-200"
              >
                <option value={DatabaseType.SQLITE}>SQLite (Zero-config embedded)</option>
                <option value={DatabaseType.SQLSERVER}>Microsoft SQL Server</option>
                <option value={DatabaseType.POSTGRESQL}>PostgreSQL 18</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Authentication Strategy</label>
              <select
                value={auth}
                onChange={(e) => setAuth(e.target.value as AuthStrategy)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-200"
              >
                <option value={AuthStrategy.JWT}>JWT Bearer Tokens</option>
                <option value={AuthStrategy.SESSION}>Session Cookies</option>
                <option value={AuthStrategy.API_KEY}>API Key Guard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Authorization Model</label>
              <select
                value={authorization}
                onChange={(e) => setAuthorization(e.target.value as AuthorizationStrategy)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-200"
              >
                <option value={AuthorizationStrategy.RBAC}>Role-Based Access Control (RBAC)</option>
                <option value={AuthorizationStrategy.ABAC}>Attribute-Based Access Control</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="docker"
                checked={dockerEnabled}
                onChange={(e) => setDockerEnabled(e.target.checked)}
                className="rounded border-gray-800 text-sky-500 focus:ring-0"
              />
              <label htmlFor="docker" className="text-xs text-gray-300 cursor-pointer">
                Generate Docker & Compose Manifests
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Safety & Execution Notice */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-sky-950/30 border border-sky-800/60 text-xs text-sky-300">
        <ShieldCheck className="w-5 h-5 shrink-0 text-sky-400" />
        <span>
          <strong>Isolated Sandbox Protection:</strong> All generated code is verified in an isolated workspace with resource limits and path traversal protection.
        </span>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-semibold text-sm shadow-lg shadow-sky-500/25 transition-all disabled:opacity-50 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isLoading ? 'Synthesizing Architecture & Generating...' : 'Plan, Generate & Run Application'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}

