'use server';

import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { setSession } from '@/lib/auth';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, message: 'Missing credentials.' };
  }

  try {
    // Basic query
    const res = await query('SELECT id, password_hash, role, name, status FROM users WHERE email = $1', [email]);
    if (res.rows.length === 0) return { success: false, message: 'Invalid credentials.' };
    
    const user = res.rows[0];
    if (user.status !== 'ACTIVE') return { success: false, message: 'Account is suspended.' };

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return { success: false, message: 'Invalid credentials.' };

    await setSession(user.id, user.role, user.name);
    return { success: true, message: 'Authentication successful.', role: user.role };
  } catch (e: any) {
    console.error('Login Error:', e);
    return { success: false, message: 'Database connecting.. Please wait a moment.' };
  }
}
