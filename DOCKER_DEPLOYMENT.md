# Docker Deployment Guide

## Quick Start

### Prerequisites
- Docker installed ([Get Docker](https://docs.docker.com/get-docker/))
- Docker Compose installed (included with Docker Desktop)

### 1. Build and Run

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f
```

The application will be available at `http://localhost:3000`

### 2. First-Time Setup

The container automatically:
- ✅ Creates the SQLite database
- ✅ Runs migrations
- ✅ Seeds admin account

**Default Login:**
- Email: `admin@docuai.com`
- Password: `admin123`

## Configuration

### Environment Variables

Edit `docker-compose.yml` to configure:

```yaml
environment:
  # JWT Secret (CHANGE THIS!)
  - JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
  
  # AI Provider Keys
  - OPENAI_API_KEY=your-key-here
  - GEMINI_API_KEY=your-key-here
```

### Port Configuration

To use a different port, edit `docker-compose.yml`:

```yaml
ports:
  - "8080:3000"  # Access on port 8080
```

## Common Commands

```bash
# Start container
docker-compose up -d

# Stop container
docker-compose down

# View logs
docker-compose logs -f

# Restart container
docker-compose restart

# Rebuild after code changes
docker-compose up -d --build

# Access container shell
docker-compose exec docuai sh

# Seed database manually
docker-compose exec docuai npx tsx prisma/seed-sqlite.ts
```

## Data Persistence

The SQLite database is stored in a Docker volume named `docuai-data`. This ensures your data persists even if you:
- Stop the container
- Remove the container
- Rebuild the image

### Backup Database

```bash
# Copy database from container
docker cp docuai-app:/app/data/dev.db ./backup.db
```

### Restore Database

```bash
# Copy database to container
docker cp ./backup.db docuai-app:/app/data/dev.db

# Restart container
docker-compose restart
```

## Deployment to Another Computer

### Method 1: Using Docker Compose (Recommended)

1. Copy these files to the target computer:
   - `Dockerfile`
   - `docker-compose.yml`
   - `.dockerignore`
   - `docker-entrypoint.sh`
   - Entire project directory

2. Run:
   ```bash
   docker-compose up -d
   ```

### Method 2: Using Docker Image

1. Build and save image:
   ```bash
   docker build -t docuai:latest .
   docker save docuai:latest > docuai-image.tar
   ```

2. Transfer `docuai-image.tar` to target computer

3. Load and run:
   ```bash
   docker load < docuai-image.tar
   docker run -d -p 3000:3000 -v docuai-data:/app/data docuai:latest
   ```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs

# Check container status
docker-compose ps
```

### Database issues

```bash
# Reset database (WARNING: deletes all data)
docker-compose down -v
docker-compose up -d
```

### Port already in use

```bash
# Use different port in docker-compose.yml
ports:
  - "3001:3000"
```

### Can't login

```bash
# Reseed database
docker-compose exec docuai npx tsx prisma/seed-sqlite.ts
```

## Production Recommendations

1. **Change JWT_SECRET**: Use a strong random string
2. **Use HTTPS**: Put behind a reverse proxy (nginx, Caddy)
3. **Regular Backups**: Backup the database volume regularly
4. **Resource Limits**: Add resource limits in docker-compose.yml:
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '1'
         memory: 1G
   ```

## Health Check

The container includes a health check endpoint at `/api/health`. Docker automatically monitors this to ensure the application is running properly.

Check health status:
```bash
docker inspect --format='{{.State.Health.Status}}' docuai-app
```
