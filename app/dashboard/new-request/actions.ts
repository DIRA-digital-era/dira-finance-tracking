'use server';

import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { uploadFile } from '@/lib/storage';
import { revalidatePath } from 'next/cache';

export async function submitRequest(formData: FormData) {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized access.' };

  const amount = formData.get('amount') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;

  const files = formData.getAll('receipts') as File[];
  if (files.length > 4) return { success: false, message: 'Maximum 4 receipts allowed.' };

  try {
     const dbRes = await query('INSERT INTO records (user_id, type, amount, title, description) VALUES ($1, $2, $3, $4, $5) RETURNING id', [session.user_id, 'EXPENSE', amount, title, description]);
     const recordId = dbRes.rows[0].id;

     // process uploads iteratively
     for (const file of files) {
       if (file && file.size > 0) {
          const url = await uploadFile(file);
          await query('INSERT INTO receipts (record_id, file_url) VALUES ($1, $2)', [recordId, url]);
       }
     }
     
     revalidatePath('/dashboard');
     return { success: true, message: 'Fund Directive Registered Successfully.' };
  } catch (e) {
     console.error('Request upload error:', e);
     return { success: false, message: 'Failed to synchronize with central ledger.' };
  }
}
