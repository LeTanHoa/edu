import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Book, Sparkles, Upload } from 'lucide-react';
import api from '../../services/api';

const TeacherProfile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [specialty, setSpecialty] = useState(profile?.specialty?.join(', ') || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
    }
    if (profile) {
      setSpecialty(profile.specialty?.join(', '));
      setBio(profile.bio);
    }
  }, [user, profile]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await api.put('/auth/update-profile', {
        fullName,
        specialty: specialty.split(',').map(s => s.trim()),
        bio
      });
      if (res.data.success) {
        toast.success(res.data.message);
        refreshProfile();
      }
    } catch (error) {
      toast.error('Không thể cập nhật hồ sơ cá nhân!');
    }
    setUpdating(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await api.post('/auth/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        toast.success(res.data.message);
        refreshProfile();
      }
    } catch (error) {
      toast.error('Lỗi tải ảnh đại diện!');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 pb-20 font-bold text-sm">
      
      {/* Title */}
      <div className="flex flex-col gap-2 mb-8">
        <h2 className="text-3xl font-black font-comic">Hồ Sơ Giáo Viên 👩‍🏫</h2>
        <p className="text-slate-500 font-bold text-sm">Chỉnh sửa thông tin cá nhân, cập nhật chuyên môn giảng dạy và tiểu sử.</p>
      </div>

      <div className="card-playful bg-white dark:bg-slate-800 p-8 flex flex-col md:flex-row gap-8 border-slate-100">
        
        {/* Avatar uploads */}
        <div className="flex flex-col items-center gap-4 shrink-0">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-sunny-400 bg-white">
              <img 
                src={user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.username}`} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            <label className="absolute bottom-1 right-1 p-2 bg-primary-500 text-white rounded-full cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-md">
              <input type="file" onChange={handleAvatarUpload} className="hidden" />
              <span>📷</span>
            </label>
          </div>
          <span className="text-xs text-slate-400 uppercase font-black">{user?.role}</span>
        </div>

        {/* Form fields */}
        <form onSubmit={handleProfileUpdate} className="flex-1 flex flex-col gap-4 font-bold text-left text-xs">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 font-bold">Họ và tên giáo viên *</label>
            <input 
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="px-3 py-2.5 rounded-xl border-2 border-slate-100 bg-slate-50 dark:bg-slate-900 text-xs font-semibold focus:outline-none focus:border-primary-400"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 font-bold">Chuyên môn / Môn dạy (cách nhau bằng dấu phẩy) *</label>
            <input 
              type="text" 
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="px-3 py-2.5 rounded-xl border-2 border-slate-100 bg-slate-50 dark:bg-slate-900 text-xs font-semibold focus:outline-none focus:border-primary-400"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 font-bold">Tiểu sử giáo viên</label>
            <textarea 
              rows="4"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="px-3 py-2.5 rounded-xl border-2 border-slate-100 bg-slate-50 dark:bg-slate-900 text-xs font-semibold focus:outline-none focus:border-primary-400"
            />
          </div>

          <button
            type="submit"
            disabled={updating}
            className="w-full mt-4 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl text-xs font-black shadow-[0_4px_0_0_#0284c7] transition-all hover:scale-102"
          >
            {updating ? 'Đang lưu...' : 'Cập Nhật Hồ Sơ'}
          </button>
        </form>

      </div>

    </div>
  );
};

export default TeacherProfile;
