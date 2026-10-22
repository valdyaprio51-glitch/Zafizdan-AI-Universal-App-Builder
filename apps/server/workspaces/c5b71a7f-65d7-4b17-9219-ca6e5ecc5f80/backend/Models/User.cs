namespace SaaSInventoryMgmt.Models;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Role { get; set; } = "Viewer";
    public string PasswordHash { get; set; } = string.Empty;
}
