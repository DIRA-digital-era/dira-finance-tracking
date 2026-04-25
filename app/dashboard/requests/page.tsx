import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { redirect } from 'next/navigation';
import RequestRow from './RequestRow';

export default async function RequestsPage() {
   const session = await getSession();
   if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN')) {
      redirect('/dashboard');
   }

   const isSuperAdmin = session.role === 'SUPER_ADMIN';

   // Admins see only pending; Super Admin also sees resolved (for overturn)
   const pending = await query(`
      SELECT r.*, u.name as user_name, u.role as user_role,
        (SELECT json_agg(file_url) FROM receipts WHERE record_id = r.id) as receipts
      FROM records r
      JOIN users u ON r.user_id = u.id
      WHERE r.type = 'EXPENSE' AND r.status = 'PENDING'
      ORDER BY r.created_at ASC
   `);

   const resolved = isSuperAdmin ? await query(`
      SELECT r.*, u.name as user_name, u.role as user_role,
        (SELECT json_agg(file_url) FROM receipts WHERE record_id = r.id) as receipts
      FROM records r
      JOIN users u ON r.user_id = u.id
      WHERE r.type = 'EXPENSE' AND r.status != 'PENDING'
      ORDER BY r.created_at DESC
      LIMIT 30
   `) : { rows: [] };

   const pendingRequests = pending.rows;
   const resolvedRequests = resolved.rows;
   const totalAmount = pendingRequests.reduce((acc: number, req: any) => acc + parseFloat(req.amount), 0);

   return (
      <div className="space-y-6">
         <div className="flex justify-between items-end">
            <h2 className="text-2xl font-bold font-mono tracking-widest text-[var(--color-primary)]">REVIEW REQUESTS</h2>
         </div>

         <div className="grid grid-cols-2 gap-4 md:gap-6">
            <div className="bg-[var(--color-card)] rounded-xl p-4 md:p-6 border border-[var(--color-border)]">
               <p className="text-[10px] text-gray-400 tracking-widest uppercase">Total Pending Amount</p>
               <p className="text-2xl md:text-3xl font-mono text-[var(--color-foreground)] tracking-widest mt-2">{totalAmount.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})} XAF</p>
            </div>
            <div className="bg-[var(--color-card)] rounded-xl p-4 md:p-6 border border-[var(--color-border)]">
               <p className="text-[10px] text-gray-400 tracking-widest uppercase">Pending Requests</p>
               <p className="text-2xl md:text-3xl font-mono text-[var(--color-accent)] tracking-widest mt-2">{pendingRequests.length}</p>
            </div>
         </div>

         {/* Pending Queue */}
         <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] shadow-lg overflow-hidden">
             <div className="p-4 md:p-6 border-b border-[var(--color-border)] bg-[var(--color-background)]/50">
               <p className="text-xs font-bold tracking-widest uppercase text-orange-400">⬤ Pending Authorization Queue</p>
             </div>
             {/* Desktop table */}
             <table className="w-full text-left text-sm text-gray-300 hidden md:table">
                  <thead className="text-[10px] uppercase bg-[var(--color-input)]/50 text-gray-500">
                     <tr>
                        <th className="px-6 py-4 font-medium tracking-wider">Employee</th>
                        <th className="px-6 py-4 font-medium tracking-wider">Amount</th>
                        <th className="px-6 py-4 font-medium tracking-wider">Reason & Docs</th>
                        <th className="px-6 py-4 font-medium tracking-wider">Timestamp</th>
                        <th className="px-6 py-4 font-medium tracking-wider">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                     {pendingRequests.length === 0 ? (
                       <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Queue is clear.</td></tr>
                     ) : (
                       pendingRequests.map((r: any) => <RequestRow key={r.id} request={r} isSuperAdmin={isSuperAdmin} />)
                     )}
                  </tbody>
             </table>
             {/* Mobile cards */}
             <div className="md:hidden divide-y divide-[var(--color-border)]">
                 {pendingRequests.length === 0 && <div className="px-6 py-8 text-center text-gray-500">Queue is clear.</div>}
                 {pendingRequests.map((r: any) => (
                    <div key={r.id} className="p-4">
                       <RequestRow mobile request={r} isSuperAdmin={isSuperAdmin} />
                    </div>
                 ))}
             </div>
         </div>

         {/* Resolved requests (Super Admin overturn) */}
         {isSuperAdmin && (
           <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] shadow-lg overflow-hidden">
               <div className="p-4 md:p-6 border-b border-[var(--color-border)] bg-[var(--color-background)]/50">
                 <p className="text-xs font-bold tracking-widest uppercase text-[var(--color-accent)]">Director Override — Resolved Requests (Last 30)</p>
               </div>
               {/* Desktop table */}
               <table className="w-full text-left text-sm text-gray-300 hidden md:table">
                    <thead className="text-[10px] uppercase bg-[var(--color-input)]/50 text-gray-500">
                       <tr>
                          <th className="px-6 py-4 font-medium tracking-wider">Employee</th>
                          <th className="px-6 py-4 font-medium tracking-wider">Amount</th>
                          <th className="px-6 py-4 font-medium tracking-wider">Reason & Docs</th>
                          <th className="px-6 py-4 font-medium tracking-wider">Timestamp</th>
                          <th className="px-6 py-4 font-medium tracking-wider">Status / Overturn</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]">
                       {resolvedRequests.length === 0 ? (
                         <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No resolved requests yet.</td></tr>
                       ) : (
                         resolvedRequests.map((r: any) => <RequestRow key={r.id} request={r} isSuperAdmin={isSuperAdmin} />)
                       )}
                    </tbody>
               </table>
               {/* Mobile cards */}
               <div className="md:hidden divide-y divide-[var(--color-border)]">
                   {resolvedRequests.length === 0 && <div className="px-6 py-8 text-center text-gray-500">No resolved requests yet.</div>}
                   {resolvedRequests.map((r: any) => (
                      <div key={r.id} className="p-4">
                         <RequestRow mobile request={r} isSuperAdmin={isSuperAdmin} />
                      </div>
                   ))}
               </div>
           </div>
         )}
      </div>
   );
}
