# IP Management Portal

A thin vertical slice web portal for IP management with mocked authentication, built with:

- `frontend/` — Angular app for staff login and IP asset CRUD
- `api/` — .NET 8 Azure Functions backend for IP management APIs
- `infra/` — Bicep templates for Azure Function App, Storage, and Cosmos DB

## Features

- mocked authenticated access for staff members
- add, update, delete IP records
- staff can access IPs only for assigned clients
- deployable using Azure Functions and Cosmos DB

## Setup

1. Deploy infrastructure:
   - Open PowerShell in `infra/`
   - Run `./deploy.ps1`
2. Publish backend:
   - Open `api/` and run `dotnet publish -c Release`
   - Use `func azure functionapp publish` or Azure Pipelines
3. Run frontend locally:
   - Open `frontend/`
   - Run `npm install`
   - Run `npm start`

## Notes

- Authentication is prepared for Azure AD / Easy Auth and can be extended to Azure AD B2C.
- The API uses Cosmos DB collections for staff, clients, and IP assets (Trade marks and patents).
- For ease while testing I have been using a `settings.json` for environment variables such as DB connections. You should add one in too, for example my `local.settings.json` looks like this:
  `{
	"IsEncrypted": false,
	"Values": {
		"AzureWebJobsStorage": "UseDevelopmentStorage=true",
		"FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",
		"COSMOS_DB_CONNECTION_STRING": "AccountEndpoint=<YOUR_ENDPOINT_STRING>;AccountKey=<YOUR_ACCOUNT_KEY>;",
		"COSMOS_DB_ACCOUNT_NAME": "<YOUR_DB_ACCOUNT_NAME>",
		"COSMOS_DB_DATABASE_NAME": "<YOUR_DB_NAME>",
		"AUTHENTICATION_ENABLED": "false"
	}
}`
- If in production I would have these stored in the Azure key vault
