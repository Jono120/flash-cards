# Azure Container Apps Configuration
# This file contains Azure-specific configuration and documentation

## Overview
This configuration deploys the AI Flashcard application to Azure Container Apps with:
- Azure Database for PostgreSQL (managed database)
- Azure Cache for Redis (managed cache)
- Azure Container Registry (for Docker images)
- Azure Key Vault (for secrets management)
- Application Insights (for monitoring)

## Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │
│ (Container App) │────│ (Container App) │
└─────────────────┘    └─────────────────┘
                              │
                              ├─── Azure Database for PostgreSQL
                              ├─── Azure Cache for Redis
                              ├─── Azure Key Vault
                              └─── Azure Storage (file uploads)
```

## Deployment Options

### Option 1: Automated Deployment (Recommended)
```bash
# Linux/macOS
chmod +x azure/deploy.sh
./azure/deploy.sh

# Windows PowerShell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\azure\deploy.ps1
```

### Option 2: Manual Deployment
Use the Azure Portal or Azure CLI following the deployment guide below.

### Option 3: Infrastructure as Code
Use the provided Bicep templates in the `infra/` directory (if available).

## Prerequisites

1. **Azure CLI** - Install from https://docs.microsoft.com/en-us/cli/azure/install-azure-cli
2. **Azure Subscription** - Active Azure subscription
3. **Permissions** - Contributor role on the subscription or resource group
4. **Docker** - For local testing (optional)

## Configuration Steps

### 1. Environment Variables
Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
# Edit .env with your specific values
```

### 2. Azure Resources
The deployment script creates these resources:
- Resource Group
- Azure Container Registry
- Azure Database for PostgreSQL Flexible Server
- Azure Cache for Redis
- Azure Key Vault
- Container Apps Environment
- Backend Container App
- Frontend Container App

### 3. Secrets Management
After deployment, update these secrets in Azure Key Vault:
- Gemini API Key
- JWT Secret Key
- OAuth credentials (Apple, Google, etc.)
- Database passwords

### 4. Custom Domain (Optional)
To use a custom domain:
1. Configure DNS records to point to the Container App FQDN
2. Add custom domain in Azure Portal
3. Configure SSL certificate

## Scaling Configuration

### Auto-scaling Rules
```yaml
Backend:
  min_replicas: 1
  max_replicas: 10
  scale_rules:
    - http_concurrent_requests: 100
    - cpu_percentage: 70
    - memory_percentage: 80

Frontend:
  min_replicas: 1
  max_replicas: 5
  scale_rules:
    - http_concurrent_requests: 200
    - cpu_percentage: 60
```

### Manual Scaling
```bash
# Scale backend
az containerapp update \
  --name flashcard-backend \
  --resource-group rg-flashcard-app \
  --min-replicas 2 \
  --max-replicas 5

# Scale frontend
az containerapp update \
  --name flashcard-frontend \
  --resource-group rg-flashcard-app \
  --min-replicas 2 \
  --max-replicas 3
```

## Monitoring and Logging

### Application Insights
The deployment includes Application Insights for:
- Request tracking
- Error monitoring
- Performance metrics
- Custom telemetry

### Container Logs
```bash
# View backend logs
az containerapp logs show \
  --name flashcard-backend \
  --resource-group rg-flashcard-app \
  --follow

# View frontend logs
az containerapp logs show \
  --name flashcard-frontend \
  --resource-group rg-flashcard-app \
  --follow
```

### Health Checks
Both containers include health check endpoints:
- Backend: `https://your-backend.azurecontainerapps.io/health`
- Frontend: `https://your-frontend.azurecontainerapps.io/health`

## Security Best Practices

### 1. Managed Identity
Use Azure Managed Identity instead of service principals:
```bash
az containerapp identity assign \
  --name flashcard-backend \
  --resource-group rg-flashcard-app \
  --system-assigned
```

### 2. Key Vault Integration
Store secrets in Azure Key Vault and reference them:
```bash
az containerapp secret set \
  --name flashcard-backend \
  --resource-group rg-flashcard-app \
  --secrets gemini-api-key=keyvaultref:your-keyvault-uri,secretname
```

### 3. Network Security
- Container Apps run in a secure, isolated environment
- Use private endpoints for database connections
- Configure IP restrictions if needed

### 4. SSL/TLS
- Container Apps automatically provide SSL certificates
- Custom domains require certificate configuration

## Cost Optimization

### 1. Resource Sizing
- Start with smaller CPU/memory allocations
- Monitor and adjust based on usage
- Use burstable instances for variable workloads

### 2. Auto-scaling
- Set appropriate min/max replica counts
- Use scale-to-zero for development environments
- Configure CPU/memory-based scaling rules

### 3. Database Optimization
- Use Burstable tier for development
- General Purpose for production
- Consider read replicas for high-traffic scenarios

## Troubleshooting

### Common Issues

1. **Container Won't Start**
   ```bash
   # Check logs
   az containerapp logs show --name flashcard-backend --resource-group rg-flashcard-app
   ```

2. **Database Connection Issues**
   - Verify connection string in Key Vault
   - Check PostgreSQL firewall rules
   - Ensure Container Apps can access the database

3. **Environment Variables**
   ```bash
   # List environment variables
   az containerapp show --name flashcard-backend --resource-group rg-flashcard-app --query properties.configuration.activeRevisionsMode
   ```

4. **Image Pull Issues**
   - Verify ACR credentials
   - Check image exists in registry
   - Ensure proper RBAC permissions

### Performance Issues
- Monitor Application Insights metrics
- Check resource utilization
- Review scaling rules
- Optimize database queries

## CI/CD Integration

### GitHub Actions Example
See `.github/workflows/azure-container-apps.yml` for automated deployment pipeline.

### Azure DevOps
Use Azure DevOps pipelines for enterprise deployments with approval processes.

## Backup and Disaster Recovery

### Database Backup
- Azure Database for PostgreSQL provides automatic backups
- Configure point-in-time restore
- Consider cross-region backup for critical data

### Application Backup
- Container images stored in Azure Container Registry
- Configuration stored in Azure Key Vault
- Use Infrastructure as Code for reproducible deployments

## Support and Maintenance

### Updates
1. Update container images
2. Test in staging environment
3. Deploy to production using blue-green deployment
4. Monitor application health

### Monitoring Checklist
- [ ] Application Insights configured
- [ ] Log aggregation working
- [ ] Health checks responding
- [ ] Scaling rules tested
- [ ] Backup procedures verified

For additional support, consult Azure documentation or create a support ticket.