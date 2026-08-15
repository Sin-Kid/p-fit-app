'use client';

import React from 'react';
import { Target, Play, Pause, RotateCcw, ListTodo } from 'lucide-react';
import { PomodoroTask } from './types';

export function PomodoroScreen({
  pomoSeconds,
  pomoRunning,
  pomoSessions,
  pomoMode,
  tasks,
  onToggleTimer,
  onResetTimer,
  onSwitchMode,
  onOpenTasksModal
}: {
  pomoSeconds: number;
  pomoRunning: boolean;
  pomoSessions: number;
  pomoMode: 'focus' | 'shortBreak' | 'longBreak';
  tasks: PomodoroTask[];
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onSwitchMode: (mode: 'focus' | 'shortBreak' | 'longBreak', mins: number) => void;
  onOpenTasksModal: () => void;
}) {
  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${mins}:${s}`;
  };

  const completedTasks = tasks.filter(t => t.completed).length;

  return (
    <div className="space-y-5 animate-fade-in pt-1 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#FFE4E6] flex items-center justify-center text-[#E11D48]">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800">Pomodoro Focus</h2>
            <p className="text-[10px] text-slate-500 font-bold">Deep work interval timer</p>
          </div>
        </div>
        <div className="px-3.5 py-1.5 rounded-full bg-[#FFF1F2] text-[#BE123C] border border-[#FECDD3] text-xs font-bold shadow-xs">
          🍅 Streak: {pomoSessions}
        </div>
      </div>

      {/* Main Focus Card (Pastel Blush/Rose) */}
      <div className="bg-[#FFF5F6] rounded-[40px] p-6 shadow-xs border border-[#FECDD3] text-center relative flex flex-col items-center">
        {/* Interval Mode Pills */}
        <div className="flex bg-white p-1 rounded-2xl w-full text-xs font-bold mb-4 border border-[#FECDD3]/60 shadow-xs">
          <button
            onClick={() => onSwitchMode('focus', 25)}
            className={`flex-1 py-2 rounded-xl transition-all ${
              pomoMode === 'focus' ? 'bg-[#FB7185] text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Focus (25m)
          </button>
          <button
            onClick={() => onSwitchMode('shortBreak', 5)}
            className={`flex-1 py-2 rounded-xl transition-all ${
              pomoMode === 'shortBreak' ? 'bg-[#FB7185] text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Break (5m)
          </button>
          <button
            onClick={() => onSwitchMode('longBreak', 15)}
            className={`flex-1 py-2 rounded-xl transition-all ${
              pomoMode === 'longBreak' ? 'bg-[#FB7185] text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Long (15m)
          </button>
        </div>

        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
          {pomoMode === 'focus' ? 'Focus Interval' : 'Resting Interval'}
        </p>

        {/* Large Digital Display */}
        <h3 className="text-6xl font-black text-slate-800 tracking-tight font-mono">
          {formatTime(pomoSeconds)}
        </h3>

        {/* Tomato Graphic */}
        <div className="w-56 h-52 my-1 relative flex items-center justify-center">
          <img 
            src="/tomato_timer_1786738561584.jpg" 
            alt="Tomato Pomodoro" 
            className="w-full h-full object-contain mix-blend-multiply drop-shadow-xs" 
          />
        </div>

        {/* Session Milestone Indicator */}
        <div className="flex items-center gap-2">
          <h4 className="text-xl font-black text-slate-800">Sprint #{pomoSessions}</h4>
          <span className="text-xs font-bold text-slate-400">of 6 daily target</span>
        </div>

        {/* Action Controls */}
        <div className="w-full space-y-2.5 mt-5">
          <div className="flex gap-2">
            <button
              onClick={onResetTimer}
              className="p-4 rounded-2xl bg-white hover:bg-[#FFE4E6] text-slate-600 border border-[#FECDD3] active:scale-95 transition-all shadow-xs"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button 
              onClick={onToggleTimer}
              className="flex-1 py-4 rounded-2xl bg-[#FB7185] hover:bg-[#F43F5E] text-white font-black text-xs shadow-md shadow-rose-400/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {pomoRunning ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{pomoRunning ? 'Pause Session' : 'Start Focus'}</span>
            </button>
          </div>

          <button 
            onClick={onOpenTasksModal}
            className="w-full py-3 rounded-2xl bg-white border border-[#FECDD3] text-[#BE123C] font-bold text-xs hover:bg-[#FFE4E6]/50 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-xs"
          >
            <ListTodo className="w-4 h-4" /> Focus Tasks ({completedTasks}/{tasks.length})
          </button>
        </div>
      </div>
    </div>
  );
}
