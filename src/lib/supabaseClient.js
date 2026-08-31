import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wphvmyqsxicyoifrlevt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_cB3mpag9moVvhekQG6GBWw_ogz_nb9M';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

/** Obtiene el access token JWT de la sesión activa de Supabase. */
export async function getToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}
