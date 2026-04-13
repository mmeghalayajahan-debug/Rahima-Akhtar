import React, { useState, useEffect } from 'react';
import { db, storage } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Video, Users, BookOpen, Trash2, Settings, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface Course {
  id: string;
  title: string;
  category: string;
  description: string;
  thumbnail: string;
  modules: any[];
}

interface Student {
  uid: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  createdAt: any;
}

export default function AdminDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New Course Form
  const [newCourse, setNewCourse] = useState({
    title: '',
    category: 'Quran learning',
    description: '',
    thumbnail: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Site Settings
  const [siteSettings, setSiteSettings] = useState({
    logoUrl: '',
    siteName: 'আল হেরা রহিমা আক্তার অনলাইন মহিলা মাদ্রাসা'
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [updatingSettings, setUpdatingSettings] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    // Fetch site settings
    const fetchSettings = async () => {
      const settingsDoc = await getDoc(doc(db, 'settings', 'site'));
      if (settingsDoc.exists()) {
        setSiteSettings(settingsDoc.data() as any);
      }
    };
    fetchSettings();

    const q = query(collection(db, 'courses'), orderBy('createdAt', 'desc'));
    const unsubCourses = onSnapshot(q, (snapshot) => {
      setCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course)));
      setLoading(false);
    }, (error) => {
      console.error("Admin courses listener error:", error);
      setLoading(false);
    });

    const studentsQ = query(collection(db, 'users'));
    const unsubStudents = onSnapshot(studentsQ, (snapshot) => {
      const studentData = snapshot.docs.map(doc => doc.data() as Student);
      // Sort in memory to handle missing createdAt safely
      studentData.sort((a, b) => {
        const dateA = a.createdAt?.seconds ? a.createdAt.seconds : 0;
        const dateB = b.createdAt?.seconds ? b.createdAt.seconds : 0;
        return dateB - dateA;
      });
      setStudents(studentData);
    }, (error) => {
      console.error("Admin students listener error:", error);
    });

    return () => {
      unsubCourses();
      unsubStudents();
    };
  }, []);

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      let thumbnailUrl = newCourse.thumbnail;

      if (imageFile) {
        const storageRef = ref(storage, `course-thumbnails/${Date.now()}_${imageFile.name}`);
        const uploadTask = uploadBytesResumable(storageRef, imageFile);
        
        thumbnailUrl = await new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            uploadTask.cancel();
            reject(new Error("আপলোড সময় শেষ হয়ে গেছে (১ মিনিট)। দয়া করে ছোট সাইজের ছবি ব্যবহার করুন অথবা আবার চেষ্টা করুন।"));
          }, 60000);

          uploadTask.on('state_changed', 
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(Math.round(progress));
            }, 
            (error) => {
              clearTimeout(timeoutId);
              reject(error);
            }, 
            async () => {
              clearTimeout(timeoutId);
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(url);
            }
          );
        });
      }

      if (!thumbnailUrl) {
        toast.error("দয়া করে একটি ছবি আপলোড করুন অথবা ইউআরএল দিন।");
        setUploading(false);
        return;
      }

      await addDoc(collection(db, 'courses'), {
        ...newCourse,
        thumbnail: thumbnailUrl,
        modules: [],
        createdAt: serverTimestamp(),
      });
      toast.success("কোর্সটি সফলভাবে যোগ করা হয়েছে!");
      setNewCourse({ title: '', category: 'Quran learning', description: '', thumbnail: '' });
      setImageFile(null);
    } catch (error: any) {
      console.error("Error adding course:", error);
      if (error.code === 'storage/unauthorized') {
        toast.error("ছবি আপলোড করার অনুমতি নেই। দয়া করে লগইন চেক করুন।");
      } else {
        toast.error("কোর্স যোগ করতে সমস্যা হয়েছে: " + (error.message || ""));
      }
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingSettings(true);
    try {
      let logoUrl = siteSettings.logoUrl;

      if (logoFile) {
        const storageRef = ref(storage, `site/logo_${Date.now()}`);
        const uploadTask = uploadBytesResumable(storageRef, logoFile);
        
        logoUrl = await new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            uploadTask.cancel();
            reject(new Error("আপলোড সময় শেষ হয়ে গেছে (১ মিনিট)। দয়া করে ছোট সাইজের ছবি ব্যবহার করুন।"));
          }, 60000);

          uploadTask.on('state_changed', 
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(Math.round(progress));
            }, 
            (error) => {
              clearTimeout(timeoutId);
              reject(error);
            }, 
            async () => {
              clearTimeout(timeoutId);
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(url);
            }
          );
        });
      }

      await setDoc(doc(db, 'settings', 'site'), {
        ...siteSettings,
        logoUrl,
        updatedAt: serverTimestamp(),
      });
      
      setSiteSettings(prev => ({ ...prev, logoUrl }));
      toast.success("সাইট সেটিংস সফলভাবে আপডেট করা হয়েছে!");
      setLogoFile(null);
    } catch (error: any) {
      console.error("Error updating settings:", error);
      if (error.code === 'storage/unauthorized') {
        toast.error("লোগো আপলোড করার অনুমতি নেই।");
      } else {
        toast.error("সেটিংস আপডেট করতে সমস্যা হয়েছে: " + (error.message || ""));
      }
    } finally {
      setUpdatingSettings(false);
    }
  };

  const seedData = async () => {
    const sampleCourses = [
      {
        title: 'সহীহ কুরআন শিক্ষা (তাজবিদসহ)',
        category: 'Quran learning',
        description: 'এই কোর্সে আপনি সহীহভাবে কুরআন তিলাওয়াত ও তাজবিদের নিয়মাবলী শিখতে পারবেন।',
        thumbnail: 'https://picsum.photos/seed/quran/800/450',
        modules: [
          { title: 'তাজবিদের গুরুত্ব ও পরিচয়', videoUrl: 'https://example.com/v1', duration: '১০:০০' },
          { title: 'মাখরাজ পরিচিতি', videoUrl: 'https://example.com/v2', duration: '১৫:০০' },
        ],
        createdAt: serverTimestamp(),
      },
      {
        title: 'দৈনন্দিন জীবনের প্রয়োজনীয় দোয়া',
        category: 'Dua',
        description: 'সকাল-সন্ধ্যা ও বিভিন্ন কাজের শুরুতে ও শেষে পড়ার মাসনুন দোয়া শিখুন।',
        thumbnail: 'https://picsum.photos/seed/dua/800/450',
        modules: [
          { title: 'সকাল-সন্ধ্যার জিকির', videoUrl: 'https://example.com/v3', duration: '০৮:০০' },
        ],
        createdAt: serverTimestamp(),
      }
    ];

    try {
      for (const course of sampleCourses) {
        await addDoc(collection(db, 'courses'), course);
      }
      toast.success("স্যাম্পল ডেটা যোগ করা হয়েছে!");
    } catch (e) {
      toast.error("ডেটা যোগ করতে সমস্যা হয়েছে।");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#1a3a3a] mb-2">এডমিন প্যানেল</h1>
          <p className="text-gray-600">মাদ্রাসার কোর্স ও শিক্ষার্থী পরিচালনা করুন।</p>
        </div>
        <Button variant="outline" onClick={seedData} className="border-[#c5a059] text-[#c5a059]">স্যাম্পল ডেটা যোগ করুন</Button>
      </div>

      <Tabs defaultValue="courses" className="space-y-8">
        <TabsList className="bg-white border border-[#c5a059]/20 p-1">
          <TabsTrigger value="courses" className="data-[state=active]:bg-[#2d5a27] data-[state=active]:text-white">কোর্সসমূহ</TabsTrigger>
          <TabsTrigger value="add" className="data-[state=active]:bg-[#2d5a27] data-[state=active]:text-white">নতুন কোর্স যোগ করুন</TabsTrigger>
          <TabsTrigger value="students" className="data-[state=active]:bg-[#2d5a27] data-[state=active]:text-white">শিক্ষার্থী তালিকা</TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-[#2d5a27] data-[state=active]:text-white">
            <Settings className="w-4 h-4 mr-2" />
            সেটিংস
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map(course => (
              <Card key={course.id} className="overflow-hidden border-[#c5a059]/10">
                <img src={course.thumbnail} alt={course.title} className="w-full h-40 object-cover" referrerPolicy="no-referrer" />
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-2 text-[#1a3a3a]">{course.title}</h3>
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                    <span>{course.category}</span>
                    <span>{course.modules.length} টি লেসন</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 border-[#2d5a27] text-[#2d5a27]">এডিট</Button>
                    <Button variant="destructive" size="sm"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="add">
          <Card className="max-w-2xl border-[#c5a059]/20">
            <CardHeader>
              <CardTitle>নতুন কোর্স তথ্য</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCourse} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">কোর্সের নাম</Label>
                  <Input 
                    id="title" 
                    value={newCourse.title} 
                    onChange={e => setNewCourse({...newCourse, title: e.target.value})}
                    placeholder="যেমন: তাজবিদ শিক্ষা" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">ক্যাটাগরি</Label>
                  <select 
                    id="category"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    value={newCourse.category}
                    onChange={e => setNewCourse({...newCourse, category: e.target.value})}
                  >
                    <option value="Quran learning">কুরআন শিক্ষা</option>
                    <option value="Dua">দোয়া</option>
                    <option value="Namaz">নামাজ শিক্ষা</option>
                    <option value="Hadith">হাদিস</option>
                    <option value="Basic Islam">বেসিক ইসলাম</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">বিস্তারিত বর্ণনা</Label>
                  <textarea 
                    id="desc"
                    className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background text-sm"
                    value={newCourse.description}
                    onChange={e => setNewCourse({...newCourse, description: e.target.value})}
                    placeholder="কোর্স সম্পর্কে বিস্তারিত লিখুন..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thumb">কোর্স থাম্বনেইল (ছবি আপলোড করুন)</Label>
                  <Input 
                    id="image" 
                    type="file"
                    accept="image/*"
                    onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-gray-500">অথবা ছবির ইউআরএল দিন (ঐচ্ছিক):</p>
                  <Input 
                    id="thumb" 
                    value={newCourse.thumbnail}
                    onChange={e => setNewCourse({...newCourse, thumbnail: e.target.value})}
                    placeholder="https://example.com/image.jpg" 
                  />
                </div>
                <Button type="submit" disabled={uploading} className="w-full bg-[#2d5a27] hover:bg-[#1a3a3a]">
                  <Plus className="w-4 h-4 mr-2" />
                  {uploading ? `আপলোড হচ্ছে (${uploadProgress}%)...` : 'কোর্স তৈরি করুন'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students">
          <Card className="border-[#c5a059]/20">
            <CardHeader>
              <CardTitle>শিক্ষার্থী তালিকা ({students.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3">নাম</th>
                      <th className="px-4 py-3">ইমেইল</th>
                      <th className="px-4 py-3">ফোন</th>
                      <th className="px-4 py-3">রোল</th>
                      <th className="px-4 py-3">তারিখ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {students.map((student) => (
                      <tr key={student.uid} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-[#1a3a3a]">{student.name}</td>
                        <td className="px-4 py-3 text-gray-600">{student.email}</td>
                        <td className="px-4 py-3 text-gray-600">{student.phoneNumber || 'N/A'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${student.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                            {student.role === 'admin' ? 'এডমিন' : 'শিক্ষার্থী'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {student.createdAt?.toDate() ? new Date(student.createdAt.toDate()).toLocaleDateString('bn-BD') : 'N/A'}
                        </td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                          <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                          <p>কোন শিক্ষার্থী পাওয়া যায়নি।</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="max-w-2xl border-[#c5a059]/20">
            <CardHeader>
              <CardTitle>সাইট সেটিংস ও লোগো</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateSettings} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">মাদ্রাসার নাম</Label>
                  <Input 
                    id="siteName" 
                    value={siteSettings.siteName} 
                    onChange={e => setSiteSettings({...siteSettings, siteName: e.target.value})}
                    placeholder="মাদ্রাসার নাম লিখুন" 
                  />
                </div>
                
                <div className="space-y-4">
                  <Label>মাদ্রাসার লোগো</Label>
                  <div className="flex items-center gap-6">
                    {siteSettings.logoUrl && (
                      <div className="w-20 h-20 rounded-lg border border-[#c5a059]/20 overflow-hidden bg-gray-50 flex items-center justify-center">
                        <img src={siteSettings.logoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <Input 
                        id="logo" 
                        type="file"
                        accept="image/*"
                        onChange={e => setLogoFile(e.target.files ? e.target.files[0] : null)}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-gray-500">আপনার মাদ্রাসার লোগো ইমেজটি এখানে আপলোড করুন।</p>
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={updatingSettings} className="w-full bg-[#2d5a27] hover:bg-[#1a3a3a]">
                  <Upload className="w-4 h-4 mr-2" />
                  {updatingSettings ? `আপডেট হচ্ছে (${uploadProgress}%)...` : 'সেটিংস সেভ করুন'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
