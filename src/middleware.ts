import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Identify administrative page and API routes
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  
  // Exclude login and logout routes so admins can still authenticate
  const isAuthRoute = 
    pathname === '/admin/login' || 
    pathname === '/api/admin/login' || 
    pathname === '/api/admin/logout';

  if (isAdminRoute && !isAuthRoute) {
    // 2. Look for your secure, HTTP-only administrator session cookie
    // (Ensure your login API sets this cookie name upon successful sign-in)
    const sessionToken = request.cookies.get('admin_session');

    if (!sessionToken) {
      // If unauthorized API request, immediately block it and return 401
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Unauthorized: Session missing or expired' },
          { status: 401 }
        );
      }
      
      // If unauthorized page request, redirect securely to login
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Inject strict HTTP Security Headers into every response
  const response = NextResponse.next();
  
  // Protects against Clickjacking (prevents the site from being rendered in an iframe)
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Protects against MIME-sniffing attacks
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Controls how much referrer information is shared with other sites
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Disables access to unused hardware to minimize attack vectors
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

// Scopes the middleware to run exclusively on administrative endpoints
export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};