import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database for SQLite mode...');

  // 1. Create Admin User (SQLite mode - with hashed password)
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

  console.log(`✅ Admin user created: ${admin.email}`);

  // 2. Create Regular User (SQLite mode)
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

  console.log(`✅ Regular user created: ${user.email}`);

  console.log('🚀 SQLite seeding complete!');
  console.log('\n📝 Test Credentials:');
  console.log('   Admin: admin@docuai.com / admin123');
  console.log('   User:  user@docuai.com / user123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
