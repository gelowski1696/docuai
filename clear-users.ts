import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearUsers() {
  console.log('🧹 Clearing all users from database...\n');

  const deleted = await prisma.user.deleteMany({});
  
  console.log(`✅ Deleted ${deleted.count} users`);
  console.log('\nNow run: npm run seed:sqlite');
}

clearUsers()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
