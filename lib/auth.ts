import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const secretKey = process.env.JWT_SECRET || 'super_secret_dira_jwt_key_2026';
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, { algorithms: ['HS256'] });
    return payload;
  } catch (e) {
    console.log('JWT Verify failed:', e);
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('dira_session')?.value;
  if (!session) return null;
  return await decrypt(session);
}

export async function setSession(userId: number, role: string, name: string, email: string) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session = await encrypt({ user_id: userId, email, role, name, expires });
  const cookieStore = await cookies();
  cookieStore.set('dira_session', session, { expires, httpOnly: true, path: '/', sameSite: 'lax' });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete('dira_session');
}

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get('dira_session')?.value;
  if (!session) return;
  const parsed = await decrypt(session);
  if (!parsed) return;
  parsed.expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const res = NextResponse.next();
  res.cookies.set({
    name: 'dira_session',
    value: await encrypt(parsed),
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    expires: parsed.expires,
  });
  return res;
}
