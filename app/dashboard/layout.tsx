import { ReactNode } from 'react';
import MainNav from '@/components/MainNav';
import TopBar from '@/components/TopBar';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { redirect } from 'next/navigation';

// Dashboard layout component that wraps all dashboard pages
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // Authenticate user session
  const session = await getSession();
  if (!session) redirect('/login');

  // Calculate spending limit based on user role
  const lvl = session.role === 'SUPER_ADMIN' ? 3 : (session.role === 'ADMIN' ? 2 : 1);
  const configKey = `max_request_level_${lvl}`;
  let maxLimit = 0;
  try {
    // Fetch spending limit from config table
    const cfgRes = await query('SELECT value FROM config WHERE key = $1', [configKey]);
    if (cfgRes.rows.length > 0) maxLimit = parseInt(JSON.parse(cfgRes.rows[0].value)) || 0;
  } catch(e) { /* config table may not exist yet */ }

  return (
    // Full height layout with sidebar on desktop, bottom nav on mobile
    <div className="flex h-screen bg-[var(--color-background)] overflow-hidden">
      {/* Desktop sidebar navigation */}
      <div className="hidden md:block w-64 border-r border-[var(--color-border)] bg-[var(--color-card-solid)] flex-shrink-0">
         <MainNav role={session.role} />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col w-full h-full min-h-0 relative">
        {/* Top header bar */}
        <TopBar user={session} maxLimit={maxLimit} role={session.role} />
        
        {/* Scrollable main content */}
        <main className="flex-1 overflow-auto p-4 md:p-8 pb-24 md:pb-8">
           {children}
        </main>
      </div>

      {/* Mobile bottom navigation bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-[var(--color-border)] bg-[var(--color-card-solid)] z-50 flex items-center justify-around">
          <MainNav role={session.role} mobile />
      </div>
    </div>
  );
}
