# DocuAI Next.js

DocuAI is a Next.js 16 application for AI-assisted document generation (PDF, DOCX, XLSX) with role-based access control.

## Stack
- Next.js 16 (App Router, Server Actions)
- Prisma + SQLite (default deployment mode)
- JWT cookie auth (`auth-token`) in SQLite mode
- Optional PostgreSQL + Supabase fallback mode

## Default Runtime Mode
Primary mode is **SQLite + JWT**:
- `DATABASE_PROVIDER=sqlite`
- `DATABASE_URL=file:./dev.db` (local) or `file:/app/data/dev.db` (Docker)
- `JWT_SECRET=<strong-random-secret>`

Supabase variables are optional and only needed when `DATABASE_PROVIDER=postgresql`.

## Local Development
1. Install dependencies:
```bash
npm install
```
2. Create `.env` from `.env.example` and set `JWT_SECRET`.
3. Initialize database:
```bash
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
```
4. Run:
```bash
npm run dev
```

## Docker (Ubuntu VPS target)
The compose setup runs with persistent named volumes:
- `docuai-data` -> `/app/data` (SQLite DB)
- `docuai-uploads` -> `/app/uploads` (generated files)

Use:
```bash
docker compose up -d --build
docker compose logs -f
```

Set production env in `.env.docker`:
- `JWT_SECRET` must be changed before production.
- `AI_PROVIDER` and its API key must be configured.

## Database Mode Switching
Use scripts:
- `npm run db:sqlite`
- `npm run db:postgres`

`db:postgres` rewrites `prisma/schema.prisma` from `prisma/schema.postgres.prisma` and expects Supabase/PostgreSQL variables.

## Security Notes
- Rotate any previously exposed secrets before deployment.
- Run behind HTTPS reverse proxy (Nginx/Caddy) on VPS so secure cookies are enforced in production.
