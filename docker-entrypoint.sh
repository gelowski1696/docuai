#!/bin/sh
set -e

echo "🚀 Starting DocuAI application..."

# Check if database exists
if [ ! -f /app/data/dev.db ]; then
  echo "📦 Database not found. Creating database and schema..."
  cd /app
  node_modules/.bin/prisma db push --accept-data-loss
  
  echo "🌱 Seeding database with users and templates..."
  node prisma/seed.js
else
  echo "✅ Database found. Syncing schema..."
  cd /app
  node_modules/.bin/prisma db push --accept-data-loss
fi

echo "✅ Database ready!"
echo "🌐 Starting Next.js server..."

# Start the Next.js application
exec node server.js
