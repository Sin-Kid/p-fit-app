'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { WaterScreen } from './components/WaterScreen';
import { CalorieScreen } from './components/CalorieScreen';
import { StepsScreen } from './components/StepsScreen';
import { PomodoroScreen } from './components/PomodoroScreen';
import { ActivityScreen } from './components/ActivityScreen';
import { GoalsScreen } from './components/GoalsScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { TabletsScreen } from './components/TabletsScreen';
import { 
  QuickActionModal, 
  AddWaterModal, 
  AddMealModal, 
  WorkoutModal, 
  PomodoroTasksModal, 
  NotificationDrawer, 
  AddGoalModal, 
  EditGoalsModal,
  AddTabletModal
} from './components/Modals';
import { CalorieCalculatorModal } from './components/CalorieCalculatorModal';
import { AuthScreen } from './components/AuthScreen';
import { MealItem, WorkoutItem, GoalItem, PomodoroTask, WaterLogItem, NotificationItem, UserGoals, TabletItem } from './components/types';
import { Heart, Sparkles, LogIn, ArrowRight } from 'lucide-react';
import { healthConnect } from './lib/healthConnectService';
import { useMotionPedometer } from './lib/useMotionPedometer';

export default function PFitApp() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'home' | 'activity' | 'progress' | 'profile' | 'water' | 'calories' | 'steps' | 'pomodoro' | 'tablets'>('home');

  // Auth & Session State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false); // By default show Login screen on start
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authFullName, setAuthFullName] = useState<string>('');
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Health Metrics State (Strict 0 baseline for new users)
  const [steps, setSteps] = useState<number>(0);
  const [waterL, setWaterL] = useState<number>(0);
  const [waterLogs, setWaterLogs] = useState<WaterLogItem[]>([]);
  const [meals, setMeals] = useState<MealItem[]>([]);

  const [userGoals, setUserGoals] = useState<UserGoals>({
    dailySteps: 10000,
    dailyWaterL: 2.5,
    dailyCalories: 2400,
    weeklyWorkouts: 5,
  });

  const [customGoals, setCustomGoals] = useState<GoalItem[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutItem[]>([]);

  // Handler: Add Steps
  const handleAddSteps = useCallback(async (count: number, showToastAlert: boolean = false) => {
    setSteps(prev => prev + count);
    if (showToastAlert) {
      showToast(`+${count} steps recorded`);
    }

    if (currentUser) {
      await supabase.from('step_logs').insert([{
        user_id: currentUser.id,
        steps: count,
        distance_km: parseFloat((count * 0.00078).toFixed(2)),
        calories_kcal: Math.round(count * 0.042)
      }]).then(() => {});
    }
  }, [currentUser]);

  // Global Root Hardware Pedometer Stream (Monitors continuously)
  useMotionPedometer((count) => {
    handleAddSteps(count, false);
  });

  // Pomodoro State
  const [pomoMode, setPomoMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [pomoSeconds, setPomoSeconds] = useState<number>(25 * 60);
  const [pomoTotal, setPomoTotal] = useState<number>(25 * 60);
  const [pomoRunning, setPomoRunning] = useState<boolean>(false);
  const [pomoSessions, setPomoSessions] = useState<number>(0);
  const [pomoTasks, setPomoTasks] = useState<PomodoroTask[]>([]);

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Tablets & Medication State (Clean 0 array for new users)
  const [tablets, setTablets] = useState<TabletItem[]>([]);

  // Cloud Sync State
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Modals Visibility State
  const [isQuickActionOpen, setIsQuickActionOpen] = useState<boolean>(false);
  const [isAddWaterOpen, setIsAddWaterOpen] = useState<boolean>(false);
  const [isAddMealOpen, setIsAddMealOpen] = useState<boolean>(false);
  const [isCalorieCalcOpen, setIsCalorieCalcOpen] = useState<boolean>(false);
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState<boolean>(false);
  const [isPomodoroTasksOpen, setIsPomodoroTasksOpen] = useState<boolean>(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState<boolean>(false);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState<boolean>(false);
  const [isEditTargetsOpen, setIsEditTargetsOpen] = useState<boolean>(false);
  const [isAddTabletOpen, setIsAddTabletOpen] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  /**
   * Load user-isolated data from Supabase Cloud
   */
  const loadUserData = useCallback(async (user: any) => {
    if (!user) {
      // Clean 0s for unauthenticated / guest
      setSteps(0);
      setWaterL(0);
      setWaterLogs([]);
      setMeals([]);
      setTablets([]);
      setWorkouts([]);
      setPomoSessions(0);
      setCustomGoals([]);
      return;
    }

    try {
      // 1. Ensure user profile exists in Supabase profiles table
      await supabase.from('profiles').upsert({
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'P-fit User',
        email: user.email,
        daily_step_goal: 10000,
        daily_water_goal_ml: 2500,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayIso = todayStart.toISOString();

      // 2. Fetch User Profile Goals
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (prof) {
        setUserGoals({
          dailySteps: prof.daily_step_goal || 10000,
          dailyWaterL: (prof.daily_water_goal_ml || 2500) / 1000,
          dailyCalories: 2400,
          weeklyWorkouts: 5
        });
      }

      // 3. Fetch Step Logs for today
      const { data: stepData } = await supabase.from('step_logs')
        .select('steps')
        .eq('user_id', user.id)
        .gte('created_at', todayIso);

      const totalTodaySteps = stepData?.reduce((acc, curr) => acc + (curr.steps || 0), 0) || 0;
      setSteps(totalTodaySteps);

      // 4. Fetch Water Logs for today
      const { data: waterData } = await supabase.from('water_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', todayIso)
        .order('created_at', { ascending: false });

      if (waterData && waterData.length > 0) {
        const totalMl = waterData.reduce((acc, curr) => acc + (curr.amount_ml || 0), 0);
        setWaterL(parseFloat((totalMl / 1000).toFixed(2)));
        setWaterLogs(waterData.map(w => ({
          id: w.id,
          amountMl: w.amount_ml,
          time: new Date(w.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })));
      } else {
        setWaterL(0);
        setWaterLogs([]);
      }

      // 5. Fetch Meal Logs for today
      const { data: mealData } = await supabase.from('meal_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', todayIso)
        .order('created_at', { ascending: false });

      if (mealData && mealData.length > 0) {
        setMeals(mealData.map(m => ({
          id: m.id,
          name: m.name,
          calories: m.calories_kcal,
          carbs: m.carbs_g || 0,
          protein: m.protein_g || 0,
          fats: m.fats_g || 0,
          mealType: m.meal_type || 'Snack',
          time: new Date(m.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })));
      } else {
        setMeals([]);
      }

      // 6. Fetch Medication Reminders / Tablets
      const { data: medData } = await supabase.from('medication_reminders')
        .select('*')
        .eq('user_id', user.id);

      if (medData && medData.length > 0) {
        setTablets(medData.map(med => ({
          id: med.id,
          name: med.name,
          dosage: med.dosage,
          time: med.scheduled_time,
          category: 'Daily Care',
          isTaken: med.is_taken || false
        })));
      } else {
        setTablets([]);
      }

      // 7. Fetch Pomodoro Sessions completed today
      const { data: pomoData } = await supabase.from('pomodoro_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', todayIso);

      setPomoSessions(pomoData?.length || 0);

      const now = new Date();
      setLastSyncTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.warn('Error loading cloud user data:', err);
    }
  }, []);

  // Cloud Upload Engine (Every 1 Hour & On-Demand)
  const syncToCloud = useCallback(async (isManual: boolean = false) => {
    if (!currentUser) return;
    setIsSyncing(true);
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    try {
      await supabase.from('profiles').update({
        daily_step_goal: userGoals.dailySteps,
        daily_water_goal_ml: Math.round(userGoals.dailyWaterL * 1000),
        updated_at: now.toISOString()
      }).eq('id', currentUser.id);

      await supabase.from('monitoring_events').insert([{
        event_type: 'hourly_health_telemetry_sync',
        severity: 'info',
        title: 'Automated 1-Hour Cloud Telemetry Sync',
        description: `Hourly upload: ${steps} steps, ${waterL}L water, ${meals.length} meals recorded for user ${currentUser.id}.`,
        metrics_snapshot: {
          user_id: currentUser.id,
          steps,
          waterL,
          mealsCount: meals.length,
          tabletsCount: tablets.length,
          syncedAt: now.toISOString()
        }
      }]).then(() => {});

      setLastSyncTime(timeFormatted);
      if (isManual) {
        showToast(`☁️ Cloud telemetry synced at ${timeFormatted}`);
      }
    } catch (err) {
      console.warn('Cloud sync note:', err);
      setLastSyncTime(timeFormatted);
    } finally {
      setIsSyncing(false);
    }
  }, [steps, waterL, meals, tablets, userGoals, currentUser]);

  // Periodic 1-Hour Automated Background Cloud Upload
  useEffect(() => {
    const oneHourSyncInterval = setInterval(() => {
      syncToCloud(false);
    }, 60 * 60 * 1000);

    return () => clearInterval(oneHourSyncInterval);
  }, [syncToCloud]);

  // Check Supabase Auth on Mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
      setAuthChecking(false);
      if (user) {
        loadUserData(user);
      }
    }).catch(() => {
      setAuthChecking(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setCurrentUser(user);
      if (user) {
        loadUserData(user);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, [loadUserData]);

  // User-scoped LocalStorage persistence
  useEffect(() => {
    if (!currentUser) return;
    try {
      const prefix = `pfit_${currentUser.id}`;
      localStorage.setItem(`${prefix}_steps`, steps.toString());
      localStorage.setItem(`${prefix}_water_l`, waterL.toString());
      localStorage.setItem(`${prefix}_user_goals`, JSON.stringify(userGoals));
      localStorage.setItem(`${prefix}_meals`, JSON.stringify(meals));
      localStorage.setItem(`${prefix}_tablets`, JSON.stringify(tablets));
    } catch (e) {}
  }, [steps, waterL, userGoals, meals, tablets, currentUser]);

  // Google Health Connect & Apple HealthKit Auto-Sync Engine
  useEffect(() => {
    if (healthConnect.isConnected()) {
      healthConnect.startHourlySync((data) => {
        handleAddSteps(data.steps, false);
      });
    }
  }, []);

  // Pomodoro Interval Timer Engine
  useEffect(() => {
    let interval: any = null;
    if (pomoRunning) {
      interval = setInterval(() => {
        setPomoSeconds(prev => {
          if (prev <= 1) {
            setPomoRunning(false);
            if (pomoMode === 'focus') {
              setPomoSessions(s => s + 1);
              showToast('🎉 Focus Sprint complete! Take a refreshing break.');
              if (currentUser) {
                supabase.from('pomodoro_sessions').insert([{
                  user_id: currentUser.id,
                  duration_minutes: 25,
                  mode: 'focus'
                }]).then(() => {});
              }
            } else {
              showToast('✨ Break is over. Ready to focus again?');
            }
            return pomoTotal;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [pomoRunning, pomoMode, pomoTotal, currentUser]);


  // Handler: Log Water
  const handleAddWater = async (ml: number) => {
    const amountInL = ml / 1000;
    const newWater = parseFloat((waterL + amountInL).toFixed(2));
    setWaterL(newWater);

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setWaterLogs(prev => [{ id: Date.now().toString(), amountMl: ml, time: timeStr }, ...prev]);

    showToast(`+${ml}ml water logged! Total: ${newWater}L`);

    if (currentUser) {
      await supabase.from('water_logs').insert([{
        user_id: currentUser.id,
        amount_ml: ml
      }]);
    }
  };

  const handleDeleteWaterLog = (id: string) => {
    const target = waterLogs.find(l => l.id === id);
    if (target) {
      setWaterL(prev => Math.max(0, parseFloat((prev - target.amountMl / 1000).toFixed(2))));
      setWaterLogs(prev => prev.filter(l => l.id !== id));
      showToast('Water log removed');
    }
  };

  // Handler: Log Meal
  const handleAddMeal = async (mealData: Omit<MealItem, 'id' | 'time'>) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMeal: MealItem = {
      ...mealData,
      id: Date.now().toString(),
      time: timeStr
    };

    setMeals(prev => [newMeal, ...prev]);
    showToast(`+${newMeal.calories} kcal logged for ${newMeal.name}`);

    if (currentUser) {
      await supabase.from('meal_logs').insert([{
        user_id: currentUser.id,
        name: newMeal.name,
        meal_type: newMeal.mealType,
        calories_kcal: newMeal.calories,
        carbs_g: newMeal.carbs,
        protein_g: newMeal.protein,
        fats_g: newMeal.fats
      }]);
    }
  };

  const handleDeleteMeal = (id: string) => {
    setMeals(prev => prev.filter(m => m.id !== id));
    showToast('Meal record deleted');
  };

  // Handler: Complete Workout
  const handleCompleteWorkout = async (durationMins: number, caloriesBurned: number) => {
    showToast(`🏆 Workout complete! ${caloriesBurned} kcal burned.`);
    if (currentUser) {
      await supabase.from('monitoring_events').insert([{
        event_type: 'workout_completed',
        severity: 'info',
        title: 'Workout Completed',
        description: `Workout finished: ${durationMins} mins, ${caloriesBurned} kcal burned.`,
        metrics_snapshot: { user_id: currentUser.id, durationMins, caloriesBurned }
      }]).then(() => {});
    }
  };

  // Handler: Add Custom Goal
  const handleAddCustomGoal = (goal: Omit<GoalItem, 'id' | 'currentValue'>) => {
    const newGoal: GoalItem = {
      ...goal,
      id: Date.now().toString(),
      currentValue: 0,
    };
    setCustomGoals(prev => [...prev, newGoal]);
    showToast(`New goal created: ${newGoal.title}`);
  };

  const handleToggleGoal = (id: string) => {
    setCustomGoals(prev => prev.map(g => {
      if (g.id === id) {
        const isDone = g.currentValue >= g.targetValue;
        const nextVal = isDone ? 0 : g.targetValue;
        if (!isDone) showToast(`🎯 Goal achieved: ${g.title}! Great job.`);
        return { ...g, currentValue: nextVal };
      }
      return g;
    }));
  };

  const handleDeleteCustomGoal = (id: string) => {
    setCustomGoals(prev => prev.filter(g => g.id !== id));
    showToast('Goal removed');
  };

  // Handler: Update User Core Target Goals
  const handleUpdateTargets = async (targets: UserGoals) => {
    setUserGoals(targets);
    showToast('Target goals updated successfully!');

    if (currentUser) {
      await supabase.from('profiles').update({
        daily_step_goal: targets.dailySteps,
        daily_water_goal_ml: Math.round(targets.dailyWaterL * 1000),
        updated_at: new Date().toISOString()
      }).eq('id', currentUser.id);
    }
  };

  // Handler: Tablets / Medication Management
  const handleToggleTabletTaken = async (id: string) => {
    const target = tablets.find(t => t.id === id);
    const nextState = !target?.isTaken;
    setTablets(prev => prev.map(t => t.id === id ? { ...t, isTaken: nextState } : t));
    
    if (target) {
      showToast(nextState ? `✅ Taken: ${target.name}` : `⏰ Marked as pending: ${target.name}`);
    }

    if (currentUser) {
      await supabase.from('medication_reminders').update({
        is_taken: nextState
      }).eq('id', id).eq('user_id', currentUser.id);
    }
  };

  const handleDeleteTablet = async (id: string) => {
    setTablets(prev => prev.filter(t => t.id !== id));
    showToast('Medication reminder removed');

    if (currentUser) {
      await supabase.from('medication_reminders').delete().eq('id', id).eq('user_id', currentUser.id);
    }
  };

  const handleAddTablet = async (tabletData: Omit<TabletItem, 'id' | 'isTaken'>) => {
    const newTablet: TabletItem = {
      ...tabletData,
      id: Date.now().toString(),
      isTaken: false
    };

    setTablets(prev => [...prev, newTablet]);
    showToast(`💊 Added medication reminder: ${newTablet.name}`);

    if (currentUser) {
      await supabase.from('medication_reminders').insert([{
        id: newTablet.id,
        user_id: currentUser.id,
        name: newTablet.name,
        dosage: newTablet.dosage,
        scheduled_time: newTablet.time,
        is_taken: false
      }]);
    }
  };

  // Handler: Pomodoro Task Management
  const handleTogglePomoTask = (id: string) => {
    setPomoTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleAddPomoTask = (title: string) => {
    const newTask: PomodoroTask = {
      id: Date.now().toString(),
      title,
      completed: false,
      estimatedSessions: 2,
      completedSessions: 0
    };
    setPomoTasks(prev => [...prev, newTask]);
    showToast('Focus task added');
  };

  const handleDeletePomoTask = (id: string) => {
    setPomoTasks(prev => prev.filter(t => t.id !== id));
    showToast('Task removed');
  };

  // Notification Management
  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    showToast('Notifications cleared');
  };

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  // Supabase Authentication Handlers
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      if (authMode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail.trim(),
          password: authPassword,
          options: {
            data: {
              full_name: authFullName.trim() || 'P-fit User',
            }
          }
        });
        if (error) throw error;
        if (data.user) {
          setCurrentUser(data.user);
          await loadUserData(data.user);
          setActiveTab('home');
          showToast('Account created! Welcome to P-fit 🎉');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail.trim(),
          password: authPassword,
        });
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            const { data: upData, error: upErr } = await supabase.auth.signUp({
              email: authEmail.trim(),
              password: authPassword,
              options: { data: { full_name: authFullName.trim() || 'P-fit User' } }
            });
            if (upErr) throw upErr;
            if (upData.user) {
              setCurrentUser(upData.user);
              await loadUserData(upData.user);
              setActiveTab('home');
              showToast('Registered & signed in! Welcome 🎉');
              return;
            }
          }
          throw error;
        }
        if (data.user) {
          setCurrentUser(data.user);
          await loadUserData(data.user);
          setActiveTab('home');
          showToast('Logged in successfully!');
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication error occurred');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        if (error.message.includes('Unsupported provider') || error.message.includes('not enabled')) {
          setAuthError(`To enable ${provider === 'google' ? 'Google' : 'GitHub'} login, toggle it ON in your authentication settings. In the meantime, use Email & Password sign in!`);
        } else {
          setAuthError(error.message);
        }
      }
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setIsGuest(false); // Return to sign-in on signout
    // Clean 0 dataset
    setSteps(0);
    setWaterL(0);
    setWaterLogs([]);
    setMeals([]);
    setTablets([]);
    setWorkouts([]);
    setPomoSessions(0);
    showToast('Signed out successfully');
  };

  const totalCaloriesToday = meals.reduce((acc, m) => acc + (m.calories || 0), 0);

  const displayName = currentUser?.user_metadata?.full_name 
    || currentUser?.email?.split('@')[0] 
    || (isGuest ? 'Guest Explorer' : 'Member');

  const avatarUrl = currentUser?.user_metadata?.avatar_url || '';

  // 1. Initial Session Checking Spinner
  if (!isMounted || authChecking) {
    return (
      <div className="min-h-screen bg-[#F8FAF9] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#34D399] border-t-transparent animate-spin"></div>
        <div className="text-center">
          <p className="text-sm font-black text-slate-800 tracking-wider">P-FIT WELLNESS</p>
          <p className="text-xs text-slate-400 font-medium">Connecting to Supabase Cloud...</p>
        </div>
      </div>
    );
  }

  // 2. Auth Screen (Shown by default on start when not logged in)
  if (!currentUser && !isGuest) {
    return (
      <AuthScreen
        authMode={authMode}
        setAuthMode={setAuthMode}
        authEmail={authEmail}
        setAuthEmail={setAuthEmail}
        authPassword={authPassword}
        setAuthPassword={setAuthPassword}
        authFullName={authFullName}
        setAuthFullName={setAuthFullName}
        authLoading={authLoading}
        authError={authError}
        onEmailAuth={handleEmailAuth}
        onOAuthSignIn={handleOAuthSignIn}
        onContinueAsGuest={() => {
          setIsGuest(true);
          setActiveTab('home');
          showToast('Exploring P-fit in Guest Mode');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-slate-800 flex flex-col max-w-md mx-auto relative font-sans shadow-2xl overflow-hidden selection:bg-[#D7F4DF]">
      {/* Dynamic Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-slate-900/90 backdrop-blur-md text-white text-xs font-semibold shadow-xl flex items-center gap-2 animate-fade-in border border-slate-700/50">
          <Sparkles className="w-4 h-4 text-[#34D399]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Top App Header */}
      <Header
        displayName={displayName}
        avatarUrl={avatarUrl}
        unreadNotificationsCount={unreadNotificationsCount}
        currentUser={currentUser}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
        onSignOut={handleSignOut}
        onOpenSignIn={() => setIsGuest(false)}
      />

      {/* Screen Views Container */}
      <main className="flex-1 px-5 py-2 space-y-5 pb-36 overflow-y-auto">
        {activeTab === 'home' && (
          <HomeScreen
            steps={steps}
            calories={totalCaloriesToday}
            waterL={waterL}
            goals={userGoals}
            workouts={workouts}
            recentMeal={meals[0]}
            tablets={tablets}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onStartWorkout={() => setIsWorkoutModalOpen(true)}
            onAddMeal={() => setIsAddMealOpen(true)}
            onAddWater={() => setIsAddWaterOpen(true)}
            onToggleTabletTaken={handleToggleTabletTaken}
          />
        )}

        {activeTab === 'water' && (
          <WaterScreen
            waterL={waterL}
            goalL={userGoals.dailyWaterL}
            logs={waterLogs}
            onAddWater={handleAddWater}
            onDeleteLog={handleDeleteWaterLog}
            onOpenCustomModal={() => setIsAddWaterOpen(true)}
          />
        )}

        {activeTab === 'calories' && (
          <CalorieScreen
            totalCalories={totalCaloriesToday}
            calorieGoal={userGoals.dailyCalories}
            meals={meals}
            onOpenAddMealModal={() => setIsAddMealOpen(true)}
            onDeleteMeal={handleDeleteMeal}
            onOpenCalculatorModal={() => setIsCalorieCalcOpen(true)}
          />
        )}

        {activeTab === 'steps' && (
          <StepsScreen
            steps={steps}
            stepGoal={userGoals.dailySteps}
            onAddSteps={handleAddSteps}
          />
        )}

        {activeTab === 'tablets' && (
          <TabletsScreen
            tablets={tablets}
            onToggleTabletTaken={handleToggleTabletTaken}
            onDeleteTablet={handleDeleteTablet}
            onOpenAddTabletModal={() => setIsAddTabletOpen(true)}
          />
        )}

        {activeTab === 'pomodoro' && (
          <PomodoroScreen
            pomoMode={pomoMode}
            pomoSeconds={pomoSeconds}
            pomoRunning={pomoRunning}
            pomoSessions={pomoSessions}
            tasks={pomoTasks}
            onToggleTimer={() => setPomoRunning(!pomoRunning)}
            onResetTimer={() => {
              setPomoRunning(false);
              setPomoSeconds(pomoTotal);
            }}
            onSwitchMode={(mode, mins) => {
              setPomoRunning(false);
              setPomoMode(mode);
              setPomoTotal(mins * 60);
              setPomoSeconds(mins * 60);
            }}
            onOpenTasksModal={() => setIsPomodoroTasksOpen(true)}
          />
        )}

        {activeTab === 'activity' && (
          <ActivityScreen
            steps={steps}
            calories={totalCaloriesToday}
            waterL={waterL}
            goals={userGoals}
            workouts={workouts}
            meals={meals}
          />
        )}

        {activeTab === 'progress' && (
          <GoalsScreen
            goalsList={customGoals}
            userGoals={userGoals}
            steps={steps}
            waterL={waterL}
            calories={totalCaloriesToday}
            onOpenAddGoalModal={() => setIsAddGoalOpen(true)}
            onOpenEditTargetsModal={() => setIsEditTargetsOpen(true)}
            onDeleteGoal={handleDeleteCustomGoal}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileScreen
            currentUser={currentUser}
            displayName={displayName}
            avatarUrl={avatarUrl}
            goals={userGoals}
            lastSyncTime={lastSyncTime}
            isSyncing={isSyncing}
            onManualSync={() => syncToCloud(true)}
            onResetDataToZero={() => loadUserData(currentUser)}
            onOpenEditTargetsModal={() => setIsEditTargetsOpen(true)}
            onSignOut={handleSignOut}
            onOpenSignIn={() => setIsGuest(false)}
          />
        )}
      </main>

      {/* Persistent Bottom Floating Bento Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenQuickAction={() => setIsQuickActionOpen(true)}
      />

      {/* Modals & Dialogs */}
      <QuickActionModal
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        onSelectAction={(action) => {
          if (action === 'water') setIsAddWaterOpen(true);
          if (action === 'meal') setIsAddMealOpen(true);
          if (action === 'workout') setIsWorkoutModalOpen(true);
          if (action === 'tablets') setIsAddTabletOpen(true);
          if (action === 'pomodoro') setActiveTab('pomodoro');
        }}
      />

      <AddWaterModal
        isOpen={isAddWaterOpen}
        onClose={() => setIsAddWaterOpen(false)}
        onAddWater={handleAddWater}
      />

      <AddMealModal
        isOpen={isAddMealOpen}
        onClose={() => setIsAddMealOpen(false)}
        onAddMeal={handleAddMeal}
      />

      <AddTabletModal
        isOpen={isAddTabletOpen}
        onClose={() => setIsAddTabletOpen(false)}
        onAddTablet={handleAddTablet}
      />

      <CalorieCalculatorModal
        isOpen={isCalorieCalcOpen}
        onClose={() => setIsCalorieCalcOpen(false)}
        onLogMeal={handleAddMeal}
      />

      <WorkoutModal
        isOpen={isWorkoutModalOpen}
        onClose={() => setIsWorkoutModalOpen(false)}
        onCompleteWorkout={handleCompleteWorkout}
      />

      <PomodoroTasksModal
        isOpen={isPomodoroTasksOpen}
        onClose={() => setIsPomodoroTasksOpen(false)}
        tasks={pomoTasks}
        onToggleTask={handleTogglePomoTask}
        onAddTask={handleAddPomoTask}
        onDeleteTask={handleDeletePomoTask}
      />

      <AddGoalModal
        isOpen={isAddGoalOpen}
        onClose={() => setIsAddGoalOpen(false)}
        onAddGoal={handleAddCustomGoal}
      />

      <EditGoalsModal
        isOpen={isEditTargetsOpen}
        onClose={() => setIsEditTargetsOpen(false)}
        goals={userGoals}
        onSave={handleUpdateTargets}
      />

      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        notifications={notifications}
        onMarkAllRead={() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))}
        onClearAll={handleClearAllNotifications}
      />
    </div>
  );
}
