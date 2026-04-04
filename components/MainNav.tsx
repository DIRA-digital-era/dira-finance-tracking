'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Receipt, Users, Settings, LogOut, Wallet } from 'lucide-react';

export default function MainNav({ role, mobile = false }: { role: string, mobile?: boolean }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Requests', href: '/dashboard/my-requests', icon: Receipt },
  ];

  if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
    navItems.push({ name: 'Personnel', href: '/dashboard/personnel', icon: Users });
    navItems.push({ name: 'All Requests', href: '/dashboard/requests', icon: Receipt });
    navItems.push({ name: 'Master Ledger', href: '/dashboard/ledger', icon: Wallet });
    if (role === 'SUPER_ADMIN') {
       navItems.push({ name: 'System', href: '/dashboard/config', icon: Settings });
    }
  }

  return (
    <nav className={`flex ${mobile ? 'flex-row w-full h-full pb-safe' : 'flex-col h-full p-4'}`}>
      {!mobile && (
        <div className="mb-10 px-2 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-xl font-bold tracking-widest text-[var(--color-primary)]">DIRA</h2>
          <p className="text-xs text-gray-500 uppercase">INTERNAL LEDGER</p>
          <div className="mt-4 text-xs bg-[var(--color-primary)]/10 text-[var(--color-primary)] w-fit px-2 py-1 rounded">CLEARANCE: {role}</div>
        </div>
      )}

      <ul className={`flex ${mobile ? 'flex-row w-full justify-around items-center h-full' : 'flex-col gap-2 flex-1'}`}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.name} className={mobile ? 'h-full flex-1' : ''}>
              <Link 
                href={item.href}
                className={`flex h-full ${mobile ? 'flex-col justify-center items-center text-center' : 'items-center px-4 py-3'} transition-colors group ${
                  isActive 
                    ? (mobile ? 'text-[var(--color-primary)] relative' : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-lg border-l-4 border-[var(--color-primary)]')
                    : 'text-gray-400 hover:text-[var(--color-foreground)] hover:bg-[var(--color-card)] rounded-lg'
                }`}
              >
                {mobile && isActive && <div className="absolute top-0 w-8 h-[2px] bg-[var(--color-primary)] rounded-b-md" />}
                <item.icon className={`${mobile ? 'h-5 w-5 mb-1' : 'h-5 w-5 mr-3'} ${isActive ? 'text-[var(--color-primary)]' : 'text-gray-500 group-hover:text-[var(--color-primary)] transition-colors'}`} />
                <span className={`${mobile ? 'text-[10px] leading-tight' : 'text-sm font-medium'}`}>{item.name}</span>
              </Link>
            </li>
          );
        })}
        {mobile && (
           <li className="h-full flex-1">
               <Link href="/api/logout" className="flex flex-col h-full justify-center items-center text-center text-gray-400 group hover:text-[var(--color-danger)] transition-colors">
                  <LogOut className="h-5 w-5 mb-1 text-gray-500 group-hover:text-[var(--color-danger)] transition-colors" />
                  <span className="text-[10px] leading-tight">Logout</span>
               </Link>
           </li>
        )}
      </ul>

      {!mobile && (
         <div className="mt-auto border-t border-[var(--color-border)] pt-4">
            <Link href="/api/logout" className="flex items-center px-4 py-3 text-sm font-medium text-gray-400 hover:bg-[var(--color-card)] hover:text-[var(--color-danger)] transition-colors group rounded-lg">
                <LogOut className="h-5 w-5 mr-3 text-gray-500 group-hover:text-[var(--color-danger)] transition-colors" />
                Logout
            </Link>
         </div>
      )}
    </nav>
  );
}
