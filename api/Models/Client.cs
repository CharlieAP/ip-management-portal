namespace IpManagement.Functions.Models
{
    public sealed class Client
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = string.Empty;
        public string StaffId { get; set; } = string.Empty;
    }
}
