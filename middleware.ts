import { NextResponse, NextRequest } from 'next/server';
import { decrypt } from './lib/auth';

export async function middleware(request: NextRequest) {
  const sessionValue = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  const isPublicPath = pathname === '/login' || pathname.startsWith('/_next') || pathname.startsWith('/public') || pathname.startsWith('/api') || pathname.startsWith('/uploads');

  if (isPublicPath) {
    return NextResponse.next();
  }

  if (!sessionValue) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = await decrypt(sessionValue);
  if (!payload) {
    const res = NextResponse.redirect(new URL('/login', request.url));
    res.cookies.delete('session');
    return res;
  }

  // Admin route protection
  if (pathname.startsWith('/admin') && payload.role !== 'ADMIN' && payload.role !== 'SUPER_ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|login|public|uploads).*)'],
};
