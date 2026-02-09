import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const USE_SUPABASE_AUTH = process.env.DATABASE_PROVIDER === 'postgresql';

export async function POST() {
  try {
    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );

    if (USE_SUPABASE_AUTH) {
      // Supabase Auth logout
      const supabase = await createClient();
      await supabase.auth.signOut();
    }

    // Clear both auth cookie variants.
    response.cookies.delete('auth-token');
    response.cookies.delete('app-session');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
