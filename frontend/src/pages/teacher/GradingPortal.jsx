import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FileText, ClipboardCheck, ArrowRight, User } from 'lucide-react';
import api from '../../services/api';

const GradingPortal = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [activeSubmission, setActiveSubmission] = useState(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      const res = await api.get('/courses/submissions/pending');
      if (res.data.success) {
        setSubmissions(res.data.submissions);
        console.log(activeSubmission)
        if (res.data.submissions.length > 0) {
          setActiveSubmission(res.data.submissions[0]);
        } else {
          setActiveSubmission(null);
        }
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const downloadFile = async (fileUrl) => {
    try {
      const response = await fetch(
        `http://localhost:8000${fileUrl}`
      );

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = fileUrl.split("/").pop();

      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  };
  console.log(activeSubmission)

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    if (!activeSubmission || saving) return;
    if (grade === '') {
      alert('Vui lòng nhập điểm số!');
      return;
    }

    setSaving(true);
    try {
      const res = await api.post(`/courses/submissions/${activeSubmission._id}/grade`, {
        grade: Number(grade),
        feedback
      });

      if (res.data.success) {
        alert('Lưu điểm số bài tập thành công!');
        setGrade('');
        setFeedback('');
        loadSubmissions();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi chấm điểm!');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-10 font-bold text-sm">

      {/* Left List: Pending submissions */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6">
        <div className="card-playful bg-white dark:bg-slate-800 p-6 flex flex-col gap-4 border-slate-100">
          <div className="border-b pb-4">
            <h3 className="text-base font-black font-comic">Bài Nộp Chờ Chấm ({submissions.length}) 📝</h3>
          </div>

          <div className="flex flex-col gap-2">
            {submissions.length === 0 ? (
              <p className="text-xs text-slate-400 font-bold text-center py-6">Tuyệt vời! Không còn bài tập nào chờ chấm.</p>
            ) : (
              submissions.map(sub => (
                <button
                  key={sub._id}
                  onClick={() => setActiveSubmission(sub)}
                  className={`w-full p-3 rounded-2xl text-left transition-all border flex flex-col gap-1.5 ${activeSubmission?._id === sub._id
                    ? 'bg-primary-50 dark:bg-slate-900 border-primary-400 text-primary-800 dark:text-primary-300'
                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700/50 hover:bg-slate-50'
                    }`}
                >
                  <span className="text-xs font-black truncate">{sub.assignment?.title}</span>
                  <div className="flex justify-between text-[10px] text-slate-400 w-full font-semibold">
                    <span>Học sinh: {sub.student?.fullName}</span>
                    <span>Lớp {sub.assignment?.course?.title ? '3' : '3'}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right panel: Evaluation Details Form */}
      <div className="flex-1 flex flex-col gap-6">
        {activeSubmission ? (
          <div className="card-playful bg-white dark:bg-slate-800 p-8 flex flex-col gap-6 border-slate-100">

            {/* Submission Headers */}
            <div className="border-b pb-4 flex justify-between items-start">
              <div>
                <span className="text-xs text-primary-500 font-black uppercase">Chấm Điểm Bài Tập</span>
                <h3 className="text-lg font-black font-comic mt-1">{activeSubmission.assignment?.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Khóa học: {activeSubmission.assignment?.course?.title}</p>
              </div>

              <div className="text-right text-xs text-slate-400 font-bold">
                <p>Học sinh: {activeSubmission.student?.fullName}</p>
                <p className="mt-0.5">Nộp ngày: {new Date(activeSubmission.createdAt).toLocaleDateString('vi-VN')}</p>
              </div>
            </div>

            {/* Answer Text & file download */}
            <div className="flex flex-col gap-4 bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-black text-slate-400 uppercase">Nội dung bài làm của học sinh</h4>
              <p className="text-sm text-slate-700 dark:text-slate-200 font-semibold whitespace-pre-line">
                {activeSubmission.content || 'Không ghi nhận nội dung văn bản.'}
              </p>

              {activeSubmission.fileUrl && (
                <div className="border-t pt-3 mt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <FileText size={14} />
                    <span>File bài làm của bé</span>
                  </span>
                  <button
                    onClick={() => downloadFile(activeSubmission?.fileUrl)}
                    className="px-4 py-1.5 bg-primary-100 hover:bg-primary-200 dark:bg-slate-850 dark:hover:bg-slate-750 text-primary-700 dark:text-primary-300 rounded-xl text-xs font-black"
                  >
                    Mở / Tải Về 📥
                  </button>
                </div>
              )}
            </div>

            {/* Grading Form */}
            <form onSubmit={handleGradeSubmit} className="flex flex-col gap-4 text-xs">
              <h4 className="text-xs font-black text-primary-500 uppercase border-b pb-2">Đánh giá của giáo viên</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 font-bold">Điểm Số (Mức cao nhất: {activeSubmission.assignment?.maxPoints}đ)</label>
                  <input
                    type="number"
                    min="0"
                    max={activeSubmission.assignment?.maxPoints}
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="ví dụ: 9"
                    className="px-3 py-2 rounded-xl border-2 border-slate-100 bg-slate-50 dark:bg-slate-950 font-bold focus:outline-none"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 font-bold">Nhận xét bài làm</label>
                  <textarea
                    rows="2"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Em giải bài toán rất nhanh và chữ viết đẹp..."
                    className="px-3 py-2 rounded-xl border-2 border-slate-100 bg-slate-50 dark:bg-slate-950 font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full mt-4 py-3 bg-forest-500 hover:bg-forest-600 text-white rounded-2xl text-xs font-black shadow-[0_3.5px_0_0_#16a34a] hover:scale-102 transition-all flex items-center justify-center gap-1.5"
              >
                <ClipboardCheck size={16} />
                <span>{saving ? 'Đang lưu điểm...' : 'Hoàn Thành Chấm Bài 🎉'}</span>
              </button>
            </form>

          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border">
            <h3 className="text-slate-400 font-comic text-base">Vui lòng chọn bài nộp ở danh sách bên trái để tiến hành chấm điểm nhé!</h3>
          </div>
        )}
      </div>

    </div>
  );
};

export default GradingPortal;
