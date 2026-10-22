import * as path from 'path';

export class PathGuard {
  /**
   * Safely resolve a relative path inside a target workspace root.
   * Throws an error if the resolved path attempts path traversal outside the workspace root.
   */
  static resolveSafePath(workspaceRoot: string, relativePath: string): string {
    if (!workspaceRoot) {
      throw new Error('Workspace root directory must be defined');
    }

    if (!relativePath || relativePath.trim() === '') {
      return path.resolve(workspaceRoot);
    }

    // Check for null bytes or forbidden characters
    if (relativePath.includes('\0')) {
      throw new Error('Security Error: Null byte injection detected in path');
    }

    const normalizedRoot = path.resolve(workspaceRoot);
    // Sanitize slashes for cross-platform compatibility
    const cleanRelative = relativePath.replace(/^[/\\]+/, '');
    const resolvedPath = path.resolve(normalizedRoot, cleanRelative);

    // Verify resolved path strictly starts with normalized root
    const relativeToRoot = path.relative(normalizedRoot, resolvedPath);
    if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) {
      throw new Error(`Security Error: Path traversal attempt blocked: "${relativePath}" is outside "${workspaceRoot}"`);
    }

    return resolvedPath;
  }

  /**
   * Check if a relative path is safe without throwing.
   */
  static isSafePath(workspaceRoot: string, relativePath: string): boolean {
    try {
      this.resolveSafePath(workspaceRoot, relativePath);
      return true;
    } catch {
      return false;
    }
  }
}
