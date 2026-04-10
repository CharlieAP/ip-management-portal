using System.Text.Json.Serialization;

namespace IpManagement.Functions.Models
{
    public sealed class IpEntry
    {
        public string id { get; set; } = Guid.NewGuid().ToString();
        public string InternalReference { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string ClientId { get; set; } = string.Empty;
        public IpEntryType Type { get; set; } = IpEntryType.Unknown;
        public string Description { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum IpEntryType
    {
        Unknown,
        Patent,
        TradeMark
    }
}
