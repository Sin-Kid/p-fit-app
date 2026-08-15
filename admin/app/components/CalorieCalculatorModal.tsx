'use client';

import React, { useState, useMemo } from 'react';
import { Search, Plus, Minus, Trash2, X, Sparkles, Flame, Check, Utensils, Calculator } from 'lucide-react';
import foodDatabase from '../data/foodCalories.json';
import { MealItem } from './types';

interface SelectedFoodItem {
  food: string;
  serving: string;
  caloriesPerServing: number;
  servings: number;
}

export function CalorieCalculatorModal({
  isOpen,
  onClose,
  onLogMeal
}: {
  isOpen: boolean;
  onClose: () => void;
  onLogMeal: (meal: Omit<MealItem, 'id' | 'time'>) => void;
}) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mealName, setMealName] = useState<string>('Custom Healthy Lunch');
  const [mealType, setMealType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'>('Lunch');
  const [selectedItems, setSelectedItems] = useState<SelectedFoodItem[]>([
    { food: 'Grilled Chicken', serving: '1 breast (200 g)', caloriesPerServing: 280, servings: 1 },
    { food: 'Brown Rice', serving: '1 cup (195 g)', caloriesPerServing: 216, servings: 1 },
    { food: 'Broccoli', serving: '1 bunch (608 g)', caloriesPerServing: 207, servings: 0.5 }
  ]);

  // Filter food database
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return foodDatabase
      .filter((item: any) => item.food.toLowerCase().includes(query))
      .slice(0, 8);
  }, [searchQuery]);

  if (!isOpen) return null;

  const handleAddFood = (item: { food: string; serving: string; calories: number }) => {
    const existingIndex = selectedItems.findIndex(i => i.food.toLowerCase() === item.food.toLowerCase());
    if (existingIndex !== -1) {
      const updated = [...selectedItems];
      updated[existingIndex].servings += 1;
      setSelectedItems(updated);
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          food: item.food,
          serving: item.serving,
          caloriesPerServing: item.calories,
          servings: 1
        }
      ]);
    }
    setSearchQuery('');
  };

  const handleUpdateServings = (index: number, delta: number) => {
    setSelectedItems(prev => {
      const updated = [...prev];
      const newServings = Math.max(0.25, parseFloat((updated[index].servings + delta).toFixed(2)));
      updated[index].servings = newServings;
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== index));
  };

  // Compute total calories & estimated macronutrient breakdown
  const totalCalories = Math.round(
    selectedItems.reduce((acc, item) => acc + (item.caloriesPerServing * item.servings), 0)
  );

  // Approximate macro split: 45% Carbs, 30% Protein, 25% Fats
  const estimatedCarbs = Math.round((totalCalories * 0.45) / 4);
  const estimatedProtein = Math.round((totalCalories * 0.30) / 4);
  const estimatedFats = Math.round((totalCalories * 0.25) / 9);

  const handleSaveAndLog = () => {
    if (totalCalories <= 0) return;
    onLogMeal({
      name: mealName.trim() || 'Calculated Meal',
      mealType,
      calories: totalCalories,
      carbs: estimatedCarbs,
      protein: estimatedProtein,
      fats: estimatedFats
    });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="calculator-modal-title"
    >
      <div className="w-full max-w-md rounded-[36px] bg-white p-6 space-y-4 shadow-2xl animate-fade-in border border-slate-100 max-h-[92vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-[#FFF2E8] flex items-center justify-center text-[#EA580C]">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 id="calculator-modal-title" className="text-base font-black text-slate-800">
                Food Calorie Calculator
              </h3>
              <p className="text-[10px] text-slate-500 font-bold">560+ food items database</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            aria-label="Close calculator"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Search Input */}
        <div className="relative">
          <div className="absolute left-3.5 top-3 text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search food (e.g. Rice, Apple, Chicken, Egg, Avocado)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F8FAFC] border border-slate-200 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FB923C] shadow-inner"
          />
        </div>

        {/* Live Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="p-2 rounded-2xl bg-[#FFF8F3] border border-[#FEDDC7] space-y-1 animate-fade-in shadow-xs">
            <span className="text-[9px] font-extrabold text-[#C2410C] uppercase tracking-wider px-2">
              Database Matches ({searchResults.length})
            </span>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {searchResults.map((item: any) => (
                <div
                  key={item.food}
                  className="p-2.5 rounded-xl bg-white hover:bg-[#FFE5D9]/50 flex items-center justify-between border border-[#FEDDC7]/50 cursor-pointer transition-colors"
                  onClick={() => handleAddFood(item)}
                >
                  <div>
                    <span className="text-xs font-black text-slate-800">{item.food}</span>
                    <p className="text-[10px] text-slate-400">{item.serving}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#EA580C] font-mono">{item.calories} kcal</span>
                    <button 
                      type="button"
                      className="w-6 h-6 rounded-full bg-[#FB923C] text-white flex items-center justify-center shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Meal Items List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1 text-xs">
            <span className="font-extrabold text-slate-700 uppercase text-[10px] tracking-wider">
              Selected Ingredients ({selectedItems.length})
            </span>
            <button 
              onClick={() => setSelectedItems([])}
              className="text-[10px] font-bold text-rose-500 hover:underline"
            >
              Clear all
            </button>
          </div>

          {selectedItems.length === 0 ? (
            <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-dashed border-slate-200 text-center">
              <Utensils className="w-6 h-6 text-slate-300 mx-auto mb-1" />
              <p className="text-xs text-slate-400 font-medium">No ingredients added yet. Search above to add items!</p>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {selectedItems.map((item, index) => (
                <div 
                  key={`${item.food}-${index}`}
                  className="p-2.5 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex items-center justify-between gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-black text-slate-800 truncate block">{item.food}</span>
                    <p className="text-[10px] text-slate-400 truncate">{item.serving}</p>
                  </div>

                  {/* Quantity Counter */}
                  <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-slate-200 shadow-xs">
                    <button
                      onClick={() => handleUpdateServings(index, -0.5)}
                      className="p-0.5 text-slate-400 hover:text-slate-700"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-black text-slate-800 font-mono w-7 text-center">
                      {item.servings}x
                    </span>
                    <button
                      onClick={() => handleUpdateServings(index, 0.5)}
                      className="p-0.5 text-slate-400 hover:text-slate-700"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Subtotal Calories */}
                  <span className="text-xs font-black text-[#EA580C] font-mono w-14 text-right">
                    {Math.round(item.caloriesPerServing * item.servings)} kcal
                  </span>

                  <button 
                    onClick={() => handleRemoveItem(index)}
                    className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Calculated Total & Macro Summary Card (Pastel Peach) */}
        <div className="p-4 rounded-3xl bg-[#FFF8F3] border border-[#FEDDC7] space-y-3">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[10px] font-extrabold text-[#C2410C] uppercase tracking-wider">Total Calculated Energy</span>
              <h4 className="text-3xl font-black text-slate-800 font-mono mt-0.5 tracking-tight">
                {totalCalories.toLocaleString()} <span className="text-sm font-bold font-sans text-slate-400">kcal</span>
              </h4>
            </div>
            <div className="flex items-center gap-1 bg-[#FFE5D9] px-2.5 py-1 rounded-full text-[10px] font-extrabold text-[#9A3412]">
              <Flame className="w-3.5 h-3.5 fill-[#FB923C]" />
              <span>Smart Nutrition</span>
            </div>
          </div>

          {/* Macro Breakdown */}
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#FEDDC7]/80">
            <div className="text-center">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase">Est. Carbs</span>
              <p className="text-xs font-black text-slate-800 font-mono mt-0.5">{estimatedCarbs}g</p>
            </div>
            <div className="text-center border-x border-[#FEDDC7]">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase">Est. Protein</span>
              <p className="text-xs font-black text-slate-800 font-mono mt-0.5">{estimatedProtein}g</p>
            </div>
            <div className="text-center">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase">Est. Fats</span>
              <p className="text-xs font-black text-slate-800 font-mono mt-0.5">{estimatedFats}g</p>
            </div>
          </div>
        </div>

        {/* Meal Category & Name */}
        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-4 gap-1.5 text-xs">
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

          <input
            type="text"
            placeholder="Custom meal name..."
            value={mealName}
            onChange={(e) => setMealName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#FB923C]"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSaveAndLog}
          disabled={totalCalories <= 0}
          className="w-full py-3.5 rounded-2xl bg-[#FB923C] hover:bg-[#F97316] disabled:opacity-50 text-white font-black text-xs shadow-md shadow-orange-400/25 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Log {totalCalories} kcal to Dashboard</span>
        </button>
      </div>
    </div>
  );
}
