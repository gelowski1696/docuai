import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  const useSupabaseAuth = process.env.DATABASE_PROVIDER === 'postgresql';

  // Define public routes that don't require authentication.
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/api/health',
    '/api/auth/login',
    '/api/auth/register',
  ];
  if (useSupabaseAuth) {
    publicRoutes.push('/api/auth/callback');
  }

  // Check if the current path is a public route.
  const isPublicRoute = publicRoutes.some(route =>
    request.nextUrl.pathname === route ||
    request.nextUrl.pathname.startsWith('/api/auth')
  );

  if (isPublicRoute) {
    return NextResponse.next({ request });
  }

  const sessionCookieName = useSupabaseAuth ? 'app-session' : 'auth-token';
  const sessionCookie = request.cookies.get(sessionCookieName)?.value;

  // For protected routes, require the active session cookie.
  if (!sessionCookie) {
    // API routes return a direct 401 instead of an HTML redirect.
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request });
}
