import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = path === '/admin/login';

  // Get the token from the cookies
  const token = request.cookies.get('admin-token')?.value || '';

  // Redirect to login if accessing admin path without token
  if (!isPublicPath && path.startsWith('/admin') && !token) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Redirect to admin dashboard if accessing login with valid token
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

// Configure the paths that trigger the middleware
export const config = {
  matcher: ['/admin/:path*']
};
