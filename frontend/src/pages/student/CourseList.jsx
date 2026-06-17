import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Book, CheckCircle, Clock } from 'lucide-react';
import api from '../../services/api';

const MyCourses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses/enrolled')
      .then(res => {
        if (res.data.success) {
          setCourses(res.data.courses);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      
      {/* Title */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black font-comic">Lớp Học Của Em 🎒</h2>
        <p className="text-slate-500 font-bold text-sm">Nơi lưu trữ những bài học bé đang theo dõi và đã hoàn thành.</p>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border-4 border-slate-100 dark:border-slate-700 flex flex-col items-center gap-4">
          <span className="text-6xl">📚</span>
          <h3 className="text-2xl font-black font-comic">Bé chưa đăng ký lớp học nào</h3>
          <p className="text-slate-400 font-bold max-w-sm">Hãy ghé qua Thư viện khóa học để chọn những lớp học lý thú nhất nhé!</p>
          <Link 
            to="/courses" 
            className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl font-black text-sm shadow-[0_4px_0_0_#0284c7]"
          >
            Đến Thư Viện Khóa Học
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map(course => (
            <div key={course._id} className="card-playful bg-white dark:bg-slate-800 flex flex-col justify-between">
              
              <div className="h-40 bg-primary-100 flex items-center justify-center text-5xl relative overflow-hidden border-b-4 border-slate-100 dark:border-slate-700">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <span>📚</span>
                )}
                {course.isCompleted && (
                  <div className="absolute top-3 right-3 bg-forest-500 border-2 border-white px-3 py-1 rounded-full text-xs font-black text-white shadow-sm flex items-center gap-1">
                    <CheckCircle size={12} />
                    <span>Hoàn thành</span>
                  </div>
                )}
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between gap-6">
                <div>
                  <span className="text-xs font-black uppercase text-primary-500">{course.category?.name}</span>
                  <h3 className="text-lg font-black mt-1 line-clamp-1">{course.title}</h3>
                  <p className="text-slate-400 text-xs font-semibold mt-1">Cô giáo: {course.instructor?.fullName}</p>
                </div>

                <div className="flex flex-col gap-2 font-bold">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Tiến độ bài học:</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden border">
                    <div 
                      className={`h-full transition-all ${course.isCompleted ? 'bg-forest-500' : 'bg-primary-500'}`}
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/student/courses/${course._id}`)}
                  className={`w-full py-3 text-white rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-1.5 ${
                    course.isCompleted 
                      ? 'bg-forest-500 hover:bg-forest-600 shadow-[0_4px_0_0_#16a34a]' 
                      : 'bg-primary-500 hover:bg-primary-600 shadow-[0_4px_0_0_#0284c7]'
                  }`}
                >
                  <Book size={18} />
                  <span>Vào Lớp Học 🚀</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default MyCourses;
