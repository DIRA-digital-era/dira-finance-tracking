import { ReactNode } from 'react';
import MainNav from '@/components/MainNav';
import TopBar from '@/components/TopBar';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <div className="flex h-screen bg-[var(--color-background)] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 border-r border-[var(--color-border)] bg-[var(--color-card-solid)] flex-shrink-0">
         <MainNav role={session.role} />
      </div>

      <div className="flex-1 flex flex-col w-full h-full min-h-0 relative">
        <TopBar user={session} />
        
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
