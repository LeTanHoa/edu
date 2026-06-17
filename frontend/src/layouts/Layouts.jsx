import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLang } from '../context/LangContext';
import { 
  BookOpen, Trophy, Award, MessageSquare, LogOut, Sun, Moon, 
  Globe, User, Settings, Home, BarChart2, Book, FileText, CheckSquare, Users 
} from 'lucide-react';
import api from '../services/api';

// Public/Main Layout
export const MainLayout = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const { lang, toggleLang, t } = useLang();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-sky-50/30 dark:bg-slate-900 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b-4 border-slate-100 dark:border-slate-700/50 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-3xl">🚀</span>
            <span className="text-2xl font-black tracking-wider bg-gradient-to-r from-primary-500 to-playful-purple bg-clip-text text-transparent font-comic">
              EDUKIDS
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 font-bold">
            <Link to="/" className="text-slate-600 dark:text-slate-300 hover:text-primary-500 transition-colors">
              {t('home')}
            </Link>
            <Link to="/courses" className="text-slate-600 dark:text-slate-300 hover:text-primary-500 transition-colors">
              {t('courses')}
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {/* Language Switch */}
            <button 
              onClick={toggleLang} 
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-700 hover:scale-105 active:scale-95 transition-all text-sm font-bold flex items-center gap-1.5"
            >
              <Globe size={18} />
              <span>{lang.toUpperCase()}</span>
            </button>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-700 hover:scale-105 active:scale-95 transition-all"
            >
              {darkMode ? <Sun size={18} className="text-sunny-500" /> : <Moon size={18} className="text-slate-600" />}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(`/${user.role}`)}
                  className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl font-extrabold shadow-[0_4px_0_0_#0284c7] transition-all hover:scale-105 active:translate-y-0.5 active:shadow-none"
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => { logout(); navigate('/'); }}
                  className="p-2.5 rounded-2xl text-slate-500 hover:text-coral-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                  title={t('logout')}
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  to="/login" 
                  className="px-5 py-2.5 border-4 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-2xl font-extrabold transition-all hover:scale-105 active:translate-y-0.5"
                >
                  {t('login')}
                </Link>
                <Link 
                  to="/register" 
                  className="px-5 py-2.5 bg-sunny-500 hover:bg-sunny-600 text-white rounded-2xl font-extrabold shadow-[0_4px_0_0_#d97706] transition-all hover:scale-105 active:translate-y-0.5 active:shadow-none"
                >
                  {t('register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-100 dark:bg-slate-800 border-t-4 border-slate-200 dark:border-slate-700/50 py-8 px-6 text-center">
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 font-comic">
          © {new Date().getFullYear()} EduKids 🚀 Học vui mỗi ngày - Phát triển tư duy.
        </p>
      </footer>
    </div>
  );
};

// Internal Sidebars/Headers for Dashboards
const SidebarLayout = ({ sidebarLinks, roleName }) => {
  const { user, profile, logout, refreshProfile } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const { lang, toggleLang, t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();

  // Daily checkin helper for students
  const handleDailyCheckin = async () => {
    if (user?.role !== 'student') return;
    try {
      const res = await api.post('/gamification/daily-checkin');
      alert(res.data.message);
      refreshProfile();
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể điểm danh!');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-sky-50/30 dark:bg-slate-950 transition-colors duration-300">
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-b-4 md:border-b-0 md:border-r-4 border-slate-100 dark:border-slate-800 flex flex-col p-6">
        <div className="flex items-center gap-2 mb-8">
          <span className="text-3xl">🚀</span>
          <span className="text-2xl font-black tracking-wider bg-gradient-to-r from-primary-500 to-playful-purple bg-clip-text text-transparent font-comic">
            EDUKIDS
          </span>
          <span className="text-[10px] uppercase font-extrabold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">
            {roleName}
          </span>
        </div>

        {/* User Mini Profile */}
        {user && (
          <div className="mb-8 p-4 bg-sky-50/50 dark:bg-slate-800/50 rounded-2xl border-2 border-slate-100 dark:border-slate-700/50 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary-400 bg-white">
              <img 
                src={user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.username}`} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-extrabold truncate text-sm max-w-[120px]">{user.fullName}</p>
              {profile && user.role === 'student' && (
                <p className="text-xs text-primary-500 font-extrabold">Level {profile.level}</p>
              )}
              {user.role === 'teacher' && <p className="text-xs text-slate-500">Giáo Viên</p>}
              {user.role === 'admin' && <p className="text-xs text-coral-500">Admin</p>}
            </div>
          </div>
        )}

        {/* Navigation items */}
        <nav className="flex-1 flex flex-col gap-2">
          {sidebarLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
                  isActive 
                    ? 'bg-primary-500 text-white shadow-[0_4px_0_0_#0284c7] scale-102' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Log Out */}
        <button
          onClick={() => { logout(); navigate('/'); }}
          className="mt-6 flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-coral-500 hover:bg-coral-50 dark:hover:bg-coral-950/20 transition-all text-left"
        >
          <LogOut size={20} />
          <span>{t('logout')}</span>
        </button>
      </aside>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Dynamic header details */}
        <header className="bg-white dark:bg-slate-900 border-b-4 border-slate-100 dark:border-slate-800/80 py-4 px-8 flex flex-wrap items-center justify-between gap-4">
          {user?.role === 'student' && profile ? (
            <div className="flex items-center gap-6 flex-wrap">
              {/* Daily checkin */}
              <button 
                onClick={handleDailyCheckin}
                className="flex items-center gap-2 px-4 py-1.5 bg-sunny-100 dark:bg-sunny-950/20 border-2 border-sunny-400 text-sunny-700 dark:text-sunny-300 rounded-full text-sm font-extrabold hover:scale-105 transition-all"
              >
                <span>📅</span>
                <span>{t('streak')}: {profile.dailyStreak?.count || 0}</span>
              </button>

              {/* Coins tracker */}
              <div className="flex items-center gap-2 text-sm font-extrabold bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-300 px-4 py-1.5 rounded-full text-amber-700 dark:text-amber-400">
                <span>🪙</span>
                <span>{profile.coins} {t('coins')}</span>
              </div>

              {/* XP progress bar */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-extrabold text-primary-500">✨ {profile.xp} XP</span>
                <div className="w-32 bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden border">
                  <div 
                    className="bg-primary-500 h-full transition-all duration-500" 
                    style={{ width: `${profile.xp % 100}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="font-extrabold text-slate-400 text-sm">
              EduKids Dashboard - {t('welcome')}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button 
              onClick={toggleLang} 
              className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:scale-105 text-sm font-bold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
            >
              <Globe size={18} />
              <span>{lang.toUpperCase()}</span>
            </button>
            <button 
              onClick={toggleTheme} 
              className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:scale-105 border border-slate-200 dark:border-slate-700"
            >
              {darkMode ? <Sun size={18} className="text-sunny-500" /> : <Moon size={18} className="text-slate-600" />}
            </button>
            <Link to="/" className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:scale-105 border border-slate-200 dark:border-slate-700">
              <Home size={18} />
            </Link>
          </div>
        </header>

        {/* Routed child dashboard content */}
        <main className="p-6 md:p-8 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Student Dashboard Layout
export const StudentLayout = () => {
  const { t } = useLang();
  const studentLinks = [
    { to: '/student', label: t('dashboard'), icon: <BarChart2 size={20} /> },
    { to: '/student/courses', label: t('courses'), icon: <Book size={20} /> },
    { to: '/student/badges', label: t('badges'), icon: <Trophy size={20} /> },
    { to: '/student/chat', label: t('chat'), icon: <MessageSquare size={20} /> },
    { to: '/student/profile', label: t('profile'), icon: <User size={20} /> },
  ];
  return <SidebarLayout sidebarLinks={studentLinks} roleName="Học Sinh" />;
};

// Teacher Dashboard Layout
export const TeacherLayout = () => {
  const { t } = useLang();
  const teacherLinks = [
    { to: '/teacher', label: 'Dashboard', icon: <BarChart2 size={20} /> },
    { to: '/teacher/courses', label: 'Quản lý Khóa Học', icon: <BookOpen size={20} /> },
    { to: '/teacher/grading', label: 'Chấm Điểm Bài Tập', icon: <FileText size={20} /> },
    { to: '/teacher/chat', label: 'Chat với Học Sinh', icon: <MessageSquare size={20} /> },
    { to: '/teacher/profile', label: 'Hồ sơ Giáo Viên', icon: <User size={20} /> },
  ];
  return <SidebarLayout sidebarLinks={teacherLinks} roleName="Giáo Viên" />;
};

// Admin Dashboard Layout
export const AdminLayout = () => {
  const { t } = useLang();
  const adminLinks = [
    { to: '/admin', label: 'Tổng Quan', icon: <BarChart2 size={20} /> },
    { to: '/admin/users', label: t('usersManager'), icon: <Users size={20} /> },
    { to: '/admin/settings', label: t('settings'), icon: <Settings size={20} /> },
    { to: '/admin/logs', label: t('auditLogs'), icon: <FileText size={20} /> },
  ];
  return <SidebarLayout sidebarLinks={adminLinks} roleName="Admin" />;
};
