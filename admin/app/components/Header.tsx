'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, LogIn, LogOut } from 'lucide-react';

export function Header({
  displayName,
  avatarUrl,
  unreadNotificationsCount,
  currentUser,
  onOpenNotifications,
  onSignOut,
  onOpenSignIn
}: {
  displayName: string;
  avatarUrl?: string;
  unreadNotificationsCount: number;
  currentUser: any;
  onOpenNotifications: () => void;
  onSignOut: () => void;
  onOpenSignIn: () => void;
}) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const safeName = displayName || (currentUser?.email ? currentUser.email.split('@')[0] : 'Member');
  const initial = (safeName.trim().charAt(0) || 'M').toUpperCase();

  return (
    <header className="px-6 pt-8 pb-3 flex items-center justify-between bg-[#FAFAFA] z-10 sticky top-0">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-400 via-teal-300 to-sky-400 p-0.5 shadow-sm overflow-hidden flex-shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt={safeName} className="w-full h-full rounded-full object-cover" />
          ) : (
            <div className="w-full h-full rounded-full bg-orange-500 flex items-center justify-center text-white font-black text-base shadow-inner">
              {initial}
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${currentUser ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-amber-400'}`}></span>
            <p className="text-xs text-slate-500 font-bold">{getGreeting()}, {safeName} 👋</p>
          </div>
          <h1 className="text-xl font-black text-slate-900 leading-tight tracking-tight mt-0.5">
            Ready to be<br />your best today?
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={onOpenNotifications}
          className="relative p-2.5 rounded-full bg-white border border-slate-100 shadow-xs text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all"
          aria-label={`Notifications (${unreadNotificationsCount} unread)`}
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
          )}
        </button>
      </div>
    </header>
  );
}
