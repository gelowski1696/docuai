# Multi-Database Setup

DocuAI supports two runtime modes:
- **SQLite + JWT** (default and primary)
- **PostgreSQL + Supabase** (optional fallback)

## SQLite Mode (Default)
Set in `.env`:
```env
DATABASE_PROVIDER="sqlite"
DATABASE_URL="file:./dev.db"
JWT_SECRET="replace-with-a-long-random-secret"
```

Then run:
```bash
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
```

Authentication in this mode:
- `POST /api/auth/register` stores hashed password in SQLite
- `POST /api/auth/login` sets JWT `auth-token` cookie

## PostgreSQL + Supabase Mode (Optional)
Set in `.env`:
```env
DATABASE_PROVIDER="postgresql"
DATABASE_URL_POSTGRES="postgresql://..."
DATABASE_URL_POSTGRES_POOLER="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://<project>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon-key>"
SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
SESSION_TIMEOUT_MINUTES="480"
```

Then switch schema and generate client:
```bash
npm run db:postgres
npx prisma generate
npx prisma db push
```

Authentication in this mode:
- Supabase auth flow remains available
- App session cookie is `app-session`

## Switching Commands
- `npm run db:sqlite`
- `npm run db:postgres`

`scripts/switch-db.js` rewrites:
- `prisma/schema.prisma` datasource
- relevant env keys in `.env`

## Important Notes
- Data is not synced automatically between modes.
- Re-run `npx prisma generate` after mode switch.
- Rotate secrets before production if any were previously exposed.
