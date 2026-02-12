
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

// Данные твоего проекта Supabase (ref: avbgagesrffbuojrjipy)
const supabaseUrl = 'https://avbgagesrffbuojrjipy.supabase.co'; 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2YmdhZ2VzcmZmYnVvanJqaXB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4Njg4NTYsImV4cCI6MjA4NjQ0NDg1Nn0.fOGZmfmTKm9LgOl4jBfCFUWsDprgX-1QM1KnIqYIJBI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
