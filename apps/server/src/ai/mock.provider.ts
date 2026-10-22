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
    const title = isInventory ? 'Enterprise SaaS Inventory & Supply Chain Management' : 'Modern Full-Stack Cloud Platform';

    return {
      summary: `Comprehensive production-ready implementation plan for: ${title}. Based on prompt: "${prompt}"`,
      userStories: [
        'As an administrator, I want to authenticate securely using JWT and manage inventory items with role-based permissions.',
        'As a warehouse operator, I want to record stock movements (inbound/outbound) with reasons and update real-time stock levels.',
        'As a finance manager, I want an analytics dashboard with total stock valuation, low-stock threshold alerts, and CSV exports.',
        'As a developer, I want a well-structured ASP.NET Core Web API with decoupled controllers, services, DTOs, and SQLite/Postgres EF Core context.',
        'As an end-user, I want a reactive Next.js 14 frontend with tab navigation, modal forms, search/filter, and instant UI feedback.',
      ],
      features: [
        'JWT Bearer Authentication & Role-Based Access Control (Admin, Warehouse Manager, Staff, Viewer)',
        'Comprehensive Product Catalog with SKU, Category, Unit Price, Stock Threshold, and Real-time Status',
        'Stock Movement Ledger tracking Inbound/Outbound transfers with timestamps and audit trail',
        'Interactive Analytics & Reporting Dashboard with automated CSV export',
        'RESTful API with OpenAPI/Swagger documentation, health checks, and automated QA tests',
        'Docker & Docker Compose containerization for production deployment',
      ],
      architectureOverview:
        'Layered Clean Architecture: Next.js 14 App Router frontend with Tailwind UI components, decoupled ASP.NET Core Web API / Node REST backend, Entity Framework Core with SQLite/PostgreSQL persistence, and containerized deployment.',
      components: {
        frontend: {
          framework: 'nextjs',
          pages: ['/', '/dashboard', '/products', '/stock', '/analytics', '/users', '/settings'],
          components: ['Sidebar', 'Navbar', 'ProductTable', 'StatsCards', 'ProductModal', 'StockModal', 'ExportCsvButton', 'ApiExplorer'],
        },
        backend: {
          framework: 'aspnet_core',
          endpoints: [
            'POST /api/auth/login',
            'GET /api/products',
            'POST /api/products',
            'PUT /api/products/{id}',
            'DELETE /api/products/{id}',
            'GET /api/stock-movements',
            'POST /api/stock-movements',
            'GET /api/analytics/summary',
            'GET /api/health',
          ],
          models: ['Product', 'StockMovement', 'User', 'Category', 'AuditLog'],
        },
        database: {
          type: 'sqlite',
          tables: ['Products', 'StockMovements', 'Users', 'Categories', 'AuditLogs'],
        },
      },
      fileManifest: [
        'README.md',
        'docker-compose.yml',
        '.env.example',
        'docs/PRD.md',
        'docs/ARCHITECTURE.md',
        'backend/backend.csproj',
        'backend/Program.cs',
        'backend/appsettings.json',
        'backend/Dockerfile',
        'backend/Data/AppDbContext.cs',
        'backend/Models/Product.cs',
        'backend/Models/StockMovement.cs',
        'backend/Models/User.cs',
        'backend/DTOs/ProductDtos.cs',
        'backend/Controllers/ProductsController.cs',
        'backend/Controllers/StockMovementsController.cs',
        'backend/Controllers/AuthController.cs',
        'backend/Controllers/AnalyticsController.cs',
        'backend/Services/IInventoryService.cs',
        'backend/Services/InventoryService.cs',
        'frontend/package.json',
        'frontend/tsconfig.json',
        'frontend/Dockerfile',
        'frontend/src/app/page.tsx',
        'frontend/src/app/globals.css',
        'frontend/src/lib/apiClient.ts',
        'tests/api.test.js',
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

## 4. Non-Functional Requirements & Security
- **Authentication**: JWT Bearer Tokens with expiration and secure payload.
- **Authorization**: Role-Based Access Control (Admin, Warehouse Manager, Staff, Viewer).
- **Auditability**: All inbound/outbound stock transfers recorded immutably in StockMovement ledger.
- **Data Integrity**: Foreign keys, transactions, and SQLite/PostgreSQL EF Core constraints.
- **Extensibility**: Layered clean architecture separating Controller -> Service -> Repository/DbContext.
`,
        });
        break;

      case PipelineStage.STAGE_2_ARCHITECTURE_PLANNING:
        files.push({
          path: 'docs/ARCHITECTURE.md',
          content: `# Architecture Specification & API Contracts

## 1. System Topology
\`\`\`
Client (Browser) -> Next.js 14 App Router -> REST API Gateway -> InventoryService -> AppDbContext (EF Core) -> SQLite Database
\`\`\`

## 2. REST API Specification
- \`POST /api/auth/login\` -> Generates JWT bearer token with claims
- \`GET /api/products\` -> Returns catalog with category filtering and stock status
- \`POST /api/products\` -> Creates product with name, SKU, price, stock, category
- \`PUT /api/products/{id}\` -> Updates product details
- \`DELETE /api/products/{id}\` -> Removes product from catalog
- \`GET /api/stock-movements\` -> Returns immutable stock ledger entries
- \`POST /api/stock-movements\` -> Records IN/OUT transfer and atomically adjusts product stock
- \`GET /api/analytics/summary\` -> Returns KPI metrics (total items, total units, valuation, low stock count)
- \`GET /api/health\` -> Health check probe
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

An enterprise-grade, production-ready Full-Stack SaaS Application generated autonomously by **Universal AI App Builder**.

## System Components
- **Frontend**: Next.js 14 App Router, TypeScript, Tailwind CSS, Responsive Design
- **Backend**: ASP.NET Core Web API (.NET 10), Clean Architecture, Entity Framework Core
- **Database**: SQLite / PostgreSQL with seeded inventory catalog & audit ledger
- **Authentication**: JWT Bearer Tokens with Role-Based Access Control

## Quick Start
\`\`\`bash
# 1. Run backend Web API
cd backend
dotnet run

# 2. Run frontend web app
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
            path: 'backend/Models/Product.cs',
            content: `namespace ${projectContext.appName}.Models;

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public string Category { get; set; } = "General";
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public int MinThreshold { get; set; } = 20;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
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
    public string ProductName { get; set; } = string.Empty;
    public string Type { get; set; } = "IN"; // IN or OUT
    public int Quantity { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string PerformedBy { get; set; } = "Admin";
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
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
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = "Staff"; // Admin, Manager, Staff, Viewer
    public string PasswordHash { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
`,
          },
          {
            path: 'backend/Data/AppDbContext.cs',
            content: `using Microsoft.EntityFrameworkCore;
using ${projectContext.appName}.Models;

namespace ${projectContext.appName}.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<StockMovement> StockMovements => Set<StockMovement>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Seed Roles and Users
        modelBuilder.Entity<User>().HasData(
            new User { Id = 1, Username = "admin", Email = "admin@enterprise.com", Role = "Admin", PasswordHash = "hashed_admin_pass" },
            new User { Id = 2, Username = "warehouse_manager", Email = "manager@enterprise.com", Role = "Manager", PasswordHash = "hashed_manager_pass" },
            new User { Id = 3, Username = "operator", Email = "operator@enterprise.com", Role = "Staff", PasswordHash = "hashed_staff_pass" }
        );

        // Seed Rich Catalog Items
        modelBuilder.Entity<Product>().HasData(
            new Product { Id = 1, Name = "Industrial Sensor X-100", SKU = "SENS-100", Category = "Hardware", Price = 249.99m, StockQuantity = 85, MinThreshold = 20 },
            new Product { Id = 2, Name = "Microcontroller Core V3", SKU = "MCU-003", Category = "Electronics", Price = 45.50m, StockQuantity = 320, MinThreshold = 50 },
            new Product { Id = 3, Name = "Heavy Duty Servo Motor", SKU = "SRV-500", Category = "Robotics", Price = 115.00m, StockQuantity = 40, MinThreshold = 15 },
            new Product { Id = 4, Name = "Optic Fiber Transceiver 10G", SKU = "OPT-10G", Category = "Networking", Price = 89.00m, StockQuantity = 12, MinThreshold = 25 },
            new Product { Id = 5, Name = "Precision Digital Caliper", SKU = "TOOL-900", Category = "Hardware", Price = 34.99m, StockQuantity = 64, MinThreshold = 10 },
            new Product { Id = 6, Name = "Industrial Power Supply 24V", SKU = "PWR-24V", Category = "Electronics", Price = 129.50m, StockQuantity = 8, MinThreshold = 15 }
        );

        // Seed Initial Movements
        modelBuilder.Entity<StockMovement>().HasData(
            new StockMovement { Id = 1, ProductId = 1, ProductName = "Industrial Sensor X-100", Type = "IN", Quantity = 100, Reason = "Initial Factory Inbound", PerformedBy = "Admin", Timestamp = DateTime.UtcNow.AddDays(-5) },
            new StockMovement { Id = 2, ProductId = 1, ProductName = "Industrial Sensor X-100", Type = "OUT", Quantity = 15, Reason = "Assembly Line Allocation", PerformedBy = "Warehouse Manager", Timestamp = DateTime.UtcNow.AddDays(-2) },
            new StockMovement { Id = 3, ProductId = 6, ProductName = "Industrial Power Supply 24V", Type = "IN", Quantity = 20, Reason = "Supplier Batch Delivery", PerformedBy = "Admin", Timestamp = DateTime.UtcNow.AddDays(-4) },
            new StockMovement { Id = 4, ProductId = 6, ProductName = "Industrial Power Supply 24V", Type = "OUT", Quantity = 12, Reason = "Client Project Installation", PerformedBy = "Operator", Timestamp = DateTime.UtcNow.AddDays(-1) }
        );
    }
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
            path: 'backend/DTOs/ProductDtos.cs',
            content: `namespace ${projectContext.appName}.DTOs;

public record CreateProductDto(string Name, string SKU, string Category, decimal Price, int StockQuantity, int MinThreshold);
public record UpdateProductDto(string Name, string SKU, string Category, decimal Price, int StockQuantity, int MinThreshold);
public record RecordStockMovementDto(int ProductId, string Type, int Quantity, string Reason, string PerformedBy);
public record LoginDto(string Username, string Password);
public record AnalyticsSummaryDto(int TotalProducts, int TotalUnits, decimal TotalValuation, int LowStockCount);
`,
          },
          {
            path: 'backend/Services/IInventoryService.cs',
            content: `using ${projectContext.appName}.Models;
using ${projectContext.appName}.DTOs;

namespace ${projectContext.appName}.Services;

public interface IInventoryService
{
    Task<List<Product>> GetAllProductsAsync();
    Task<Product?> GetProductByIdAsync(int id);
    Task<Product> CreateProductAsync(CreateProductDto dto);
    Task<Product?> UpdateProductAsync(int id, UpdateProductDto dto);
    Task<bool> DeleteProductAsync(int id);
    Task<List<StockMovement>> GetMovementsAsync();
    Task<StockMovement?> RecordMovementAsync(RecordStockMovementDto dto);
    Task<AnalyticsSummaryDto> GetSummaryAsync();
}
`,
          },
          {
            path: 'backend/Services/InventoryService.cs',
            content: `using Microsoft.EntityFrameworkCore;
using ${projectContext.appName}.Data;
using ${projectContext.appName}.Models;
using ${projectContext.appName}.DTOs;

namespace ${projectContext.appName}.Services;

public class InventoryService : IInventoryService
{
    private readonly AppDbContext _db;

    public InventoryService(AppDbContext db) => _db = db;

    public async Task<List<Product>> GetAllProductsAsync() =>
        await _db.Products.OrderBy(p => p.Name).ToListAsync();

    public async Task<Product?> GetProductByIdAsync(int id) =>
        await _db.Products.FindAsync(id);

    public async Task<Product> CreateProductAsync(CreateProductDto dto)
    {
        var product = new Product
        {
            Name = dto.Name,
            SKU = dto.SKU,
            Category = dto.Category,
            Price = dto.Price,
            StockQuantity = dto.StockQuantity,
            MinThreshold = dto.MinThreshold,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _db.Products.Add(product);
        await _db.SaveChangesAsync();
        return product;
    }

    public async Task<Product?> UpdateProductAsync(int id, UpdateProductDto dto)
    {
        var p = await _db.Products.FindAsync(id);
        if (p == null) return null;

        p.Name = dto.Name;
        p.SKU = dto.SKU;
        p.Category = dto.Category;
        p.Price = dto.Price;
        p.StockQuantity = dto.StockQuantity;
        p.MinThreshold = dto.MinThreshold;
        p.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return p;
    }

    public async Task<bool> DeleteProductAsync(int id)
    {
        var p = await _db.Products.FindAsync(id);
        if (p == null) return false;
        _db.Products.Remove(p);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<List<StockMovement>> GetMovementsAsync() =>
        await _db.StockMovements.OrderByDescending(m => m.Timestamp).ToListAsync();

    public async Task<StockMovement?> RecordMovementAsync(RecordStockMovementDto dto)
    {
        var product = await _db.Products.FindAsync(dto.ProductId);
        if (product == null) return null;

        if (dto.Type.ToUpper() == "IN")
        {
            product.StockQuantity += dto.Quantity;
        }
        else if (dto.Type.ToUpper() == "OUT")
        {
            if (product.StockQuantity < dto.Quantity) return null;
            product.StockQuantity -= dto.Quantity;
        }
        product.UpdatedAt = DateTime.UtcNow;

        var movement = new StockMovement
        {
            ProductId = product.Id,
            ProductName = product.Name,
            Type = dto.Type.ToUpper(),
            Quantity = dto.Quantity,
            Reason = dto.Reason,
            PerformedBy = string.IsNullOrWhiteSpace(dto.PerformedBy) ? "Operator" : dto.PerformedBy,
            Timestamp = DateTime.UtcNow
        };

        _db.StockMovements.Add(movement);
        await _db.SaveChangesAsync();
        return movement;
    }

    public async Task<AnalyticsSummaryDto> GetSummaryAsync()
    {
        var products = await _db.Products.ToListAsync();
        var totalUnits = products.Sum(p => p.StockQuantity);
        var totalValuation = products.Sum(p => p.Price * p.StockQuantity);
        var lowStockCount = products.Count(p => p.StockQuantity <= p.MinThreshold);

        return new AnalyticsSummaryDto(products.Count, totalUnits, totalValuation, lowStockCount);
    }
}
`,
          },
          {
            path: 'backend/Program.cs',
            content: `using Microsoft.EntityFrameworkCore;
using ${projectContext.appName}.Data;
using ${projectContext.appName}.Services;
using ${projectContext.appName}.DTOs;

var builder = WebApplication.CreateBuilder(args);

// Database & Service Registration
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=inventory.db"));

builder.Services.AddScoped<IInventoryService, InventoryService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", p => p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();
app.UseCors("AllowAll");

// Initialize Database & Seed
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

// Health Check Probe
app.MapGet("/api/health", () => Results.Ok(new { status = "healthy", version = "1.0.0", timestamp = DateTime.UtcNow }));

// Products Endpoints
app.MapGet("/api/products", async (IInventoryService s) => Results.Ok(await s.GetAllProductsAsync()));
app.MapGet("/api/products/{id}", async (int id, IInventoryService s) =>
    await s.GetProductByIdAsync(id) is { } p ? Results.Ok(p) : Results.NotFound());
app.MapPost("/api/products", async (CreateProductDto dto, IInventoryService s) =>
    Results.Created($"/api/products", await s.CreateProductAsync(dto)));
app.MapPut("/api/products/{id}", async (int id, UpdateProductDto dto, IInventoryService s) =>
    await s.UpdateProductAsync(id, dto) is { } p ? Results.Ok(p) : Results.NotFound());
app.MapDelete("/api/products/{id}", async (int id, IInventoryService s) =>
    await s.DeleteProductAsync(id) ? Results.NoContent() : Results.NotFound());

// Stock Movements Endpoints
app.MapGet("/api/stock-movements", async (IInventoryService s) => Results.Ok(await s.GetMovementsAsync()));
app.MapPost("/api/stock-movements", async (RecordStockMovementDto dto, IInventoryService s) =>
    await s.RecordMovementAsync(dto) is { } m ? Results.Created("/api/stock-movements", m) : Results.BadRequest("Insufficient stock or invalid item"));

// Analytics Summary Endpoint
app.MapGet("/api/analytics/summary", async (IInventoryService s) => Results.Ok(await s.GetSummaryAsync()));

// Auth Mock JWT
app.MapPost("/api/auth/login", (LoginDto login) =>
{
    if (login.Username == "admin" && login.Password == "admin123")
    {
        return Results.Ok(new { token = "jwt-mock-admin-token-xyz", role = "Admin", username = "admin" });
    }
    return Results.Unauthorized();
});

app.Run();
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
  "name": "enterprise-inventory-frontend",
  "version": "1.0.0",
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
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  BarChart3,
  Users,
  Settings,
  Plus,
  Search,
  Download,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Boxes,
  Trash2,
  Edit2
} from 'lucide-react';

export default function EnterpriseApp() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'movements' | 'analytics' | 'users' | 'settings'>('dashboard');
  const [products, setProducts] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showProductModal, setShowProductModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);

  // Form states
  const [newProduct, setNewProduct] = useState({ name: '', sku: '', category: 'Hardware', price: 0, stockQuantity: 0, minThreshold: 15 });
  const [stockTx, setStockTx] = useState({ productId: 1, type: 'IN', quantity: 10, reason: 'Restock Batch', performedBy: 'Admin' });

  useEffect(() => {
    // Initial data
    setProducts([
      { id: 1, name: 'Industrial Sensor X-100', sku: 'SENS-100', category: 'Hardware', price: 249.99, stockQuantity: 85, minThreshold: 20 },
      { id: 2, name: 'Microcontroller Core V3', sku: 'MCU-003', category: 'Electronics', price: 45.50, stockQuantity: 320, minThreshold: 50 },
      { id: 3, name: 'Heavy Duty Servo Motor', sku: 'SRV-500', category: 'Robotics', price: 115.00, stockQuantity: 40, minThreshold: 15 },
      { id: 4, name: 'Optic Fiber Transceiver 10G', sku: 'OPT-10G', category: 'Networking', price: 89.00, stockQuantity: 12, minThreshold: 25 },
      { id: 5, name: 'Precision Digital Caliper', sku: 'TOOL-900', category: 'Hardware', price: 34.99, stockQuantity: 64, minThreshold: 10 },
      { id: 6, name: 'Industrial Power Supply 24V', sku: 'PWR-24V', category: 'Electronics', price: 129.50, stockQuantity: 8, minThreshold: 15 },
    ]);

    setMovements([
      { id: 1, productName: 'Industrial Sensor X-100', type: 'IN', quantity: 100, reason: 'Factory Direct Batch', performedBy: 'Admin', timestamp: '2026-10-20 09:30' },
      { id: 2, productName: 'Industrial Sensor X-100', type: 'OUT', quantity: 15, reason: 'Assembly Line Transfer', performedBy: 'Manager', timestamp: '2026-10-21 14:15' },
      { id: 3, productName: 'Industrial Power Supply 24V', type: 'OUT', quantity: 12, reason: 'Client Installation', performedBy: 'Staff', timestamp: '2026-10-22 11:00' },
    ]);
  }, []);

  const totalUnits = products.reduce((acc, p) => acc + (p.stockQuantity || 0), 0);
  const totalValuation = products.reduce((acc, p) => acc + (p.price * (p.stockQuantity || 0)), 0);
  const lowStockItems = products.filter(p => p.stockQuantity <= p.minThreshold);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.sku) return alert('Name & SKU required');
    const p = { ...newProduct, id: products.length + 1 };
    setProducts([...products, p]);
    setShowProductModal(false);
    setNewProduct({ name: '', sku: '', category: 'Hardware', price: 0, stockQuantity: 0, minThreshold: 15 });
  };

  const handleStockMovement = () => {
    const target = products.find(p => p.id === Number(stockTx.productId));
    if (!target) return;

    if (stockTx.type === 'OUT' && target.stockQuantity < stockTx.quantity) {
      return alert('Insufficient stock for this deduction');
    }

    const updatedQty = stockTx.type === 'IN' ? target.stockQuantity + stockTx.quantity : target.stockQuantity - stockTx.quantity;
    setProducts(products.map(p => p.id === target.id ? { ...p, stockQuantity: updatedQty } : p));

    setMovements([
      {
        id: movements.length + 1,
        productName: target.name,
        type: stockTx.type,
        quantity: stockTx.quantity,
        reason: stockTx.reason,
        performedBy: stockTx.performedBy,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      },
      ...movements
    ]);

    setShowStockModal(false);
  };

  const handleDeleteProduct = (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    setProducts(products.filter(p => p.id !== id));
  };

  const exportCsv = () => {
    const csvContent = 'data:text/csv;charset=utf-8,' +
      ['ID,Name,SKU,Category,Price,Quantity,Valuation,Status'].concat(
        products.map(p => \`\${p.id},"\${p.name}",\${p.sku},\${p.category},\${p.price},\${p.stockQuantity},\${(p.price * p.stockQuantity).toFixed(2)},\${p.stockQuantity <= p.minThreshold ? 'Low Stock' : 'In Stock'}\`)
      ).join('\\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'inventory_catalog_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          <div className="p-5 border-b border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-white">StockMaster Pro</div>
              <div className="text-[11px] text-sky-400 font-mono">Enterprise SaaS</div>
            </div>
          </div>

          <nav className="p-3 space-y-1 text-xs font-medium">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors \${activeTab === 'dashboard' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}\`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Analytics</span>
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors \${activeTab === 'products' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}\`}
            >
              <Package className="w-4 h-4" />
              <span>Product Catalog</span>
              <span className="ml-auto bg-slate-800 px-2 py-0.5 rounded-full text-[10px] text-slate-400">{products.length}</span>
            </button>
            <button
              onClick={() => setActiveTab('movements')}
              className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors \${activeTab === 'movements' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}\`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Stock Movements</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors \${activeTab === 'analytics' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}\`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Reports & Valuation</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors \${activeTab === 'users' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}\`}
            >
              <Users className="w-4 h-4" />
              <span>Role Permissions (RBAC)</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors \${activeTab === 'settings' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}\`}
            >
              <Settings className="w-4 h-4" />
              <span>System Settings</span>
            </button>
          </nav>
        </div>

        {/* User Card */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center font-bold text-xs">AD</div>
          <div className="text-xs">
            <div className="font-semibold text-white">Administrator</div>
            <div className="text-emerald-400 text-[10px]">JWT Authorized (RBAC)</div>
          </div>
        </div>
      </aside>

      {/* Main View Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/40 backdrop-blur px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-white uppercase tracking-wider text-xs">
              {activeTab === 'dashboard' && 'Dashboard Overview & KPI Analytics'}
              {activeTab === 'products' && 'Inventory Catalog Management'}
              {activeTab === 'movements' && 'Stock Movement & Audit Ledger'}
              {activeTab === 'analytics' && 'Financial Valuation & Stock Turnover Reports'}
              {activeTab === 'users' && 'Role-Based Access Control Matrix'}
              {activeTab === 'settings' && 'Enterprise System Settings'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowStockModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Transfer Stock</span>
            </button>
            <button
              onClick={() => setShowProductModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold shadow-md shadow-sky-500/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Product</span>
            </button>
          </div>
        </header>

        {/* Tab 1: Dashboard View */}
        {activeTab === 'dashboard' && (
          <div className="p-8 space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-sm">
                <div className="flex justify-between items-center text-xs text-slate-400 font-medium">
                  <span>Total Catalog Items</span>
                  <Package className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-3xl font-extrabold mt-2 text-white">{products.length}</div>
                <div className="text-[11px] text-slate-500 mt-1">Across 4 industrial categories</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-sm">
                <div className="flex justify-between items-center text-xs text-slate-400 font-medium">
                  <span>Total Inventory Units</span>
                  <Boxes className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-extrabold mt-2 text-emerald-400">{totalUnits.toLocaleString()}</div>
                <div className="text-[11px] text-emerald-500/80 mt-1">Physical stock available</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-sm">
                <div className="flex justify-between items-center text-xs text-slate-400 font-medium">
                  <span>Inventory Valuation</span>
                  <DollarSign className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-3xl font-extrabold mt-2 text-purple-400">\${totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                <div className="text-[11px] text-slate-500 mt-1">Calculated at unit pricing</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-sm">
                <div className="flex justify-between items-center text-xs text-slate-400 font-medium">
                  <span>Low Stock Warnings</span>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-3xl font-extrabold mt-2 text-amber-400">{lowStockItems.length}</div>
                <div className="text-[11px] text-amber-500/80 mt-1">Items below threshold</div>
              </div>
            </div>

            {/* Quick Action Tables in Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Transfers */}
              <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-sm text-white">Recent Stock Transfers</h3>
                  <button onClick={() => setActiveTab('movements')} className="text-xs text-sky-400 hover:underline">View All →</button>
                </div>
                <div className="space-y-3">
                  {movements.slice(0, 4).map(m => (
                    <div key={m.id} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <div>
                        <div className="font-semibold text-white">{m.productName}</div>
                        <div className="text-[11px] text-slate-400">{m.reason} • {m.performedBy}</div>
                      </div>
                      <div className="text-right">
                        <span className={\`font-mono font-bold \${m.type === 'IN' ? 'text-emerald-400' : 'text-rose-400'}\`}>
                          {m.type === 'IN' ? '+' : '-'}{m.quantity} Units
                        </span>
                        <div className="text-[10px] text-slate-500">{m.timestamp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Critical Stock Alerts */}
              <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Critical Re-order Alerts
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">{lowStockItems.length} Needs Action</span>
                </div>
                <div className="space-y-3">
                  {lowStockItems.map(p => (
                    <div key={p.id} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20">
                      <div>
                        <div className="font-semibold text-white">{p.name}</div>
                        <div className="text-[11px] text-slate-400">SKU: {p.sku} • Min Threshold: {p.minThreshold}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-amber-400 font-bold font-mono">{p.stockQuantity} left</div>
                        <button onClick={() => { setStockTx({ ...stockTx, productId: p.id, type: 'IN', quantity: 50 }); setShowStockModal(true); }} className="text-[10px] text-sky-400 hover:underline">Re-stock Now</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Products Catalog View */}
        {activeTab === 'products' && (
          <div className="p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by product name or SKU..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="All">All Categories</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Robotics">Robotics</option>
                  <option value="Networking">Networking</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={exportCsv} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors">
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400">
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">SKU Code</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Unit Price</th>
                    <th className="py-3 px-4">Available Units</th>
                    <th className="py-3 px-4">Valuation</th>
                    <th className="py-3 px-4">Stock Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredProducts.map(p => (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 text-slate-500 font-mono">#{p.id}</td>
                      <td className="py-3 px-4 font-semibold text-white">{p.name}</td>
                      <td className="py-3 px-4 font-mono text-slate-300">{p.sku}</td>
                      <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">{p.category}</span></td>
                      <td className="py-3 px-4 font-mono">\${p.price.toFixed(2)}</td>
                      <td className="py-3 px-4 font-bold font-mono text-white">{p.stockQuantity}</td>
                      <td className="py-3 px-4 font-mono text-purple-400">\${(p.price * p.stockQuantity).toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className={\`px-2.5 py-0.5 rounded-full text-[10px] font-semibold font-mono \${p.stockQuantity <= p.minThreshold ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}\`}>
                          {p.stockQuantity <= p.minThreshold ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button onClick={() => handleDeleteProduct(p.id)} className="p-1 hover:text-rose-400 transition-colors" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Stock Movements Ledger */}
        {activeTab === 'movements' && (
          <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-sm font-bold text-white">Audit Trail of Stock Transfers</h2>
                <p className="text-xs text-slate-400">All inventory entries and exits recorded immutably</p>
              </div>
              <button onClick={() => setShowStockModal(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold">
                <Plus className="w-3.5 h-3.5" /> Record Transfer
              </button>
            </div>

            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400">
                    <th className="py-3 px-4">Log ID</th>
                    <th className="py-3 px-4">Item Transferred</th>
                    <th className="py-3 px-4">Direction</th>
                    <th className="py-3 px-4">Quantity</th>
                    <th className="py-3 px-4">Transfer Reason</th>
                    <th className="py-3 px-4">Recorded By</th>
                    <th className="py-3 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {movements.map(m => (
                    <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 text-slate-500 font-mono">#{m.id}</td>
                      <td className="py-3 px-4 font-semibold text-white">{m.productName}</td>
                      <td className="py-3 px-4">
                        <span className={\`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono \${m.type === 'IN' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}\`}>
                          {m.type === 'IN' ? 'INBOUND' : 'OUTBOUND'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold font-mono">{m.quantity} Units</td>
                      <td className="py-3 px-4 text-slate-300">{m.reason}</td>
                      <td className="py-3 px-4 text-slate-400">{m.performedBy}</td>
                      <td className="py-3 px-4 text-slate-500 font-mono">{m.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Analytics View */}
        {activeTab === 'analytics' && (
          <div className="p-8 space-y-6 text-xs">
            <h2 className="text-sm font-bold text-white mb-2">Inventory Valuation & Financial Overview</h2>
            <div className="grid grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="text-slate-400">Total Stock Value</div>
                <div className="text-3xl font-extrabold text-purple-400">\${totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                <p className="text-[11px] text-slate-500">Asset value calculated directly from unit cost</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="text-slate-400">Inventory Health Index</div>
                <div className="text-3xl font-extrabold text-emerald-400">94.8%</div>
                <p className="text-[11px] text-slate-500">Based on stock vs threshold balance</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="text-slate-400">Average Unit Cost</div>
                <div className="text-3xl font-extrabold text-sky-400">\${(totalValuation / (totalUnits || 1)).toFixed(2)}</div>
                <p className="text-[11px] text-slate-500">Weighted average across all categories</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Role Permissions (RBAC) */}
        {activeTab === 'users' && (
          <div className="p-8 space-y-6 text-xs">
            <h2 className="text-sm font-bold text-white mb-2">Role-Based Access Control (RBAC) Policy</h2>
            <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 text-slate-400">
                    <th className="p-4">User</th>
                    <th className="p-4">Assigned Role</th>
                    <th className="p-4">Product Catalog Edit</th>
                    <th className="p-4">Record Stock In/Out</th>
                    <th className="p-4">Financial Reports</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  <tr>
                    <td className="p-4 font-semibold text-white">admin@enterprise.com</td>
                    <td className="p-4"><span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-mono text-[10px]">Administrator</span></td>
                    <td className="p-4 text-emerald-400">✔ Full Access</td>
                    <td className="p-4 text-emerald-400">✔ Full Access</td>
                    <td className="p-4 text-emerald-400">✔ Full Access</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-white">manager@enterprise.com</td>
                    <td className="p-4"><span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-mono text-[10px]">Warehouse Manager</span></td>
                    <td className="p-4 text-emerald-400">✔ Full Access</td>
                    <td className="p-4 text-emerald-400">✔ Full Access</td>
                    <td className="p-4 text-slate-500">✖ Read Only</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-white">operator@enterprise.com</td>
                    <td className="p-4"><span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">Floor Staff</span></td>
                    <td className="p-4 text-slate-500">✖ Read Only</td>
                    <td className="p-4 text-emerald-400">✔ Full Access</td>
                    <td className="p-4 text-slate-500">✖ No Access</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 6: Settings */}
        {activeTab === 'settings' && (
          <div className="p-8 space-y-6 max-w-xl text-xs text-slate-300">
            <h2 className="text-sm font-bold text-white mb-2">System & Warehouse Configuration</h2>
            <div className="space-y-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div>
                <label className="text-slate-400 block mb-1">Company / Facility Name</label>
                <input defaultValue="Global Distribution Facility #4" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Base Currency</label>
                <input defaultValue="USD ($)" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Default Low Stock Alert Threshold</label>
                <input type="number" defaultValue={20} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal: Add Product */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-white">Create New Catalog Product</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Product Name</label>
                <input value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="e.g. Laser Measurement Unit" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">SKU Code</label>
                  <input value={newProduct.sku} onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })} placeholder="e.g. LSR-09" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Category</label>
                  <select value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white">
                    <option value="Hardware">Hardware</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Robotics">Robotics</option>
                    <option value="Networking">Networking</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Unit Price ($)</label>
                  <input type="number" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Initial Stock Units</label>
                  <input type="number" value={newProduct.stockQuantity} onChange={e => setNewProduct({ ...newProduct, stockQuantity: parseInt(e.target.value) || 0 })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowProductModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold">Cancel</button>
              <button onClick={handleAddProduct} className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold">Save Product</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Stock Transfer */}
      {showStockModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-white">Record Stock In / Stock Out</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Target Product</label>
                <select value={stockTx.productId} onChange={e => setStockTx({ ...stockTx, productId: parseInt(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white">
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku}) - Current: {p.stockQuantity}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Direction</label>
                  <select value={stockTx.type} onChange={e => setStockTx({ ...stockTx, type: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white">
                    <option value="IN">INBOUND (Add Stock)</option>
                    <option value="OUT">OUTBOUND (Deduct Stock)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Quantity</label>
                  <input type="number" value={stockTx.quantity} onChange={e => setStockTx({ ...stockTx, quantity: parseInt(e.target.value) || 0 })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
                </div>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Transfer Reason / Order Number</label>
                <input value={stockTx.reason} onChange={e => setStockTx({ ...stockTx, reason: e.target.value })} placeholder="e.g. Supplier Shipment PO-9812" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowStockModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold">Cancel</button>
              <button onClick={handleStockMovement} className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold">Confirm Transfer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
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
          content: `// Automated API Contract & Logic Verification Suite
const assert = require('assert');

async function runTests() {
  console.log('🧪 Verifying Enterprise Inventory Core Contracts...');

  // 1. Math check
  assert.strictEqual(1 + 1, 2, 'Core math invariant');

  // 2. Stock movement validation logic
  const initialStock = 100;
  const transferOut = 30;
  const resultingStock = initialStock - transferOut;
  assert.strictEqual(resultingStock, 70, 'Stock decrement logic');

  // 3. Low stock threshold alert check
  const threshold = 25;
  const isLowStock = resultingStock <= threshold ? false : true;
  assert.strictEqual(isLowStock, true, 'Threshold calculation check');

  console.log('✔ All Automated Business Rules & Contract Tests PASSED!');
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
