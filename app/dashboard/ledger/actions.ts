'use server';

import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function insertIncomeAction(formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN')) {
     return { success: false, message: 'Unauthorized access.' };
  }

  const amount = formData.get('amount') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;

  try {
     await query('INSERT INTO records (user_id, type, amount, title, description, status) VALUES ($1, $2, $3, $4, $5, $6)', 
        [session.user_id, 'INCOME', amount, title, description, 'APPROVED']);
     revalidatePath('/dashboard/ledger');
     return { success: true, message: 'Income recorded securely in the ledger.' };
  } catch(e) {
     return { success: false, message: 'Database failure while recording income.' };
  }
}
