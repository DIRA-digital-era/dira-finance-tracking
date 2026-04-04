import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { redirect } from 'next/navigation';
import IncomeForm from './IncomeForm';

export default async function LedgerPage() {
   const session = await getSession();
   if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN')) {
      redirect('/dashboard');
   }

   const res = await query(`
      SELECT r.*, u.name as user_name, u.email as user_email, u.role as user_role 
      FROM records r 
      JOIN users u ON r.user_id = u.id 
      ORDER BY r.created_at DESC
   `);

   const records = res.rows;

   const totalsRes = await query(`
      SELECT 
         SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END) as total_income,
         SUM(CASE WHEN type = 'EXPENSE' AND status = 'APPROVED' THEN amount ELSE 0 END) as total_expense
      FROM records
   `);
   
   const income = parseFloat(totalsRes.rows[0].total_income || '0');
   const expense = parseFloat(totalsRes.rows[0].total_expense || '0');
   const balance = income - expense;

   return (
      <div className="space-y-6">
         <div className="flex justify-between items-end">
            <h2 className="text-2xl font-bold font-mono tracking-widest text-[var(--color-primary)]">MASTER LEDGER</h2>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-[var(--color-card)] rounded-xl p-6 border border-[var(--color-border)]">
               <p className="text-[10px] text-gray-400 tracking-widest uppercase">Total Organization Income</p>
               <p className="text-3xl font-mono text-[var(--color-success)] tracking-widest mt-2">{income.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})} XAF</p>
            </div>
            <div className="bg-[var(--color-card)] rounded-xl p-6 border border-[var(--color-border)]">
               <p className="text-[10px] text-gray-400 tracking-widest uppercase">Approved Capital Exits</p>
               <p className="text-3xl font-mono text-[var(--color-danger)] tracking-widest mt-2">{expense.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})} XAF</p>
            </div>
            <div className="bg-[var(--color-card)] rounded-xl p-6 border border-[var(--color-border)]">
               <p className="text-[10px] text-gray-400 tracking-widest uppercase">Net Liquidity</p>
               <p className="text-3xl font-mono text-white tracking-widest mt-2">{balance.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})} XAF</p>
            </div>
         </div>

         <div className="bg-[var(--color-card)] rounded-xl p-6 border border-[var(--color-border)] shadow-lg overflow-x-auto">
             <div className="mb-4">
               <h3 className="text-sm font-bold text-[var(--color-primary)] uppercase tracking-wider mb-4">Record New Capital Injection</h3>
               <IncomeForm />
             </div>

             <h3 className="text-sm font-bold text-[var(--color-primary)] uppercase tracking-wider mb-4">Comprehensive Transaction Log</h3>
             <table className="w-full text-left text-sm text-gray-300">
                  <thead className="text-[10px] uppercase bg-[var(--color-input)]/50 text-gray-500">
                     <tr>
                        <th className="px-4 py-4 font-medium tracking-wider">ID</th>
                        <th className="px-4 py-4 font-medium tracking-wider">Type</th>
                        <th className="px-4 py-4 font-medium tracking-wider">Request / Source</th>
                        <th className="px-4 py-4 font-medium tracking-wider">Employee</th>
                        <th className="px-4 py-4 font-medium tracking-wider">Amount</th>
                        <th className="px-4 py-4 font-medium tracking-wider">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                     {records.length === 0 ? (
                       <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Log empty.</td></tr>
                     ) : (
                       records.map((r: any) => (
                          <tr key={r.id} className="hover:bg-[var(--color-input)]/20 transition-colors">
                             <td className="px-4 py-4 font-mono text-[10px]">#TRX-{r.id}</td>
                             <td className="px-4 py-4 text-[10px] font-bold">
                                {r.type === 'INCOME' ? 
                                    <span className="text-[var(--color-success)] bg-[var(--color-success)]/10 px-2 py-1 rounded">INCOME</span> 
                                  : <span className="text-orange-400 bg-orange-400/10 px-2 py-1 rounded">EXPENSE</span>
                                }
                             </td>
                             <td className="px-4 py-4 text-white">
                                <div className="font-medium">{r.title}</div>
                                <div className="text-[10px] text-gray-500 truncate max-w-[200px]">{r.description}</div>
                             </td>
                             <td className="px-4 py-4">
                                <div className="font-medium text-xs text-[var(--color-foreground)]">{r.user_name}</div>
                                <div className="text-[10px] text-gray-500">{r.user_email} • {r.user_role}</div>
                             </td>
                             <td className={`px-4 py-4 font-mono font-bold ${r.type === 'INCOME' ? 'text-[var(--color-success)]' : 'text-orange-400'}`}>
                                {r.type === 'INCOME' ? '+' : '-'}{parseFloat(r.amount).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})} XAF
                             </td>
                             <td className="px-4 py-4 text-[10px] uppercase font-bold tracking-widest text-gray-400">{r.status}</td>
                          </tr>
                       ))
                     )}
                  </tbody>
             </table>
         </div>
      </div>
   );
}
