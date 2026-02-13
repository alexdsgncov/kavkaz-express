
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_URL = 'https://speklqrojpwfsznxovei.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZWtscXJvanB3ZnN6bnhvdmVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MzYxOTksImV4cCI6MjA4NjUxMjE5OX0.ZkWKtyMWkKFmeYZLmcqN5hIjXj94pal2zhEuvYaPch0';

const isValid = (val: any): val is string => {
  return typeof val === 'string' && val.length > 5 && val !== 'undefined' && val !== 'null';
};

export const getSupabaseConfig = () => {
  let url = null;
  let key = null;

  try {
    url = localStorage.getItem('SUPABASE_URL');
    key = localStorage.getItem('SUPABASE_ANON_KEY');
  } catch (e) {
    // Ignore localStorage errors
  }

  // Fallback to constants if storage is empty
  return { 
    url: isValid(url) ? url : DEFAULT_URL, 
    key: isValid(key) ? key : DEFAULT_KEY 
  };
};

let supabaseClient: SupabaseClient | null = null;

export const initSupabase = (url: string, key: string) => {
  if (!isValid(url) || !isValid(key)) {
    throw new Error("Supabase URL and Key are required to initialize.");
  }
  try {
    localStorage.setItem('SUPABASE_URL', url);
    localStorage.setItem('SUPABASE_ANON_KEY', key);
  } catch (e) {
    // Ignore quota or access errors
  }
  supabaseClient = createClient(url, key);
  return supabaseClient;
};

export const getSupabase = () => {
  if (supabaseClient) return supabaseClient;
  const { url, key } = getSupabaseConfig();
  if (url && key) {
    try {
      supabaseClient = createClient(url, key);
      return supabaseClient;
    } catch (e) {
      console.error("Failed to create Supabase client:", e);
    }
  }
  return null;
};
