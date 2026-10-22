'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FolderGit2,
  Activity,
  CheckCircle2,
  XCircle,
  Cpu,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Layers,
} from 'lucide-react';
import { api } from '../lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getStats()
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-950/60 via-indigo-950/40 to-gray-900 border border-sky-800/40 p-8 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 font-mono">
            Enterprise AI Engineering Suite
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Universal AI App Builder
          </h1>
          <p className="text-sm text-gray-300 leading-relaxed">
            &quot;Describe your application once. Let AI plan, generate, test, build, and run the complete application.&quot;
          </p>
          <div className="pt-2">
            <Link
              href="/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium text-xs shadow-lg shadow-sky-500/25 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create New AI Application</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-gray-900/60 border border-gray-800/80">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Total Projects</span>
            <FolderGit2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold mt-2 text-white">
            {loading ? '...' : stats?.totalProjects ?? 0}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">Generated full-stack apps</div>
        </div>

        <div className="p-5 rounded-xl bg-gray-900/60 border border-gray-800/80">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Running Apps</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold mt-2 text-emerald-400">
            {loading ? '...' : stats?.runningApps ?? 0}
          </div>
          <div className="text-[11px] text-emerald-500/80 mt-1">Live in isolated sandboxes</div>
        </div>

        <div className="p-5 rounded-xl bg-gray-900/60 border border-gray-800/80">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Build Success Rate</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold mt-2 text-white">
            {loading ? '...' : `${stats?.buildSuccessRate ?? 100}%`}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">Automated QA pass rate</div>
        </div>

        <div className="p-5 rounded-xl bg-gray-900/60 border border-gray-800/80">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>AI Cost / Usage</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold mt-2 text-purple-400">
            {loading ? '...' : `\$${(stats?.totalCost ?? 0).toFixed(4)}`}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            {loading ? '...' : `${(stats?.totalTokens ?? 0).toLocaleString()} tokens tracked`}
          </div>
        </div>
      </div>

      {/* Recent Projects Table */}
      <div className="rounded-xl bg-gray-900/60 border border-gray-800/80 overflow-hidden">
        <div className="p-4 border-b border-gray-800/80 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm text-gray-200">Recent Applications</h3>
            <p className="text-xs text-gray-500">Applications generated and managed by Universal AI</p>
          </div>
          <Link href="/projects" className="text-xs text-sky-400 hover:text-sky-300 font-medium">
            View All →
          </Link>
        </div>

        <div className="divide-y divide-gray-800/60 text-xs">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading platform statistics...</div>
          ) : stats?.recentProjects?.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No projects created yet. Start by creating your first AI application!
            </div>
          ) : (
            stats?.recentProjects?.map((project: any) => (
              <div
                key={project.id}
                className="p-4 flex items-center justify-between hover:bg-gray-850/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/projects/${project.id}`}
                      className="font-semibold text-gray-200 hover:text-sky-400"
                    >
                      {project.name}
                    </Link>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                        project.status === 'RUNNING'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : project.status === 'FAILED'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                  <p className="text-gray-400 line-clamp-1 max-w-xl text-[11px]">
                    {project.prompt}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-gray-500 font-mono">
                    {project.configuration?.frontend} + {project.configuration?.backend}
                  </span>
                  <Link
                    href={`/projects/${project.id}`}
                    className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium"
                  >
                    Open Workspace
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

