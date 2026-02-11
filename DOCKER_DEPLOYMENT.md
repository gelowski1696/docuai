# Docker Deployment Guide (Ubuntu 24.04 VPS)

## Deployment Mode
This guide targets:
- SQLite database
- JWT auth
- Docker named volumes for persistent DB and files
- HTTPS access through reverse proxy

## Prerequisites
- Ubuntu 24.04 LTS VPS
- Docker Engine + Docker Compose plugin installed
- Domain name pointing to VPS
- Nginx or Caddy for TLS termination

## 1) Configure Environment
Use `.env.docker` (already referenced by `docker-compose.yml`).

Required:
- `DATABASE_PROVIDER=sqlite`
- `DATABASE_URL=file:/app/data/dev.db`
- `JWT_SECRET=<long-random-secret>`
- `AI_PROVIDER=<ollama|openai|gemini>`
- Provider API key(s)

Optional (only for fallback postgres mode):
- `DATABASE_URL_POSTGRES`
- `DATABASE_URL_POSTGRES_POOLER`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 2) Start Services
```bash
docker compose up -d --build
docker compose ps
docker compose logs -f
```

Container startup automatically:
- creates/syncs SQLite schema (`prisma db push`)
- seeds initial data on first run

## 3) Persistent Data
Two named volumes are used:
- `docuai-data` -> `/app/data` (SQLite DB)
- `docuai-uploads` -> `/app/uploads` (generated documents)

Data survives container restarts and image rebuilds.

## 4) Backups
### Backup DB
```bash
docker cp docuai-app:/app/data/dev.db ./backup-dev.db
```

### Restore DB
```bash
docker cp ./backup-dev.db docuai-app:/app/data/dev.db
docker compose restart
```

### Backup uploads
```bash
docker cp docuai-app:/app/uploads ./backup-uploads
```

### Restore uploads
```bash
docker cp ./backup-uploads/. docuai-app:/app/uploads
docker compose restart
```

## 5) Reverse Proxy + HTTPS
Run DocuAI on internal port `3000` and terminate TLS at Nginx/Caddy.

Production cookie behavior expects HTTPS (`secure` cookies enabled in production mode).

## 6) Health Check
App exposes `GET /api/health`.

Check container health:
```bash
docker inspect --format='{{.State.Health.Status}}' docuai-app
```

## 7) Common Operations
```bash
docker compose restart
docker compose down
docker compose up -d --build
docker compose exec docuai sh
```

## 8) Security Checklist
- Rotate `JWT_SECRET` before going live.
- Rotate any previously exposed Supabase/JWT/API secrets.
- Keep `.env`/`.env.docker` out of Git.
- Expose only reverse proxy ports publicly.
