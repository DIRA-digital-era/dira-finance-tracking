'use server';

import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { createLog } from '@/lib/logs';

export async function addJobTitleAction(formData: FormData) {
   const session = await getSession();
   if (!session || session.role !== 'SUPER_ADMIN') return { success: false, message: 'Unauthorized.' };
   
   const title = formData.get('title') as string;
   try {
       await query('INSERT INTO job_titles (title) VALUES ($1)', [title]);
       await createLog(session.user_id, 'CREATED_JOB_TITLE', `Created role: ${title}`);
       revalidatePath('/dashboard/config');
       revalidatePath('/dashboard/personnel');
       return { success: true, message: 'Role added successfully.' };
   } catch(e) {
       return { success: false, message: 'Role already exists or system error.' };
   }
}

export async function updateConfigLimitAction(formData: FormData) {
   const session = await getSession();
   if (!session || session.role !== 'SUPER_ADMIN') return { success: false, message: 'Unauthorized.' };
   
   const key = formData.get('key') as string;
   const value = formData.get('value') as string;
   try {
       await query('UPDATE config SET value = $1 WHERE key = $2', [JSON.stringify(value), key]);
       await createLog(session.user_id, 'UPDATED_CONFIG', `Updated ${key} to ${value}`);
       revalidatePath('/dashboard/config');
       return { success: true, message: 'Configuration synchronized.' };
   } catch(e) {
       return { success: false, message: 'System error.' };
   }
}
