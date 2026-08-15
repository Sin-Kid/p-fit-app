import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { Platform } from 'react-native';
import { Pedometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, TASK_NAMES } from '../constants/storageKeys';

const getTodayDateString = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const getStartOfToday = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return start;
};

// Global task definition
TaskManager.defineTask(TASK_NAMES.BACKGROUND_STEP_SYNC, async () => {
  try {
    const now = new Date();
    const todayStr = getTodayDateString();

    const [savedDate, savedStepsStr] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.SAVED_DATE),
      AsyncStorage.getItem(STORAGE_KEYS.PERSISTED_STEPS),
    ]);

    let storedSteps = savedStepsStr ? parseInt(savedStepsStr, 10) : 0;
    if (isNaN(storedSteps)) storedSteps = 0;
    let hasNewSteps = false;

    // Day rollover
    if (savedDate !== todayStr) {
      let newDaySteps = 0;
      if (Platform.OS === 'ios') {
        try {
          const startOfToday = getStartOfToday();
          const stepResult = await Pedometer.getStepCountAsync(startOfToday, now);
          if (stepResult && typeof stepResult.steps === 'number') {
            newDaySteps = stepResult.steps;
            hasNewSteps = true;
          }
        } catch (err) {
          newDaySteps = 0;
        }
      }

      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.SAVED_DATE, todayStr),
        AsyncStorage.setItem(STORAGE_KEYS.PERSISTED_STEPS, newDaySteps.toString()),
        AsyncStorage.setItem(STORAGE_KEYS.LAST_TIMESTAMP, now.getTime().toString()),
      ]);
    } else {
      // Same day update (on iOS recover gap, on Android keep cumulative sync)
      if (Platform.OS === 'ios') {
        const lastTsStr = await AsyncStorage.getItem(STORAGE_KEYS.LAST_TIMESTAMP);
        const lastTs = lastTsStr ? parseInt(lastTsStr, 10) : now.getTime();
        const gapStart = new Date(Math.max(getStartOfToday().getTime(), lastTs));

        if (now.getTime() - gapStart.getTime() > 5000) {
          try {
            const stepResult = await Pedometer.getStepCountAsync(gapStart, now);
            const gapSteps = stepResult && typeof stepResult.steps === 'number' ? stepResult.steps : 0;
            if (gapSteps > 0) {
              storedSteps += gapSteps;
              hasNewSteps = true;
            }
          } catch (err) {
            // Keep storedSteps
          }
        }
      }

      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.PERSISTED_STEPS, storedSteps.toString()),
        AsyncStorage.setItem(STORAGE_KEYS.LAST_TIMESTAMP, now.getTime().toString()),
      ]);
    }

    return hasNewSteps
      ? BackgroundFetch.BackgroundFetchResult.NewData
      : BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    console.error('[BackgroundStepTask] Execution error:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerStepBackgroundTask() {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAMES.BACKGROUND_STEP_SYNC);
    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(TASK_NAMES.BACKGROUND_STEP_SYNC, {
        minimumInterval: 15 * 60,
        stopOnTerminate: false,
        startOnBoot: true,
      });
      console.log('[BackgroundStepTask] Successfully registered background sync task.');
    }
  } catch (err) {
    console.log('[BackgroundStepTask] Registration skipped in Expo Go (available in APK build)');
  }
}

export async function unregisterStepBackgroundTask() {
  try {
    await BackgroundFetch.unregisterTaskAsync(TASK_NAMES.BACKGROUND_STEP_SYNC);
  } catch (err) {
    console.warn('[BackgroundStepTask] Unregistration failed:', err);
  }
}
