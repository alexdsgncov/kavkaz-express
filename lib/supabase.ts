
import { createClient } from '@supabase/supabase-js';

// ПРАВИЛЬНЫЙ АДРЕС (соответствует вашему anon key)
const originalUrl = 'https://speklqrvojpwfsznxovei.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZWtscXJvanB3ZnN6bnhvdmVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MzYxOTksImV4cCI6MjA4NjUxMjE5OX0.ZkWKtyMWkKFmeYZLmcqN5hIjXj94pal2zhEuvYaPch0';

const defaultProxy = 'https://project.alexdsgncom-c6a.workers.dev';
let proxyUrl = localStorage.getItem('supabase_proxy_url') || defaultProxy;

if (proxyUrl.endsWith('/')) {
  proxyUrl = proxyUrl.slice(0, -1);
}

console.log('🔌 Подключение к базе:', originalUrl);
console.log('🌉 Через прокси:', proxyUrl);

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
    // Проверка через запрос к списку таблиц (безопасный метод)
    const response = await fetch(`${proxyUrl}/rest/v1/?cb=${start}`, {
      headers: { 'apikey': supabaseAnonKey }
    });
    
    const latency = Date.now() - start;

    if (response.status === 1016) {
      return { ok: false, error: 'Ошибка 1016: Неверный адрес базы в коде воркера!' };
    }

    if (response.ok || response.status === 404 || response.status === 401) {
      return { ok: true, latency };
    }
    
    return { ok: false, error: `Статус: ${response.status}` };
  } catch (err) {
    return { ok: false, error: 'Прокси недоступен' };
  }
};
