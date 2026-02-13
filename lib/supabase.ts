
import { createClient } from '@supabase/supabase-js';

// Это ваш реальный адрес, он нужен для заголовков и ключей
const originalUrl = 'https://speklqrjpwfsznxovei.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZWtscXJvanB3ZnN6bnhvdmVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MzYxOTksImV4cCI6MjA4NjUxMjE5OX0.ZkWKtyMWkKFmeYZLmcqN5hIjXj94pal2zhEuvYaPch0';

/**
 * ИНСТРУКЦИЯ ДЛЯ РОССИИ:
 * 1. Создайте Cloudflare Worker.
 * 2. Разверните там код прокси (указан в чате).
 * 3. Выполните в консоли браузера: localStorage.setItem('supabase_proxy_url', 'ВАШ_URL_ОТ_CLOUDFLARE')
 * 4. Обновите страницу.
 */
const proxyUrl = localStorage.getItem('supabase_proxy_url') || originalUrl;

export const supabase = createClient(proxyUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: { 
      'x-application-name': 'kavkaz-express',
      // Указываем оригинальный хост, чтобы Supabase понимал, чей это запрос
      'host': 'speklqrjpwfsznxovei.supabase.co'
    },
    fetch: (url, options) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      return fetch(url, {
        ...options,
        signal: controller.signal,
      }).finally(() => clearTimeout(timeout));
    },
  },
});

export const checkConnection = async () => {
  try {
    const start = Date.now();
    // Делаем простой запрос для проверки
    const { error } = await supabase.from('users').select('id').limit(1);
    if (error) {
      console.error("Supabase Error:", error);
      return { ok: false, error };
    }
    return { ok: true, latency: Date.now() - start };
  } catch (err) {
    return { ok: false, error: err };
  }
};
