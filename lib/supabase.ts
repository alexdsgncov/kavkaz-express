
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ozzausbrumzjjvtvsglk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96emF1c2JydW16amp2dHZzZ2xrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNjk2MzgsImV4cCI6MjA4Njc0NTYzOH0.d4P7VJgnanrOhaltLnDRUTbTqhR7VWMgkfj_To5Yfc0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
