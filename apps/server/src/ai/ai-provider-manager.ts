import { AIProviderType } from '@zafizdan/shared';
import { IAIProvider } from './interfaces';
import { MockAIProvider } from './mock.provider';
import { GeminiAIProvider } from './gemini.provider';
import { OpenAIProvider } from './openai.provider';
import { prisma } from '../prisma';
import { securityEncryption } from '../core/security/encryption';

export class AIProviderManager {
  private static instance: AIProviderManager;
  private providers = new Map<string, IAIProvider>();
  private defaultProviderId = 'mock-provider';

  private constructor() {
    // Register default mock provider
    const mock = new MockAIProvider();
    this.providers.set(mock.id, mock);
  }

  static getInstance(): AIProviderManager {
    if (!AIProviderManager.instance) {
      AIProviderManager.instance = new AIProviderManager();
    }
    return AIProviderManager.instance;
  }

  registerProvider(provider: IAIProvider): void {
    this.providers.set(provider.id, provider);
  }

  getProvider(providerId?: string): IAIProvider {
    if (providerId && this.providers.has(providerId)) {
      return this.providers.get(providerId)!;
    }

    const defaultProvider = this.providers.get(this.defaultProviderId);
    if (!defaultProvider) {
      return new MockAIProvider();
    }
    return defaultProvider;
  }

  listProviders(): Array<{
    id: string;
    name: string;
    type: AIProviderType;
    isDefault: boolean;
    capabilities: ReturnType<IAIProvider['getCapabilities']>;
  }> {
    return Array.from(this.providers.values()).map((p) => ({
      id: p.id,
      name: p.name,
      type: p.type,
      isDefault: p.id === this.defaultProviderId,
      capabilities: p.getCapabilities(),
    }));
  }

  async loadFromDatabase(): Promise<void> {
    try {
      const records = await prisma.aIProvider.findMany();
      for (const rec of records) {
        let apiKey = '';
        if (rec.encryptedKey && rec.keyIv && rec.keyAuthTag) {
          try {
            apiKey = securityEncryption.decrypt(rec.encryptedKey, rec.keyIv, rec.keyAuthTag);
          } catch (e) {
            console.error(`Failed to decrypt key for AI provider ${rec.id}:`, e);
          }
        }

        if (rec.type === AIProviderType.GOOGLE_GEMINI) {
          this.registerProvider(new GeminiAIProvider(apiKey, rec.model, rec.id, rec.name));
        } else if (rec.type === AIProviderType.OPENAI || rec.type === AIProviderType.OPENAI_COMPATIBLE) {
          this.registerProvider(
            new OpenAIProvider(apiKey, rec.endpoint || undefined, rec.model, rec.type as AIProviderType, rec.id, rec.name)
          );
        }

        if (rec.isDefault) {
          this.defaultProviderId = rec.id;
        }
      }
    } catch (err) {
      console.warn('Could not load AI providers from DB, running with built-in providers:', err);
    }
  }

  async recordUsage(
    projectId: string,
    providerType: string,
    modelName: string,
    promptTokens: number,
    completionTokens: number,
    operation: string
  ): Promise<void> {
    try {
      // Approximate pricing: $0.005 / 1k prompt, $0.015 / 1k completion
      const estimatedCost = (promptTokens * 0.000005) + (completionTokens * 0.000015);
      await prisma.usageRecord.create({
        data: {
          projectId,
          providerType,
          modelName,
          promptTokens,
          completionTokens,
          totalCost: estimatedCost,
          operation,
        },
      });
    } catch (err) {
      console.error('Failed to log AI usage record:', err);
    }
  }
}

export const aiProviderManager = AIProviderManager.getInstance();

