'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from './supabase';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  configured: boolean;
  signInPassword: (email: string, password: string) => Promise<{ error?: string }>;
  signUpPassword: (email: string, password: string, displayName?: string) => Promise<{ error?: string; needsConfirm?: boolean }>;
  signInMagicLink: (email: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) { setLoading(false); return; }
    sb.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const signInPassword = useCallback(async (email: string, password: string) => {
    const sb = getSupabase();
    if (!sb) return { error: 'Supabase nicht konfiguriert' };
    const { error } = await sb.auth.signInWithPassword({ email, password });
    return error ? { error: error.message } : {};
  }, []);

  const signUpPassword = useCallback(async (email: string, password: string, displayName?: string) => {
    const sb = getSupabase();
    if (!sb) return { error: 'Supabase nicht konfiguriert' };
    const { data, error } = await sb.auth.signUp({
      email, password,
      options: { data: displayName ? { display_name: displayName } : undefined },
    });
    if (error) return { error: error.message };
    // Wenn E-Mail-Bestätigung aktiv ist, gibt es noch keine Session.
    return { needsConfirm: !data.session };
  }, []);

  const signInMagicLink = useCallback(async (email: string) => {
    const sb = getSupabase();
    if (!sb) return { error: 'Supabase nicht konfiguriert' };
    const emailRedirectTo = typeof window !== 'undefined' ? window.location.href.split('#')[0] : undefined;
    const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo } });
    return error ? { error: error.message } : {};
  }, []);

  const signOut = useCallback(async () => {
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      session, user: session?.user ?? null, loading,
      configured: isSupabaseConfigured,
      signInPassword, signUpPassword, signInMagicLink, signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth muss innerhalb von AuthProvider verwendet werden');
  return ctx;
}
