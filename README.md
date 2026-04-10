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
