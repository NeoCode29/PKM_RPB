import { useEffect, useState } from 'react';
import { supabaseClient } from './client';
import { Session } from '@supabase/supabase-js';

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const supabase = supabaseClient();
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return session;
} 