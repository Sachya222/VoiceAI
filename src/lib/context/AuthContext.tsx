'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase/client';
import { UserProfile, Business } from '@/types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  business: Business | null;
  loading: boolean;
  isDemoMode: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, fullName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshBusiness: () => Promise<void>;
  setBusiness: React.Dispatch<React.SetStateAction<Business | null>>;
  enableDemoMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo fallback data for instant evaluation when live Firebase keys are not yet configured
const DEMO_USER_PROFILE: UserProfile = {
  uid: 'demo-owner-123',
  email: 'owner@voiceai.demo',
  fullName: 'Alex Johnson',
  role: 'business_owner',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const DEMO_BUSINESS: Business = {
  id: 'demo-biz-apex',
  ownerId: 'demo-owner-123',
  name: 'Apex Tech Solutions & Repairs',
  slug: 'apex-tech-solutions',
  category: 'Computer & Electronics Repair',
  description: 'Certified laptop, smartphone, and desktop diagnostics, parts replacement, and enterprise IT support.',
  phone: '+1 (555) 234-5678',
  email: 'support@apextech.demo',
  website: 'https://apextech.example.com',
  address: '104 Innovation Way, Suite 200',
  city: 'San Francisco',
  state: 'CA',
  postalCode: '94105',
  country: 'United States',
  mapsUrl: 'https://maps.google.com/?q=San+Francisco+Financial+District',
  timezone: 'America/Los_Angeles',
  businessHours: {
    monday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    wednesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    thursday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    friday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
    saturday: { isOpen: true, openTime: '10:00', closeTime: '15:00' },
    sunday: { isOpen: false, openTime: '00:00', closeTime: '00:00' },
  },
  onboardingCompleted: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  // Load business for current user
  const loadBusinessForUser = async (userId: string) => {
    try {
      const q = query(collection(db, 'businesses'), where('ownerId', '==', userId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docData = snap.docs[0].data();
        setBusiness({
          id: snap.docs[0].id,
          ...docData,
        } as Business);
      } else {
        setBusiness(null);
      }
    } catch (err) {
      console.warn('Could not query Firestore for businesses:', err);
    }
  };

  const refreshBusiness = async () => {
    if (isDemoMode) {
      setBusiness(DEMO_BUSINESS);
      return;
    }
    if (user) {
      await loadBusinessForUser(user.uid);
    }
  };

  const enableDemoMode = () => {
    setIsDemoMode(true);
    setUserProfile(DEMO_USER_PROFILE);
    setBusiness(DEMO_BUSINESS);
    setLoading(false);
  };

  useEffect(() => {
    if (!auth || typeof auth.onAuthStateChanged !== 'function') {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser: any) => {
      setUser(fbUser);
      if (fbUser) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            setUserProfile(userSnap.data() as UserProfile);
          } else {
            // Create user profile in Firestore
            const newProfile: UserProfile = {
              uid: fbUser.uid,
              email: fbUser.email || '',
              fullName: fbUser.displayName || 'Business Owner',
              photoURL: fbUser.photoURL || undefined,
              role: 'business_owner',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, {
              ...newProfile,
              serverCreatedAt: serverTimestamp(),
            });
            setUserProfile(newProfile);
          }
          await loadBusinessForUser(fbUser.uid);
        } catch (err) {
          console.warn('Error loading user profile from Firestore:', err);
        }
      } else {
        if (!isDemoMode) {
          setUserProfile(null);
          setBusiness(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isDemoMode]);

  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, fullName: string) => {
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      if (res.user) {
        await updateProfile(res.user, { displayName: fullName });
        const userDocRef = doc(db, 'users', res.user.uid);
        const newProfile: UserProfile = {
          uid: res.user.uid,
          email: res.user.email || email,
          fullName: fullName,
          role: 'business_owner',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, {
          ...newProfile,
          serverCreatedAt: serverTimestamp(),
        });
        setUserProfile(newProfile);
      }
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        const userDocRef = doc(db, 'users', res.user.uid);
        const snap = await getDoc(userDocRef);
        if (!snap.exists()) {
          const newProfile: UserProfile = {
            uid: res.user.uid,
            email: res.user.email || '',
            fullName: res.user.displayName || 'Google User',
            photoURL: res.user.photoURL || undefined,
            role: 'business_owner',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await setDoc(userDocRef, {
            ...newProfile,
            serverCreatedAt: serverTimestamp(),
          });
          setUserProfile(newProfile);
        }
        await loadBusinessForUser(res.user.uid);
      }
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const signOut = async () => {
    if (isDemoMode) {
      setIsDemoMode(false);
      setUserProfile(null);
      setBusiness(null);
      return;
    }
    await fbSignOut(auth);
    setUser(null);
    setUserProfile(null);
    setBusiness(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        business,
        loading,
        isDemoMode,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        resetPassword,
        signOut,
        refreshBusiness,
        setBusiness,
        enableDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
