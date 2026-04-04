'use client';

import { useState } from 'react';
import { toggleUserStatus, deleteUserAction, reinstateUserAction } from './actions';
import { toast } from 'sonner';
import { playSuccessSound, playErrorSound } from '@/lib/audio';
import EditUserForm from './EditUserForm';

export default function PersonnelClientTable({ users, jobTitles, currentRole }: { users: any[], jobTitles: any[], currentRole: string }) {
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
        if(res.success) { playSuccessSound(); toast.success(res.message); }
        else { playErrorSound(); toast.error(res.message); }
    };

    const handleDelete = async (id: number) => {
        if(!confirm('Are you sure you want to mark this employee as deleted/past?')) return;
        const res = await deleteUserAction(id);
        if(res.success) { playSuccessSound(); toast.success(res.message); }
        else { playErrorSound(); toast.error(res.message); }
    };

    const handleReinstate = async (id: number) => {
        if(!confirm('Are you sure you want to reinstate this employee?')) return;
        const res = await reinstateUserAction(id);
        if(res.success) { playSuccessSound(); toast.success(res.message); }
        else { playErrorSound(); toast.error(res.message); }
    };

    return (
        <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] shadow-lg overflow-hidden mt-6">
             <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-background)]/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                 <div className="flex bg-[var(--color-input)] p-1 rounded-lg w-full md:w-auto overflow-x-auto shrink-0">
                     <button onClick={() => setTab('ACTIVE')} className={`px-4 py-1.5 rounded-md text-xs font-bold tracking-widest transition whitespace-nowrap ${tab === 'ACTIVE' ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]' : 'text-gray-400 hover:text-white'}`}>CURRENT STAFF</button>
                     <button onClick={() => setTab('PAST')} className={`px-4 py-1.5 rounded-md text-xs font-bold tracking-widest transition whitespace-nowrap ${tab === 'PAST' ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]' : 'text-gray-400 hover:text-white'}`}>PAST EMPLOYEES</button>
                 </div>
                 
                 <div className="flex gap-2 w-full md:w-auto shrink-0">
                     <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="bg-[var(--color-input)] border border-[var(--color-border)] text-[10px] text-white px-3 py-2 rounded focus:outline-none uppercase">
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
                            <th className="px-6 py-4 font-medium tracking-wider hidden lg:table-cell">Professional Titles</th>
                            <th className="px-6 py-4 font-medium tracking-wider text-center hidden sm:table-cell">Clearance</th>
                            <th className="px-6 py-4 font-medium tracking-wider">Status</th>
                            <th className="px-6 py-4 font-medium tracking-wider text-right">Actions</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--color-border)]">
                         {filtered.length === 0 ? (
                           <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No personnel match criteria.</td></tr>
                         ) : (
                           filtered.map((u) => (
                              <tr key={u.id} className={`hover:bg-[var(--color-input)]/20 transition-colors group ${u.status === 'SUSPENDED' ? 'opacity-60' : ''}`}>
                                 <td className="px-4 py-4 min-w-[200px]">
                                    <div className="flex items-center gap-3">
                                       <div className="w-10 h-10 rounded shrink-0 bg-[var(--color-input)] border border-[var(--color-border)] flex items-center justify-center font-bold text-gray-400">
                                          {u.name.substring(0,2).toUpperCase()}
                                       </div>
                                       <div className="truncate">
                                          <p className="font-bold text-white truncate">{u.name}</p>
                                          <p className="text-[10px] text-[var(--color-primary)] font-mono truncate">{u.email}</p>
                                          <p className="text-[10px] text-gray-500 sm:hidden">{u.role}</p>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-6 py-4 hidden lg:table-cell">
                                    <span className="bg-[var(--color-input)] border border-[var(--color-border)] px-3 py-1 rounded text-[10px] uppercase tracking-wider text-gray-400 block w-fit mb-1">
                                       {u.role}
                                    </span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                       {(u.titles || []).map((t: string, i: number) => (
                                          <span key={i} className="text-[9px] bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-2 py-0.5 rounded border border-[var(--color-accent)]/20">{t}</span>
                                       ))}
                                    </div>
                                 </td>
                                 <td className="px-6 py-4 text-center hidden sm:table-cell">
                                    <span className="font-bold tracking-widest text-[var(--color-primary)] text-xs">LEVEL {u.clearance_level}</span>
                                 </td>
                                 <td className="px-6 py-4">
                                    <span className={`flex items-center gap-2 font-bold tracking-widest text-[10px] ${u.status === 'ACTIVE' ? 'text-[var(--color-success)]' : (u.status === 'DELETED' ? 'text-gray-500' : 'text-[var(--color-danger)]')}`}>
                                       <span className={`w-2 h-2 rounded-full shrink-0 ${u.status === 'ACTIVE' ? 'bg-[var(--color-success)]' : (u.status === 'DELETED' ? 'bg-gray-500' : 'bg-[var(--color-danger)]')}`}></span>
                                       {u.status}
                                    </span>
                                 </td>
                                 <td className="px-6 py-4 text-right">
                                     <div className="flex justify-end gap-2 text-xs">
                                         {tab === 'ACTIVE' ? (
                                           <>
                                             <EditUserForm user={u} currentRole={currentRole} jobTitles={jobTitles} />
                                             {/* Only SUPER_ADMIN can suspend/delete other ADMINs */}
                                             {(u.role !== 'ADMIN' && u.role !== 'SUPER_ADMIN') || currentRole === 'SUPER_ADMIN' ? (
                                               <>
                                                 <button
                                                   onClick={() => handleToggleStatus(u.id, u.status)}
                                                   className="px-3 py-1 rounded bg-[var(--color-input)] hover:text-white transition hidden md:inline-block"
                                                 >
                                                   {u.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                                                 </button>
                                                 <button
                                                   onClick={() => handleDelete(u.id)}
                                                   className="px-3 py-1 rounded bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition"
                                                 >
                                                   Delete
                                                 </button>
                                               </>
                                             ) : (
                                               <span className="text-[9px] text-gray-600 italic hidden md:inline">L3 access required</span>
                                             )}
                                           </>
                                         ) : (
                                           <button
                                             onClick={() => handleReinstate(u.id)}
                                             className="px-3 py-1 rounded bg-[var(--color-primary)]/20 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-[var(--color-primary-foreground)] transition font-bold tracking-widest"
                                           >
                                             REINSTATE
                                           </button>
                                         )}
                                     </div>
                                 </td>
                              </tr>
                           ))
                         )}
                      </tbody>
                 </table>
             </div>
        </div>
    );
}
