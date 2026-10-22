using Microsoft.EntityFrameworkCore;
using SaaS Inventory Management.Data;
using SaaS Inventory Management.Models;

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
