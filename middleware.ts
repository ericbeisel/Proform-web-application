// Route protection middleware
import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/account',
  '/account-setup',
  '/itinerary',
  '/preferences',
  '/team',
  '/team-dashboard',
];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get('proform_token')?.value;

  if (pathname === '/') {
    return NextResponse.redirect(
      new URL(token ? '/dashboard' : '/auth/login', request.url)
    );
  }

  if (isProtectedRoute(pathname) && !token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
