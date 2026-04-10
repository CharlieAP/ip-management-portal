using System.Text;
using Microsoft.Azure.Cosmos;
using IpManagement.Functions.Models;

namespace IpManagement.Functions.Repositories
{
    public sealed class CosmosPersistenceRepository : IPersistenceRepository
    {
        private readonly Container _staffContainer;
        private readonly Container _clientsContainer;
        private readonly Container _ipsContainer;

        public CosmosPersistenceRepository(CosmosClient client, string databaseName)
        {
            var database = client.GetDatabase(databaseName);
            _staffContainer = database.GetContainer("Staff");
            _clientsContainer = database.GetContainer("Clients");
            _ipsContainer = database.GetContainer("IpAssets");
        }

        public async Task<Staff?> GetStaffByEmailAsync(string email)
        {
            var query = new QueryDefinition("SELECT * FROM c WHERE c.Email = @email").WithParameter("@email", email);
            var iterator = _staffContainer.GetItemQueryIterator<Staff>(query);
            if (iterator.HasMoreResults)
            {
                var page = await iterator.ReadNextAsync();
                return page.Resource.FirstOrDefault();
            }
            return null;
        }

        public async Task<Client[]> GetClientsForStaffAsync(string staffId)
        {
            var query = new QueryDefinition("SELECT * FROM c WHERE c.StaffId = @staffId").WithParameter("@staffId", staffId);
            var iterator = _clientsContainer.GetItemQueryIterator<Client>(query);
            var results = new List<Client>();
            while (iterator.HasMoreResults)
            {
                var page = await iterator.ReadNextAsync();
                results.AddRange(page.Resource);
            }
            return results.ToArray();
        }

        public async Task<IpEntry[]> GetIpsForClientIdsAsync(IEnumerable<string> clientIds)
        {
            var ids = clientIds.ToArray();
            if (!ids.Any())
            {
                return Array.Empty<IpEntry>();
            }

            var builder = new System.Text.StringBuilder("SELECT * FROM c WHERE ");
            for (var i = 0; i < ids.Length; i++)
            {
                if (i > 0) builder.Append(" OR ");
                builder.Append($"c.ClientId = @id{i}");
            }

            var query = new QueryDefinition(builder.ToString());
            for (var i = 0; i < ids.Length; i++)
            {
                query = query.WithParameter($"@id{i}", ids[i]);
            }

            var iterator = _ipsContainer.GetItemQueryIterator<IpEntry>(query);
            var results = new List<IpEntry>();
            while (iterator.HasMoreResults)
            {
                var page = await iterator.ReadNextAsync();
                results.AddRange(page.Resource);
            }
            return results.ToArray();
        }

        public async Task<IpEntry?> GetIpByIdAsync(string internalReference, string clientId)
        {
            var query = new QueryDefinition("SELECT * FROM c WHERE c.InternalReference = @ref AND c.ClientId = @clientId")
                .WithParameter("@ref", internalReference)
                .WithParameter("@clientId", clientId);
            var iterator = _ipsContainer.GetItemQueryIterator<IpEntry>(query);
            if (iterator.HasMoreResults)
            {
                var page = await iterator.ReadNextAsync();
                return page.Resource.FirstOrDefault();
            }
            return null;
        }

        public async Task<IpEntry> CreateIpEntryAsync(IpEntry ipEntry)
        {
            var response = await _ipsContainer.CreateItemAsync(ipEntry, new PartitionKey(ipEntry.ClientId));
            return response.Resource;
        }

        public async Task<IpEntry> UpdateIpEntryAsync(IpEntry ipEntry)
        {
            var response = await _ipsContainer.UpsertItemAsync(ipEntry, new PartitionKey(ipEntry.ClientId));
            return response.Resource;
        }

        public async Task DeleteIpEntryAsync(string internalReference, string clientId)
        {
            var entry = await GetIpByIdAsync(internalReference, clientId);
            if (entry is null) return;
            await _ipsContainer.DeleteItemAsync<IpEntry>(entry.id, new PartitionKey(clientId));
        }

        public async Task<Client?> GetClientByIdAsync(string clientId)
        {
            try
            {
                var response = await _clientsContainer.ReadItemAsync<Client>(clientId, new PartitionKey(clientId));
                return response.Resource;
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return null;
            }
        }
    }
}
