import { query } from './db';

export async function createLog(actor_id: number, action: string, details: string, target_id?: number | null, record_id?: number | null) {
  try {
     await query(
        `INSERT INTO system_logs (actor_id, action, details, target_id, record_id) VALUES ($1, $2, $3, $4, $5)`,
        [actor_id, action, details, target_id || null, record_id || null]
     );
  } catch(e) {
     console.error('Failed to log action:', e);
  }
}

export async function createNotification(user_id: number, title: string, message: string) {
  try {
     await query(
        `INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)`,
        [user_id, title, message]
     );
  } catch(e) {
     console.error('Failed to create notification:', e);
  }
}
