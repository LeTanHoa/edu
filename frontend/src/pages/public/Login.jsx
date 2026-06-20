import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Sparkles } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username || !password) {
      setError('Vui lòng điền đầy đủ tên đăng nhập và mật khẩu!');
      toast.error('Vui lòng điền đầy đủ tên đăng nhập và mật khẩu!');
      setLoading(false);
      return;
    }

    const res = await login(username, password);
    if (res.success) {
      toast.success('Đăng nhập thành công! Chào mừng bé 🎉');
      // Navigate based on user role
      navigate(`/${res.user.role}`);
    } else {
      setError(res.message || 'Tên đăng nhập hoặc mật khẩu không chính xác!');
      toast.error(res.message || 'Đăng nhập thất bại, đang bị lỗi!');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-6 py-12 bg-sky-50/20 dark:bg-slate-900">
      <div className="w-full max-w-md card-playful bg-white dark:bg-slate-800 p-8 flex flex-col gap-6">
        
        {/* Title */}
        <div className="text-center flex flex-col gap-2">
          <span className="text-5xl animate-bounce">🎒</span>
          <h2 className="text-3xl font-black font-comic">Đăng Nhập EduKids</h2>
          <p className="text-slate-500 font-bold text-sm">Vào lớp học vui vẻ cùng cô giáo và các bạn nào!</p>
        </div>

        {error && (
          <div className="p-4 bg-coral-100 border-2 border-coral-500 text-coral-700 font-bold rounded-2xl text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-bold">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-extrabold text-slate-600 dark:text-slate-400">Tên đăng nhập / Tài khoản</label>
            <input 
              type="text" 
              placeholder="Nhập tên đăng nhập (ví dụ: student)" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="px-4 py-3 rounded-2xl border-4 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:border-primary-400 focus:outline-none transition-all text-base font-semibold"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-extrabold text-slate-600 dark:text-slate-400">Mật khẩu</label>
              <Link to="/forgot-password" className="text-xs text-primary-500 hover:underline">Quên mật khẩu?</Link>
            </div>
            <input 
              type="password" 
              placeholder="Nhập mật khẩu của em" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-4 py-3 rounded-2xl border-4 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:border-primary-400 focus:outline-none transition-all text-base font-semibold"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 py-4 bg-sunny-500 hover:bg-sunny-600 text-white font-extrabold text-lg rounded-2xl shadow-[0_5px_0_0_#d97706] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Đang Đăng Nhập...' : (
              <>
                <Sparkles size={20} />
                <span>Bắt Đầu Học 🚀</span>
              </>
            )}
          </button>
        </form>

        {/* Register link */}
        <div className="text-center pt-4 border-t-2 border-slate-50 dark:border-slate-700/50 text-sm font-bold text-slate-500">
          Chưa có tài khoản học sinh?{' '}
          <Link to="/register" className="text-primary-500 hover:underline">Đăng ký ngay!</Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
