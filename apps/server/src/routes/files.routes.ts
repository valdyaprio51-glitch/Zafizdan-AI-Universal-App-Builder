import { FastifyPluginAsync } from 'fastify';
import { workspaceManager } from '../file-engine/workspace.manager';
import { FileContentSchema } from '@zafizdan/shared';

export const filesRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/v1/projects/:id/files
  fastify.get('/:id/files', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const tree = workspaceManager.getFileTree(id);
      return tree;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return reply.status(500).send({ error: `Failed to fetch file tree: ${msg}` });
    }
  });

  // GET /api/v1/projects/:id/files/content?path=...
  fastify.get('/:id/files/content', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { path } = request.query as { path: string };

    if (!path) {
      return reply.status(400).send({ error: 'Query parameter "path" is required' });
    }

    try {
      const fileData = workspaceManager.readFile(id, path);
      return fileData;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return reply.status(404).send({ error: msg });
    }
  });

  // PUT /api/v1/projects/:id/files/content
  fastify.put('/:id/files/content', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parse = FileContentSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Validation failed', details: parse.error.format() });
    }

    const { path, content } = parse.data;
    try {
      const result = await workspaceManager.writeFile(id, path, content);
      return { success: true, file: result };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return reply.status(500).send({ error: `Failed to write file: ${msg}` });
    }
  });

  // DELETE /api/v1/projects/:id/files?path=...
  fastify.delete('/:id/files', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { path } = request.query as { path: string };
    if (!path) return reply.status(400).send({ error: 'Path is required' });

    const deleted = workspaceManager.deleteFile(id, path);
    return { success: deleted };
  });

  // POST /api/v1/projects/:id/files/search
  fastify.post('/:id/files/search', async (request) => {
    const { id } = request.params as { id: string };
    const { query } = request.body as { query: string };
    const matches = workspaceManager.searchFiles(id, query || '');
    return { query, matches };
  });

  // POST /api/v1/projects/:id/export (Download ZIP)
  fastify.post('/:id/export', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const zipBuffer = await workspaceManager.exportToZip(id);
      reply.header('Content-Type', 'application/zip');
      reply.header('Content-Disposition', `attachment; filename="project-${id}.zip"`);
      return reply.send(zipBuffer);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return reply.status(500).send({ error: `Failed to generate ZIP: ${msg}` });
    }
  });
};
