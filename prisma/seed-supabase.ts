/**
 * Seed script for Supabase (PostgreSQL) mode
 *
 * Registers users in Supabase Auth and upserts their app profiles via Prisma.
 */

import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('? Missing Supabase credentials in .env file');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function findAuthUserIdByEmail(email: string): Promise<string | null> {
  const user = await findAuthUserByEmail(email);
  return user?.id ?? null;
}

async function findAuthUserByEmail(email: string) {
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;

    const found = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (found) return found;

    if (data.users.length < 1000) break;
  }

  return null;
}

async function createSupabaseUser(email: string, password: string, role: string, tier: string) {
  let authUserId: string | null = null;
  let existingUser = false;
  let existingAuthUser: Awaited<ReturnType<typeof findAuthUserByEmail>> = null;

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    if (authError.code === 'email_exists' || authError.message.includes('already registered')) {
      console.log(`??  User ${email} already exists in Supabase Auth`);
      existingAuthUser = await findAuthUserByEmail(email);
      authUserId = existingAuthUser?.id ?? null;
      if (!authUserId) {
        throw new Error(`User ${email} exists in Auth, but could not be fetched with listUsers`);
      }
      existingUser = true;
    } else {
      throw authError;
    }
  } else {
    authUserId = authData.user?.id ?? null;
    console.log(`? Supabase Auth user created: ${email}`);
  }

  if (!authUserId) {
    throw new Error(`Failed to resolve auth user id for ${email}`);
  }

  // Keep seeded credentials usable even when auth users already existed.
  if (existingUser && existingAuthUser) {
    const hasBrokenIdentity = !existingAuthUser.identities || existingAuthUser.identities.length === 0;

    if (hasBrokenIdentity) {
      console.log(`??  Recreating ${email} in Supabase Auth to repair missing identity record`);
      const { error: deleteError } = await supabase.auth.admin.deleteUser(authUserId);
      if (deleteError) {
        throw deleteError;
      }

      const { data: recreated, error: recreateError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (recreateError || !recreated.user?.id) {
        throw recreateError ?? new Error(`Failed to recreate auth user for ${email}`);
      }

      authUserId = recreated.user.id;
      console.log(`? Supabase Auth user recreated: ${email}`);
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(authUserId, {
      password,
      email_confirm: true,
    });

    if (updateError) {
      throw updateError;
    }

    console.log(`? Supabase Auth user updated: ${email} (password reset + email confirmed)`);
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      authId: authUserId,
      role,
      subscriptionTier: tier,
      billingCycle: 'MONTHLY',
    },
    create: {
      authId: authUserId,
      email,
      role,
      subscriptionTier: tier,
      billingCycle: 'MONTHLY',
      lastReset: new Date(),
    },
  });

  console.log(`? Database profile upserted: ${email} (${user.id})`);
  return authUserId;
}

async function main() {
  console.log('?? Seeding database for Supabase (PostgreSQL) mode...\n');

  try {
    await createSupabaseUser('admin@docuai.com', 'admin123', 'ADMIN', 'PRO');
    await createSupabaseUser('user@docuai.com', 'user123', 'USER', 'FREE');

    console.log('\n?? Supabase seeding complete!');
    console.log('\n?? Test Credentials:');
    console.log('   Admin: admin@docuai.com / admin123');
    console.log('   User:  user@docuai.com / user123');
    console.log('\n?? These users are now registered in Supabase Auth and can login immediately.');
  } catch (error) {
    console.error('? Seeding failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
