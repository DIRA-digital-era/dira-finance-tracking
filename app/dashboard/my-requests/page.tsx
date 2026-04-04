import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { redirect } from 'next/navigation';

export default async function MyRequestsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const res = await query('SELECT * FROM records WHERE user_id = $1 AND type = $2 ORDER BY created_at DESC', [session.user_id, 'EXPENSE']);
  const records = res.rows;

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-end">
          <h2 className="text-2xl font-bold font-mono tracking-widest text-[var(--color-primary)]">MY AUTHORIZATION QUEUE</h2>
       </div>
       
       <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] shadow-lg overflow-hidden">
           <div className="p-4 md:p-6 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-background)]/50">
               <p className="text-xs font-bold tracking-widest uppercase text-[var(--color-primary)]">All Submitted Requests</p>
           </div>
           <div className="overflow-x-auto">
               <table className="w-full text-left text-sm text-gray-300">
                  <thead className="text-[10px] uppercase bg-[var(--color-input)]/50 text-gray-500">
                     <tr>
                        <th className="px-6 py-4 font-medium tracking-wider">Transaction ID</th>
                        <th className="px-6 py-4 font-medium tracking-wider">Request Title</th>
                        <th className="px-6 py-4 font-medium tracking-wider">Timestamp</th>
                        <th className="px-6 py-4 font-medium tracking-wider">Amount</th>
                        <th className="px-6 py-4 font-medium tracking-wider">Auth Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                     {records.length === 0 ? (
                       <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No submissions found.</td></tr>
                     ) : (
                       records.map((r: any) => (
                          <tr key={r.id} className="hover:bg-[var(--color-input)]/20 transition-colors">
                             <td className="px-6 py-4 font-mono text-[10px]">#DRF-{1000 + r.id}</td>
                             <td className="px-6 py-4 text-white font-medium">{r.title}</td>
                             <td className="px-6 py-4 text-[10px] text-gray-500 font-mono">{new Date(r.created_at).toLocaleString()}</td>
                             <td className="px-6 py-4 font-mono font-bold">{parseFloat(r.amount).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})} XAF</td>
                             <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider ${
                                   r.status === 'APPROVED' ? 'bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20' : 
                                   (r.status === 'DENIED' ? 'bg-[var(--color-danger)]/10 text-[var(--color-danger)] border border-[var(--color-danger)]/20' : 
                                   'bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20')
                                }`}>{r.status}</span>
                             </td>
                          </tr>
                       ))
                     )}
                  </tbody>
               </table>
           </div>
       </div>
    </div>
  );
}
