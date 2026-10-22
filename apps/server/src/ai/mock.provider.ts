import {
  AIProviderType,
  GenerationPlan,
  PipelineStage,
  QualityCheckResult,
} from '@zafizdan/shared';
import { IAIProvider, AICapabilities, AIProviderOptions } from './interfaces';

export class MockAIProvider implements IAIProvider {
  readonly id = 'mock-provider';
  readonly name = 'Universal Offline Mock AI Engine';
  readonly type = AIProviderType.MOCK;

  getCapabilities(): AICapabilities {
    return {
      supportsStreaming: true,
      supportsSystemPrompt: true,
      supportsToolCalling: true,
      maxContextTokens: 32768,
      supportedModels: ['mock-gpt-4o', 'mock-gemini-2.5', 'mock-claude-3-5-sonnet'],
    };
  }

  async validateCredentials(): Promise<{ valid: boolean; message?: string }> {
    return { valid: true, message: 'Mock provider is always ready and valid.' };
  }

  async generatePlan(prompt: string, _options?: AIProviderOptions): Promise<GenerationPlan> {
    const isInventory = prompt.toLowerCase().includes('inventory');
    const title = isInventory ? 'Enterprise SaaS Inventory Management' : 'Modern Full-Stack Cloud Application';

    return {
      summary: `Comprehensive implementation plan for: ${title}. Based on prompt: "${prompt}"`,
      userStories: [
        'As an administrator, I want to authenticate securely using JWT and manage inventory items.',
        'As a warehouse operator, I want to record stock movements (inbound/outbound) and monitor real-time levels.',
        'As an analyst, I want a rich analytics dashboard displaying total stock value and turnover velocity.',
        'As an API client, I want robust REST endpoints with swagger documentation and validation.',
      ],
      features: [
        'JWT Authentication & Role-Based Access Control (Admin, Staff, Viewer)',
        'Product Catalog Management with Categories, SKU, and Unit Pricing',
        'Stock Movement Ledger with Audit Trails',
        'Real-time Inventory Analytics Dashboard',
        'Health checks and automated testing suite',
      ],
      architectureOverview:
        'Multi-tier decoupled architecture: Next.js frontend with Tailwind UI, ASP.NET Core Web API or Node Express REST backend, SQLite / PostgreSQL data tier, Docker Compose containerization.',
      components: {
        frontend: {
          framework: 'nextjs',
          pages: ['/', '/dashboard', '/products', '/stock', '/login'],
          components: ['Sidebar', 'Navbar', 'ProductTable', 'StatsCard', 'StockMovementModal'],
        },
        backend: {
          framework: 'aspnet_core',
          endpoints: [
            'POST /api/auth/login',
            'GET /api/products',
            'POST /api/products',
            'GET /api/stock-movements',
            'POST /api/stock-movements',
            'GET /api/health',
          ],
          models: ['User', 'Product', 'StockMovement', 'Category'],
        },
        database: {
          type: 'sqlite',
          tables: ['Users', 'Products', 'Categories', 'StockMovements'],
        },
      },
      fileManifest: [
        'README.md',
        'docker-compose.yml',
        'backend/Program.cs',
        'backend/appsettings.json',
        'backend/backend.csproj',
        'backend/Controllers/ProductsController.cs',
        'backend/Controllers/AuthController.cs',
        'backend/Models/Product.cs',
        'backend/Models/User.cs',
        'frontend/package.json',
        'frontend/src/app/page.tsx',
        'frontend/src/app/dashboard/page.tsx',
        'frontend/src/app/products/page.tsx',
      ],
    };
  }

  async generateStageFiles(
    stage: PipelineStage,
    plan: GenerationPlan,
    projectContext: {
      appName: string;
      frontend: string;
      backend: string;
      database: string;
      existingFiles: Array<{ path: string; content: string }>;
    },
    _options?: AIProviderOptions
  ): Promise<Array<{ path: string; content: string }>> {
    const files: Array<{ path: string; content: string }> = [];

    switch (stage) {
      case PipelineStage.STAGE_1_REQUIREMENT_ANALYSIS:
        files.push({
          path: 'docs/PRD.md',
          content: `# Product Requirement Document (PRD): ${projectContext.appName}

## 1. Executive Summary
${plan.summary}

## 2. User Stories
${plan.userStories.map((s, i) => `${i + 1}. ${s}`).join('\n')}

## 3. Core Functional Requirements
${plan.features.map((f, i) => `- **F-${i + 1}**: ${f}`).join('\n')}

## 4. Technical Constraints
- Frontend: ${projectContext.frontend}
- Backend: ${projectContext.backend}
- Database: ${projectContext.database}
- Environment: Isolated Container Sandbox / Local Process Runner
`,
        });
        break;

      case PipelineStage.STAGE_2_ARCHITECTURE_PLANNING:
        files.push({
          path: 'docs/ARCHITECTURE.md',
          content: `# Architecture Specification & API Contracts

## Overview
${plan.architectureOverview}

## Data Flow
\`\`\`
Client (Browser) -> Next.js Frontend -> REST API Gateway -> Business Logic -> SQLite/Postgres DB
\`\`\`

## API Contracts
- \`POST /api/auth/login\` -> Generates JWT bearer token
- \`GET /api/products\` -> Returns paginated list of catalog items
- \`POST /api/products\` -> Creates a new product with stock quantity
- \`GET /api/stock-movements\` -> Returns audit log of inventory transfers
- \`GET /api/health\` -> Returns \`{ status: "ok", timestamp: ISOString }\`
`,
        });
        break;

      case PipelineStage.STAGE_3_PROJECT_SCAFFOLDING:
        files.push(
          {
            path: 'docker-compose.yml',
            content: `version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ASPNETCORE_URLS=http://+:5000
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:5000
    depends_on:
      - backend
`,
          },
          {
            path: '.env.example',
            content: `API_PORT=5000
FRONTEND_PORT=3000
JWT_SECRET=super_secret_jwt_key_for_development_purposes_only
DATABASE_URL=Data Source=inventory.db
`,
          },
          {
            path: 'README.md',
            content: `# ${projectContext.appName}

Generated by **Universal AI App Builder**.

## Quick Start
\`\`\`bash
# Run backend
cd backend
dotnet run

# Run frontend
cd frontend
npm install
npm run dev
\`\`\`
`,
          }
        );
        break;

      case PipelineStage.STAGE_4_DATABASE_GENERATION:
        files.push(
          {
            path: 'backend/Data/AppDbContext.cs',
            content: `using Microsoft.EntityFrameworkCore;
using ${projectContext.appName}.Models;

namespace ${projectContext.appName}.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<User> Users => Set<User>();
    public DbSet<StockMovement> StockMovements => Set<StockMovement>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Seed default Admin User
        modelBuilder.Entity<User>().HasData(
            new User { Id = 1, Username = "admin", Role = "Admin", PasswordHash = "hashed_pw_admin" },
            new User { Id = 2, Username = "manager", Role = "Manager", PasswordHash = "hashed_pw_manager" }
        );

        // Seed Initial Inventory Items
        modelBuilder.Entity<Product>().HasData(
            new Product { Id = 1, Name = "Industrial Sensor X-100", SKU = "SENS-100", Price = 249.99m, StockQuantity = 85 },
            new Product { Id = 2, Name = "Microcontroller Core V3", SKU = "MCU-003", Price = 45.50m, StockQuantity = 320 },
            new Product { Id = 3, Name = "Heavy Duty Servo Motor", SKU = "SRV-500", Price = 115.00m, StockQuantity = 40 }
        );
    }
}
`,
          },
          {
            path: 'backend/Models/Product.cs',
            content: `namespace ${projectContext.appName}.Models;

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
`,
          },
          {
            path: 'backend/Models/User.cs',
            content: `namespace ${projectContext.appName}.Models;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Role { get; set; } = "Viewer";
    public string PasswordHash { get; set; } = string.Empty;
}
`,
          },
          {
            path: 'backend/Models/StockMovement.cs',
            content: `namespace ${projectContext.appName}.Models;

public class StockMovement
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string Type { get; set; } = "IN"; // IN or OUT
    public int Quantity { get; set; }
    public string Reason { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
`,
          }
        );
        break;

      case PipelineStage.STAGE_5_BACKEND_GENERATION:
        files.push(
          {
            path: 'backend/backend.csproj',
            content: `<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <RootNamespace>${projectContext.appName}</RootNamespace>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.EntityFrameworkCore.Sqlite" Version="9.0.0" />
    <PackageReference Include="Microsoft.AspNetCore.OpenApi" Version="9.0.0" />
  </ItemGroup>

</Project>
`,
          },
          {
            path: 'backend/appsettings.json',
            content: `{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=inventory.db"
  }
}
`,
          },
          {
            path: 'backend/Program.cs',
            content: `using Microsoft.EntityFrameworkCore;
using ${projectContext.appName}.Data;
using ${projectContext.appName}.Models;

var builder = WebApplication.CreateBuilder(args);

// Add Database Context
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=inventory.db"));

// Enable CORS for frontend communication
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

app.UseCors("AllowAll");

// Ensure Database Created and Seeded
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

// Health Check
app.MapGet("/api/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

// Products Endpoints
app.MapGet("/api/products", async (AppDbContext db) =>
    await db.Products.ToListAsync());

app.MapGet("/api/products/{id}", async (int id, AppDbContext db) =>
    await db.Products.FindAsync(id) is Product product ? Results.Ok(product) : Results.NotFound());

app.MapPost("/api/products", async (Product product, AppDbContext db) =>
{
    db.Products.Add(product);
    await db.SaveChangesAsync();
    return Results.Created($"/api/products/{product.Id}", product);
});

// Stock Movements Endpoints
app.MapGet("/api/stock-movements", async (AppDbContext db) =>
    await db.StockMovements.OrderByDescending(m => m.Timestamp).ToListAsync());

app.MapPost("/api/stock-movements", async (StockMovement movement, AppDbContext db) =>
{
    var product = await db.Products.FindAsync(movement.ProductId);
    if (product == null) return Results.NotFound("Product not found");

    if (movement.Type.ToUpper() == "IN")
    {
        product.StockQuantity += movement.Quantity;
    }
    else if (movement.Type.ToUpper() == "OUT")
    {
        if (product.StockQuantity < movement.Quantity)
        {
            return Results.BadRequest("Insufficient stock");
        }
        product.StockQuantity -= movement.Quantity;
    }

    db.StockMovements.Add(movement);
    await db.SaveChangesAsync();
    return Results.Created($"/api/stock-movements/{movement.Id}", movement);
});

// Auth Endpoint (Mock JWT Auth)
app.MapPost("/api/auth/login", (LoginRequest req) =>
{
    if (req.Username == "admin" && req.Password == "admin123")
    {
        return Results.Ok(new { token = "mock-jwt-token-admin-role", role = "Admin", username = "admin" });
    }
    return Results.Unauthorized();
});

app.Run();

public record LoginRequest(string Username, string Password);
`,
          },
          {
            path: 'backend/Dockerfile',
            content: `FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app
COPY *.csproj ./
RUN dotnet restore
COPY . ./
RUN dotnet publish -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/out .
EXPOSE 5000
ENTRYPOINT ["dotnet", "backend.dll"]
`,
          }
        );
        break;

      case PipelineStage.STAGE_6_FRONTEND_GENERATION:
        files.push(
          {
            path: 'frontend/package.json',
            content: `{
  "name": "inventory-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.2.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.414.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.40",
    "tailwindcss": "^3.4.7",
    "typescript": "^5"
  }
}
`,
          },
          {
            path: 'frontend/tsconfig.json',
            content: `{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
`,
          },
          {
            path: 'frontend/src/app/page.tsx',
            content: `'use client';
import React, { useState, useEffect } from 'react';

export default function InventoryDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', margin: 0, color: '#38bdf8' }}>Universal Inventory SaaS</h1>
          <p style={{ color: '#94a3b8', margin: '0.25rem 0 0 0' }}>Real-time stock management and analytics engine</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ backgroundColor: '#10b981', width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block' }}></span>
          <span style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: 600 }}>API Connected</span>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #334155' }}>
          <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Total Items</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>{products.length}</div>
        </div>
        <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #334155' }}>
          <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Total Inventory Units</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem', color: '#38bdf8' }}>
            {products.reduce((acc, p) => acc + (p.stockQuantity || 0), 0)}
          </div>
        </div>
        <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #334155' }}>
          <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Inventory Value</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem', color: '#4ade80' }}>
            \${products.reduce((acc, p) => acc + (p.price * (p.stockQuantity || 0)), 0).toLocaleString()}
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: '#1e293b', borderRadius: '0.75rem', border: '1px solid #334155', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Stock Inventory List</h2>
        </div>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading inventory items...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8', fontSize: '0.875rem' }}>
                <th style={{ padding: '1rem 1.5rem' }}>ID</th>
                <th style={{ padding: '1rem 1.5rem' }}>Product Name</th>
                <th style={{ padding: '1rem 1.5rem' }}>SKU</th>
                <th style={{ padding: '1rem 1.5rem' }}>Price</th>
                <th style={{ padding: '1rem 1.5rem' }}>Quantity</th>
                <th style={{ padding: '1rem 1.5rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '1rem 1.5rem', color: '#94a3b8' }}>#{item.id}</td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>{item.name}</td>
                  <td style={{ padding: '1rem 1.5rem', fontFamily: 'monospace' }}>{item.sku}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>\${item.price.toFixed(2)}</td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>{item.stockQuantity}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{
                      backgroundColor: item.stockQuantity > 50 ? '#064e3b' : '#78350f',
                      color: item.stockQuantity > 50 ? '#6ee7b7' : '#fcd34d',
                      padding: '0.25rem 0.625rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      {item.stockQuantity > 50 ? 'In Stock' : 'Low Stock'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
`,
          },
          {
            path: 'frontend/Dockerfile',
            content: `FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . ./
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/package*.json ./
COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "start"]
`,
          }
        );
        break;

      case PipelineStage.STAGE_7_INTEGRATION:
        files.push({
          path: 'frontend/.env.local',
          content: `NEXT_PUBLIC_API_URL=http://localhost:5000\n`,
        });
        break;

      case PipelineStage.STAGE_8_AUTOMATED_QA:
        files.push({
          path: 'tests/api.test.js',
          content: `// Automated API Contract Tests
const assert = require('assert');

async function runTests() {
  console.log('Running automated verification suite...');
  assert.strictEqual(1 + 1, 2, 'Math check passes');
  console.log('✔ All contract tests verified successfully.');
}

runTests();
`,
        });
        break;

      default:
        break;
    }

    return files;
  }

  async repairErrors(
    stage: PipelineStage,
    qaResult: QualityCheckResult,
    relatedFiles: Array<{ path: string; content: string }>,
    _options?: AIProviderOptions
  ): Promise<{
    rootCause: string;
    patches: Array<{ filePath: string; patchContent: string; fullContent?: string }>;
  }> {
    const errorMsg = qaResult.stderr || qaResult.stdout || 'General build error';
    return {
      rootCause: `Detected syntax or type constraint error during ${stage}: ${errorMsg.slice(0, 100)}`,
      patches: relatedFiles.slice(0, 1).map((f) => ({
        filePath: f.path,
        patchContent: f.content,
        fullContent: f.content,
      })),
    };
  }
}
