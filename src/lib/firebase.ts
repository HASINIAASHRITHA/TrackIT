import { initializeApp, setLogLevel } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  runTransaction,
  enableIndexedDbPersistence,
  QuerySnapshot,
  DocumentData,
  Timestamp
} from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA1vACOCfijpwnbqIwlbV0arOIgLPhBER8",
  authDomain: "expenses-manager-a5726.firebaseapp.com",
  projectId: "expenses-manager-a5726",
  storageBucket: "expenses-manager-a5726.firebasestorage.app",
  messagingSenderId: "687095235947",
  appId: "1:687095235947:web:2f61dea5c8cd564032782e",
  measurementId: "G-WSML34P9PK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Reduce Firebase SDK console noise during expected auth failures
// See: https://firebase.google.com/docs/reference/js/app.md#setloglevel
setLogLevel('error');

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Enable offline persistence (updated method)
try {
  enableIndexedDbPersistence(db);
} catch (err: any) {
  if (err.code === 'failed-precondition') {
    console.warn('Persistence failed: Multiple tabs open');
  } else if (err.code === 'unimplemented') {
    console.warn('Persistence not available');
  }
}

// Firestore collections
export const COLLECTIONS = {
  USERS: 'users',
  USERS_BY_USERNAME: 'users_by_username',
  PROFILES: 'profiles',
  TRANSACTIONS: 'transactions',
  CATEGORIES: 'categories',
  COLLABORATORS: 'collaborators',
  ACTIVITY_LOGS: 'activity_logs'
} as const;

// Types
export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  username?: string;
  photoURL?: string;
  createdAt: Timestamp;
  roles?: {
    admin?: boolean;
  };
}

export interface Profile {
  profileId: 'personal' | 'business';
  name: string;
  currency: string;
  createdAt: Timestamp;
  settings?: Record<string, any>;
}

export interface Transaction {
  id?: string;
  amount: number;
  currency: string;
  type: 'expense' | 'income';
  categoryId: string;
  description: string;
  date: Timestamp;
  createdBy: string;
  attachments?: Array<{
    url: string;
    public_id?: string;
    provider: 'cloudinary';
  }>;
  metadata?: {
    tags?: string[];
    project?: string;
    client?: string;
  };
}

export interface Category {
  id?: string;
  title: string;
  color: string;
  icon: string;
  budgetMonthly?: number;
  type?: 'expense' | 'income';
}

export interface Collaborator {
  uid: string;
  role: 'viewer' | 'editor' | 'admin';
  invitedBy: string;
  invitedAt: Timestamp;
  active: boolean;
}

// Auth functions with enhanced error handling
export const signUp = async (email: string, password: string, displayName: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    return userCredential;
  } catch (error: any) {
    // auth error handled (no console noise)
    // Convert Firebase errors to user-friendly messages
    switch (error.code) {
      case 'auth/email-already-in-use':
        throw new Error('An account with this email already exists');
      case 'auth/invalid-email':
        throw new Error('Please enter a valid email address');
      case 'auth/weak-password':
        throw new Error('Password should be at least 6 characters');
      case 'auth/operation-not-allowed':
        throw new Error('Email/password accounts are not enabled');
      default:
        throw new Error(error.message || 'Failed to create account');
    }
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    // auth error handled (no console noise)
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        throw new Error('Invalid email or password');
      case 'auth/user-disabled':
        throw new Error('This account has been disabled');
      case 'auth/too-many-requests':
        throw new Error('Too many failed attempts. Please try again later');
      case 'auth/operation-not-allowed':
        throw new Error('Email/password accounts are not enabled');
      default:
        throw new Error(error.message || 'Failed to sign in');
    }
  }
};

export const signInWithGoogle = async () => {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    // auth error handled (no console noise)
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        throw new Error('Sign in was cancelled');
      case 'auth/popup-blocked':
        throw new Error('Popup was blocked. Please enable popups and try again');
      case 'auth/operation-not-allowed':
        throw new Error('Google sign in is not enabled');
      default:
        throw new Error(error.message || 'Failed to sign in with Google');
    }
  }
};

export const logout = async () => {
  return await signOut(auth);
};

// Username functions
export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  const usernameDoc = await getDoc(doc(db, COLLECTIONS.USERS_BY_USERNAME, username.toLowerCase()));
  return !usernameDoc.exists();
};

export const setUsername = async (uid: string, username: string): Promise<void> => {
  const normalizedUsername = username.toLowerCase();
  
  return await runTransaction(db, async (transaction) => {
    // Check if username is taken
    const usernameDoc = await transaction.get(doc(db, COLLECTIONS.USERS_BY_USERNAME, normalizedUsername));
    
    if (usernameDoc.exists()) {
      throw new Error('Username already taken');
    }
    
    // Set username mapping
    transaction.set(doc(db, COLLECTIONS.USERS_BY_USERNAME, normalizedUsername), { uid });
    
    // Update user document
    transaction.update(doc(db, COLLECTIONS.USERS, uid), { username });
  });
};

// Profile functions
export const createProfile = async (uid: string, profileData: Partial<Profile>) => {
  const profileRef = doc(db, COLLECTIONS.USERS, uid, COLLECTIONS.PROFILES, profileData.profileId!);
  await setDoc(profileRef, {
    ...profileData,
    createdAt: serverTimestamp()
  });
};

export const getProfile = async (uid: string, profileId: string): Promise<Profile | null> => {
  const profileRef = doc(db, COLLECTIONS.USERS, uid, COLLECTIONS.PROFILES, profileId);
  const profileDoc = await getDoc(profileRef);
  if (profileDoc.exists()) {
    return { ...profileDoc.data(), profileId } as Profile;
  }
  return null;
};

// Profile functions
export const createProfileIfNotExists = async (uid: string, profileId: 'personal' | 'business') => {
  const profileRef = doc(db, COLLECTIONS.USERS, uid, COLLECTIONS.PROFILES, profileId);
  const profileDoc = await getDoc(profileRef);
  
  if (!profileDoc.exists()) {
    const profileData: Profile = {
      profileId,
      name: profileId === 'personal' ? 'Personal' : 'Business',
      currency: 'INR',
      createdAt: serverTimestamp() as any,
      settings: {}
    };
    
    console.log(`Creating ${profileId} profile for user ${uid}`);
    await setDoc(profileRef, profileData);
  }
};

// Transaction functions
export const addTransaction = async (uid: string, profileId: string, transaction: Omit<Transaction, 'id'>) => {
  try {
    console.log('addTransaction called with:', { uid, profileId, transaction });
    
    // Ensure profile exists first
    await createProfileIfNotExists(uid, profileId as 'personal' | 'business');
    
    const transactionsRef = collection(db, COLLECTIONS.USERS, uid, COLLECTIONS.PROFILES, profileId, COLLECTIONS.TRANSACTIONS);
    console.log('Collection path:', `${COLLECTIONS.USERS}/${uid}/${COLLECTIONS.PROFILES}/${profileId}/${COLLECTIONS.TRANSACTIONS}`);
    const newDocRef = doc(transactionsRef);
    const transactionData = {
      ...transaction,
      date: serverTimestamp(),
      createdBy: uid
    };
    console.log('Final transaction data:', transactionData);
    return await setDoc(newDocRef, transactionData);
  } catch (error) {
    console.error('addTransaction error:', error);
    throw error;
  }
};

// Category functions
export const addCategory = async (uid: string, profileId: string, category: Omit<Category, 'id'>) => {
  // Ensure profile exists first
  await createProfileIfNotExists(uid, profileId as 'personal' | 'business');
  
  const categoriesRef = collection(db, COLLECTIONS.USERS, uid, COLLECTIONS.PROFILES, profileId, COLLECTIONS.CATEGORIES);
  const newDocRef = doc(categoriesRef);
  return await setDoc(newDocRef, category);
};

export const updateCategory = async (uid: string, profileId: string, categoryId: string, updates: Partial<Category>) => {
  const categoryRef = doc(db, COLLECTIONS.USERS, uid, COLLECTIONS.PROFILES, profileId, COLLECTIONS.CATEGORIES, categoryId);
  return await updateDoc(categoryRef, updates);
};

export const deleteCategory = async (uid: string, profileId: string, categoryId: string) => {
  const categoryRef = doc(db, COLLECTIONS.USERS, uid, COLLECTIONS.PROFILES, profileId, COLLECTIONS.CATEGORIES, categoryId);
  return await deleteDoc(categoryRef);
};

// Collaborator functions
export const addCollaborator = async (
  ownerUid: string,
  profileId: string,
  collaboratorUid: string,
  role: Collaborator['role']
) => {
  const collaboratorRef = doc(
    db,
    COLLECTIONS.USERS,
    ownerUid,
    COLLECTIONS.PROFILES,
    profileId,
    COLLECTIONS.COLLABORATORS,
    collaboratorUid
  );
  
  return await setDoc(collaboratorRef, {
    uid: collaboratorUid,
    role,
    invitedBy: ownerUid,
    invitedAt: serverTimestamp(),
    active: true
  });
};

export const getUserByUsername = async (username: string): Promise<string | null> => {
  const usernameDoc = await getDoc(doc(db, COLLECTIONS.USERS_BY_USERNAME, username.toLowerCase()));
  if (usernameDoc.exists()) {
    return usernameDoc.data().uid;
  }
  return null;
};