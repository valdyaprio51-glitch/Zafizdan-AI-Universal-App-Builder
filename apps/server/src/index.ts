import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import * as dotenv from 'dotenv';
import { projectsRoutes } from './routes/projects.routes';
import { filesRoutes } from './routes/files.routes';
import { generationRoutes } from './routes/generation.routes';
import { runtimeRoutes } from './routes/runtime.routes';
import { aiRoutes } from './routes/ai.routes';
import { statsRoutes } from './routes/stats.routes';
import { aiProviderManager } from './ai/ai-provider-manager';

dotenv.config();

const server = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
  },
});

async function main() {
  await server.register(cors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  await server.register(sensible);

  // Allow empty or whitespace-only JSON bodies without throwing FST_ERR_CTP_EMPTY_JSON_BODY
  server.addContentTypeParser('application/json', { parseAs: 'string' }, (_req, body: string | Buffer, done) => {
    const str = typeof body === 'string' ? body : body.toString('utf8');
    if (!str || str.trim() === '') {
      done(null, {});
      return;
    }
    try {
      done(null, JSON.parse(str));
    } catch (err: any) {
      err.statusCode = 400;
      done(err, undefined);
    }
  });

  server.addContentTypeParser('application/x-www-form-urlencoded', { parseAs: 'string' }, (_req, _body, done) => {
    done(null, {});
  });

  // Health check
  server.get('/health', async () => {
    return { status: 'healthy', platform: 'Universal AI App Builder', timestamp: new Date().toISOString() };
  });

  // API v1 Routes
  await server.register(projectsRoutes, { prefix: '/api/v1/projects' });
  await server.register(filesRoutes, { prefix: '/api/v1/projects' });
  await server.register(generationRoutes, { prefix: '/api/v1/projects' });
  await server.register(runtimeRoutes, { prefix: '/api/v1/projects' });
  await server.register(aiRoutes, { prefix: '/api/v1' });
  await server.register(statsRoutes, { prefix: '/api/v1' });

  // Initialize DB AI providers
  await aiProviderManager.loadFromDatabase();

  const port = parseInt(process.env.PORT || '4000', 10);
  const host = '0.0.0.0';

  try {
    await server.listen({ port, host });
    console.log(`🚀 Universal AI App Builder Backend Server running on http://localhost:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal initialization error:', err);
  process.exit(1);
});

