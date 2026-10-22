import { z } from 'zod';
import {
  ApplicationType,
  FrontendFramework,
  BackendFramework,
  DatabaseType,
  AuthStrategy,
  AuthorizationStrategy,
  AIProviderType,
} from './types';

export const CreateProjectSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  prompt: z.string().min(5, 'Description prompt must be at least 5 characters long'),
  mode: z.enum(['one-command', 'advanced']).default('one-command'),
  config: z
    .object({
      appType: z.nativeEnum(ApplicationType).default(ApplicationType.FULL_STACK),
      frontend: z.nativeEnum(FrontendFramework).default(FrontendFramework.NEXTJS),
      backend: z.nativeEnum(BackendFramework).default(BackendFramework.ASPNET_CORE),
      database: z.nativeEnum(DatabaseType).default(DatabaseType.SQLITE),
      auth: z.nativeEnum(AuthStrategy).default(AuthStrategy.JWT),
      authorization: z.nativeEnum(AuthorizationStrategy).default(AuthorizationStrategy.RBAC),
      language: z.string().default('typescript'),
      orm: z.string().optional(),
      uiLibrary: z.string().default('tailwind'),
      testFramework: z.string().default('jest'),
      dockerEnabled: z.boolean().default(true),
      aiProviderId: z.string().optional(),
    })
    .optional(),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

export const GenerateProjectSchema = z.object({
  customInstructions: z.string().optional(),
  targetStages: z.array(z.string()).optional(),
  forceRebuild: z.boolean().optional(),
});

export type GenerateProjectInput = z.infer<typeof GenerateProjectSchema>;

export const FileContentSchema = z.object({
  path: z.string().min(1),
  content: z.string(),
  commitMessage: z.string().optional(),
});

export type FileContentInput = z.infer<typeof FileContentSchema>;

export const AIProviderSchema = z.object({
  name: z.string().min(2),
  type: z.nativeEnum(AIProviderType),
  endpoint: z.string().url().optional().or(z.literal('')),
  apiKey: z.string().min(1).optional(),
  model: z.string().min(1),
  temperature: z.number().min(0).max(2).default(0.7),
  tokenBudget: z.number().positive().default(4000),
  timeoutMs: z.number().positive().default(60000),
  isDefault: z.boolean().default(false),
});

export type AIProviderInput = z.infer<typeof AIProviderSchema>;

