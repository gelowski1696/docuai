# Deployment Guide

DocuAI is designed to be easily deployed to modern cloud platforms like [Vercel](https://vercel.com/) and [Railway](https://railway.app/).

## 🐘 Database Selection
While the development environment uses SQLite, it is highly recommended to use **PostgreSQL** for production.

1. **Update `schema.prisma`**:
   Change the provider to `postgresql`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **Set up PostgreSQL**:
   Provision a database on Railway or Supabase and get the `DATABASE_URL` connection string.

## 🌐 Deploy to Vercel

1. **Push to GitHub**:
   Push your repository to GitHub.

2. **Connect to Vercel**:
   - Create a new project on Vercel and link your repository.
   - Add the necessary Environment Variables (see README.md).

3. **Build Settings**:
   Vercel will automatically detect Next.js. Ensure the build command is `npm run build`.

## ⚙️ Environment Variables Checklist
Ensure all these are set in your production environment:
- `DATABASE_URL` (PostgreSQL)
- `JWT_SECRET`
- `AI_PROVIDER` (Set to `openai` or `gemini`)
- `OPENAI_API_KEY` (if using OpenAI)
- `GOOGLE_API_KEY` (if using Google)

## 🏗️ Post-Deployment Seeding
To seed your production database with initial templates:
```bash
npx prisma generate
npx tsx prisma/seed.ts
```
