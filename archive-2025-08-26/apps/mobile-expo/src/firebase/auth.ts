import { useCallback, useEffect, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  getIdTokenResult,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from './init';

export type AppRole = 'employee' | 'manager' | undefined;

type UseAuth = {
  user: User | null;
  role: AppRole;
  initializing: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, displayName?: string) => Promise<any>;
  signOut: () => Promise<void>;
};

export const useAuth = (): UseAuth => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole>(undefined);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (next) => {
      setUser(next);
      setRole(undefined);
      if (next) {
        try {
          const token = await getIdTokenResult(next, true);
          const claim = token.claims.role as string | undefined;
          setRole(claim === 'employee' || claim === 'manager' ? (claim as AppRole) : undefined);
        } catch {
          // no-op; role stays undefined
        }
      }
      setInitializing(false);
    });
    return () => unsub();
  }, []);

  const signIn = useCallback((email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }
    return cred;
  }, []);

  const signOut = useCallback(() => firebaseSignOut(auth), []);

  return { user, role, initializing, signIn, signUp, signOut };
};


