import { useAuth } from '../App';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Book, Play, CheckCircle, Clock, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

interface Course {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  description: string;
}

interface Enrollment {
  courseId: string;
  progress: number;
  completed: boolean;
}

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<(Course & Enrollment)[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Listen for all courses
    const coursesUnsub = onSnapshot(collection(db, 'courses'), (snapshot) => {
      const allCourses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
      
      // Listen for user enrollments
      const enrollmentsQuery = query(collection(db, 'enrollments'), where('userId', '==', user.uid));
      const enrollUnsub = onSnapshot(enrollmentsQuery, (enrollSnap) => {
        const enrollments = enrollSnap.docs.map(doc => doc.data() as Enrollment);
        const enrolledIds = enrollments.map(e => e.courseId);

        const enrolled = allCourses
          .filter(c => enrolledIds.includes(c.id))
          .map(c => ({
            ...c,
            ...enrollments.find(e => e.courseId === c.id)!
          }));

        const available = allCourses.filter(c => !enrolledIds.includes(c.id));

        setEnrolledCourses(enrolled);
        setAvailableCourses(available);
        setLoading(false);
      }, (error) => {
        console.error("Enrollment listener error:", error);
        setLoading(false);
      });

      return () => enrollUnsub();
    }, (error) => {
      console.error("Courses listener error:", error);
      setLoading(false);
    });

    return () => coursesUnsub();
  }, [user]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5a27]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-[#1a3a3a] mb-2">আসসালামু আলাইকুম, {profile?.name}!</h1>
        <p className="text-gray-600">আপনার আজকের দ্বীনি শিক্ষার অগ্রগতি দেখে নিন।</p>
      </div>

      {/* Live Classes & Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        <Card className="border-[#c5a059]/20 bg-[#2d5a27]/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="text-[#2d5a27]" />
              লাইভ ক্লাস (Live Class)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-6 rounded-xl border border-[#c5a059]/10">
              <p className="text-sm text-gray-600 mb-4">পরবর্তী লাইভ ক্লাস শুরু হবে:</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-lg text-[#1a3a3a]">তাজবিদ ও মাখরাজ</p>
                  <p className="text-sm text-[#c5a059]">আজ রাত ৮:০০ টায়</p>
                </div>
                <Button className="bg-[#2d5a27]">জয়েন করুন (Zoom)</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#c5a059]/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="text-[#c5a059]" />
              অ্যাসাইনমেন্ট ও পরীক্ষা
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border-b border-gray-50">
                <span className="text-sm font-medium">কুরআন তিলাওয়াত পরীক্ষা</span>
                <Badge variant="outline" className="text-yellow-600 border-yellow-200">চলমান</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border-b border-gray-50">
                <span className="text-sm font-medium">হাদিস মুখস্থ কুইজ</span>
                <Badge variant="outline" className="text-green-600 border-green-200">সম্পন্ন</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enrolled Courses */}
      <section className="mb-16">
        <div className="flex items-center gap-2 mb-6">
          <Book className="text-[#2d5a27] w-6 h-6" />
          <h2 className="text-2xl font-bold text-[#1a3a3a]">আমার কোর্সসমূহ</h2>
        </div>
        
        {enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {enrolledCourses.map((course) => (
              <motion.div key={course.id} whileHover={{ scale: 1.02 }}>
                <Card className="overflow-hidden border-[#c5a059]/20">
                  <img src={course.thumbnail} alt={course.title} className="w-full h-48 object-cover" referrerPolicy="no-referrer" />
                  <CardContent className="p-6">
                    <Badge className="mb-2 bg-[#2d5a27]/10 text-[#2d5a27] hover:bg-[#2d5a27]/10">{course.category}</Badge>
                    <h3 className="text-xl font-bold mb-4 text-[#1a3a3a] line-clamp-1">{course.title}</h3>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">অগ্রগতি</span>
                        <span className="font-bold text-[#2d5a27]">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div 
                          className="bg-[#2d5a27] h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                      
                      <Link to={`/course/${course.id}`}>
                        <Button className="w-full bg-[#2d5a27] hover:bg-[#1a3a3a]">
                          <Play className="w-4 h-4 mr-2" />
                          ক্লাস শুরু করুন
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
            <p className="text-gray-500 mb-6">আপনি এখনো কোনো কোর্সে ভর্তি হননি।</p>
            <Button 
              variant="outline" 
              className="border-[#2d5a27] text-[#2d5a27]"
              onClick={() => document.getElementById('available-courses')?.scrollIntoView({ behavior: 'smooth' })}
            >
              নতুন কোর্স দেখুন
            </Button>
          </div>
        )}
      </section>

      {/* Available Courses */}
      <section id="available-courses" className="scroll-mt-20">
        <div className="flex items-center gap-2 mb-6">
          <Play className="text-[#c5a059] w-6 h-6" />
          <h2 className="text-2xl font-bold text-[#1a3a3a]">নতুন কোর্সসমূহ</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {availableCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden border-[#c5a059]/10">
              <img src={course.thumbnail} alt={course.title} className="w-full h-48 object-cover opacity-80" referrerPolicy="no-referrer" />
              <CardContent className="p-6">
                <Badge className="mb-2 bg-[#c5a059]/10 text-[#c5a059] hover:bg-[#c5a059]/10">{course.category}</Badge>
                <h3 className="text-xl font-bold mb-2 text-[#1a3a3a]">{course.title}</h3>
                <p className="text-gray-600 text-sm mb-6 line-clamp-2">{course.description}</p>
                <Link to={`/course/${course.id}`}>
                  <Button variant="outline" className="w-full border-[#c5a059] text-[#c5a059] hover:bg-[#c5a059]/10">
                    বিস্তারিত দেখুন
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
