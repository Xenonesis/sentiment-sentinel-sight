# 🚀 Deployment Guide

## Overview

This guide covers deployment options for Sentinel Sight, from local development to production environments. The application is built with React + TypeScript and can be deployed to various platforms.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Local Development](#local-development)
- [Production Build](#production-build)
- [Deployment Platforms](#deployment-platforms)
- [Environment Variables](#environment-variables)
- [Performance Optimization](#performance-optimization)
- [Monitoring & Analytics](#monitoring--analytics)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher (or yarn/pnpm equivalent)
- **Git**: Latest version
- **Modern Browser**: Chrome 90+, Firefox 88+, Safari 14+

### Development Tools
- **Code Editor**: VS Code (recommended)
- **Terminal**: Command line interface
- **Browser DevTools**: For debugging and testing

## Environment Configuration

### Development Environment
```bash
# Clone the repository
git clone <repository-url>
cd sentinel-sight

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Files
Create environment files for different stages:

```bash
# .env.local (for local development)
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_APP_ENV=development
VITE_API_BASE_URL=http://localhost:3000

# .env.production (for production)
VITE_GEMINI_API_KEY=your_production_gemini_api_key
VITE_APP_ENV=production
VITE_API_BASE_URL=https://api.sentinelsight.ai
```

## Local Development

### Quick Start
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### Development Features
- **Hot Module Replacement**: Instant updates during development
- **TypeScript Support**: Full type checking and IntelliSense
- **ESLint Integration**: Code quality and consistency
- **Tailwind CSS**: Utility-first styling with JIT compilation

### Development Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run build:dev    # Build for development
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

## Production Build

### Build Process
```bash
# Create optimized production build
npm run build

# Preview the build locally
npm run preview
```

### Build Output
```
dist/
├── assets/
│   ├── index-[hash].js     # Main application bundle
│   ├── index-[hash].css    # Compiled styles
│   └── vendor-[hash].js    # Third-party dependencies
├── index.html              # Main HTML file
└── favicon.svg             # Application icon
```

### Build Optimization
- **Code Splitting**: Automatic vendor and app bundle separation
- **Tree Shaking**: Unused code elimination
- **Asset Optimization**: Image and font optimization
- **Minification**: JavaScript and CSS compression
- **Gzip Compression**: Reduced file sizes

## Deployment Platforms

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Production deployment
vercel --prod
```

**Vercel Configuration** (`vercel.json`):
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "env": {
    "VITE_GEMINI_API_KEY": "@gemini-api-key"
  }
}
```

### Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy to Netlify
netlify deploy

# Production deployment
netlify deploy --prod
```

**Netlify Configuration** (`netlify.toml`):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### GitHub Pages
```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts
"deploy": "gh-pages -d dist"

# Deploy
npm run build
npm run deploy
```

### Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Docker Compose** (`docker-compose.yml`):
```yaml
version: '3.8'
services:
  sentinel-sight:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_GEMINI_API_KEY=${GEMINI_API_KEY}
    restart: unless-stopped
```

### AWS S3 + CloudFront
```bash
# Build the application
npm run build

# Upload to S3 bucket
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## Environment Variables

### Required Variables
```bash
VITE_GEMINI_API_KEY=your_gemini_api_key    # Google Gemini API key
```

### Optional Variables
```bash
VITE_APP_ENV=production                     # Environment identifier
VITE_API_BASE_URL=https://api.example.com  # API base URL
VITE_ANALYTICS_ID=GA_MEASUREMENT_ID        # Google Analytics ID
VITE_SENTRY_DSN=your_sentry_dsn           # Error tracking
```

### Security Best Practices
- Never commit API keys to version control
- Use environment-specific configuration files
- Rotate API keys regularly
- Implement proper CORS policies
- Use HTTPS in production

## Performance Optimization

### Bundle Analysis
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist
```

### Optimization Techniques
- **Lazy Loading**: Route-based code splitting
- **Image Optimization**: WebP format and responsive images
- **Caching**: Browser caching and CDN integration
- **Compression**: Gzip and Brotli compression
- **Preloading**: Critical resource preloading

### Performance Monitoring
```javascript
// Web Vitals monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

## Monitoring & Analytics

### Error Tracking
```javascript
// Sentry integration
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_APP_ENV,
});
```

### Analytics Integration
```javascript
// Google Analytics 4
import { gtag } from 'ga-gtag';

gtag('config', import.meta.env.VITE_ANALYTICS_ID);
```

### Health Checks
```javascript
// Health check endpoint
const healthCheck = {
  status: 'healthy',
  timestamp: new Date().toISOString(),
  version: '0.11.0',
  environment: import.meta.env.VITE_APP_ENV
};
```

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version  # Should be 18+
```

#### Environment Variable Issues
```bash
# Verify environment variables
echo $VITE_GEMINI_API_KEY

# Check .env file format
cat .env.local
```

#### Memory Issues
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

#### CORS Issues
```javascript
// Vite proxy configuration
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
});
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# Verbose build output
npm run build -- --verbose
```

### Performance Issues
- Check bundle size with analyzer
- Optimize images and assets
- Implement lazy loading
- Use production build for testing
- Monitor Core Web Vitals

## Deployment Checklist

### Pre-deployment
- [ ] Run tests and linting
- [ ] Verify environment variables
- [ ] Test production build locally
- [ ] Check bundle size and performance
- [ ] Validate API integrations

### Post-deployment
- [ ] Verify application loads correctly
- [ ] Test core functionality
- [ ] Check error tracking
- [ ] Monitor performance metrics
- [ ] Validate analytics integration

### Security Checklist
- [ ] HTTPS enabled
- [ ] API keys secured
- [ ] CORS properly configured
- [ ] Content Security Policy set
- [ ] Error messages sanitized

## Support

For deployment issues:
- Check the [troubleshooting section](#troubleshooting)
- Review platform-specific documentation
- Contact the development team
- Submit issues on GitHub

---

**Happy Deploying! 🚀**