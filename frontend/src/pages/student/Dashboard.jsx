import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Trophy, Award, BookOpen, Bell, ArrowRight, Star } from 'lucide-react';
import api from '../../services/api';

const StudentDashboard = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    xp: 0,
    coins: 0,
    level: 1,
    badgesCount: 0,
    dailyStreak: 0,
    avgGrade: 0,
    pendingHomework: 0
  });
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch stats
    api.get('/admin/dashboard/student')
      .then(res => {
        if (res.data.success) {
          setStats(res.data.stats);
        }
      })
      .catch(err => console.error(err));

    // Fetch enrolled courses
    api.get('/courses/enrolled')
      .then(res => {
        if (res.data.success) {
          setEnrolledCourses(res.data.courses);
        }
      })
      .catch(err => console.error(err));

    // Fetch leaderboard
    api.get('/gamification/leaderboard')
      .then(res => {
        if (res.data.success) {
          setLeaderboard(res.data.leaderboard);
        }
      })
      .catch(err => console.error(err));

    // Fetch notifications
    api.get('/notifications')
      .then(res => {
        if (res.data.success) {
          setNotifications(res.data.notifications);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      
      {/* Welcome Board */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-primary-500 to-playful-purple text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-3 text-center md:text-left z-10">
          <h2 className="text-3xl font-black font-comic">Chào bé {user?.fullName}! 👋</h2>
          <p className="font-bold text-sky-100 max-w-md">Hôm nay bé muốn khám phá môn học gì nào? Hãy học tập chăm chỉ để nhận thêm nhiều huy hiệu nhé!</p>
          
          <Link 
            to="/student/courses" 
            className="mt-2 px-6 py-3 bg-sunny-500 hover:bg-sunny-600 text-white rounded-2xl font-black text-sm w-fit shadow-[0_4px_0_0_#d97706] transition-all hover:scale-105 active:translate-y-0.5 active:shadow-none mx-auto md:mx-0"
          >
            Đến lớp học ngay 🚀
          </Link>
        </div>
        <span className="text-8xl select-none animate-bounce hidden md:block">🦄</span>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Level */}
        <div className="card-playful p-6 bg-white dark:bg-slate-800 text-center flex flex-col gap-2 border-primary-300">
          <span className="text-4xl">✨</span>
          <span className="text-xs text-slate-400 font-extrabold uppercase">Cấp Độ</span>
          <span className="text-3xl font-black font-comic">Cấp {stats.level}</span>
        </div>

        {/* Coins */}
        <div className="card-sunny p-6 text-center flex flex-col gap-2">
          <span className="text-4xl">🪙</span>
          <span className="text-xs text-sunny-700 font-extrabold uppercase">Xu Tích Lũy</span>
          <span className="text-3xl font-black font-comic">{stats.coins} Xu</span>
        </div>

        {/* XP */}
        <div className="card-playful p-6 bg-white dark:bg-slate-800 text-center flex flex-col gap-2 border-playful-purple/50">
          <span className="text-4xl">🌟</span>
          <span className="text-xs text-slate-400 font-extrabold uppercase">Tổng Điểm XP</span>
          <span className="text-3xl font-black font-comic">{stats.xp} XP</span>
        </div>

        {/* Badges */}
        <div className="card-coral p-6 text-center flex flex-col gap-2">
          <span className="text-4xl">🏆</span>
          <span className="text-xs text-coral-700 font-extrabold uppercase">Huy Hiệu Đạt Được</span>
          <span className="text-3xl font-black font-comic">{stats.badgesCount} Huy Hiệu</span>
        </div>
      </div>

      {/* Main Grid content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Courses and Streaks) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* My Courses */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black font-comic">Khóa học của bé 📚</h3>
              <Link to="/student/courses" className="text-sm font-bold text-primary-500 hover:underline flex items-center gap-1">
                <span>Xem thêm</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {enrolledCourses.map(course => (
                <div key={course._id} className="card-playful bg-white dark:bg-slate-800 p-6 flex flex-col justify-between gap-6 border-slate-100">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-primary-500 uppercase">{course.category?.name}</span>
                    <h4 className="text-lg font-black line-clamp-1">{course.title}</h4>
                    <p className="text-xs text-slate-400 font-semibold truncate">Cô: {course.instructor?.fullName}</p>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="flex flex-col gap-1 font-bold">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Tiến độ học:</span>
                      <span>{course.progress ?? 0}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden border">
                      <div className="bg-primary-500 h-full transition-all" style={{ width: `${course.progress ?? 0}%` }}></div>
                    </div>
                  </div>

                  <button 
                    onClick={() => navigate(`/student/courses/${course._id}`)}
                    className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl font-black text-sm transition-all shadow-[0_3px_0_0_#0284c7]"
                  >
                    Vào Học 🚀
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements Summary */}
          <div className="card-playful bg-white dark:bg-slate-800 p-6 flex flex-col gap-4">
            <h3 className="text-lg font-black font-comic">Thành tích của bé 🏆</h3>
            {profile?.badges?.length === 0 ? (
              <p className="text-sm font-semibold text-slate-400">Bé chưa nhận được huy hiệu nào. Hãy học bài và làm bài trắc nghiệm nhé!</p>
            ) : (
              <div className="flex gap-4 flex-wrap">
                {profile?.badges?.map((b, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1.5 p-3 bg-sky-50/50 dark:bg-slate-700/50 rounded-2xl border border-sky-100 dark:border-slate-700">
                    <span className="text-4xl" title={b.badge?.description}>{b.badge?.icon || '🏆'}</span>
                    <span className="text-xs font-black">{b.badge?.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column (Leaderboard & Notifications) */}
        <div className="flex flex-col gap-8 font-bold">
          
          {/* Notifications box */}
          <div className="card-playful bg-white dark:bg-slate-800 p-6 flex flex-col gap-4">
            <h3 className="text-lg font-black font-comic flex items-center gap-1.5 text-primary-500">
              <Bell size={20} />
              <span>Thông báo lớp học</span>
            </h3>

            <div className="flex flex-col gap-3">
              {notifications.map(n => (
                <div key={n._id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <p className="text-sm font-black">{n.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-300 font-semibold mt-1">{n.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard panel */}
          <div className="card-playful bg-white dark:bg-slate-800 p-6 flex flex-col gap-4 border-sunny-400">
            <h3 className="text-lg font-black font-comic flex items-center gap-1.5 text-sunny-600">
              <Trophy size={20} />
              <span>Bảng Xếp Hạng Lớp Học 🥇</span>
            </h3>

            <div className="flex flex-col gap-3">
              {leaderboard.map((item, idx) => {
                const rankColors = ['bg-sunny-400 text-amber-950 border-sunny-500', 'bg-slate-200 text-slate-800', 'bg-orange-200 text-orange-800'];
                return (
                  <div key={item._id} className="flex items-center justify-between p-3 rounded-2xl bg-sky-50/20 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border ${rankColors[idx] || 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                        {idx + 1}
                      </span>
                      <img 
                        src={item.user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${item.user?.username}`} 
                        alt="Avatar" 
                        className="w-8 h-8 rounded-full border bg-white"
                      />
                      <span className="text-sm font-extrabold max-w-[100px] truncate">{item.user?.fullName}</span>
                    </div>
                    <span className="text-xs font-extrabold text-primary-500">Level {item.level} ({item.xp} XP)</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default StudentDashboard;
