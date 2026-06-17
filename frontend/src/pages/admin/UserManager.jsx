import React, { useState, useEffect } from 'react';
import { Plus, Search, ShieldAlert, Lock, Unlock, Key } from 'lucide-react';
import api from '../../services/api';

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(true);

  // New user forms
  const [showCreate, setShowCreate] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('student');
  const [newGrade, setNewGrade] = useState(3);

  useEffect(() => {
    loadUsers();
  }, [selectedRole]);

  const loadUsers = async () => {
    try {
      const roleQuery = selectedRole ? `role=${selectedRole}&` : '';
      const keywordQuery = keyword ? `keyword=${keyword}` : '';
      const res = await api.get(`/admin/users?${roleQuery}${keywordQuery}`);
      if (res.data.success) {
        setUsers(res.data.users);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    loadUsers();
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/users', {
        username: newUsername,
        email: newEmail,
        fullName: newFullName,
        password: newPassword,
        role: newRole,
        gradeLevel: Number(newGrade)
      });
      if (res.data.success) {
        alert('Tạo người dùng mới thành công!');
        setNewUsername('');
        setNewEmail('');
        setNewFullName('');
        setNewPassword('');
        setShowCreate(false);
        loadUsers();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi tạo người dùng!');
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const res = await api.post(`/admin/users/${userId}/toggle-status`);
      if (res.data.success) {
        alert(res.data.message);
        loadUsers();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi cập nhật trạng thái!');
    }
  };

  const handleResetPassword = async (userId) => {
    const pwd = prompt('Nhập mật khẩu mới cho người dùng:');
    if (!pwd || !pwd.trim()) return;

    try {
      const res = await api.post(`/admin/users/${userId}/reset-password`, { newPassword: pwd });
      if (res.data.success) {
        alert(res.data.message);
      }
    } catch (error) {
      alert('Không thể đặt lại mật khẩu!');
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-10 font-bold text-sm">
      
      {/* Title bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-3xl font-black font-comic">Quản Lý Người Dùng 👥</h2>
          <p className="text-slate-500 font-bold text-sm">Tạo mới học sinh/giáo viên, khóa/mở khóa tài khoản hoặc reset mật khẩu nhanh.</p>
        </div>

        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-5 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl shadow-sm hover:scale-105 transition-all flex items-center gap-1.5"
        >
          <Plus size={16} />
          <span>Thêm Người Dùng</span>
        </button>
      </div>

      {/* Create User Form Box */}
      {showCreate && (
        <form onSubmit={handleCreateUser} className="card-playful bg-white dark:bg-slate-800 p-6 flex flex-col gap-4 border-slate-100 font-semibold text-xs text-left">
          <h3 className="text-sm font-black font-comic text-primary-500">Tạo tài khoản mới</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-slate-400">Tên đăng nhập *</label>
              <input 
                type="text" 
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="ví dụ: hocsinh2"
                className="px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900 focus:outline-none"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-slate-400">Email *</label>
              <input 
                type="email" 
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="ví dụ: hs2@gmail.com"
                className="px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900 focus:outline-none"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-slate-400">Họ và tên *</label>
              <input 
                type="text" 
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
                placeholder="Nhập họ tên đầy đủ"
                className="px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-slate-400">Mật khẩu ban đầu *</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                className="px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900 focus:outline-none"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-slate-400">Vai trò</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="px-2 py-2 rounded-xl border bg-white dark:bg-slate-900 font-bold"
              >
                <option value="student">Học Sinh</option>
                <option value="teacher">Giáo Viên</option>
                <option value="admin">Quản Trị Viên</option>
              </select>
            </div>
            {newRole === 'student' && (
              <div className="flex flex-col gap-1">
                <label className="text-slate-400">Khối lớp học sinh</label>
                <select
                  value={newGrade}
                  onChange={(e) => setNewGrade(Number(e.target.value))}
                  className="px-2 py-2 rounded-xl border bg-white dark:bg-slate-900 font-bold"
                >
                  {[1, 2, 3, 4, 5].map(g => (
                    <option key={g} value={g}>Lớp {g}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end mt-2 font-bold text-xs">
            <button type="submit" className="px-5 py-2 bg-primary-500 text-white rounded-xl shadow-sm">Hoàn Thành</button>
            <button type="button" onClick={() => setShowCreate(false)} className="px-3 py-2 border rounded-xl">Hủy</button>
          </div>
        </form>
      )}

      {/* Searching filters panel */}
      <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end bg-white dark:bg-slate-800 p-4 rounded-2xl border">
        <div className="flex-1 min-w-[200px] flex flex-col gap-1 font-bold text-xs text-slate-500">
          <label>Tìm kiếm theo tên/tài khoản/email</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Nhập từ khóa..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900 focus:outline-none"
            />
            <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
          </div>
        </div>

        <div className="w-40 flex flex-col gap-1 font-bold text-xs text-slate-500">
          <label>Lọc vai trò</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-2 py-2 border rounded-xl bg-white dark:bg-slate-900 font-bold"
          >
            <option value="">Tất cả các vai trò</option>
            <option value="student">Học Sinh</option>
            <option value="teacher">Giáo Viên</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button type="submit" className="px-5 py-2.5 bg-primary-500 text-white rounded-xl text-xs shadow-sm font-bold">Tìm Kiếm</button>
      </form>

      {/* Users Table */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 text-slate-400 border-b">
                <th className="p-4 font-black">Họ Tên</th>
                <th className="p-4 font-black">Tài Khoản</th>
                <th className="p-4 font-black">Email</th>
                <th className="p-4 font-black">Vai Trò</th>
                <th className="p-4 font-black">Trạng Thái</th>
                <th className="p-4 font-black text-right">Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className="border-b hover:bg-slate-50/50 dark:hover:bg-slate-750/30">
                  <td className="p-4 font-extrabold">{u.fullName}</td>
                  <td className="p-4 text-slate-500">{u.username}</td>
                  <td className="p-4 text-slate-500">{u.email}</td>
                  <td className="p-4 capitalize">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      u.role === 'admin' ? 'bg-coral-100 text-coral-700' :
                      u.role === 'teacher' ? 'bg-sunny-100 text-amber-800' :
                      'bg-primary-100 text-primary-700'
                    }`}>
                      {u.role === 'student' ? 'Học sinh' : u.role === 'teacher' ? 'Giáo viên' : 'Admin'}
                    </span>
                  </td>
                  <td className="p-4 font-extrabold">
                    <span className={u.isActive ? 'text-forest-600' : 'text-coral-500'}>
                      {u.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td className="p-4 flex gap-2 justify-end font-extrabold text-[10px]">
                    <button 
                      onClick={() => handleToggleStatus(u._id)}
                      className={`p-1.5 rounded border flex items-center gap-1 ${
                        u.isActive 
                          ? 'border-coral-200 text-coral-500 hover:bg-coral-50' 
                          : 'border-forest-200 text-forest-500 hover:bg-forest-50'
                      }`}
                    >
                      {u.isActive ? <Lock size={12} /> : <Unlock size={12} />}
                      <span>{u.isActive ? 'Khóa' : 'Mở Khóa'}</span>
                    </button>
                    <button
                      onClick={() => handleResetPassword(u._id)}
                      className="p-1.5 rounded border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center gap-1"
                    >
                      <Key size={12} />
                      <span>Reset Pwd</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default UserManager;
