import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { Pedometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, TASK_NAMES } from '../constants/storageKeys';

/**
 * Returns ISO date string (YYYY-MM-DD) for midnight calendar comparisons.
 */
const getTodayDateString = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

/**
 * Returns Date object for 00:00:00.000 of the current day.
 */
const getStartOfToday = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return start;
};

/**
 * Define the Background Task at the top-level (Global Scope)
 * 
 * IMPORTANT: This MUST be defined outside of any React component lifecycle,
 * before App mounts, so the native Android JobScheduler/WorkManager can find and execute it.
 */
TaskManager.defineTask(TASK_NAMES.BACKGROUND_STEP_SYNC, async () => {
  try {
    const now = new Date();
    const todayStr = getTodayDateString();

    // 1. Verify hardware sensor is available
    const isAvailable = await Pedometer.isAvailableAsync();
    if (!isAvailable) {
      console.log('[BackgroundStepTask] Hardware pedometer sensor not available.');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // 2. Read existing state from AsyncStorage
    const [savedDate, savedStepsStr, savedTimestampStr] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.SAVED_DATE),
      AsyncStorage.getItem(STORAGE_KEYS.PERSISTED_STEPS),
      AsyncStorage.getItem(STORAGE_KEYS.LAST_TIMESTAMP),
    ]);

    const storedSteps = savedStepsStr ? parseInt(savedStepsStr, 10) : 0;
    const lastTimestamp = savedTimestampStr ? parseInt(savedTimestampStr, 10) : now.getTime();

    let newPersistedTotal = storedSteps;
    let hasNewSteps = false;

    // 3. Handle Day Rollover vs Same-day Gap Reconciliation
    if (savedDate !== todayStr) {
      // Midnight crossed while app was closed in background
      const startOfToday = getStartOfToday();
      try {
        const stepResult = await Pedometer.getStepCountAsync(startOfToday, now);
        newPersistedTotal = stepResult && typeof stepResult.steps === 'number' ? stepResult.steps : 0;
        hasNewSteps = true;
      } catch (err) {
        console.warn('[BackgroundStepTask] getStepCountAsync for new day failed:', err);
        newPersistedTotal = 0;
      }

      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.SAVED_DATE, todayStr),
        AsyncStorage.setItem(STORAGE_KEYS.PERSISTED_STEPS, newPersistedTotal.toString()),
        AsyncStorage.setItem(STORAGE_KEYS.LAST_TIMESTAMP, now.getTime().toString()),
      ]);
    } else {
      // Same day: Recover gap steps since last recorded timestamp
      const gapStart = new Date(Math.max(getStartOfToday().getTime(), lastTimestamp));

      if (now.getTime() - gapStart.getTime() > 5000) {
        try {
          const stepResult = await Pedometer.getStepCountAsync(gapStart, now);
          const gapSteps = stepResult && typeof stepResult.steps === 'number' ? stepResult.steps : 0;

          if (gapSteps > 0) {
            newPersistedTotal = storedSteps + gapSteps;
            hasNewSteps = true;
          }
        } catch (err) {
          console.warn('[BackgroundStepTask] Gap query failed:', err);
        }
      }

      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.PERSISTED_STEPS, newPersistedTotal.toString()),
        AsyncStorage.setItem(STORAGE_KEYS.LAST_TIMESTAMP, now.getTime().toString()),
      ]);
    }

    console.log(`[BackgroundStepTask] Completed background sync. Steps: ${newPersistedTotal}`);
    return hasNewSteps
      ? BackgroundFetch.BackgroundFetchResult.NewData
      : BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    console.error('[BackgroundStepTask] Execution error:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

/**
 * Register periodic BackgroundFetch task
 */
export async function registerStepBackgroundTask() {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAMES.BACKGROUND_STEP_SYNC);
    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(TASK_NAMES.BACKGROUND_STEP_SYNC, {
        minimumInterval: 15 * 60, // 15 minutes (Android WorkManager minimum window)
        stopOnTerminate: false,    // Continue running even after user kills/swipes away the app
        startOnBoot: true,        // Automatically restart task after device reboot
      });
      console.log('[BackgroundStepTask] Successfully registered background sync task.');
    } else {
      console.log('[BackgroundStepTask] Task already registered.');
    }
  } catch (err) {
    console.warn('[BackgroundStepTask] Registration failed (EAS dev build required):', err);
  }
}

/**
 * Unregister BackgroundFetch task (useful for debugging or logout)
 */
export async function unregisterStepBackgroundTask() {
  try {
    await BackgroundFetch.unregisterTaskAsync(TASK_NAMES.BACKGROUND_STEP_SYNC);
    console.log('[BackgroundStepTask] Unregistered background sync task.');
  } catch (err) {
    console.warn('[BackgroundStepTask] Unregistration failed:', err);
  }
}
