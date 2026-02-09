const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({
    select: { email: true, subscriptionTier: true }
  });
  console.log('--- USER SUBSCRIPTIONS ---');
  users.forEach(u => console.log(`${u.email}: ${u.subscriptionTier}`));
  await prisma.$disconnect();
}

check();
