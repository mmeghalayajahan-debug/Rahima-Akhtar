/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from './lib/firebase';
import { doc, getDoc, getDocFromServer } from 'firebase/firestore';
import { useState, useEffect, createContext, useContext } from 'react';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import CourseDetails from './pages/CourseDetails';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Types
interface UserProfile {
  uid: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  role: 'student' | 'admin';
}

interface AuthContextType {
  user: any;
  profile: UserProfile | null;
  loading: boolean;
  siteSettings: {
    logoUrl: string;
    siteName: string;
  };
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  profile: null, 
  loading: true,
  siteSettings: {
    logoUrl: '',
    siteName: 'আল হেরা রহিমা আক্তার অনলাইন মহিলা মাদ্রাসা'
  }
});

export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [user, loadingAuth] = useAuthState(auth);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [siteSettings, setSiteSettings] = useState({
    logoUrl: '',
    siteName: 'আল হেরা রহিমা আক্তার অনলাইন মহিলা মাদ্রাসা'
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'site'));
        if (settingsDoc.exists()) {
          setSiteSettings(settingsDoc.data() as any);
        }
      } catch (error) {
        console.error("Error fetching site settings:", error);
      }
    }
    fetchSettings();
  }, []);

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        console.log("Firestore connection successful");
      } catch (error: any) {
        console.error("Firestore connection test failed:", error.message);
      }
    }
    testConnection();
  }, []);

  useEffect(() => {
    async function fetchProfile() {
      if (user) {
        const path = `users/${user.uid}`;
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            console.log("No profile found for user:", user.uid);
          }
        } catch (error: any) {
          handleFirestoreError(error, OperationType.GET, path);
        }
      } else {
        setProfile(null);
      }
      setLoadingProfile(false);
    }
    fetchProfile();
  }, [user]);

  const loading = loadingAuth || loadingProfile;
  const isAdmin = profile?.role === 'admin' || user?.email?.toLowerCase() === "mmeghalayajahan@gmail.com".toLowerCase();

  return (
    <AuthContext.Provider value={{ user, profile, loading, siteSettings }}>
      <Router>
        <div className="min-h-screen bg-[#fdfcf8] text-[#1a3a3a] font-sans">
          <Navbar />
          <main className="pt-16 min-h-[calc(100vh-64px)]">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route 
                path="/dashboard" 
                element={user ? <Dashboard /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/admin" 
                element={isAdmin ? <AdminDashboard /> : <Navigate to="/" />} 
              />
              <Route path="/course/:id" element={<CourseDetails />} />
            </Routes>
          </main>
          <Footer />
          <Toaster position="top-center" />
        </div>
      </Router>
    </AuthContext.Provider>
  );
}
