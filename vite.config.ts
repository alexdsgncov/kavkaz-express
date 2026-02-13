
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.SUPABASE_URL': JSON.stringify('https://speklqrojpwfsznxovei.supabase.co'),
    'process.env.SUPABASE_ANON_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZWtscXJvanB3ZnN6bnhvdmVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MzYxOTksImV4cCI6MjA4NjUxMjE5OX0.ZkWKtyMWkKFmeYZLmcqN5hIjXj94pal2zhEuvYaPch0')
  },
  build: {
    outDir: 'dist',
    target: 'esnext'
  }
});
