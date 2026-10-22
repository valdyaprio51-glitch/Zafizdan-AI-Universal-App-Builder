using Microsoft.EntityFrameworkCore;
using Real-time AI Chatbot SaaS.Models;

namespace Real-time AI Chatbot SaaS.Data;

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
