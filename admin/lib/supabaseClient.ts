import { createClient } from '@supabase/supabase-js';

// Active Verified Supabase Instance
const ACTIVE_SUPABASE_URL = 'https://xwqnndlopsnrubekvrxz.supabase.co';
const ACTIVE_ANON_KEY = 'sb_publishable_phHY2mq3tlPtA1J0hMgqyA_d4WdPRYd';

const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseUrl = (envUrl && !envUrl.includes('qngwttikptqgoypsdfqu')) 
  ? envUrl 
  : ACTIVE_SUPABASE_URL;

const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseAnonKey = (envKey && !envKey.includes('abc') && envKey.length > 20) 
  ? envKey 
  : ACTIVE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
