import { createBrowserClient } from '@supabase/ssr'

// Variabel untuk menyimpan instance singletocreateBrowserClientaseInstance: ReturnType<typeof createClient> | null = null;

export function supabaseClient() {

  return  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
}