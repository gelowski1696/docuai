import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { comparePassword, getSessionMaxAgeSeconds, signAppSessionToken, signToken } from '@/lib/auth/jwt';
import { z } from 'zod';

// Validation schema for login
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const USE_SUPABASE_AUTH = process.env.DATABASE_PROVIDER === 'postgresql';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = loginSchema.safeParse(body);
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

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      if (!authData.user) {
        return NextResponse.json(
          { error: 'Authentication failed' },
          { status: 401 }
        );
      }

      // Get user profile from database
      const user = await prisma.user.findUnique({
        where: { authId: authData.user.id },
      });

      if (!user) {
        return NextResponse.json(
          { error: 'User profile not found' },
          { status: 404 }
        );
      }

      const response = NextResponse.json(
        {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
          },
        },
        { status: 200 }
      );

      // App-level signed session cookie to avoid repeated Supabase auth checks.
      const appSessionToken = signAppSessionToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        authId: user.authId || authData.user.id,
      });

      response.cookies.set('app-session', appSessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: getSessionMaxAgeSeconds(),
        path: '/',
      });

      return response;
    } else {
      // JWT Auth flow (for SQLite)
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.password) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      // Verify password
      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      // Generate JWT token
      const token = signToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Create response with httpOnly cookie
      const response = NextResponse.json(
        {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
          },
        },
        { status: 200 }
      );

      // Set httpOnly cookie
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return response;
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
