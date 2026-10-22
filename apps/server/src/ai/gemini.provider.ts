import {
  AIProviderType,
  GenerationPlan,
  PipelineStage,
  QualityCheckResult,
} from '@zafizdan/shared';
import { IAIProvider, AICapabilities, AIProviderOptions } from './interfaces';

export class GeminiAIProvider implements IAIProvider {
  readonly id: string;
  readonly name: string;
  readonly type = AIProviderType.GOOGLE_GEMINI;
  private apiKey: string;
  private defaultModel: string;

  constructor(apiKey: string, model = 'gemini-1.5-flash', id = 'gemini-provider', name = 'Google Gemini AI') {
    this.apiKey = apiKey;
    this.defaultModel = model;
    this.id = id;
    this.name = name;
  }

  getCapabilities(): AICapabilities {
    return {
      supportsStreaming: true,
      supportsSystemPrompt: true,
      supportsToolCalling: true,
      maxContextTokens: 1048576,
      supportedModels: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'],
    };
  }

  async validateCredentials(): Promise<{ valid: boolean; message?: string }> {
    if (!this.apiKey) {
      return { valid: false, message: 'Gemini API Key is missing.' };
    }
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.defaultModel}?key=${this.apiKey}`;
      const res = await fetch(url);
      if (!res.ok) {
        return { valid: false, message: `Gemini API returned status ${res.status}: ${await res.text()}` };
      }
      return { valid: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { valid: false, message: `Connection failed: ${msg}` };
    }
  }

  async generatePlan(prompt: string, options?: AIProviderOptions): Promise<GenerationPlan> {
    const model = options?.model || this.defaultModel;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${options?.apiKey || this.apiKey}`;

    const systemPrompt = `You are a Principal Software Architect. Given the user application prompt, generate a structured JSON object strictly matching this schema:
{
  "summary": "High level summary",
  "userStories": ["Story 1", "Story 2"],
  "features": ["Feature 1", "Feature 2"],
  "architectureOverview": "Detailed architecture overview",
  "components": {
    "frontend": { "framework": "nextjs", "pages": ["/"], "components": ["Nav"] },
    "backend": { "framework": "aspnet_core", "endpoints": ["GET /api/health"], "models": ["Item"] },
    "database": { "type": "sqlite", "tables": ["Items"] }
  },
  "fileManifest": ["README.md", "docker-compose.yml"]
}`;

    const body = {
      contents: [{ role: 'user', parts: [{ text: `Prompt: ${prompt}` }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: options?.temperature ?? 0.4,
      },
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`Gemini generatePlan error (${res.status}): ${await res.text()}`);
    }

    const data = await res.json() as any;
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('Empty response from Gemini API');

    return JSON.parse(rawText) as GenerationPlan;
  }

  async generateStageFiles(
    stage: PipelineStage,
    plan: GenerationPlan,
    projectContext: {
      appName: string;
      frontend: string;
      backend: string;
      database: string;
      existingFiles: Array<{ path: string; content: string }>;
    },
    options?: AIProviderOptions
  ): Promise<Array<{ path: string; content: string }>> {
    const model = options?.model || this.defaultModel;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${options?.apiKey || this.apiKey}`;

    const systemPrompt = `You are a Senior Full-Stack Engineer and DevOps Specialist.
Generate full production-ready code files for stage: ${stage}.
Return JSON strictly in format:
{
  "files": [
    { "path": "path/to/file.ext", "content": "file contents here" }
  ]
}`;

    const userMessage = `App Name: ${projectContext.appName}
Frontend: ${projectContext.frontend}
Backend: ${projectContext.backend}
Database: ${projectContext.database}
Architecture Plan: ${JSON.stringify(plan)}
Generate the full files required for ${stage}.`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });

    if (!res.ok) {
      throw new Error(`Gemini generateStageFiles error: ${await res.text()}`);
    }

    const data = await res.json() as any;
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(rawText);
    return parsed.files || [];
  }

  async repairErrors(
    stage: PipelineStage,
    qaResult: QualityCheckResult,
    relatedFiles: Array<{ path: string; content: string }>,
    options?: AIProviderOptions
  ): Promise<{
    rootCause: string;
    patches: Array<{ filePath: string; patchContent: string; fullContent?: string }>;
  }> {
    const model = options?.model || this.defaultModel;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${options?.apiKey || this.apiKey}`;

    const systemPrompt = `You are an automated code repair expert. Analyze the build/test error and return a JSON fix:
{
  "rootCause": "Detailed root cause diagnosis",
  "patches": [
    { "filePath": "path/to/file.ext", "patchContent": "diff or replaced block", "fullContent": "complete new content" }
  ]
}`;

    const prompt = `Stage: ${stage}
Command: ${qaResult.command}
Error Output: ${qaResult.stderr || qaResult.stdout}
Related Files:
${relatedFiles.map((f) => `--- ${f.path} ---\n${f.content}\n`).join('\n')}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });

    if (!res.ok) {
      throw new Error(`Gemini repairErrors error: ${await res.text()}`);
    }

    const data = await res.json() as any;
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(rawText);
  }
}
