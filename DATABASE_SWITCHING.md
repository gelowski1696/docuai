# Multi-Database Setup

DocuAI now supports both SQLite and PostgreSQL (Supabase) databases. You can switch between them using an environment variable.

## Switching Databases

### Use SQLite (Default for Development)

In your `.env` file:
```env
DATABASE_PROVIDER="sqlite"
DATABASE_URL="file:./dev.db"
```

Then run:
```bash
npx prisma generate
npx prisma migrate dev
```

### Use PostgreSQL (Supabase)

1. Set up Supabase (see [supabase_setup_guide.md](file:///C:/Users/User/.gemini/antigravity/brain/0d2b3452-879b-47ed-86ee-6b1f2a251145/supabase_setup_guide.md))

2. In your `.env` file:
```env
DATABASE_PROVIDER="postgresql"
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres"
```

3. Then run:
```bash
npx prisma generate
npx prisma migrate dev
```

## Authentication Modes

### SQLite Mode
- Uses Supabase Auth for authentication
- Stores user profiles in local SQLite database
- Best for: Local development, testing

### PostgreSQL Mode
- Uses Supabase Auth for authentication
- Stores user profiles in Supabase PostgreSQL
- Best for: Production, staging, team development

## Important Notes

> [!IMPORTANT]
> When switching between databases, you need to run `npx prisma generate` to regenerate the Prisma client for the new database provider.

> [!WARNING]
> Data is NOT automatically synced between SQLite and PostgreSQL. They are separate databases.

## Quick Switch Commands

**Switch to SQLite:**
```bash
# Update .env: DATABASE_PROVIDER="sqlite"
npx prisma generate
npx prisma migrate dev
```

**Switch to PostgreSQL:**
```bash
# Update .env: DATABASE_PROVIDER="postgresql"
npx prisma generate
npx prisma migrate dev
```
