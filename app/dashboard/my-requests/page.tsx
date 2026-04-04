import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { redirect } from 'next/navigation';
import MyRequestsClient from './MyRequestsClient';

export default async function MyRequestsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const res = await query(
    `SELECT r.*, 
       (SELECT json_agg(file_url) FROM receipts WHERE record_id = r.id) as receipts
     FROM records r WHERE r.user_id = $1 AND r.type = 'EXPENSE' ORDER BY r.created_at DESC`,
    [session.user_id]
  );
  const records = res.rows;

  return (
    <div className="space-y-6">
       <h2 className="text-2xl font-bold font-mono tracking-widest text-[var(--color-primary)]">MY AUTHORIZATION QUEUE</h2>
       <MyRequestsClient records={records} />
    </div>
  );
}
