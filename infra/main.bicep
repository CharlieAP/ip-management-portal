param location string = resourceGroup().location
param storageAccountName string = 'ipmgmt${uniqueString(resourceGroup().id)}'
param cosmosAccountName string = 'ipmgmtcosmos${uniqueString(resourceGroup().id)}'
param functionAppName string = 'ipmgmtfunc${uniqueString(resourceGroup().id)}'

// Create storage account for Azure functions state management 
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    allowBlobPublicAccess: false
    minimumTlsVersion: 'TLS1_2'
  }
}

// Create Cosmos DB account for storing staff, client and IP asset data as a serverless db
resource cosmosDb 'Microsoft.DocumentDB/databaseAccounts@2023-03-15' = {
  name: cosmosAccountName
  location: location
  kind: 'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    locations: [
      {
        locationName: location
        failoverPriority: 0
        isZoneRedundant: false
      }
    ]
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
    }
    capabilities: [
      {
        name: 'EnableServerless'
      }
    ]
  }
}

resource cosmosDbSql 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2023-03-15' = {
  parent: cosmosDb
  name: 'ipManagementDb'
  properties: {
    resource: {
      id: 'ipManagementDb'
    }
  }
}

// Create Cosmos DB containers for Staff, Clients, and IP Assets 
// - Staff is partitioned by Email since staff will often be looked up by email for authentication and client association.
// - Clients partitioned by StaffId since clients are always accessed with the context of their associated staff
// - IpAssets partitioned by ClientId since IpAssets are accessed with the context of their associated client
var containers = [
  {
    name: 'Staff'
    partitionKey: '/Email'
  }
  {
    name: 'Clients'
    partitionKey: '/StaffId'
  }
  {
    name: 'IpAssets'
    partitionKey: '/ClientId'
  }
]

resource cosmosContainers 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2023-03-15' = [for container in containers: {
  parent: cosmosDbSql
  name: container.name
  properties: {
    resource: {
      id: container.name
      partitionKey: {
        paths: [ container.partitionKey ]
        kind: 'Hash'
      }
      defaultTtl: -1
    }
  }
}]

// Create Azure Function app with a consumption plan
// Set function app to use cosmos DB connection and storage account for state management
resource appServicePlan 'Microsoft.Web/serverfarms@2024-11-01' = {
  name: '${functionAppName}-plan'
  location: location
  sku: {
    name: 'Y1'
    tier: 'Dynamic'
  }
  kind: 'functionapp'
}

resource functionApp 'Microsoft.Web/sites@2024-11-01' = {
  name: functionAppName
  location: location
  kind: 'functionapp'
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      appSettings: [
        {
          name: 'AzureWebJobsStorage'
          value: storageAccount.properties.primaryEndpoints.blob
        }
        {
          name: 'FUNCTIONS_WORKER_RUNTIME'
          value: 'dotnet-isolated'
        }
        {
          name: 'COSMOS_DB_CONNECTION_STRING'
          value: cosmosDb.listKeys().primaryMasterKey
        }
        {
          name: 'COSMOS_DB_ACCOUNT_NAME'
          value: cosmosDb.name
        }
        {
          name: 'COSMOS_DB_DATABASE_NAME'
          value: cosmosDbSql.name
        }
        {
          name: 'AUTHENTICATION_ENABLED'
          value: 'false'  // TODO: temporarily set to false until auth is fully implemented and tested. Could parameterise this to ensure its always enabled in prod
        }
      ]
    }
  }
  dependsOn: [cosmosContainers]
}

output functionAppName string = functionApp.name
output storageAccountName string = storageAccount.name
output cosmosAccountName string = cosmosDb.name
