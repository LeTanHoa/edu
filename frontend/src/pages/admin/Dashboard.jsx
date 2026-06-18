import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, BookOpen, AlertCircle, BarChart2 } from 'lucide-react';
import api from '../../services/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    activeCourses: 0,
    recentStudents: [],
    topCourses: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch admin dashboard stats
    api.get('/admin/dashboard/admin')
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
    <div className="flex flex-col gap-8 pb-10 font-bold text-sm">
      
      {/* Title Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black font-comic">Tổng Quan Hệ Thống ⚙️</h2>
        <p className="text-slate-500 font-bold text-sm">Xem thống kê người dùng, phê duyệt khóa học và phân tích hoạt động.</p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Students */}
        <div className="card-playful p-6 bg-white dark:bg-slate-800 text-center flex flex-col gap-2 border-primary-300">
          <span className="text-4xl">🎒</span>
          <span className="text-xs text-slate-400 font-extrabold uppercase">Tổng Số Học Sinh</span>
          <span className="text-3xl font-black font-comic">{stats.totalStudents}</span>
        </div>

        {/* Total Teachers */}
        <div className="card-playful p-6 bg-white dark:bg-slate-800 text-center flex flex-col gap-2 border-forest-400">
          <span className="text-4xl">👩‍🏫</span>
          <span className="text-xs text-slate-400 font-extrabold uppercase">Tổng Giáo Viên</span>
          <span className="text-3xl font-black font-comic">{stats.totalTeachers}</span>
        </div>

        {/* Total Courses */}
        <div className="card-playful p-6 bg-white dark:bg-slate-800 text-center flex flex-col gap-2 border-sunny-400">
          <span className="text-4xl">📚</span>
          <span className="text-xs text-slate-400 font-extrabold uppercase">Tổng Số Khóa Học</span>
          <span className="text-3xl font-black font-comic">{stats.totalCourses}</span>
        </div>

        {/* Active Courses */}
        <div className="card-playful p-6 bg-white dark:bg-slate-800 text-center flex flex-col gap-2 border-coral-400">
          <span className="text-4xl">🟢</span>
          <span className="text-xs text-slate-400 font-extrabold uppercase">Đã Hoạt Động</span>
          <span className="text-3xl font-black font-comic">{stats.activeCourses}</span>
        </div>
      </div>

      {/* Lists Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Top Courses */}
        <div className="card-playful bg-white dark:bg-slate-800 p-6 flex flex-col gap-4 border-slate-100">
          <h3 className="text-base font-black font-comic text-primary-500">Khóa học đăng ký nhiều nhất</h3>
          <div className="flex flex-col gap-3">
            {stats.topCourses.length === 0 ? (
              <p className="text-xs text-slate-400 font-bold">Chưa có khóa học nào đăng ký</p>
            ) : (
              stats.topCourses.map((c, idx) => (
                <div key={c._id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center bg-slate-200 font-black">{idx + 1}</span>
                    <span className="font-extrabold truncate max-w-[150px]">{c.title}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400">Đăng ký: {c.enrollmentCount} học sinh</p>
                    <p className="text-[10px] text-slate-400">GV: {c.instructor?.fullName}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Registrations */}
        <div className="card-playful bg-white dark:bg-slate-800 p-6 flex flex-col gap-4 border-slate-100">
          <h3 className="text-base font-black font-comic text-forest-500">Đăng ký tài khoản mới</h3>
          <div className="flex flex-col gap-3">
            {stats.recentStudents.length === 0 ? (
              <p className="text-xs text-slate-400 font-bold">Chưa ghi nhận đăng ký mới</p>
            ) : (
              stats.recentStudents.map(student => (
                <div key={student._id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border text-xs">
                  <span className="font-extrabold">{student.fullName}</span>
                  <span className="text-[10px] text-slate-400">{new Date(student.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
