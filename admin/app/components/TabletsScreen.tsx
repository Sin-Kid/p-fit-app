'use client';

import React from 'react';
import { 
  Pill, Plus, Check, Clock, Trash2, ShieldCheck, 
  Sparkles, CheckCircle2, AlertCircle, Bell
} from 'lucide-react';
import { TabletItem } from './types';

interface TabletsScreenProps {
  tablets: TabletItem[];
  onToggleTabletTaken: (id: string) => void;
  onDeleteTablet: (id: string) => void;
  onOpenAddTabletModal: () => void;
}

export function TabletsScreen({
  tablets,
  onToggleTabletTaken,
  onDeleteTablet,
  onOpenAddTabletModal
}: TabletsScreenProps) {
  const totalCount = tablets.length;
  const takenCount = tablets.filter(t => t.isTaken).length;
  const pendingCount = totalCount - takenCount;
  const adherencePct = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

  const nextPending = tablets.find(t => !t.isTaken);

  return (
    <div className="space-y-5 animate-fade-in pt-1 pb-4">
      {/* 1. Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#F5F3FF] flex items-center justify-center text-[#7E22CE] shadow-xs">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">Tablets & Meds</h2>
            <p className="text-[10px] text-slate-500 font-bold">Daily prescription & vitamin reminders</p>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
          adherencePct === 100 && totalCount > 0
            ? 'bg-[#D7F4DF] text-[#15803D] border-[#A7F3D0]'
            : 'bg-[#F5F3FF] text-[#7E22CE] border-[#DDD6FE]'
        }`}>
          {takenCount}/{totalCount} Taken
        </span>
      </div>

      {/* 2. Main Hero Card (Pastel Lilac / Violet) */}
      <div className="bg-[#FAF5FF] rounded-[40px] p-6 shadow-xs border border-[#E9D5FF] text-center relative overflow-hidden flex flex-col items-center">
        <div className="w-full flex items-baseline justify-between">
          <div className="text-left">
            <h3 className="text-4xl font-black text-slate-800 tracking-tight font-mono">
              {adherencePct}<span className="text-xl font-bold font-sans text-slate-400">%</span>
            </h3>
            <p className="text-xs font-bold text-slate-500 mt-0.5">
              Daily Medication Adherence
            </p>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
            pendingCount === 0 && totalCount > 0
              ? 'bg-[#D7F4DF] text-[#15803D]'
              : 'bg-[#F3E8FF] text-[#7E22CE]'
          }`}>
            {totalCount === 0 
              ? 'No meds scheduled' 
              : pendingCount === 0 
                ? 'All Done for Today 🎉' 
                : `${pendingCount} remaining`}
          </span>
        </div>

        {/* Next Dose Alert Banner */}
        {nextPending && (
          <div className="w-full mt-4 p-3.5 rounded-2xl bg-white border border-[#E9D5FF] flex items-center justify-between shadow-xs text-left">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#F3E8FF] text-[#7E22CE] flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-black text-slate-800 block">Next Up: {nextPending.name}</span>
                <span className="text-[10px] text-slate-500 font-medium">Scheduled at {nextPending.time} • {nextPending.dosage}</span>
              </div>
            </div>

            <button
              onClick={() => onToggleTabletTaken(nextPending.id)}
              className="px-3 py-1.5 rounded-xl bg-[#7E22CE] hover:bg-[#6B21A8] text-white text-xs font-black flex items-center gap-1 active:scale-95 transition-all shadow-xs"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" /> Take Now
            </button>
          </div>
        )}

        {/* Adherence Progress Bar */}
        <div className="w-full mt-4">
          <div className="flex justify-between text-xs font-extrabold text-[#7E22CE] mb-1 px-1">
            <span>Dose Progress</span>
            <span>{adherencePct}%</span>
          </div>
          <div className="h-3 w-full bg-white rounded-full overflow-hidden p-0.5 border border-[#E9D5FF]">
            <div 
              className="h-full bg-gradient-to-r from-[#A855F7] to-[#7E22CE] rounded-full transition-all duration-700 ease-out" 
              style={{ width: `${adherencePct}%` }}
            />
          </div>
        </div>

        {/* Quick Add Button */}
        <button
          onClick={onOpenAddTabletModal}
          className="mt-5 w-full py-3.5 rounded-2xl bg-[#7E22CE] hover:bg-[#6B21A8] text-white font-black text-xs shadow-md shadow-purple-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Add Medication / Tablet
        </button>
      </div>

      {/* 3. Today's Medicine List */}
      <div className="bg-white rounded-[32px] p-5 shadow-xs border border-slate-100/90 space-y-3">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Scheduled Meds & Vitamins</h4>
          <span className="text-[10px] font-bold text-slate-400">{tablets.length} scheduled</span>
        </div>

        {tablets.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#F5F3FF] text-[#7E22CE] flex items-center justify-center mx-auto shadow-xs">
              <Pill className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-700">No Medications Scheduled</p>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
              Add your daily vitamins, supplements, or prescriptions to receive timely reminders.
            </p>
            <button
              onClick={onOpenAddTabletModal}
              className="mt-2 px-4 py-2 rounded-xl bg-[#F5F3FF] text-[#7E22CE] border border-[#DDD6FE] text-xs font-black hover:bg-[#EDE9FE] transition-all"
            >
              + Add First Tablet
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {tablets.map((item) => (
              <div 
                key={item.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                  item.isTaken 
                    ? 'bg-[#F8FAFC] border-slate-200/80 opacity-75' 
                    : 'bg-[#FAF5FF] border-[#E9D5FF] shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <button
                    onClick={() => onToggleTabletTaken(item.id)}
                    className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all ${
                      item.isTaken
                        ? 'bg-[#10B981] border-[#10B981] text-white shadow-xs'
                        : 'bg-white border-[#C084FC] hover:border-[#7E22CE]'
                    }`}
                    title={item.isTaken ? 'Mark as pending' : 'Mark as taken'}
                  >
                    {item.isTaken && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-black ${item.isTaken ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                        {item.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-white text-[#7E22CE] border border-[#DDD6FE]">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                      {item.dosage} • {item.time}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.isTaken ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#FEF3C7] text-[#92400E]'
                  }`}>
                    {item.isTaken ? 'Taken' : 'Due'}
                  </span>

                  <button 
                    onClick={() => onDeleteTablet(item.id)}
                    className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                    title="Remove reminder"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Automated Reminders Preference */}
      <div className="p-4 rounded-3xl bg-white border border-slate-100/90 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 block">Smart Dose Notifications</span>
            <p className="text-[10px] text-slate-400">Receive alert when scheduled time arrives</p>
          </div>
        </div>
        <span className="text-xs font-black text-[#15803D] bg-[#E8F7ED] px-3 py-1 rounded-full border border-[#CDEED5]">
          Active
        </span>
      </div>
    </div>
  );
}
