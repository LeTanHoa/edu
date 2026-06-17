import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  BookOpen, ChevronRight, FileText, CheckCircle, HelpCircle, 
  MessageSquare, Send, Upload, Award, PlayCircle 
} from 'lucide-react';
import api from '../../services/api';

const CourseViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [courseData, setCourseData] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  // Homework upload state
  const [assignments, setAssignments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [homeworkText, setHomeworkText] = useState('');
  const [uploadingHomework, setUploadingHomework] = useState({});

  // Comments thread state
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    loadCourseDetails();
  }, [id]);

  useEffect(() => {
    if (courseData && courseData.chapters) {
      const lessonId = searchParams.get('lesson');
      if (lessonId) {
        // Find specific lesson
        for (let chap of courseData.chapters) {
          const found = chap.lessons.find(l => l._id === lessonId);
          if (found) {
            setCurrentLesson(found);
            loadLessonDetails(found._id);
            return;
          }
        }
      }
      // Default to first lesson of first chapter
      if (courseData.chapters.length > 0 && courseData.chapters[0].lessons.length > 0) {
        const firstLesson = courseData.chapters[0].lessons[0];
        setCurrentLesson(firstLesson);
        setSearchParams({ lesson: firstLesson._id });
        loadLessonDetails(firstLesson._id);
      }
    }
  }, [courseData, searchParams]);

  const loadCourseDetails = async () => {
    try {
      const res = await api.get(`/courses/${id}`);
      if (res.data.success) {
        setCourseData(res.data);
        // Load assignments for this course
        const assignRes = await api.get(`/courses/${id}/assignments`);
        if (assignRes.data.success) {
          setAssignments(assignRes.data.assignments);
        }
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const loadLessonDetails = async (lessonId) => {
    // Fetch comments
    try {
      const comRes = await api.get(`/courses/lessons/${lessonId}/comments`);
      if (comRes.data.success) {
        setComments(comRes.data.comments);
      }
      // Fetch quizzes for this lesson
      const quizRes = await api.get(`/courses/lessons/${lessonId}/quizzes`);
      if (quizRes.data.success) {
        setQuizzes(quizRes.data.quizzes);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLessonComplete = async () => {
    if (!currentLesson || completing) return;
    setCompleting(true);
    try {
      const res = await api.post(`/courses/lessons/${currentLesson._id}/complete`);
      if (res.data.success) {
        alert(`🎉 Chúc mừng em đã hoàn thành bài học! Cập nhật tiến độ: ${res.data.progress}%`);
        refreshProfile();
        // Reload course data to show updated checkmarks
        loadCourseDetails();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra!');
    }
    setCompleting(false);
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentLesson) return;

    try {
      const res = await api.post(`/courses/lessons/${currentLesson._id}/comments`, {
        content: newComment
      });
      if (res.data.success) {
        setComments([res.data.comment, ...comments]);
        setNewComment('');
      }
    } catch (error) {
      alert('Không thể đăng bình luận!');
    }
  };

  const handleHomeworkSubmit = async (e, assignmentId) => {
    e.preventDefault();
    setUploadingHomework({ ...uploadingHomework, [assignmentId]: true });
    
    try {
      const formData = new FormData();
      formData.append('content', homeworkText);
      if (selectedFile) {
        formData.append('submissionFile', selectedFile);
      }

      const res = await api.post(`/courses/assignments/${assignmentId}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        alert(res.data.message);
        setHomeworkText('');
        setSelectedFile(null);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi nộp bài tập!');
    }
    setUploadingHomework({ ...uploadingHomework, [assignmentId]: false });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-black text-coral-500 font-comic">Không tìm thấy dữ liệu lớp học!</h2>
      </div>
    );
  }

  const { course, chapters, completedLessons, progress } = courseData;

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-10 min-h-[80vh]">
      
      {/* Lessons Sidebar */}
      <div className="w-full lg:w-80 flex flex-col gap-6 font-bold">
        <div className="card-playful bg-white dark:bg-slate-800 p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1 border-b pb-4">
            <span className="text-xs text-primary-500 font-black uppercase">Đang theo học</span>
            <h3 className="text-lg font-black line-clamp-1">{course.title}</h3>
            <span className="text-xs text-slate-400">Tiến độ khóa học: {progress}%</span>
          </div>

          <div className="flex flex-col gap-4 max-h-[50vh] overflow-y-auto pr-2">
            {chapters.map((chap) => (
              <div key={chap._id} className="flex flex-col gap-2">
                <h4 className="text-xs font-black text-slate-400">{chap.title}</h4>
                <div className="flex flex-col gap-1 pl-2">
                  {chap.lessons.map(l => {
                    const isSelected = currentLesson?._id === l._id;
                    const isDone = completedLessons.includes(l._id);
                    return (
                      <button
                        key={l._id}
                        onClick={() => setSearchParams({ lesson: l._id })}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all text-left ${
                          isSelected 
                            ? 'bg-primary-100 dark:bg-slate-700 text-primary-700 dark:text-primary-300' 
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 max-w-[180px] truncate">
                          <span>{l.contentType === 'video' ? '📺' : '📄'}</span>
                          <span className="truncate">{l.title}</span>
                        </div>
                        {isDone && <CheckCircle size={14} className="text-forest-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Worksheets list */}
        {assignments.length > 0 && (
          <div className="card-playful bg-white dark:bg-slate-800 p-6 flex flex-col gap-4">
            <h3 className="text-sm font-black font-comic flex items-center gap-1.5 text-coral-500">
              <FileText size={18} />
              <span>Bài tập về nhà 📝</span>
            </h3>
            <div className="flex flex-col gap-3">
              {assignments.map(a => (
                <div key={a._id} className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-xs flex flex-col gap-2">
                  <p className="font-extrabold line-clamp-1">{a.title}</p>
                  <p className="text-slate-400">Hạn nộp: {new Date(a.deadline).toLocaleDateString('vi-VN')}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-8">
        {currentLesson ? (
          <div className="flex flex-col gap-8">
            
            {/* Lesson Title & Complete button */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl border-4 border-slate-100 dark:border-slate-700/80 shadow-sm">
              <div>
                <span className="text-xs font-black uppercase text-primary-500">Bài giảng</span>
                <h2 className="text-2xl font-black font-comic mt-1">{currentLesson.title}</h2>
              </div>

              <button
                onClick={handleLessonComplete}
                disabled={completing || completedLessons.includes(currentLesson._id)}
                className={`px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-1.5 transition-all hover:scale-105 active:translate-y-0.5 ${
                  completedLessons.includes(currentLesson._id)
                    ? 'bg-forest-100 border-2 border-forest-500 text-forest-700 pointer-events-none'
                    : 'bg-sunny-500 text-white shadow-[0_4px_0_0_#d97706]'
                }`}
              >
                <CheckCircle size={18} />
                <span>{completedLessons.includes(currentLesson._id) ? 'Đã Hoàn Thành' : 'Đánh Dấu Hoàn Thành'}</span>
              </button>
            </div>

            {/* Video Player or Body Text */}
            {currentLesson.contentType === 'video' && currentLesson.contentUrl ? (
              <div className="w-full aspect-video rounded-3xl overflow-hidden border-8 border-white dark:border-slate-800 shadow-lg bg-black">
                <iframe
                  src={currentLesson.contentUrl}
                  title={currentLesson.title}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="card-playful bg-white dark:bg-slate-800 p-8 flex flex-col gap-4">
                <h3 className="text-xl font-black border-b pb-4">Nội dung bài đọc</h3>
                <div className="prose dark:prose-invert font-bold text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line text-sm">
                  {currentLesson.bodyText || 'Chưa có nội dung chi tiết bài đọc. Bé vui lòng tải tài liệu đính kèm bên dưới.'}
                </div>
              </div>
            )}

            {/* Quizzes and Worksheets linked to this lesson */}
            {(quizzes.length > 0 || assignments.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-bold">
                
                {/* Quizzes List */}
                {quizzes.length > 0 && (
                  <div className="card-playful p-6 bg-white dark:bg-slate-800 flex flex-col gap-4 border-sunny-400">
                    <h3 className="text-base font-black text-sunny-600 flex items-center gap-2">
                      <HelpCircle />
                      <span>Bài ôn tập nhanh 🧠</span>
                    </h3>
                    <div className="flex flex-col gap-2">
                      {quizzes.map(q => (
                        <div key={q._id} className="flex items-center justify-between p-3 bg-sunny-50/50 dark:bg-slate-900 rounded-2xl border border-sunny-200">
                          <span className="text-xs truncate max-w-[180px]">{q.title}</span>
                          <Link
                            to={`/student/quiz/${q._id}`}
                            className="px-4 py-1.5 bg-sunny-500 hover:bg-sunny-600 text-white rounded-xl text-xs font-black shadow-[0_2.5px_0_0_#d97706] transition-all hover:scale-102"
                          >
                            Làm bài
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Worksheets Upload Submit */}
                {assignments.length > 0 && (
                  <div className="card-playful p-6 bg-white dark:bg-slate-800 flex flex-col gap-4 border-coral-400">
                    <h3 className="text-base font-black text-coral-500 flex items-center gap-2">
                      <Upload />
                      <span>Nộp bài tập về nhà 📝</span>
                    </h3>
                    <div className="flex flex-col gap-4">
                      {assignments.map((assignment) => (
                        <form key={assignment._id} onSubmit={(e) => handleHomeworkSubmit(e, assignment._id)} className="flex flex-col gap-3 border border-coral-100 dark:border-slate-700 rounded-2xl p-3">
                          <div>
                            <p className="text-xs font-black">{assignment.title}</p>
                            <p className="text-[11px] text-slate-400 mt-1">{assignment.instructions}</p>
                          </div>
                          <textarea
                            rows="2"
                            placeholder="Nhập câu trả lời của em hoặc nhận xét..."
                            value={homeworkText}
                            onChange={(e) => setHomeworkText(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold focus:outline-none"
                          />
                          
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="file"
                              onChange={(e) => setSelectedFile(e.target.files[0])}
                              className="text-xs font-semibold text-slate-400 w-44"
                            />
                            <button
                              type="submit"
                              disabled={uploadingHomework[assignment._id]}
                              className="px-4 py-2 bg-coral-500 text-white rounded-xl text-xs font-black shadow-[0_3px_0_0_#e11d48]"
                            >
                              {uploadingHomework[assignment._id] ? 'Đang nộp...' : 'Gửi bài'}
                            </button>
                          </div>
                        </form>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Lesson Comments Section */}
            <div className="card-playful bg-white dark:bg-slate-800 p-6 flex flex-col gap-6">
              <h3 className="text-lg font-black font-comic flex items-center gap-1.5">
                <MessageSquare className="text-primary-500" />
                <span>Hỏi đáp bài học ({comments.length})</span>
              </h3>

              {/* Comment Input */}
              <form onSubmit={handlePostComment} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Bé thắc mắc gì? Hãy đặt câu hỏi ở đây để cô giáo giải đáp nhé..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-2xl border-4 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:border-primary-400 focus:outline-none text-sm font-semibold"
                />
                <button
                  type="submit"
                  className="p-3 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl transition-all shadow-[0_4px_0_0_#0284c7]"
                >
                  <Send size={18} />
                </button>
              </form>

              {/* Comments list */}
              <div className="flex flex-col gap-4 max-h-[40vh] overflow-y-auto pr-2">
                {comments.length === 0 ? (
                  <p className="text-slate-400 text-xs font-bold text-center py-4">Chưa có thảo luận nào cho bài học này. Hãy gửi câu hỏi đầu tiên!</p>
                ) : (
                  comments.map(c => (
                    <div key={c._id} className="flex gap-3 text-xs font-bold">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-50 border shrink-0">
                        <img 
                          src={c.user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${c.user?.username}`} 
                          alt="Avatar" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                          <span className="font-black">{c.user?.fullName}</span>
                          <span className="text-[10px] text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 font-semibold mt-1 whitespace-pre-line">{c.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-xl font-bold font-comic text-slate-400">Chọn bài giảng ở danh mục bên trái để bắt đầu học nhé!</h3>
          </div>
        )}
      </div>

    </div>
  );
};

export default CourseViewer;
