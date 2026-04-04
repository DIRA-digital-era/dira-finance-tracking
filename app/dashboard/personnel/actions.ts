'use server';

import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function createUserAction(formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN')) {
      return { success: false, message: 'Unauthorized configuration attempt.' };
  }

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const roleVal = formData.get('role') as string;
  
  if (roleVal === 'SUPER_ADMIN' && session.role !== 'SUPER_ADMIN') {
      return { success: false, message: 'Only SUPER_ADMIN can create another SUPER_ADMIN.' };
  }

  try {
     const check = await query('SELECT id FROM users WHERE email = $1', [email]);
     if (check.rowCount && check.rowCount > 0) {
        return { success: false, message: 'Operative ID (email) already exists in network.' };
     }

     const hash = await bcrypt.hash(password, 10);
     const lvl = roleVal === 'SUPER_ADMIN' ? 3 : (roleVal === 'ADMIN' ? 2 : 1);

     await query(`
        INSERT INTO users (name, email, password_hash, role, clearance_level) 
        VALUES ($1, $2, $3, $4, $5)
     `, [name, email, hash, roleVal, lvl]);

     revalidatePath('/dashboard/personnel');
     return { success: true, message: 'Operative profile registered and activated.' };
  } catch(e) {
     return { success: false, message: 'System error during registration sequence.' };
  }
}

export async function toggleUserStatus(id: number, currentStatus: string) {
  const session = await getSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN')) return { success: false, message: 'Unauthorized.' };

  const targetStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';

  try {
     const dbRes = await query('UPDATE users SET status = $1 WHERE id = $2 RETURNING email', [targetStatus, id]);
     if (dbRes.rowCount === 0) return { success: false, message: 'User not found.' };

     // Block supers from suspending supers unless they are a super
     
     revalidatePath('/dashboard/personnel');
     return { success: true, message: `Operative status changed to ${targetStatus}` };
  } catch(e) {
     return { success: false, message: 'Failed to update status.' };
  }
}
