using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using IpManagement.Functions.Repositories;
using Microsoft.Azure.Cosmos;

var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults()
    .ConfigureAppConfiguration(configBuilder =>
    {
        configBuilder.AddEnvironmentVariables();
    })
    .ConfigureServices((context, services) =>
    {
        var configuration = context.Configuration;
        var cosmosConnection = configuration["COSMOS_DB_CONNECTION_STRING"];
        var cosmosAccountName = configuration["COSMOS_DB_ACCOUNT_NAME"];
        var databaseName = configuration["COSMOS_DB_DATABASE_NAME"] ?? "ipManagementDb";

        if (string.IsNullOrWhiteSpace(cosmosConnection))
        {
            throw new InvalidOperationException("COSMOS_DB_CONNECTION_STRING is required.");
        }
        
        var cosmosClient = new CosmosClient(cosmosConnection);
        services.AddSingleton(cosmosClient);
        services.AddSingleton<IPersistenceRepository>(sp =>
            new CosmosPersistenceRepository(cosmosClient, databaseName));
    })
    .Build();

host.Run();
