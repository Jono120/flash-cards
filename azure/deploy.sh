#!/bin/bash

# Azure Container Apps Deployment Script
# This script deploys the AI Flashcard application to Azure Container Apps

set -e

# Configuration
RESOURCE_GROUP_NAME="rg-flashcard-app"
LOCATION="eastus"
CONTAINER_APP_ENV_NAME="env-flashcard"
BACKEND_APP_NAME="flashcard-backend"
FRONTEND_APP_NAME="flashcard-frontend"
ACR_NAME="acrflashcard$(date +%s)"
POSTGRES_SERVER_NAME="postgres-flashcard-$(date +%s)"
REDIS_NAME="redis-flashcard-$(date +%s)"
KEY_VAULT_NAME="kv-flashcard-$(date +%s)"

echo "🚀 Starting Azure Container Apps deployment..."

# Step 1: Create Resource Group
echo "📦 Creating resource group..."
az group create \
  --name $RESOURCE_GROUP_NAME \
  --location $LOCATION

# Step 2: Create Azure Container Registry
echo "🐳 Creating Azure Container Registry..."
az acr create \
  --resource-group $RESOURCE_GROUP_NAME \
  --name $ACR_NAME \
  --sku Basic \
  --admin-enabled true

# Get ACR credentials
ACR_SERVER=$(az acr show --name $ACR_NAME --resource-group $RESOURCE_GROUP_NAME --query "loginServer" --output tsv)
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --resource-group $RESOURCE_GROUP_NAME --query "username" --output tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --resource-group $RESOURCE_GROUP_NAME --query "passwords[0].value" --output tsv)

# Step 3: Build and push Docker images
echo "🔨 Building and pushing Docker images..."

# Build and push backend
az acr build \
  --registry $ACR_NAME \
  --image flashcard-backend:latest \
  --file Dockerfile.backend \
  .

# Build and push frontend
az acr build \
  --registry $ACR_NAME \
  --image flashcard-frontend:latest \
  --file frontend/Dockerfile.frontend \
  ./frontend

# Step 4: Create Azure Database for PostgreSQL
echo "🗄️ Creating PostgreSQL database..."
az postgres flexible-server create \
  --resource-group $RESOURCE_GROUP_NAME \
  --name $POSTGRES_SERVER_NAME \
  --location $LOCATION \
  --admin-user flashcard_admin \
  --admin-password "$(openssl rand -base64 32)" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --version 15

# Create database
az postgres flexible-server db create \
  --resource-group $RESOURCE_GROUP_NAME \
  --server-name $POSTGRES_SERVER_NAME \
  --database-name flashcards

# Step 5: Create Azure Cache for Redis
echo "🔴 Creating Redis cache..."
az redis create \
  --resource-group $RESOURCE_GROUP_NAME \
  --name $REDIS_NAME \
  --location $LOCATION \
  --sku Basic \
  --vm-size c0

# Step 6: Create Key Vault
echo "🔐 Creating Key Vault..."
az keyvault create \
  --resource-group $RESOURCE_GROUP_NAME \
  --name $KEY_VAULT_NAME \
  --location $LOCATION

# Step 7: Create Container Apps Environment
echo "🌐 Creating Container Apps environment..."
az containerapp env create \
  --name $CONTAINER_APP_ENV_NAME \
  --resource-group $RESOURCE_GROUP_NAME \
  --location $LOCATION

# Step 8: Deploy Backend Container App
echo "⚡ Deploying backend container app..."
az containerapp create \
  --name $BACKEND_APP_NAME \
  --resource-group $RESOURCE_GROUP_NAME \
  --environment $CONTAINER_APP_ENV_NAME \
  --image $ACR_SERVER/flashcard-backend:latest \
  --registry-server $ACR_SERVER \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --target-port 8000 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 3 \
  --cpu 1.0 \
  --memory 2Gi \
  --env-vars \
    ENVIRONMENT=production \
    PYTHONUNBUFFERED=1 \
    WEBSITES_PORT=8000

# Get backend URL
BACKEND_URL=$(az containerapp show \
  --name $BACKEND_APP_NAME \
  --resource-group $RESOURCE_GROUP_NAME \
  --query properties.configuration.ingress.fqdn \
  --output tsv)

# Step 9: Deploy Frontend Container App
echo "🎨 Deploying frontend container app..."
az containerapp create \
  --name $FRONTEND_APP_NAME \
  --resource-group $RESOURCE_GROUP_NAME \
  --environment $CONTAINER_APP_ENV_NAME \
  --image $ACR_SERVER/flashcard-frontend:latest \
  --registry-server $ACR_SERVER \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --target-port 80 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 3 \
  --cpu 0.5 \
  --memory 1Gi \
  --env-vars \
    REACT_APP_API_URL=https://$BACKEND_URL \
    WEBSITES_PORT=80

# Get frontend URL
FRONTEND_URL=$(az containerapp show \
  --name $FRONTEND_APP_NAME \
  --resource-group $RESOURCE_GROUP_NAME \
  --query properties.configuration.ingress.fqdn \
  --output tsv)

# Step 10: Configure secrets and environment variables
echo "🔧 Configuring secrets..."

# Add secrets to the backend container app
az containerapp secret set \
  --name $BACKEND_APP_NAME \
  --resource-group $RESOURCE_GROUP_NAME \
  --secrets \
    gemini-api-key=YOUR_GEMINI_API_KEY \
    jwt-secret=YOUR_JWT_SECRET \
    postgres-connection=$(az postgres flexible-server show-connection-string --server-name $POSTGRES_SERVER_NAME --database-name flashcards --admin-user flashcard_admin --admin-password YOUR_POSTGRES_PASSWORD --query connectionString --output tsv)

# Update backend with secrets
az containerapp update \
  --name $BACKEND_APP_NAME \
  --resource-group $RESOURCE_GROUP_NAME \
  --set-env-vars \
    GEMINI_API_KEY=secretref:gemini-api-key \
    JWT_SECRET_KEY=secretref:jwt-secret \
    DATABASE_URL=secretref:postgres-connection

echo "✅ Deployment completed!"
echo ""
echo "📋 Deployment Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Frontend URL: https://$FRONTEND_URL"
echo "⚡ Backend URL:  https://$BACKEND_URL"
echo "🗄️ PostgreSQL:   $POSTGRES_SERVER_NAME.postgres.database.azure.com"
echo "🔴 Redis:        $REDIS_NAME.redis.cache.windows.net"
echo "🔐 Key Vault:    https://$KEY_VAULT_NAME.vault.azure.net/"
echo "🐳 Registry:     $ACR_SERVER"
echo ""
echo "🔧 Next Steps:"
echo "1. Update your Gemini API key in Azure Key Vault"
echo "2. Configure OAuth credentials"
echo "3. Set up custom domain (optional)"
echo "4. Configure Application Insights for monitoring"
echo "5. Set up CI/CD pipeline"
echo ""
echo "💡 Useful Commands:"
echo "• View logs: az containerapp logs show --name $BACKEND_APP_NAME --resource-group $RESOURCE_GROUP_NAME --follow"
echo "• Scale app: az containerapp update --name $BACKEND_APP_NAME --resource-group $RESOURCE_GROUP_NAME --min-replicas 2 --max-replicas 5"
echo "• Update image: az containerapp update --name $BACKEND_APP_NAME --resource-group $RESOURCE_GROUP_NAME --image $ACR_SERVER/flashcard-backend:new-tag"