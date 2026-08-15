'use client';

import React from 'react';
import { Flame, Plus, Calculator, Trash2, Utensils } from 'lucide-react';
import { MealItem } from './types';

export function CalorieScreen({
  totalCalories,
  calorieGoal,
  meals,
  onOpenAddMealModal,
  onOpenCalculatorModal,
  onDeleteMeal
}: {
  totalCalories: number;
  calorieGoal: number;
  meals: MealItem[];
  onOpenAddMealModal: () => void;
  onOpenCalculatorModal: () => void;
  onDeleteMeal: (id: string) => void;
}) {
  const totalCarbs = meals.reduce((acc, m) => acc + (m.carbs || 0), 0);
  const totalProtein = meals.reduce((acc, m) => acc + (m.protein || 0), 0);
  const totalFats = meals.reduce((acc, m) => acc + (m.fats || 0), 0);

  const percentage = Math.min(100, Math.round((totalCalories / calorieGoal) * 100));
  const remainingKcal = Math.max(0, calorieGoal - totalCalories);

  return (
    <div className="space-y-5 animate-fade-in pt-1 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#FFE5D9] flex items-center justify-center text-[#EA580C]">
            <Flame className="w-4 h-4 fill-[#FB923C]" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800">Nutrition & Diet</h2>
            <p className="text-[10px] text-slate-500 font-bold">Macros & calorie budget</p>
          </div>
        </div>
        <button
          onClick={onOpenCalculatorModal}
          className="px-3.5 py-1.5 rounded-full bg-[#FFF2E8] border border-[#FEDDC7] text-xs font-bold text-[#C2410C] shadow-xs flex items-center gap-1 hover:bg-[#FFE5D9]"
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Food Database</span>
        </button>
      </div>

      {/* Main Calories Card (Pastel Peach/Cream) */}
      <div className="bg-[#FFF8F3] rounded-[40px] p-6 shadow-xs border border-[#FEDDC7] text-center relative flex flex-col items-center">
        <div className="w-full flex items-baseline justify-between">
          <div>
            <h3 className="text-5xl font-black text-slate-800 tracking-tight font-mono">
              {totalCalories.toLocaleString()}
            </h3>
            <p className="text-xs font-bold text-slate-500 mt-0.5">
              of {calorieGoal.toLocaleString()} kcal goal ({percentage}%)
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
            totalCalories > calorieGoal ? 'bg-[#FED7AA] text-[#9A3412]' : 'bg-[#FFE5D9] text-[#C2410C]'
          }`}>
            {totalCalories > calorieGoal ? `+${totalCalories - calorieGoal} kcal over` : `${remainingKcal} kcal left`}
          </span>
        </div>

        {/* Salad Bowl Art */}
        <div className="w-60 h-56 mt-2 flex items-center justify-center">
          <img 
            src="/salad_bowl_1786738448163.jpg" 
            alt="Healthy salad" 
            className="w-full h-full object-contain mix-blend-multiply drop-shadow-xs" 
          />
        </div>

        {/* Macro Nutrient Breakdown (Pastel Badges) */}
        <div className="grid grid-cols-3 gap-2 w-full mt-4 p-4 rounded-3xl bg-white border border-[#FEDDC7] shadow-xs">
          <div className="text-center">
            <div className="flex items-center gap-1.5 justify-center mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-[#86EFAC]"></div>
              <span className="text-[10px] font-extrabold text-slate-500 uppercase">Carbs</span>
            </div>
            <span className="text-base font-black text-slate-800 font-mono">{totalCarbs}g</span>
            <span className="block text-[9px] text-slate-400 font-medium">~{totalCarbs * 4} kcal</span>
          </div>

          <div className="text-center border-x border-slate-100">
            <div className="flex items-center gap-1.5 justify-center mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FDA4AF]"></div>
              <span className="text-[10px] font-extrabold text-slate-500 uppercase">Protein</span>
            </div>
            <span className="text-base font-black text-slate-800 font-mono">{totalProtein}g</span>
            <span className="block text-[9px] text-slate-400 font-medium">~{totalProtein * 4} kcal</span>
          </div>

          <div className="text-center">
            <div className="flex items-center gap-1.5 justify-center mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FDE047]"></div>
              <span className="text-[10px] font-extrabold text-slate-500 uppercase">Fats</span>
            </div>
            <span className="text-base font-black text-slate-800 font-mono">{totalFats}g</span>
            <span className="block text-[9px] text-slate-400 font-medium">~{totalFats * 9} kcal</span>
          </div>
        </div>

        {/* 2-Button Action Bar */}
        <div className="grid grid-cols-2 gap-2 w-full mt-5">
          <button 
            onClick={onOpenCalculatorModal}
            className="py-3.5 rounded-2xl bg-[#FFF2E8] hover:bg-[#FFE5D9] text-[#C2410C] border border-[#FEDDC7] font-black text-xs shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Calculator className="w-4 h-4" /> Calorie Calculator
          </button>
          <button 
            onClick={onOpenAddMealModal}
            className="py-3.5 rounded-2xl bg-[#FB923C] hover:bg-[#F97316] text-white font-black text-xs shadow-md shadow-orange-400/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Quick Add
          </button>
        </div>
      </div>

      {/* Logged Meals List */}
      <div className="bg-white rounded-[32px] p-5 shadow-xs border border-slate-100/90 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Today's Meals</h4>
          <span className="text-[10px] font-bold text-slate-400">{meals.length} logged</span>
        </div>

        {meals.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No meals recorded yet today.</p>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {meals.map((meal) => (
              <div 
                key={meal.id} 
                className="p-3.5 rounded-2xl bg-[#FFF9F5] border border-[#FEDDC7]/60 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FFE5D9] flex items-center justify-center text-[#EA580C]">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-800">{meal.name}</span>
                      <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-white text-slate-600 border border-[#FEDDC7]">
                        {meal.mealType}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                      {meal.calories} kcal • {meal.carbs}g C • {meal.protein}g P • {meal.fats}g F
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400">{meal.time}</span>
                  <button 
                    onClick={() => onDeleteMeal(meal.id)}
                    className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
