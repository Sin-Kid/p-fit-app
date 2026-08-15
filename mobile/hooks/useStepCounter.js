import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform, PermissionsAndroid, AppState, Linking } from 'react-native';
import { Pedometer, Accelerometer } from 'expo-sensors';
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
 * Enhanced useStepCounter Hook
 * 
 * Features:
 * 1. Dual Permission Engine: Pedometer.requestPermissionsAsync() + PermissionsAndroid.request()
 * 2. Instant Responsive Live Tracking: Combines Pedometer.watchStepCount with an Accelerometer
 *    motion assist peak detector to eliminate Android's 10-15 step hardware batching lag.
 * 3. Authoritative Background Reconciliation: Reconciles exact steps on resume via Pedometer.getStepCountAsync().
 * 4. Background Battery Optimization Exemption helper.
 */
export function useStepCounter() {
  const [isAvailable, setIsAvailable] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(null);
  const [persistedTotal, setPersistedTotal] = useState(0);
  const [liveDelta, setLiveDelta] = useState(0);
  const [error, setError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);

  const pedometerSubRef = useRef(null);
  const accelSubRef = useRef(null);
  const liveDeltaRef = useRef(0);
  const persistedTotalRef = useRef(0);
  const lastTimestampRef = useRef(Date.now());
  const appStateRef = useRef(AppState.currentState);

  // Peak detector refs for immediate motion assistance
  const lastMagnitudeRef = useRef(1.0);
  const lastStepTimeRef = useRef(0);
  const motionStepsRef = useRef(0);

  useEffect(() => {
    liveDeltaRef.current = liveDelta;
  }, [liveDelta]);

  useEffect(() => {
    persistedTotalRef.current = persistedTotal;
  }, [persistedTotal]);

  /**
   * Request Runtime Permissions
   */
  const requestPermission = useCallback(async () => {
    try {
      let isGranted = false;

      // 1. Request via Expo Sensors API
      try {
        const expoPerm = await Pedometer.requestPermissionsAsync();
        if (expoPerm.status === 'granted') {
          isGranted = true;
        }
      } catch (e) {
        console.log('[useStepCounter] Expo permission request fallback:', e);
      }

      // 2. Explicit Android Native Runtime Request
      if (Platform.OS === 'android' && Platform.Version >= 29) {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
            {
              title: 'Activity Recognition Permission',
              message: 'P-Fit needs Physical Activity access to count your steps in the foreground and background.',
              buttonPositive: 'Allow',
              buttonNegative: 'Deny',
            }
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            isGranted = true;
          }
        } catch (e) {
          console.warn('[useStepCounter] Android native permission request:', e);
        }
      } else if (Platform.OS === 'android') {
        isGranted = true;
      }

      setPermissionGranted(isGranted);
      return isGranted;
    } catch (err) {
      console.warn('[useStepCounter] Permission request failed:', err);
      setError('Permission request failed: ' + err.message);
      setPermissionGranted(false);
      return false;
    }
  }, []);

  /**
   * Open Android Battery Optimization / Settings to allow background tracking
   */
  const requestBackgroundExemption = useCallback(async () => {
    try {
      if (Platform.OS === 'android') {
        await Linking.openSettings();
      }
    } catch (err) {
      console.warn('[useStepCounter] Open settings failed:', err);
    }
  }, []);

  /**
   * Starts Foreground Live Tracking (Hardware Pedometer + Responsive Motion Assist)
   */
  const startLiveWatcher = useCallback(() => {
    // Clean up existing subscriptions
    if (pedometerSubRef.current) {
      pedometerSubRef.current.remove();
      pedometerSubRef.current = null;
    }
    if (accelSubRef.current) {
      accelSubRef.current.remove();
      accelSubRef.current = null;
    }

    setLiveDelta(0);
    liveDeltaRef.current = 0;
    motionStepsRef.current = 0;

    // 1. Hardware Pedometer Watcher
    try {
      pedometerSubRef.current = Pedometer.watchStepCount((result) => {
        if (result && typeof result.steps === 'number') {
          // Hardware step counter emitted verified steps: use hardware as authoritative
          const steps = result.steps;
          liveDeltaRef.current = steps;
          setLiveDelta(steps);
        }
      });
      setIsTracking(true);
    } catch (err) {
      console.log('[useStepCounter] watchStepCount fallback to motion detector:', err);
    }

    // 2. Accelerometer Motion Assist: Provides instant 1-step responsiveness
    try {
      Accelerometer.setUpdateInterval(50); // 20Hz update rate
      accelSubRef.current = Accelerometer.addListener(({ x, y, z }) => {
        const magnitude = Math.sqrt(x * x + y * y + z * z);
        const delta = Math.abs(magnitude - lastMagnitudeRef.current);
        const now = Date.now();

        // Step peak detection threshold: delta > 0.45g and min 320ms between steps
        if (delta > 0.45 && now - lastStepTimeRef.current > 320) {
          lastStepTimeRef.current = now;
          motionStepsRef.current += 1;

          // If hardware pedometer hasn't emitted or is buffering, show instant motion steps
          if (motionStepsRef.current > liveDeltaRef.current) {
            liveDeltaRef.current = motionStepsRef.current;
            setLiveDelta(motionStepsRef.current);
          }
        }
        lastMagnitudeRef.current = magnitude;
      });
    } catch (e) {
      console.log('[useStepCounter] Accelerometer assist not available:', e);
    }
  }, []);

  /**
   * Stops Live Watchers
   */
  const stopLiveWatcher = useCallback(() => {
    if (pedometerSubRef.current) {
      pedometerSubRef.current.remove();
      pedometerSubRef.current = null;
    }
    if (accelSubRef.current) {
      accelSubRef.current.remove();
      accelSubRef.current = null;
    }
    setIsTracking(false);
  }, []);

  /**
   * Reconcile Steps with Storage Baseline
   */
  const reconcileSteps = useCallback(async (forcedFullDay = false) => {
    try {
      const now = new Date();
      const todayStr = getTodayDateString();

      const [savedDate, savedStepsStr] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.SAVED_DATE),
        AsyncStorage.getItem(STORAGE_KEYS.PERSISTED_STEPS),
      ]);

      let storedSteps = savedStepsStr ? parseInt(savedStepsStr, 10) : 0;
      if (isNaN(storedSteps)) storedSteps = 0;

      // 1. Midnight day rollover
      if (savedDate !== todayStr || forcedFullDay) {
        let newDaySteps = 0;

        // iOS supports historical range queries via CoreMotion
        if (Platform.OS === 'ios') {
          try {
            const startOfToday = getStartOfToday();
            const stepResult = await Pedometer.getStepCountAsync(startOfToday, now);
            if (stepResult && typeof stepResult.steps === 'number') {
              newDaySteps = stepResult.steps;
            }
          } catch (e) {
            newDaySteps = 0;
          }
        }

        await Promise.all([
          AsyncStorage.setItem(STORAGE_KEYS.SAVED_DATE, todayStr),
          AsyncStorage.setItem(STORAGE_KEYS.PERSISTED_STEPS, newDaySteps.toString()),
          AsyncStorage.setItem(STORAGE_KEYS.LAST_TIMESTAMP, now.getTime().toString()),
        ]);

        setPersistedTotal(newDaySteps);
        persistedTotalRef.current = newDaySteps;
      } else {
        // Same day: preserve existing steps and query iOS gap if on iOS
        let updatedTotal = storedSteps;

        if (Platform.OS === 'ios') {
          try {
            const lastTsStr = await AsyncStorage.getItem(STORAGE_KEYS.LAST_TIMESTAMP);
            const lastTs = lastTsStr ? parseInt(lastTsStr, 10) : now.getTime();
            const gapStart = new Date(Math.max(getStartOfToday().getTime(), lastTs));
            if (now.getTime() - gapStart.getTime() > 2000) {
              const stepResult = await Pedometer.getStepCountAsync(gapStart, now);
              if (stepResult && typeof stepResult.steps === 'number') {
                updatedTotal += stepResult.steps;
              }
            }
          } catch (e) {
            // Keep storedSteps
          }
        }

        await Promise.all([
          AsyncStorage.setItem(STORAGE_KEYS.PERSISTED_STEPS, updatedTotal.toString()),
          AsyncStorage.setItem(STORAGE_KEYS.LAST_TIMESTAMP, now.getTime().toString()),
        ]);

        setPersistedTotal(updatedTotal);
        persistedTotalRef.current = updatedTotal;
      }

      lastTimestampRef.current = now.getTime();
      startLiveWatcher();
      return persistedTotalRef.current;
    } catch (err) {
      console.warn('[useStepCounter] Reconcile error:', err);
      startLiveWatcher();
      return persistedTotalRef.current;
    }
  }, [startLiveWatcher]);

  /**
   * Initial Setup
   */
  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        const available = await Pedometer.isAvailableAsync();
        if (!isMounted) return;
        setIsAvailable(available !== false);

        // Request runtime permission
        const granted = await requestPermission();
        if (!isMounted || !granted) return;

        await reconcileSteps();
      } catch (err) {
        if (!isMounted) return;
        setError(err.message);
      }
    }

    init();

    return () => {
      isMounted = false;
      stopLiveWatcher();
    };
  }, [requestPermission, reconcileSteps, stopLiveWatcher]);

  /**
   * AppState Transitions (Foreground / Background)
   */
  useEffect(() => {
    const handleAppStateChange = async (nextAppState) => {
      const prevAppState = appStateRef.current;
      appStateRef.current = nextAppState;

      if (prevAppState.match(/active/) && nextAppState.match(/inactive|background/)) {
        stopLiveWatcher();

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
          console.warn('[useStepCounter] Storage persist failed:', storageErr);
        }
      } else if (prevAppState.match(/inactive|background/) && nextAppState === 'active') {
        await reconcileSteps();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [reconcileSteps, stopLiveWatcher]);

  const refresh = useCallback(async () => {
    setError(null);
    return await reconcileSteps();
  }, [reconcileSteps]);

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
    requestPermission,
    requestBackgroundExemption,
  };
}
