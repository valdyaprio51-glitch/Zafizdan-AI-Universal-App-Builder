namespace Real-time AI Chatbot SaaS.Models;

public class StockMovement
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string Type { get; set; } = "IN"; // IN or OUT
    public int Quantity { get; set; }
    public string Reason { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
