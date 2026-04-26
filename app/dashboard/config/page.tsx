import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { redirect } from 'next/navigation';
import { AddJobTitleForm, UpdateLimitForm, UpdateLimitPeriodForm } from './ClientForms';

export default async function ConfigPage() {
   const session = await getSession();
   if (!session || session.role !== 'SUPER_ADMIN') {
      redirect('/dashboard');
   }

   const titlesRes = await query('SELECT * FROM job_titles ORDER BY title ASC');
   const configRes = await query('SELECT * FROM config');
   const logsRes = await query(`
       SELECT l.*, u.name as actor_name, u.email as actor_email
       FROM system_logs l
       JOIN users u ON l.actor_id = u.id
       ORDER BY l.created_at DESC
       LIMIT 50
   `);

   const getConfig = (k: string) => {
       const found = configRes.rows.find((c: any) => c.key === k);
       return found ? JSON.parse(found.value) : '';
   };

   return (
      <div className="space-y-6 max-w-5xl">
         <h2 className="text-2xl font-bold font-mono tracking-widest text-[var(--color-primary)]">SYSTEM SETTINGS</h2>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Configuration Left */}
             <div className="space-y-6">
                 <div className="bg-[var(--color-card)] rounded-xl p-6 border border-[var(--color-border)] shadow-lg">
                     <p className="text-[10px] text-[var(--color-primary)] tracking-widest mb-4 uppercase">Spending Limits by Role</p>
                     <div className="space-y-4">
                         <UpdateLimitForm configKey="max_request_level_1" label="Staff Limit" currentValue={getConfig('max_request_level_1')} />
                         <UpdateLimitForm configKey="max_request_level_2" label="Admin Limit" currentValue={getConfig('max_request_level_2')} />
                         <UpdateLimitForm configKey="max_request_level_3" label="Director Limit" currentValue={getConfig('max_request_level_3')} />
                         <div className="pt-4 border-t border-[var(--color-border)]">
                             <UpdateLimitPeriodForm currentValue={getConfig('limit_period')} />
                         </div>
                     </div>
                 </div>

                 <div className="bg-[var(--color-card)] rounded-xl p-6 border border-[var(--color-border)] shadow-lg">
                     <p className="text-[10px] text-[var(--color-primary)] tracking-widest mb-4 uppercase">Job Titles</p>
                     <div className="flex flex-wrap gap-2 mb-4">
                         {titlesRes.rows.map((t: any) => (
                             <span key={t.id} className="bg-[var(--color-input)] border border-[var(--color-border)] px-3 py-1 rounded text-xs text-[var(--color-foreground)]">
                                 {t.title}
                             </span>
                         ))}
                     </div>
                     <div className="border-t border-[var(--color-border)]">
                         <AddJobTitleForm />
                     </div>
                 </div>
             </div>

             {/* Audit Logs Right */}
             <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] shadow-lg flex flex-col h-[600px]">
                 <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-background)]/50">
                     <p className="text-[10px] text-[var(--color-primary)] tracking-widest uppercase font-bold">Activity Log (Recent 50)</p>
                 </div>
                 <div className="flex-1 overflow-y-auto divide-y divide-[var(--color-border)]">
                     {logsRes.rows.map((log: any) => (
                         <div key={log.id} className="p-4 hover:bg-[var(--color-input)]/20 transition-colors">
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded ${
                                    log.action.includes('DENIED') ? 'bg-red-500/20 text-red-400' :
                                    log.action.includes('APPROVED') ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                                }`}>{log.action}</span>
                                <span className="text-[9px] text-gray-500 font-mono">{new Date(log.created_at).toLocaleString()}</span>
                            </div>
                            <p className="text-sm text-[var(--color-foreground)] mt-2">{log.details}</p>
                            <p className="text-[10px] text-gray-500 mt-1">By: {log.actor_name} ({log.actor_email})</p>
                         </div>
                     ))}
                 </div>
             </div>
         </div>
      </div>
   );
}
