# API

Azure Functions backend for the IP management portal.

## Run locally

1. Install .NET 8 SDK.
2. Install Azure Functions Core Tools.
3. Restore packages:
   `dotnet restore`
4. Start the function locally:
   `func start`

## Local configuration

- Set `COSMOS_DB_CONNECTION_STRING` in `local.settings.json`.
- `AUTHENTICATION_ENABLED` is currently disabled for local development.
- The API expects a staff email header for authorized requests:
  `X-Staff-Email: staff@example.com`

## Deploy

1. Publish the project:
   `dotnet publish -c Release`
2. Deploy to Azure Function App.
3. Configure app settings:
   - `COSMOS_DB_CONNECTION_STRING`
   - `COSMOS_DB_ACCOUNT_NAME`
   - `COSMOS_DB_DATABASE_NAME`
   - `FUNCTIONS_WORKER_RUNTIME=dotnet-isolated`
