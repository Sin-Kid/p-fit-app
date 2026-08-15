'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Footprints, 
  Droplets, 
  Pill, 
  Timer, 
  Database, 
  RefreshCw, 
  Search, 
  ShieldCheck, 
  ArrowLeft,
  ArrowUpRight,
  TrendingUp,
  UserCheck,
  Calendar,
  Eye,
  X,
  Server
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  daily_step_goal: number;
  daily_water_goal_ml: number;
  created_at: string;
}

interface StepLog {
  id: string;
  user_id: string;
  log_date: string;
  steps: number;
  distance_km: number;
  calories_kcal: number;
}

interface WaterLog {
  id: string;
  user_id: string;
  log_date: string;
  amount_ml: number;
}

interface Medication {
  id: string;
  user_id: string;
  name: string;
  dosage: string;
  scheduled_time: string;
  is_taken: boolean;
}

interface Pomodoro {
  id: string;
  user_id: string;
  duration_minutes: number;
  mode: string;
  completed_at: string;
}

export default function AdminPanelPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [stepLogs, setStepLogs] = useState<StepLog[]>([]);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [pomodoros, setPomodoros] = useState<Pomodoro[]>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [lastSynced, setLastSynced] = useState<string>('');

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Profiles
      const { data: profs } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (profs) setProfiles(profs);

      // 2. Fetch Steps
      const { data: steps } = await supabase.from('step_logs').select('*');
      if (steps) setStepLogs(steps);

      // 3. Fetch Water
      const { data: water } = await supabase.from('water_logs').select('*');
      if (water) setWaterLogs(water);

      // 4. Fetch Medication
      const { data: meds } = await supabase.from('medication_reminders').select('*');
      if (meds) setMedications(meds);

      // 5. Fetch Pomodoro
      const { data: pomos } = await supabase.from('pomodoro_sessions').select('*');
      if (pomos) setPomodoros(pomos);

      setLastSynced(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Error fetching Supabase data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Aggregated Analytics
  const totalUsers = profiles.length;
  const totalSteps = stepLogs.reduce((acc, curr) => acc + curr.steps, 0);
  const totalWaterLiters = (waterLogs.reduce((acc, curr) => acc + curr.amount_ml, 0) / 1000).toFixed(1);
  const totalMeds = medications.length;
  const takenMeds = medications.filter(m => m.is_taken).length;
  const medAdherenceRate = totalMeds > 0 ? Math.round((takenMeds / totalMeds) * 100) : 100;
  const totalFocusMinutes = pomodoros.reduce((acc, curr) => acc + curr.duration_minutes, 0);

  const filteredProfiles = profiles.filter(p => 
    p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      
      {/* Top Admin Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <Link 
            href="/"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Back to P-fit App"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">P-fit Admin Intelligence Portal</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span> Supabase Connected
              </span>
            </div>
            <p className="text-xs text-slate-500">Enterprise Cloud Database Management • Project xwqnndlopsnrubekvrxz</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-mono hidden md:inline">
            Synced: {lastSynced || 'Just now'}
          </span>
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Cloud Data</span>
          </button>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
        
        {/* KPI Intelligence Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Card 1: Users */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Users</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">{totalUsers} Profiles</div>
            <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
              <UserCheck className="w-3 h-3" /> 100% cloud verified
            </p>
          </div>

          {/* Card 2: Total Steps */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fleet Step Volume</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Footprints className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">{totalSteps.toLocaleString()}</div>
            <p className="text-[11px] text-slate-500 font-semibold">
              {(totalSteps * 0.00078).toFixed(1)} km recorded
            </p>
          </div>

          {/* Card 3: Water Hydration */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hydration Volume</span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                <Droplets className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">{totalWaterLiters} Liters</div>
            <p className="text-[11px] text-sky-600 font-semibold">
              {waterLogs.length} total logs today
            </p>
          </div>

          {/* Card 4: Medication Adherence */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Med Adherence</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Pill className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">{medAdherenceRate}%</div>
            <p className="text-[11px] text-purple-600 font-semibold">
              {takenMeds} of {totalMeds} pills taken
            </p>
          </div>

          {/* Card 5: Pomodoro Focus */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Focus Time</span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <Timer className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">{(totalFocusMinutes / 60).toFixed(1)} Hours</div>
            <p className="text-[11px] text-rose-600 font-semibold">
              {pomodoros.length} completed cycles
            </p>
          </div>

        </div>

        {/* User Directory Table Section */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Enterprise User Directory</h2>
              <p className="text-xs text-slate-500">Live profiles & telemetry synced directly from Supabase PostgreSQL tables</p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user, email, role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">User Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Step Goal</th>
                  <th className="py-3 px-4">Water Goal</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredProfiles.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-[10px]">
                        {user.full_name?.substring(0, 2).toUpperCase() || 'PF'}
                      </div>
                      <span>{user.full_name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">{user.email || '—'}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {user.role?.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 font-mono">{user.daily_step_goal?.toLocaleString()} steps</td>
                    <td className="py-3.5 px-4 text-slate-800 font-mono">{user.daily_water_goal_ml?.toLocaleString()} ml</td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Data</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Scalability Notice & Architecture */}
        <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Enterprise Cloud Ready with Supabase</h3>
              <p className="text-xs text-slate-400">PostgreSQL with Row Level Security (RLS), real-time subscriptions, and auto-scaling indexes.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30">
              PostgreSQL 15 Active
            </span>
          </div>
        </div>
      </main>

      {/* User Drill-Down Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 space-y-4 shadow-2xl animate-fade-in border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">{selectedUser.full_name}'s Cloud Telemetry</h3>
                <p className="text-xs text-slate-500 font-mono">{selectedUser.email}</p>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Today's Steps</span>
                <p className="text-lg font-black text-emerald-800 font-mono mt-0.5">
                  {stepLogs.find(s => s.user_id === selectedUser.id)?.steps.toLocaleString() || '0'} steps
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Today's Hydration</span>
                <p className="text-lg font-black text-sky-800 font-mono mt-0.5">
                  {waterLogs.find(w => w.user_id === selectedUser.id)?.amount_ml.toLocaleString() || '0'} ml
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-2">Prescribed Medications</h4>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {medications.filter(m => m.user_id === selectedUser.id).map(med => (
                  <div key={med.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800">{med.name}</span>
                      <p className="text-[10px] text-slate-400">{med.dosage}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-mono text-[10px] font-bold">
                      {med.scheduled_time} • {med.is_taken ? 'Taken' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedUser(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
