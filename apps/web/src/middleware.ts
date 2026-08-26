import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PREFIX = '/dashboard';
const LOGIN_PATH = '/dashboard/login';
const COOKIE_NAME = 'zecure_admin_token';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only guard routes under /dashboard
  if (!pathname.startsWith(PROTECTED_PREFIX)) {
    return NextResponse.next();
  }

  // Always allow access to the login page itself
  if (pathname === LOGIN_PATH || pathname.startsWith(LOGIN_PATH + '/')) {
    return NextResponse.next();
  }

  // Check for the HttpOnly session cookie
  const token = request.cookies.get(COOKIE_NAME);

  if (!token || !token.value) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    // Preserve the intended destination so we can redirect back after login (optional)
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware on all /dashboard/* routes
  matcher: ['/dashboard', '/dashboard/:path*'],
};
