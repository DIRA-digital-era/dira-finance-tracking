'use server';

import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { uploadFile } from '@/lib/storage';
import { revalidatePath } from 'next/cache';

export async function submitRequest(formData: FormData) {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized access.' };

  const amount = parseFloat(formData.get('amount') as string);
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;

  // Check if amount exceeds user's limit
  const lvl = session.role === 'SUPER_ADMIN' ? 3 : (session.role === 'ADMIN' ? 2 : 1);
  const configKey = `max_request_level_${lvl}`;
  let maxLimit = 0;
  try {
    const cfgRes = await query('SELECT value FROM config WHERE key = $1', [configKey]);
    if (cfgRes.rows.length > 0) maxLimit = parseInt(JSON.parse(cfgRes.rows[0].value)) || 0;
  } catch(e) { /* config table may not exist yet */ }

  if (maxLimit > 0 && amount > maxLimit) {
    return { success: false, message: `Request amount exceeds your spending limit of ${maxLimit.toLocaleString('en-US')} XAF.` };
  }

  const files = formData.getAll('receipts') as File[];
  if (files.length > 4) return { success: false, message: 'Maximum 4 receipts allowed.' };

  try {
     const dbRes = await query('INSERT INTO records (user_id, type, amount, title, description) VALUES ($1, $2, $3, $4, $5) RETURNING id', [session.user_id, 'EXPENSE', amount, title, description]);
     const recordId = dbRes.rows[0].id;

     // process uploads iteratively
     for (const file of files) {
       if (file && file.size > 0) {
          const uploadResult = await uploadFile(file);
          await query('INSERT INTO receipts (record_id, file_url) VALUES ($1, $2)', [recordId, uploadResult.url]);
          try {
            await query(
              'INSERT INTO cloudinary_files (public_id, media_url, resource_type, user_id, record_id) VALUES ($1, $2, $3, $4, $5)',
              [uploadResult.public_id, uploadResult.url, uploadResult.resource_type, session.user_id, recordId]
            );
          } catch (metadataError) {
            // Log but don't fail the request if metadata storage fails
            console.warn('Failed to save Cloudinary metadata:', metadataError);
          }
       }
     }
     
     revalidatePath('/dashboard');
     return { success: true, message: 'Fund Directive Registered Successfully.' };
  } catch (e) {
     console.error('Request upload error:', e);
     return { success: false, message: 'Failed to synchronize with central ledger.' };
  }
}
