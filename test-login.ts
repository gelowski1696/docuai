import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testLogin() {
  console.log('🔍 Testing admin login...\n');

  const email = 'admin@docuai.com';
  const password = 'admin123';

  // 1. Find user in database
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log('❌ User not found in database');
    return;
  }

  console.log('✅ User found in database:');
  console.log(`   ID: ${user.id}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Role: ${user.role}`);
  console.log(`   Has password: ${user.password ? 'Yes' : 'No'}`);
  console.log(`   Password hash: ${user.password?.substring(0, 20)}...`);

  // 2. Test password comparison
  if (!user.password) {
    console.log('\n❌ User has no password set');
    return;
  }

  const isValid = await bcrypt.compare(password, user.password);
  console.log(`\n🔐 Password verification: ${isValid ? '✅ VALID' : '❌ INVALID'}`);

  if (isValid) {
    console.log('\n✅ Login test PASSED - Admin can login successfully!');
  } else {
    console.log('\n❌ Login test FAILED - Password does not match');
  }
}

testLogin()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
