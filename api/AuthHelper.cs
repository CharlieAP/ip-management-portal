using System.Text.Json;
using Microsoft.Azure.Functions.Worker.Http;

namespace IpManagement.Functions
{
    public static class AuthHelper
    {
        public static string? GetStaffEmail(HttpRequestData request)
        {
            if (request.Headers.TryGetValues("X-Staff-Email", out var emailValues))
            {
                return emailValues.FirstOrDefault();
            }

            if (request.Headers.TryGetValues("x-ms-client-principal-name", out var principalValues))
            {
                return principalValues.FirstOrDefault();
            }

            if (request.Headers.TryGetValues("Authorization", out var authValues))
            {
                var authHeader = authValues.FirstOrDefault();
                if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                {
                    return null;
                }
            }

            return null;
        }

        public static HttpResponseData UnauthenticatedResponse(HttpRequestData request)
        {
            var response = request.CreateResponse(System.Net.HttpStatusCode.Unauthorized);
            response.Headers.Add("Content-Type", "application/json");
            response.WriteString(JsonSerializer.Serialize(new { error = "Unauthorized" }));
            return response;
        }
    }
}
