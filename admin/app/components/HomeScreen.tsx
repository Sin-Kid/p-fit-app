'use client';

import React from 'react';
import { 
  Flame, Footprints, Droplets, Target, Play, ChevronRight, Activity,
  Sparkles, Plus, Pill, Check
} from 'lucide-react';
import { MealItem, WorkoutItem, UserGoals, TabletItem } from './types';

export function HomeScreen({
  steps,
  calories,
  waterL,
  goals,
  workouts,
  recentMeal,
  tablets = [],
  onNavigateTab,
  onStartWorkout,
  onAddMeal,
  onAddWater,
  onToggleTabletTaken
}: {
  steps: number;
  calories: number;
  waterL: number;
  goals: UserGoals;
  workouts: WorkoutItem[];
  recentMeal?: MealItem;
  tablets?: TabletItem[];
  onNavigateTab: (tab: 'water' | 'calories' | 'steps' | 'pomodoro' | 'activity' | 'progress' | 'tablets') => void;
  onStartWorkout: () => void;
  onAddMeal: () => void;
  onAddWater: () => void;
  onToggleTabletTaken?: (id: string) => void;
}) {
  // Compute weighted progress safely
  const stepGoal = goals?.dailySteps || 10000;
  const waterGoal = goals?.dailyWaterL || 2.5;
  const calorieGoal = goals?.dailyCalories || 2400;

  const stepRatio = stepGoal > 0 ? Math.min(1, (steps || 0) / stepGoal) : 0;
  const waterRatio = waterGoal > 0 ? Math.min(1, (waterL || 0) / waterGoal) : 0;
  const calorieRatio = calorieGoal > 0 ? Math.min(1, (calories || 0) / calorieGoal) : 0;
  const overallProgress = Math.min(100, Math.round(((stepRatio * 0.4) + (waterRatio * 0.3) + (calorieRatio * 0.3)) * 100)) || 0;

  const activeWorkout = (workouts || []).find(w => !w.isCompleted) || (workouts || [])[0];

  return (
    <div className="space-y-5 animate-fade-in pb-4">
      {/* 1. Today's Progress Card (Pastel Sage/Mint) */}
      <div className="p-6 rounded-[36px] bg-[#EAF7EE] border border-[#CDEED5] shadow-xs flex items-center gap-5 transition-all">
        {/* SVG Circular Progress */}
        <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" stroke="#D3F1DC" strokeWidth="11" fill="transparent" />
            <circle 
              cx="50" 
              cy="50" 
              r="40" 
              stroke="#34D399" 
              strokeWidth="11" 
              fill="transparent" 
              strokeDasharray={251.2} 
              strokeDashoffset={251.2 - (251.2 * overallProgress) / 100} 
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-2xl font-black text-slate-800 tracking-tight font-mono">
              {overallProgress}<span className="text-xs font-bold font-sans">%</span>
            </span>
            <span className="text-[10px] font-extrabold text-[#15803D] uppercase tracking-wider">Daily Goal</span>
          </div>
        </div>

        {/* Real Metrics Summary with Pastel Badges */}
        <div className="flex-1 space-y-2.5">
          <button 
            onClick={() => onNavigateTab('calories')}
            className="w-full flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#FFE8D6] flex items-center justify-center text-[#EA580C]">
                <Flame className="w-3.5 h-3.5 fill-[#EA580C]" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-500 uppercase">Calories</p>
                <p className="text-xs font-black text-slate-800">
                  {(calories || 0).toLocaleString()} <span className="text-[10px] text-slate-400 font-medium">/ {calorieGoal.toLocaleString()} kcal</span>
                </p>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button 
            onClick={() => onNavigateTab('steps')}
            className="w-full flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#D7F4DF] flex items-center justify-center text-[#16A34A]">
                <Footprints className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-500 uppercase">Steps</p>
                <p className="text-xs font-black text-slate-800">
                  {(steps || 0).toLocaleString()} <span className="text-[10px] text-slate-400 font-medium">/ {stepGoal.toLocaleString()}</span>
                </p>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button 
            onClick={() => onNavigateTab('water')}
            className="w-full flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#DDF2FB] flex items-center justify-center text-[#0284C7]">
                <Droplets className="w-3.5 h-3.5 fill-[#38BDF8] text-[#0284C7]" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-500 uppercase">Hydration</p>
                <p className="text-xs font-black text-slate-800">
                  {(waterL || 0).toFixed(1)} <span className="text-[10px] text-slate-400 font-medium">/ {waterGoal.toFixed(1)} L</span>
                </p>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* 2. Motivation Banner (Pastel Lavender/Periwinkle) */}
      <div className="p-5 rounded-[32px] bg-gradient-to-r from-[#F2EDFD] via-[#ECE5FC] to-[#F5F0FF] border border-[#DDD0FA] flex items-center justify-between relative overflow-hidden shadow-xs">
        <div className="w-3/5 z-10">
          <div className="flex items-center gap-1 text-[#6D28D9] mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Daily Inspiration</span>
          </div>
          <h3 className="text-sm font-bold text-slate-800 leading-snug">
            Small steps every day lead to big, lasting results.
          </h3>
          <p className="text-xs font-extrabold text-[#6D28D9] mt-2 flex items-center gap-1">
            Keep going! 💪
          </p>
        </div>
        <img 
          src="/walking_hero_illustration.jpg" 
          alt="Walking fitness illustration" 
          className="absolute right-0 bottom-0 h-36 object-contain mix-blend-multiply opacity-90 translate-x-2" 
        />
      </div>

      {/* 3. Quick Actions Grid (Pastel Pill Cards) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-black text-slate-800">Quick Actions</h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Shortcuts</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          <button 
            onClick={() => onNavigateTab('water')} 
            className="flex flex-col items-center justify-center p-2.5 rounded-[22px] bg-[#EAF5FC] border border-[#D0EBFB] hover:shadow-md hover:border-[#BAE6FD] transition-all gap-1.5 active:scale-95"
          >
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-xs text-[#0284C7]">
              <Droplets className="w-4 h-4 fill-[#38BDF8]" />
            </div>
            <span className="text-[9px] font-bold text-slate-700 text-center leading-tight">
              Water
            </span>
          </button>

          <button 
            onClick={() => onNavigateTab('calories')} 
            className="flex flex-col items-center justify-center p-2.5 rounded-[22px] bg-[#FFF2E8] border border-[#FEDDC7] hover:shadow-md hover:border-[#FFD0B5] transition-all gap-1.5 active:scale-95"
          >
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-xs text-[#EA580C]">
              <Flame className="w-4 h-4 fill-[#FB923C]" />
            </div>
            <span className="text-[9px] font-bold text-slate-700 text-center leading-tight">
              Calories
            </span>
          </button>

          <button 
            onClick={() => onNavigateTab('steps')} 
            className="flex flex-col items-center justify-center p-2.5 rounded-[22px] bg-[#EBF8EE] border border-[#D2F2D9] hover:shadow-md hover:border-[#B7EFC4] transition-all gap-1.5 active:scale-95"
          >
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-xs text-[#16A34A]">
              <Footprints className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-bold text-slate-700 text-center leading-tight">
              Steps
            </span>
          </button>

          <button 
            onClick={() => onNavigateTab('tablets')} 
            className="flex flex-col items-center justify-center p-2.5 rounded-[22px] bg-[#FAF5FF] border border-[#E9D5FF] hover:shadow-md hover:border-[#DDD6FE] transition-all gap-1.5 active:scale-95"
          >
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-xs text-[#7E22CE]">
              <Pill className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-bold text-slate-700 text-center leading-tight">
              Tablets
            </span>
          </button>

          <button 
            onClick={() => onNavigateTab('pomodoro')} 
            className="flex flex-col items-center justify-center p-2.5 rounded-[22px] bg-[#FEEBED] border border-[#FDCED4] hover:shadow-md hover:border-[#FBB4BE] transition-all gap-1.5 active:scale-95"
          >
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-xs text-[#E11D48]">
              <Target className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-bold text-slate-700 text-center leading-tight">
              Focus
            </span>
          </button>
        </div>
      </div>

      {/* 4. Today's Plan (Pastel Soft Cards) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-black text-slate-800">Today's Schedule</h3>
          <button onClick={() => onNavigateTab('activity')} className="text-xs font-bold text-[#15803D] hover:underline">
            View all
          </button>
        </div>

        <div className="space-y-3">
          {/* Medication / Tablets Card */}
          <div className="p-4 rounded-[28px] bg-white shadow-xs border border-slate-100/90 flex items-center justify-between hover:border-[#E9D5FF] transition-all">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF5FF] flex items-center justify-center text-[#7E22CE] shadow-xs">
                <Pill className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-slate-800">Daily Tablets & Vitamins</h4>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-[#FAF5FF] text-[#7E22CE] border border-[#E9D5FF]">
                    {tablets.filter(t => t.isTaken).length}/{tablets.length} Done
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {tablets.find(t => !t.isTaken) 
                    ? `Next: ${tablets.find(t => !t.isTaken)?.name} at ${tablets.find(t => !t.isTaken)?.time}`
                    : (tablets.length === 0 ? 'No medication scheduled' : 'All doses taken for today 🎉')}
                </p>
              </div>
            </div>

            <button 
              onClick={() => onNavigateTab('tablets')}
              className="w-10 h-10 rounded-full bg-[#FAF5FF] hover:bg-[#F3E8FF] border border-[#DDD6FE] flex items-center justify-center text-[#7E22CE] shadow-xs active:scale-95 transition-all"
              title="Open Tablets Schedule"
              aria-label="Open tablets"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Workout Card */}
          <div className="p-4 rounded-[28px] bg-white shadow-xs border border-slate-100/90 flex items-center justify-between hover:border-[#CDEED5] transition-all">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F7ED] flex items-center justify-center text-[#15803D] shadow-xs">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-slate-800">{activeWorkout.title}</h4>
                  {activeWorkout.isCompleted && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-[#D7F4DF] text-[#15803D]">Done</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {activeWorkout.exercisesCount} exercises • {activeWorkout.durationMinutes} min • ~{activeWorkout.caloriesBurned} kcal
                </p>
              </div>
            </div>

            <button 
              onClick={onStartWorkout}
              className="w-10 h-10 rounded-full bg-[#52D288] hover:bg-[#43BE75] flex items-center justify-center text-white shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
              title="Start / Log Workout"
              aria-label="Start workout"
            >
              <Play className="w-4 h-4 fill-white ml-0.5" />
            </button>
          </div>

          {/* Meal Card */}
          <div className="p-4 rounded-[28px] bg-white shadow-xs border border-slate-100/90 flex items-center justify-between hover:border-[#FEDDC7] transition-all">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF2E8] flex items-center justify-center overflow-hidden shadow-xs">
                <img src="/salad_bowl_1786738448163.jpg" alt="Salad" className="w-9 h-9 object-contain mix-blend-multiply" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-800">
                  {recentMeal ? recentMeal.name : 'Balanced Nutrition Meal'}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {recentMeal ? `${recentMeal.mealType} • ${recentMeal.calories} kcal` : 'Breakfast • 450 kcal • 25g protein'}
                </p>
              </div>
            </div>

            <button 
              onClick={onAddMeal}
              className="w-10 h-10 rounded-full bg-[#FDBA74] hover:bg-[#FB923C] flex items-center justify-center text-white shadow-md shadow-orange-400/20 active:scale-95 transition-all"
              title="Log Meal"
              aria-label="Log meal"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
