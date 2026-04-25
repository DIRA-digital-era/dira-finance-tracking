'use client';
import { useState } from 'react';
import { toggleUserStatus, deleteUserAction, reinstateUserAction } from './actions';
import { toast } from 'sonner';
import { playSuccessSound, playErrorSound } from '@/lib/audio';
import EditUserForm from './EditUserForm';
import { LayoutGrid, Table } from 'lucide-react';

export default function PersonnelClientTable({ users, jobTitles, currentRole }: { users: any[], jobTitles: any[], currentRole: string }) {
    const [tab, setTab] = useState<'ACTIVE' | 'PAST'>('ACTIVE');
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('ALL');
    const [view, setView] = useState<'table' | 'cards'>('table');

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
        if(!confirm('Remove this staff member?')) return;
        const res = await deleteUserAction(id);
        if(res.success) { playSuccessSound(); toast.success(res.message); }
        else { playErrorSound(); toast.error(res.message); }
    };
    const handleReinstate = async (id: number) => {
        if(!confirm('Bring back this staff member?')) return;
        const res = await reinstateUserAction(id);
        if(res.success) { playSuccessSound(); toast.success(res.message); }
        else { playErrorSound(); toast.error(res.message); }
    };

    const ViewToggle = () => (
      <div className="flex bg-[var(--color-input)] p-1 rounded-lg shrink-0">
        <button onClick={() => setView('table')} className={`px-3 py-1 rounded text-[10px] font-bold tracking-widest transition flex items-center gap-1 ${view === 'table' ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]' : 'text-gray-400 hover:text-white'}`}>
          <Table className="w-3 h-3" /> Table
        </button>
        <button onClick={() => setView('cards')} className={`px-3 py-1 rounded text-[10px] font-bold tracking-widest transition flex items-center gap-1 ${view === 'cards' ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]' : 'text-gray-400 hover:text-white'}`}>
          <LayoutGrid className="w-3 h-3" /> Cards
        </button>
      </div>
    );

    const ActionButtons = ({ u }: { u: any }) => (
      <>
        {tab === 'ACTIVE' ? (
          <>
            <EditUserForm user={u} currentRole={currentRole} jobTitles={jobTitles} />
            {(u.role !== 'ADMIN' && u.role !== 'SUPER_ADMIN') || currentRole === 'SUPER_ADMIN' ? (
              <>
                <button onClick={() => handleToggleStatus(u.id, u.status)} className="px-3 py-1 rounded bg-[var(--color-input)] hover:text-white transition text-xs">
                  {u.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                </button>
                <button onClick={() => handleDelete(u.id)} className="px-3 py-1 rounded bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition text-xs">
                  Delete
                </button>
              </>
            ) : (
              <span className="text-[9px] text-gray-600 italic">L3 required</span>
            )}
          </>
        ) : (
          <button onClick={() => handleReinstate(u.id)} className="px-3 py-1 rounded bg-[var(--color-primary)]/20 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-[var(--color-primary-foreground)] transition font-bold tracking-widest text-[10px]">
            REINSTATE
          </button>
        )}
      </>
    );

    return (
        <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] shadow-lg overflow-hidden mt-6">
             {/* Header Controls */}
             <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-background)]/50 flex flex-col gap-3">
                 <div className="flex flex-wrap justify-between items-center gap-3">
                     <div className="flex bg-[var(--color-input)] p-1 rounded-lg">
                         <button onClick={() => setTab('ACTIVE')} className={`px-4 py-1.5 rounded-md text-xs font-bold tracking-widest transition whitespace-nowrap ${tab === 'ACTIVE' ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]' : 'text-gray-400 hover:text-white'}`}>CURRENT STAFF</button>
                         <button onClick={() => setTab('PAST')} className={`px-4 py-1.5 rounded-md text-xs font-bold tracking-widest transition whitespace-nowrap ${tab === 'PAST' ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]' : 'text-gray-400 hover:text-white'}`}>PAST EMPLOYEES</button>
                     </div>
                     <ViewToggle />
                 </div>
                 <div className="flex gap-2">
                     <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="bg-[var(--color-input)] border border-[var(--color-border)] text-[10px] text-white px-3 py-2 rounded focus:outline-none uppercase">
                         <option value="ALL">All Roles</option>
                         <option value="SUPER_ADMIN">Director (L3)</option>
                         <option value="ADMIN">Admin (L2)</option>
                         <option value="EMPLOYEE">Employee (L1)</option>
                     </select>
                     <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter by name, email or title..." className="flex-1 bg-[var(--color-input)] border border-[var(--color-border)] px-3 py-2 text-xs text-white rounded focus:outline-none" />
                 </div>
             </div>

             {/* Card View */}
             {view === 'cards' ? (
               <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                 {filtered.length === 0 && <p className="col-span-full text-center text-gray-500 py-8 text-sm">No personnel match criteria.</p>}
                 {filtered.map(u => (
                   <div key={u.id} className={`bg-[var(--color-input)]/40 border border-[var(--color-border)] rounded-xl p-4 hover:border-[var(--color-primary)]/40 transition-colors flex flex-col gap-3 ${u.status === 'SUSPENDED' ? 'opacity-60' : ''}`}>
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 shrink-0 rounded bg-[var(--color-input)] border border-[var(--color-border)] flex items-center justify-center font-bold text-gray-400">
                         {u.name.substring(0,2).toUpperCase()}
                       </div>
                       <div className="min-w-0">
                         <p className="font-bold text-white truncate">{u.name}</p>
                         <p className="text-[10px] text-[var(--color-primary)] font-mono truncate">{u.email}</p>
                       </div>
                     </div>
                     <div className="flex flex-wrap gap-1">
                       <span className="text-[9px] bg-[var(--color-input)] border border-[var(--color-border)] px-2 py-0.5 rounded text-gray-400 uppercase">{u.role}</span>
                       <span className="text-[9px] text-[var(--color-primary)] border border-[var(--color-primary)]/30 px-2 py-0.5 rounded">L{u.clearance_level}</span>
                       {(u.titles || []).map((t: string, i: number) => (
                         <span key={i} className="text-[9px] bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-2 py-0.5 rounded border border-[var(--color-accent)]/20">{t}</span>
                       ))}
                     </div>
                     <div className="flex items-center justify-between mt-auto pt-2 border-t border-[var(--color-border)]">
                       <span className={`flex items-center gap-1 text-[10px] font-bold ${u.status === 'ACTIVE' ? 'text-green-400' : u.status === 'DELETED' ? 'text-gray-500' : 'text-red-400'}`}>
                         <span className={`w-2 h-2 rounded-full ${u.status === 'ACTIVE' ? 'bg-green-400' : u.status === 'DELETED' ? 'bg-gray-500' : 'bg-red-400'}`}></span>
                         {u.status}
                       </span>
                       <div className="flex gap-1 flex-wrap justify-end"><ActionButtons u={u} /></div>
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
             /* Table View */
             <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm text-gray-300">
                      <thead className="text-[10px] uppercase bg-[var(--color-input)]/50 text-gray-500">
                         <tr>
                            <th className="px-6 py-4 font-medium tracking-wider">Identity</th>
                            <th className="px-6 py-4 font-medium tracking-wider hidden lg:table-cell">Titles & Role</th>
                            <th className="px-6 py-4 font-medium tracking-wider text-center hidden sm:table-cell">Level</th>
                            <th className="px-6 py-4 font-medium tracking-wider">Status</th>
                            <th className="px-6 py-4 font-medium tracking-wider text-right">Actions</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--color-border)]">
                         {filtered.length === 0 ? (
                           <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No personnel match criteria.</td></tr>
                         ) : (
                           filtered.map((u) => (
                              <tr key={u.id} className={`hover:bg-[var(--color-input)]/20 transition-colors ${u.status === 'SUSPENDED' ? 'opacity-60' : ''}`}>
                                 <td className="px-4 py-4 min-w-[180px]">
                                    <div className="flex items-center gap-3">
                                       <div className="w-10 h-10 rounded shrink-0 bg-[var(--color-input)] border border-[var(--color-border)] flex items-center justify-center font-bold text-gray-400">
                                          {u.name.substring(0,2).toUpperCase()}
                                       </div>
                                       <div className="truncate">
                                          <p className="font-bold text-white truncate">{u.name}</p>
                                          <p className="text-[10px] text-[var(--color-primary)] font-mono truncate">{u.email}</p>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-6 py-4 hidden lg:table-cell">
                                    <span className="bg-[var(--color-input)] border border-[var(--color-border)] px-2 py-0.5 rounded text-[10px] uppercase tracking-wider text-gray-400 block w-fit mb-1">{u.role}</span>
                                    <div className="flex flex-wrap gap-1">
                                       {(u.titles || []).map((t: string, i: number) => (
                                          <span key={i} className="text-[9px] bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-2 py-0.5 rounded border border-[var(--color-accent)]/20">{t}</span>
                                       ))}
                                    </div>
                                 </td>
                                 <td className="px-6 py-4 text-center hidden sm:table-cell">
                                    <span className="font-bold tracking-widest text-[var(--color-primary)] text-xs">L{u.clearance_level}</span>
                                 </td>
                                 <td className="px-6 py-4">
                                    <span className={`flex items-center gap-2 font-bold tracking-widest text-[10px] ${u.status === 'ACTIVE' ? 'text-green-400' : u.status === 'DELETED' ? 'text-gray-500' : 'text-red-400'}`}>
                                       <span className={`w-2 h-2 rounded-full shrink-0 ${u.status === 'ACTIVE' ? 'bg-green-400' : u.status === 'DELETED' ? 'bg-gray-500' : 'bg-red-400'}`}></span>
                                       {u.status}
                                    </span>
                                 </td>
                                 <td className="px-6 py-4 text-right">
                                     <div className="flex justify-end gap-2"><ActionButtons u={u} /></div>
                                 </td>
                              </tr>
                           ))
                         )}
                      </tbody>
                 </table>
             </div>
             )}
        </div>
    );
}
