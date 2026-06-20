import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Award, CheckCircle, Printer, Download } from 'lucide-react';
import api from '../../services/api';

const StudentProfile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [gradeLevel, setGradeLevel] = useState(profile?.gradeLevel || 3);
  const [className, setClassName] = useState(profile?.className || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [activeCertificate, setActiveCertificate] = useState(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
    }
    if (profile) {
      setGradeLevel(profile.gradeLevel);
      setClassName(profile.className);
    }

    api.get('/certificates')
      .then(res => {
        if (res.data.success) {
          setCertificates(res.data.certificates);
        }
      })
      .catch(err => console.error(err));
  }, [user, profile]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await api.put('/auth/update-profile', {
        fullName,
        gradeLevel: Number(gradeLevel),
        className
      });
      if (res.data.success) {
        toast.success(res.data.message);
        refreshProfile();
      }
    } catch (error) {
      toast.error('Không thể cập nhật thông tin cá nhân!');
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
      toast.error('Không thể tải lên ảnh đại diện!');
    }
  };

  const printCertificate = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-8 pb-10 font-bold">
      
      {/* Title */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black font-comic">Hồ Sơ Cá Nhân 🎒</h2>
        <p className="text-slate-500 font-bold text-sm">Quản lý thông tin, đổi ảnh đại diện và xem các chứng chỉ đã đạt được.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Card: Info & Avatar */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <div className="card-playful bg-white dark:bg-slate-800 p-6 flex flex-col items-center gap-6 border-slate-100 text-center">
            
            {/* Avatar block */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary-400 bg-white">
                <img 
                  src={user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.username}`} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
              <label className="absolute bottom-1 right-1 p-2 bg-primary-500 text-white rounded-full cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-md">
                <UploadInput onChange={handleAvatarUpload} />
                <span>📷</span>
              </label>
            </div>

            <div>
              <h3 className="text-xl font-black font-comic">{user?.fullName}</h3>
              <p className="text-xs text-slate-400 font-semibold">{user?.email}</p>
            </div>

            {/* Form */}
            <form onSubmit={handleProfileUpdate} className="w-full flex flex-col gap-3 font-bold text-left">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-600 dark:text-slate-400">Họ và tên của em</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="px-3 py-2 rounded-xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold focus:outline-none focus:border-primary-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-600 dark:text-slate-400">Lớp</label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(Number(e.target.value))}
                    className="px-3 py-2 rounded-xl border-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5].map(g => (
                      <option key={g} value={g}>Lớp {g}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-600 dark:text-slate-400">Tên Lớp</label>
                  <input 
                    type="text" 
                    value={className}
                    placeholder="ví dụ: 3A"
                    onChange={(e) => setClassName(e.target.value)}
                    className="px-3 py-2 rounded-xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold focus:outline-none focus:border-primary-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full mt-2 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl text-xs font-black shadow-[0_3.5px_0_0_#0284c7] transition-all hover:scale-102 active:translate-y-0.5"
              >
                {updating ? 'Đang cập nhật...' : 'Lưu Thay Đổi'}
              </button>
            </form>

          </div>
        </div>

        {/* Right Card: Digital Certificates List & Preview */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          
          {/* Certificate Selection */}
          <div className="card-playful bg-white dark:bg-slate-800 p-6 flex flex-col gap-4 border-slate-100">
            <h3 className="text-lg font-black font-comic flex items-center gap-1.5 text-primary-500">
              <Award />
              <span>Chứng chỉ của em ({certificates.length})</span>
            </h3>

            <div className="flex flex-col gap-2">
              {certificates.map(cert => (
                <div key={cert._id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🎓</span>
                    <div>
                      <p className="text-sm font-black">{cert.courseTitle}</p>
                      <p className="text-[10px] text-slate-400 font-bold">Mã số: {cert.certId}</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setActiveCertificate(cert)}
                    className="px-4 py-2 bg-primary-500 text-white rounded-xl text-xs font-black shadow-[0_2.5px_0_0_#0284c7]"
                  >
                    Xem Chứng Chỉ
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Certificate View Template Modal/Banner */}
          {activeCertificate && (
            <div className="card-playful bg-white dark:bg-slate-800 p-8 flex flex-col gap-6 border-sunny-400 relative overflow-hidden" id="certificate-print-area">
              
              {/* Gold borders */}
              <div className="border-8 border-double border-sunny-400 p-6 flex flex-col items-center text-center gap-6 relative">
                
                {/* Ribbon emblem decoration */}
                <div className="absolute top-0 right-4 text-5xl">🎖️</div>

                <span className="text-xs uppercase tracking-widest text-sunny-600 font-black">Chứng Chỉ Hoàn Thành Khóa Học</span>
                
                <h4 className="text-2xl font-black font-comic text-slate-700 dark:text-slate-100">
                  {activeCertificate.courseTitle}
                </h4>

                <p className="text-xs text-slate-400 font-semibold italic">Chứng nhận học sinh:</p>
                <p className="text-2xl font-black text-primary-600 dark:text-primary-300 font-comic">
                  {activeCertificate.studentName}
                </p>

                <p className="text-xs text-slate-500 font-bold max-w-md">
                  Đã hoàn thành xuất sắc tất cả các bài giảng lý thuyết, bài ôn tập trắc nghiệm và thử thách thực hành trên hệ thống giáo dục EduKids.
                </p>

                <div className="flex justify-between w-full border-t border-dashed pt-4 border-slate-200 dark:border-slate-700 text-[10px] text-slate-400 mt-6 font-semibold">
                  <div>
                    <p>Giáo viên giảng dạy:</p>
                    <p className="font-extrabold text-slate-600 dark:text-slate-300 mt-1">{activeCertificate.teacherName}</p>
                  </div>
                  <div>
                    <p>Ngày cấp chứng nhận:</p>
                    <p className="font-extrabold text-slate-600 dark:text-slate-300 mt-1">
                      {new Date(activeCertificate.issueDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>

              </div>

              {/* Action */}
              <div className="flex gap-2 justify-end w-full shrink-0 font-bold text-xs no-print">
                <button
                  onClick={printCertificate}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-750 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 transition-all border flex items-center gap-1.5"
                >
                  <Printer size={14} />
                  <span>In Chứng Chỉ</span>
                </button>
                <button
                  onClick={() => setActiveCertificate(null)}
                  className="px-4 py-2 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-slate-400"
                >
                  Đóng
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

// Avatar Upload Input Wrapper
const UploadInput = ({ onChange }) => (
  <input 
    type="file" 
    accept="image/*"
    onChange={onChange}
    className="hidden" 
  />
);

export default StudentProfile;
