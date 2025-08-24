import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fzezxfowrowmsdouryny.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6ZXp4Zm93cm93bXNkb3VyeW55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3ODg3ODIsImV4cCI6MjA3MTM2NDc4Mn0.CuvRyxtPcGlZi0-cjLDkIG0vf_FZXd_Mn2KggySaxLA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
