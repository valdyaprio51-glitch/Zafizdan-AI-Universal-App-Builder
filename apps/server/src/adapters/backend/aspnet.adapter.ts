import { IBackendAdapter, FrameworkMetadata, CommandDefinitions } from '../interfaces';

export class AspNetAdapter implements IBackendAdapter {
  readonly metadata: FrameworkMetadata = {
    id: 'aspnet_core',
    name: 'ASP.NET Core Web API',
    category: 'backend',
    version: '10.0 / 9.0',
    supportedRuntimes: ['.NET SDK >= 8.0'],
    description: 'High-performance, cross-platform backend framework for REST APIs with C#.',
    isSupported: true,
  };

  readonly commandDefinitions: CommandDefinitions = {
    installDependencies: 'dotnet restore',
    build: 'dotnet build',
    test: 'dotnet test',
    startDev: 'dotnet run',
    startProd: 'dotnet run --configuration Release',
  };

  validateCompatibility(targetDatabase?: string): { compatible: boolean; reason?: string } {
    if (targetDatabase && !['sqlserver', 'sqlite', 'postgresql', 'mysql'].includes(targetDatabase)) {
      return {
        compatible: false,
        reason: `ASP.NET Core adapter EF Core currently supports SQL Server, SQLite, and PostgreSQL. Unsupported DB: ${targetDatabase}`,
      };
    }
    return { compatible: true };
  }

  getDefaultPort(): number {
    return 5000;
  }

  getHealthEndpoint(): string {
    return '/api/health';
  }

  async generateScaffolding(appName: string): Promise<Array<{ path: string; content: string }>> {
    return [
      {
        path: 'backend/backend.csproj',
        content: `<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <RootNamespace>${appName}</RootNamespace>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Microsoft.EntityFrameworkCore.Sqlite" Version="9.0.0" />
    <PackageReference Include="Microsoft.AspNetCore.OpenApi" Version="9.0.0" />
  </ItemGroup>
</Project>`,
      },
    ];
  }

  async generateControllers(_models: string[]): Promise<Array<{ path: string; content: string }>> {
    return [];
  }

  async generateAuth(_strategy: string): Promise<Array<{ path: string; content: string }>> {
    return [];
  }
}

