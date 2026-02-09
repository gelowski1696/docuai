#!/usr/bin/env node
/**
 * Database Switcher Script
 *
 * Usage:
 *   npm run db:sqlite   - Switch to SQLite
 *   npm run db:postgres - Switch to PostgreSQL (Supabase)
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const dbType = args[0];

if (!dbType || !['sqlite', 'postgres'].includes(dbType)) {
  console.error('Usage: node switch-db.js [sqlite|postgres]');
  process.exit(1);
}

const repoRoot = path.join(__dirname, '..');
const schemaPath = path.join(repoRoot, 'prisma', 'schema.prisma');
const postgresSchemaPath = path.join(repoRoot, 'prisma', 'schema.postgres.prisma');
const envPath = path.join(repoRoot, '.env');

function setEnvVar(content, key, value) {
  const line = `${key}="${value}"`;
  const re = new RegExp(`^${key}=.*$`, 'm');
  if (re.test(content)) return content.replace(re, line);
  return `${content.trimEnd()}\n${line}\n`;
}

function getEnvVar(content, key) {
  const re = new RegExp(`^${key}="([^"]*)"$`, 'm');
  const match = content.match(re);
  return match ? match[1] : null;
}

if (!fs.existsSync(envPath)) {
  console.error('.env file not found. Create it before switching database modes.');
  process.exit(1);
}

if (!fs.existsSync(schemaPath)) {
  console.error('prisma/schema.prisma not found.');
  process.exit(1);
}

let envContent = fs.readFileSync(envPath, 'utf8');

if (dbType === 'sqlite') {
  console.log('?? Switching to SQLite...');

  envContent = setEnvVar(envContent, 'DATABASE_PROVIDER', 'sqlite');
  envContent = setEnvVar(envContent, 'DATABASE_URL', 'file:./dev.db');

  // Ensure datasource block is sqlite-compatible even if no schema.sqlite template exists.
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  const updatedSchema = schemaContent.replace(
    /datasource\s+db\s*\{[\s\S]*?\}/m,
    `datasource db {\n  provider = "sqlite"\n  url      = env("DATABASE_URL")\n}`
  );

  fs.writeFileSync(schemaPath, updatedSchema);
  fs.writeFileSync(envPath, envContent);

  console.log('? Switched to SQLite');
  console.log('?? DATABASE_URL set to: file:./dev.db');
  console.log('?? schema.prisma datasource set to sqlite');
  console.log('\n?? Next steps:');
  console.log('   npx prisma generate');
  console.log('   npx prisma migrate dev --name switch_to_sqlite');
  process.exit(0);
}

// postgres mode
console.log('?? Switching to PostgreSQL (Supabase)...');

if (!fs.existsSync(postgresSchemaPath)) {
  console.error('prisma/schema.postgres.prisma not found. Cannot switch to postgres mode.');
  process.exit(1);
}

const poolerUrl = getEnvVar(envContent, 'DATABASE_URL_POSTGRES_POOLER');
const directUrl = getEnvVar(envContent, 'DATABASE_URL_POSTGRES');

if (!poolerUrl && !directUrl) {
  console.error('? Missing DB URLs. Set DATABASE_URL_POSTGRES_POOLER (preferred) or DATABASE_URL_POSTGRES in .env');
  process.exit(1);
}

const chosenPooler = poolerUrl || directUrl;
const normalizedPooler = chosenPooler.includes('sslmode=')
  ? chosenPooler
  : `${chosenPooler}${chosenPooler.includes('?') ? '&' : '?'}sslmode=require`;

// Keep DATABASE_URL for backwards compatibility with scripts expecting it.
envContent = setEnvVar(envContent, 'DATABASE_PROVIDER', 'postgresql');
envContent = setEnvVar(envContent, 'DATABASE_URL', normalizedPooler);
envContent = setEnvVar(envContent, 'DATABASE_URL_POSTGRES_POOLER', normalizedPooler);

if (directUrl) {
  const normalizedDirect = directUrl.includes('sslmode=')
    ? directUrl
    : `${directUrl}${directUrl.includes('?') ? '&' : '?'}sslmode=require`;
  envContent = setEnvVar(envContent, 'DATABASE_URL_POSTGRES', normalizedDirect);
} else {
  // If only pooler was provided, keep direct var aligned to avoid Prisma env validation failures.
  envContent = setEnvVar(envContent, 'DATABASE_URL_POSTGRES', normalizedPooler);
}

const postgresSchema = fs.readFileSync(postgresSchemaPath, 'utf8');
fs.writeFileSync(schemaPath, postgresSchema);
fs.writeFileSync(envPath, envContent);

console.log('? Switched to PostgreSQL (Supabase)');
console.log('?? DATABASE_URL / DATABASE_URL_POSTGRES_POOLER updated');
console.log('?? schema.prisma updated to postgres template');
console.log('\n?? Next steps:');
console.log('   npx prisma generate');
console.log('   npx prisma db push');
