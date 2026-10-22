import { IFrameworkAdapter, IBackendAdapter, IDatabaseAdapter, FrameworkMetadata } from './interfaces';
import { NextJsAdapter } from './frontend/nextjs.adapter';
import { AspNetAdapter } from './backend/aspnet.adapter';
import {
  SqliteDatabaseAdapter,
  PostgreSqlDatabaseAdapter,
  SqlServerDatabaseAdapter,
} from './database/database.adapters';

export class AdapterRegistry {
  private static instance: AdapterRegistry;
  private frontendAdapters = new Map<string, IFrameworkAdapter>();
  private backendAdapters = new Map<string, IBackendAdapter>();
  private databaseAdapters = new Map<string, IDatabaseAdapter>();

  private constructor() {
    this.registerDefaults();
  }

  static getInstance(): AdapterRegistry {
    if (!AdapterRegistry.instance) {
      AdapterRegistry.instance = new AdapterRegistry();
    }
    return AdapterRegistry.instance;
  }

  private registerDefaults(): void {
    const nextjs = new NextJsAdapter();
    this.frontendAdapters.set(nextjs.metadata.id, nextjs);

    const aspnet = new AspNetAdapter();
    this.backendAdapters.set(aspnet.metadata.id, aspnet);

    const sqlite = new SqliteDatabaseAdapter();
    const pg = new PostgreSqlDatabaseAdapter();
    const sqlserver = new SqlServerDatabaseAdapter();

    this.databaseAdapters.set(sqlite.databaseType, sqlite);
    this.databaseAdapters.set(pg.databaseType, pg);
    this.databaseAdapters.set(sqlserver.databaseType, sqlserver);
  }

  getFrontendAdapter(id: string): IFrameworkAdapter | undefined {
    return this.frontendAdapters.get(id);
  }

  getBackendAdapter(id: string): IBackendAdapter | undefined {
    return this.backendAdapters.get(id);
  }

  getDatabaseAdapter(id: string): IDatabaseAdapter | undefined {
    return this.databaseAdapters.get(id);
  }

  validateStack(
    frontend: string,
    backend: string,
    database: string
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    const fAdapter = this.getFrontendAdapter(frontend);
    if (!fAdapter) {
      errors.push(`Frontend framework "${frontend}" is currently not supported.`);
    }

    const bAdapter = this.getBackendAdapter(backend);
    if (!bAdapter) {
      errors.push(`Backend framework "${backend}" is currently not supported.`);
    } else {
      const compat = bAdapter.validateCompatibility(database);
      if (!compat.compatible && compat.reason) {
        errors.push(compat.reason);
      }
    }

    const dAdapter = this.getDatabaseAdapter(database);
    if (!dAdapter) {
      errors.push(`Database engine "${database}" is currently not supported.`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  listMetadata(): FrameworkMetadata[] {
    const list: FrameworkMetadata[] = [];
    for (const a of this.frontendAdapters.values()) list.push(a.metadata);
    for (const a of this.backendAdapters.values()) list.push(a.metadata);
    return list;
  }
}

export const adapterRegistry = AdapterRegistry.getInstance();
