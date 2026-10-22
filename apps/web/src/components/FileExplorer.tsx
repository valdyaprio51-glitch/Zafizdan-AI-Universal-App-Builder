'use client';
import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  FileJson,
  File,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { FileTreeNode } from '@zafizdan/shared';

interface FileExplorerProps {
  nodes: FileTreeNode[];
  selectedPath: string | null;
  onSelectFile: (path: string) => void;
}

export function FileExplorer({ nodes, selectedPath, onSelectFile }: FileExplorerProps) {
  return (
    <div className="text-xs select-none py-1">
      {nodes.map((node) => (
        <TreeNode
          key={node.path}
          node={node}
          depth={0}
          selectedPath={selectedPath}
          onSelectFile={onSelectFile}
        />
      ))}
      {nodes.length === 0 && (
        <div className="p-4 text-center text-gray-500 italic">No workspace files yet</div>
      )}
    </div>
  );
}

function TreeNode({
  node,
  depth,
  selectedPath,
  onSelectFile,
}: {
  node: FileTreeNode;
  depth: number;
  selectedPath: string | null;
  onSelectFile: (path: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(depth === 0);

  const getFileIcon = (filename: string) => {
    if (filename.endsWith('.ts') || filename.endsWith('.tsx') || filename.endsWith('.cs') || filename.endsWith('.js')) {
      return <FileCode className="w-3.5 h-3.5 text-sky-400" />;
    }
    if (filename.endsWith('.json')) {
      return <FileJson className="w-3.5 h-3.5 text-amber-400" />;
    }
    if (filename.endsWith('.md')) {
      return <FileText className="w-3.5 h-3.5 text-purple-400" />;
    }
    return <File className="w-3.5 h-3.5 text-gray-400" />;
  };

  const isSelected = selectedPath === node.path;

  if (node.isDirectory) {
    return (
      <div>
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          className="flex items-center gap-1.5 py-1 px-2 hover:bg-gray-800/60 cursor-pointer text-gray-300 font-medium"
        >
          {isOpen ? (
            <ChevronDown className="w-3 h-3 text-gray-500" />
          ) : (
            <ChevronRight className="w-3 h-3 text-gray-500" />
          )}
          {isOpen ? (
            <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
          ) : (
            <Folder className="w-3.5 h-3.5 text-amber-500" />
          )}
          <span className="truncate">{node.name}</span>
        </div>
        {isOpen && node.children && (
          <div>
            {node.children.map((child) => (
              <TreeNode
                key={child.path}
                node={child}
                depth={depth + 1}
                selectedPath={selectedPath}
                onSelectFile={onSelectFile}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelectFile(node.path)}
      style={{ paddingLeft: `${depth * 12 + 18}px` }}
      className={`flex items-center justify-between py-1 px-2 cursor-pointer transition-colors ${
        isSelected
          ? 'bg-sky-500/20 text-sky-300 font-medium border-l-2 border-sky-400'
          : 'text-gray-400 hover:bg-gray-800/40 hover:text-gray-200'
      }`}
    >
      <div className="flex items-center gap-1.5 truncate">
        {getFileIcon(node.name)}
        <span className="truncate">{node.name}</span>
      </div>
      {node.size !== undefined && (
        <span className="text-[10px] text-gray-600 font-mono ml-2 shrink-0">
          {node.size > 1024 ? `${(node.size / 1024).toFixed(1)}k` : `${node.size}b`}
        </span>
      )}
    </div>
  );
}

