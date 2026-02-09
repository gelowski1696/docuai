# Quick Docker Deployment Guide

## For Testing on Another Computer

### 1. Copy Files

Copy your entire project folder to the target computer, including:
- ✅ `.env` file (contains your API keys and settings)
- ✅ All project files

### 2. Run Docker

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f
```

### 3. Access Application

Open browser: `http://localhost:3000`

**Login:**
- Email: `admin@docuai.com`
- Password: `admin123`

## That's It!

The Docker container will:
- ✅ Use your existing `.env` configuration
- ✅ Create SQLite database automatically
- ✅ Seed admin account
- ✅ Start the application

## Stop Container

```bash
docker-compose down
```

## View Logs

```bash
docker-compose logs -f
```

## Rebuild After Changes

```bash
docker-compose up -d --build
```

---

**Note:** Your `.env` file contains all your API keys and settings, so the Docker container will work exactly like your local setup!
