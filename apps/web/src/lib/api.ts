const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    let errMsg = `Request failed: ${res.status}`;
    try {
      const err = await res.json();
      errMsg = err.error || errMsg;
    } catch {
      // ignore
    }
    throw new Error(errMsg);
  }

  return res.json() as Promise<T>;
}

export const api = {
  getStats: () => fetchApi<any>('/stats'),
  getProjects: () => fetchApi<any[]>('/projects'),
  getProject: (id: string) => fetchApi<any>(`/projects/${id}`),
  createProject: (data: any) =>
    fetchApi<any>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  deleteProject: (id: string) => fetchApi<any>(`/projects/${id}`, { method: 'DELETE' }),
  generateProject: (id: string) =>
    fetchApi<any>(`/projects/${id}/generate`, { method: 'POST' }),
  getGenerationStatus: (id: string) => fetchApi<any>(`/projects/${id}/generation-status`),

  getFileTree: (id: string) => fetchApi<any[]>(`/projects/${id}/files`),
  getFileContent: (id: string, path: string) =>
    fetchApi<{ content: string; path: string; size: number }>(
      `/projects/${id}/files/content?path=${encodeURIComponent(path)}`
    ),
  saveFileContent: (id: string, path: string, content: string) =>
    fetchApi<any>(`/projects/${id}/files/content`, {
      method: 'PUT',
      body: JSON.stringify({ path, content }),
    }),

  buildProject: (id: string) => fetchApi<any>(`/projects/${id}/build`, { method: 'POST' }),
  getBuilds: (id: string) => fetchApi<any[]>(`/projects/${id}/builds`),
  testProject: (id: string) => fetchApi<any>(`/projects/${id}/tests`, { method: 'POST' }),

  runProject: (id: string) => fetchApi<any>(`/projects/${id}/run`, { method: 'POST' }),
  stopProject: (id: string) => fetchApi<any>(`/projects/${id}/stop`, { method: 'POST' }),
  getPreview: (id: string) => fetchApi<any>(`/projects/${id}/preview`),

  getAIProviders: () => fetchApi<any[]>('/ai/providers'),
  getFrameworks: () => fetchApi<any[]>('/frameworks'),

  getExportZipUrl: (id: string) => `${API_BASE}/projects/${id}/export`,
  getEventsUrl: (id: string) => `${API_BASE}/projects/${id}/events`,
};

