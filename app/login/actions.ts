'use server';

import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { setSession } from '@/lib/auth';

// Server action for user login authentication
export async function loginAction(formData: FormData) {
  // Extract email and password from form data
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Validate required fields
  if (!email || !password) {
    return { success: false, message: 'Missing credentials.' };
  }

  try {
    // Query user from database
    const res = await query('SELECT id, password_hash, role, name, status FROM users WHERE email = $1', [email]);
    if (res.rows.length === 0) return { success: false, message: 'Invalid credentials.' };

    const user = res.rows[0];
    // Check if account is active
    if (user.status !== 'ACTIVE') return { success: false, message: 'Account is suspended.' };

    // Verify password hash
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return { success: false, message: 'Invalid credentials.' };

    // Create session for authenticated user
    await setSession(user.id, user.role, user.name, email);
    return { success: true, message: 'Authentication successful.', role: user.role };
  } catch (e: any) {
    console.error('Login Error:', e);
    return { success: false, message: 'Database connecting.. Please wait a moment.' };
  }
}
