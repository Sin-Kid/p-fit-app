'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { supabase } from '@/lib/supabaseClient';

function AuthCallbackContent() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function handleAuth() {
      try {
        // 1. Process hash / code from URL if present
        const hash = typeof window !== 'undefined' ? window.location.hash : '';
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.warn('OAuth exchange error:', error);
          }
        } else if (hash && hash.includes('access_token')) {
          // Supabase auth auto-detects hash in URL
          await supabase.auth.getSession();
        }

        // 2. Safely redirect to dashboard root
        window.location.replace('/');
      } catch (err: any) {
        console.warn('Auth callback handling note:', err);
        // Fallback: Redirect home after a short delay
        window.location.replace('/');
      }
    }

    handleAuth();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAF9]">
      <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-3xl border border-slate-100 shadow-md">
        <div className="w-8 h-8 border-3 border-[#34D399] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-black text-slate-800 tracking-wide">COMPLETING SIGN IN</p>
        <p className="text-[11px] text-slate-500 font-medium">Redirecting you to P-fit Dashboard...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAF9]">
        <div className="w-8 h-8 border-3 border-[#34D399] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
