import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { BookOpen, GraduationCap, CheckCircle, Award, Play } from 'lucide-react';
import api from '../../services/api';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    // Fetch course details
    api.get(`/courses/${id}`)
      .then(res => {
        if (res.data.success) {
          setCourseData(res.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id, enrolling]);

  const handleEnroll = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập tài khoản học sinh để đăng ký học nhé!');
      navigate('/login');
      return;
    }
    if (user.role !== 'student') {
      toast.error('Tài khoản của bạn không phải là học sinh để đăng ký học!');
      return;
    }

    setEnrolling(true);
    try {
      const res = await api.post(`/courses/${id}/enroll`);
      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đăng ký!');
    }
    setEnrolling(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!courseData || !courseData.course) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-black text-coral-500 font-comic">Không tìm thấy khóa học này!</h2>
        <Link to="/courses" className="text-primary-500 font-bold hover:underline mt-4 block">Quay lại thư viện</Link>
      </div>
    );
  }

  const { course, chapters, isEnrolled, progress } = courseData;

  return (
    <div className="bg-sky-50/20 dark:bg-slate-900 pb-20">
      
      {/* Hero Banner */}
      <section className="bg-white dark:bg-slate-800 border-b-4 border-slate-100 dark:border-slate-700/50 py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-10 items-center">
          
          {/* Thumbnail */}
          <div className="w-full md:w-80 h-48 bg-primary-100 rounded-3xl overflow-hidden border-4 border-slate-100 dark:border-slate-700 shadow-md flex items-center justify-center text-6xl">
            {course.thumbnail ? (
              <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
            ) : (
              <span>📚</span>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 flex flex-col gap-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
              <span className="bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 font-black px-4 py-1 rounded-full text-xs">
                {course.category?.name || 'Môn học'}
              </span>
              <span className="bg-sunny-100 dark:bg-sunny-950 text-sunny-700 dark:text-sunny-300 font-black px-4 py-1 rounded-full text-xs">
                Học sinh Lớp {course.gradeLevel}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black font-comic leading-tight">{course.title}</h1>
            <p className="text-slate-500 dark:text-slate-300 font-bold max-w-2xl">{course.description}</p>
            
            <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
              {isEnrolled ? (
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <button
                    onClick={() => navigate(`/student/courses/${course._id}`)}
                    className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl font-extrabold shadow-[0_4px_0_0_#0284c7] transition-all hover:scale-105 active:translate-y-0.5 active:shadow-none flex items-center gap-2"
                  >
                    <Play size={18} fill="white" />
                    <span>Vào Học Ngay ({progress}%)</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="px-8 py-3.5 bg-sunny-500 hover:bg-sunny-600 text-white rounded-2xl font-extrabold text-lg shadow-[0_5px_0_0_#d97706] transition-all hover:scale-105 active:translate-y-0.5 active:shadow-none flex items-center gap-1.5"
                >
                  <GraduationCap size={20} />
                  <span>{enrolling ? 'Đang Đăng Ký...' : 'Đăng Ký Khóa Học'}</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Course Content Grid */}
      <section className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-10">
        
        {/* Chapters list */}
        <div className="flex-1 flex flex-col gap-6">
          <h2 className="text-2xl font-black font-comic flex items-center gap-2">
            <BookOpen className="text-primary-500" />
            <span>Nội dung chương trình học</span>
          </h2>

          <div className="flex flex-col gap-4">
            {chapters.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-semibold bg-white dark:bg-slate-800 rounded-2xl border-2">
                Nội dung bài học đang được cô giáo biên soạn...
              </div>
            ) : (
              chapters.map((chap, idx) => (
                <div key={chap._id} className="card-playful bg-white dark:bg-slate-800 p-6 flex flex-col gap-4">
                  <h3 className="text-lg font-black text-slate-700 dark:text-slate-200">
                    {chap.title}
                  </h3>

                  {/* Lessons list */}
                  <div className="flex flex-col gap-2 pl-4 border-l-4 border-slate-100 dark:border-slate-700">
                    {chap.lessons.length === 0 ? (
                      <span className="text-xs text-slate-400 font-semibold">Chưa có bài giảng</span>
                    ) : (
                      chap.lessons.map(lesson => (
                        <div key={lesson._id} className="flex items-center justify-between py-2 text-sm font-semibold">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            <span>{lesson.contentType === 'video' ? '📺' : '📄'}</span>
                            <span className="hover:text-primary-500 cursor-pointer" onClick={() => isEnrolled && navigate(`/student/courses/${course._id}?lesson=${lesson._id}`)}>
                              {lesson.title}
                            </span>
                          </div>
                          {lesson.duration > 0 && (
                            <span className="text-xs text-slate-400">{Math.round(lesson.duration / 60)} phút</span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructor and Rewards info */}
        <div className="w-full lg:w-80 flex flex-col gap-6 font-bold">
          
          {/* Rewards Panel */}
          <div className="p-6 bg-sunny-100 dark:bg-slate-800 rounded-3xl border-4 border-sunny-400 flex flex-col gap-4">
            <h3 className="text-lg font-black text-amber-900 dark:text-amber-400 flex items-center gap-2">
              <Award />
              <span>Phần thưởng hoàn thành</span>
            </h3>
            
            <div className="flex flex-col gap-2 text-sm font-semibold">
              <div className="flex items-center justify-between text-amber-800 dark:text-slate-200">
                <span>Điểm XP:</span>
                <span>+{course.xpReward} XP ✨</span>
              </div>
              <div className="flex items-center justify-between text-amber-800 dark:text-slate-200">
                <span>Xu tích lũy:</span>
                <span>+{course.coinReward} Xu 🪙</span>
              </div>
              <div className="flex items-center justify-between text-amber-800 dark:text-slate-200">
                <span>Chứng chỉ:</span>
                <span>Nhận PDF Certificate 🎓</span>
              </div>
            </div>
          </div>

          {/* Instructor Bio */}
          <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border-4 border-slate-100 dark:border-slate-700/80 flex flex-col gap-4">
            <h3 className="text-lg font-black">Giáo viên hướng dẫn</h3>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 bg-slate-50">
                <img 
                  src={course.instructor?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${course.instructor?.username}`} 
                  alt="Instructor" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-extrabold text-sm">{course.instructor?.fullName}</p>
                <p className="text-xs text-slate-400">Giảng viên tiểu học</p>
              </div>
            </div>
            
            <p className="text-xs text-slate-500 font-semibold leading-relaxed border-t pt-4 border-slate-50 dark:border-slate-700/50">
              {course.instructor?.email}
            </p>
          </div>

        </div>

      </section>

    </div>
  );
};

export default CourseDetail;
