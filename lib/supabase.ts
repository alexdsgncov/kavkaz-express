
import { createClient } from '@supabase/supabase-js';

// Данные берутся из окружения (Vercel/Vite)
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// Экспортируем флаг проверки конфигурации
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('https://'));

// Создаем клиент только если есть валидный URL
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any; // Приводим к any, чтобы не ломать типы в местах использования
