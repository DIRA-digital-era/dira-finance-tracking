import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import Link from 'next/link';
import { ShieldAlert, Fingerprint } from 'lucide-react';
import ChartWrapper from '@/components/ChartWrapper';
import AnimatedNumber from '@/components/AnimatedNumber';

export default async function DashboardOverview() {
  const session = await getSession();
  
  const res = await query('SELECT * FROM records WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5', [session.user_id]);
  const records = res.rows;

  const totalSpentRes = await query(`SELECT SUM(amount) as total FROM records WHERE user_id = $1 AND type = 'EXPENSE'`, [session.user_id]);
  const totalSpent = totalSpentRes.rows[0].total || 0;

  const chartQuery = await query(`
      SELECT to_char(created_at, 'DD Mon') as name, SUM(amount) as value 
      FROM records 
      WHERE user_id = $1 AND type = 'EXPENSE' AND created_at > current_date - interval '30 days'
      GROUP BY to_char(created_at, 'DD Mon'), created_at::date
      ORDER BY created_at::date ASC
  `, [session.user_id]);

  let chartData = chartQuery.rows.map((r: any) => ({ name: r.name, value: parseFloat(r.value) }));
  if (chartData.length === 0) {
      chartData = [{ name: 'No recent data', value: 0 }];
  }

  const titlesRes = await query('SELECT jt.title FROM user_titles ut JOIN job_titles jt ON ut.title_id = jt.id WHERE ut.user_id = $1', [session.user_id]);
  const titles = titlesRes.rows.map((r: any) => r.title);

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-end">
          <h2 className="text-2xl font-bold font-mono tracking-widest text-[var(--color-primary)]">DASHBOARD</h2>
          <Link href="/dashboard/new-request" className="bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary-hover)] transition focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] font-bold py-2 px-4 rounded-lg text-xs tracking-widest hidden md:block">
             + NEW Request
          </Link>
       </div>
       
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[var(--color-card)] rounded-xl p-6 border border-[var(--color-border)] shadow-lg relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition">
                <Fingerprint className="w-24 h-24 text-[var(--color-primary)]" />
             </div>
             <p className="text-[10px] text-gray-400 tracking-widest flex justify-between uppercase relative z-10">Employee Identity <span className="bg-[var(--color-accent)]/20 text-[var(--color-accent)] px-1 rounded">LVL {session?.role === 'SUPER_ADMIN' ? 'MAX' : (session?.role === 'ADMIN' ? '2' : '1')}</span></p>
             <h3 className="text-xl font-bold mt-2 text-white relative z-10">{session.name}</h3>
             <p className="text-xs text-[var(--color-primary)] relative z-10 mb-4">{session.role}</p>
             
             <div className="flex flex-wrap gap-1 relative z-10">
                 {titles.length === 0 && <span className="text-[9px] text-gray-500 italic">No generic titles assigned</span>}
                 {titles.map((t: string, i: number) => (
                    <span key={i} className="text-[9px] bg-[var(--color-input)]/80 text-gray-300 px-2 py-1 border border-[var(--color-border)] rounded">{t}</span>
                 ))}
             </div>
          </div>
          
          <div className="bg-[var(--color-card)] rounded-xl p-6 border border-[var(--color-border)] shadow-lg relative z-10 overflow-hidden">
             <div className="absolute -right-8 -bottom-8 opacity-5">
                <svg width="150" height="150" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
             </div>
             <p className="text-[10px] text-gray-400 tracking-widest uppercase">Employee Expenditure</p>
             <div className="mt-4">
                 <p className="text-4xl font-mono font-bold text-white tracking-widest"><AnimatedNumber value={parseFloat(totalSpent)} durationMs={4000} /> XAF</p>
                 <p className="text-xs text-gray-500 mt-1">Total recorded outgoing capital</p>
             </div>
          </div>
          
          <div className="bg-[var(--color-card)] rounded-xl p-6 border border-[var(--color-border)] shadow-lg col-span-1 md:col-span-3 lg:col-span-1">
             <p className="text-[10px] text-gray-400 tracking-widest uppercase">System Integrity & Alerts</p>
             <div className="mt-4 space-y-4">
                <div className="flex items-center gap-4 bg-[var(--color-primary)]/5 p-3 rounded-lg border border-[var(--color-primary)]/20">
                   <ShieldAlert className="w-6 h-6 text-[var(--color-primary)]" />
                   <div>
                      <p className="text-sm font-bold text-white">Encryption Standard</p>
                      <p className="text-[10px] text-gray-400 font-mono">AES-256 Active Status: Secure</p>
                   </div>
                </div>
             </div>
          </div>
       </div>
       
       <div className="bg-[var(--color-card)] rounded-xl p-6 border border-[var(--color-border)] shadow-lg">
           <p className="text-[10px] text-gray-400 tracking-widest mb-4 uppercase">Actual Expenditure Velocity (30D)</p>
           <ChartWrapper data={chartData} />
       </div>

       <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] shadow-lg overflow-hidden">
           <div className="p-4 md:p-6 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-background)]/50">
               <p className="text-xs font-bold tracking-widest uppercase text-[var(--color-primary)]">Recent Submissions</p>
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
                       <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No recent submissions found.</td></tr>
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
       
       <Link href="/dashboard/new-request" className="md:hidden fixed bottom-20 right-4 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-full p-4 shadow-lg hover:shadow-[0_0_15px_rgba(0,255,204,0.5)] transition z-40">
           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
       </Link>
    </div>
  );
}
