import { useCallback } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/src/lib/supabase/client';
import { useAuthContext } from '@/src/contexts/AuthContext';

export function useAuth() {
  const { user, session, loading } = useAuthContext();
  const router = useRouter();

  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
        },
      });
      if (error) throw error;
      return data;
    },
    []
  );

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    router.push('/');
  }, [router]);

  return { user, session, loading, signUp, signIn, signOut };
}
