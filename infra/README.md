# Infrastructure

This folder contains the Azure Bicep template for deploying the Function App, Storage Account, and Cosmos DB.

## Deploy

1. Install Azure CLI: https://learn.microsoft.com/cli/azure/install-azure-cli
2. Login: `az login`
3. Run:
   `./deploy.ps1 -resourceGroupName ip-management-rg -location eastus`

## Notes

- The Bicep template creates:
  - Storage Account
  - Cosmos DB account with three containers: `Staff`, `Clients`, `IpAssets`
  - Consumption Function App
- Update `AUTHENTICATION_ENABLED` in the Function App settings after wiring Azure AD
