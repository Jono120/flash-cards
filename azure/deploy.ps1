# PowerShell script for Azure Container Apps deployment
# Windows equivalent of deploy.sh

param(
    [string]$ResourceGroupName = "rg-flashcard-app",
    [string]$Location = "eastus",
    [string]$ContainerAppEnvName = "env-flashcard",
    [string]$BackendAppName = "flashcard-backend",
    [string]$FrontendAppName = "flashcard-frontend"
)

$ErrorActionPreference = "Stop"

# Generate unique names
$timestamp = [int][double]::Parse((Get-Date -UFormat %s))
$AcrName = "acrflashcard$timestamp"
$PostgresServerName = "postgres-flashcard-$timestamp"
$RedisName = "redis-flashcard-$timestamp"
$KeyVaultName = "kv-flashcard-$timestamp"

Write-Host "🚀 Starting Azure Container Apps deployment..." -ForegroundColor Green

# Step 1: Create Resource Group
Write-Host "📦 Creating resource group..." -ForegroundColor Yellow
az group create --name $ResourceGroupName --location $Location

# Step 2: Create Azure Container Registry
Write-Host "🐳 Creating Azure Container Registry..." -ForegroundColor Yellow
az acr create --resource-group $ResourceGroupName --name $AcrName --sku Basic --admin-enabled true

# Get ACR credentials
$AcrServer = az acr show --name $AcrName --resource-group $ResourceGroupName --query "loginServer" --output tsv
$AcrUsername = az acr credential show --name $AcrName --resource-group $ResourceGroupName --query "username" --output tsv
$AcrPassword = az acr credential show --name $AcrName --resource-group $ResourceGroupName --query "passwords[0].value" --output tsv

# Step 3: Build and push Docker images
Write-Host "🔨 Building and pushing Docker images..." -ForegroundColor Yellow

# Build and push backend
az acr build --registry $AcrName --image flashcard-backend:latest --file Dockerfile.backend .

# Build and push frontend
az acr build --registry $AcrName --image flashcard-frontend:latest --file frontend/Dockerfile.frontend ./frontend

# Step 4: Create Azure Database for PostgreSQL
Write-Host "🗄️ Creating PostgreSQL database..." -ForegroundColor Yellow
$PostgresPassword = [System.Web.Security.Membership]::GeneratePassword(32, 8)
az postgres flexible-server create `
    --resource-group $ResourceGroupName `
    --name $PostgresServerName `
    --location $Location `
    --admin-user flashcard_admin `
    --admin-password $PostgresPassword `
    --sku-name Standard_B1ms `
    --tier Burstable `
    --storage-size 32 `
    --version 15

# Create database
az postgres flexible-server db create `
    --resource-group $ResourceGroupName `
    --server-name $PostgresServerName `
    --database-name flashcards

# Step 5: Create Azure Cache for Redis
Write-Host "🔴 Creating Redis cache..." -ForegroundColor Yellow
az redis create `
    --resource-group $ResourceGroupName `
    --name $RedisName `
    --location $Location `
    --sku Basic `
    --vm-size c0

# Step 6: Create Key Vault
Write-Host "🔐 Creating Key Vault..." -ForegroundColor Yellow
az keyvault create `
    --resource-group $ResourceGroupName `
    --name $KeyVaultName `
    --location $Location

# Step 7: Create Container Apps Environment
Write-Host "🌐 Creating Container Apps environment..." -ForegroundColor Yellow
az containerapp env create `
    --name $ContainerAppEnvName `
    --resource-group $ResourceGroupName `
    --location $Location

# Step 8: Deploy Backend Container App
Write-Host "⚡ Deploying backend container app..." -ForegroundColor Yellow
az containerapp create `
    --name $BackendAppName `
    --resource-group $ResourceGroupName `
    --environment $ContainerAppEnvName `
    --image "$AcrServer/flashcard-backend:latest" `
    --registry-server $AcrServer `
    --registry-username $AcrUsername `
    --registry-password $AcrPassword `
    --target-port 8000 `
    --ingress external `
    --min-replicas 1 `
    --max-replicas 3 `
    --cpu 1.0 `
    --memory 2Gi `
    --env-vars "ENVIRONMENT=production" "PYTHONUNBUFFERED=1" "WEBSITES_PORT=8000"

# Get backend URL
$BackendUrl = az containerapp show `
    --name $BackendAppName `
    --resource-group $ResourceGroupName `
    --query properties.configuration.ingress.fqdn `
    --output tsv

# Step 9: Deploy Frontend Container App
Write-Host "🎨 Deploying frontend container app..." -ForegroundColor Yellow
az containerapp create `
    --name $FrontendAppName `
    --resource-group $ResourceGroupName `
    --environment $ContainerAppEnvName `
    --image "$AcrServer/flashcard-frontend:latest" `
    --registry-server $AcrServer `
    --registry-username $AcrUsername `
    --registry-password $AcrPassword `
    --target-port 80 `
    --ingress external `
    --min-replicas 1 `
    --max-replicas 3 `
    --cpu 0.5 `
    --memory 1Gi `
    --env-vars "REACT_APP_API_URL=https://$BackendUrl" "WEBSITES_PORT=80"

# Get frontend URL
$FrontendUrl = az containerapp show `
    --name $FrontendAppName `
    --resource-group $ResourceGroupName `
    --query properties.configuration.ingress.fqdn `
    --output tsv

# Step 10: Output deployment information
Write-Host ""
Write-Host "✅ Deployment completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Deployment Summary:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🌐 Frontend URL: https://$FrontendUrl" -ForegroundColor White
Write-Host "⚡ Backend URL:  https://$BackendUrl" -ForegroundColor White
Write-Host "🗄️ PostgreSQL:   $PostgresServerName.postgres.database.azure.com" -ForegroundColor White
Write-Host "🔴 Redis:        $RedisName.redis.cache.windows.net" -ForegroundColor White
Write-Host "🔐 Key Vault:    https://$KeyVaultName.vault.azure.net/" -ForegroundColor White
Write-Host "🐳 Registry:     $AcrServer" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Update your Gemini API key in Azure Key Vault"
Write-Host "2. Configure OAuth credentials"
Write-Host "3. Set up custom domain (optional)"
Write-Host "4. Configure Application Insights for monitoring"
Write-Host "5. Set up CI/CD pipeline"
Write-Host ""
Write-Host "💡 PostgreSQL Admin Password: $PostgresPassword" -ForegroundColor Red
Write-Host "   ⚠️  Save this password securely!"
Write-Host ""
Write-Host "📝 Useful Commands:" -ForegroundColor Yellow
Write-Host "• View logs: az containerapp logs show --name $BackendAppName --resource-group $ResourceGroupName --follow"
Write-Host "• Scale app: az containerapp update --name $BackendAppName --resource-group $ResourceGroupName --min-replicas 2 --max-replicas 5"
Write-Host "• Update image: az containerapp update --name $BackendAppName --resource-group $ResourceGroupName --image $AcrServer/flashcard-backend:new-tag"