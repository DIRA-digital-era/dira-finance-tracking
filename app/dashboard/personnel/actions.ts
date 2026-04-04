'use server';

import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { createLog, createNotification } from '@/lib/logs';

export async function createUserAction(formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN')) {
      return { success: false, message: 'Unauthorized.' };
  }

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const roleVal = formData.get('role') as string;
  const titleIds = formData.getAll('titles') as string[];
  
  if (roleVal === 'SUPER_ADMIN' && session.role !== 'SUPER_ADMIN') {
      return { success: false, message: 'Only SUPER_ADMIN can create another SUPER_ADMIN.' };
  }

  try {
     const check = await query('SELECT id FROM users WHERE email = $1', [email]);
     if (check.rowCount && check.rowCount > 0) {
        return { success: false, message: 'Employee ID (email) already exists.' };
     }

     const hash = await bcrypt.hash(password, 10);
     const lvl = roleVal === 'SUPER_ADMIN' ? 3 : (roleVal === 'ADMIN' ? 2 : 1);

     const insertRes = await query(`
        INSERT INTO users (name, email, password_hash, role, clearance_level) 
        VALUES ($1, $2, $3, $4, $5) RETURNING id
     `, [name, email, hash, roleVal, lvl]);

     const newUserId = insertRes.rows[0].id;

     for (const titleId of titleIds) {
         await query('INSERT INTO user_titles (user_id, title_id) VALUES ($1, $2)', [newUserId, parseInt(titleId)]);
     }

     await createLog(session.user_id, 'CREATED_USER', `Registered employee: ${name} (${roleVal})`, newUserId);

     revalidatePath('/dashboard/personnel');
     return { success: true, message: 'Employee profile activated.' };
  } catch(e) {
     return { success: false, message: 'System error during registration.' };
  }
}

export async function updateUserAction(id: number, formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN')) {
      return { success: false, message: 'Unauthorized.' };
  }

  const name = formData.get('name') as string;
  const roleVal = formData.get('role') as string;
  const titleIds = formData.getAll('titles') as string[];
  
  if (roleVal === 'SUPER_ADMIN' && session.role !== 'SUPER_ADMIN') {
      return { success: false, message: 'Only SUPER_ADMIN can set another to SUPER_ADMIN.' };
  }

  try {
     const lvl = roleVal === 'SUPER_ADMIN' ? 3 : (roleVal === 'ADMIN' ? 2 : 1);
     await query(`UPDATE users SET name = $1, role = $2, clearance_level = $3 WHERE id = $4`, [name, roleVal, lvl, id]);

     // Update Titles (wipe out and recreate)
     await query('DELETE FROM user_titles WHERE user_id = $1', [id]);
     for (const titleId of titleIds) {
         await query('INSERT INTO user_titles (user_id, title_id) VALUES ($1, $2)', [id, parseInt(titleId)]);
     }

     await createLog(session.user_id, 'UPDATED_USER', `Updated profile for Employee ID #${id}: ${name} (${roleVal})`, id);

     revalidatePath('/dashboard/personnel');
     return { success: true, message: 'Employee profile updated successfully.' };
  } catch(e) {
     return { success: false, message: 'System error updating profile.' };
  }
}

export async function toggleUserStatus(id: number, currentStatus: string) {
  const session = await getSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN')) return { success: false, message: 'Unauthorized.' };

  // Check target user role — only SUPER_ADMIN can suspend/modify ADMINs
  try {
     const targetRes = await query('SELECT role FROM users WHERE id = $1', [id]);
     if (targetRes.rowCount === 0) return { success: false, message: 'User not found.' };
     const targetRole = targetRes.rows[0].role;
     if ((targetRole === 'ADMIN' || targetRole === 'SUPER_ADMIN') && session.role !== 'SUPER_ADMIN') {
        return { success: false, message: 'Only a Director (Level 3) can suspend or modify Admin-level accounts.' };
     }
  } catch(e) {
     return { success: false, message: 'Failed to validate target role.' };
  }

  const targetStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';

  try {
     const dbRes = await query('UPDATE users SET status = $1 WHERE id = $2 RETURNING email', [targetStatus, id]);
     if (dbRes.rowCount === 0) return { success: false, message: 'User not found.' };

     await createLog(session.user_id, targetStatus === 'SUSPENDED' ? 'SUSPENDED_USER' : 'REACTIVATED_USER', `Status for User ID #${id} changed to ${targetStatus}`, id);
     await createNotification(id, 'Account Status Changed', `Your account has been ${targetStatus.toLowerCase()} by an administrator.`);
     
     revalidatePath('/dashboard/personnel');
     return { success: true, message: `Status changed to ${targetStatus}` };
  } catch(e) {
     return { success: false, message: 'Failed to update status.' };
  }
}

export async function deleteUserAction(id: number) {
  const session = await getSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN')) return { success: false, message: 'Unauthorized.' };

  // Only SUPER_ADMIN can delete ADMINs
  try {
     const targetRes = await query('SELECT role FROM users WHERE id = $1', [id]);
     if (targetRes.rowCount === 0) return { success: false, message: 'User not found.' };
     const targetRole = targetRes.rows[0].role;
     if ((targetRole === 'ADMIN' || targetRole === 'SUPER_ADMIN') && session.role !== 'SUPER_ADMIN') {
        return { success: false, message: 'Only a Director (Level 3) can delete Admin-level accounts.' };
     }
  } catch(e) {
     return { success: false, message: 'Failed to validate target role.' };
  }

  try {
     const dbRes = await query(`UPDATE users SET status = 'DELETED' WHERE id = $1`, [id]);
     if (dbRes.rowCount === 0) return { success: false, message: 'User not found.' };

     await createLog(session.user_id, 'DELETED_USER', `Account User ID #${id} was marked as deleted (Soft Delete)`, id);
     
     revalidatePath('/dashboard/personnel');
     return { success: true, message: `Employee marked as past/deleted.` };
  } catch(e) {
     return { success: false, message: 'Failed to delete.' };
  }
}

export async function reinstateUserAction(id: number) {
  const session = await getSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN')) return { success: false, message: 'Unauthorized.' };

  try {
     const dbRes = await query(`UPDATE users SET status = 'ACTIVE' WHERE id = $1`, [id]);
     if (dbRes.rowCount === 0) return { success: false, message: 'User not found.' };

     await createLog(session.user_id, 'REINSTATED_USER', `Account User ID #${id} was reinstated from past employees`, id);
     
     revalidatePath('/dashboard/personnel');
     return { success: true, message: `Employee successfully reinstated.` };
  } catch(e) {
     return { success: false, message: 'Failed to reinstate.' };
  }
}
