'use client';

import React from 'react';
import { 
  Smartphone, Cloud, 
  LogOut, LogIn, Flame, Droplets, Footprints, RefreshCw, RotateCcw
} from 'lucide-react';
import { UserGoals } from './types';

export function ProfileScreen({
  currentUser,
  displayName,
  avatarUrl,
  goals,
  lastSyncTime,
  isSyncing,
  onManualSync,
  onResetDataToZero,
  onOpenEditTargetsModal,
  onSignOut,
  onOpenSignIn
}: {
  currentUser: any;
  displayName: string;
  avatarUrl?: string;
  goals: UserGoals;
  lastSyncTime: string;
  isSyncing: boolean;
  onManualSync: () => void;
  onResetDataToZero: () => void;
  onOpenEditTargetsModal: () => void;
  onSignOut: () => void;
  onOpenSignIn: () => void;
}) {
  const safeName = displayName || (currentUser?.email ? currentUser.email.split('@')[0] : 'Member');
  const initial = (safeName.trim().charAt(0) || 'M').toUpperCase();
  const stepGoal = goals?.dailySteps || 10000;
  const waterGoal = goals?.dailyWaterL || 2.5;
  const calorieGoal = goals?.dailyCalories || 2400;

  return (
    <div className="space-y-5 animate-fade-in pt-1 pb-4">
      {/* Profile Card */}
      <div className="bg-white rounded-[36px] p-6 shadow-xs border border-slate-100/90 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#A7F3D0] via-[#BAE6FD] to-[#DDD6FE] p-0.5 shadow-xs overflow-hidden flex-shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt={safeName} className="w-full h-full rounded-full object-cover" />
          ) : (
            <div className="w-full h-full rounded-full bg-[#FB923C] flex items-center justify-center text-white font-black text-xl shadow-inner">
              {initial}
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-black text-slate-800 leading-tight">{safeName}</h3>
            {currentUser && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-[#D7F4DF] text-[#15803D]">
                CLOUD
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {currentUser ? currentUser.email : 'Local Storage Session'}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className={`w-2 h-2 rounded-full ${currentUser ? 'bg-[#34D399] shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-[#38BDF8]'}`}></span>
            <span className="text-[10px] font-bold text-slate-600">
              {currentUser ? 'Cloud Sync Active (1h interval)' : 'Local Storage (1h auto-backup)'}
            </span>
          </div>
        </div>
      </div>

      {/* Target Parameters Summary (Pastel 3-Grid) */}
      <div className="bg-white rounded-[32px] p-5 shadow-xs border border-slate-100/90 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Personal Targets</h4>
          <button 
            onClick={onOpenEditTargetsModal}
            className="text-xs font-bold text-[#15803D] hover:underline"
          >
            Adjust
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 rounded-2xl bg-[#F2FAF4] border border-[#CDEED5] text-center">
            <Footprints className="w-4 h-4 text-[#16A34A] mx-auto mb-1" />
            <span className="text-[9px] font-bold text-slate-400 uppercase">Steps</span>
            <p className="text-xs font-black text-slate-800 font-mono mt-0.5">{stepGoal.toLocaleString()}</p>
          </div>

          <div className="p-3 rounded-2xl bg-[#F3F9FD] border border-[#DAEFFB] text-center">
            <Droplets className="w-4 h-4 text-[#0284C7] mx-auto mb-1 fill-[#38BDF8]" />
            <span className="text-[9px] font-bold text-slate-400 uppercase">Water</span>
            <p className="text-xs font-black text-slate-800 font-mono mt-0.5">{waterGoal} L</p>
          </div>

          <div className="p-3 rounded-2xl bg-[#FFF8F3] border border-[#FEDDC7] text-center">
            <Flame className="w-4 h-4 text-[#EA580C] mx-auto mb-1 fill-[#FB923C]" />
            <span className="text-[9px] font-bold text-slate-400 uppercase">Calories</span>
            <p className="text-xs font-black text-slate-800 font-mono mt-0.5">{calorieGoal}</p>
          </div>
        </div>
      </div>

      {/* Cloud Backup & Automation Settings */}
      <div className="bg-white rounded-[32px] p-5 shadow-xs border border-slate-100/90 space-y-2">
        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2 px-1">Cloud Sync & Persistence</h4>

        {/* 1-Hour Cloud Sync Status Item */}
        <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F3E8FF] text-[#7E22CE] flex items-center justify-center">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">Cloud Upload (1-Hour Auto)</span>
              <p className="text-[10px] text-slate-400 font-mono">Last synced: {lastSyncTime}</p>
            </div>
          </div>

          <button
            onClick={onManualSync}
            disabled={isSyncing}
            className="px-3 py-1.5 rounded-xl bg-[#F3E8FF] hover:bg-[#EDE9FE] text-[#7E22CE] border border-[#DDD6FE] text-xs font-black flex items-center gap-1.5 active:scale-95 transition-all disabled:opacity-50 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        </div>

        {/* Reminders Toggle Item */}
        <div className="p-3.5 rounded-2xl hover:bg-[#F8FAFC] flex items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800">Telemetry Health Reminders</span>
              <p className="text-[10px] text-slate-400">Hourly hydration & activity nudges</p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#15803D]">Active</span>
        </div>

        {/* Download Android APK */}
        <div className="p-3.5 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#D1FAE5] text-[#059669] flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800">P-fit Android Mobile App</span>
              <p className="text-[10px] text-slate-500">Production Release APK (v1.0.0)</p>
            </div>
          </div>

          <a
            href="/p-fit.apk"
            download="p-fit.apk"
            className="px-3.5 py-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-black flex items-center gap-1.5 active:scale-95 transition-all shadow-sm"
          >
            Download APK
          </a>
        </div>

        {/* Reset Dataset to 0 (Fresh Start) */}
        <div className="p-3.5 rounded-2xl bg-[#FFF9F9] border border-[#FEE2E2] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FEE2E2] text-[#BE123C] flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800">Fresh Dataset Reset</span>
              <p className="text-[10px] text-slate-400">Reset daily steps, water & meals to 0</p>
            </div>
          </div>

          <button
            onClick={onResetDataToZero}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FEE2E2] text-[#BE123C] border border-[#FECDD3] text-xs font-black active:scale-95 transition-all shadow-xs"
          >
            Reset (0)
          </button>
        </div>
      </div>

      {/* Auth Actions */}
      <div className="pt-1">
        {currentUser ? (
          <button
            onClick={onSignOut}
            className="w-full py-4 rounded-2xl bg-[#FFF1F2] hover:bg-[#FEE2E2] text-[#BE123C] font-black text-xs border border-[#FECDD3] flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        ) : (
          <button
            onClick={onOpenSignIn}
            className="w-full py-4 rounded-2xl bg-[#52D288] hover:bg-[#43BE75] text-white font-black text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <LogIn className="w-4 h-4" /> Sign In / Create Account
          </button>
        )}
      </div>
    </div>
  );
}
