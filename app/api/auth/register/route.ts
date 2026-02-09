import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { hashPassword } from '@/lib/auth/jwt';
import { z } from 'zod';

// Validation schema for registration
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const USE_SUPABASE_AUTH = process.env.DATABASE_PROVIDER === 'postgresql';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    if (USE_SUPABASE_AUTH) {
      // Supabase Auth flow (for PostgreSQL)
      const supabase = await createClient();

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${request.nextUrl.origin}/auth/callback`,
        },
      });

      if (authError) {
        return NextResponse.json(
          { error: authError.message },
          { status: 400 }
        );
      }

      if (!authData.user) {
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        );
      }

      // Create user profile in database
      const user = await prisma.user.create({
        data: {
          authId: authData.user.id,
          email: authData.user.email!,
          role: 'USER',
        },
      });

      return NextResponse.json(
        {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
          },
          message: authData.user.identities?.length === 0 
            ? 'Please check your email to confirm your account' 
            : 'Registration successful',
        },
        { status: 201 }
      );
    } else {
      // JWT Auth flow (for SQLite)
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 400 }
        );
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'USER',
        },
      });

      return NextResponse.json(
        {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
          },
          message: 'Registration successful! You can now login.',
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
