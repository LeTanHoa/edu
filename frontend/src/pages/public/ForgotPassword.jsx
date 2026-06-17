import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, KeyRound, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../../services/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep]           = useState('email'); // 'email' | 'otp' | 'done'
  const [email, setEmail]         = useState('');
  const [otp, setOtp]             = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [message, setMessage]     = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    if (!email.trim()) { setError('Vui lòng nhập địa chỉ email.'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.success) {
        setMessage(res.data.message);
        setStep('otp');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Yêu cầu thất bại. Vui lòng kiểm tra lại email.');
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    if (!otp.trim() || !newPassword.trim()) {
      setError('Vui lòng nhập đầy đủ mã OTP và mật khẩu mới.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { email, otp, newPassword });
      if (res.data.success) {
        setStep('done');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-6 py-12 bg-sky-50/20 dark:bg-slate-900">
      <div className="w-full max-w-md card-playful bg-white dark:bg-slate-800 p-8 flex flex-col gap-6">

        {/* Done state */}
        {step === 'done' ? (
          <div className="flex flex-col items-center gap-6 text-center py-4">
            <CheckCircle size={56} className="text-forest-500" />
            <h2 className="text-2xl font-black font-comic">Mật Khẩu Đã Được Đặt Lại!</h2>
            <p className="text-slate-500 font-semibold text-sm">
              Mật khẩu mới của bạn đã được cập nhật thành công. Vui lòng đăng nhập lại.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3.5 bg-sunny-500 text-white font-extrabold rounded-2xl shadow-[0_4px_0_0_#d97706] hover:scale-105 transition-all"
            >
              Đăng Nhập Ngay 🚀
            </button>
          </div>
        ) : (
          <>
            {/* Title */}
            <div className="text-center flex flex-col gap-2">
              <span className="text-5xl">{step === 'email' ? '📬' : '🔐'}</span>
              <h2 className="text-2xl font-black font-comic">
                {step === 'email' ? 'Quên Mật Khẩu?' : 'Nhập Mã OTP'}
              </h2>
              <p className="text-slate-400 font-semibold text-sm">
                {step === 'email'
                  ? 'Nhập địa chỉ email đã đăng ký. Hệ thống sẽ gửi mã OTP khôi phục cho bạn.'
                  : `Mã OTP đã được gửi tới ${email}. Kiểm tra hộp thư và nhập mã bên dưới.`}
              </p>
            </div>

            {error && (
              <div className="p-3 bg-coral-100 border-2 border-coral-400 text-coral-700 font-bold rounded-2xl text-sm">
                ⚠️ {error}
              </div>
            )}
            {message && (
              <div className="p-3 bg-forest-100 border-2 border-forest-400 text-forest-700 font-bold rounded-2xl text-sm">
                ✅ {message}
              </div>
            )}

            {/* Step 1: Email */}
            {step === 'email' && (
              <form onSubmit={handleSendOtp} className="flex flex-col gap-4 font-bold">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-extrabold text-slate-600 dark:text-slate-400">Địa chỉ Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 text-slate-400" size={16} />
                    <input
                      type="email"
                      placeholder="Nhập email đã đăng ký..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border-4 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:border-primary-400 focus:outline-none transition-all text-sm font-semibold"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3.5 bg-sunny-500 hover:bg-sunny-600 text-white font-extrabold rounded-2xl shadow-[0_4px_0_0_#d97706] transition-all hover:scale-102 active:translate-y-0.5"
                >
                  {loading ? 'Đang gửi...' : 'Gửi Mã OTP 📧'}
                </button>
              </form>
            )}

            {/* Step 2: OTP + New password */}
            {step === 'otp' && (
              <form onSubmit={handleResetPassword} className="flex flex-col gap-4 font-bold">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-extrabold text-slate-600 dark:text-slate-400">Mã OTP (6 chữ số) *</label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-3.5 text-slate-400" size={16} />
                    <input
                      type="text"
                      placeholder="Ví dụ: 123456"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border-4 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:border-primary-400 focus:outline-none transition-all text-sm font-semibold tracking-widest"
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-extrabold text-slate-600 dark:text-slate-400">Mật Khẩu Mới *</label>
                  <input
                    type="password"
                    placeholder="Nhập mật khẩu mới..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border-4 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:border-primary-400 focus:outline-none transition-all text-sm font-semibold"
                    required
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="px-4 py-3 border-4 border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-sunny-500 hover:bg-sunny-600 text-white font-extrabold rounded-2xl shadow-[0_4px_0_0_#d97706] transition-all hover:scale-102"
                  >
                    {loading ? 'Đang xử lý...' : 'Đặt Lại Mật Khẩu 🔑'}
                  </button>
                </div>
              </form>
            )}

            <div className="text-center text-sm font-bold text-slate-400 pt-2 border-t-2 border-slate-50 dark:border-slate-700/50">
              Nhớ mật khẩu rồi?{' '}
              <Link to="/login" className="text-primary-500 hover:underline">Đăng nhập</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
