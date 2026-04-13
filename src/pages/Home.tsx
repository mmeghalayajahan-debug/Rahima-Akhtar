import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Book, Heart, Star, Users, ArrowRight, PlayCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function Home() {
  const categories = [
    { title: 'কুরআন শিক্ষা', icon: <Book className="w-8 h-8" />, desc: 'সহীহভাবে কুরআন তিলাওয়াত ও তাজবিদ শিক্ষা।' },
    { title: 'নামাজ শিক্ষা', icon: <PlayCircle className="w-8 h-8" />, desc: 'নামাজের সঠিক নিয়ম ও প্রয়োজনীয় মাসআলা।' },
    { title: 'হাদিস শিক্ষা', icon: <Heart className="w-8 h-8" />, desc: 'দৈনন্দিন জীবনের জন্য প্রয়োজনীয় হাদিসসমূহ।' },
    { title: 'দোয়া ও জিকির', icon: <Star className="w-8 h-8" />, desc: 'মাসনুন দোয়া ও জিকিরের আমলসমূহ।' },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-[#1a3a3a]">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/islamic-art.png')]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
                ঘরে বসেই শিখুন <span className="text-[#c5a059]">ইসলামী শিক্ষা</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                আল হেরা রহিমা আক্তার অনলাইন মহিলা মাদ্রাসা - নারীদের জন্য একটি নিরাপদ ও আধুনিক প্ল্যাটফর্ম। কুরআন, হাদিস ও শরীয়াহর সঠিক জ্ঞান অর্জন করুন অভিজ্ঞ শিক্ষিকাদের তত্ত্বাবধানে।
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/login">
                  <Button size="lg" className="bg-[#c5a059] hover:bg-[#b08d4a] text-white px-8 py-6 text-lg">
                    ভর্তি হোন
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg"
                  onClick={() => document.getElementById('courses-section')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  কোর্সসমূহ দেখুন
                </Button>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative hidden lg:block"
            >
              <div className="w-full aspect-square bg-[#c5a059]/20 rounded-full absolute -top-10 -right-10 blur-3xl"></div>
              <img 
                src="https://picsum.photos/seed/islamic/800/800" 
                alt="Islamic Education" 
                className="rounded-3xl shadow-2xl relative z-10 border-4 border-[#c5a059]/30"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b border-[#c5a059]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-[#2d5a27] mb-1">৫০০+</div>
              <div className="text-sm text-gray-500">সক্রিয় শিক্ষার্থী</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#2d5a27] mb-1">২০+</div>
              <div className="text-sm text-gray-500">অভিজ্ঞ শিক্ষিকা</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#2d5a27] mb-1">১৫+</div>
              <div className="text-sm text-gray-500">অনলাইন কোর্স</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#2d5a27] mb-1">১০০%</div>
              <div className="text-sm text-gray-500">নিরাপদ পরিবেশ</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="courses-section" className="py-20 bg-[#fdfcf8] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a3a3a] mb-4">আমাদের কোর্স ক্যাটাগরি</h2>
            <div className="w-24 h-1 bg-[#c5a059] mx-auto mb-8"></div>
            
            {/* Search Box */}
            <div className="max-w-md mx-auto relative">
              <input 
                type="text" 
                placeholder="কোর্স খুঁজুন..." 
                className="w-full px-6 py-4 rounded-full border-2 border-[#c5a059]/20 focus:border-[#c5a059] outline-none shadow-sm transition-all"
              />
              <Button className="absolute right-2 top-2 bg-[#2d5a27] hover:bg-[#1a3a3a] rounded-full px-6">
                খুঁজুন
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((cat, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10 }}
                className="h-full"
              >
                <Card className="h-full border-[#c5a059]/20 hover:shadow-xl transition-shadow bg-white">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-[#2d5a27]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#2d5a27]">
                      {cat.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-[#1a3a3a]">{cat.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {cat.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <img 
                src="https://picsum.photos/seed/learning/600/400" 
                alt="Learning" 
                className="rounded-2xl shadow-lg"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-bold text-[#1a3a3a] mb-6">কেন আমাদের মাদ্রাসায় ভর্তি হবেন?</h2>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#2d5a27] rounded-full flex items-center justify-center mt-1">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1a3a3a]">সম্পূর্ণ পর্দা ও নিরাপত্তা</h4>
                    <p className="text-gray-600">শুধুমাত্র নারী ও মেয়েদের জন্য বিশেষায়িত অনলাইন পরিবেশ।</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#2d5a27] rounded-full flex items-center justify-center mt-1">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1a3a3a]">লাইভ ও রেকর্ড ক্লাস</h4>
                    <p className="text-gray-600">লাইভ ক্লাসের পাশাপাশি মিস করা ক্লাসের ভিডিও দেখার সুবিধা।</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#2d5a27] rounded-full flex items-center justify-center mt-1">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1a3a3a]">সার্টিফিকেট প্রদান</h4>
                    <p className="text-gray-600">কোর্স শেষে সফল শিক্ষার্থীদের জন্য আকর্ষণীয় সার্টিফিকেট।</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 bg-[#fdfcf8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a3a3a] mb-4">শিক্ষার্থীদের মতামত</h2>
            <div className="w-24 h-1 bg-[#c5a059] mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'ফাতেমা আক্তার', text: 'এই মাদ্রাসায় ভর্তি হয়ে আমি খুব সহজে কুরআন শিখতে পারছি। আলহামদুলিল্লাহ।' },
              { name: 'আয়েশা সিদ্দিকা', text: 'শিক্ষিকাদের পড়ানোর ধরণ অনেক সুন্দর এবং সহজবোধ্য।' },
              { name: 'মারিয়া জান্নাত', text: 'ঘরে বসেই দ্বীনি শিক্ষা অর্জনের জন্য এটি একটি সেরা প্ল্যাটফর্ম।' },
            ].map((review, idx) => (
              <Card key={idx} className="border-[#c5a059]/10 bg-white">
                <CardContent className="p-8">
                  <div className="flex gap-1 mb-4 text-[#c5a059]">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                  </div>
                  <p className="text-gray-600 italic mb-6">"{review.text}"</p>
                  <div className="font-bold text-[#1a3a3a]">- {review.name}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#2d5a27]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">আজই আপনার দ্বীনি শিক্ষার যাত্রা শুরু করুন</h2>
          <Link to="/login">
            <Button size="lg" className="bg-white text-[#2d5a27] hover:bg-gray-100 px-12 py-8 text-xl font-bold rounded-full">
              রেজিস্ট্রেশন করুন
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
