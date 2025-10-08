import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuthenticatedUser, hasAnyActiveMembership } from './lib/auth';

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/premium',
  '/members-only',
];

// Define routes that require active membership
const membershipRequiredRoutes = [
  '/premium',
  '/members-only',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  const isMembershipRequiredRoute = membershipRequiredRoutes.some(route => 
    pathname.startsWith(route)
  );

  if (isProtectedRoute || isMembershipRequiredRoute) {
    // This will be handled by the page components since middleware
    // can't easily access cookies in the same way
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}