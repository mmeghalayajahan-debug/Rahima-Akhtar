import { MessageCircle, Phone, Mail, MapPin, Facebook } from 'lucide-react';
import { useAuth } from '../App';

export default function Footer() {
  const { siteSettings } = useAuth();
  return (
    <footer className="bg-[#1a3a3a] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4 text-[#c5a059]">{siteSettings.siteName}</h3>
            <p className="text-gray-300 mb-6 max-w-md">
              আমাদের লক্ষ্য হলো নারীদের জন্য একটি নিরাপদ এবং সহজ অনলাইন প্ল্যাটফর্ম তৈরি করা যেখানে তারা ঘরে বসেই ইসলামের সঠিক শিক্ষা গ্রহণ করতে পারে।
            </p>
            <div className="flex gap-4">
              <a 
                href="https://wa.me/8801721003234" 
                target="_blank" 
                rel="noreferrer"
                className="bg-[#25D366] p-3 rounded-full hover:scale-110 transition-transform"
              >
                <MessageCircle className="w-6 h-6" />
              </a>
              <a 
                href="https://www.facebook.com/profile.php?id=61569740871872" 
                target="_blank" 
                rel="noreferrer"
                className="bg-[#1877F2] p-3 rounded-full hover:scale-110 transition-transform"
              >
                <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-[#c5a059]">যোগাযোগ</h4>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#c5a059]" />
                <span>+৮৮০ ১৭২১-০০৩২৩৪</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#c5a059]" />
                <span>info@alhera.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#c5a059]" />
                <span>ঢাকা, বাংলাদেশ</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-[#c5a059]">লিঙ্ক</h4>
            <ul className="space-y-3 text-gray-300">
              <li><a href="#" className="hover:text-[#c5a059] transition-colors">আমাদের সম্পর্কে</a></li>
              <li><a href="#" className="hover:text-[#c5a059] transition-colors">কোর্সসমূহ</a></li>
              <li><a href="#" className="hover:text-[#c5a059] transition-colors">শর্তাবলী</a></li>
              <li><a href="#" className="hover:text-[#c5a059] transition-colors">গোপনীয়তা নীতি</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} {siteSettings.siteName}। সর্বস্বত্ব সংরক্ষিত।</p>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-50 items-end">
        {/* Call Button */}
        <a 
          href="tel:+8801721003234" 
          className="bg-[#2d5a27] text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center gap-2"
        >
          <Phone className="w-6 h-6" />
          <span className="hidden md:inline font-medium">কল করুন</span>
        </a>

        {/* Facebook Button */}
        <a 
          href="https://www.facebook.com/profile.php?id=61569740871872" 
          target="_blank" 
          rel="noreferrer"
          className="bg-[#1877F2] text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center gap-2"
        >
          <Facebook className="w-6 h-6" />
          <span className="hidden md:inline font-medium">ফেসবুক পেজ</span>
        </a>

        {/* WhatsApp Button */}
        <a 
          href="https://wa.me/8801721003234" 
          target="_blank" 
          rel="noreferrer"
          className="bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center gap-2"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="hidden md:inline font-medium">হোয়াটসঅ্যাপ</span>
        </a>
      </div>
    </footer>
  );
}
