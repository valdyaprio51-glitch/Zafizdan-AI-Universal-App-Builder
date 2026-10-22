import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import archiver from 'archiver';
import * as Diff from 'diff';
import { FileTreeNode } from '@zafizdan/shared';
import { PathGuard } from '../core/security/path-guard';
import { prisma } from '../prisma';

export class WorkspaceManager {
  private baseStoragePath: string;

  constructor(baseStoragePath = './workspaces') {
    this.baseStoragePath = path.resolve(baseStoragePath);
    if (!fs.existsSync(this.baseStoragePath)) {
      fs.mkdirSync(this.baseStoragePath, { recursive: true });
    }
  }

  getProjectWorkspace(projectId: string): string {
    const projectDir = path.resolve(this.baseStoragePath, projectId);
    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }
    return projectDir;
  }

  async writeFile(
    projectId: string,
    relativePath: string,
    content: string,
    isExecutable = false
  ): Promise<{ path: string; size: number; hash: string }> {
    const workspaceRoot = this.getProjectWorkspace(projectId);
    const safePath = PathGuard.resolveSafePath(workspaceRoot, relativePath);

    // Create parent directory if needed
    const dir = path.dirname(safePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write file
    fs.writeFileSync(safePath, content, 'utf8');
    const size = Buffer.byteLength(content, 'utf8');
    const hash = crypto.createHash('sha256').update(content).digest('hex');

    // Update database file tracking if project exists
    const cleanRelative = path.relative(workspaceRoot, safePath).replace(/\\/g, '/');
    try {
      await prisma.projectFile.upsert({
        where: {
          projectId_path: {
            projectId,
            path: cleanRelative,
          },
        },
        create: {
          projectId,
          path: cleanRelative,
          size,
          hash,
          isExecutable,
        },
        update: {
          size,
          hash,
          isExecutable,
          updatedAt: new Date(),
        },
      });
    } catch {
      // Gracefully continue if project record is not in DB (e.g. standalone/test workspace)
    }

    return { path: cleanRelative, size, hash };
  }

  readFile(projectId: string, relativePath: string): { content: string; path: string; size: number } {
    const workspaceRoot = this.getProjectWorkspace(projectId);
    const safePath = PathGuard.resolveSafePath(workspaceRoot, relativePath);

    if (!fs.existsSync(safePath) || fs.statSync(safePath).isDirectory()) {
      throw new Error(`File not found: ${relativePath}`);
    }

    const content = fs.readFileSync(safePath, 'utf8');
    return {
      content,
      path: path.relative(workspaceRoot, safePath).replace(/\\/g, '/'),
      size: Buffer.byteLength(content, 'utf8'),
    };
  }

  deleteFile(projectId: string, relativePath: string): boolean {
    const workspaceRoot = this.getProjectWorkspace(projectId);
    const safePath = PathGuard.resolveSafePath(workspaceRoot, relativePath);

    if (!fs.existsSync(safePath)) {
      return false;
    }

    if (fs.statSync(safePath).isDirectory()) {
      fs.rmSync(safePath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(safePath);
    }

    const cleanRelative = path.relative(workspaceRoot, safePath).replace(/\\/g, '/');
    prisma.projectFile
      .deleteMany({
        where: {
          projectId,
          path: cleanRelative,
        },
      })
      .catch((e) => console.error('Error removing file record from DB:', e));

    return true;
  }

  getFileTree(projectId: string): FileTreeNode[] {
    const workspaceRoot = this.getProjectWorkspace(projectId);

    const buildTree = (dirPath: string): FileTreeNode[] => {
      const items = fs.readdirSync(dirPath);
      const nodes: FileTreeNode[] = [];

      for (const item of items) {
        // Skip ignored directories like .git, node_modules, bin, obj
        if (['node_modules', '.git', 'bin', 'obj', '.next'].includes(item)) {
          continue;
        }

        const fullPath = path.join(dirPath, item);
        const relPath = path.relative(workspaceRoot, fullPath).replace(/\\/g, '/');
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          nodes.push({
            id: relPath,
            name: item,
            path: relPath,
            isDirectory: true,
            children: buildTree(fullPath),
          });
        } else {
          nodes.push({
            id: relPath,
            name: item,
            path: relPath,
            isDirectory: false,
            size: stat.size,
            updatedAt: stat.mtime.toISOString(),
          });
        }
      }

      // Sort directories first, then alphabetical
      return nodes.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });
    };

    return buildTree(workspaceRoot);
  }

  searchFiles(projectId: string, query: string): Array<{ path: string; matchLine: number; lineContent: string }> {
    const workspaceRoot = this.getProjectWorkspace(projectId);
    const results: Array<{ path: string; matchLine: number; lineContent: string }> = [];
    const lowerQuery = query.toLowerCase();

    const walk = (dir: string) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        if (['node_modules', '.git', 'bin', 'obj', '.next'].includes(item)) continue;
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          walk(fullPath);
        } else {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n');
            const rel = path.relative(workspaceRoot, fullPath).replace(/\\/g, '/');
            lines.forEach((line, idx) => {
              if (line.toLowerCase().includes(lowerQuery)) {
                results.push({
                  path: rel,
                  matchLine: idx + 1,
                  lineContent: line.trim(),
                });
              }
            });
          } catch {
            // skip binary or unreadable files
          }
        }
      }
    };

    walk(workspaceRoot);
    return results.slice(0, 50); // limit to top 50 matches
  }

  computeDiff(oldContent: string, newContent: string, filename: string): string {
    return Diff.createPatch(filename, oldContent, newContent, 'Original', 'Modified');
  }

  async createSnapshot(projectId: string, name: string, stage?: string): Promise<string> {
    const tree = this.getFileTree(projectId);
    const snapshot = await prisma.projectSnapshot.create({
      data: {
        projectId,
        name,
        stage,
        manifest: JSON.stringify(tree),
      },
    });
    return snapshot.id;
  }

  async exportToZip(projectId: string): Promise<Buffer> {
    const workspaceRoot = this.getProjectWorkspace(projectId);

    return new Promise((resolve, reject) => {
      const archive = archiver('zip', { zlib: { level: 9 } });
      const buffers: Buffer[] = [];

      archive.on('data', (data) => buffers.push(data));
      archive.on('end', () => resolve(Buffer.concat(buffers)));
      archive.on('error', (err) => reject(err));

      archive.glob('**/*', {
        cwd: workspaceRoot,
        ignore: ['node_modules/**', '.next/**', 'bin/**', 'obj/**', '.git/**'],
      });

      archive.finalize();
    });
  }
}

export const workspaceManager = new WorkspaceManager();
