using IpManagement.Functions.Models;

namespace IpManagement.Functions.Repositories
{
    public interface IPersistenceRepository
    {
        Task<Staff?> GetStaffByEmailAsync(string email);
        Task<Client[]> GetClientsForStaffAsync(string staffId);
        Task<IpEntry[]> GetIpsForClientIdsAsync(IEnumerable<string> clientIds);
        Task<IpEntry?> GetIpByIdAsync(string id, string clientId);
        Task<IpEntry> CreateIpEntryAsync(IpEntry ipEntry);
        Task<IpEntry> UpdateIpEntryAsync(IpEntry ipEntry);
        Task DeleteIpEntryAsync(string id, string clientId);
        Task<Client?> GetClientByIdAsync(string clientId);
    }
}
