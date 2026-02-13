
import React, { useState } from 'react';
import { initSupabase } from '../lib/supabase';

interface SupabaseConfigProps {
  onConfigured: () => void;
}

const SupabaseConfig: React.FC<SupabaseConfigProps> = ({ onConfigured }) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = url.trim();
    const cleanKey = key.trim();

    if (!cleanUrl || !cleanKey) {
      setError('Please provide both URL and Key.');
      return;
    }

    if (!cleanUrl.startsWith('http')) {
      setError('Invalid project URL. Must start with http/https.');
      return;
    }

    setIsTesting(true);
    setError('');

    try {
      const client = initSupabase(cleanUrl, cleanKey);
      
      // Attempt a small query to verify connection
      const { error: testError } = await client.from('trips').select('id').limit(1);
      
      // PGRST301 is usually "JWT expired" or invalid keys
      if (testError && (testError as any).code === 'PGRST301') {
         throw new Error('Invalid Anon Key or Project URL');
      }

      onConfigured();
    } catch (err: any) {
      setError(err.message || 'Failed to connect. Please check your credentials.');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white max-w-md mx-auto px-6 pt-20">
      <div className="space-y-6">
        <div className="size-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-2">
          <span className="material-symbols-outlined text-5xl icon-filled">database</span>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">База данных</h1>
          <p className="text-slate-500 text-lg leading-relaxed">
            Для работы MVP необходимо подключить проект Supabase.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Project URL</label>
            <input 
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-xs focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="https://xyz.supabase.co"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Anon Key</label>
            <input 
              type="password"
              required
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-xs focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-500 text-xs font-bold rounded-xl border border-red-100 animate-pulse">
              {error}
            </div>
          )}

          <div className="pt-4">
            <button 
              type="submit"
              disabled={isTesting || !url || !key}
              className="w-full bg-slate-900 py-4 rounded-2xl text-white font-bold text-lg shadow-xl active:scale-95 disabled:bg-slate-300 transition-all flex items-center justify-center gap-3"
            >
              {isTesting ? (
                <>
                  <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Проверка...
                </>
              ) : 'Подключить'}
            </button>
          </div>
        </form>

        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
          <p className="text-[11px] text-primary/80 leading-relaxed font-medium">
            <strong>Инструкция:</strong> Зайдите в панель Supabase &rarr; Project Settings &rarr; API и скопируйте URL и anon/public key.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupabaseConfig;
