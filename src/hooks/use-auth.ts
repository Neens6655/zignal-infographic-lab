'use client';

/**
 * Auth stub — disabled for local development.
 * Returns a mock authenticated state so the app works without Supabase.
 */
export function useAuth() {
  return {
    user: { id: 'local-dev', email: 'dev@local' },
    session: null,
    isAnonymous: false,
    isLoading: false,
    signInWithEmail: async (_email: string, _password: string) => {},
    signUpWithEmail: async (_email: string, _password: string) => {},
    signInWithOAuth: async (_provider?: string) => {},
    signOut: async () => {},
  };
}
