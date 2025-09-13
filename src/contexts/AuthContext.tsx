import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, COLLECTIONS, UserData } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  profileType: 'personal' | 'business';
  setProfileType: (type: 'personal' | 'business') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileType, setProfileType] = useState<'personal' | 'business'>(() => {
    // Initialize from localStorage if available
    const saved = localStorage.getItem('profileType');
    return (saved === 'business') ? 'business' : 'personal';
  });

  // Save profile type to localStorage when it changes
  const updateProfileType = (type: 'personal' | 'business') => {
    setProfileType(type);
    localStorage.setItem('profileType', type);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Fetch or create user document
        const userRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          // Create new user document with username = email
          const emailLower = (firebaseUser.email || '').toLowerCase();
          const newUserData: UserData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: firebaseUser.displayName || '',
            username: emailLower,
            photoURL: firebaseUser.photoURL || '',
            createdAt: serverTimestamp() as any,
          };
          
          await setDoc(userRef, newUserData);
          // Map username -> uid for lookups
          await setDoc(doc(db, COLLECTIONS.USERS_BY_USERNAME, emailLower), { uid: firebaseUser.uid });
          setUserData(newUserData);
        } else {
          const existing = userDoc.data() as UserData;
          if (!existing.username && firebaseUser.email) {
            const emailLower = firebaseUser.email.toLowerCase();
            await setDoc(userRef, { username: emailLower }, { merge: true });
            await setDoc(doc(db, COLLECTIONS.USERS_BY_USERNAME, emailLower), { uid: firebaseUser.uid });
            setUserData({ ...existing, username: emailLower });
          } else {
            setUserData(existing);
          }
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Update theme based on profile type
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', profileType);
  }, [profileType]);

  const value = {
    user,
    userData,
    loading,
    profileType,
    setProfileType: updateProfileType,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};