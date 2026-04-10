param(
    [string]$resourceGroupName = 'ip-management-rg',
    [string]$location = 'eastus'
)

$deploymentName = 'ipManagementDeployment'
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Creating resource group '$resourceGroupName' in '$location'..."
az group create --name $resourceGroupName --location $location | Out-Null

Write-Host 'Deploying Bicep template...'
az deployment group create `
    --resource-group $resourceGroupName `
    --template-file "$scriptPath\main.bicep" `
    --name $deploymentName

Write-Host 'Deployment complete.'
