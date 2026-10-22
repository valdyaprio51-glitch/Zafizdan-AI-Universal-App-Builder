'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FolderGit2, Trash2, ExternalLink, Play, Sparkles } from 'lucide-react';
import { api } from '../../lib/api';

export default function ProjectsListPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProjects = () => {
    api
      .getProjects()
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" and its workspace?`)) return;
    try {
      await api.deleteProject(id);
      loadProjects();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Project Workspaces</h1>
          <p className="text-xs text-gray-400 mt-1">
            Browse, manage, and inspect all generated application codebases.
          </p>
        </div>
        <Link
          href="/new"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium text-xs shadow-md shadow-sky-500/20 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Project</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-gray-500 text-xs">
            Loading project repositories...
          </div>
        ) : projects.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-gray-500 text-xs">
            No projects found. Create your first application!
          </div>
        ) : (
          projects.map((p) => {
            const isRunning = p.runtimes?.length > 0;
            return (
              <div
                key={p.id}
                className="p-5 rounded-xl bg-gray-900/60 border border-gray-800 hover:border-gray-700 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-sm text-gray-100 hover:text-sky-400">
                      <Link href={`/projects/${p.id}`}>{p.name}</Link>
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                        isRunning
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      {isRunning ? 'RUNNING' : p.status}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs line-clamp-2">{p.prompt}</p>
                </div>

                <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs">
                  <div className="text-[11px] font-mono text-gray-500">
                    {p.configuration?.frontend} / {p.configuration?.backend}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      className="p-1.5 text-gray-500 hover:text-rose-400 transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <Link
                      href={`/projects/${p.id}`}
                      className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium"
                    >
                      Open Workspace
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
