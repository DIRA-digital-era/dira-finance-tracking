'use client';
import { useState } from 'react';

export default function LedgerClientTable({ records }: { records: any[] }) {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');

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

    return (
        <div className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[var(--color-card)] p-6 rounded-xl border border-[var(--color-border)] shadow-lg">
                 <p className="text-[10px] text-gray-400 tracking-widest uppercase">Filtered Total Income</p>
                 <p className="text-3xl font-mono font-bold text-[var(--color-success)] mt-2">{totals.income.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})} XAF</p>
              </div>
              <div className="bg-[var(--color-card)] p-6 rounded-xl border border-[var(--color-border)] shadow-lg">
                 <p className="text-[10px] text-gray-400 tracking-widest uppercase">Filtered Total Expenses</p>
                 <p className="text-3xl font-mono font-bold text-[var(--color-danger)] mt-2">{totals.expenses.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})} XAF</p>
              </div>
              <div className="bg-[var(--color-card)] p-6 rounded-xl border border-[var(--color-border)] shadow-lg relative overflow-hidden">
                 <div className="absolute right-0 top-0 h-full w-2 bg-[var(--color-primary)]"></div>
                 <p className="text-[10px] text-[var(--color-primary)] tracking-widest uppercase font-bold">Filtered Network Balance</p>
                 <p className="text-3xl font-mono font-bold text-[var(--color-foreground)] mt-2">{totals.balance.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})} XAF</p>
              </div>
           </div>

           <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] shadow-lg overflow-hidden flex flex-col">
               <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-background)]/50 flex flex-col md:flex-row justify-between items-center gap-4">
                   <p className="text-xs font-bold tracking-widest uppercase text-[var(--color-primary)]">Filtered Transaction Logs</p>
                   <div className="flex gap-2 w-full md:w-auto">
                      <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)} className="bg-[var(--color-input)] border border-[var(--color-border)] text-[10px] uppercase text-white px-3 py-2 rounded focus:outline-none">
                          <option value="ALL">All Types</option>
                          <option value="EXPENSE">Expense</option>
                          <option value="INCOME">Income</option>
                      </select>
                      <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="bg-[var(--color-input)] border border-[var(--color-border)] text-[10px] uppercase text-white px-3 py-2 rounded focus:outline-none">
                          <option value="ALL">All Status</option>
                          <option value="APPROVED">Approved</option>
                          <option value="PENDING">Pending</option>
                          <option value="DENIED">Denied</option>
                      </select>
                      <input type="text" placeholder="Search title, name, amount..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full md:w-64 bg-[var(--color-input)] border border-[var(--color-border)] px-3 py-2 text-xs text-white rounded focus:outline-none" />
                   </div>
               </div>
               <div className="overflow-x-auto flex-1 h-[600px] overflow-y-auto w-full relative">
                   <table className="w-full text-left text-sm text-gray-300 relative">
                      <thead className="text-[10px] uppercase bg-[var(--color-input)] text-gray-500 sticky top-0 z-10 shadow shadow-black">
                         <tr>
                            <th className="px-6 py-4 font-medium tracking-wider">Transaction ID</th>
                            <th className="px-6 py-4 font-medium tracking-wider">Type</th>
                            <th className="px-6 py-4 font-medium tracking-wider">Request / Source</th>
                            <th className="px-4 py-4 font-medium tracking-wider">Employee</th>
                            <th className="px-6 py-4 font-medium tracking-wider">Timestamp</th>
                            <th className="px-6 py-4 font-medium tracking-wider">Amount</th>
                            <th className="px-6 py-4 font-medium tracking-wider">Status</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--color-border)] bg-[var(--color-card)] relative z-0">
                         {filtered.length === 0 ? (
                           <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">No records found.</td></tr>
                         ) : (
                           filtered.map((r) => (
                              <tr key={r.id} className="hover:bg-[var(--color-input)]/20 transition-colors">
                                 <td className="px-6 py-4 font-mono text-[10px]">#TRX-{2000 + r.id}</td>
                                 <td className="px-6 py-4">
                                     <span className={`text-[10px] font-bold tracking-widest px-2 py-0.5 rounded ${r.type === 'INCOME' ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' : 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]'}`}>
                                        {r.type}
                                     </span>
                                 </td>
                                 <td className="px-6 py-4 text-white font-medium">
                                     {r.title}
                                     <span className="block text-[10px] text-gray-500 truncate mt-1 w-48">{r.description}</span>
                                 </td>
                                 <td className="px-4 py-4">
                                     {r.type === 'INCOME' ? (
                                        <span className="text-[10px] text-gray-500 font-mono">- EXTERNAL SOURCE -</span>
                                     ) : (
                                        <div>
                                           <span className="block font-bold text-gray-300">{r.user_name}</span>
                                           <span className="block text-[10px] text-[var(--color-primary)] font-mono">{r.user_email}</span>
                                        </div>
                                     )}
                                 </td>
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
