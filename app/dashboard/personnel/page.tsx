import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { redirect } from 'next/navigation';
import AddUserForm from './AddUserForm';
import PersonnelClientTable from './PersonnelClientTable';
import DispatchFundsModal from './DispatchFundsModal';

export default async function PersonnelPage() {
   const session = await getSession();
   if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN')) {
      redirect('/dashboard');
   }

   // Grab Users and aggregate multiple titles + title_ids
   const res = await query(`
      SELECT u.id, u.name, u.email, u.role, u.clearance_level, u.status, u.created_at,
      (SELECT json_agg(jt.title) FROM user_titles ut JOIN job_titles jt ON ut.title_id = jt.id WHERE ut.user_id = u.id) as titles,
      (SELECT json_agg(jt.id) FROM user_titles ut JOIN job_titles jt ON ut.title_id = jt.id WHERE ut.user_id = u.id) as title_ids
      FROM users u
      ORDER BY u.role DESC, u.created_at ASC
   `);
   const users = res.rows;

   const jtRes = await query('SELECT * FROM job_titles ORDER BY title ASC');
   const jobTitles = jtRes.rows;

   // Active non-super-admin users for dispatch eligibility
   const activeUsers = users.filter((u: any) => u.status === 'ACTIVE');

   return (
      <div className="space-y-6">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
               <h2 className="text-2xl font-bold font-mono tracking-widest text-[var(--color-primary)]">PERSONNEL DIRECTORY</h2>
               <p className="text-sm text-gray-400 mt-1">Manage global employee clearance and administrative access levels.</p>
            </div>
            <div className="flex gap-3 flex-wrap">
               {session.role === 'SUPER_ADMIN' && <DispatchFundsModal users={activeUsers} />}
               <AddUserForm currentRole={session.role} jobTitles={jobTitles} />
            </div>
         </div>

         <PersonnelClientTable users={users} jobTitles={jobTitles} currentRole={session.role} />
      </div>
   );
}
