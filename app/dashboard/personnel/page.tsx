import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { redirect } from 'next/navigation';
import AddUserForm from './AddUserForm';

export default async function PersonnelPage() {
   const session = await getSession();
   if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN')) {
      redirect('/dashboard');
   }

   const res = await query(`
      SELECT id, name, email, role, clearance_level, status, created_at
      FROM users
      ORDER BY role DESC, created_at ASC
   `);

   const users = res.rows;

   return (
      <div className="space-y-6">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end">
            <div>
               <h2 className="text-2xl font-bold font-mono tracking-widest text-[var(--color-primary)]">PERSONNEL DIRECTORY</h2>
               <p className="text-sm text-gray-400 mt-1">Manage global Employee clearance and administrative access levels.</p>
            </div>
            <AddUserForm currentRole={session.role} />
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-[var(--color-card)] rounded-xl p-6 border border-[var(--color-border)]">
               <p className="text-[10px] text-gray-400 tracking-widest uppercase mb-4 flex items-center gap-2"><div className="w-2 h-2 bg-[var(--color-accent)] rounded-full"></div> Administrative Protocol</p>
               <p className="text-sm text-gray-300">All administrative actions are logged to the DIRA INTERNAL LEDGER and require a Level 2 authorization signature. Suspension of Level 2 Employees requires Director approval.</p>
            </div>
            <div className="bg-[var(--color-card)] rounded-xl p-6 border border-[var(--color-border)]">
               <p className="text-[10px] text-gray-400 tracking-widest uppercase mb-4">Clearance Distribution</p>
               <div className="space-y-4">
                  <div>
                     <div className="flex justify-between text-xs text-gray-400 font-bold mb-1">
                        <span>L1 EmployeeS (EMPLOYEE)</span>
                        <span>{users.filter((u: any) => u.role === 'EMPLOYEE').length}</span>
                     </div>
                     <div className="w-full bg-[var(--color-input)] rounded-full h-1"><div className="bg-[var(--color-primary)] h-1 rounded-full w-3/4"></div></div>
                  </div>
                  <div>
                     <div className="flex justify-between text-xs text-gray-400 font-bold mb-1">
                        <span>L2 ADMINS (ADMIN/SUPER)</span>
                        <span>{users.filter((u: any) => u.role !== 'EMPLOYEE').length}</span>
                     </div>
                     <div className="w-full bg-[var(--color-input)] rounded-full h-1"><div className="bg-[var(--color-accent)] h-1 rounded-full w-1/4"></div></div>
                  </div>
               </div>
            </div>
         </div>

         <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] shadow-lg overflow-x-auto">
             <table className="w-full text-left text-sm text-gray-300">
                  <thead className="text-[10px] uppercase bg-[var(--color-input)]/50 text-gray-500">
                     <tr>
                        <th className="px-6 py-4 font-medium tracking-wider">Employee Identification</th>
                        <th className="px-6 py-4 font-medium tracking-wider hidden md:table-cell">Designated Role</th>
                        <th className="px-6 py-4 font-medium tracking-wider text-center">Clearance</th>
                        <th className="px-6 py-4 font-medium tracking-wider">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                     {users.length === 0 ? (
                       <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No personnel found.</td></tr>
                     ) : (
                       users.map((u: any) => (
                          <tr key={u.id} className="hover:bg-[var(--color-input)]/20 transition-colors group">
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
                                <span className="bg-[var(--color-input)] border border-[var(--color-border)] px-3 py-1 rounded text-[10px] uppercase tracking-wider text-gray-400 block w-fit">
                                   {u.role === 'SUPER_ADMIN' ? 'Director of Systems' : (u.role === 'ADMIN' ? 'Sector Lead Ops' : 'Field Employee')}
                                </span>
                             </td>
                             <td className="px-6 py-4 text-center">
                                <span className="font-bold tracking-widest text-[var(--color-accent)] text-xs">LEVEL {u.clearance_level}</span>
                             </td>
                             <td className="px-6 py-4">
                                <div className="flex items-center justify-between gap-4">
                                    <span className={`flex items-center gap-2 font-bold tracking-widest text-[10px] ${u.status === 'ACTIVE' ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
                                       <span className={`w-2 h-2 rounded-full ${u.status === 'ACTIVE' ? 'bg-[var(--color-success)]' : 'bg-[var(--color-danger)]'}`}></span>
                                       {u.status}
                                    </span>
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
