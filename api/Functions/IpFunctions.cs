using IpManagement.Functions.Models;
using IpManagement.Functions.Repositories;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using System.Net;
using System.Text.Json;

namespace IpManagement.Functions.Functions
{
    public class IpFunctions
    {
        private readonly IPersistenceRepository _repository;

        public IpFunctions(IPersistenceRepository repository)
        {
            _repository = repository;
        }

        [Function("GetClients")]
        public async Task<HttpResponseData> GetClients([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "clients")] HttpRequestData request)
        {
            var email = AuthHelper.GetStaffEmail(request);
            if (string.IsNullOrEmpty(email))
            {
                return AuthHelper.UnauthenticatedResponse(request);
            }

            var staff = await _repository.GetStaffByEmailAsync(email);
            if (staff is null)
            {
                return request.CreateResponse(HttpStatusCode.NotFound);
            }

            var clients = await _repository.GetClientsForStaffAsync(staff.Id);
            var response = request.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "application/json");
            response.WriteString(JsonSerializer.Serialize(clients));

            return response;
        }

        [Function("GetIpEntries")]
        public async Task<HttpResponseData> GetIpEntries([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "ips")] HttpRequestData request)
        {
            // TODO: move repeat code into helper method or service layer
            var email = AuthHelper.GetStaffEmail(request);
            if (string.IsNullOrEmpty(email))
            {
                return AuthHelper.UnauthenticatedResponse(request);
            }

            var staff = await _repository.GetStaffByEmailAsync(email);
            if (staff is null)
            {
                return request.CreateResponse(HttpStatusCode.NotFound);
            }

            var clients = await _repository.GetClientsForStaffAsync(staff.Id);
            var clientIds = clients.Select(c => c.Id);
            var ips = await _repository.GetIpsForClientIdsAsync(clientIds);

            var response = request.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "application/json");
            response.WriteString(JsonSerializer.Serialize(ips));
            return response;
        }

        [Function("CreateIpEntry")]
        public async Task<HttpResponseData> CreateIpEntry([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "ips")] HttpRequestData request)
        {
            // TODO: prevent creation of IP entries with non-unique internal references
            var email = AuthHelper.GetStaffEmail(request);
            if (string.IsNullOrEmpty(email))
            {
                return AuthHelper.UnauthenticatedResponse(request);
            }

            var staff = await _repository.GetStaffByEmailAsync(email);
            if (staff is null)
            {
                return request.CreateResponse(HttpStatusCode.NotFound);
            }

            var content = await JsonSerializer.DeserializeAsync<IpEntry>(request.Body);

            var clients = await _repository.GetClientsForStaffAsync(staff.Id);
            
            if (content is null || string.IsNullOrEmpty(content.ClientId) || !clients.Any(c => string.Equals(c.Id, content.ClientId)))
            {
                Console.WriteLine("INVALID CLIENT ID: " + content?.ClientId);
                return request.CreateResponse(HttpStatusCode.BadRequest);
            }

            var created = await _repository.CreateIpEntryAsync(content);
            var response = request.CreateResponse(HttpStatusCode.Created);
            response.Headers.Add("Content-Type", "application/json");
            response.WriteString(JsonSerializer.Serialize(created));
            return response;
        }

        [Function("UpdateIpEntry")]
        public async Task<HttpResponseData> UpdateIpEntry([HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "ips/{id}")] HttpRequestData request, string id)
        {
            var email = AuthHelper.GetStaffEmail(request);
            if (string.IsNullOrEmpty(email))
            {
                return AuthHelper.UnauthenticatedResponse(request);
            }

            var staff = await _repository.GetStaffByEmailAsync(email);
            if (staff is null)
            {
                return request.CreateResponse(HttpStatusCode.NotFound);
            }

            var content = await JsonSerializer.DeserializeAsync<IpEntry>(request.Body);
            var clients = await _repository.GetClientsForStaffAsync(staff.Id);
            if (content is null || string.IsNullOrEmpty(content.ClientId) || !clients.Any(c => string.Equals(c.Id, content.ClientId)))
            {
                return request.CreateResponse(HttpStatusCode.BadRequest);
            }

            var existing = await _repository.GetIpByIdAsync(id, content.ClientId);
            if (existing is null)
            {
                return request.CreateResponse(HttpStatusCode.NotFound);
            }

            content.InternalReference = id;
            content.id = existing.id;
            var updated = await _repository.UpdateIpEntryAsync(content);
            var response = request.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "application/json");
            response.WriteString(JsonSerializer.Serialize(updated));
            return response;
        }

        [Function("DeleteIpEntry")]
        public async Task<HttpResponseData> DeleteIpEntry([HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "ips/{id}")] HttpRequestData request, string id)
        {
            var email = AuthHelper.GetStaffEmail(request);
            if (string.IsNullOrEmpty(email))
            {
                return AuthHelper.UnauthenticatedResponse(request);
            }

            var staff = await _repository.GetStaffByEmailAsync(email);
            if (staff is null)
            {
                return request.CreateResponse(HttpStatusCode.NotFound);
            }

            var clients = await _repository.GetClientsForStaffAsync(staff.Id);
            var clientIds = clients.Select(c => c.Id);

            IpEntry? target = null;
            foreach (var clientId in clientIds)
            {
                target = await _repository.GetIpByIdAsync(id, clientId);
                if (target is not null) break;
            }

            if (target is null)
            {
                return request.CreateResponse(HttpStatusCode.NotFound);
            }

            await _repository.DeleteIpEntryAsync(id, target.ClientId);
            return request.CreateResponse(HttpStatusCode.NoContent);
        }
    }
}
