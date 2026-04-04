'use client';

import { Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getNotificationsAction, markNotificationReadAction } from '@/app/dashboard/notificationActions';

export default function NotificationsDropdown() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);

    const fetchDropdown = async () => {
        const notifs = await getNotificationsAction();
        setNotifications(notifs);
    };

    useEffect(() => {
        fetchDropdown();
        const interval = setInterval(fetchDropdown, 15000); // Polling 15s
        return () => clearInterval(interval);
    }, []);

    const unreadCount = notifications.filter(n => !n.read_status).length;

    const handleRead = async (id: number) => {
        await markNotificationReadAction(id);
        const updated = notifications.map(n => n.id === id ? { ...n, read_status: true } : n);
        setNotifications(updated);
    };

    return (
        <div className="relative">
            <button onClick={() => setOpen(!open)} className="text-gray-400 hover:text-[var(--color-primary)] transition-colors relative block">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                   <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-[var(--color-background)]"></span>
                )}
            </button>
            
            {open && (
                <div className="absolute right-0 mt-4 w-72 bg-[var(--color-card)] border border-[var(--color-border)] shadow-[0_0_20px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden z-50">
                    <div className="p-3 border-b border-[var(--color-border)] bg-[var(--color-background)]/50">
                       <h3 className="text-xs font-bold font-mono tracking-widest text-[var(--color-primary)] uppercase">System Alerts</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-[var(--color-border)]">
                       {notifications.length === 0 ? (
                           <div className="p-6 text-center text-xs text-gray-500">No recent alerts.</div>
                       ) : (
                           notifications.map(n => (
                               <div key={n.id} onClick={() => handleRead(n.id)} className={`p-3 text-xs cursor-pointer hover:bg-[var(--color-input)]/50 transition-colors ${!n.read_status ? 'bg-[var(--color-input)]/20' : ''}`}>
                                  <div className="flex justify-between items-start mb-1">
                                      <p className={`font-bold ${!n.read_status ? 'text-white' : 'text-gray-400'}`}>{n.title}</p>
                                      {!n.read_status && <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] flex-shrink-0 mt-1"></span>}
                                  </div>
                                  <p className="text-gray-400">{n.message}</p>
                                  <p className="text-[9px] text-gray-600 mt-2 font-mono">{new Date(n.created_at).toLocaleString()}</p>
                               </div>
                           ))
                       )}
                    </div>
                </div>
            )}
        </div>
    );
}
