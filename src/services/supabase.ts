/**
 * Cliente Supabase resiliente y opcional.
 * Si las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
 * están configuradas (en .env o en Vercel), habilita sincronización en la nube.
 * Si no están configuradas, opera limpiamente en modo local-first sin arrojar excepciones.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('your-project')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;
