# Quick Reference: Docker Commands

## Build & Run

```bash
# Build and start (detached mode)
docker-compose up -d --build

# Start without building
docker-compose up -d

# Stop
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Restart
docker-compose restart
```

## Logs & Monitoring

```bash
# View logs (follow mode)
docker-compose logs -f

# View logs for specific service
docker-compose logs -f app

# View last 100 lines
docker-compose logs --tail=100

# Check container status
docker-compose ps

# Check health status
docker ps
```

## Direct Docker Commands

```bash
# Build image
docker build -t noname:latest .

# Run container
docker run -d \
  --name noname-app \
  -p 8089:8089 \
  --restart unless-stopped \
  noname:latest

# Stop container
docker stop noname-app

# Start container
docker start noname-app

# Remove container
docker rm noname-app

# View logs
docker logs -f noname-app

# Execute command in container
docker exec -it noname-app sh

# Inspect container
docker inspect noname-app
```

## Publishing to Docker Hub

```bash
# Login
docker login

# Tag image
docker tag noname:latest YOUR_USERNAME/noname:latest
docker tag noname:latest YOUR_USERNAME/noname:v1.11.0

# Push to Docker Hub
docker push YOUR_USERNAME/noname:latest
docker push YOUR_USERNAME/noname:v1.11.0

# Pull from Docker Hub
docker pull YOUR_USERNAME/noname:latest
```

## Cleanup

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove all unused resources
docker system prune

# Remove all (including volumes)
docker system prune -a --volumes
```

## Debugging

```bash
# Enter container shell
docker exec -it noname-app sh

# Check processes
docker top noname-app

# View resource usage
docker stats noname-app

# View container details
docker inspect noname-app | less
```

## Network

```bash
# List networks
docker network ls

# Inspect network
docker network inspect noname_default

# Check container IP
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' noname-app
```

## Health Check

```bash
# Manual health check
curl http://localhost:8089/

# Check health status in docker ps
docker ps --filter "name=noname-app" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

## Environment Specific

### Development
```bash
# Build without cache
docker-compose build --no-cache

# Run in foreground (see output)
docker-compose up

# Scale services (if applicable)
docker-compose up -d --scale app=2
```

### Production
```bash
# Build with specific tag
docker build -t noname:production .

# Run with custom port
docker run -d \
  --name noname-app \
  -p 443:8089 \
  -e NODE_ENV=production \
  --restart always \
  noname:production

# View production logs
docker logs --since 1h noname-app
```

## Troubleshooting

```bash
# Check if port is in use
lsof -i :8089

# Rebuild everything
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d

# View build output
docker-compose build --progress=plain

# Check disk usage
docker system df

# Clean up and start fresh
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

## Testing

```bash
# Test build
docker build -t noname:test .

# Test run (remove after stop)
docker run --rm -p 8089:8089 noname:test

# Interactive test
docker run -it --rm noname:test sh

# Test with different command
docker run --rm -p 8089:8089 noname:test --help
```

## Multi-Platform Build (for Docker Hub)

```bash
# Create builder
docker buildx create --name multiplatform --use

# Build for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t YOUR_USERNAME/noname:latest \
  --push .
```

## Quick URLs

- Application: http://localhost:8089
- WebSocket: ws://localhost:8089
- Health Check: http://localhost:8089/
- Docker Hub: https://hub.docker.com

## Common Issues & Solutions

### Port already in use
```bash
# Find process using port
lsof -ti:8089

# Kill process
kill $(lsof -ti:8089)
```

### Container won't start
```bash
# Check logs
docker logs noname-app

# Check last exit code
docker inspect noname-app --format='{{.State.ExitCode}}'
```

### Permission denied
```bash
# Check file permissions
docker exec noname-app ls -la /app

# Fix ownership (if needed)
docker exec -u root noname-app chown -R nodejs:nodejs /app
```

### Out of disk space
```bash
# Clean up
docker system prune -a --volumes

# Check sizes
docker system df -v
```
