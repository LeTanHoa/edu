import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles } from 'lucide-react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [gradeLevel, setGradeLevel] = useState(3);
  const [className, setClassName] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username || !email || !fullName || !password) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc!');
      setLoading(false);
      return;
    }

    const payload = {
      username,
      email,
      fullName,
      password,
      role,
      gradeLevel: Number(gradeLevel),
      className
    };

    const res = await register(payload);
    if (res.success) {
      navigate(`/${role}`);
    } else {
      setError(res.message || 'Đăng ký thất bại. Tên đăng nhập hoặc Email có thể đã trùng.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-6 py-12 bg-sky-50/20 dark:bg-slate-900">
      <div className="w-full max-w-lg card-playful bg-white dark:bg-slate-800 p-8 flex flex-col gap-6">
        
        {/* Title */}
        <div className="text-center flex flex-col gap-2">
          <span className="text-5xl animate-bounce">🎈</span>
          <h2 className="text-3xl font-black font-comic">Đăng Ký Tài Khoản</h2>
          <p className="text-slate-500 font-bold text-sm">Gia nhập ngôi nhà học tập EduKids để tích lũy thật nhiều xu nhé!</p>
        </div>

        {error && (
          <div className="p-4 bg-coral-100 border-2 border-coral-500 text-coral-700 font-bold rounded-2xl text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-bold">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Tên tài khoản *</label>
              <input 
                type="text" 
                placeholder="Nhập tên đăng nhập" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="px-4 py-2.5 rounded-xl border-4 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:border-primary-400 focus:outline-none transition-all text-sm font-semibold"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Email liên hệ *</label>
              <input 
                type="email" 
                placeholder="Ví dụ: be@gmail.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-4 py-2.5 rounded-xl border-4 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:border-primary-400 focus:outline-none transition-all text-sm font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Họ và tên của em *</label>
              <input 
                type="text" 
                placeholder="Nhập họ và tên đầy đủ" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="px-4 py-2.5 rounded-xl border-4 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:border-primary-400 focus:outline-none transition-all text-sm font-semibold"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Mật khẩu *</label>
              <input 
                type="password" 
                placeholder="Chọn mật khẩu bảo mật" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="px-4 py-2.5 rounded-xl border-4 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:border-primary-400 focus:outline-none transition-all text-sm font-semibold"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Vai trò đăng ký</label>
            <div className="grid grid-cols-3 gap-2">
              {['student', 'teacher'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 px-4 rounded-xl border-2 font-black capitalize text-xs transition-all ${
                    role === r 
                      ? 'bg-primary-500 text-white border-primary-500 shadow-sm' 
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {r === 'student' ? 'Học sinh 🎒' : 'Giáo viên 👩‍🏫'}
                </button>
              ))}
            </div>
          </div>

          {role === 'student' && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-sky-50/50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Em học lớp mấy?</label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(Number(e.target.value))}
                  className="px-3 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold focus:outline-none focus:border-primary-400 text-sm"
                >
                  {[1, 2, 3, 4, 5].map(g => (
                    <option key={g} value={g}>Lớp {g}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Tên lớp học (nếu có)</label>
                <input 
                  type="text" 
                  placeholder="Ví dụ: 3A, 5B" 
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="px-3 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:border-primary-400 focus:outline-none text-sm font-semibold"
                />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-2 py-3.5 bg-sunny-500 hover:bg-sunny-600 text-white font-extrabold text-base rounded-xl shadow-[0_5px_0_0_#d97706] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Đang Xử Lý...' : (
              <>
                <Sparkles size={18} />
                <span>Hoàn Thành Đăng Ký 🎉</span>
              </>
            )}
          </button>
        </form>

        {/* Login link */}
        <div className="text-center pt-2 border-t-2 border-slate-50 dark:border-slate-700/50 text-sm font-bold text-slate-500">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-primary-500 hover:underline">Đăng nhập</Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
