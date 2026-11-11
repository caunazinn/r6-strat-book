import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** null quando as variáveis de ambiente não estão configuradas: o app cai para localStorage/JSON. */
export const supabase = url && key ? createClient(url, key) : null;
