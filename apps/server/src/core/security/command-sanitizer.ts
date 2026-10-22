export interface SanitizedCommand {
  command: string;
  args: string[];
}

export class CommandSanitizer {
  private static readonly ALLOWED_COMMANDS = new Set([
    'npm',
    'npx',
    'node',
    'dotnet',
    'python',
    'pip',
    'git',
    'docker',
    'docker-compose',
    'tsc',
  ]);

  private static readonly DANGEROUS_PATTERNS = [
    /[;&|`$><]/, // Shell operators
    /\brm\s+-rf\b/i,
    /\bdel\s+\/f\b/i,
    /\bformat\b/i,
    /\bcurl\b.*\|\s*(?:bash|sh|powershell)/i,
    /\bwget\b.*\|\s*(?:bash|sh|powershell)/i,
  ];

  /**
   * Validate and parse a command string into safe executable and argument list.
   */
  static sanitize(commandStr: string): SanitizedCommand {
    const trimmed = commandStr.trim();
    if (!trimmed) {
      throw new Error('Command cannot be empty');
    }

    // Check for dangerous shell injection patterns
    for (const pattern of this.DangerousPatterns) {
      if (pattern.test(trimmed)) {
        throw new Error(`Security Error: Forbidden shell sequence detected in: "${trimmed}"`);
      }
    }

    const parts = this.parseArgs(trimmed);
    const mainCommand = parts[0].toLowerCase().replace(/\.exe$/, '');

    if (!this.ALLOWED_COMMANDS.has(mainCommand)) {
      throw new Error(
        `Security Error: Executable "${mainCommand}" is not in the allowlist (${Array.from(this.ALLOWED_COMMANDS).join(', ')})`
      );
    }

    return {
      command: parts[0],
      args: parts.slice(1),
    };
  }

  private static get DangerousPatterns() {
    return this.DANGEROUS_PATTERNS;
  }

  /**
   * Safely parse command arguments preserving quotes.
   */
  private static parseArgs(cmd: string): string[] {
    const args: string[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';

    for (let i = 0; i < cmd.length; i++) {
      const char = cmd[i];

      if ((char === '"' || char === "'") && (i === 0 || cmd[i - 1] !== '\\')) {
        if (!inQuotes) {
          inQuotes = true;
          quoteChar = char;
        } else if (char === quoteChar) {
          inQuotes = false;
        } else {
          current += char;
        }
      } else if (char === ' ' && !inQuotes) {
        if (current.length > 0) {
          args.push(current);
          current = '';
        }
      } else {
        current += char;
      }
    }

    if (current.length > 0) {
      args.push(current);
    }

    return args;
  }
}
