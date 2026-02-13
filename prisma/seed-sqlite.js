const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const DESIGN_PRESETS = [
  {
    name: 'Corporate Clean',
    description: 'Balanced corporate look with clean spacing and blue accents.',
    targetFormats: 'DOCX,PDF',
    isDefault: true,
    tokens: {
      primaryColor: '#2563EB',
      secondaryColor: '#4F46E5',
      headingColor: '#1E293B',
      bodyColor: '#334155',
      fontHeading: 'Inter',
      fontBody: 'Roboto',
      spacingScale: 'normal',
      tableStyle: 'clean',
      coverStyle: 'classic',
    },
  },
  {
    name: 'Modern Gradient',
    description: 'Modern visual language with gradient-friendly accents.',
    targetFormats: 'DOCX,PDF',
    isDefault: false,
    tokens: {
      primaryColor: '#7C3AED',
      secondaryColor: '#EC4899',
      headingColor: '#111827',
      bodyColor: '#374151',
      fontHeading: 'Inter',
      fontBody: 'Roboto',
      spacingScale: 'relaxed',
      tableStyle: 'soft',
      coverStyle: 'gradient',
    },
  },
  {
    name: 'Minimal Mono',
    description: 'Minimal black and white style for legal and formal docs.',
    targetFormats: 'DOCX,PDF',
    isDefault: false,
    tokens: {
      primaryColor: '#111827',
      secondaryColor: '#4B5563',
      headingColor: '#000000',
      bodyColor: '#1F2937',
      fontHeading: 'Calibri',
      fontBody: 'Calibri',
      spacingScale: 'compact',
      tableStyle: 'lined',
      coverStyle: 'minimal',
    },
  },
  {
    name: 'Executive',
    description: 'Premium executive style for board and enterprise reports.',
    targetFormats: 'DOCX,PDF',
    isDefault: false,
    tokens: {
      primaryColor: '#0F172A',
      secondaryColor: '#0369A1',
      headingColor: '#0F172A',
      bodyColor: '#334155',
      fontHeading: 'Georgia',
      fontBody: 'Roboto',
      spacingScale: 'normal',
      tableStyle: 'elegant',
      coverStyle: 'executive',
    },
  },
];

async function seedDesignTemplates(adminId) {
  for (const preset of DESIGN_PRESETS) {
    await prisma.designTemplate.upsert({
      where: { name: preset.name },
      update: {
        description: preset.description,
        targetFormats: preset.targetFormats,
        tokens: JSON.stringify(preset.tokens),
        isActive: true,
        isDefault: preset.isDefault,
        createdBy: adminId,
      },
      create: {
        name: preset.name,
        description: preset.description,
        targetFormats: preset.targetFormats,
        tokens: JSON.stringify(preset.tokens),
        isActive: true,
        isDefault: preset.isDefault,
        createdBy: adminId,
      },
    });
  }

  // Keep exactly one default design to avoid ambiguity.
  const defaultDesign = await prisma.designTemplate.findFirst({
    where: { isDefault: true },
    orderBy: { createdAt: 'asc' },
  });

  if (defaultDesign) {
    await prisma.designTemplate.updateMany({
      where: { id: { not: defaultDesign.id } },
      data: { isDefault: false },
    });
  }
}

async function main() {
  console.log('Seeding database for SQLite mode...');

  const adminEmail = 'admin@docuai.com';
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
      subscriptionTier: 'PRO',
      billingCycle: 'MONTHLY',
      lastReset: new Date(),
    },
  });

  console.log(`Admin user ready: ${admin.email}`);

  const userEmail = 'user@docuai.com';
  const userHashedPassword = await bcrypt.hash('user123', 10);

  const user = await prisma.user.upsert({
    where: { email: userEmail },
    update: {},
    create: {
      email: userEmail,
      password: userHashedPassword,
      role: 'USER',
      subscriptionTier: 'FREE',
      billingCycle: 'MONTHLY',
      lastReset: new Date(),
    },
  });

  console.log(`Regular user ready: ${user.email}`);

  await prisma.brandSettings.upsert({
    where: { id: 'singleton' },
    update: {
      primaryColor: '#2563EB',
      secondaryColor: '#4F46E5',
      fontHeading: 'Inter',
      fontBody: 'Roboto',
    },
    create: {
      id: 'singleton',
      logoUrl: null,
      primaryColor: '#2563EB',
      secondaryColor: '#4F46E5',
      fontHeading: 'Inter',
      fontBody: 'Roboto',
    },
  });

  await seedDesignTemplates(admin.id);

  console.log('SQLite seed complete.');
  console.log('Test credentials:');
  console.log('Admin: admin@docuai.com / admin123');
  console.log('User:  user@docuai.com / user123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
