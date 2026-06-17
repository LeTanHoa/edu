import React, { useState, useEffect } from 'react';
import { FileText, RefreshCw, Search } from 'lucide-react';
import api from '../../services/api';

const ACTION_COLORS = {
  LOGIN_SUCCESS:    'bg-forest-100 text-forest-700 border-forest-300',
  REGISTER_SUCCESS: 'bg-primary-100 text-primary-700 border-primary-300',
  LOGOUT:           'bg-slate-100 text-slate-600 border-slate-300',
  COURSE_ENROLL:    'bg-sky-100 text-sky-700 border-sky-300',
  QUIZ_SUBMIT:      'bg-playful-purple/10 text-purple-700 border-purple-300',
  BADGE_CLAIM:      'bg-sunny-100 text-amber-700 border-sunny-400',
  ADMIN_CREATE_USER:'bg-coral-100 text-coral-700 border-coral-300',
  USER_LOCK:        'bg-coral-100 text-coral-700 border-coral-300',
  USER_UNLOCK:      'bg-forest-100 text-forest-700 border-forest-300',
  RESET_PASSWORD:   'bg-orange-100 text-orange-700 border-orange-300',
  UPDATE_SETTINGS:  'bg-slate-100 text-slate-600 border-slate-300',
};

const AuditLogs = () => {
  const [logs, setLogs]           = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [keyword, setKeyword]     = useState('');
  const [loading, setLoading]     = useState(true);

  const loadLogs = () => {
    setLoading(true);
    api.get('/admin/logs')
      .then(res => {
        if (res.data.success) {
          setLogs(res.data.logs);
          setFiltered(res.data.logs);
        }
        setLoading(false);
      })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => { loadLogs(); }, []);

  const handleSearch = (e) => {
    const q = e.target.value;
    setKeyword(q);
    if (!q.trim()) {
      setFiltered(logs);
    } else {
      const lower = q.toLowerCase();
      setFiltered(logs.filter(l =>
        l.action?.toLowerCase().includes(lower) ||
        l.details?.toLowerCase().includes(lower) ||
        l.user?.username?.toLowerCase().includes(lower) ||
        l.user?.fullName?.toLowerCase().includes(lower)
      ));
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-10 font-bold text-sm">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black font-comic">Nhật Ký Hệ Thống 📋</h2>
          <p className="text-slate-500 font-semibold text-sm mt-1">
            Theo dõi toàn bộ hoạt động đăng nhập, thao tác người dùng và sự kiện hệ thống.
          </p>
        </div>
        <button
          onClick={loadLogs}
          className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all hover:scale-105"
        >
          <RefreshCw size={15} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Search bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-3 text-slate-400" size={16} />
        <input
          type="text"
          placeholder="Tìm theo hành động, người dùng, chi tiết..."
          value={keyword}
          onChange={handleSearch}
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border-4 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary-400 focus:outline-none transition-all text-sm"
        />
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-bold">
        {[
          { label: 'Tổng sự kiện', value: logs.length, icon: '📋', color: 'border-slate-200' },
          { label: 'Đăng nhập', value: logs.filter(l => l.action === 'LOGIN_SUCCESS').length, icon: '🔑', color: 'border-forest-400' },
          { label: 'Đăng ký', value: logs.filter(l => l.action === 'REGISTER_SUCCESS').length, icon: '👤', color: 'border-primary-400' },
          { label: 'Hành động Admin', value: logs.filter(l => l.action?.startsWith('ADMIN_')).length, icon: '⚙️', color: 'border-coral-400' },
        ].map(stat => (
          <div key={stat.label} className={`card-playful p-4 bg-white dark:bg-slate-800 flex items-center gap-3 ${stat.color}`}>
            <span className="text-2xl">{stat.icon}</span>
            <div>
              <p className="text-xs text-slate-400 font-extrabold uppercase">{stat.label}</p>
              <p className="text-2xl font-black font-comic">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Logs table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border-4 border-slate-100 dark:border-slate-700">
          <span className="text-5xl">📭</span>
          <p className="mt-4 font-black text-slate-400 font-comic">Không tìm thấy nhật ký nào.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/50 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 text-slate-400 border-b border-slate-100 dark:border-slate-700">
                <th className="p-4 font-black">Thời Gian</th>
                <th className="p-4 font-black">Người Dùng</th>
                <th className="p-4 font-black">Hành Động</th>
                <th className="p-4 font-black">Chi Tiết</th>
                <th className="p-4 font-black">IP</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(log => {
                const colorClass = ACTION_COLORS[log.action] || 'bg-slate-100 text-slate-600 border-slate-300';
                return (
                  <tr key={log._id} className="border-b border-slate-50 dark:border-slate-700/30 hover:bg-slate-50/50 dark:hover:bg-slate-750/20 transition-colors">
                    <td className="p-4 text-slate-400 font-semibold whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('vi-VN', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="p-4">
                      {log.user ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="font-extrabold">{log.user.fullName}</span>
                          <span className="text-[10px] text-slate-400">@{log.user.username}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300 italic">Hệ thống</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-lg border text-[10px] font-black whitespace-nowrap ${colorClass}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 font-semibold max-w-xs truncate">
                      {log.details || '—'}
                    </td>
                    <td className="p-4 text-slate-400 font-semibold">
                      {log.ip || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
