'use client';

import React from 'react';
import { Home, Activity, Plus, BarChart2, User } from 'lucide-react';

export function BottomNav({
  activeTab,
  onSelectTab,
  onOpenQuickAction
}: {
  activeTab: string;
  onSelectTab: (tab: 'home' | 'activity' | 'progress' | 'profile' | 'water' | 'calories' | 'steps' | 'pomodoro') => void;
  onOpenQuickAction: () => void;
}) {
  const isHomeActive = ['home', 'water', 'calories', 'steps', 'pomodoro'].includes(activeTab);

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md z-40 rounded-t-[36px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] border-t border-slate-100"
      aria-label="Bottom Navigation"
    >
      <div className="px-6 py-3.5 flex justify-between items-center relative">
        <button 
          onClick={() => onSelectTab('home')} 
          className={`flex flex-col items-center gap-1 p-1.5 transition-all ${
            isHomeActive ? 'text-[#15803D] font-extrabold scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
          aria-label="Home"
        >
          <div className={`p-1 rounded-xl transition-colors ${isHomeActive ? 'bg-[#E8F7ED]' : ''}`}>
            <Home className="w-5 h-5" fill={isHomeActive ? 'currentColor' : 'none'} />
          </div>
          <span className="text-[10px] font-bold">Home</span>
        </button>
        
        <button 
          onClick={() => onSelectTab('activity')} 
          className={`flex flex-col items-center gap-1 p-1.5 transition-all ${
            activeTab === 'activity' ? 'text-[#15803D] font-extrabold scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
          aria-label="Activity"
        >
          <div className={`p-1 rounded-xl transition-colors ${activeTab === 'activity' ? 'bg-[#E8F7ED]' : ''}`}>
            <Activity className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold">Activity</span>
        </button>

        {/* Central Action FAB (Pastel Mint Glow) */}
        <div className="relative -top-6 px-1">
          <button 
            onClick={onOpenQuickAction}
            className="w-13 h-13 rounded-full bg-[#52D288] hover:bg-[#43BE75] text-white shadow-xl shadow-emerald-400/30 flex items-center justify-center active:scale-90 transition-all border-4 border-white"
            aria-label="Quick Action Center"
            title="Quick Log"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
        </div>

        <button 
          onClick={() => onSelectTab('progress')} 
          className={`flex flex-col items-center gap-1 p-1.5 transition-all ${
            activeTab === 'progress' ? 'text-[#15803D] font-extrabold scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
          aria-label="Progress & Goals"
        >
          <div className={`p-1 rounded-xl transition-colors ${activeTab === 'progress' ? 'bg-[#E8F7ED]' : ''}`}>
            <BarChart2 className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold">Goals</span>
        </button>

        <button 
          onClick={() => onSelectTab('profile')} 
          className={`flex flex-col items-center gap-1 p-1.5 transition-all ${
            activeTab === 'profile' ? 'text-[#15803D] font-extrabold scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
          aria-label="User Profile"
        >
          <div className={`p-1 rounded-xl transition-colors ${activeTab === 'profile' ? 'bg-[#E8F7ED]' : ''}`}>
            <User className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold">Profile</span>
        </button>
      </div>
    </nav>
  );
}
