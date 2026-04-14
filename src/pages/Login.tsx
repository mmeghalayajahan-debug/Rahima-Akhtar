import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, LogIn, UserPlus, Phone } from 'lucide-react';
import { toast } from 'sonner';
import React, { useState } from 'react';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [showOTP, setShowOTP] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');

  const setupRecaptcha = () => {
    if ((window as any).recaptchaVerifier) return (window as any).recaptchaVerifier;
    
    const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'invisible',
      'callback': () => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
      }
    });
    (window as any).recaptchaVerifier = verifier;
    return verifier;
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      toast.error("ফোন নাম্বার প্রদান করুন।");
      return;
    }

    setLoading(true);
    try {
      const appVerifier = setupRecaptcha();
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+88${phoneNumber}`;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setShowOTP(true);
      toast.success("আপনার ফোনে ওটিপি (OTP) পাঠানো হয়েছে।");
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || !confirmationResult) {
      toast.error("ওটিপি (OTP) প্রদান করুন।");
      return;
    }

    setLoading(true);
    try {
      const result = await confirmationResult.confirm(verificationCode);
      const user = result.user;
      await createUserProfile(user, user.displayName || 'Unnamed Student');
      toast.success("লগইন সফল হয়েছে!");
      navigate('/dashboard');
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    // Force account selection to help with switching accounts
    provider.setCustomParameters({ prompt: 'select_account' });
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await createUserProfile(user, user.displayName || 'Unnamed Student');
      toast.success("লগইন সফল হয়েছে! ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে...");
      
      // Small delay to ensure toast is seen and profile is created
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error: any) {
      console.error("Google Auth error details:", error);
      if (error.code === 'auth/popup-blocked') {
        toast.error("আপনার ব্রাউজার পপ-আপ ব্লক করেছে। দয়া করে পপ-আপ এলাউ করুন অথবা নতুন ট্যাবে অ্যাপটি ওপেন করুন।");
      } else if (error.code === 'auth/cancelled-popup-request') {
        // Ignore this, user just closed the popup
      } else {
        handleAuthError(error);
      }
    } finally {
      setLoading(true); // Keep loading state for a moment to prevent double clicks
      setTimeout(() => setLoading(false), 1000);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("ইমেইল এবং পাসওয়ার্ড প্রদান করুন।");
      return;
    }
    if (isSignUp && !name) {
      toast.error("আপনার নাম প্রদান করুন।");
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: name });
        await createUserProfile(result.user, name);
        toast.success("রেজিস্ট্রেশন সফল হয়েছে!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("লগইন সফল হয়েছে!");
      }
      navigate('/dashboard');
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const createUserProfile = async (user: any, displayName: string) => {
    const path = `users/${user.uid}`;
    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
    
      if (!docSnap.exists()) {
        const isAdmin = user.email?.toLowerCase() === "mmeghalayajahan@gmail.com".toLowerCase();
        await setDoc(docRef, {
          uid: user.uid,
          name: displayName,
          email: user.email || '',
          phoneNumber: user.phoneNumber || '',
          role: isAdmin ? 'admin' : 'student',
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleAuthError = (error: any) => {
    console.error("Auth error:", error);
    if (error.code === 'auth/network-request-failed') {
      toast.error("নেটওয়ার্ক সমস্যা! আপনার ইন্টারনেট কানেকশন চেক করুন অথবা অ্যাড-ব্লকার বন্ধ করে আবার চেষ্টা করুন।");
    } else if (error.code === 'auth/popup-closed-by-user') {
      toast.error("লগইন উইন্ডোটি বন্ধ করে দেওয়া হয়েছে।");
    } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      toast.error("ভুল ইমেইল অথবা পাসওয়ার্ড।");
    } else if (error.code === 'auth/email-already-in-use') {
      toast.error("এই ইমেইলটি ইতিমধ্যে ব্যবহার করা হয়েছে।");
    } else if (error.code === 'auth/weak-password') {
      toast.error("পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।");
    } else if (error.code === 'auth/invalid-phone-number') {
      toast.error("ভুল ফোন নাম্বার। সঠিক নাম্বার প্রদান করুন।");
    } else if (error.code === 'auth/code-expired') {
      toast.error("ওটিপি (OTP) এর মেয়াদ শেষ হয়ে গেছে। আবার চেষ্টা করুন।");
    } else if (error.code === 'auth/invalid-verification-code') {
      toast.error("ভুল ওটিপি (OTP)। সঠিক কোড প্রদান করুন।");
    } else {
      toast.error("লগইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-[#fdfcf8] py-12">
      <Card className="w-full max-w-md border-[#c5a059]/20 shadow-xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-[#2d5a27] rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="text-[#c5a059] w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-bold text-[#1a3a3a]">
            {isSignUp ? 'নতুন একাউন্ট তৈরি করুন' : 'স্বাগতম'}
          </CardTitle>
          <CardDescription>
            আল হেরা রহিমা আক্তার অনলাইন মহিলা মাদ্রাসায় আপনার একাউন্টে লগইন করুন
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
            <button 
              onClick={() => { setLoginMethod('email'); setShowOTP(false); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${loginMethod === 'email' ? 'bg-white shadow-sm text-[#2d5a27]' : 'text-gray-500'}`}
            >
              ইমেইল
            </button>
            <button 
              onClick={() => { setLoginMethod('phone'); setShowOTP(false); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${loginMethod === 'phone' ? 'bg-white shadow-sm text-[#2d5a27]' : 'text-gray-500'}`}
            >
              ফোন নাম্বার
            </button>
          </div>

          {loginMethod === 'email' ? (
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name">আপনার নাম</Label>
                  <Input 
                    id="name" 
                    placeholder="পুরো নাম লিখুন" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={isSignUp}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">ইমেইল এড্রেস</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="example@gmail.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">পাসওয়ার্ড</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-[#2d5a27] hover:bg-[#1a3a3a] text-white"
                disabled={loading}
              >
                {loading ? 'অপেক্ষা করুন...' : (isSignUp ? 'রেজিস্ট্রেশন করুন' : 'লগইন করুন')}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              {!showOTP ? (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">ফোন নাম্বার</Label>
                    <div className="flex gap-2">
                      <div className="flex items-center px-3 bg-gray-50 border border-gray-200 rounded-md text-gray-500 text-sm">
                        +88
                      </div>
                      <Input 
                        id="phone" 
                        type="tel" 
                        placeholder="01XXXXXXXXX" 
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  <div id="recaptcha-container"></div>
                  <Button 
                    type="submit" 
                    className="w-full bg-[#2d5a27] hover:bg-[#1a3a3a] text-white"
                    disabled={loading}
                  >
                    {loading ? 'অপেক্ষা করুন...' : 'ওটিপি (OTP) পাঠান'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">ওটিপি (OTP) কোড</Label>
                    <Input 
                      id="otp" 
                      type="text" 
                      placeholder="৬ ডিজিটের কোড লিখুন" 
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      required 
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-[#2d5a27] hover:bg-[#1a3a3a] text-white"
                    disabled={loading}
                  >
                    {loading ? 'অপেক্ষা করুন...' : 'কোড যাচাই করুন'}
                  </Button>
                  <button 
                    type="button"
                    onClick={() => setShowOTP(false)}
                    className="w-full text-sm text-gray-500 hover:underline"
                  >
                    নাম্বার পরিবর্তন করুন
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#fdfcf8] px-2 text-gray-500">অথবা</span>
            </div>
          </div>
          
          <Button 
            onClick={handleGoogleLogin} 
            disabled={loading}
            variant="outline"
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 h-12 flex gap-3 items-center justify-center"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            গুগল দিয়ে লগইন করুন
          </Button>

          <p className="text-[10px] text-center text-gray-400 mt-2">
            * গুগল লগইন কাজ না করলে অ্যাপটি নতুন ট্যাবে ওপেন করে চেষ্টা করুন।
          </p>

          <div className="text-center text-sm">
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[#2d5a27] hover:underline font-medium"
            >
              {isSignUp ? 'ইতিমধ্যে একাউন্ট আছে? লগইন করুন' : 'নতুন একাউন্ট তৈরি করতে চান? রেজিস্ট্রেশন করুন'}
            </button>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-xs text-yellow-800">
            <p className="font-bold mb-1">সতর্কতা:</p>
            <p>এটি শুধুমাত্র নারী ও মেয়েদের জন্য একটি প্ল্যাটফর্ম। অনুগ্রহ করে সঠিক তথ্য প্রদান করুন।</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
