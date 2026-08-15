'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { StepDetector } from './stepDetector';

export type SensorPermissionStatus = 'granted' | 'denied' | 'prompt' | 'unsupported';

export interface MotionPedometerState {
  isSupported: boolean;
  isActive: boolean;
  permissionStatus: SensorPermissionStatus;
  currentMagnitude: number;
  liveThreshold: number;
  stepsCounted: number;
  error: string | null;
  requestPermission: () => Promise<boolean>;
  startSensor: () => void;
  stopSensor: () => void;
}

export function useMotionPedometer(onStep?: (newStepCount: number) => void): MotionPedometerState {
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [permissionStatus, setPermissionStatus] = useState<SensorPermissionStatus>('granted');
  const [currentMagnitude, setCurrentMagnitude] = useState<number>(0);
  const [liveThreshold, setLiveThreshold] = useState<number>(1.15);
  const [stepsCounted, setStepsCounted] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const stepDetectorRef = useRef<StepDetector | null>(null);
  const onStepRef = useRef(onStep);
  onStepRef.current = onStep;
  const capacitorListenerRef = useRef<any>(null);

  // Initialize detector
  useEffect(() => {
    stepDetectorRef.current = new StepDetector({
      minStepIntervalMs: 240,
      stepThreshold: 1.15,
      gravityAlpha: 0.85,
      smoothingAlpha: 0.25
    });
  }, []);

  // Process acceleration vector
  const handleAcceleration = useCallback((ax: number, ay: number, az: number) => {
    if (!stepDetectorRef.current) return;

    const now = Date.now();
    const isStep = stepDetectorRef.current.addSample(ax, ay, az, now);

    const mag = Math.sqrt(ax * ax + ay * ay + az * az);
    setCurrentMagnitude(parseFloat(mag.toFixed(2)));
    setLiveThreshold(stepDetectorRef.current.getCurrentThreshold());

    if (isStep) {
      setStepsCounted(prev => {
        const next = prev + 1;
        if (onStepRef.current) {
          onStepRef.current(1);
        }
        return next;
      });
    }
  }, []);

  // Web DeviceMotion event listener
  const handleDeviceMotion = useCallback((event: DeviceMotionEvent) => {
    let ax = 0;
    let ay = 0;
    let az = 0;

    if (event.accelerationIncludingGravity && event.accelerationIncludingGravity.x !== null) {
      ax = event.accelerationIncludingGravity.x || 0;
      ay = event.accelerationIncludingGravity.y || 0;
      az = event.accelerationIncludingGravity.z || 0;
    } else if (event.acceleration && event.acceleration.x !== null) {
      ax = event.acceleration.x || 0;
      ay = event.acceleration.y || 0;
      az = event.acceleration.z || 0;
    } else {
      return;
    }

    handleAcceleration(ax, ay, az);
  }, [handleAcceleration]);

  // Start all available motion listeners
  const startSensor = useCallback(async () => {
    if (typeof window === 'undefined') return;

    try {
      // 1. Standard Web DeviceMotionEvent listener
      window.addEventListener('devicemotion', handleDeviceMotion, { passive: true });
      setIsActive(true);
      setError(null);

      // 2. Capacitor native motion listener (only on native devices)
      if ((window as any).Capacitor?.isNativePlatform?.()) {
        try {
          const { Motion } = await import('@capacitor/motion');
          if (Motion && typeof Motion.addListener === 'function') {
            const listener = await Motion.addListener('accel', (event) => {
              const ax = event.acceleration.x ?? 0;
              const ay = event.acceleration.y ?? 0;
              const az = event.acceleration.z ?? 0;
              handleAcceleration(ax, ay, az);
            });
            capacitorListenerRef.current = listener;
          }
        } catch (capErr) {
          // Fallback to devicemotion
        }
      }
    } catch (err: any) {
      console.warn('Failed to start motion sensor:', err);
      setError(err.message || 'Sensor start error');
    }
  }, [handleDeviceMotion, handleAcceleration]);

  // Stop motion listeners
  const stopSensor = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.removeEventListener('devicemotion', handleDeviceMotion);
    if (capacitorListenerRef.current && typeof capacitorListenerRef.current.remove === 'function') {
      capacitorListenerRef.current.remove();
      capacitorListenerRef.current = null;
    }
    setIsActive(false);
  }, [handleDeviceMotion]);

  // Request Permission for iOS Safari / Android Chromium
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;

    try {
      const dme = (window as any).DeviceMotionEvent;
      if (dme && typeof dme.requestPermission === 'function') {
        const response = await dme.requestPermission();
        if (response === 'granted') {
          setPermissionStatus('granted');
          await startSensor();
          return true;
        } else {
          setPermissionStatus('denied');
          setError('Motion sensor permission was denied');
          return false;
        }
      }

      setPermissionStatus('granted');
      await startSensor();
      return true;
    } catch (err: any) {
      console.warn('Permission request error:', err);
      setError(err.message || 'Permission failed');
      setPermissionStatus('denied');
      return false;
    }
  }, [startSensor]);

  // Auto-start on mount and on first user click/touch
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const dme = (window as any).DeviceMotionEvent;
    if (dme && typeof dme.requestPermission === 'function') {
      setPermissionStatus('prompt');
      const onFirstTouch = () => {
        requestPermission();
        window.removeEventListener('click', onFirstTouch);
        window.removeEventListener('touchstart', onFirstTouch);
      };
      window.addEventListener('click', onFirstTouch, { once: true });
      window.addEventListener('touchstart', onFirstTouch, { once: true });
    } else {
      setPermissionStatus('granted');
      startSensor();
    }

    return () => {
      stopSensor();
    };
  }, [startSensor, stopSensor, requestPermission]);

  return {
    isSupported,
    isActive,
    permissionStatus,
    currentMagnitude,
    liveThreshold,
    stepsCounted,
    error,
    requestPermission,
    startSensor,
    stopSensor
  };
}
