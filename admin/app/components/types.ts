export interface MealItem {
  id: string;
  name: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  calories: number;
  carbs: number;
  protein: number;
  fats: number;
  time: string;
}

export interface TabletItem {
  id: string;
  name: string;
  dosage: string;
  time: string;
  isTaken: boolean;
  category: 'Supplement' | 'Prescription' | 'Vitamin' | 'Daily Care';
}

export interface WorkoutItem {
  id: string;
  title: string;
  category: string;
  exercisesCount: number;
  durationMinutes: number;
  caloriesBurned: number;
  isCompleted: boolean;
  completedAt?: string;
}

export interface GoalItem {
  id: string;
  title: string;
  category: 'steps' | 'water' | 'workout' | 'calories' | 'tablets';
  targetValue: number;
  currentValue: number;
  unit: string;
  period: 'daily' | 'weekly' | 'monthly';
}

export interface PomodoroTask {
  id: string;
  title: string;
  completed: boolean;
  estimatedSessions: number;
  completedSessions: number;
}

export interface WaterLogItem {
  id: string;
  amountMl: number;
  time: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  isRead: boolean;
  type: 'goal' | 'water' | 'workout' | 'tablets' | 'system';
}

export interface UserGoals {
  dailySteps: number;
  dailyWaterL: number;
  dailyCalories: number;
  weeklyWorkouts: number;
}
