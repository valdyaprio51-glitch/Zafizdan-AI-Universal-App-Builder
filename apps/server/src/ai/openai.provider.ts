import {
  AIProviderType,
  GenerationPlan,
  PipelineStage,
  QualityCheckResult,
} from '@zafizdan/shared';
import { IAIProvider, AICapabilities, AIProviderOptions } from './interfaces';

export class OpenAIProvider implements IAIProvider {
  readonly id: string;
  readonly name: string;
  readonly type: AIProviderType;
  private apiKey: string;
  private endpoint: string;
  private defaultModel: string;

  constructor(
    apiKey: string,
    endpoint = 'https://api.openai.com/v1',
    model = 'gpt-4o',
    type = AIProviderType.OPENAI,
    id = 'openai-provider',
    name = 'OpenAI API'
  ) {
    this.apiKey = apiKey;
    this.endpoint = endpoint.replace(/\/$/, '');
    this.defaultModel = model;
    this.type = type;
    this.id = id;
    this.name = name;
  }

  getCapabilities(): AICapabilities {
    return {
      supportsStreaming: true,
      supportsSystemPrompt: true,
      supportsToolCalling: true,
      maxContextTokens: 128000,
      supportedModels: ['gpt-4o', 'gpt-4o-mini', 'o1', 'o3-mini', 'llama3.2', 'deepseek-coder'],
    };
  }

  async validateCredentials(): Promise<{ valid: boolean; message?: string }> {
    try {
      const res = await fetch(`${this.endpoint}/models`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      if (!res.ok) {
        return { valid: false, message: `API responded with status ${res.status}` };
      }
      return { valid: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { valid: false, message: `Failed to connect to ${this.endpoint}: ${msg}` };
    }
  }

  async generatePlan(prompt: string, options?: AIProviderOptions): Promise<GenerationPlan> {
    const model = options?.model || this.defaultModel;
    const body = {
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a Principal Software Architect. Return valid JSON matching GenerationPlan structure.',
        },
        { role: 'user', content: `Create an architectural plan for: ${prompt}` },
      ],
      response_format: { type: 'json_object' },
      temperature: options?.temperature ?? 0.3,
    };

    const res = await fetch(`${this.endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${options?.apiKey || this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`OpenAI generatePlan failed (${res.status}): ${await res.text()}`);
    }

    const data = await res.json() as any;
    const content = data.choices?.[0]?.message?.content;
    return JSON.parse(content);
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
    const body = {
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a Senior Full-Stack Engineer. Return JSON with key "files": [{ "path": string, "content": string }].',
        },
        {
          role: 'user',
          content: `Generate stage ${stage} files for ${projectContext.appName}.\nPlan: ${JSON.stringify(plan)}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: options?.temperature ?? 0.2,
    };

    const res = await fetch(`${this.endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${options?.apiKey || this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`OpenAI generateStageFiles error: ${await res.text()}`);
    }

    const data = await res.json() as any;
    const content = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);
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
    const body = {
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a senior bug-fixing specialist. Return JSON with "rootCause" and "patches".',
        },
        {
          role: 'user',
          content: `Stage: ${stage}\nError: ${qaResult.stderr || qaResult.stdout}\nFiles: ${JSON.stringify(relatedFiles)}`,
        },
      ],
      response_format: { type: 'json_object' },
    };

    const res = await fetch(`${this.endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${options?.apiKey || this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`OpenAI repair error: ${await res.text()}`);
    }

    const data = await res.json() as any;
    return JSON.parse(data.choices?.[0]?.message?.content);
  }
}

