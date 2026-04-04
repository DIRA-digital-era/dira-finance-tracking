'use server';

import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { createLog, createNotification } from '@/lib/logs';

export async function dispatchFundsAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== 'SUPER_ADMIN') {
    return { success: false, message: 'Only a Director (SUPER_ADMIN) can dispatch funds.' };
  }

  const targetUserId = parseInt(formData.get('target_user_id') as string);
  const amount = parseFloat(formData.get('amount') as string);
  const note = formData.get('note') as string;

  if (!targetUserId || isNaN(amount) || amount <= 0) {
    return { success: false, message: 'Invalid recipient or amount.' };
  }

  try {
    const targetRes = await query('SELECT id, name FROM users WHERE id = $1 AND status = $2', [targetUserId, 'ACTIVE']);
    if (targetRes.rowCount === 0) return { success: false, message: 'Recipient not found or inactive.' };
    const target = targetRes.rows[0];

    // Type = DISPATCH: Director-allocated budget for employee, auto-APPROVED.
    // This is outgoing capital from the company (NOT income), shown separately in ledger.
    await query(
      `INSERT INTO records (user_id, type, amount, title, description, status)
       VALUES ($1, 'DISPATCH', $2, $3, $4, 'APPROVED')`,
      [
        targetUserId,
        amount,
        `Director Dispatch → ${target.name}`,
        note || `Budget allocation by Director ${session.name}`
      ]
    );

    await createLog(
      session.user_id,
      'DISPATCHED_FUNDS',
      `Director ${session.name} dispatched ${amount.toLocaleString()} XAF to ${target.name}`,
      targetUserId
    );

    await createNotification(
      targetUserId,
      '💰 Funds Dispatched to You',
      `Director ${session.name} has allocated ${amount.toLocaleString('en-US', { minimumFractionDigits: 0 })} XAF to your budget. Note: ${note || 'N/A'}`
    );

    revalidatePath('/dashboard/ledger');
    revalidatePath('/dashboard');
    return { success: true, message: `${amount.toLocaleString()} XAF dispatched to ${target.name}.` };
  } catch (e) {
    console.error(e);
    return { success: false, message: 'System error during fund dispatch.' };
  }
}
