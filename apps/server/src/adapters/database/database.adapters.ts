import { IDatabaseAdapter } from '../interfaces';

export class SqliteDatabaseAdapter implements IDatabaseAdapter {
  readonly databaseType = 'sqlite';

  generateConnectionString(dbName: string): string {
    return `Data Source=${dbName.endsWith('.db') ? dbName : `${dbName}.db`}`;
  }

  async generateSchema(tables: string[]): Promise<Array<{ path: string; content: string }>> {
    return [
      {
        path: 'database/schema.sql',
        content: `-- SQLite Database Schema for tables: ${tables.join(', ')}\nPRAGMA foreign_keys = ON;\n`,
      },
    ];
  }

  generateMigrationScript(): string {
    return 'sqlite3 inventory.db < database/schema.sql';
  }
}

export class PostgreSqlDatabaseAdapter implements IDatabaseAdapter {
  readonly databaseType = 'postgresql';

  generateConnectionString(dbName: string, host = 'localhost', port = 5432): string {
    return `Host=${host};Port=${port};Database=${dbName};Username=postgres;Password=postgres`;
  }

  async generateSchema(tables: string[]): Promise<Array<{ path: string; content: string }>> {
    return [
      {
        path: 'database/schema.sql',
        content: `-- PostgreSQL Schema for tables: ${tables.join(', ')}\nCREATE EXTENSION IF NOT EXISTS "uuid-ossp";\n`,
      },
    ];
  }

  generateMigrationScript(): string {
    return 'psql -U postgres -d app_db -f database/schema.sql';
  }
}

export class SqlServerDatabaseAdapter implements IDatabaseAdapter {
  readonly databaseType = 'sqlserver';

  generateConnectionString(dbName: string, host = 'localhost', port = 1433): string {
    return `Server=${host},${port};Database=${dbName};User Id=sa;Password=YourStrong(!)Password;TrustServerCertificate=True;`;
  }

  async generateSchema(tables: string[]): Promise<Array<{ path: string; content: string }>> {
    return [
      {
        path: 'database/schema.sql',
        content: `-- SQL Server Schema for tables: ${tables.join(', ')}\nSET ANSI_NULLS ON;\n`,
      },
    ];
  }

  generateMigrationScript(): string {
    return 'sqlcmd -S localhost -U sa -P YourStrong(!)Password -i database/schema.sql';
  }
}

