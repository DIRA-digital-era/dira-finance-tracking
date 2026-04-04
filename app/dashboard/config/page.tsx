import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ConfigPage() {
   const session = await getSession();
   if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN')) {
      redirect('/dashboard');
   }

   return (
      <div className="space-y-6">
         <h2 className="text-2xl font-bold font-mono tracking-widest text-[var(--color-primary)]">SYSTEM CONFIGURATION</h2>
         <div className="bg-[var(--color-card)] rounded-xl p-6 border border-[var(--color-border)] shadow-lg">
             <p className="text-gray-300">Settings and global configurations will appear here.</p>
         </div>
      </div>
   );
}
