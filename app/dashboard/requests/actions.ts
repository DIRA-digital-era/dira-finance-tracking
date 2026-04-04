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
     const resRequest = await query(`SELECT user_id, title FROM records WHERE id = $1 AND type = 'EXPENSE'`, [id]);
     if (resRequest.rowCount === 0) return { success: false, message: 'Request not found.' };
     const reqData = resRequest.rows[0];

     await query(`UPDATE records SET status = $1 WHERE id = $2`, [status, id]);

     await createLog(session.user_id, `${status}_REQUEST`, `Request #${id} was ${status} by ${session.name}`, reqData.user_id, id);
     await createNotification(
        reqData.user_id,
        `Request ${status}`,
        `Your request "${reqData.title}" was ${status.toLowerCase()} by ${session.name}.`
     );

     revalidatePath('/dashboard/requests');
     revalidatePath('/dashboard/ledger');
     revalidatePath('/dashboard');
     return { success: true, message: `Request ${id} has been ${status}.` };
  } catch(e) {
     return { success: false, message: 'System failure resolving request.' };
  }
}

// SUPER_ADMIN only: overturn a resolved (APPROVED/DENIED) request
export async function overturnRequestAction(id: number) {
  const session = await getSession();
  if (!session || session.role !== 'SUPER_ADMIN') {
     return { success: false, message: 'Only a Director (SUPER_ADMIN) can overturn decisions.' };
  }

  try {
     const resRequest = await query(`SELECT user_id, title, status FROM records WHERE id = $1 AND type = 'EXPENSE'`, [id]);
     if (resRequest.rowCount === 0) return { success: false, message: 'Request not found.' };
     const reqData = resRequest.rows[0];

     if (reqData.status === 'PENDING') {
        return { success: false, message: 'Request is still pending — no decision to overturn.' };
     }

     // Flip the decision
     const newStatus = reqData.status === 'APPROVED' ? 'DENIED' : 'APPROVED';
     await query(`UPDATE records SET status = $1 WHERE id = $2`, [newStatus, id]);

     await createLog(session.user_id, 'OVERTURNED_DECISION', `Director overturned Request #${id}: ${reqData.status} → ${newStatus}`, reqData.user_id, id);
     await createNotification(
        reqData.user_id,
        'Decision Overturned',
        `The decision on your request "${reqData.title}" was overturned by the Director. New status: ${newStatus}.`
     );

     revalidatePath('/dashboard/requests');
     revalidatePath('/dashboard/ledger');
     revalidatePath('/dashboard/my-requests');
     revalidatePath('/dashboard');
     return { success: true, message: `Request overturned → now ${newStatus}.` };
  } catch(e) {
     return { success: false, message: 'System failure overturning decision.' };
  }
}
