'use client';

import React from 'react';
import { Award, Plus, Footprints, Droplets, Flame, Sparkles, Moon, Trash2 } from 'lucide-react';
import { GoalItem, UserGoals } from './types';

export function GoalsScreen({
  goalsList,
  userGoals,
  steps,
  waterL,
  calories,
  onOpenAddGoalModal,
  onOpenEditTargetsModal,
  onDeleteGoal
}: {
  goalsList: GoalItem[];
  userGoals: UserGoals;
  steps: number;
  waterL: number;
  calories: number;
  onOpenAddGoalModal: () => void;
  onOpenEditTargetsModal: () => void;
  onDeleteGoal: (id: string) => void;
}) {
  const stepPct = Math.min(100, Math.round((steps / userGoals.dailySteps) * 100));
  const waterPct = Math.min(100, Math.round((waterL / userGoals.dailyWaterL) * 100));
  const caloriePct = Math.min(100, Math.round((calories / userGoals.dailyCalories) * 100));

  return (
    <div className="space-y-5 animate-fade-in pt-1 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#F3E8FF] flex items-center justify-center text-[#7E22CE]">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800">Goals & Targets</h2>
            <p className="text-[10px] text-slate-500 font-bold">Personal wellness milestones</p>
          </div>
        </div>
        <button 
          onClick={onOpenEditTargetsModal}
          className="px-3.5 py-1.5 rounded-full bg-[#F3E8FF] border border-[#DDD6FE] text-xs font-bold text-[#7E22CE] shadow-xs hover:bg-[#EDE9FE]"
        >
          Edit Targets
        </button>
      </div>

      {/* Core Goals List (Pastel Cards) */}
      <div className="space-y-3">
        {/* Steps Goal Card */}
        <div className="bg-[#F2FAF4] p-5 rounded-[32px] shadow-xs border border-[#CDEED5] hover:border-[#A7F3D0] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-white flex items-center justify-center text-[#16A34A] shadow-xs">
                <Footprints className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-800">Daily Steps Target</p>
                <p className="text-[10px] text-slate-500 font-medium font-mono">
                  {steps.toLocaleString()} / {userGoals.dailySteps.toLocaleString()} steps
                </p>
              </div>
            </div>
            <span className="text-xs font-black text-[#15803D] font-mono">{stepPct}%</span>
          </div>
          <div className="h-2.5 w-full bg-white rounded-full overflow-hidden p-0.5 border border-[#CDEED5]">
            <div 
              className="h-full bg-[#34D399] rounded-full transition-all duration-700" 
              style={{ width: `${stepPct}%` }}
            ></div>
          </div>
        </div>

        {/* Water Goal Card */}
        <div className="bg-[#F3F9FD] p-5 rounded-[32px] shadow-xs border border-[#DAEFFB] hover:border-[#BAE6FD] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-white flex items-center justify-center text-[#0284C7] shadow-xs">
                <Droplets className="w-4 h-4 fill-[#38BDF8]" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-800">Hydration Target</p>
                <p className="text-[10px] text-slate-500 font-medium font-mono">
                  {waterL.toFixed(1)} / {userGoals.dailyWaterL.toFixed(1)} Liters
                </p>
              </div>
            </div>
            <span className="text-xs font-black text-[#0369A1] font-mono">{waterPct}%</span>
          </div>
          <div className="h-2.5 w-full bg-white rounded-full overflow-hidden p-0.5 border border-[#DAEFFB]">
            <div 
              className="h-full bg-[#38BDF8] rounded-full transition-all duration-700" 
              style={{ width: `${waterPct}%` }}
            ></div>
          </div>
        </div>

        {/* Calories Goal Card */}
        <div className="bg-[#FFF8F3] p-5 rounded-[32px] shadow-xs border border-[#FEDDC7] hover:border-[#FFD0B5] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-white flex items-center justify-center text-[#EA580C] shadow-xs">
                <Flame className="w-4 h-4 fill-[#FB923C]" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-800">Daily Calorie Budget</p>
                <p className="text-[10px] text-slate-500 font-medium font-mono">
                  {calories.toLocaleString()} / {userGoals.dailyCalories.toLocaleString()} kcal
                </p>
              </div>
            </div>
            <span className="text-xs font-black text-[#C2410C] font-mono">{caloriePct}%</span>
          </div>
          <div className="h-2.5 w-full bg-white rounded-full overflow-hidden p-0.5 border border-[#FEDDC7]">
            <div 
              className="h-full bg-[#FB923C] rounded-full transition-all duration-700" 
              style={{ width: `${caloriePct}%` }}
            ></div>
          </div>
        </div>

        {/* Custom Goals (Pastel Lilac) */}
        {goalsList.map((g) => {
          const pct = Math.min(100, Math.round((g.currentValue / g.targetValue) * 100));
          return (
            <div key={g.id} className="bg-[#FBF8FF] p-5 rounded-[32px] shadow-xs border border-[#DDD6FE]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-[#F3E8FF] flex items-center justify-center text-[#7E22CE]">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800">{g.title}</p>
                    <p className="text-[10px] text-slate-500 font-medium font-mono">
                      {g.currentValue} / {g.targetValue} {g.unit} ({g.period})
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#7E22CE] font-mono">{pct}%</span>
                  <button onClick={() => onDeleteGoal(g.id)} className="p-1 text-slate-300 hover:text-rose-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="h-2.5 w-full bg-white rounded-full overflow-hidden p-0.5 border border-[#DDD6FE]">
                <div className="h-full bg-[#A855F7] rounded-full" style={{ width: `${pct}%` }}></div>
              </div>
            </div>
          );
        })}

        <button 
          onClick={onOpenAddGoalModal}
          className="w-full py-4 rounded-2xl bg-[#F3E8FF] hover:bg-[#EDE9FE] text-[#7E22CE] font-black text-xs border border-[#DDD6FE] flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Create New Goal
        </button>
      </div>

      {/* Smart Automated Insights (Dynamic Real Data) */}
      <div>
        <div className="flex items-center justify-between px-2 mb-3">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Automated Insights</h3>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Live Telemetry</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#FEFCE8] p-4 rounded-3xl shadow-xs border border-[#FEF08A] flex flex-col items-center text-center">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase">Step Target Rate</p>
            <p className="text-sm font-black text-slate-800 mt-0.5 font-mono">{stepPct}% Pace</p>
            <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center mt-2.5 text-[#CA8A04] shadow-xs">
              <Sparkles className="w-5 h-5 fill-[#FDE047]" />
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-2 font-bold">{steps.toLocaleString()} / {userGoals.dailySteps.toLocaleString()}</span>
          </div>

          <div className="bg-[#F5F3FF] p-4 rounded-3xl shadow-xs border border-[#DDD6FE] flex flex-col items-center text-center">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase">Hydration Rate</p>
            <p className="text-sm font-black text-slate-800 mt-0.5 font-mono">{waterPct}% Daily</p>
            <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center mt-2.5 text-[#7E22CE] shadow-xs">
              <Droplets className="w-5 h-5 fill-[#C084FC]" />
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-2 font-bold">{waterL.toFixed(1)} / {userGoals.dailyWaterL.toFixed(1)} Liters</span>
          </div>
        </div>
      </div>
    </div>
  );
}
