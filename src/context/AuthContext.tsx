import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  loginError: string | null;
  clearLoginError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const t = await currentUser.getIdToken();
          setToken(t);
        } catch (error) {
          console.error('Token fetch failed', error);
          setToken(null);
        }
      } else {
        setToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      setLoginError(null);
      await signInWithPopup(auth, googleAuthProvider);
    } catch (error: any) {
      console.error('Login failed', error);
      if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-blocked') {
        setLoginError("Login popup was blocked. Please open the app in a new tab to log in.");
      } else {
        setLoginError(error.message || "An error occurred during login.");
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const clearLoginError = () => setLoginError(null);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, loginError, clearLoginError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
