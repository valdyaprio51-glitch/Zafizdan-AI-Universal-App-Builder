'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PromptWizard } from '../../components/PromptWizard';
import { api } from '../../lib/api';

export default function NewProjectPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (formData: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.createProject(formData);
      router.push(`/projects/${res.project.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Create New Application</h1>
        <p className="text-xs text-gray-400 mt-1">
          Provide your requirements using natural language or configure custom technology stacks.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
          <strong>Creation Error:</strong> {error}
        </div>
      )}

      <div className="p-6 rounded-2xl bg-gray-950/60 border border-gray-800 shadow-xl">
        <PromptWizard onSubmit={handleCreate} isLoading={isLoading} />
      </div>
    </div>
  );
}
