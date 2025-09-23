# Coolify Deployment Guide

This guide will help you deploy the Otic Business application to Coolify.

## Prerequisites

1. **Coolify Instance**: Access to a Coolify instance
2. **Domain**: A domain name for your application
3. **Environment Variables**: All required environment variables configured

## Environment Variables

Set these environment variables in Coolify:

### Required Variables

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# QuickBooks Configuration
VITE_QB_CLIENT_ID=your_quickbooks_client_id
VITE_QB_CLIENT_SECRET=your_quickbooks_client_secret
VITE_QB_REDIRECT_URI=https://yourdomain.com/quickbooks/callback
VITE_QB_ENVIRONMENT=production
VITE_QB_COMPANY_ID=your_quickbooks_company_id

# Mistral AI Configuration
VITE_MISTRAL_API_KEY=your_mistral_api_key

# Admin API Configuration
VITE_ADMIN_API_SECRET=your_admin_api_secret
```

## Deployment Steps

### 1. Create New Application in Coolify

1. Log into your Coolify instance
2. Click "New Application"
3. Choose "Docker Compose" as the source
4. Connect your Git repository

### 2. Configure Repository

- **Repository URL**: `https://github.com/KING-EDWIN/otic-business.git`
- **Branch**: `main`
- **Docker Compose File**: `docker-compose.yml`
- **Dockerfile**: `Dockerfile`

### 3. Set Environment Variables

1. Go to the application settings
2. Navigate to "Environment Variables"
3. Add all the required variables listed above
4. Make sure to use your production domain for `VITE_QB_REDIRECT_URI`

### 4. Configure Domain

1. In Coolify, go to "Domains"
2. Add your domain name
3. Configure SSL certificate (Let's Encrypt recommended)

### 5. Deploy

1. Click "Deploy" in Coolify
2. Monitor the build logs
3. Wait for deployment to complete

## Post-Deployment Configuration

### 1. Update QuickBooks Redirect URI

1. Go to [Intuit Developer](https://developer.intuit.com/)
2. Navigate to your app settings
3. Update the redirect URI to: `https://yourdomain.com/quickbooks/callback`

### 2. Test the Application

1. Visit your domain
2. Test user registration and login
3. Test QuickBooks integration
4. Test all dashboard features

## Troubleshooting

### Common Issues

1. **Build Fails**: Check that all environment variables are set
2. **QuickBooks Connection Issues**: Verify redirect URI matches exactly
3. **Supabase Connection Issues**: Check URL and API key
4. **404 on Refresh**: This is normal for SPA - nginx is configured to handle it

### Logs

- View application logs in Coolify dashboard
- Check nginx logs for routing issues
- Monitor build logs for deployment issues

## Performance Optimization

### Nginx Configuration

The included `nginx.conf` provides:
- Gzip compression
- Static asset caching
- Security headers
- SPA routing support

### Docker Optimization

- Multi-stage build for smaller image size
- Alpine Linux for minimal footprint
- Nginx for efficient static file serving

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to Git
2. **HTTPS**: Always use HTTPS in production
3. **Headers**: Security headers are included in nginx config
4. **CORS**: Configure CORS properly for your domain

## Monitoring

### Health Check

The application includes a health check endpoint:
- URL: `https://yourdomain.com/health`
- Returns: `200 OK` with "healthy" message

### Coolify Monitoring

- Use Coolify's built-in monitoring
- Set up alerts for deployment failures
- Monitor resource usage

## Backup and Recovery

1. **Database**: Ensure Supabase backups are enabled
2. **Code**: Git repository serves as code backup
3. **Environment**: Document all environment variables

## Scaling

### Horizontal Scaling

1. In Coolify, increase replica count
2. Use load balancer for multiple instances
3. Ensure session storage is stateless

### Vertical Scaling

1. Increase CPU/memory allocation in Coolify
2. Monitor performance metrics
3. Adjust nginx worker processes if needed

## Support

For issues specific to this deployment:
1. Check Coolify logs
2. Verify environment variables
3. Test locally with same configuration
4. Check Supabase and QuickBooks service status
