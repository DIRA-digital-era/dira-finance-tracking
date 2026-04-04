'use server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { createLog } from '@/lib/logs';

export async function updatePasswordAction(formData: FormData) {
   const session = await getSession();
   if (!session) return { success: false, message: 'Unauthorized.' };

   const pass = formData.get('password') as string;
   if (pass.length < 6) return { success: false, message: 'Password must be at least 6 characters.' };

   try {
       const hash = await bcrypt.hash(pass, 10);
       await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, session.user_id]);
       await createLog(session.user_id, 'PASSWORD_UPDATE', 'Updated personal security password');
       return { success: true, message: 'Password updated successfully.' };
   } catch (e) {
       return { success: false, message: 'System error updating password.' };
   }
}
