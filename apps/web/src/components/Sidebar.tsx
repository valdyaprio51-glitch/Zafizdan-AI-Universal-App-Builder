'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderGit2,
  Cpu,
  Layers,
  Settings,
  BookOpen,
  Terminal,
  Activity,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Projects', href: '/projects', icon: FolderGit2 },
  { label: 'AI Providers', href: '/providers', icon: Cpu },
  { label: 'Frameworks', href: '/frameworks', icon: Layers },
  { label: 'System Health', href: '/health', icon: Activity },
  { label: 'Documentation', href: '/docs', icon: BookOpen },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 border-r border-gray-800 bg-gray-950/40 p-3 flex flex-col justify-between shrink-0 h-[calc(100vh-3.5rem)]">
      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 rounded-lg bg-gray-900/60 border border-gray-800/80 text-[11px] text-gray-400 space-y-1">
        <div className="flex items-center justify-between font-semibold text-gray-300">
          <span>Engine Status</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Online
          </span>
        </div>
        <p className="text-gray-500">Fastify REST + SSE + Isolated Sandbox</p>
      </div>
    </aside>
  );
}

