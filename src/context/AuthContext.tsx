import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
  signInAnonymously,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase.js';

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
}

export interface UserConsentData {
  consentGiven: boolean;
  consentedAt: string;
  studyGoal: string;
  dailyReminder: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isNewUser: boolean;
  hasConsented: boolean;
  signInWithGoogle: () => Promise<void>;
  completeConsent: (options?: { studyGoal?: string; dailyReminder?: boolean }) => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isNewUser: false,
  hasConsented: false,
  signInWithGoogle: async () => {},
  completeConsent: async () => {},
  signInAsGuest: async () => {},
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const cached = localStorage.getItem('ruri_cached_user');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [hasConsented, setHasConsented] = useState<boolean>(() => {
    return localStorage.getItem('ruri_user_consented') === 'true';
  });

  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  // Check user in database
  const checkDatabaseUserStatus = async (uid: string) => {
    try {
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);

      if (snap.exists() && snap.data()?.consentGiven) {
        // Existing database user
        setIsNewUser(false);
        setHasConsented(true);
        localStorage.setItem('ruri_user_consented', 'true');
      } else {
        // New user -> needs Consent / Sign-Up
        const localConsented = localStorage.getItem(`ruri_consented_${uid}`) === 'true';
        if (localConsented) {
          setIsNewUser(false);
          setHasConsented(true);
          localStorage.setItem('ruri_user_consented', 'true');
        } else {
          setIsNewUser(true);
          setHasConsented(false);
          localStorage.removeItem('ruri_user_consented');
        }
      }
    } catch (e) {
      console.warn('Database check warning (offline or permissions):', e);
      const localConsented = localStorage.getItem(`ruri_consented_${uid}`) === 'true';
      if (localConsented) {
        setIsNewUser(false);
        setHasConsented(true);
      } else {
        setIsNewUser(true);
        setHasConsented(false);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: User | null) => {
      if (fbUser) {
        const profile: UserProfile = {
          uid: fbUser.uid,
          displayName: fbUser.displayName || 'Learner',
          email: fbUser.email,
          photoURL: fbUser.photoURL,
          isAnonymous: fbUser.isAnonymous,
        };
        setUser(profile);
        localStorage.setItem('ruri_cached_user', JSON.stringify(profile));
        await checkDatabaseUserStatus(fbUser.uid);
      } else {
        const cached = localStorage.getItem('ruri_cached_user');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            setUser(parsed);
            await checkDatabaseUserStatus(parsed.uid);
          } catch {
            setUser(null);
            setHasConsented(false);
            setIsNewUser(false);
          }
        } else {
          setUser(null);
          setHasConsented(false);
          setIsNewUser(false);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const res = await signInWithPopup(auth, googleProvider);
      const profile: UserProfile = {
        uid: res.user.uid,
        displayName: res.user.displayName || 'Learner',
        email: res.user.email,
        photoURL: res.user.photoURL,
        isAnonymous: false,
      };
      setUser(profile);
      localStorage.setItem('ruri_cached_user', JSON.stringify(profile));

      // Query database to evaluate Routing Rule
      await checkDatabaseUserStatus(res.user.uid);
    } catch (err: unknown) {
      console.warn('Google Auth notice, falling back to guest mode:', err);
      await signInAsGuest();
    } finally {
      setLoading(false);
    }
  };

  const completeConsent = async (options?: { studyGoal?: string; dailyReminder?: boolean }) => {
    if (!user) return;
    const consentPayload: UserConsentData = {
      consentGiven: true,
      consentedAt: new Date().toISOString(),
      studyGoal: options?.studyGoal || 'Broad Academic Inquiry',
      dailyReminder: options?.dailyReminder ?? true,
    };

    // Save to Firestore
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, consentPayload, { merge: true });
    } catch (e) {
      console.warn('Firestore consent persistence notice:', e);
    }

    // Save to local cache
    localStorage.setItem(`ruri_consented_${user.uid}`, 'true');
    localStorage.setItem('ruri_user_consented', 'true');
    setHasConsented(true);
    setIsNewUser(false);
  };

  const signInAsGuest = async () => {
    try {
      setLoading(true);
      try {
        const res = await signInAnonymously(auth);
        const profile: UserProfile = {
          uid: res.user.uid,
          displayName: 'Scholarly Guest',
          email: null,
          photoURL: null,
          isAnonymous: true,
        };
        setUser(profile);
        localStorage.setItem('ruri_cached_user', JSON.stringify(profile));
        await checkDatabaseUserStatus(res.user.uid);
      } catch {
        const guestId = 'guest_' + Math.random().toString(36).substring(2, 9);
        const profile: UserProfile = {
          uid: guestId,
          displayName: 'Scholarly Guest',
          email: null,
          photoURL: null,
          isAnonymous: true,
        };
        setUser(profile);
        localStorage.setItem('ruri_cached_user', JSON.stringify(profile));
        setHasConsented(true);
        setIsNewUser(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
    } catch {
      // Ignore
    }
    localStorage.removeItem('ruri_cached_user');
    localStorage.removeItem('ruri_user_consented');
    setUser(null);
    setHasConsented(false);
    setIsNewUser(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isNewUser,
        hasConsented,
        signInWithGoogle,
        completeConsent,
        signInAsGuest,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
