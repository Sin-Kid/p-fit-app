'use client';

import React, { useState, useEffect } from 'react';
import { 
  Footprints, MapPin, Clock, TrendingUp, Play, Pause, Zap, 
  Smartphone, ShieldCheck, RefreshCw, Check, Link2, Unlink
} from 'lucide-react';
import { useMotionPedometer } from '../lib/useMotionPedometer';
import { healthConnect } from '../lib/healthConnectService';

export function StepsScreen({
  steps,
  stepGoal,
  onAddSteps
}: {
  steps: number;
  stepGoal: number;
  onAddSteps: (count: number, showToast?: boolean) => void;
}) {
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isHealthSyncing, setIsHealthSyncing] = useState<boolean>(false);
  const [isConnectedToHealth, setIsConnectedToHealth] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');

  useEffect(() => {
    setIsConnectedToHealth(healthConnect.isConnected());
  }, []);

  // Hook into phone's physical accelerometer and motion sensor
  const {
    isSupported,
    isActive,
    permissionStatus,
    currentMagnitude,
    liveThreshold,
    stepsCounted,
    requestPermission,
  } = useMotionPedometer((count) => {
    onAddSteps(count, false);
  });

  // Background Simulator for desktop browsers without physical sensors
  useEffect(() => {
    let interval: any = null;
    if (isSimulating) {
      interval = setInterval(() => {
        const randomSteps = Math.floor(Math.random() * 2) + 1;
        onAddSteps(randomSteps, false);
      }, 750);
    }
    return () => clearInterval(interval);
  }, [isSimulating, onAddSteps]);

  const handleToggleHealthConnect = async () => {
    if (isConnectedToHealth) {
      healthConnect.disconnect();
      setIsConnectedToHealth(false);
    } else {
      setIsHealthSyncing(true);
      const authorized = await healthConnect.requestAuthorization();
      if (authorized) {
        setIsConnectedToHealth(true);
        const result = await healthConnect.syncTodayHealth(steps);
        setLastSyncTime(result.lastSynced);
        onAddSteps(150, true);
      }
      setIsHealthSyncing(false);
    }
  };

  const handleManualSync = async () => {
    setIsHealthSyncing(true);
    const result = await healthConnect.syncTodayHealth(steps);
    setLastSyncTime(result.lastSynced);
    setIsHealthSyncing(false);
    onAddSteps(150, true);
  };

  const stepProgress = Math.min(100, Math.round((steps / stepGoal) * 100));
  const distanceKm = (steps * 0.00078).toFixed(2);
  const caloriesBurned = Math.round(steps * 0.042);
  const activeTimeMin = Math.round(steps / 115);
  const floors = Math.floor(steps / 480);

  return (
    <div className="space-y-5 animate-fade-in pt-1 pb-4">
      {/* 1. Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#D7F4DF] flex items-center justify-center text-[#16A34A]">
            <Footprints className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800">Step Tracker</h2>
            <p className="text-[10px] text-slate-500 font-bold">Google Health Connect & Apple HealthKit</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF8EE] text-[#15803D] border border-[#CDEED5] text-xs font-bold shadow-xs">
          <span className={`w-2 h-2 rounded-full ${isActive || isConnectedToHealth || isSimulating ? 'bg-[#34D399] animate-pulse' : 'bg-slate-300'}`}></span>
          <span>{isConnectedToHealth ? 'HealthKit Synced' : (isActive ? 'Live Tracking' : (isSimulating ? 'Simulator Active' : 'Ready'))}</span>
        </div>
      </div>

      {/* 2. Google Health Connect & Apple Health Sync Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-[#EFF6FF] via-[#EBF5FF] to-[#F0FDF4] border border-[#BFDBFE] shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#DBEAFE] flex items-center justify-center text-[#1D4ED8] shrink-0">
            <RefreshCw className={`w-4 h-4 ${isHealthSyncing ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              Health Connect & HealthKit
              {isConnectedToHealth && (
                <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-black">
                  CONNECTED
                </span>
              )}
            </h4>
            <p className="text-[10px] text-slate-600 font-medium">
              {isConnectedToHealth 
                ? `Last sync: ${lastSyncTime} • Auto-syncing every 1h` 
                : 'Connect to read verified steps from Android & Apple Health'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isConnectedToHealth && (
            <button
              onClick={handleManualSync}
              disabled={isHealthSyncing}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-blue-200 text-blue-700 text-xs font-black shrink-0 active:scale-95 transition-all shadow-xs"
            >
              {isHealthSyncing ? 'Syncing...' : 'Sync'}
            </button>
          )}

          <button
            onClick={handleToggleHealthConnect}
            disabled={isHealthSyncing}
            className={`px-3.5 py-2 rounded-xl text-xs font-black shrink-0 active:scale-95 transition-all shadow-sm flex items-center gap-1 ${
              isConnectedToHealth 
                ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' 
                : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white'
            }`}
          >
            {isConnectedToHealth ? (
              <>
                <Unlink className="w-3.5 h-3.5" /> Disconnect
              </>
            ) : (
              <>
                <Link2 className="w-3.5 h-3.5" /> Connect
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sensor Permission Agreement Banner (for iOS Safari & explicit prompt) */}
      {isSupported && permissionStatus === 'prompt' && !isActive && (
        <div className="p-4 rounded-3xl bg-white border border-[#CDEED5] shadow-xs space-y-2.5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#EAF7EE] flex items-center justify-center text-[#16A34A] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-black text-slate-800">Physical Motion Sensor Permission</h4>
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed mt-0.5">
                Enable device accelerometer sensors for real-time background step counting while walking or running.
              </p>
            </div>
          </div>
          <button
            onClick={() => requestPermission()}
            className="w-full py-2.5 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-black flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md shadow-emerald-500/20"
          >
            <Smartphone className="w-4 h-4" /> Enable Phone Motion Sensors
          </button>
        </div>
      )}

      {/* 3. Main Steps Card (Pastel Mint/Sage) */}
      <div className="bg-[#F2FAF4] rounded-[40px] p-6 shadow-xs border border-[#CDEED5] text-center relative flex flex-col items-center">
        <div className="w-full text-left">
          <h3 className="text-5xl font-black text-slate-800 tracking-tight font-mono">
            {steps.toLocaleString()}
          </h3>
          <p className="text-xs font-bold text-slate-500 mt-0.5">
            of {stepGoal.toLocaleString()} daily target ({stepProgress}%)
          </p>
        </div>

        {/* Walking Hero 3D Art */}
        <div className="w-60 h-56 mt-2 flex items-center justify-center">
          <img 
            src="/walking_hero_illustration.jpg" 
            alt="Pedometer walking" 
            className="w-full h-full object-contain mix-blend-multiply drop-shadow-xs" 
          />
        </div>

        {/* Progress Bar (Pastel Mint) */}
        <div className="w-full mt-3">
          <div className="flex justify-between text-xs font-extrabold text-[#15803D] mb-1 px-1">
            <span>Target Progress</span>
            <span>{stepProgress}%</span>
          </div>
          <div className="h-3 w-full bg-white rounded-full overflow-hidden p-0.5 border border-[#CDEED5]">
            <div 
              className="h-full bg-[#34D399] rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${stepProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Telemetry Metrics Grid */}
        <div className="grid grid-cols-4 gap-2 w-full mt-5 p-3.5 rounded-3xl bg-white border border-[#CDEED5] text-center shadow-xs">
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-[#EAF7EE] flex items-center justify-center text-[#16A34A] mb-1">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <span className="text-[9px] font-extrabold text-slate-400 uppercase">Distance</span>
            <span className="text-xs font-black text-slate-800 font-mono mt-0.5">{distanceKm} km</span>
          </div>

          <div className="flex flex-col items-center border-l border-slate-100">
            <div className="w-7 h-7 rounded-full bg-[#FFF2E8] flex items-center justify-center text-[#EA580C] mb-1">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <span className="text-[9px] font-extrabold text-slate-400 uppercase">Burn</span>
            <span className="text-xs font-black text-slate-800 font-mono mt-0.5">{caloriesBurned} kcal</span>
          </div>

          <div className="flex flex-col items-center border-l border-slate-100">
            <div className="w-7 h-7 rounded-full bg-[#FEF9C3] flex items-center justify-center text-[#CA8A04] mb-1">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <span className="text-[9px] font-extrabold text-slate-400 uppercase">Active</span>
            <span className="text-xs font-black text-slate-800 font-mono mt-0.5">{activeTimeMin} min</span>
          </div>

          <div className="flex flex-col items-center border-l border-slate-100">
            <div className="w-7 h-7 rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#0284C7] mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <span className="text-[9px] font-extrabold text-slate-400 uppercase">Floors</span>
            <span className="text-xs font-black text-slate-800 font-mono mt-0.5">{floors} fl</span>
          </div>
        </div>


        {/* Quick Log Presets */}
        <div className="grid grid-cols-3 gap-2 w-full mt-4">
          <button
            onClick={() => onAddSteps(100, true)}
            className="py-3 rounded-2xl bg-white hover:bg-[#EAF7EE] border border-[#CDEED5] text-[#15803D] font-black text-xs active:scale-95 transition-all shadow-xs"
          >
            +100 Steps
          </button>
          <button
            onClick={() => onAddSteps(500, true)}
            className="py-3 rounded-2xl bg-[#52D288] hover:bg-[#43BE75] text-white font-black text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
          >
            +500 Steps
          </button>
          <button
            onClick={() => onAddSteps(1000, true)}
            className="py-3 rounded-2xl bg-white hover:bg-[#EAF7EE] border border-[#CDEED5] text-[#15803D] font-black text-xs active:scale-95 transition-all shadow-xs"
          >
            +1,000 Steps
          </button>
        </div>

      </div>
    </div>
  );
}
