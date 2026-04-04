import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { redirect } from 'next/navigation';
import LedgerClientTable from './LedgerClientTable';
import IncomeForm from './IncomeForm';

export default async function LedgerPage() {
   const session = await getSession();
   if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN')) {
      redirect('/dashboard');
   }

   const res = await query(`
      SELECT r.*, u.name as user_name, u.email as user_email
      FROM records r
      LEFT JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
   `);
   const records = res.rows;

   return (
      <div className="space-y-6">
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
               <h2 className="text-2xl font-bold font-mono tracking-widest text-[var(--color-primary)]">MASTER LEDGER</h2>
               <p className="text-sm text-gray-400 mt-1">Comprehensive overview of all organizational liquidity streams.</p>
            </div>
            <IncomeForm />
         </div>

         <LedgerClientTable records={records} />
      </div>
   );
}
