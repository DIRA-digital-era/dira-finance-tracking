'use client';
import { useState } from 'react';
import AnimatedNumber from '@/components/AnimatedNumber';
import { LayoutGrid, Table } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  APPROVED: 'bg-green-500/10 text-green-400 border border-green-500/20',
  DENIED: 'bg-red-500/10 text-red-400 border border-red-500/20',
  PENDING: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
};

export default function LedgerClientTable({ records }: { records: any[] }) {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [view, setView] = useState<'table' | 'cards'>('table');

    const filtered = records.filter((r) => {
        if (typeFilter !== 'ALL' && r.type !== typeFilter) return false;
        if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
        if (search) {
             const low = search.toLowerCase();
             return (r.title && r.title.toLowerCase().includes(low)) ||
                    (r.user_name && r.user_name.toLowerCase().includes(low)) ||
                    (r.amount && r.amount.toString().includes(low));
        }
        return true;
    });

    const calculateTotals = () => {
        let expenses = 0; let income = 0;
        filtered.forEach(r => {
             if(r.type === 'EXPENSE' && r.status !== 'DENIED') expenses += parseFloat(r.amount || 0);
             if(r.type === 'INCOME') income += parseFloat(r.amount || 0);
        });
        return { expenses, income, balance: income - expenses };
    };
    const totals = calculateTotals();

    const ViewToggle = () => (
      <div className="flex bg-[var(--color-input)] p-1 rounded-lg shrink-0">
        <button onClick={() => setView('table')} className={`px-3 py-1 rounded text-[10px] font-bold tracking-widest transition flex items-center gap-1 ${view === 'table' ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]' : 'text-slate-600 hover:text-[var(--color-foreground)]'}`}>
          <Table className="w-3 h-3" /> Table
        </button>
        <button onClick={() => setView('cards')} className={`px-3 py-1 rounded text-[10px] font-bold tracking-widest transition flex items-center gap-1 ${view === 'cards' ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]' : 'text-slate-600 hover:text-[var(--color-foreground)]'}`}>
          <LayoutGrid className="w-3 h-3" /> Cards
        </button>
      </div>
    );

    return (
        <div className="space-y-6">
           {/* Summary Cards */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[var(--color-card)] p-6 rounded-xl border border-[var(--color-border)] shadow-lg">
                 <p className="text-[10px] text-slate-700 tracking-widest uppercase">Filtered Total Income</p>
                 <p className="text-3xl font-mono font-bold text-[var(--color-success)] mt-2"><AnimatedNumber value={totals.income} /> XAF</p>
              </div>
              <div className="bg-[var(--color-card)] p-6 rounded-xl border border-[var(--color-border)] shadow-lg">
                 <p className="text-[10px] text-slate-700 tracking-widest uppercase">Filtered Total Expenses</p>
                 <p className="text-3xl font-mono font-bold text-[var(--color-danger)] mt-2"><AnimatedNumber value={totals.expenses} /> XAF</p>
              </div>
              <div className="bg-[var(--color-card)] p-6 rounded-xl border border-[var(--color-border)] shadow-lg relative overflow-hidden">
                 <div className="absolute right-0 top-0 h-full w-2 bg-[var(--color-primary)]"></div>
                 <p className="text-[10px] text-[var(--color-primary)] tracking-widest uppercase font-bold">Filtered Network Balance</p>
                 <p className="text-3xl font-mono font-bold text-[var(--color-foreground)] mt-2">
                    {totals.balance < 0 && "-"}
                    <AnimatedNumber value={Math.abs(totals.balance)} /> XAF
                 </p>
              </div>
           </div>

           {/* Filters + View Toggle */}
           <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] shadow-lg overflow-hidden">
               <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-background)]/50 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
                   <p className="text-xs font-bold tracking-widest uppercase text-[var(--color-primary)] shrink-0">Transaction Logs</p>
                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                      <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)} className="bg-[var(--color-input)] border border-[var(--color-border)] text-[10px] uppercase text-[var(--color-foreground)] px-3 py-2 rounded focus:outline-none">
                          <option value="ALL">All Types</option>
                          <option value="EXPENSE">Expense</option>
                          <option value="INCOME">Income</option>
                      </select>
                      <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="bg-[var(--color-input)] border border-[var(--color-border)] text-[10px] uppercase text-[var(--color-foreground)] px-3 py-2 rounded focus:outline-none">
                          <option value="ALL">All Status</option>
                          <option value="APPROVED">Approved</option>
                          <option value="PENDING">Pending</option>
                          <option value="DENIED">Denied</option>
                      </select>
                      <input type="text" placeholder="Search title, name..." value={search} onChange={e=>setSearch(e.target.value)} className="flex-1 min-w-[140px] md:w-48 bg-[var(--color-input)] border border-[var(--color-border)] px-3 py-2 text-xs text-[var(--color-foreground)] rounded focus:outline-none" />
                      <ViewToggle />
                   </div>
               </div>

               {/* Card View */}
               {view === 'cards' ? (
                 <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto">
                   {filtered.length === 0 ? (
                     <p className="text-slate-700 text-sm col-span-full text-center py-8">No records found.</p>
                   ) : filtered.map((r) => (
                     <div key={r.id} className="bg-[var(--color-input)]/40 border border-[var(--color-border)] rounded-xl p-4 hover:border-[var(--color-primary)]/40 transition-colors">
                       <div className="flex justify-between items-start mb-2">
                         <span className={`text-[9px] font-bold tracking-widest px-2 py-0.5 rounded ${r.type === 'INCOME' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{r.type}</span>
                         <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${STATUS_STYLES[r.status] || STATUS_STYLES.PENDING}`}>{r.status}</span>
                       </div>
                       <p className="font-bold text-[var(--color-foreground)] text-sm mb-1 truncate">{r.title}</p>
                       {r.user_name && r.type === 'EXPENSE' && <p className="text-[10px] text-[var(--color-primary)] font-mono truncate">{r.user_name}</p>}
                       <p className="text-sm font-mono font-bold mt-2 text-[var(--color-foreground)]">{parseFloat(r.amount).toLocaleString('en-US', {minimumFractionDigits: 0})} XAF</p>
                       <p className="text-[9px] text-slate-700 font-mono mt-2">{new Date(r.created_at).toLocaleString()}</p>
                     </div>
                   ))}
                 </div>
               ) : (
               /* Table View */
               <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                   <table className="w-full text-left text-sm text-[var(--color-foreground)]">
                      <thead className="text-[10px] uppercase bg-[var(--color-input)] text-slate-700 sticky top-0 z-10">
                         <tr>
                            <th className="px-6 py-4 font-medium tracking-wider">ID</th>
                            <th className="px-4 py-4 font-medium tracking-wider">Type</th>
                            <th className="px-6 py-4 font-medium tracking-wider">Request / Source</th>
                            <th className="px-4 py-4 font-medium tracking-wider hidden md:table-cell">Employee</th>
                            <th className="px-6 py-4 font-medium tracking-wider hidden lg:table-cell">Time</th>
                            <th className="px-6 py-4 font-medium tracking-wider">Amount</th>
                            <th className="px-6 py-4 font-medium tracking-wider">Status</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--color-border)]">
                         {filtered.length === 0 ? (
                           <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-700">No records found.</td></tr>
                         ) : (
                           filtered.map((r) => (
                               <tr key={r.id} className="hover:bg-[var(--color-input)] transition-colors">
                                 <td className="px-6 py-4 font-mono text-[10px] text-slate-700">#TRX-{2000 + r.id}</td>
                                 <td className="px-4 py-4">
                                     <span className={`text-[10px] font-bold tracking-widest px-2 py-0.5 rounded ${r.type === 'INCOME' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {r.type}
                                     </span>
                                 </td>
                                 <td className="px-6 py-4 text-[var(--color-foreground)] font-medium">
                                     {r.title}
                                     <span className="block text-[10px] text-slate-700 truncate mt-1 max-w-[160px]">{r.description}</span>
                                 </td>
                                 <td className="px-4 py-4 hidden md:table-cell">
                                     {r.type === 'INCOME' ? (
                                        <span className="text-[10px] text-slate-700 font-mono">External / Director</span>
                                     ) : (
                                        <div>
                                           <span className="block font-bold text-slate-800 text-xs">{r.user_name}</span>
                                           <span className="block text-[10px] text-[var(--color-primary)] font-mono">{r.user_email}</span>
                                        </div>
                                     )}
                                 </td>
                                 <td className="px-6 py-4 text-[10px] text-slate-700 font-mono hidden lg:table-cell">{new Date(r.created_at).toLocaleString()}</td>
                                 <td className="px-6 py-4 font-mono font-bold text-[var(--color-foreground)]">{parseFloat(r.amount).toLocaleString('en-US', {minimumFractionDigits: 0})} XAF</td>
                                 <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider ${STATUS_STYLES[r.status] || STATUS_STYLES.PENDING}`}>{r.status}</span>
                                 </td>
                              </tr>
                           ))
                         )}
                      </tbody>
                   </table>
               </div>
               )}
           </div>
        </div>
    );
}
