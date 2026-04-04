'use server';

import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { createLog, createNotification } from '@/lib/logs';

export async function resolveRequestAction(id: number, status: 'APPROVED' | 'DENIED') {
  const session = await getSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN')) {
     return { success: false, message: 'Unauthorized action.' };
  }

  try {
     const resRequest = await query(`SELECT user_id, title FROM records WHERE id = $1 AND type = 'EXPENSE' AND status = 'PENDING'`, [id]);
     if (resRequest.rowCount === 0) return { success: false, message: 'Request not found or already resolved.' };
     const reqData = resRequest.rows[0];

     await query(`UPDATE records SET status = $1 WHERE id = $2`, [status, id]);
     
     // Log action
     await createLog(session.user_id, `${status}_REQUEST`, `Request #${id} was ${status} by ${session.name}`, reqData.user_id, id);
     
     // Notify the user
     await createNotification(
        reqData.user_id, 
        `Request ${status}`, 
        `Your request "${reqData.title}" was ${status.toLowerCase()}.`
     );

     revalidatePath('/dashboard/requests');
     revalidatePath('/dashboard/ledger');
     revalidatePath('/dashboard');
     return { success: true, message: `Request ${id} has been ${status}.` };
  } catch(e) {
     return { success: false, message: 'System failure resolving request.' };
  }
}
