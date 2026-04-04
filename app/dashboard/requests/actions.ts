'use server';

import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function resolveRequestAction(id: number, status: 'APPROVED' | 'DENIED') {
  const session = await getSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN')) {
     return { success: false, message: 'Unauthorized action.' };
  }

  try {
     const res = await query(`UPDATE records SET status = $1 WHERE id = $2 AND type = 'EXPENSE' AND status = 'PENDING' RETURNING id`, [status, id]);
     if (res.rowCount === 0) {
        return { success: false, message: 'Directive not found or already resolved.' };
     }
     revalidatePath('/dashboard/requests');
     revalidatePath('/dashboard/ledger');
     revalidatePath('/dashboard');
     return { success: true, message: `Directive ${id} has been ${status}.` };
  } catch(e) {
     return { success: false, message: 'System failure resolving directive.' };
  }
}
