'use server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// Server action to fetch user notifications
export async function getNotificationsAction() {
    // Verify user authentication
    const session = await getSession();
    if (!session) return [];
    
    // Get latest 10 notifications for the user
    const res = await query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10', [session.user_id]);
    return res.rows;
}

// Server action to mark notification as read
export async function markNotificationReadAction(id: number) {
    // Verify user authentication
    const session = await getSession();
    if (!session) return { success: false };
    
    // Update notification read status
    await query('UPDATE notifications SET read_status = TRUE WHERE id = $1 AND user_id = $2', [id, session.user_id]);
    // Revalidate dashboard page to update UI
    revalidatePath('/dashboard');
    return { success: true };
}
