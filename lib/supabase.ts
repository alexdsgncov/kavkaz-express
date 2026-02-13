
import { createClient } from '@supabase/supabase-js';

// Оригинальный адрес Supabase
const originalUrl = 'https://speklqrjpwfsznxovei.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZWtscXJvanB3ZnN6bnhvdmVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MzYxOTksImV4cCI6MjA4NjUxMjE5OX0.ZkWKtyMWkKFmeYZLmcqN5hIjXj94pal2zhEuvYaPch0';

/**
 * Использование вашего прокси для обхода блокировок.
 * Если вы захотите сменить прокси, это можно сделать в настройках на экране входа.
 */
const defaultProxy = 'https://project.alexdsgncom-c6a.workers.dev';
const proxyUrl = localStorage.getItem('supabase_proxy_url') || defaultProxy;

export const supabase = createClient(proxyUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: { 
      'x-application-name': 'kavkaz-express'
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
    // Простой запрос к таблице 'users' для проверки доступности
    const { error, status } = await supabase.from('users').select('id').limit(1);
    
    // Если сервер ответил (даже если ошибка 404 - таблицы еще нет), значит прокси работает
    if (!error || (status && status < 500)) {
      return { ok: true, latency: Date.now() - start };
    }
    
    return { ok: false, error };
  } catch (err) {
    return { ok: false, error: err };
  }
};
