import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Trophy, Sparkles, Star } from 'lucide-react';
import api from '../../services/api';
import axios from 'axios';
const Home = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);

useEffect(() => {
  api.get('/courses')
    .then(res => {
      setCourses(res.data.data);
      console.log(res);
    })
    .catch(err => console.error(err));
}, []);


  return (
    <div className="bg-sky-50/20 dark:bg-slate-900 pb-20">
      {/* Hero Section */}
      <section className="relative py-20 px-6 max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-12">
        <div className="flex-1 flex flex-col gap-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-100 dark:bg-slate-800 border-2 border-primary-400 text-primary-700 dark:text-primary-300 rounded-full font-bold text-sm mx-auto lg:mx-0 w-fit">
            <Sparkles size={16} />
            <span>Học Vui Mỗi Ngày, Nhận Ngàn Quà Hay!</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black leading-tight font-comic">
            Vừa Học Vui Vẻ<br />
            Vừa Tích Lũy <span className="text-sunny-500 underline decoration-wavy decoration-sunny-400">Huy Hiệu</span>!
          </h1>

          <p className="text-lg text-slate-600 dark:text-slate-300 font-bold max-w-xl mx-auto lg:mx-0">
            Hệ thống học tập thông minh dành cho học sinh tiểu học với các bài giảng hoạt họa sinh động, câu đố trắc nghiệm kéo thả và phần thưởng hấp dẫn.
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
            <Link 
              to="/register" 
              className="px-8 py-4 bg-sunny-500 hover:bg-sunny-600 text-white font-extrabold text-lg rounded-3xl shadow-[0_6px_0_0_#d97706] transition-all hover:scale-105 active:translate-y-0.5 active:shadow-none"
            >
              Đăng Ký Học Ngay 🚀
            </Link>
            <Link 
              to="/courses" 
              className="px-8 py-4 border-4 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-extrabold text-lg rounded-3xl transition-all hover:scale-105 active:translate-y-0.5"
            >
              Khám Phá Bài Học
            </Link>
          </div>
        </div>

        {/* Hero Image Illustration */}
        <div className="flex-1 w-full max-w-md lg:max-w-none flex justify-center">
          <div className="relative">
            {/* Playful Circle Backgrounds */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-playful-purple/20 rounded-full blur-xl" />
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-primary-400/20 rounded-full blur-xl" />
            
            {/* Rocket Icon Display */}
            <div className="w-80 h-80 md:w-96 md:h-96 rounded-3xl border-8 border-white dark:border-slate-800 bg-gradient-to-tr from-sky-400 to-playful-purple flex items-center justify-center shadow-2xl relative overflow-hidden animate-pulse">
              <span className="text-8xl md:text-9xl animate-bounce">🚀</span>
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-slate-800/90 py-3 px-4 rounded-2xl flex items-center justify-between border-2 border-slate-100 dark:border-slate-700">
                <span className="font-extrabold text-sm dark:text-white">Bé Minh Triết vừa lên Level 3!</span>
                <span className="text-xl">🏆</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Subjects categories */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-black text-center mb-10 font-comic">Môn Học Hot Nhất 📚</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card Math */}
          <div className="card-sunny p-8 flex flex-col gap-4 text-center cursor-pointer" onClick={() => navigate('/courses?category=toan-hoc')}>
            <span className="text-5xl">🧮</span>
            <h3 className="text-2xl font-black">Toán Học Lý Thú</h3>
            <p className="font-bold text-sunny-800">Cộng, trừ, nhân, chia, hình học qua các hình minh họa hoạt họa dễ hiểu.</p>
            <span className="mt-4 px-4 py-2 bg-white rounded-2xl font-bold text-sunny-600 border border-sunny-400 w-fit mx-auto">Vào Học</span>
          </div>

          {/* Card Vietnamese */}
          <div className="card-playful p-8 flex flex-col gap-4 text-center border-primary-300 bg-sky-50 dark:bg-slate-800 cursor-pointer" onClick={() => navigate('/courses?category=tieng-viet')}>
            <span className="text-5xl">📖</span>
            <h3 className="text-2xl font-black text-primary-600 dark:text-primary-300">Tiếng Việt Sinh Động</h3>
            <p className="font-bold text-slate-600 dark:text-slate-300">Đọc thơ, ghép chữ, làm văn miêu tả thật vui cùng các trò chơi từ ngữ.</p>
            <span className="mt-4 px-4 py-2 bg-white dark:bg-slate-700 rounded-2xl font-bold text-primary-500 border border-primary-300 w-fit mx-auto">Vào Học</span>
          </div>

          {/* Card Science */}
          <div className="card-forest p-8 flex flex-col gap-4 text-center cursor-pointer" onClick={() => navigate('/courses')}>
            <span className="text-5xl">🔬</span>
            <h3 className="text-2xl font-black">Khoa Học Kỳ Diệu</h3>
            <p className="font-bold text-forest-800">Tìm hiểu thế giới tự nhiên xung quanh, các loài động vật và hành tinh.</p>
            <span className="mt-4 px-4 py-2 bg-white rounded-2xl font-bold text-forest-600 border border-forest-400 w-fit mx-auto">Vào Học</span>
          </div>
        </div>
      </section>

      {/* Top Courses listing */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black font-comic">Khóa Học Nổi Bật 🌟</h2>
          <Link to="/courses" className="font-bold text-primary-500 hover:underline">Xem tất cả</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {courses.map(course => (
            <div key={course._id} className="card-playful flex flex-col h-full bg-white dark:bg-slate-800">
              <div className="h-48 bg-primary-100 flex items-center justify-center text-5xl relative overflow-hidden border-b-4 border-slate-100 dark:border-slate-700">
                {course.thumbnail ? (
                  <img src={course?.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <span>📚</span>
                )}
                <div className="absolute top-3 right-3 bg-sunny-400 border-2 border-white px-3 py-1 rounded-full text-xs font-black text-amber-900 shadow-sm">
                  Lớp {course.gradeLevel}
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-black uppercase text-primary-500">{course.category?.name || 'Môn học'}</span>
                  <h3 className="text-xl font-black mt-1 line-clamp-2">{course.title}</h3>
                  <p className="text-slate-500 text-sm mt-2 font-semibold line-clamp-3">{course.description}</p>
                </div>
                <div className="flex items-center justify-between mt-6 pt-4 border-t-2 border-slate-50 dark:border-slate-700/50">
                  <span className="text-xs font-bold text-slate-400">GV: {course.instructor?.fullName}</span>
                  <Link 
                    to={`/courses/${course._id}`} 
                    className="px-4 py-2 bg-primary-500 text-white rounded-2xl text-sm font-bold hover:scale-105 active:translate-y-0.5 transition-all shadow-[0_3px_0_0_#0284c7]"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
