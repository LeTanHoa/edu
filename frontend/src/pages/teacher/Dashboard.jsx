import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Users, ClipboardCheck, Sparkles } from 'lucide-react';
import api from '../../services/api';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    pendingGrading: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch stats
    api.get('/admin/dashboard/teacher')
      .then(res => {
        if (res.data.success) {
          setStats(res.data.stats);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-10 font-bold">
      
      {/* Welcome Board */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-playful-orange to-sunny-500 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-3 text-center md:text-left">
          <h2 className="text-3xl font-black font-comic">Chào mừng cô {user?.fullName}! 👩‍🏫</h2>
          <p className="font-bold text-amber-50">Cổng thông tin quản trị lớp học của giáo viên. Hãy chuẩn bị các bài giảng thật sinh động cho học sinh nhé!</p>
        </div>
        <span className="text-8xl select-none animate-bounce hidden md:block">🍎</span>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Courses */}
        <div className="card-playful p-6 bg-white dark:bg-slate-800 text-center flex flex-col gap-2 border-primary-300">
          <span className="text-4xl">📚</span>
          <span className="text-xs text-slate-400 font-extrabold uppercase">Khóa Học Đang Dạy</span>
          <span className="text-3xl font-black font-comic">{stats.totalCourses} Khóa Học</span>
        </div>

        {/* Total Students */}
        <div className="card-playful p-6 bg-white dark:bg-slate-800 text-center flex flex-col gap-2 border-forest-400">
          <span className="text-4xl">👦👧</span>
          <span className="text-xs text-slate-400 font-extrabold uppercase">Tổng Số Học Sinh</span>
          <span className="text-3xl font-black font-comic">{stats.totalStudents} Học Sinh</span>
        </div>

        {/* Pending Grading */}
        <div className="card-playful p-6 bg-white dark:bg-slate-800 text-center flex flex-col gap-2 border-coral-400">
          <span className="text-4xl">📝</span>
          <span className="text-xs text-slate-400 font-extrabold uppercase">Bài Tập Chờ Chấm</span>
          <span className="text-3xl font-black font-comic text-coral-500">{stats.pendingGrading} Bài Tập</span>
        </div>
      </div>

      {/* Course management shortcuts or instructions */}
      <div className="card-playful bg-white dark:bg-slate-800 p-8 flex flex-col gap-4 border-slate-100 font-semibold text-slate-600 dark:text-slate-300">
        <h3 className="text-xl font-black font-comic text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <Sparkles className="text-sunny-500" />
          <span>Hướng dẫn giảng dạy EduKids</span>
        </h3>
        
        <ul className="list-disc pl-6 flex flex-col gap-2 text-sm">
          <li>Truy cập mục <strong>Quản lý Khóa học</strong> để thêm mới giáo trình, tạo chương học và thêm video/pdf bài giảng.</li>
          <li>Xem danh sách bài nộp của học sinh tại mục <strong>Chấm Điểm</strong> để ghi nhận điểm số học tập và phản hồi ý kiến.</li>
          <li>Kết nối trực tiếp với học sinh qua mục <strong>Chat Room</strong> để trả lời các thắc mắc bài giảng.</li>
        </ul>
      </div>

    </div>
  );
};

export default TeacherDashboard;
