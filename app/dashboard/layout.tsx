import { ReactNode } from 'react';
import MainNav from '@/components/MainNav';
import TopBar from '@/components/TopBar';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  // Fetch the request limit for this user's clearance level
  const lvl = session.role === 'SUPER_ADMIN' ? 3 : (session.role === 'ADMIN' ? 2 : 1);
  const configKey = `max_request_level_${lvl}`;
  let maxLimit = 0;
  try {
    const cfgRes = await query('SELECT value FROM config WHERE key = $1', [configKey]);
    if (cfgRes.rows.length > 0) maxLimit = parseInt(JSON.parse(cfgRes.rows[0].value)) || 0;
  } catch(e) { /* config table may not exist yet */ }

  return (
    <div className="flex h-screen bg-[var(--color-background)] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 border-r border-[var(--color-border)] bg-[var(--color-card-solid)] flex-shrink-0">
         <MainNav role={session.role} />
      </div>

      <div className="flex-1 flex flex-col w-full h-full min-h-0 relative">
        <TopBar user={session} maxLimit={maxLimit} />
        
        <main className="flex-1 overflow-auto p-4 md:p-8 pb-24 md:pb-8">
           {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-[var(--color-border)] bg-[var(--color-card-solid)] z-50 flex items-center justify-around">
          <MainNav role={session.role} mobile />
      </div>
    </div>
  );
}
