import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xwqnndlopsnrubekvrxz.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_phHY2mq3tlPtA1J0hMgqyA_d4WdPRYd';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
