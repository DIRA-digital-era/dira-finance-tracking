import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import Link from 'next/link';
import { ShieldAlert, Fingerprint } from 'lucide-react';
import ChartWrapper from '@/components/ChartWrapper';
import AnimatedNumber from '@/components/AnimatedNumber';
import RecentSubmissions from '@/components/RecentSubmissions';

export default async function DashboardOverview() {
  const session = await getSession();
  
  const res = await query('SELECT * FROM records WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5', [session.user_id]);
  const records = res.rows;

  // Global total spent
  const totalSpentRes = await query(`SELECT SUM(amount) as total FROM records WHERE user_id = $1 AND type = 'EXPENSE' AND status != 'DENIED'`, [session.user_id]);
  const totalSpent = totalSpentRes.rows[0].total || 0;

  // Get Config limit info
  const configRes = await query('SELECT key, value FROM config');
  const configs = Object.fromEntries(configRes.rows.map((r: any) => [r.key, JSON.parse(r.value)]));
  
  const limitPeriod = configs['limit_period'] || 'monthly';
  const limitRole = session.role === 'SUPER_ADMIN' ? 3 : (session.role === 'ADMIN' ? 2 : 1);
  const limitKey = `max_request_level_${limitRole}`;
  const baseLimit = parseFloat(configs[limitKey] || '500000');

  // get date interval
  const intervalStr = limitPeriod === 'weekly' ? '1 week' : '1 month';

  // Expenditures in active period
  const totalSpentPeriodRes = await query(`
    SELECT COALESCE(SUM(amount), 0) as total FROM records 
    WHERE user_id = $1 AND type = 'EXPENSE' AND status != 'DENIED' AND created_at > current_date - interval '${intervalStr}'
  `, [session.user_id]);
  const spentPeriod = parseFloat(totalSpentPeriodRes.rows[0].total) || 0;

  // Dispatched funds in active period
  const dispatchedPeriodRes = await query(`
    SELECT COALESCE(SUM(amount), 0) as total FROM records 
    WHERE user_id = $1 AND type = 'DISPATCH' AND created_at > current_date - interval '${intervalStr}'
  `, [session.user_id]);
  const dispatchedPeriod = parseFloat(dispatchedPeriodRes.rows[0].total) || 0;

  const activeBudget = baseLimit + dispatchedPeriod;
  const remainingBudget = Math.max(0, activeBudget - spentPeriod);
  const percentageUsed = Math.min(100, (spentPeriod / activeBudget) * 100) || 0;

  // Chart: actual expense spend per day (30 days)
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
             <p className="text-[10px] text-slate-700 tracking-widest flex justify-between uppercase relative z-10">Employee Identity <span className="bg-[var(--color-accent)]/20 text-[var(--color-accent)] px-1 rounded">LVL {session?.role === 'SUPER_ADMIN' ? 'MAX' : (session?.role === 'ADMIN' ? '2' : '1')}</span></p>
             <h3 className="text-xl font-bold mt-2 text-[var(--color-foreground)] relative z-10">{session.name}</h3>
             <p className="text-xs text-[var(--color-primary)] relative z-10 mb-4">{session.role}</p>
             
             <div className="flex flex-wrap gap-1 relative z-10">
                 {titles.length === 0 && <span className="text-[9px] text-slate-500 italic">No generic titles assigned</span>}
                 {titles.map((t: string, i: number) => (
                    <span key={i} className="text-[9px] bg-[var(--color-input)]/80 text-slate-700 px-2 py-1 border border-[var(--color-border)] rounded">{t}</span>
                 ))}
             </div>
          </div>
          
          <div className="bg-[var(--color-card)] rounded-xl p-6 border border-[var(--color-border)] shadow-lg relative z-10 overflow-hidden">
             <div className="absolute -right-8 -bottom-8 opacity-5">
                <svg width="150" height="150" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
             </div>
             <p className="text-[10px] text-slate-700 tracking-widest uppercase">Employee Expenditure</p>
             <div className="mt-4">
                 <p className="text-4xl font-mono font-bold text-[var(--color-foreground)] tracking-widest"><AnimatedNumber value={parseFloat(totalSpent)} durationMs={4000} /> XAF</p>
                 <p className="text-xs text-slate-600 mt-1">Total recorded outgoing capital</p>
             </div>
          </div>
          
          <div className="bg-[var(--color-card)] rounded-xl p-6 border border-[var(--color-border)] shadow-lg col-span-1 md:col-span-3 lg:col-span-1 flex flex-col justify-between relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                 <ShieldAlert className="w-24 h-24 text-[var(--color-primary)]" />
             </div>
             <div>
                 <p className="text-[10px] text-[var(--color-primary)] font-bold tracking-widest flex items-center justify-between uppercase">
                     Available Budget ({limitPeriod})
                     <span className="text-[9px] bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2 py-0.5 rounded border border-[var(--color-primary)]/20">Active</span>
                 </p>
                 <div className="mt-5">
                     <p className="text-2xl font-mono font-bold text-[var(--color-foreground)] tracking-widest"><AnimatedNumber value={remainingBudget} /> XAF</p>
                     <p className="text-[10px] text-slate-600 mt-1">of <span className="text-slate-800 font-mono">{activeBudget.toLocaleString('en-US')}</span> allocated limit</p>
                 </div>
             </div>
                 <div className="mt-4">
                     <div className="w-full bg-[var(--color-input)] rounded-full h-2 border border-[var(--color-border)]">
                         <div className={`h-2 rounded-full transition-all duration-1000 ${percentageUsed > 90 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : percentageUsed > 75 ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'bg-[var(--color-success)] shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`} style={{ width: `${percentageUsed}%` }}></div>
                     </div>
                 <div className="flex justify-between items-center mt-2">
                     <p className="text-[9px] text-slate-700 font-mono">{percentageUsed.toFixed(1)}% Used</p>
                     {dispatchedPeriod > 0 && <p className="text-[9px] text-[var(--color-success)] font-mono">+{dispatchedPeriod.toLocaleString()} Dispatched</p>}
                 </div>
             </div>
          </div>
       </div>
       
       <div className="bg-[var(--color-card)] rounded-xl p-6 border border-[var(--color-border)] shadow-lg">
           <p className="text-[10px] text-slate-700 tracking-widest mb-4 uppercase">Actual Expenditure Velocity (30D)</p>
           <ChartWrapper data={chartData} />
       </div>

       <RecentSubmissions records={records} />

       <Link href="/dashboard/new-request" className="md:hidden fixed bottom-20 right-4 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-full p-4 shadow-lg hover:shadow-[0_0_15px_rgba(0,229,255,0.5)] transition z-40">
           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
       </Link>
    </div>
  );
}
