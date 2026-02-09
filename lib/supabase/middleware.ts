import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  const USE_SUPABASE_AUTH = process.env.DATABASE_PROVIDER === 'postgresql';

  // Skip Supabase session management for SQLite mode
  if (!USE_SUPABASE_AUTH) {
    return NextResponse.next({
      request,
    });
  }

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/callback',
  ];

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route =>
    request.nextUrl.pathname === route ||
    request.nextUrl.pathname.startsWith('/api/auth')
  );

  // Skip Supabase auth lookup for public routes to reduce latency.
  if (isPublicRoute) {
    return NextResponse.next({ request });
  }

  const appSession = request.cookies.get('app-session')?.value;

  // For protected routes, require our app session cookie.
  if (!appSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request });
}
