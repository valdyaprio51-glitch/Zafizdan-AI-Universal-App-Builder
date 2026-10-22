'use client';
import React from 'react';
import { BookOpen, Terminal, Code2, Server, Cpu } from 'lucide-react';

export default function DocsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 text-xs text-gray-300">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Platform Documentation</h1>
        <p className="text-xs text-gray-400 mt-1">
          Complete architectural guide, REST API reference, and development pipeline workflow.
        </p>
      </div>

      <div className="p-6 rounded-xl bg-gray-900/60 border border-gray-800 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-sky-400" />
          The 11-Stage Development Pipeline
        </h2>
        <p className="leading-relaxed text-gray-400">
          When an application prompt is submitted, the Universal AI App Builder pipeline runs 11 sequential, self-verifying stages:
        </p>
        <ol className="list-decimal pl-5 space-y-2 text-gray-300">
          <li><strong>Stage 1 (Requirement Analysis):</strong> Synthesizes prompt into formal user stories and acceptance criteria.</li>
          <li><strong>Stage 2 (Architecture Planning):</strong> Defines module boundaries, contracts, and schema design.</li>
          <li><strong>Stage 3 (Project Scaffolding):</strong> Generates package manifests, compiler configs, and docker-compose files.</li>
          <li><strong>Stage 4 (Database Generation):</strong> Creates database contexts, models, migrations, and seed data.</li>
          <li><strong>Stage 5 (Backend Generation):</strong> Implements REST API controllers, endpoints, and authentication.</li>
          <li><strong>Stage 6 (Frontend Generation):</strong> Generates Next.js pages, responsive Tailwind UI, and data fetchers.</li>
          <li><strong>Stage 7 (Integration):</strong> Wires CORS policies, environment variables, and proxy configurations.</li>
          <li><strong>Stage 8 (Automated QA):</strong> Runs automated type-checking, linter, and unit test suites.</li>
          <li><strong>Stage 9 (AI Repair Loop):</strong> Evaluates errors, performs root-cause diagnosis, and applies patches.</li>
          <li><strong>Stage 10 (Build & Run):</strong> Allocates an isolated port, launches background processes, and verifies health checks.</li>
          <li><strong>Stage 11 (Delivery):</strong> Assembles architecture docs, change history, and packaged ZIP archives.</li>
        </ol>
      </div>

      <div className="p-6 rounded-xl bg-gray-900/60 border border-gray-800 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          REST API Reference
        </h2>
        <div className="space-y-3 font-mono text-[11px]">
          <div className="p-2.5 bg-gray-950 rounded-lg border border-gray-800 flex justify-between">
            <span className="text-sky-400">POST /api/v1/projects</span>
            <span className="text-gray-500">Create new project & trigger generation</span>
          </div>
          <div className="p-2.5 bg-gray-950 rounded-lg border border-gray-800 flex justify-between">
            <span className="text-sky-400">GET /api/v1/projects/:id/events</span>
            <span className="text-gray-500">Server-Sent Events real-time stream</span>
          </div>
          <div className="p-2.5 bg-gray-950 rounded-lg border border-gray-800 flex justify-between">
            <span className="text-sky-400">GET /api/v1/projects/:id/files</span>
            <span className="text-gray-500">Fetch directory tree</span>
          </div>
          <div className="p-2.5 bg-gray-950 rounded-lg border border-gray-800 flex justify-between">
            <span className="text-sky-400">POST /api/v1/projects/:id/export</span>
            <span className="text-gray-500">Download complete workspace as ZIP</span>
          </div>
        </div>
      </div>
    </div>
  );
}
