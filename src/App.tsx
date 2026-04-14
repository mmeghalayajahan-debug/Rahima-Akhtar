/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
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
      const path = 'settings/site';
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'site'));
        if (settingsDoc.exists()) {
          setSiteSettings(settingsDoc.data() as any);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, path);
      }
    }
    fetchSettings();
  }, []);

  useEffect(() => {
    async function testConnection() {
      const path = 'test/connection';
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        console.log("Firestore connection successful");
      } catch (error: any) {
        handleFirestoreError(error, OperationType.GET, path);
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
