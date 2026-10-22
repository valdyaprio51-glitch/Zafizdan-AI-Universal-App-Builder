'use client';
import React, { useState, useEffect } from 'react';
import { Save, Check, FileCode } from 'lucide-react';

interface CodeEditorProps {
  filePath: string;
  initialContent: string;
  onSave: (newContent: string) => Promise<void>;
}

export function CodeEditor({ filePath, initialContent, onSave }: CodeEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setContent(initialContent);
    setIsSaved(false);
  }, [initialContent, filePath]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(content);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const lineCount = content.split('\n').length;
  const isDirty = content !== initialContent;

  return (
    <div className="flex flex-col h-full bg-[#0d1117] border border-gray-800 rounded-lg overflow-hidden">
      {/* Editor Header Bar */}
      <div className="h-9 bg-gray-900 border-b border-gray-800 px-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-gray-300 font-mono">
          <FileCode className="w-3.5 h-3.5 text-sky-400" />
          <span>{filePath}</span>
          {isDirty && <span className="w-2 h-2 rounded-full bg-amber-400" title="Unsaved changes" />}
        </div>
        <div className="flex items-center gap-2">
          {isSaved && (
            <span className="flex items-center gap-1 text-[11px] text-emerald-400">
              <Check className="w-3 h-3" /> Saved
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving || !isDirty}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
              isDirty
                ? 'bg-sky-500 hover:bg-sky-600 text-white cursor-pointer shadow-sm'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Save className="w-3 h-3" />
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Editor Body with Line Numbers */}
      <div className="flex-1 flex overflow-hidden font-mono text-xs">
        {/* Line Numbers Gutter */}
        <div className="w-12 bg-[#090d16] text-gray-600 text-right pr-2 pt-3 select-none border-r border-gray-800/80 shrink-0 overflow-hidden">
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i} className="leading-5">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Text Area */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          spellCheck={false}
          className="flex-1 bg-transparent text-gray-200 p-3 outline-none resize-none leading-5 font-mono selection:bg-sky-500/30 overflow-auto whitespace-pre tab-4"
        />
      </div>

      {/* Editor Status Bar */}
      <div className="h-6 bg-gray-950 border-t border-gray-800 px-3 flex items-center justify-between text-[11px] text-gray-500 font-mono select-none">
        <div>UTF-8</div>
        <div className="flex items-center gap-3">
          <span>Lines: {lineCount}</span>
          <span>Chars: {content.length}</span>
        </div>
      </div>
    </div>
  );
}
