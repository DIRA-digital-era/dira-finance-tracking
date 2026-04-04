'use server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getNotificationsAction() {
    const session = await getSession();
    if (!session) return [];
    
    const res = await query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10', [session.user_id]);
    return res.rows;
}

export async function markNotificationReadAction(id: number) {
    const session = await getSession();
    if (!session) return { success: false };
    
    await query('UPDATE notifications SET read_status = TRUE WHERE id = $1 AND user_id = $2', [id, session.user_id]);
    revalidatePath('/dashboard');
    return { success: true };
}
