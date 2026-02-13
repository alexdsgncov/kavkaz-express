
import { createClient } from '@supabase/supabase-js';

const originalUrl = 'https://speklqrjpwfsznxovei.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZWtscXJvanB3ZnN6bnhvdmVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MzYxOTksImV4cCI6MjA4NjUxMjE5OX0.ZkWKtyMWkKFmeYZLmcqN5hIjXj94pal2zhEuvYaPch0';

const defaultProxy = 'https://project.alexdsgncom-c6a.workers.dev';
let proxyUrl = localStorage.getItem('supabase_proxy_url') || defaultProxy;

if (proxyUrl.endsWith('/')) {
  proxyUrl = proxyUrl.slice(0, -1);
}

console.log('🔌 Инициализация Supabase через:', proxyUrl);

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
      const timeout = setTimeout(() => controller.abort(), 15000);
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
    // Делаем запрос к корню API через fetch напрямую для быстрой проверки
    const response = await fetch(`${proxyUrl}/rest/v1/`, {
      headers: { 'apikey': supabaseAnonKey }
    });
    
    const latency = Date.now() - start;

    if (response.status === 1016 || response.status === 502) {
      return { ok: false, error: 'Ошибка DNS в Cloudflare (1016/502). Проверьте код воркера.' };
    }

    if (response.ok || response.status === 404 || response.status === 401) {
      return { ok: true, latency };
    }
    
    return { ok: false, error: `Код ответа: ${response.status}` };
  } catch (err) {
    console.error('Proxy connection error:', err);
    return { ok: false, error: 'Не удалось достучаться до прокси' };
  }
};
