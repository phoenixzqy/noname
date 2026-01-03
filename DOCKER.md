# Docker Deployment Guide

## Overview

This application is containerized and can be deployed using Docker. The web application, REST API, and WebSocket server all run on port 8089.

## Quick Start

### Using Docker Compose (Recommended)

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

The application will be available at:
- HTTP Server + WebSocket: `http://localhost:8089` / `ws://localhost:8089`

### Using Docker CLI

```bash
# Build the image
docker build -t noname:latest .

# Run the container
docker run -d \
  --name noname-app \
  -p 8089:8089 \
  --restart unless-stopped \
  noname:latest

# View logs
docker logs -f noname-app

# Stop the container
docker stop noname-app
docker rm noname-app
```

## Configuration

### Port Mapping

The application uses a single port for all services:
- **Port 8089**: HTTP/HTTPS server + WebSocket server

Example URLs:
- Web App (HTTP): `http://your-domain:8089`
- WebSocket (WS): `ws://your-domain:8089`
- Web App (HTTPS): `https://your-domain:8089` (with SSL)
- WebSocket (WSS): `wss://your-domain:8089` (with SSL)

### Environment Variables

You can customize the server using environment variables in `docker-compose.yml`:

```yaml
environment:
  - NODE_ENV=production
```

### Custom Configuration

You can override the default command in `docker-compose.yml`:

```yaml
# Use HTTPS with SSL certificates
command: ["--https", "--port", "8089", "--sslDir", "/app/ssl", "--server"]
```

## Publishing to Docker Hub

### Prerequisites

1. Create a Docker Hub account at https://hub.docker.com
2. Login to Docker Hub from your terminal:

```bash
docker login
```

### Build and Tag

```bash
# Build the image
docker build -t noname:latest .

# Tag for Docker Hub (replace YOUR_USERNAME with your Docker Hub username)
docker tag noname:latest YOUR_USERNAME/noname:latest
docker tag noname:latest YOUR_USERNAME/noname:v1.11.0
```

### Push to Docker Hub

```bash
# Push the latest tag
docker push YOUR_USERNAME/noname:latest

# Push the version tag
docker push YOUR_USERNAME/noname:v1.11.0
```

### Automated Publishing with GitHub Actions

Create `.github/workflows/docker-publish.yml`:

```yaml
name: Publish Docker Image

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: YOUR_USERNAME/noname
          tags: |
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=raw,value=latest,enable={{is_default_branch}}
      
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

**Important**: Add these secrets to your GitHub repository settings:
- `DOCKERHUB_USERNAME`: Your Docker Hub username
- `DOCKERHUB_TOKEN`: Docker Hub access token (create at https://hub.docker.com/settings/security)

### Pull and Run from Docker Hub

Once published, others can pull and run your image:

```bash
# Pull the image
docker pull YOUR_USERNAME/noname:latest

# Run the container
docker run -d -p 8089:8089 --name noname-app YOUR_USERNAME/noname:latest
```

## Production Deployment

### Using Reverse Proxy (Nginx)

For production deployments, use a reverse proxy like Nginx:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # HTTP traffic and WebSocket (same location)
    location / {
        proxy_pass http://localhost:8089;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket timeout settings
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
    }
}
```

### Docker Compose with Nginx

```yaml
version: "3.9"

services:
  app:
    build: .
    container_name: noname-app
    restart: unless-stopped
    environment:
      - NODE_ENV=production

  nginx:
    image: nginx:alpine
    container_name: noname-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    restart: unless-stopped
```

## Health Check

The Docker image includes a built-in health check. You can verify the container health:

```bash
docker ps
# Look for "healthy" status

# Manual health check
curl http://localhost:8089/
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker logs noname-app

# Check if port is already in use
lsof -i :8089
```

### WebSocket connection fails

1. Ensure the port is properly exposed
2. Check firewall settings
3. Verify WebSocket upgrade headers in reverse proxy configuration

### Permission denied errors

The container runs as a non-root user. Ensure any mounted volumes have correct permissions:

```bash
chown -R 1001:1001 /path/to/mounted/volume
```

## Advanced Configuration

### Using HTTPS with SSL

1. Generate SSL certificates:
```bash
npm run ssl:generate
```

2. Mount SSL directory:
```yaml
volumes:
  - ./ssl:/app/ssl:ro
command: ["--https", "--port", "443", "--sslDir", "/app/ssl", "--server"]
```

3. Update port mapping:
```yaml
ports:
  - "443:443"
```

## Support

For issues and questions:
- GitHub Issues: https://github.com/libnoname/noname/issues
- Documentation: See project README.md
