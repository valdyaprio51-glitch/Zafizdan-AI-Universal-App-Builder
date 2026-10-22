import {
  AIProviderType,
  GenerationPlan,
  PipelineStage,
  QualityCheckResult,
} from '@zafizdan/shared';

export interface AICapabilities {
  supportsStreaming: boolean;
  supportsSystemPrompt: boolean;
  supportsToolCalling: boolean;
  maxContextTokens: number;
  supportedModels: string[];
}

export interface AIProviderOptions {
  apiKey?: string;
  endpoint?: string;
  model: string;
  temperature?: number;
  tokenBudget?: number;
  timeoutMs?: number;
}

export interface IAIProvider {
  readonly id: string;
  readonly name: string;
  readonly type: AIProviderType;

  getCapabilities(): AICapabilities;
  validateCredentials(): Promise<{ valid: boolean; message?: string }>;

  generatePlan(prompt: string, options?: AIProviderOptions): Promise<GenerationPlan>;

  generateStageFiles(
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
  ): Promise<Array<{ path: string; content: string }>>;

  repairErrors(
    stage: PipelineStage,
    qaResult: QualityCheckResult,
    relatedFiles: Array<{ path: string; content: string }>,
    options?: AIProviderOptions
  ): Promise<{
    rootCause: string;
    patches: Array<{ filePath: string; patchContent: string; fullContent?: string }>;
  }>;
}

