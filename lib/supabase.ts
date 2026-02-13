
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_URL = 'https://speklqrojpwfsznxovei.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZWtscXJvanB3ZnN6bnhvdmVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MzYxOTksImV4cCI6MjA4NjUxMjE5OX0.ZkWKtyMWkKFmeYZLmcqN5hIjXj94pal2zhEuvYaPch0';

const isValid = (val: any): val is string => {
  return typeof val === 'string' && val.length > 0 && val !== 'undefined' && val !== 'null';
};

export const getSupabaseConfig = () => {
  const url = localStorage.getItem('SUPABASE_URL') || 
              (import.meta as any).env?.VITE_SUPABASE_URL || 
              (process.env as any)?.SUPABASE_URL ||
              DEFAULT_URL;
              
  const key = localStorage.getItem('SUPABASE_ANON_KEY') || 
              (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 
              (process.env as any)?.SUPABASE_ANON_KEY ||
              DEFAULT_KEY;
              
  return { 
    url: isValid(url) ? url : null, 
    key: isValid(key) ? key : null 
  };
};

let supabaseClient: SupabaseClient | null = null;

export const initSupabase = (url: string, key: string) => {
  if (!isValid(url) || !isValid(key)) {
    throw new Error("Supabase URL and Key are required to initialize.");
  }
  localStorage.setItem('SUPABASE_URL', url);
  localStorage.setItem('SUPABASE_ANON_KEY', key);
  supabaseClient = createClient(url, key);
  return supabaseClient;
};

export const getSupabase = () => {
  if (supabaseClient) return supabaseClient;
  const { url, key } = getSupabaseConfig();
  if (url && key) {
    supabaseClient = createClient(url, key);
    return supabaseClient;
  }
  return null;
};
