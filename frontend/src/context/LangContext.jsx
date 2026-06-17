import React, { createContext, useContext, useState } from 'react';

const LangContext = createContext();

const translations = {
  vi: {
    dashboard: 'Bảng Điều Khiển',
    courses: 'Khóa Học',
    myCourses: 'Khóa Học Của Em',
    leaderboard: 'Bảng Xếp Hạng',
    badges: 'Huy Hiệu',
    chat: 'Trò Chuyện',
    assignments: 'Bài Tập Về Nhà',
    quizzes: 'Trắc Nghiệm',
    profile: 'Hồ Sơ Cá Nhân',
    logout: 'Đăng Xuất',
    login: 'Đăng Nhập',
    register: 'Đăng Ký',
    streak: 'Chuỗi điểm danh',
    level: 'Cấp độ',
    coins: 'Xu',
    xp: 'Kinh nghiệm',
    welcome: 'Chào mừng em đến với EduKids!',
    search: 'Tìm kiếm...',
    filter: 'Bộ lọc',
    completed: 'Đã hoàn thành',
    inProgress: 'Đang học',
    grade: 'Lớp',
    home: 'Trang Chủ',
    settings: 'Cấu hình hệ thống',
    auditLogs: 'Nhật ký hệ thống',
    usersManager: 'Quản lý người dùng',
  },
  en: {
    dashboard: 'Dashboard',
    courses: 'Courses',
    myCourses: 'My Courses',
    leaderboard: 'Leaderboard',
    badges: 'Badges',
    chat: 'Chat Room',
    assignments: 'Homeworks',
    quizzes: 'Quizzes',
    profile: 'Profile',
    logout: 'Log Out',
    login: 'Log In',
    register: 'Sign Up',
    streak: 'Daily Streak',
    level: 'Level',
    coins: 'Coins',
    xp: 'Experience',
    welcome: 'Welcome to EduKids!',
    search: 'Search...',
    filter: 'Filters',
    completed: 'Completed',
    inProgress: 'In Progress',
    grade: 'Grade',
    home: 'Home',
    settings: 'System Settings',
    auditLogs: 'Audit Logs',
    usersManager: 'User Manager',
  }
};

export const LangProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('lang') || 'vi';
  });

  const toggleLang = () => {
    const nextLang = lang === 'vi' ? 'en' : 'vi';
    setLang(nextLang);
    localStorage.setItem('lang', nextLang);
  };

  const t = (key) => {
    return translations[lang][key] || key;
  };

  return (
    <LangContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext);
