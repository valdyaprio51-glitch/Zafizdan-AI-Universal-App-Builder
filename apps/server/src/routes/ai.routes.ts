import { FastifyPluginAsync } from 'fastify';
import { aiProviderManager } from '../ai/ai-provider-manager';
import { adapterRegistry } from '../adapters/adapter-registry';
import { AIProviderSchema } from '@zafizdan/shared';
import { prisma } from '../prisma';
import { securityEncryption } from '../core/security/encryption';

export const aiRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/v1/frameworks
  fastify.get('/frameworks', async () => {
    return adapterRegistry.listMetadata();
  });

  // GET /api/v1/ai/providers
  fastify.get('/ai/providers', async () => {
    return aiProviderManager.listProviders();
  });

  // POST /api/v1/ai/providers
  fastify.post('/ai/providers', async (request, reply) => {
    const parse = AIProviderSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Validation failed', details: parse.error.format() });
    }

    const { name, type, endpoint, apiKey, model, temperature, tokenBudget, timeoutMs, isDefault } = parse.data;

    let encryptedKey: string | undefined;
    let keyIv: string | undefined;
    let keyAuthTag: string | undefined;

    if (apiKey) {
      const encrypted = securityEncryption.encrypt(apiKey);
      encryptedKey = encrypted.encrypted;
      keyIv = encrypted.iv;
      keyAuthTag = encrypted.authTag;
    }

    const record = await prisma.aIProvider.create({
      data: {
        name,
        type,
        endpoint,
        encryptedKey,
        keyIv,
        keyAuthTag,
        model,
        temperature,
        tokenBudget,
        timeoutMs,
        isDefault,
        isValidated: false,
      },
    });

    await aiProviderManager.loadFromDatabase();

    return reply.status(201).send({
      id: record.id,
      name: record.name,
      type: record.type,
      model: record.model,
      maskedKey: apiKey ? securityEncryption.maskSecret(apiKey) : undefined,
    });
  });

  // POST /api/v1/ai/providers/:id/validate
  fastify.post('/ai/providers/:id/validate', async (request, reply) => {
    const { id } = request.params as { id: string };
    const provider = aiProviderManager.getProvider(id);
    const result = await provider.validateCredentials();
    return result;
  });
};

