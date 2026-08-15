'use client';

import React from 'react';
import { Droplets, Plus, Check, Clock, Trash2 } from 'lucide-react';
import { WaterLogItem } from './types';

import { AnimatedWaterBottle } from './AnimatedWaterBottle';

export function WaterScreen({
  waterL,
  goalL,
  logs,
  onAddWater,
  onOpenCustomModal,
  onDeleteLog
}: {
  waterL: number;
  goalL: number;
  logs: WaterLogItem[];
  onAddWater: (ml: number) => void;
  onOpenCustomModal: () => void;
  onDeleteLog: (id: string) => void;
}) {
  const percentage = Math.min(100, Math.round((waterL / goalL) * 100));
  const remainingL = Math.max(0, parseFloat((goalL - waterL).toFixed(2)));

  const totalGlasses = 8;
  const filledGlasses = Math.min(totalGlasses, Math.floor((waterL / goalL) * totalGlasses));

  return (
    <div className="space-y-5 animate-fade-in pt-1 pb-4">
      {/* Top Header Row */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#DDF2FB] flex items-center justify-center text-[#0284C7]">
            <Droplets className="w-4 h-4 fill-[#38BDF8]" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800">Hydration Tracker</h2>
            <p className="text-[10px] text-slate-500 font-bold">Daily fluid balance</p>
          </div>
        </div>
        <div className="px-3.5 py-1.5 rounded-full bg-[#EBF5FC] border border-[#D0EBFB] text-xs font-bold text-[#0369A1] shadow-xs flex items-center gap-1">
          <span>Today</span>
        </div>
      </div>

      {/* Main Glass Illustration & Level Card (Pastel Sky Blue) */}
      <div className="bg-[#F3F9FD] rounded-[40px] p-6 shadow-xs border border-[#DAEFFB] text-center relative overflow-hidden flex flex-col items-center">
        <div className="w-full flex items-baseline justify-between">
          <div>
            <h3 className="text-5xl font-black text-slate-800 tracking-tight font-mono">
              {waterL.toFixed(1)} <span className="text-xl font-bold font-sans text-slate-400">L</span>
            </h3>
            <p className="text-xs font-bold text-slate-500 mt-0.5">
              Target: {goalL.toFixed(1)} L ({percentage}%)
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
            percentage >= 100 ? 'bg-[#D7F4DF] text-[#15803D]' : 'bg-[#DDF2FB] text-[#0369A1]'
          }`}>
            {percentage >= 100 ? 'Goal Reached 🎉' : `${remainingL} L left`}
          </span>
        </div>

        {/* 3D Dynamic Animated SVG Water Bottle Container */}
        <div className="w-full max-w-[260px] h-72 mt-2 flex items-center justify-center">
          <AnimatedWaterBottle waterL={waterL} goalL={goalL} className="w-full h-full" />
        </div>

        {/* 8-Glass Visual Indicator Row (Soft Pastel Glasses) */}
        <div className="flex justify-center gap-2 mt-4 w-full px-2">
          {Array.from({ length: totalGlasses }).map((_, i) => {
            const isFilled = i < filledGlasses;
            return (
              <div 
                key={i} 
                className={`flex-1 h-9 rounded-b-xl border-2 transition-all relative overflow-hidden ${
                  isFilled ? 'border-[#93C5FD] bg-[#BFDBFE] shadow-xs' : 'border-[#E2E8F0] bg-white'
                }`}
                title={`Glass ${i + 1} (~${Math.round((goalL * 1000) / totalGlasses)}ml)`}
              >
                {isFilled && (
                  <div className="absolute inset-0 bg-[#60A5FA] opacity-90 animate-fade-in flex items-center justify-center text-white">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Log Presets */}
        <div className="grid grid-cols-3 gap-2 w-full mt-5">
          <button
            onClick={() => onAddWater(150)}
            className="py-3 px-2 rounded-2xl bg-white hover:bg-[#E0F2FE] border border-[#BAE6FD] flex flex-col items-center justify-center active:scale-95 transition-all shadow-xs"
          >
            <span className="text-xs font-black text-[#0284C7] font-mono">+150ml</span>
            <span className="text-[10px] text-slate-400 font-medium">Glass</span>
          </button>

          <button
            onClick={() => onAddWater(250)}
            className="py-3 px-2 rounded-2xl bg-[#38BDF8] hover:bg-[#0EA5E9] text-white shadow-md shadow-sky-400/20 flex flex-col items-center justify-center active:scale-95 transition-all"
          >
            <span className="text-xs font-black font-mono">+250ml</span>
            <span className="text-[10px] text-sky-100 font-medium">Mug</span>
          </button>

          <button
            onClick={() => onAddWater(500)}
            className="py-3 px-2 rounded-2xl bg-white hover:bg-[#E0F2FE] border border-[#BAE6FD] flex flex-col items-center justify-center active:scale-95 transition-all shadow-xs"
          >
            <span className="text-xs font-black text-[#0284C7] font-mono">+500ml</span>
            <span className="text-[10px] text-slate-400 font-medium">Bottle</span>
          </button>
        </div>

        {/* Custom Add Trigger */}
        <button 
          onClick={onOpenCustomModal}
          className="mt-3 w-full py-3 rounded-2xl border-2 border-dashed border-[#BAE6FD] text-[#0284C7] font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#E0F2FE]/50 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" /> Custom Amount
        </button>
      </div>

      {/* Today's Intake History Log */}
      <div className="bg-white rounded-[32px] p-5 shadow-xs border border-slate-100/90 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Today's Intake Log</h4>
          <span className="text-[10px] font-bold text-slate-400">{logs.length} entries</span>
        </div>

        {logs.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No water logged yet today. Tap above to log!</p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {logs.map((log) => (
              <div 
                key={log.id} 
                className="p-3 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#DDF2FB] flex items-center justify-center text-[#0284C7]">
                    <Droplets className="w-3.5 h-3.5 fill-[#38BDF8]" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-800 font-mono">+{log.amountMl} ml</span>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {log.time}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => onDeleteLog(log.id)}
                  className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                  title="Remove log"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
