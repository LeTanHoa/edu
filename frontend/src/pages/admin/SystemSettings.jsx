import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Save, Mail, Globe, BookOpen, Trash2 } from 'lucide-react';
import api from '../../services/api';

const SystemSettings = () => {
  const { user } = useAuth();
  const [logoUrl, setLogoUrl] = useState('');
  const [seoTitle, setSeoTitle] = useState('EduKids - Học Vui Mỗi Ngày');
  const [seoDesc, setSeoDesc] = useState('');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    gradeLevel: 1
  });
  const [editingCategoryId, setEditingCategoryId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Fetch settings
    api.get('/admin/settings')
      .then(res => {
        if (res.data.success && res.data.settings) {
          const s = res.data.settings;
          setLogoUrl(s.logoUrl || '');
          setSeoTitle(s.seoConfig?.title || '');
          setSeoDesc(s.seoConfig?.metaDescription || '');
          setSmtpHost(s.smtpSettings?.host || '');
          setSmtpUser(s.smtpSettings?.user || '');
          setSmtpPass(s.smtpSettings?.pass || '');
        }
      })
      .catch(err => console.error(err));
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await api.get('/admin/categories');
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/admin/settings', {
        logoUrl,
        seoConfig: {
          title: seoTitle,
          metaDescription: seoDesc
        },
        smtpSettings: {
          host: smtpHost,
          user: smtpUser,
          pass: smtpPass
        }
      });
      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error('Không thể lưu cấu hình hệ thống!');
    }
    setSaving(false);
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      description: '',
      gradeLevel: 1
    });
    setEditingCategoryId('');
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) {
      toast.error('Vui lòng nhập tên môn học!');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...categoryForm,
        gradeLevel: Number(categoryForm.gradeLevel)
      };
      const res = editingCategoryId
        ? await api.put(`/admin/categories/${editingCategoryId}`, payload)
        : await api.post('/admin/categories', payload);

      if (res.data.success) {
        toast.success(editingCategoryId ? 'Cập nhật môn học thành công!' : 'Tạo môn học mới thành công!');
        resetCategoryForm();
        await loadCategories();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể lưu môn học!');
    }
    setSaving(false);
  };

  const handleEditCategory = (category) => {
    setEditingCategoryId(category._id);
    setCategoryForm({
      name: category.name || '',
      description: category.description || '',
      gradeLevel: category.gradeLevel || 1
    });
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa môn học này?')) return;
    setSaving(true);
    try {
      const res = await api.delete(`/admin/categories/${categoryId}`);
      if (res.data.success) {
        toast.success('Xóa môn học thành công!');
        await loadCategories();
        if (editingCategoryId === categoryId) resetCategoryForm();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể xóa môn học!');
    }
    setSaving(false);
  };

  return (
    <div className="max-w-3xl mx-auto py-6 pb-20 font-bold text-sm">
      
      {/* Title */}
      <div className="flex flex-col gap-2 mb-8">
        <h2 className="text-3xl font-black font-comic">Cấu Hình Hệ Thống ⚙️</h2>
        <p className="text-slate-500 font-bold text-sm">Cập nhật cấu hình thư tín SMTP, thẻ SEO toàn trang và thông tin giao diện.</p>
      </div>

      <form onSubmit={handleSaveSettings} className="flex flex-col gap-8">
        {/* Subject categories */}
        <div className="card-playful bg-white dark:bg-slate-800 p-6 flex flex-col gap-4 border-slate-100 font-semibold text-xs text-left">
          <h3 className="text-sm font-black font-comic text-primary-500 flex items-center gap-1.5 border-b pb-2">
            <BookOpen size={16} />
            <span>Quản Lý Môn Học</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-4">
            <div className="flex flex-col gap-3">
              {categories.length === 0 ? (
                <p className="text-slate-400 font-bold py-4">Chưa có môn học nào. Hãy tạo môn học đầu tiên.</p>
              ) : categories.map((category) => (
                <div key={category._id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3">
                  <button
                    type="button"
                    onClick={() => handleEditCategory(category)}
                    className="text-left flex-1"
                  >
                    <span className="block font-black text-slate-700 dark:text-slate-100">{category.name}</span>
                    <span className="block text-[11px] text-slate-400 mt-1">Lớp {category.gradeLevel} · {category.slug}</span>
                    {category.description && (
                      <span className="block text-[11px] text-slate-500 mt-1">{category.description}</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(category._id)}
                    className="p-2 rounded-xl text-coral-500 hover:bg-coral-50 dark:hover:bg-coral-950/20"
                    title="Xóa môn học"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-4">
              <h4 className="text-xs font-black text-slate-500">{editingCategoryId ? 'Sửa môn học' : 'Tạo môn học mới'}</h4>
              <input
                type="text"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="Tên môn học"
                className="px-3 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 focus:outline-none"
              />
              <textarea
                rows="3"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                placeholder="Mô tả môn học"
                className="px-3 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 focus:outline-none"
              />
              <select
                value={categoryForm.gradeLevel}
                onChange={(e) => setCategoryForm({ ...categoryForm, gradeLevel: e.target.value })}
                className="px-3 py-2.5 rounded-xl border bg-white dark:bg-slate-900 focus:outline-none"
              >
                {[1, 2, 3, 4, 5].map((grade) => (
                  <option key={grade} value={grade}>Lớp {grade}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveCategory}
                  disabled={saving}
                  className="flex-1 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-black"
                >
                  {editingCategoryId ? 'Cập Nhật' : 'Tạo Môn'}
                </button>
                {editingCategoryId && (
                  <button
                    type="button"
                    onClick={resetCategoryForm}
                    className="px-3 py-2.5 border rounded-xl font-black text-slate-500"
                  >
                    Hủy
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* SEO configs */}
        <div className="card-playful bg-white dark:bg-slate-800 p-6 flex flex-col gap-4 border-slate-100 font-semibold text-xs text-left">
          <h3 className="text-sm font-black font-comic text-primary-500 flex items-center gap-1.5 border-b pb-2">
            <Globe size={16} />
            <span>Thẻ Cấu Hình SEO & Tìm Kiếm</span>
          </h3>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 font-bold">Tiêu đề Website chính (SEO Title) *</label>
            <input 
              type="text" 
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className="px-3 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 focus:outline-none"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 font-bold">Mô tả Website (Meta Description) *</label>
            <textarea 
              rows="3"
              value={seoDesc}
              onChange={(e) => setSeoDesc(e.target.value)}
              className="px-3 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 focus:outline-none"
              required
            />
          </div>
        </div>

        {/* SMTP configs */}
        <div className="card-playful bg-white dark:bg-slate-800 p-6 flex flex-col gap-4 border-slate-100 font-semibold text-xs text-left">
          <h3 className="text-sm font-black font-comic text-forest-500 flex items-center gap-1.5 border-b pb-2">
            <Mail size={16} />
            <span>Cấu Hình Mail Server (SMTP)</span>
          </h3>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 font-bold">Host SMTP server</label>
            <input 
              type="text" 
              value={smtpHost}
              onChange={(e) => setSmtpHost(e.target.value)}
              placeholder="ví dụ: smtp.gmail.com"
              className="px-3 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-bold">Tên đăng nhập SMTP Mail</label>
              <input 
                type="text" 
                value={smtpUser}
                onChange={(e) => setSmtpUser(e.target.value)}
                className="px-3 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-bold">Mật khẩu SMTP Mail</label>
              <input 
                type="password" 
                value={smtpPass}
                onChange={(e) => setSmtpPass(e.target.value)}
                className="px-3 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl text-xs font-black shadow-[0_4px_0_0_#0284c7] transition-all hover:scale-102 flex items-center justify-center gap-1.5"
        >
          <Save size={16} />
          <span>{saving ? 'Đang lưu cấu hình...' : 'Lưu Tất Cả Cấu Hình'}</span>
        </button>

      </form>

    </div>
  );
};

export default SystemSettings;
