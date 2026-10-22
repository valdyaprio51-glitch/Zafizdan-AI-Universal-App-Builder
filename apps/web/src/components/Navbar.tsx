'use client';
import React from 'react';
import Link from 'next/link';
import { Cpu, Terminal, Plus, Sparkles } from 'lucide-react';

export function Navbar() {
  return (
    <header className="h-14 border-b border-gray-800 bg-gray-950/80 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-white tracking-tight hover:opacity-90">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <span>Universal <span className="text-sky-400">AI</span> App Builder</span>
        </Link>
        <span className="text-xs px-2 py-0.5 rounded-full bg-sky-950/80 border border-sky-800 text-sky-400 font-mono">
          v1.0.0 Enterprise
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/new"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-medium text-xs shadow-md shadow-sky-500/20 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New AI Project</span>
        </Link>
      </div>
    </header>
  );
}
