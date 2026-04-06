import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wphvmyqsxicyoifrlevt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_cB3mpag9moVvhekQG6GBWw_ogz_nb9M';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
