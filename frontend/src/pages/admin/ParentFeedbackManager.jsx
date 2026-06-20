import React, { useEffect, useState } from 'react';
import { MessageSquareText, RefreshCw, Search, Star, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const STATUS_LABELS = {
  new: 'Mới gửi',
  reviewed: 'Đã xem',
  archived: 'Lưu trữ'
};

const STATUS_STYLES = {
  new: 'bg-primary-100 text-primary-700 border-primary-300',
  reviewed: 'bg-forest-100 text-forest-700 border-forest-300',
  archived: 'bg-slate-100 text-slate-600 border-slate-300'
};

const ParentFeedbackManager = () => {
  const [feedback, setFeedback] = useState([]);
  const [stats, setStats] = useState({ total: 0, new: 0, reviewed: 0, archived: 0 });
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');

  const loadFeedback = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (keyword.trim()) params.set('keyword', keyword.trim());

      const res = await api.get(`/admin/feedback?${params.toString()}`);
      if (res.data.success) {
        setFeedback(res.data.feedback);
        setStats(res.data.stats);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể tải ý kiến phụ huynh');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, [status]);

  const handleSearch = (event) => {
    event.preventDefault();
    loadFeedback();
  };

  const updateLocalFeedback = (feedbackId, changes) => {
    setFeedback((items) => items.map((item) => (
      item._id === feedbackId ? { ...item, ...changes } : item
    )));
  };

  const handleSave = async (item) => {
    setSavingId(item._id);
    try {
      const res = await api.put(`/admin/feedback/${item._id}`, {
        status: item.status,
        adminNote: item.adminNote || ''
      });

      if (res.data.success) {
        toast.success('Cập nhật ý kiến thành công!');
        updateLocalFeedback(item._id, res.data.feedback);
        loadFeedback();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật ý kiến');
    } finally {
      setSavingId('');
    }
  };

  const handleDelete = async (feedbackId) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa ý kiến này?')) return;

    try {
      const res = await api.delete(`/admin/feedback/${feedbackId}`);
      if (res.data.success) {
        toast.success('Xóa ý kiến thành công!');
        setFeedback((items) => items.filter((item) => item._id !== feedbackId));
        loadFeedback();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể xóa ý kiến');
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-10 font-bold text-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black font-comic">Ý Kiến Phụ Huynh 💬</h2>
          <p className="text-slate-500 font-semibold text-sm mt-1">
            Theo dõi góp ý, đánh giá và ghi chú hướng xử lý từ phụ huynh.
          </p>
        </div>
        <button
          onClick={loadFeedback}
          className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all hover:scale-105"
        >
          <RefreshCw size={15} />
          <span>Làm mới</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        {[
          { label: 'Tổng ý kiến', value: stats.total, color: 'border-slate-200' },
          { label: 'Mới gửi', value: stats.new, color: 'border-primary-400' },
          { label: 'Đã xem', value: stats.reviewed, color: 'border-forest-400' },
          { label: 'Lưu trữ', value: stats.archived, color: 'border-slate-400' }
        ].map((item) => (
          <div key={item.label} className={`card-playful p-4 bg-white dark:bg-slate-800 ${item.color}`}>
            <p className="text-xs text-slate-400 font-extrabold uppercase">{item.label}</p>
            <p className="text-3xl font-black font-comic mt-1">{item.value}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
        <div className="flex-1 min-w-[220px] flex flex-col gap-1 text-xs text-slate-500">
          <label>Tìm theo tên, email hoặc nội dung</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={15} />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Nhập từ khóa..."
              className="w-full pl-9 pr-4 py-2.5 border rounded-xl bg-slate-50 dark:bg-slate-900 focus:outline-none"
            />
          </div>
        </div>

        <div className="w-full sm:w-44 flex flex-col gap-1 text-xs text-slate-500">
          <label>Trạng thái</label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="px-3 py-2.5 border rounded-xl bg-white dark:bg-slate-900 font-bold"
          >
            <option value="">Tất cả</option>
            <option value="new">Mới gửi</option>
            <option value="reviewed">Đã xem</option>
            <option value="archived">Lưu trữ</option>
          </select>
        </div>

        <button type="submit" className="px-5 py-2.5 bg-primary-500 text-white rounded-xl text-xs shadow-sm font-bold">Tìm kiếm</button>
      </form>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent" />
        </div>
      ) : feedback.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border-4 border-slate-100 dark:border-slate-700">
          <MessageSquareText className="mx-auto text-slate-300" size={52} />
          <p className="mt-4 font-black text-slate-400 font-comic">Chưa có ý kiến phù hợp.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {feedback.map((item) => (
            <div key={item._id} className="card-playful bg-white dark:bg-slate-800 p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-black">{item.parentName}</h3>
                    <span className={`px-2 py-1 rounded-lg border text-[10px] font-black ${STATUS_STYLES[item.status]}`}>
                      {STATUS_LABELS[item.status]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {item.email} {item.phone ? `· ${item.phone}` : ''} · Lớp {item.gradeLevel}
                  </p>
                  {item.studentName && (
                    <p className="text-xs text-slate-400 mt-1">Học sinh: {item.studentName}</p>
                  )}
                </div>
                <div className="flex gap-1 text-sunny-500 shrink-0">
                  {Array.from({ length: item.rating || 5 }, (_, index) => (
                    <Star key={index} size={15} fill="currentColor" />
                  ))}
                </div>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-semibold bg-slate-50 dark:bg-slate-900 rounded-2xl p-4">
                {item.message}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-3">
                <div className="flex flex-col gap-1 text-xs text-slate-500">
                  <label>Trạng thái xử lý</label>
                  <select
                    value={item.status}
                    onChange={(event) => updateLocalFeedback(item._id, { status: event.target.value })}
                    className="px-3 py-2.5 border rounded-xl bg-white dark:bg-slate-900 font-bold"
                  >
                    <option value="new">Mới gửi</option>
                    <option value="reviewed">Đã xem</option>
                    <option value="archived">Lưu trữ</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1 text-xs text-slate-500">
                  <label>Ghi chú admin</label>
                  <textarea
                    value={item.adminNote || ''}
                    onChange={(event) => updateLocalFeedback(item._id, { adminNote: event.target.value })}
                    rows={2}
                    className="px-3 py-2.5 border rounded-xl bg-slate-50 dark:bg-slate-900 focus:outline-none resize-none font-semibold"
                    placeholder="Ví dụ: đã chuyển giáo viên phụ trách phản hồi..."
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                <span className="text-xs text-slate-400">
                  {new Date(item.createdAt).toLocaleString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleDelete(item._id)}
                    className="px-3 py-2 rounded-xl border border-coral-200 text-coral-500 hover:bg-coral-50 flex items-center gap-1 text-xs font-black"
                  >
                    <Trash2 size={14} />
                    <span>Xóa</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSave(item)}
                    disabled={savingId === item._id}
                    className="px-4 py-2 rounded-xl bg-primary-500 disabled:bg-slate-300 text-white text-xs font-black"
                  >
                    {savingId === item._id ? 'Đang lưu...' : 'Lưu xử lý'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParentFeedbackManager;
