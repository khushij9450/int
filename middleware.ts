import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the user is accessing the root path
  if (request.nextUrl.pathname === '/') {
    // Check if they've seen the splash screen (you can use a cookie or other method)
    const hasSeenSplash = request.cookies.get('seen-splash');
    
    if (!hasSeenSplash) {
      // Set a cookie to remember they've seen the splash
      const response = NextResponse.redirect(new URL('/splash', request.url));
      response.cookies.set('seen-splash', 'true', { 
        maxAge: 60 * 60 * 24, // 24 hours
        httpOnly: true 
      });
      return response;
    }
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
     * - splash (splash page itself)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|splash).*)',
  ],
};