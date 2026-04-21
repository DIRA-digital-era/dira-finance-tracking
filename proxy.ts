import { NextResponse, NextRequest } from 'next/server';
import { decrypt } from './lib/auth';

export async function proxy(request: NextRequest) {
  const sessionValue = request.cookies.get('dira_session')?.value;
  const { pathname } = request.nextUrl;

  // Define public paths that don't require authentication
  const isPublicPath = 
    pathname === '/login' || 
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') || 
    pathname.startsWith('/uploads') ||
    pathname === '/favicon.ico' ||
    pathname === '/logo.jpg' ||
    /\.(jpg|jpeg|png|gif|svg|ico)$/i.test(pathname);

  if (isPublicPath) {
    return NextResponse.next();
  }

  if (!sessionValue) {
    // console.log('Proxy: No sessionValue found', { pathname });
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = await decrypt(sessionValue);
  if (!payload) {
    console.log('Proxy: Decrypt failed for sessionValue');
    const res = NextResponse.redirect(new URL('/login', request.url));
    res.cookies.delete('dira_session');
    return res;
  }

  // Admin route protection
  if (pathname.startsWith('/admin') && payload.role !== 'ADMIN' && payload.role !== 'SUPER_ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Ensure the proxy doesn't run on static files and specific excluded paths
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|login|public|uploads|logo\.jpg).*)',
  ],
};
