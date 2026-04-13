import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import { auth } from '../lib/firebase';
import { Button } from '@/components/ui/button';
import { LogOut, User, Menu, X, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const { user, profile, siteSettings } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const isAdmin = profile?.role === 'admin' || user?.email?.toLowerCase() === "mmeghalayajahan@gmail.com".toLowerCase();

  const handleLogout = () => auth.signOut();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-[#c5a059]/20 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            {siteSettings.logoUrl ? (
              <div className="w-10 h-10 rounded-full overflow-hidden border border-[#c5a059]/20 flex items-center justify-center bg-white">
                <img src={siteSettings.logoUrl} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
            ) : (
              <div className="w-10 h-10 bg-[#2d5a27] rounded-full flex items-center justify-center">
                <BookOpen className="text-[#c5a059] w-6 h-6" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[#1a3a3a] leading-tight hidden sm:block">
                {siteSettings.siteName.split(' ').slice(0, 3).join(' ')}
              </span>
              <span className="text-xs text-[#c5a059] font-medium hidden sm:block">
                {siteSettings.siteName.split(' ').slice(3).join(' ')}
              </span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium hover:text-[#2d5a27] transition-colors">হোম</Link>
            {user && (
              <Link to="/dashboard" className="text-sm font-medium hover:text-[#2d5a27] transition-colors">ড্যাশবোর্ড</Link>
            )}
            {isAdmin && (
              <Link to="/admin">
                <Button variant="outline" size="sm" className="border-[#c5a059] text-[#c5a059] font-bold hover:bg-[#c5a059] hover:text-white">
                  এডমিন প্যানেল
                </Button>
              </Link>
            )}
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-medium text-[#2d5a27]">
                  <User className="w-4 h-4" />
                  <span>{profile?.name || user.displayName}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  <LogOut className="w-4 h-4 mr-2" />
                  লগআউট
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button className="bg-[#2d5a27] hover:bg-[#1a3a3a] text-white">লগইন / রেজিস্ট্রেশন</Button>
              </Link>
            )}
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-[#c5a059]/20 overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-4">
              <Link to="/" onClick={() => setIsOpen(false)} className="text-sm font-medium">হোম</Link>
              {user && (
                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-sm font-medium">ড্যাশবোর্ড</Link>
              )}
              {isAdmin && (
                <Link to="/admin" onClick={() => setIsOpen(false)} className="text-sm font-medium text-[#c5a059] font-bold">এডমিন প্যানেল</Link>
              )}
              {user ? (
                <Button variant="ghost" onClick={handleLogout} className="justify-start text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  লগআউট
                </Button>
              ) : (
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-[#2d5a27]">লগইন / রেজিস্ট্রেশন</Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
