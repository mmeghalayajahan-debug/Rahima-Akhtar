import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../App';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, CheckCircle, Lock, ArrowLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

interface Module {
  title: string;
  videoUrl: string;
  duration: string;
}

interface Course {
  id: string;
  title: string;
  category: string;
  description: string;
  thumbnail: string;
  modules: Module[];
}

export default function CourseDetails() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [currentModuleIdx, setCurrentModuleIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      
      const courseDoc = await getDoc(doc(db, 'courses', id));
      if (courseDoc.exists()) {
        setCourse({ id: courseDoc.id, ...courseDoc.data() } as Course);
      }

      if (user) {
        const enrollQuery = query(
          collection(db, 'enrollments'), 
          where('userId', '==', user.uid),
          where('courseId', '==', id)
        );
        const enrollSnap = await getDocs(enrollQuery);
        setIsEnrolled(!enrollSnap.empty);
      }
      setLoading(false);
    }
    fetchData();
  }, [id, user]);

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setEnrolling(true);
    try {
      const enrollmentId = `${user.uid}_${id}`;
      await setDoc(doc(db, 'enrollments', enrollmentId), {
        userId: user.uid,
        courseId: id,
        progress: 0,
        completed: false,
        lastAccessed: serverTimestamp(),
      });
      setIsEnrolled(true);
      toast.success("আপনি সফলভাবে কোর্সে ভর্তি হয়েছেন!");
    } catch (error) {
      console.error("Enrollment error:", error);
      toast.error("ভর্তি হতে সমস্যা হয়েছে।");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <div className="p-20 text-center">লোড হচ্ছে...</div>;
  if (!course) return <div className="p-20 text-center">কোর্সটি পাওয়া যায়নি।</div>;

  const currentModule = course.modules[currentModuleIdx];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-8">
        <ArrowLeft className="w-4 h-4 mr-2" /> ফিরে যান
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {isEnrolled && currentModule ? (
            <div className="space-y-6">
              <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative group">
                {/* Mock Video Player - In real app, use a secure player */}
                <div className="absolute inset-0 flex items-center justify-center text-white/50">
                  <div className="text-center">
                    <Play className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-sm">ভিডিও প্লেয়ার লোড হচ্ছে...</p>
                    <p className="text-xs mt-2 text-red-400">সুরক্ষার স্বার্থে ভিডিও ডাউনলোড বা শেয়ার করা নিষেধ।</p>
                  </div>
                </div>
                {/* Overlay for protection */}
                <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center opacity-10">
                  <span className="text-4xl font-bold rotate-45">{user?.email}</span>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#1a3a3a] mb-2">{currentModule.title}</h2>
                <p className="text-gray-600">লেসন {currentModuleIdx + 1} / {course.modules.length}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <img src={course.thumbnail} alt={course.title} className="w-full aspect-video object-cover rounded-2xl shadow-lg" referrerPolicy="no-referrer" />
              <div className="flex items-center gap-3">
                <Badge className="bg-[#2d5a27] text-white">{course.category}</Badge>
                <span className="text-sm text-gray-500">{course.modules.length} টি লেসন</span>
              </div>
              <h1 className="text-4xl font-bold text-[#1a3a3a]">{course.title}</h1>
              <p className="text-lg text-gray-600 leading-relaxed">{course.description}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {!isEnrolled ? (
            <Card className="border-[#c5a059]/20 shadow-lg sticky top-24">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-bold mb-4">এই কোর্সে ভর্তি হোন</h3>
                <p className="text-gray-600 mb-8 text-sm">কোর্সের সকল ভিডিও ও লেসন দেখতে এখনই ভর্তি বাটনে ক্লিক করুন।</p>
                <Button 
                  onClick={handleEnroll} 
                  disabled={enrolling}
                  className="w-full bg-[#2d5a27] hover:bg-[#1a3a3a] py-6 text-lg font-bold"
                >
                  {enrolling ? 'প্রসেসিং...' : 'ভর্তি হোন (ফ্রি)'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-[#c5a059]/20 shadow-lg sticky top-24">
              <CardContent className="p-0">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="font-bold text-[#1a3a3a]">কোর্স কারিকুলাম</h3>
                </div>
                <div className="max-h-[500px] overflow-y-auto">
                  {course.modules.length > 0 ? (
                    course.modules.map((m, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentModuleIdx(idx)}
                        className={`w-full p-4 flex items-center gap-4 text-left transition-colors border-b border-gray-50 ${
                          currentModuleIdx === idx ? 'bg-[#2d5a27]/5 border-l-4 border-l-[#2d5a27]' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          currentModuleIdx === idx ? 'bg-[#2d5a27] text-white' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${currentModuleIdx === idx ? 'text-[#2d5a27]' : 'text-gray-700'}`}>
                            {m.title}
                          </p>
                          <p className="text-xs text-gray-400">{m.duration}</p>
                        </div>
                        {currentModuleIdx > idx && <CheckCircle className="w-4 h-4 text-green-500" />}
                      </button>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-400 text-sm italic">
                      কোনো লেসন পাওয়া যায়নি।
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-[#fdfcf8] border-[#c5a059]/10">
            <CardContent className="p-6">
              <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-[#c5a059]">সহায়তা প্রয়োজন?</h4>
              <p className="text-xs text-gray-500 mb-4">কোর্স সংক্রান্ত কোনো প্রশ্ন থাকলে আমাদের হোয়াটসঅ্যাপে যোগাযোগ করুন।</p>
              <div className="space-y-3">
                <a 
                  href="https://wa.me/8801721003234" 
                  target="_blank" 
                  rel="noreferrer"
                  className={cn(buttonVariants({ variant: "outline" }), "w-full border-[#25D366] text-[#25D366] hover:bg-[#25D366]/5")}
                >
                  হোয়াটসঅ্যাপ চ্যাট
                </a>
                <a 
                  href="https://www.facebook.com/profile.php?id=61569740871872" 
                  target="_blank" 
                  rel="noreferrer"
                  className={cn(buttonVariants({ variant: "outline" }), "w-full border-[#1877F2] text-[#1877F2] hover:bg-[#1877F2]/5")}
                >
                  ফেসবুক পেজ
                </a>
                <a 
                  href="tel:+8801721003234"
                  className={cn(buttonVariants({ variant: "outline" }), "w-full border-[#2d5a27] text-[#2d5a27] hover:bg-[#2d5a27]/5")}
                >
                  সরাসরি কল করুন
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
