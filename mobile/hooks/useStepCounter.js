import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform, PermissionsAndroid, AppState } from 'react-native';
import { Pedometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storageKeys';

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
 * Custom Hook: useStepCounter
 * 
 * Provides robust, hardware-backed step counting with zero double-counting
 * and complete resilience across app restarts, background execution, and day rollovers.
 * 
 * ARCHITECTURAL FLOW & RECONCILIATION EXPLANATION:
 * ------------------------------------------------
 * 1. Hardware Anchor (persistedTotal):
 *    Android hardware pedometer sensor (TYPE_STEP_COUNTER) runs at the hardware/OS level.
 *    Pedometer.getStepCountAsync(start, end) queries the hardware buffer for verified step
 *    intervals. This is our single source of truth.
 * 
 * 2. Live Foreground Delta (liveDelta):
 *    Pedometer.watchStepCount(callback) emits an incremental session counter starting from 0
 *    for the duration of the foreground session. We display (persistedTotal + liveDelta)
 *    to give immediate 60fps responsiveness to the user.
 * 
 * 3. Background Transition (AppState -> background):
 *    When leaving the foreground, we unsubscribe from watchStepCount, fold liveDelta into
 *    persistedTotal, write to AsyncStorage, and update lastTimestamp = Date.now().
 * 
 * 4. Foreground Resume (AppState -> active):
 *    When the user returns, we read AsyncStorage (in case our BackgroundFetch task updated
 *    steps while the app was killed), query getStepCountAsync(lastTimestamp, now) to recover
 *    any steps taken in the gap, save the new total, and restart a clean watchStepCount session.
 * 
 * 5. Midnight Rollover (Day boundary):
 *    If savedDate !== todayDate, persistedTotal resets to steps logged since 00:00 today.
 */
export function useStepCounter() {
  const [isAvailable, setIsAvailable] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(null);
  const [persistedTotal, setPersistedTotal] = useState(0);
  const [liveDelta, setLiveDelta] = useState(0);
  const [error, setError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);

  // Mutable refs to prevent stale closures in event listeners & AppState transitions
  const subscriptionRef = useRef(null);
  const liveDeltaRef = useRef(0);
  const persistedTotalRef = useRef(0);
  const lastTimestampRef = useRef(Date.now());
  const appStateRef = useRef(AppState.currentState);

  // Keep refs synchronized with React state
  useEffect(() => {
    liveDeltaRef.current = liveDelta;
  }, [liveDelta]);

  useEffect(() => {
    persistedTotalRef.current = persistedTotal;
  }, [persistedTotal]);

  /**
   * Request Runtime Permissions:
   * Android 10+ (API 29+) requires runtime ACTIVITY_RECOGNITION permission.
   */
  const requestAndroidPermission = useCallback(async () => {
    try {
      if (Platform.OS === 'android') {
        // Check Android SDK version
        if (Platform.Version >= 29) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
            {
              title: 'Activity Recognition Permission',
              message: 'This app needs physical activity permission to count your daily steps accurately in background and foreground.',
              buttonPositive: 'Allow',
              buttonNegative: 'Deny',
            }
          );
          const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
          setPermissionGranted(isGranted);
          return isGranted;
        } else {
          // Android < 29 granted at install time
          setPermissionGranted(true);
          return true;
        }
      } else {
        // iOS permissions via expo-sensors
        const { status } = await Pedometer.requestPermissionsAsync();
        const isGranted = status === 'granted';
        setPermissionGranted(isGranted);
        return isGranted;
      }
    } catch (err) {
      console.warn('[useStepCounter] Permission request error:', err);
      setError('Failed to request activity permission: ' + err.message);
      setPermissionGranted(false);
      return false;
    }
  }, []);

  /**
   * Starts a fresh Pedometer.watchStepCount session
   */
  const startLiveWatcher = useCallback(() => {
    // Unsubscribe previous session if any
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }

    setLiveDelta(0);
    liveDeltaRef.current = 0;

    try {
      subscriptionRef.current = Pedometer.watchStepCount((result) => {
        if (result && typeof result.steps === 'number') {
          setLiveDelta(result.steps);
          liveDeltaRef.current = result.steps;
        }
      });
      setIsTracking(true);
    } catch (err) {
      console.warn('[useStepCounter] watchStepCount failed:', err);
      setIsTracking(false);
    }
  }, []);

  /**
   * Stops the live watcher
   */
  const stopLiveWatcher = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
    setIsTracking(false);
  }, []);

  /**
   * Authoritative Step Reconciliation Engine
   * Queries hardware sensor buffer and synchronizes AsyncStorage
   */
  const reconcileSteps = useCallback(async (forcedFullDay = false) => {
    try {
      const now = new Date();
      const todayStr = getTodayDateString();

      // Read current state from storage
      const [savedDate, savedStepsStr, savedTimestampStr] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.SAVED_DATE),
        AsyncStorage.getItem(STORAGE_KEYS.PERSISTED_STEPS),
        AsyncStorage.getItem(STORAGE_KEYS.LAST_TIMESTAMP),
      ]);

      const storedSteps = savedStepsStr ? parseInt(savedStepsStr, 10) : 0;
      const lastTimestamp = savedTimestampStr ? parseInt(savedTimestampStr, 10) : now.getTime();

      let newPersistedTotal = storedSteps;

      // Check for midnight / day rollover
      if (savedDate !== todayStr || forcedFullDay) {
        // New calendar day: Query complete range from 00:00 today to right now
        const startOfToday = getStartOfToday();
        try {
          const stepResult = await Pedometer.getStepCountAsync(startOfToday, now);
          newPersistedTotal = stepResult && typeof stepResult.steps === 'number' ? stepResult.steps : 0;
        } catch (queryErr) {
          console.warn('[useStepCounter] getStepCountAsync for today failed:', queryErr);
          newPersistedTotal = 0;
        }

        // Save new day baseline
        await Promise.all([
          AsyncStorage.setItem(STORAGE_KEYS.SAVED_DATE, todayStr),
          AsyncStorage.setItem(STORAGE_KEYS.PERSISTED_STEPS, newPersistedTotal.toString()),
          AsyncStorage.setItem(STORAGE_KEYS.LAST_TIMESTAMP, now.getTime().toString()),
        ]);
      } else {
        // Same calendar day: Reconcile gap since last active timestamp
        const gapStart = new Date(Math.max(getStartOfToday().getTime(), lastTimestamp));
        
        // Only query if gap is at least 1 second
        if (now.getTime() - gapStart.getTime() > 1000) {
          try {
            const stepResult = await Pedometer.getStepCountAsync(gapStart, now);
            const gapSteps = stepResult && typeof stepResult.steps === 'number' ? stepResult.steps : 0;
            
            // Increment persisted total with newly recovered gap steps
            newPersistedTotal = storedSteps + gapSteps;
          } catch (queryErr) {
            console.warn('[useStepCounter] getStepCountAsync gap query failed:', queryErr);
            // Fallback: keep existing storedSteps
          }
        }

        await Promise.all([
          AsyncStorage.setItem(STORAGE_KEYS.PERSISTED_STEPS, newPersistedTotal.toString()),
          AsyncStorage.setItem(STORAGE_KEYS.LAST_TIMESTAMP, now.getTime().toString()),
        ]);
      }

      // Update state and refs
      setPersistedTotal(newPersistedTotal);
      persistedTotalRef.current = newPersistedTotal;
      lastTimestampRef.current = now.getTime();

      // Reset live delta and restart clean watch session
      startLiveWatcher();
      return newPersistedTotal;
    } catch (err) {
      console.warn('[useStepCounter] Reconcile error:', err);
      setError('Reconciliation error: ' + err.message);
      return persistedTotalRef.current;
    }
  }, [startLiveWatcher]);

  /**
   * Initial Setup & Availability Check
   */
  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        // 1. Check hardware availability
        const available = await Pedometer.isAvailableAsync();
        if (!isMounted) return;
        setIsAvailable(available);

        if (!available) {
          setError('Hardware step counter sensor is not available on this device.');
          return;
        }

        // 2. Request permission
        const granted = await requestAndroidPermission();
        if (!isMounted || !granted) return;

        // 3. Initial reconciliation
        await reconcileSteps();
      } catch (err) {
        if (!isMounted) return;
        console.warn('[useStepCounter] Init failed:', err);
        setError(err.message);
      }
    }

    init();

    return () => {
      isMounted = false;
      stopLiveWatcher();
    };
  }, [requestAndroidPermission, reconcileSteps, stopLiveWatcher]);

  /**
   * AppState Listener: Handles Background / Foreground Transitions
   */
  useEffect(() => {
    const handleAppStateChange = async (nextAppState) => {
      const prevAppState = appStateRef.current;
      appStateRef.current = nextAppState;

      if (prevAppState.match(/active/) && nextAppState.match(/inactive|background/)) {
        // --- TRANSITION TO BACKGROUND ---
        // 1. Stop live subscription
        stopLiveWatcher();

        // 2. Fold liveDelta into persistedTotal and save to AsyncStorage
        const currentLive = liveDeltaRef.current;
        const currentPersisted = persistedTotalRef.current;
        const updatedTotal = currentPersisted + currentLive;
        const nowTs = Date.now();

        persistedTotalRef.current = updatedTotal;
        setPersistedTotal(updatedTotal);
        setLiveDelta(0);
        liveDeltaRef.current = 0;
        lastTimestampRef.current = nowTs;

        try {
          await Promise.all([
            AsyncStorage.setItem(STORAGE_KEYS.PERSISTED_STEPS, updatedTotal.toString()),
            AsyncStorage.setItem(STORAGE_KEYS.LAST_TIMESTAMP, nowTs.toString()),
            AsyncStorage.setItem(STORAGE_KEYS.SAVED_DATE, getTodayDateString()),
          ]);
        } catch (storageErr) {
          console.warn('[useStepCounter] Failed to persist on background:', storageErr);
        }
      } else if (prevAppState.match(/inactive|background/) && nextAppState === 'active') {
        // --- TRANSITION TO FOREGROUND ---
        // Recover gap steps and resume live watching
        await reconcileSteps();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [reconcileSteps, stopLiveWatcher]);

  /**
   * Manual Refresh Function
   */
  const refresh = useCallback(async () => {
    setError(null);
    return await reconcileSteps();
  }, [reconcileSteps]);

  // Total steps displayed = Authoritative Hardware Total + Current Live Session Delta
  const totalSteps = persistedTotal + liveDelta;

  return {
    steps: totalSteps,
    persistedTotal,
    liveDelta,
    isAvailable,
    permissionGranted,
    error,
    isTracking,
    refresh,
    requestPermission: requestAndroidPermission,
  };
}
