'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Code2,
  Globe,
  Terminal,
  Download,
  Play,
  RotateCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { useProjectEvents } from '../../../hooks/useProjectEvents';
import { FileExplorer } from '../../../components/FileExplorer';
import { CodeEditor } from '../../../components/CodeEditor';
import { TerminalViewer } from '../../../components/TerminalViewer';
import { PreviewPanel } from '../../../components/PreviewPanel';

const STAGES = [
  'Requirement Analysis (PRD)',
  'Architecture Planning',
  'Project Scaffolding',
  'Database Generation',
  'Backend Generation',
  'Frontend Generation',
  'Integration',
  'Automated QA',
  'AI Repair Loop',
  'Build & Run',
  'Delivery',
];

export default function ProjectWorkspacePage() {
  const { id } = useParams() as { id: string };
  const [project, setProject] = useState<any>(null);
  const [fileTree, setFileTree] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'code' | 'preview' | 'terminal' | 'tests' | 'docs'>('code');
  const [previewData, setPreviewData] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Hook into real-time pipeline events
  const sseEvents = useProjectEvents(id);

  const loadProjectDetails = async () => {
    try {
      const p = await api.getProject(id);
      setProject(p);
      const tree = await api.getFileTree(id);
      setFileTree(tree);

      const preview = await api.getPreview(id);
      setPreviewData(preview);

      // Select first file if available
      if (!selectedFile && tree.length > 0) {
        const findFirstFile = (nodes: any[]): string | null => {
          for (const n of nodes) {
            if (!n.isDirectory) return n.path;
            if (n.children) {
              const res = findFirstFile(n.children);
              if (res) return res;
            }
          }
          return null;
        };
        const first = findFirstFile(tree);
        if (first) {
          handleSelectFile(first);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadProjectDetails();
  }, [id]);

  // When files are created via SSE, reload tree
  useEffect(() => {
    if (sseEvents.logs.some((l) => l.type === 'file')) {
      api.getFileTree(id).then(setFileTree).catch(console.error);
    }
    if (sseEvents.previewUrl) {
      setPreviewData((prev: any) => ({ ...prev, isRunning: true, previewUrl: sseEvents.previewUrl }));
    }
  }, [sseEvents.logs, sseEvents.previewUrl, id]);

  const handleSelectFile = async (filePath: string) => {
    setSelectedFile(filePath);
    try {
      const data = await api.getFileContent(id, filePath);
      setFileContent(data.content);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveFile = async (newContent: string) => {
    if (!selectedFile) return;
    await api.saveFileContent(id, selectedFile, newContent);
    setFileContent(newContent);
  };

  const handleStartApp = async () => {
    setActionLoading(true);
    try {
      const res = await api.runProject(id);
      setPreviewData({ isRunning: true, previewUrl: res.previewUrl, port: res.port });
    } finally {
      setActionLoading(false);
    }
  };

  const handleStopApp = async () => {
    setActionLoading(true);
    try {
      await api.stopProject(id);
      setPreviewData({ isRunning: false });
    } finally {
      setActionLoading(false);
    }
  };

  const handleTriggerBuild = async () => {
    setActionLoading(true);
    try {
      await api.buildProject(id);
      await loadProjectDetails();
    } finally {
      setActionLoading(false);
    }
  };

  const handleTriggerTests = async () => {
    setActionLoading(true);
    try {
      await api.testProject(id);
      await loadProjectDetails();
    } finally {
      setActionLoading(false);
    }
  };

  const currentPercent = sseEvents.percentage || (project?.generationJobs?.[0]?.progress ?? 0);
  const currentStatus = sseEvents.status !== 'IDLE' ? sseEvents.status : (project?.status ?? 'DRAFT');

  return (
    <div className="flex flex-col h-[calc(100vh-5.5rem)] -m-6 bg-background">
      {/* Top Project Bar */}
      <div className="h-14 border-b border-gray-800 bg-gray-950 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="font-bold text-sm text-gray-100">{project?.name || 'Loading Project...'}</h2>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
              currentStatus === 'RUNNING'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : currentStatus === 'FAILED'
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                : 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
            }`}
          >
            {currentStatus}
          </span>
          <span className="text-xs text-gray-500 font-mono">
            {project?.configuration?.frontend} • {project?.configuration?.backend} • {project?.configuration?.database}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleTriggerBuild}
            disabled={actionLoading}
            className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium transition-colors"
          >
            Build
          </button>
          <button
            onClick={handleTriggerTests}
            disabled={actionLoading}
            className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium transition-colors"
          >
            Run QA Tests
          </button>
          <a
            href={api.getExportZipUrl(id)}
            download
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 border border-sky-500/30 text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export ZIP</span>
          </a>
        </div>
      </div>

      {/* 11-Stage Pipeline Progress Strip */}
      <div className="border-b border-gray-800/80 bg-gray-900/60 px-6 py-2 shrink-0">
        <div className="flex items-center justify-between text-[11px] mb-1.5">
          <div className="flex items-center gap-2 font-medium text-gray-300">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>AI Development Pipeline: {sseEvents.currentStage || 'Stage Orchestration'}</span>
          </div>
          <span className="font-mono text-sky-400 font-semibold">{currentPercent}%</span>
        </div>
        <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-sky-500 to-indigo-500 h-full transition-all duration-300"
            style={{ width: `${currentPercent}%` }}
          />
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: File Explorer (240px) */}
        <div className="w-64 border-r border-gray-800 bg-gray-950/40 flex flex-col shrink-0">
          <div className="h-9 border-b border-gray-800 px-3 flex items-center justify-between text-xs text-gray-400 font-semibold uppercase tracking-wider">
            <span>Explorer</span>
            <button onClick={loadProjectDetails} className="hover:text-white" title="Refresh files">
              <RotateCw className="w-3 h-3" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <FileExplorer
              nodes={fileTree}
              selectedPath={selectedFile}
              onSelectFile={handleSelectFile}
            />
          </div>
        </div>

        {/* Center / Right Column: Editor & Tabs */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Workspace Tabs Header */}
          <div className="h-10 border-b border-gray-800 bg-gray-950 px-3 flex items-center gap-1 shrink-0">
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'code'
                  ? 'bg-gray-800 text-sky-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Source Code</span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'preview'
                  ? 'bg-gray-800 text-sky-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Live Preview</span>
              {previewData?.isRunning && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('terminal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'terminal'
                  ? 'bg-gray-800 text-sky-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Terminal & Logs</span>
            </button>
            <button
              onClick={() => setActiveTab('docs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'docs'
                  ? 'bg-gray-800 text-sky-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PRD & Architecture</span>
            </button>
          </div>

          {/* Active Tab Viewport */}
          <div className="flex-1 p-3 overflow-hidden">
            {activeTab === 'code' && (
              selectedFile ? (
                <CodeEditor
                  filePath={selectedFile}
                  initialContent={fileContent}
                  onSave={handleSaveFile}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-gray-500">
                  Select a file from the explorer on the left to inspect or edit source code.
                </div>
              )
            )}

            {activeTab === 'preview' && (
              <PreviewPanel
                previewUrl={previewData?.previewUrl}
                isRunning={Boolean(previewData?.isRunning)}
                onStart={handleStartApp}
                onStop={handleStopApp}
              />
            )}

            {activeTab === 'terminal' && (
              <TerminalViewer logs={sseEvents.logs} />
            )}

            {activeTab === 'docs' && (
              <div className="h-full bg-gray-950 border border-gray-800 rounded-lg p-6 overflow-y-auto max-w-3xl space-y-6 text-xs text-gray-300">
                <div>
                  <h3 className="text-base font-bold text-white mb-2">Prompt Specification</h3>
                  <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 font-mono text-[11px] leading-relaxed text-sky-300">
                    {project?.prompt}
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white mb-2">Architectural Blueprint</h3>
                  <p className="leading-relaxed text-gray-400 mb-3">
                    Decoupled multi-tier enterprise architecture. Frontend handles stateful client views, communicates via RESTful contracts to the backend API, backed by an isolated database tier.
                  </p>
                  <div className="grid grid-cols-3 gap-3 font-mono text-[11px]">
                    <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                      <div className="text-gray-500">Frontend</div>
                      <div className="text-white font-bold mt-1">{project?.configuration?.frontend}</div>
                    </div>
                    <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                      <div className="text-gray-500">Backend API</div>
                      <div className="text-white font-bold mt-1">{project?.configuration?.backend}</div>
                    </div>
                    <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                      <div className="text-gray-500">Database</div>
                      <div className="text-white font-bold mt-1">{project?.configuration?.database}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
