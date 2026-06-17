import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. PRODUCTION FIX: Bypass Next.js background prefetch requests.
  // This prevents the background prefetcher from hitting the redirect guard,
  // caching a stale '307 Redirect' state in the browser, and looping you back to login.
  const isPrefetch = 
    request.headers.get('next-router-prefetch') === '1' || 
    request.headers.get('rsc') === '1';

  // Define admin routes that require authentication
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  
  // Exclude public authentication pages from the check
  const isAuthRoute = 
    pathname === '/admin/login' || 
    pathname === '/api/admin/login' || 
    pathname === '/api/admin/logout';

  // Only run the security guard on actual page views, not background prefetches
  if (isAdminRoute && !isAuthRoute && !isPrefetch) {
    // Retrieve the secure http-only session cookie
    const sessionToken = request.cookies.get('admin_session');

    if (!sessionToken) {
      // If it is an API route, return a JSON unauthorized response
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Unauthorized: Session missing or expired' },
          { status: 401 }
        );
      }
      
      // If it is a page route, redirect to the login page cleanly
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      
      const responseRedirect = NextResponse.redirect(loginUrl);
      // Disable middleware caching on redirects to prevent session conflicts
      responseRedirect.headers.set('x-middleware-cache', 'no-cache');
      return responseRedirect;
    }
  }

  // Apply standard security headers to every response
  const response = NextResponse.next();
  
  // Disable edge middleware caching to resolve session-sync delays on Vercel
  response.headers.set('x-middleware-cache', 'no-cache');
  
  // Security Headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

// Configure the middleware to run on specific paths only
export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};