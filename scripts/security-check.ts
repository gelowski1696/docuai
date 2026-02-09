import { PrismaClient } from '@prisma/client';
import { signToken } from '../lib/auth/jwt';
import { canAccessDocument } from '../lib/authz/document-access';
import * as fs from 'fs/promises';
import * as path from 'path';

const prisma = new PrismaClient();
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const HEALTH_URL = `${BASE_URL}/api/health`;

function assertEqual(actual: unknown, expected: unknown, label: string) {
  if (actual !== expected) {
    throw new Error(`[FAIL] ${label}: expected ${expected}, got ${actual}`);
  }
  console.log(`[PASS] ${label}`);
}

function assertOneOf(actual: number, expected: number[], label: string) {
  if (!expected.includes(actual)) {
    throw new Error(`[FAIL] ${label}: expected one of ${expected.join(', ')}, got ${actual}`);
  }
  console.log(`[PASS] ${label}`);
}

async function requestStatusCode(url: string, authToken?: string) {
  const headers: Record<string, string> = {};
  if (authToken) {
    headers.Cookie = `auth-token=${authToken}`;
  }
  const res = await fetch(url, { headers });
  return res.status;
}

async function ensureServerReady() {
  const maxAttempts = 30;
  const delayMs = 1000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(HEALTH_URL);
      if (res.ok) {
        return;
      }
    } catch {
      // Keep retrying until max attempts is reached.
    }

    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  throw new Error(
    `DocuAI server is not reachable at ${BASE_URL}. Start the app first (e.g. "npm run dev"), then run "npm run security:check".`
  );
}

async function main() {
  console.log(`Running security checks against ${BASE_URL}`);
  await ensureServerReady();

  const [owner, other, admin] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'security-owner@docuai.local' },
      update: { role: 'USER' },
      create: {
        email: 'security-owner@docuai.local',
        password: 'not-used',
        role: 'USER',
        subscriptionTier: 'FREE',
      },
    }),
    prisma.user.upsert({
      where: { email: 'security-other@docuai.local' },
      update: { role: 'USER' },
      create: {
        email: 'security-other@docuai.local',
        password: 'not-used',
        role: 'USER',
        subscriptionTier: 'FREE',
      },
    }),
    prisma.user.upsert({
      where: { email: 'security-admin@docuai.local' },
      update: { role: 'ADMIN' },
      create: {
        email: 'security-admin@docuai.local',
        password: 'not-used',
        role: 'ADMIN',
        subscriptionTier: 'ENTERPRISE',
      },
    }),
  ]);

  const template = await prisma.template.upsert({
    where: { id: 'security-template' },
    update: {},
    create: {
      id: 'security-template',
      name: 'Security Test Template',
      type: 'MEMO',
      structure: JSON.stringify({ fields: [] }),
      isActive: true,
      supportedFormats: 'DOCX,PDF,XLSX',
    },
  });

  const ownerFilename = `security-owner-${Date.now()}.pdf`;

  await prisma.document.create({
    data: {
      userId: owner.id,
      templateId: template.id,
      content: '{}',
      metadata: '{}',
      fileUrl: ownerFilename,
      format: 'PDF',
      status: 'COMPLETED',
    },
  });

  const uploadsDir = path.join(process.cwd(), 'uploads');
  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.writeFile(path.join(uploadsDir, ownerFilename), 'security-check-file');

  const ownerToken = signToken({ userId: owner.id, email: owner.email, role: owner.role });
  const otherToken = signToken({ userId: other.id, email: other.email, role: other.role });
  const adminToken = signToken({ userId: admin.id, email: admin.email, role: admin.role });

  // File route checks
  assertEqual(
    await requestStatusCode(`${BASE_URL}/api/files/${ownerFilename}`),
    401,
    'File route blocks unauthenticated access'
  );
  assertEqual(
    await requestStatusCode(`${BASE_URL}/api/files/${ownerFilename}`, ownerToken),
    200,
    'File route allows owner access'
  );
  assertEqual(
    await requestStatusCode(`${BASE_URL}/api/files/${ownerFilename}`, otherToken),
    403,
    'File route blocks non-owner access'
  );
  assertEqual(
    await requestStatusCode(`${BASE_URL}/api/files/${ownerFilename}`, adminToken),
    200,
    'File route allows admin access'
  );
  assertOneOf(
    await requestStatusCode(`${BASE_URL}/api/files/../.env`, ownerToken),
    [400, 404],
    'File route blocks raw traversal path (or framework-normalized equivalent)'
  );
  assertEqual(
    await requestStatusCode(`${BASE_URL}/api/files/%2e%2e%2f.env`, ownerToken),
    400,
    'File route blocks encoded traversal path'
  );

  // Status access logic checks (helper-level)
  assertEqual(
    canAccessDocument(owner.id, owner.id, 'USER'),
    true,
    'Status access helper allows owner'
  );
  assertEqual(
    canAccessDocument(owner.id, admin.id, 'ADMIN'),
    true,
    'Status access helper allows admin'
  );
  assertEqual(
    canAccessDocument(owner.id, other.id, 'USER'),
    false,
    'Status access helper blocks non-owner non-admin'
  );

  console.log('All security checks passed.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
