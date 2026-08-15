'use client';

import React, { useState, useMemo } from 'react';
import { Activity, Flame, MapPin, Clock, Droplets, Target, TrendingUp } from 'lucide-react';
import { MealItem, WorkoutItem, UserGoals } from './types';

interface ActivityScreenProps {
  steps: number;
  calories: number;
  waterL: number;
  goals: UserGoals;
  workouts: WorkoutItem[];
  meals: MealItem[];
}

export function ActivityScreen({
  steps,
  calories,
  waterL,
  goals,
  workouts,
  meals
}: ActivityScreenProps) {
  const [filter, setFilter] = useState<'Day' | 'Week' | 'Month' | 'Year'>('Week');

  // Real dynamic calculations based on current state
  const stepGoal = goals.dailySteps || 10000;
  const currentStepProgressPct = Math.min(100, Math.round((steps / stepGoal) * 100));

  // Current day index (0 = Sun, 1 = Mon, ... 6 = Sat)
  const todayDayOfWeek = new Date().getDay();
  // Map standard JS day to Mon=0 ... Sun=6
  const currentDayIndex = todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1;

  // Real dynamic chart data generator based on active filter
  const chartData = useMemo(() => {
    if (filter === 'Day') {
      // Hourly breakdown of today's steps
      const hours = ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];
      const currentHour = new Date().getHours();
      let currentPeriodIdx = 0;
      if (currentHour >= 9) currentPeriodIdx = 1;
      if (currentHour >= 12) currentPeriodIdx = 2;
      if (currentHour >= 15) currentPeriodIdx = 3;
      if (currentHour >= 18) currentPeriodIdx = 4;
      if (currentHour >= 21) currentPeriodIdx = 5;

      return hours.map((hour, idx) => {
        const estSteps = idx === currentPeriodIdx ? steps : 0;
        const peakHourMax = Math.max(1, stepGoal * 0.35);
        const heightPct = Math.min(100, Math.max(12, Math.round((estSteps / peakHourMax) * 100)));
        return {
          label: hour,
          value: estSteps,
          heightPct,
          isCurrent: idx === currentPeriodIdx
        };
      });
    }

    if (filter === 'Week') {
      // 7-day week breakdown Mon-Sun with today's real step count
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

      return days.map((day, idx) => {
        const isToday = idx === currentDayIndex;
        const daySteps = isToday ? steps : 0;
        const heightPct = Math.min(100, Math.max(12, Math.round((daySteps / (stepGoal * 1.2)) * 100)));
        return {
          label: day,
          value: daySteps,
          heightPct,
          isCurrent: isToday
        };
      });
    }

    if (filter === 'Month') {
      // 4-Week breakdown of the current month
      const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      const currentWeekNum = Math.floor(new Date().getDate() / 7);
      const activeWeekIdx = Math.min(3, currentWeekNum);

      return weeks.map((w, idx) => {
        const isCurrent = idx === activeWeekIdx;
        const weekSteps = isCurrent ? steps : 0;
        const maxWeek = Math.max(1, stepGoal * 7);
        return {
          label: w,
          value: weekSteps,
          heightPct: Math.min(100, Math.max(12, Math.round((weekSteps / maxWeek) * 100))),
          isCurrent
        };
      });
    }

    // Year breakdown (Q1 to Q4)
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const currentMonth = new Date().getMonth();
    let currentQuarterIdx = 0;
    if (currentMonth >= 3) currentQuarterIdx = 1;
    if (currentMonth >= 6) currentQuarterIdx = 2;
    if (currentMonth >= 9) currentQuarterIdx = 3;

    return quarters.map((q, idx) => {
      const isCurrent = idx === currentQuarterIdx;
      const quarterSteps = isCurrent ? steps : 0;
      const maxQ = Math.max(1, stepGoal * 90);
      return {
        label: q,
        value: quarterSteps,
        heightPct: Math.min(100, Math.max(12, Math.round((quarterSteps / maxQ) * 100))),
        isCurrent
      };
    });
  }, [filter, steps, stepGoal, currentDayIndex]);

  // Aggregate metrics computed from real active data
  const workoutCalories = workouts
    .filter(w => w.isCompleted)
    .reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);

  const stepBurnCalories = Math.round(steps * 0.042);
  const totalBurnCalories = stepBurnCalories + workoutCalories;

  const realDistanceKm = (steps * 0.00078).toFixed(2);
  const activeWorkoutMinutes = workouts
    .filter(w => w.isCompleted)
    .reduce((sum, w) => sum + (w.durationMinutes || 0), 0);
  const activeStepMinutes = Math.round(steps / 115);
  const totalActiveMinutes = activeStepMinutes + activeWorkoutMinutes;

  const periodAverageSteps = useMemo(() => {
    if (chartData.length === 0) return steps;
    const sum = chartData.reduce((acc, curr) => acc + curr.value, 0);
    return Math.round(sum / chartData.length);
  }, [chartData, steps]);

  const getSmoothPath = () => {
    if (chartData.length === 0) return '';
    const points = chartData.map((d, i) => ({
      x: (i + 0.5) * (100 / chartData.length),
      y: 100 - d.heightPct
    }));
    
    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      path += ` C ${cpX},${p0.y} ${cpX},${p1.y} ${p1.x},${p1.y}`;
    }
    return path;
  };

  const getAreaPath = () => {
    if (chartData.length === 0) return '';
    const points = chartData.map((d, i) => ({
      x: (i + 0.5) * (100 / chartData.length),
      y: 100 - d.heightPct
    }));
    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      path += ` C ${cpX},${p0.y} ${cpX},${p1.y} ${p1.x},${p1.y}`;
    }
    path += ` L ${points[points.length - 1].x},100 L ${points[0].x},100 Z`;
    return path;
  };

  return (
    <div className="space-y-5 animate-fade-in pt-1 pb-4">
      {/* 1. Clean Header without static badges */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#E8F7ED] flex items-center justify-center text-[#15803D] shadow-xs">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">Activity Analytics</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
              <span className="text-[11px] text-slate-500 font-bold">
                Goal Pace: {currentStepProgressPct}% of daily target
              </span>
            </div>
          </div>
        </div>

        <div className="px-3 py-1 rounded-full bg-[#F1F5F9] border border-slate-200 text-xs font-mono font-bold text-slate-700">
          {filter} View
        </div>
      </div>

      {/* 2. Period Filter Switcher */}
      <div className="bg-white rounded-2xl p-1 shadow-xs border border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
        {(['Day', 'Week', 'Month', 'Year'] as const).map((period) => (
          <button
            key={period}
            onClick={() => setFilter(period)}
            className={`flex-1 py-2 rounded-xl transition-all ${
              filter === period 
                ? 'bg-[#52D288] text-white font-extrabold shadow-xs' 
                : 'hover:bg-[#F8FAFC] text-slate-600'
            }`}
          >
            {period}
          </button>
        ))}
      </div>

      {/* 3. Dynamic SVG Line Chart Summary Card */}
      <div className="bg-white rounded-[36px] p-6 shadow-xs border border-slate-100/90 space-y-6">
        <div className="flex items-end justify-between px-1">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              {filter === 'Day' ? 'Today Total Steps' : `Average ${filter} Steps`}
            </span>
            <h3 className="text-3xl font-black text-slate-800 font-mono tracking-tight mt-0.5">
              {filter === 'Day' ? steps.toLocaleString() : periodAverageSteps.toLocaleString()}
            </h3>
          </div>

          <div className="text-right">
            <span className="text-xs font-extrabold text-[#15803D] flex items-center gap-0.5 justify-end font-mono">
              <TrendingUp className="w-3.5 h-3.5" /> {currentStepProgressPct}%
            </span>
            <p className="text-[10px] font-medium text-slate-400">of daily goal</p>
          </div>
        </div>

        {/* Dynamic Interactive SVG Line Chart */}
        <div className="relative h-44 px-1 pt-4 border-b border-slate-100 pb-3 flex flex-col justify-between">
          <div className="relative w-full h-32">
            <svg 
              className="absolute inset-0 w-full h-full overflow-visible" 
              viewBox="0 0 100 100" 
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34D399" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#34D399" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path 
                d={getAreaPath()} 
                fill="url(#lineGradient)" 
              />
              <path 
                d={getSmoothPath()} 
                fill="none" 
                stroke="#34D399" 
                strokeWidth="4" 
                vectorEffect="non-scaling-stroke" 
                strokeLinecap="round"
                className="drop-shadow-sm"
              />
            </svg>

            {/* Interactive Data Points */}
            <div className="absolute inset-0 flex items-end justify-between">
              {chartData.map((item) => (
                <div key={item.label} className="relative flex flex-col items-center flex-1 h-full group">
                  <div 
                    className="absolute w-full flex justify-center items-end"
                    style={{ bottom: `${item.heightPct}%` }}
                  >
                    <span className="absolute -top-7 px-2 py-0.5 rounded-lg bg-slate-800 text-white text-[9px] font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-md">
                      {item.value.toLocaleString()}
                    </span>
                    <div className={`w-3 h-3 rounded-full border-2 bg-white transition-all duration-300 transform translate-y-1.5 ${item.isCurrent ? 'border-[#15803D] scale-125 shadow-[0_0_8px_rgba(21,128,61,0.4)]' : 'border-[#34D399] group-hover:scale-125'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* X Axis Labels */}
          <div className="flex items-center justify-between mt-3">
            {chartData.map((item) => (
              <span key={item.label} className={`flex-1 text-center text-[10px] font-extrabold ${item.isCurrent ? 'text-[#15803D]' : 'text-slate-400'}`}>
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Real-time Aggregate Telemetry Cards (Dynamic Real Data) */}
      <div className="grid grid-cols-3 gap-3">
        {/* Calories Burned Card */}
        <div className="bg-[#FFF8F3] p-4 rounded-3xl shadow-xs border border-[#FEDDC7] text-left">
          <div className="w-8 h-8 rounded-xl bg-[#FFE5D9] flex items-center justify-center text-[#EA580C] mb-2">
            <Flame className="w-4 h-4 fill-[#FB923C]" />
          </div>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase">Est. Burn</span>
          <p className="text-base font-black text-slate-800 font-mono mt-0.5">{totalBurnCalories.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400 font-medium">kcal today</span>
        </div>

        {/* Distance Card */}
        <div className="bg-[#F2FAF4] p-4 rounded-3xl shadow-xs border border-[#CDEED5] text-left">
          <div className="w-8 h-8 rounded-xl bg-[#D7F4DF] flex items-center justify-center text-[#16A34A] mb-2">
            <MapPin className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase">Distance</span>
          <p className="text-base font-black text-slate-800 font-mono mt-0.5">{realDistanceKm}</p>
          <span className="text-[10px] text-slate-400 font-medium">km traversed</span>
        </div>

        {/* Active Time Card */}
        <div className="bg-[#FEFCE8] p-4 rounded-3xl shadow-xs border border-[#FEF08A] text-left">
          <div className="w-8 h-8 rounded-xl bg-[#FEF9C3] flex items-center justify-center text-[#CA8A04] mb-2">
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase">Active Time</span>
          <p className="text-base font-black text-slate-800 font-mono mt-0.5">{totalActiveMinutes}m</p>
          <span className="text-[10px] text-slate-400 font-medium">active effort</span>
        </div>
      </div>

      {/* 5. Hydration & Nutrition Balance (Real Working Data) */}
      <div className="bg-white rounded-[32px] p-5 shadow-xs border border-slate-100/90 space-y-3">
        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Health Balance Summary</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#F3F9FD] border border-[#DAEFFB] flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#DDF2FB] flex items-center justify-center text-[#0284C7]">
              <Droplets className="w-4 h-4 fill-[#38BDF8]" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase">Fluid Intake</span>
              <p className="text-sm font-black text-slate-800 font-mono">{waterL.toFixed(1)} / {goals.dailyWaterL.toFixed(1)} L</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FDF4FF] border border-[#F5D0FE] flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#FAE8FF] flex items-center justify-center text-[#A21CAF]">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase">Completed Tasks</span>
              <p className="text-sm font-black text-slate-800 font-mono">
                {workouts.filter(w => w.isCompleted).length} / {workouts.length} workouts
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
