import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut, signInAnonymously } from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType } from '../services/firebase';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';

interface UserData {
  displayName?: string;
  username: string;
  age?: number;
  height?: number;
  weight?: number;
  gender?: string;
  photoURL?: string;
  submitTotal: number;
  dateFirstLogin: number;
  dateLastLogin: number;
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  isGuest: boolean;
  logout: () => Promise<void>;
  loginAsGuest: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  const fetchUserData = async (user: User) => {
    if (user.isAnonymous) return;
    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as UserData;
        setUserData(data);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
    }
  };

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setIsGuest(user?.isAnonymous || false);
      setLoading(false); // Set to false immediately so the app doesn't stuck on splash screen

      if (user && !user.isAnonymous) {
        // Use onSnapshot for live updates
        const docRef = doc(db, 'users', user.uid);
        unsubscribeSnapshot = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data() as UserData);
          }
        }, (err) => {
          console.error("Failed to fetch user data:", err);
          // handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
        });
      } else {
        if (unsubscribeSnapshot) unsubscribeSnapshot();
        setUserData(null);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const loginAsGuest = async () => {
    setLoading(true);
    try {
      await signInAnonymously(auth);
      setIsGuest(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setIsGuest(false);
      setUserData(null);
    } catch (err) {
      console.error(err);
    }
  };

  const refreshUserData = async () => {
    if (currentUser && !currentUser.isAnonymous) {
      await fetchUserData(currentUser);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, userData, loading, isGuest, logout, loginAsGuest, refreshUserData }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
