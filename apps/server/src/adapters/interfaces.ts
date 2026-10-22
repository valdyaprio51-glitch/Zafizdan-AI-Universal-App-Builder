export type AdapterCategory = 'frontend' | 'backend' | 'database' | 'deployment';

export interface FrameworkMetadata {
  id: string;
  name: string;
  category: AdapterCategory;
  version: string;
  supportedRuntimes: string[];
  description: string;
  isSupported: boolean;
}

export interface CommandDefinitions {
  installDependencies: string;
  build: string;
  test: string;
  lint?: string;
  typecheck?: string;
  startDev: string;
  startProd: string;
}

export interface IFrameworkAdapter {
  readonly metadata: FrameworkMetadata;
  readonly commandDefinitions: CommandDefinitions;

  validateCompatibility(targetDatabase?: string, targetBackend?: string): { compatible: boolean; reason?: string };
  getDefaultPort(): number;
  getHealthEndpoint(): string;
  generateScaffolding(appName: string, options?: Record<string, unknown>): Promise<Array<{ path: string; content: string }>>;
}

export interface IBackendAdapter extends IFrameworkAdapter {
  generateControllers(models: string[]): Promise<Array<{ path: string; content: string }>>;
  generateAuth(strategy: string): Promise<Array<{ path: string; content: string }>>;
}

export interface IDatabaseAdapter {
  readonly databaseType: string;
  generateConnectionString(dbName: string, host?: string, port?: number): string;
  generateSchema(tables: string[]): Promise<Array<{ path: string; content: string }>>;
  generateMigrationScript(): string;
}

