import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LangProvider } from './context/LangContext';

// Layouts
import { MainLayout, StudentLayout, TeacherLayout, AdminLayout } from './layouts/Layouts';

// Public Pages
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import CourseList from './pages/public/CourseList';
import CourseDetail from './pages/public/CourseDetail';
import ForgotPassword from './pages/public/ForgotPassword';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import MyCourses from './pages/student/CourseList';
import CourseViewer from './pages/student/CourseViewer';
import QuizEngine from './pages/student/QuizEngine';
import BadgeBoard from './pages/student/BadgeBoard';
import StudentChatRoom from './pages/student/ChatRoom';
import StudentProfile from './pages/student/Profile';

// Teacher Pages
import TeacherDashboard from './pages/teacher/Dashboard';
import CourseManager from './pages/teacher/CourseManager';
import GradingPortal from './pages/teacher/GradingPortal';
import TeacherChatRoom from './pages/teacher/ChatRoom';
import TeacherProfile from './pages/teacher/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManager from './pages/admin/UserManager';
import SystemSettings from './pages/admin/SystemSettings';
import AuditLogs from './pages/admin/AuditLogs';
import ParentFeedbackManager from './pages/admin/ParentFeedbackManager';

// ──────────────────────────────────────────────────────────────
// Route Guards
// ──────────────────────────────────────────────────────────────
const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sky-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="font-black text-slate-400 font-comic">Đang tải EduKids...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }
  return children;
};

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={`/${user.role}`} replace />;
  return children;
};

// ──────────────────────────────────────────────────────────────
// App Routes
// ──────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* ── Public Routes ── */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<CourseList />} />
        <Route path="/courses/:id" element={<CourseDetail />} />

        <Route path="/login" element={
          <GuestRoute><Login /></GuestRoute>
        } />
        <Route path="/register" element={
          <GuestRoute><Register /></GuestRoute>
        } />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* ── Student Routes ── */}
      <Route path="/student" element={
        <PrivateRoute allowedRoles={['student']}>
          <StudentLayout />
        </PrivateRoute>
      }>
        <Route index element={<StudentDashboard />} />
        <Route path="courses" element={<MyCourses />} />
        <Route path="courses/:id" element={<CourseViewer />} />
        <Route path="quiz/:quizId" element={<QuizEngine />} />
        <Route path="badges" element={<BadgeBoard />} />
        <Route path="chat" element={<StudentChatRoom />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>

      {/* ── Teacher Routes ── */}
      <Route path="/teacher" element={
        <PrivateRoute allowedRoles={['teacher']}>
          <TeacherLayout />
        </PrivateRoute>
      }>
        <Route index element={<TeacherDashboard />} />
        <Route path="courses" element={<CourseManager />} />
        <Route path="grading" element={<GradingPortal />} />
        <Route path="chat" element={<TeacherChatRoom />} />
        <Route path="profile" element={<TeacherProfile />} />
      </Route>

      {/* ── Admin Routes ── */}
      <Route path="/admin" element={
        <PrivateRoute allowedRoles={['admin']}>
          <AdminLayout />
        </PrivateRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UserManager />} />
        <Route path="feedback" element={<ParentFeedbackManager />} />
        <Route path="settings" element={<SystemSettings />} />
        <Route path="logs" element={<AuditLogs />} />
      </Route>

      {/* ── Catch-all 404 ── */}
      <Route path="*" element={
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-sky-50 dark:bg-slate-900 font-comic">
          <span className="text-8xl animate-bounce">🚀</span>
          <h1 className="text-4xl font-black text-slate-700 dark:text-slate-200">Trang không tồn tại!</h1>
          <p className="text-slate-400 font-bold">Đường dẫn bạn truy cập không tồn tại trên hệ thống.</p>
          <a
            href="/"
            className="px-8 py-3.5 bg-primary-500 hover:bg-primary-600 text-white rounded-3xl font-extrabold shadow-[0_5px_0_0_#0284c7] transition-all hover:scale-105 active:translate-y-0.5 active:shadow-none"
          >
            Về Trang Chủ 🏠
          </a>
        </div>
      } />
    </Routes>
  );
}

// ──────────────────────────────────────────────────────────────
// Root App
// ──────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ThemeProvider>
      <LangProvider>
        <AuthProvider>
          <Router>
            <AppRoutes />
            <Toaster position="top-center" reverseOrder={false} />
          </Router>
        </AuthProvider>
      </LangProvider>
    </ThemeProvider>
  );
}
