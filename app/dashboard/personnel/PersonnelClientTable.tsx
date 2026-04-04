'use client';

import { useState } from 'react';
import { toggleUserStatus, deleteUserAction } from './actions';
import { toast } from 'sonner';

export default function PersonnelClientTable({ users }: { users: any[] }) {
    const [tab, setTab] = useState<'ACTIVE' | 'PAST'>('ACTIVE');
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('ALL');

    const filtered = users.filter(u => {
        if (tab === 'PAST' && u.status !== 'DELETED') return false;
        if (tab === 'ACTIVE' && u.status === 'DELETED') return false;
        if (filterRole !== 'ALL' && u.role !== filterRole) return false;
        if (search) {
            const low = search.toLowerCase();
            return u.name.toLowerCase().includes(low) || u.email.toLowerCase().includes(low) || (u.titles || []).some((t: string) => t.toLowerCase().includes(low));
        }
        return true;
    });

    const handleToggleStatus = async (id: number, status: string) => {
        const res = await toggleUserStatus(id, status);
        if(res.success) toast.success(res.message);
        else toast.error(res.message);
    };

    const handleDelete = async (id: number) => {
        if(!confirm('Are you sure you want to mark this employee as deleted/past?')) return;
        const res = await deleteUserAction(id);
        if(res.success) toast.success(res.message);
        else toast.error(res.message);
    };

    return (
        <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] shadow-lg overflow-hidden mt-6">
             <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-background)]/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                 <div className="flex bg-[var(--color-input)] p-1 rounded-lg">
                     <button onClick={() => setTab('ACTIVE')} className={`px-4 py-1.5 rounded-md text-xs font-bold tracking-widest transition ${tab === 'ACTIVE' ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]' : 'text-gray-400 hover:text-white'}`}>CURRENT STAFF</button>
                     <button onClick={() => setTab('PAST')} className={`px-4 py-1.5 rounded-md text-xs font-bold tracking-widest transition ${tab === 'PAST' ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]' : 'text-gray-400 hover:text-white'}`}>PAST EMPLOYEES</button>
                 </div>
                 
                 <div className="flex gap-2 w-full md:w-auto">
                     <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="bg-[var(--color-input)] border border-[var(--color-border)] text-xs text-white px-3 py-2 rounded focus:outline-none">
                         <option value="ALL">All Roles</option>
                         <option value="SUPER_ADMIN">Director (L3)</option>
                         <option value="ADMIN">Admin (L2)</option>
                         <option value="EMPLOYEE">Employee (L1)</option>
                     </select>
                     <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter by name, ID or title..." className="flex-1 md:w-64 bg-[var(--color-input)] border border-[var(--color-border)] px-3 py-2 text-xs text-white rounded focus:outline-none" />
                 </div>
             </div>

             <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm text-gray-300">
                      <thead className="text-[10px] uppercase bg-[var(--color-input)]/50 text-gray-500">
                         <tr>
                            <th className="px-6 py-4 font-medium tracking-wider">Identity</th>
                            <th className="px-6 py-4 font-medium tracking-wider hidden md:table-cell">Professional Titles</th>
                            <th className="px-6 py-4 font-medium tracking-wider text-center">Clearance</th>
                            <th className="px-6 py-4 font-medium tracking-wider">Status</th>
                            {tab === 'ACTIVE' && <th className="px-6 py-4 font-medium tracking-wider text-right">Actions</th>}
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--color-border)]">
                         {filtered.length === 0 ? (
                           <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No personnel match criteria.</td></tr>
                         ) : (
                           filtered.map((u) => (
                              <tr key={u.id} className={`hover:bg-[var(--color-input)]/20 transition-colors group ${u.status === 'SUSPENDED' ? 'opacity-60' : ''}`}>
                                 <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 rounded bg-[var(--color-input)] border border-[var(--color-border)] flex items-center justify-center font-bold text-gray-400">
                                          {u.name.substring(0,2).toUpperCase()}
                                       </div>
                                       <div>
                                          <p className="font-bold text-white">{u.name}</p>
                                          <p className="text-[10px] text-[var(--color-primary)] font-mono">{u.email}</p>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-6 py-4 hidden md:table-cell">
                                    <span className="bg-[var(--color-input)] border border-[var(--color-border)] px-3 py-1 rounded text-[10px] uppercase tracking-wider text-gray-400 block w-fit mb-1">
                                       {u.role}
                                    </span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                       {(u.titles || []).map((t: string, i: number) => (
                                          <span key={i} className="text-[9px] bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-2 py-0.5 rounded border border-[var(--color-accent)]/20">{t}</span>
                                       ))}
                                    </div>
                                 </td>
                                 <td className="px-6 py-4 text-center">
                                    <span className="font-bold tracking-widest text-[var(--color-primary)] text-xs">LEVEL {u.clearance_level}</span>
                                 </td>
                                 <td className="px-6 py-4">
                                    <span className={`flex items-center gap-2 font-bold tracking-widest text-[10px] ${u.status === 'ACTIVE' ? 'text-[var(--color-success)]' : (u.status === 'DELETED' ? 'text-gray-500' : 'text-[var(--color-danger)]')}`}>
                                       <span className={`w-2 h-2 rounded-full ${u.status === 'ACTIVE' ? 'bg-[var(--color-success)]' : (u.status === 'DELETED' ? 'bg-gray-500' : 'bg-[var(--color-danger)]')}`}></span>
                                       {u.status}
                                    </span>
                                 </td>
                                 {tab === 'ACTIVE' && (
                                     <td className="px-6 py-4 text-right">
                                         <div className="flex justify-end gap-2 text-xs">
                                             <button onClick={() => handleToggleStatus(u.id, u.status)} className="px-3 py-1 rounded bg-[var(--color-input)] hover:text-white transition">
                                                 {u.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                                             </button>
                                             <button onClick={() => handleDelete(u.id)} className="px-3 py-1 rounded bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition">
                                                 Delete
                                             </button>
                                         </div>
                                     </td>
                                 )}
                              </tr>
                           ))
                         )}
                      </tbody>
                 </table>
             </div>
        </div>
    );
}
