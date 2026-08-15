'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, Plus, Droplets, Flame, Footprints, Target, Check, Trash2,
  Dumbbell, CheckCircle2, Award, Bell, Calculator, Pill
} from 'lucide-react';
import { MealItem, GoalItem, PomodoroTask, NotificationItem, UserGoals, TabletItem } from './types';

// 1. Quick Action FAB Sheet (Pastel Palette)
export function QuickActionModal({ 
  isOpen, 
  onClose, 
  onSelectAction 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSelectAction: (action: 'water' | 'meal' | 'calculator' | 'steps' | 'workout' | 'pomodoro' | 'goal' | 'tablets') => void; 
}) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-end justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-action-title"
    >
      <div className="w-full max-w-sm rounded-[36px] bg-white p-6 space-y-4 shadow-2xl animate-fade-in border border-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#E8F7ED] flex items-center justify-center text-[#15803D]">
              <Plus className="w-4 h-4" />
            </div>
            <h3 id="quick-action-title" className="text-base font-black text-slate-800">Quick Log</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={() => { onSelectAction('water'); onClose(); }}
            className="p-4 rounded-2xl bg-[#EAF5FC] hover:bg-[#DDF2FB] border border-[#D0EBFB] flex flex-col items-start gap-2 text-left transition-all active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-[#38BDF8] text-white flex items-center justify-center shadow-xs">
              <Droplets className="w-5 h-5 fill-white" />
            </div>
            <div>
              <span className="text-xs font-black text-slate-800">Log Water</span>
              <p className="text-[10px] font-medium text-slate-500">Record intake</p>
            </div>
          </button>

          <button
            onClick={() => { onSelectAction('calculator'); onClose(); }}
            className="p-4 rounded-2xl bg-[#FFF2E8] hover:bg-[#FFE5D9] border border-[#FEDDC7] flex flex-col items-start gap-2 text-left transition-all active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FB923C] text-white flex items-center justify-center shadow-xs">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black text-slate-800">Calorie Calc</span>
              <p className="text-[10px] font-medium text-slate-500">560+ food items</p>
            </div>
          </button>

          <button
            onClick={() => { onSelectAction('steps'); onClose(); }}
            className="p-4 rounded-2xl bg-[#EBF8EE] hover:bg-[#D7F4DF] border border-[#D2F2D9] flex flex-col items-start gap-2 text-left transition-all active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-[#52D288] text-white flex items-center justify-center shadow-xs">
              <Footprints className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black text-slate-800">Add Steps</span>
              <p className="text-[10px] font-medium text-slate-500">Sync pedometer</p>
            </div>
          </button>

          <button
            onClick={() => { onSelectAction('workout'); onClose(); }}
            className="p-4 rounded-2xl bg-[#EAF7EE] hover:bg-[#D7F4DF] border border-[#CDEED5] flex flex-col items-start gap-2 text-left transition-all active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-[#15803D] text-white flex items-center justify-center shadow-xs">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black text-slate-800">Workout</span>
              <p className="text-[10px] font-medium text-slate-500">Start session</p>
            </div>
          </button>

          <button
            onClick={() => { onSelectAction('pomodoro'); onClose(); }}
            className="p-4 rounded-2xl bg-[#FEEBED] hover:bg-[#FFE4E6] border border-[#FDCED4] flex flex-col items-start gap-2 text-left transition-all active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FB7185] text-white flex items-center justify-center shadow-xs">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black text-slate-800">Pomodoro</span>
              <p className="text-[10px] font-medium text-slate-500">Focus sprint</p>
            </div>
          </button>

          <button
            onClick={() => { onSelectAction('goal'); onClose(); }}
            className="p-4 rounded-2xl bg-[#F3E8FF] hover:bg-[#EDE9FE] border border-[#DDD6FE] flex flex-col items-start gap-2 text-left transition-all active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-[#A855F7] text-white flex items-center justify-center shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black text-slate-800">New Goal</span>
              <p className="text-[10px] font-medium text-slate-500">Set target</p>
            </div>
          </button>

          <button
            onClick={() => { onSelectAction('tablets'); onClose(); }}
            className="p-4 rounded-2xl bg-[#FAF5FF] hover:bg-[#F3E8FF] border border-[#E9D5FF] flex flex-col items-start gap-2 text-left transition-all active:scale-95 col-span-2"
          >
            <div className="flex items-center gap-3 w-full">
              <div className="w-9 h-9 rounded-xl bg-[#7E22CE] text-white flex items-center justify-center shadow-xs">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-black text-slate-800 block">Tablets & Medication</span>
                <p className="text-[10px] font-medium text-slate-500">Log prescription / schedule vitamin</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

// 2. Add Water Modal
export function AddWaterModal({
  isOpen,
  onClose,
  onAddWater
}: {
  isOpen: boolean;
  onClose: () => void;
  onAddWater: (ml: number) => void;
}) {
  const [customMl, setCustomMl] = useState<string>('250');

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customMl, 10);
    if (!isNaN(val) && val > 0) {
      onAddWater(val);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-[36px] bg-white p-6 space-y-4 shadow-2xl animate-fade-in border border-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#DDF2FB] flex items-center justify-center text-[#0284C7]">
              <Droplets className="w-4 h-4 fill-[#38BDF8]" />
            </div>
            <h3 className="text-base font-black text-slate-800">Log Hydration</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: 'Glass', ml: 150 },
            { label: 'Mug', ml: 250 },
            { label: 'Bottle', ml: 500 },
            { label: 'Large', ml: 750 },
            { label: 'Jug', ml: 1000 },
            { label: 'Sip', ml: 100 },
          ].map((item) => (
            <button
              key={item.ml}
              onClick={() => { onAddWater(item.ml); onClose(); }}
              className="p-3 rounded-2xl bg-[#F3F9FD] hover:bg-[#E0F2FE] border border-[#DAEFFB] flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all"
            >
              <span className="text-xs font-black text-[#0284C7] font-mono">+{item.ml}ml</span>
              <span className="text-[10px] font-medium text-slate-500">{item.label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleCustomSubmit} className="space-y-3 pt-2">
          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Custom Amount (ml)</label>
            <div className="relative">
              <input
                type="number"
                min="10"
                max="5000"
                step="10"
                value={customMl}
                onChange={(e) => setCustomMl(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#38BDF8]"
              />
              <span className="absolute right-4 top-3 text-xs font-bold text-slate-400">ml</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-[#38BDF8] hover:bg-[#0EA5E9] text-white font-black text-xs shadow-md shadow-sky-400/20 active:scale-95 transition-all"
          >
            Add Water Log
          </button>
        </form>
      </div>
    </div>
  );
}

// 3. Add Meal Modal
export function AddMealModal({
  isOpen,
  onClose,
  onAddMeal,
  onOpenCalculator
}: {
  isOpen: boolean;
  onClose: () => void;
  onAddMeal: (meal: Omit<MealItem, 'id' | 'time'>) => void;
  onOpenCalculator?: () => void;
}) {
  const [name, setName] = useState<string>('');
  const [mealType, setMealType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'>('Breakfast');
  const [calories, setCalories] = useState<string>('350');
  const [carbs, setCarbs] = useState<string>('45');
  const [protein, setProtein] = useState<string>('20');
  const [fats, setFats] = useState<string>('10');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddMeal({
      name: name.trim(),
      mealType,
      calories: parseInt(calories, 10) || 0,
      carbs: parseInt(carbs, 10) || 0,
      protein: parseInt(protein, 10) || 0,
      fats: parseInt(fats, 10) || 0,
    });
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-[36px] bg-white p-6 space-y-4 shadow-2xl animate-fade-in border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FFE5D9] flex items-center justify-center text-[#EA580C]">
              <Flame className="w-4 h-4 fill-[#FB923C]" />
            </div>
            <h3 className="text-base font-black text-slate-800">Log Nutrition</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {onOpenCalculator && (
          <button
            type="button"
            onClick={() => { onClose(); onOpenCalculator(); }}
            className="w-full p-3 rounded-2xl bg-[#FFF8F3] border border-[#FEDDC7] text-[#C2410C] font-bold text-xs flex items-center justify-between hover:bg-[#FFE5D9] transition-all shadow-xs"
          >
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#FB923C]" />
              <span>Use Food Database (560+ Items)</span>
            </div>
            <span className="text-[10px] font-extrabold text-[#EA580C] bg-white px-2 py-0.5 rounded-full border border-[#FEDDC7]">Open</span>
          </button>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Meal Type</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const).map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setMealType(type)}
                  className={`py-2 rounded-xl text-center font-bold transition-all ${
                    mealType === type 
                      ? 'bg-[#FB923C] text-white shadow-xs' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Meal / Item Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Avocado Toast with Poached Eggs"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FB923C] font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Total Calories (kcal)</label>
            <input
              type="number"
              min="0"
              required
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold focus:outline-none focus:border-[#FB923C]"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] font-extrabold text-[#15803D] mb-1">Carbs (g)</label>
              <input
                type="number"
                min="0"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F2FAF4] border border-[#CDEED5] text-slate-800 font-bold text-center"
              />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold text-[#BE123C] mb-1">Protein (g)</label>
              <input
                type="number"
                min="0"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FFF5F6] border border-[#FECDD3] text-slate-800 font-bold text-center"
              />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold text-[#CA8A04] mb-1">Fats (g)</label>
              <input
                type="number"
                min="0"
                value={fats}
                onChange={(e) => setFats(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FEFCE8] border border-[#FEF08A] text-slate-800 font-bold text-center"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-[#FB923C] hover:bg-[#F97316] text-white font-black text-xs shadow-md shadow-orange-400/20 active:scale-95 transition-all mt-2"
          >
            Record Meal
          </button>
        </form>
      </div>
    </div>
  );
}

// 4. Workout Modal Runner (Pastel Mint)
export function WorkoutModal({
  isOpen,
  onClose,
  onCompleteWorkout
}: {
  isOpen: boolean;
  onClose: () => void;
  onCompleteWorkout: (durationMins: number, caloriesBurned: number) => void;
}) {
  const [seconds, setSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [exercises, setExercises] = useState([
    { id: '1', name: 'Jumping Jacks Warmup', reps: '45 sec', done: false },
    { id: '2', name: 'Bodyweight Squats', reps: '3 sets x 15 reps', done: false },
    { id: '3', name: 'Pushups / Incline', reps: '3 sets x 12 reps', done: false },
    { id: '4', name: 'Plank Hold', reps: '3 sets x 45 sec', done: false },
    { id: '5', name: 'High Knees Cadence', reps: '2 min', done: false },
  ]);

  useEffect(() => {
    let interval: any = null;
    if (isOpen && isRunning) {
      interval = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, isRunning]);

  if (!isOpen) return null;

  const toggleExercise = (id: string) => {
    setExercises(prev => prev.map(e => e.id === id ? { ...e, done: !e.done } : e));
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const completedCount = exercises.filter(e => e.done).length;
  const estimatedCalories = Math.round((seconds / 60) * 8.5) + (completedCount * 30);

  const handleFinish = () => {
    onCompleteWorkout(Math.max(1, Math.round(seconds / 60)), Math.max(50, estimatedCalories));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-[36px] bg-white p-6 space-y-4 shadow-2xl animate-fade-in border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-[#15803D] tracking-wider">Live Session</span>
            <h3 className="text-base font-black text-slate-800">Full Body Workout</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Timer Box (Pastel Mint) */}
        <div className="p-4 rounded-3xl bg-[#EAF7EE] border border-[#CDEED5] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase">Elapsed Time</p>
            <span className="text-3xl font-black text-slate-800 font-mono tracking-tight">{formatTimer(seconds)}</span>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Est. Burn</p>
            <span className="text-lg font-black text-[#EA580C] font-mono">~{estimatedCalories} kcal</span>
          </div>
        </div>

        {/* Exercises Checklist */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500 px-1">
            <span>Exercises Checklist</span>
            <span className="text-[#15803D] font-extrabold">{completedCount} of {exercises.length}</span>
          </div>
          {exercises.map((ex) => (
            <button
              key={ex.id}
              onClick={() => toggleExercise(ex.id)}
              className={`w-full p-3 rounded-2xl border flex items-center justify-between text-left transition-all ${
                ex.done 
                  ? 'bg-[#F2FAF4] border-[#CDEED5]' 
                  : 'bg-slate-50/60 border-slate-100 hover:bg-slate-100/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                  ex.done ? 'bg-[#52D288] border-[#52D288] text-white' : 'border-slate-300 bg-white text-transparent'
                }`}>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <span className={`text-xs font-bold ${ex.done ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                    {ex.name}
                  </span>
                  <p className="text-[10px] text-slate-400 font-medium">{ex.reps}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs active:scale-95 transition-all"
          >
            {isRunning ? 'Pause' : 'Resume'}
          </button>
          <button
            onClick={handleFinish}
            className="flex-1 py-3.5 rounded-2xl bg-[#52D288] hover:bg-[#43BE75] text-white font-black text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Complete Workout</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// 5. Pomodoro Tasks Modal
export function PomodoroTasksModal({
  isOpen,
  onClose,
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask
}: {
  isOpen: boolean;
  onClose: () => void;
  tasks: PomodoroTask[];
  onAddTask: (title: string, sessions: number) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}) {
  const [newTitle, setNewTitle] = useState<string>('');
  const [sessionsEst, setSessionsEst] = useState<number>(2);

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      onAddTask(newTitle.trim(), sessionsEst);
      setNewTitle('');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-[36px] bg-white p-6 space-y-4 shadow-2xl animate-fade-in border border-slate-100 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FFE4E6] flex items-center justify-center text-[#E11D48]">
              <Target className="w-4 h-4" />
            </div>
            <h3 className="text-base font-black text-slate-800">Focus Tasks</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task Form */}
        <form onSubmit={handleAdd} className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add task for this sprint..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#FB7185]"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-[#FB7185] hover:bg-[#F43F5E] text-white font-bold text-xs shadow-xs"
            >
              Add
            </button>
          </div>
        </form>

        {/* Task List */}
        <div className="space-y-2 pt-1 max-h-60 overflow-y-auto">
          {tasks.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-6">No tasks added yet. Add one above!</p>
          ) : (
            tasks.map(t => (
              <div 
                key={t.id}
                className="p-3 rounded-2xl bg-[#FFF9FA] border border-[#FECDD3]/60 flex items-center justify-between gap-2"
              >
                <button
                  onClick={() => onToggleTask(t.id)}
                  className="flex items-center gap-2.5 text-left flex-1"
                >
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                    t.completed ? 'bg-[#FB7185] border-[#FB7185] text-white' : 'border-slate-300 bg-white text-transparent'
                  }`}>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <span className={`text-xs font-bold ${t.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {t.title}
                    </span>
                    <span className="block text-[10px] text-slate-400 font-medium">
                      🍅 {t.completedSessions}/{t.estimatedSessions} sprints
                    </span>
                  </div>
                </button>

                <button 
                  onClick={() => onDeleteTask(t.id)}
                  className="p-1 text-slate-300 hover:text-rose-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// 6. Notification Drawer (Pastel Mint/Sky)
export function NotificationDrawer({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onClearAll
}: {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onClearAll: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-start justify-end p-4">
      <div className="w-full max-w-sm rounded-[36px] bg-white p-6 space-y-4 shadow-2xl animate-fade-in border border-slate-100 max-h-[85vh] overflow-y-auto mt-12">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#E8F7ED] flex items-center justify-center text-[#15803D]">
              <Bell className="w-4 h-4" />
            </div>
            <h3 className="text-base font-black text-slate-800">Notifications</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-between items-center text-xs">
          <button onClick={onMarkAllRead} className="font-bold text-[#15803D] hover:underline">Mark all read</button>
          <button onClick={onClearAll} className="font-bold text-slate-400 hover:text-rose-600">Clear all</button>
        </div>

        <div className="space-y-2.5 pt-1">
          {notifications.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-8">All caught up! No notifications.</p>
          ) : (
            notifications.map(n => (
              <div 
                key={n.id} 
                className={`p-3.5 rounded-2xl border transition-all ${
                  n.isRead ? 'bg-slate-50/60 border-slate-100 opacity-70' : 'bg-[#F2FAF4] border-[#CDEED5] shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-black text-slate-800">{n.title}</h4>
                  <span className="text-[10px] font-mono text-slate-400">{n.time}</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 leading-snug">{n.body}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// 7. Add Goal Modal (Pastel Lavender)
export function AddGoalModal({
  isOpen,
  onClose,
  onAddGoal
}: {
  isOpen: boolean;
  onClose: () => void;
  onAddGoal: (goal: Omit<GoalItem, 'id' | 'currentValue'>) => void;
}) {
  const [title, setTitle] = useState<string>('Daily Walk Challenge');
  const [category, setCategory] = useState<'steps' | 'water' | 'workout' | 'calories'>('steps');
  const [targetValue, setTargetValue] = useState<string>('12000');
  const [unit, setUnit] = useState<string>('steps');
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(targetValue);
    if (!isNaN(val) && val > 0 && title.trim()) {
      onAddGoal({
        title: title.trim(),
        category,
        targetValue: val,
        unit,
        period
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-[36px] bg-white p-6 space-y-4 shadow-2xl animate-fade-in border border-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#F3E8FF] flex items-center justify-center text-[#7E22CE]">
              <Award className="w-4 h-4" />
            </div>
            <h3 className="text-base font-black text-slate-800">Create New Goal</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Goal Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold focus:outline-none focus:border-[#A855F7]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => {
                  const cat = e.target.value as any;
                  setCategory(cat);
                  if (cat === 'steps') setUnit('steps');
                  if (cat === 'water') setUnit('L');
                  if (cat === 'workout') setUnit('sessions');
                  if (cat === 'calories') setUnit('kcal');
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold"
              >
                <option value="steps">Steps</option>
                <option value="water">Water</option>
                <option value="workout">Workouts</option>
                <option value="calories">Calories</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Target ({unit})</label>
              <input
                type="number"
                required
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-[#A855F7] hover:bg-[#9333EA] text-white font-black text-xs shadow-md shadow-purple-400/20 active:scale-95 transition-all mt-2"
          >
            Create Goal
          </button>
        </form>
      </div>
    </div>
  );
}

// 8. Edit Daily Goals Modal
export function EditGoalsModal({
  isOpen,
  onClose,
  goals,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  goals: UserGoals;
  onSave: (updated: UserGoals) => void;
}) {
  const [steps, setSteps] = useState(goals.dailySteps.toString());
  const [water, setWater] = useState(goals.dailyWaterL.toString());
  const [calories, setCalories] = useState(goals.dailyCalories.toString());
  const [workouts, setWorkouts] = useState(goals.weeklyWorkouts.toString());

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      dailySteps: parseInt(steps, 10) || 10000,
      dailyWaterL: parseFloat(water) || 2.5,
      dailyCalories: parseInt(calories, 10) || 2400,
      weeklyWorkouts: parseInt(workouts, 10) || 5,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-[36px] bg-white p-6 space-y-4 shadow-2xl animate-fade-in border border-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-black text-slate-800">Adjust Daily Targets</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Daily Steps Target</label>
            <input
              type="number"
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold"
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Daily Water Target (Liters)</label>
            <input
              type="number"
              step="0.1"
              value={water}
              onChange={(e) => setWater(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold"
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Daily Calorie Budget (kcal)</label>
            <input
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold"
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Weekly Workouts Target</label>
            <input
              type="number"
              value={workouts}
              onChange={(e) => setWorkouts(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-[#52D288] hover:bg-[#43BE75] text-white font-black text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all mt-2"
          >
            Save Targets
          </button>
        </form>
      </div>
    </div>
  );
}

// 9. Add Tablet / Medication Modal
export function AddTabletModal({
  isOpen,
  onClose,
  onAddTablet
}: {
  isOpen: boolean;
  onClose: () => void;
  onAddTablet: (tablet: Omit<TabletItem, 'id'>) => void;
}) {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('1 capsule after food');
  const [time, setTime] = useState('08:30 AM');
  const [category, setCategory] = useState<'Supplement' | 'Prescription' | 'Vitamin' | 'Daily Care'>('Vitamin');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddTablet({
      name: name.trim(),
      dosage: dosage.trim() || '1 dose',
      time: time.trim() || '08:30 AM',
      category,
      isTaken: false
    });

    setName('');
    setDosage('1 capsule after food');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-tablet-title"
    >
      <div className="w-full max-w-sm rounded-[36px] bg-white p-6 space-y-4 shadow-2xl animate-fade-in border border-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FAF5FF] flex items-center justify-center text-[#7E22CE]">
              <Pill className="w-4 h-4" />
            </div>
            <h3 id="add-tablet-title" className="text-base font-black text-slate-800">Add Tablet / Medication</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Medication / Supplement Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Multivitamin, Omega 3, Vitamin D"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold placeholder-slate-400 focus:outline-none focus:border-[#7E22CE]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Dosage & Instructions</label>
            <input
              type="text"
              placeholder="e.g. 1 capsule after breakfast"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold placeholder-slate-400 focus:outline-none focus:border-[#7E22CE]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Scheduled Time</label>
              <input
                type="text"
                placeholder="08:30 AM"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold font-mono placeholder-slate-400 focus:outline-none focus:border-[#7E22CE]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold focus:outline-none focus:border-[#7E22CE]"
              >
                <option value="Vitamin">Vitamin</option>
                <option value="Supplement">Supplement</option>
                <option value="Prescription">Prescription</option>
                <option value="Daily Care">Daily Care</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-[#7E22CE] hover:bg-[#6B21A8] text-white font-black text-xs shadow-md shadow-purple-500/20 active:scale-95 transition-all mt-2"
          >
            Save & Schedule Reminder
          </button>
        </form>
      </div>
    </div>
  );
}
