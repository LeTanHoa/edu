import React, { useEffect, useMemo, useState } from 'react';
import { Plus, BookOpen, Video, FileText, ClipboardList, HelpCircle, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../../services/api';

const emptyCourse = {
  title: '',
  description: '',
  gradeLevel: 3,
  category: '',
  thumbnail: ''
};

const emptyLesson = {
  chapterId: '',
  title: '',
  contentType: 'video',
  contentUrl: '',
  bodyText: '',
  duration: 10
};

const emptyAssignment = {
  title: '',
  instructions: '',
  chapterId: '',
  deadline: '',
  maxPoints: 10,
  fileUrl: ''
};

const emptyQuiz = {
  title: '',
  description: '',
  lessonId: '',
  chapterId: '',
  timeLimit: 10,
  passingScore: 50
};

const defaultAnswers = [
  { text: '', isCorrect: true },
  { text: '', isCorrect: false },
  { text: '', isCorrect: false },
  { text: '', isCorrect: false }
];

const CourseManager = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCourse, setActiveCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [lessonQuizzes, setLessonQuizzes] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [courseForm, setCourseForm] = useState(emptyCourse);
  const [chapterTitle, setChapterTitle] = useState('');
  const [lessonForm, setLessonForm] = useState(emptyLesson);
  const [assignmentForm, setAssignmentForm] = useState(emptyAssignment);
  const [quizForm, setQuizForm] = useState(emptyQuiz);
  const [activeQuizId, setActiveQuizId] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState('single');
  const [questionPoints, setQuestionPoints] = useState(10);
  const [answers, setAnswers] = useState(defaultAnswers);

  const [showGuide, setShowGuide] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);


  useEffect(() => {
    const hasSeenGuide = localStorage.getItem("course_guide_seen");

    if (!hasSeenGuide) {
      setShowGuide(true);
      localStorage.setItem("course_guide_seen", "true");
    }
  }, []);
  useEffect(() => {
    const hideGuide = localStorage.getItem("hide_course_guide");

    if (hideGuide !== "true") {
      setShowGuide(true);
    }
  }, []);
  const handleCloseGuide = () => {
    if (dontShowAgain) {
      localStorage.setItem("hide_course_guide", "true");
    }

    setShowGuide(false);
  };

  const allLessons = useMemo(
    () => chapters.flatMap((chapter) => chapter.lessons.map((lesson) => ({ ...lesson, chapterTitle: chapter.title, chapterId: chapter._id }))),
    [chapters]
  );

  const getCategoryName = (course) => {
    if (course?.category?.name) return course.category.name;
    return categories.find((category) => category._id === course?.category)?.name || 'Chưa chọn môn';
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeCourse?._id) {
      loadCourseContent(activeCourse._id);
    } else {
      setChapters([]);
      setAssignments([]);
      setLessonQuizzes({});
    }
  }, [activeCourse?._id]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [categoriesRes, coursesRes] = await Promise.all([
        api.get('/courses/categories'),
        api.get('/courses/manage/mine')
      ]);

      const nextCategories = categoriesRes.data.success ? categoriesRes.data.categories : [];
      const nextCourses = coursesRes.data.success ? coursesRes.data.courses : [];
      setCategories(nextCategories);
      setCourses(nextCourses);
      setActiveCourse(nextCourses[0] || null);
      setCourseForm((prev) => ({ ...prev, category: nextCategories[0]?._id || '' }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể tải dữ liệu quản lý khóa học.');
    } finally {
      setLoading(false);
    }
  };

  const loadCourseContent = async (courseId) => {
    try {
      const [courseRes, assignmentsRes] = await Promise.all([
        api.get(`/courses/${courseId}`),
        api.get(`/courses/${courseId}/assignments`)
      ]);

      const nextChapters = courseRes.data.success ? courseRes.data.chapters : [];
      setChapters(nextChapters);
      setAssignments(assignmentsRes.data.success ? assignmentsRes.data.assignments : []);

      const quizzesByLesson = {};
      await Promise.all(nextChapters.flatMap((chapter) => chapter.lessons.map(async (lesson) => {
        const quizRes = await api.get(`/courses/lessons/${lesson._id}/quizzes`);
        quizzesByLesson[lesson._id] = quizRes.data.success ? quizRes.data.quizzes : [];
      })));
      setLessonQuizzes(quizzesByLesson);

      const firstLesson = nextChapters[0]?.lessons[0];
      setLessonForm((prev) => ({ ...prev, chapterId: nextChapters[0]?._id || '' }));
      setAssignmentForm((prev) => ({ ...prev, chapterId: nextChapters[0]?._id || '' }));
      setQuizForm((prev) => ({
        ...prev,
        chapterId: firstLesson?.chapter || nextChapters[0]?._id || '',
        lessonId: firstLesson?._id || ''
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateCourse = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/courses', {
        ...courseForm,
        gradeLevel: Number(courseForm.gradeLevel)
      });
      if (res.data.success) {
        toast.success('Tạo khóa học mới thành công!');
        const nextCourses = [res.data.course, ...courses];
        setCourses(nextCourses);
        setActiveCourse(res.data.course);
        setCourseForm({ ...emptyCourse, category: categories[0]?._id || '' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể tạo khóa học.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateChapter = async (event) => {
    event.preventDefault();
    if (!activeCourse || !chapterTitle.trim()) return;
    setSaving(true);
    try {
      await api.post(`/courses/${activeCourse._id}/chapters`, {
        title: chapterTitle,
        order: chapters.length + 1
      });
      toast.success('Tạo chương học thành công!');
      setChapterTitle('');
      await loadCourseContent(activeCourse._id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể tạo chương học.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateLesson = async (event) => {
    event.preventDefault();
    if (!activeCourse || !lessonForm.chapterId) return;
    setSaving(true);
    try {
      await api.post(`/courses/${activeCourse._id}/chapters/${lessonForm.chapterId}/lessons`, {
        title: lessonForm.title,
        contentType: lessonForm.contentType,
        contentUrl: lessonForm.contentType === 'video' ? lessonForm.contentUrl : '',
        bodyText: lessonForm.contentType === 'text' ? lessonForm.bodyText : '',
        duration: Number(lessonForm.duration) * 60,
        order: allLessons.length + 1
      });
      toast.success('Tạo bài học thành công!');
      setLessonForm({ ...emptyLesson, chapterId: lessonForm.chapterId });
      await loadCourseContent(activeCourse._id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể tạo bài học.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateAssignment = async (event) => {
    event.preventDefault();
    if (!activeCourse) return;
    setSaving(true);
    try {
      await api.post(`/courses/${activeCourse._id}/assignments`, {
        ...assignmentForm,
        maxPoints: Number(assignmentForm.maxPoints)
      });
      toast.success('Tạo bài tập thành công!');
      setAssignmentForm({ ...emptyAssignment, chapterId: assignmentForm.chapterId });
      await loadCourseContent(activeCourse._id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể tạo bài tập.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateQuiz = async (event) => {
    event.preventDefault();
    if (!activeCourse || !quizForm.lessonId) return;
    setSaving(true);
    try {
      const selectedLesson = allLessons.find((lesson) => lesson._id === quizForm.lessonId);
      const res = await api.post('/quizzes', {
        ...quizForm,
        courseId: activeCourse._id,
        chapterId: selectedLesson?.chapterId || quizForm.chapterId || null,
        timeLimit: Number(quizForm.timeLimit),
        passingScore: Number(quizForm.passingScore)
      });
      if (res.data.success) {
        toast.success('Tạo quiz bài học thành công!');
        setActiveQuizId(res.data.quiz._id);
        await loadCourseContent(activeCourse._id);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể tạo quiz.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateQuestion = async (event) => {
    event.preventDefault();
    if (!activeQuizId || !questionText.trim()) return;

    const cleanedAnswers = answers
      .map((answer, index) => ({ ...answer, order: index }))
      .filter((answer) => answer.text.trim());

    if (cleanedAnswers.length === 0) {
      toast.error('Cần ít nhất một đáp án.');
      return;
    }

    setSaving(true);
    try {
      await api.post(`/quizzes/${activeQuizId}/questions`, {
        text: questionText,
        type: questionType,
        points: Number(questionPoints),
        answers: cleanedAnswers
      });
      toast.success('Thêm câu hỏi vào quiz thành công!');
      setQuestionText('');
      setQuestionType('single');
      setQuestionPoints(10);
      setAnswers(defaultAnswers);
      await loadCourseContent(activeCourse._id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể tạo câu hỏi.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublishToggle = async () => {
    if (!activeCourse) return;
    setSaving(true);
    try {
      const payload = { isPublished: !activeCourse.isPublished };
      if (user?.role === 'admin') payload.isApproved = true;
      const res = await api.put(`/courses/${activeCourse._id}/status`, payload);
      if (res.data.success) {
        const updated = res.data.course;
        toast.success(updated.isPublished ? 'Đã xuất bản khóa học thành công!' : 'Đã chuyển khóa học về bản nháp.');
        setActiveCourse(updated);
        setCourses(courses.map((course) => (course._id === updated._id ? updated : course)));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái khóa học.');
    } finally {
      setSaving(false);
    }
  };

  const updateAnswer = (index, field, value) => {
    setAnswers(answers.map((answer, answerIndex) => (
      answerIndex === index ? { ...answer, [field]: value } : answer
    )));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-8 pb-10 font-bold text-sm">
      <aside className="flex flex-col gap-6">
        <section className="card-playful bg-white dark:bg-slate-800 p-6 border-slate-100">
          <div className="flex items-center justify-between border-b pb-4 mb-4">
            <h3 className="text-base font-black font-comic">Khóa học quản lý</h3>
            <BookOpen size={18} className="text-primary-500" />
          </div>

          <div className="flex flex-col gap-2">
            {courses.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">Chưa có khóa học nào.</p>
            ) : courses.map((course) => (
              <button
                key={course._id}
                onClick={() => setActiveCourse(course)}
                className={`p-3 rounded-2xl text-left border transition-all ${activeCourse?._id === course._id ? 'bg-primary-50 border-primary-400 text-primary-800' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:bg-slate-50'}`}
              >
                <span className="block text-xs font-black truncate">{course.title}</span>
                <span className="block text-[10px] text-slate-400 mt-1">
                  {getCategoryName(course)} · Lớp {course.gradeLevel} · {course.isPublished ? 'Đã xuất bản' : 'Bản nháp'} · {course.isApproved ? 'Đã duyệt' : 'Chờ duyệt'}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="card-playful bg-white dark:bg-slate-800 p-6 border-slate-100">
          <h3 className="text-base font-black font-comic mb-4 flex items-center gap-2">
            <Plus size={18} className="text-primary-500" />
            Tạo khóa học
          </h3>
          <form onSubmit={handleCreateCourse} className="flex flex-col gap-3 text-xs">
            <input className="px-3 py-2 rounded-xl border-2 bg-slate-50 dark:bg-slate-900" placeholder="Tên khóa học" value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} required />
            <textarea className="px-3 py-2 rounded-xl border-2 bg-slate-50 dark:bg-slate-900" placeholder="Mô tả" value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} required />
            <input className="px-3 py-2 rounded-xl border-2 bg-slate-50 dark:bg-slate-900" placeholder="Ảnh thumbnail URL" value={courseForm.thumbnail} onChange={(e) => setCourseForm({ ...courseForm, thumbnail: e.target.value })} />
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-black text-slate-500">Môn học</label>
              <select className="px-3 py-2 rounded-xl border-2 bg-white dark:bg-slate-900" value={courseForm.category} onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })} required>
                <option value="">{categories.length === 0 ? 'Đang tải môn học...' : 'Chọn môn học'}</option>
                {categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
              </select>
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {categories.map((category) => (
                    <button
                      key={category._id}
                      type="button"
                      onClick={() => setCourseForm({ ...courseForm, category: category._id })}
                      className={`px-2 py-1 rounded-lg border text-[10px] font-black ${courseForm.category === category._id ? 'bg-primary-500 text-white border-primary-500' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500'}`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-black text-slate-500">Khối lớp</label>
              <select className="px-3 py-2 rounded-xl border-2 bg-white dark:bg-slate-900" value={courseForm.gradeLevel} onChange={(e) => setCourseForm({ ...courseForm, gradeLevel: e.target.value })}>
                {[1, 2, 3, 4, 5].map((grade) => <option key={grade} value={grade}>Lớp {grade}</option>)}
              </select>
            </div>
            <button disabled={saving || !courseForm.category} className="py-2.5 bg-primary-500 disabled:bg-slate-300 text-white rounded-xl font-black">Tạo khóa học</button>
          </form>
        </section>
      </aside>

      <main className="flex flex-col gap-6">
        {!activeCourse ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100">
            <h3 className="text-slate-400 font-comic text-base">Chọn hoặc tạo một khóa học để bắt đầu.</h3>
          </div>
        ) : (
          <>
            <section className="card-playful bg-white dark:bg-slate-800 p-6 border-slate-100 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
              <div>
                <span className="text-xs text-primary-500 font-extrabold uppercase">Đang biên soạn</span>
                <h2 className="text-xl font-black font-comic mt-1">{activeCourse.title}</h2>
                <p className="text-xs text-slate-400 mt-1">{getCategoryName(activeCourse)} · Lớp {activeCourse.gradeLevel}</p>
                <p className="text-xs text-slate-400 mt-1">{activeCourse.description}</p>
              </div>
              {/* <button onClick={handlePublishToggle} disabled={saving} className={`px-5 py-3 rounded-2xl text-xs font-black text-white ${activeCourse.isPublished ? 'bg-coral-500' : 'bg-forest-500'}`}>
                {activeCourse.isPublished ? 'Chuyển về bản nháp' : 'Xuất bản khóa học'}
              </button> */}
              <div className="flex gap-2">
                <button
                  className="px-4 py-3 rounded-2xl bg-blue-500 text-white text-xs font-black"
                  onClick={() => {
                    localStorage.removeItem("hide_course_guide");
                    setShowGuide(true);
                  }}
                >
                  Xem hướng dẫn
                </button>

                <button
                  onClick={handlePublishToggle}
                  disabled={saving}
                  className={`px-5 py-3 rounded-2xl text-xs font-black text-white ${activeCourse.isPublished
                    ? "bg-coral-500"
                    : "bg-forest-500"
                    }`}
                >
                  {activeCourse.isPublished
                    ? "Chuyển về bản nháp"
                    : "Xuất bản khóa học"}
                </button>
              </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <form onSubmit={handleCreateChapter} className="card-playful bg-white dark:bg-slate-800 p-6 border-slate-100 flex flex-col gap-3">
                <h3 className="text-base font-black flex items-center gap-2"><BookOpen size={18} />Thêm chương</h3>
                <input className="px-3 py-2 rounded-xl border-2 bg-slate-50 dark:bg-slate-900 text-xs" placeholder="Tên chương học" value={chapterTitle} onChange={(e) => setChapterTitle(e.target.value)} required />
                <button disabled={saving} className="py-2.5 bg-primary-500 text-white rounded-xl text-xs font-black">Lưu chương</button>
              </form>

              <form onSubmit={handleCreateLesson} className="card-playful bg-white dark:bg-slate-800 p-6 border-slate-100 flex flex-col gap-3">
                <h3 className="text-base font-black flex items-center gap-2"><Video size={18} />Thêm bài học</h3>
                <select className="px-3 py-2 rounded-xl border-2 bg-white dark:bg-slate-900 text-xs" value={lessonForm.chapterId} onChange={(e) => setLessonForm({ ...lessonForm, chapterId: e.target.value })} required>
                  <option value="">Chọn chương</option>
                  {chapters.map((chapter) => <option key={chapter._id} value={chapter._id}>{chapter.title}</option>)}
                </select>
                <input className="px-3 py-2 rounded-xl border-2 bg-slate-50 dark:bg-slate-900 text-xs" placeholder="Tên bài học" value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} required />
                <div className="grid grid-cols-2 gap-2">
                  <select className="px-3 py-2 rounded-xl border-2 bg-white dark:bg-slate-900 text-xs" value={lessonForm.contentType} onChange={(e) => setLessonForm({ ...lessonForm, contentType: e.target.value })}>
                    <option value="video">Video</option>
                    <option value="text">Văn bản</option>
                  </select>
                  <input type="number" min="1" className="px-3 py-2 rounded-xl border-2 bg-slate-50 dark:bg-slate-900 text-xs" value={lessonForm.duration} onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })} placeholder="Phút" />
                </div>
                {lessonForm.contentType === 'video' ? (
                  <input className="px-3 py-2 rounded-xl border-2 bg-slate-50 dark:bg-slate-900 text-xs" placeholder="YouTube embed URL" value={lessonForm.contentUrl} onChange={(e) => setLessonForm({ ...lessonForm, contentUrl: e.target.value })} required />
                ) : (
                  <textarea className="px-3 py-2 rounded-xl border-2 bg-slate-50 dark:bg-slate-900 text-xs" rows="3" placeholder="Nội dung bài đọc" value={lessonForm.bodyText} onChange={(e) => setLessonForm({ ...lessonForm, bodyText: e.target.value })} required />
                )}
                <button disabled={saving} className="py-2.5 bg-forest-500 text-white rounded-xl text-xs font-black">Lưu bài học</button>
              </form>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <form onSubmit={handleCreateAssignment} className="card-playful bg-white dark:bg-slate-800 p-6 border-slate-100 flex flex-col gap-3">
                <h3 className="text-base font-black flex items-center gap-2"><ClipboardList size={18} />Tạo bài tập</h3>
                <input className="px-3 py-2 rounded-xl border-2 bg-slate-50 dark:bg-slate-900 text-xs" placeholder="Tên bài tập" value={assignmentForm.title} onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })} required />
                <textarea className="px-3 py-2 rounded-xl border-2 bg-slate-50 dark:bg-slate-900 text-xs" placeholder="Hướng dẫn làm bài" value={assignmentForm.instructions} onChange={(e) => setAssignmentForm({ ...assignmentForm, instructions: e.target.value })} required />
                <div className="grid grid-cols-2 gap-2">
                  <input type="date" className="px-3 py-2 rounded-xl border-2 bg-slate-50 dark:bg-slate-900 text-xs" value={assignmentForm.deadline} onChange={(e) => setAssignmentForm({ ...assignmentForm, deadline: e.target.value })} required />
                  <input type="number" min="1" className="px-3 py-2 rounded-xl border-2 bg-slate-50 dark:bg-slate-900 text-xs" value={assignmentForm.maxPoints} onChange={(e) => setAssignmentForm({ ...assignmentForm, maxPoints: e.target.value })} />
                </div>
                <input className="px-3 py-2 rounded-xl border-2 bg-slate-50 dark:bg-slate-900 text-xs" placeholder="File mẫu URL nếu có" value={assignmentForm.fileUrl} onChange={(e) => setAssignmentForm({ ...assignmentForm, fileUrl: e.target.value })} />
                <button disabled={saving} className="py-2.5 bg-coral-500 text-white rounded-xl text-xs font-black">Lưu bài tập</button>
              </form>

              <form onSubmit={handleCreateQuiz} className="card-playful bg-white dark:bg-slate-800 p-6 border-slate-100 flex flex-col gap-3">
                <h3 className="text-base font-black flex items-center gap-2"><HelpCircle size={18} />Tạo quiz cho bài học</h3>
                <select className="px-3 py-2 rounded-xl border-2 bg-white dark:bg-slate-900 text-xs" value={quizForm.lessonId} onChange={(e) => setQuizForm({ ...quizForm, lessonId: e.target.value })} required>
                  <option value="">Chọn bài học</option>
                  {allLessons.map((lesson) => <option key={lesson._id} value={lesson._id}>{lesson.chapterTitle} - {lesson.title}</option>)}
                </select>
                <input className="px-3 py-2 rounded-xl border-2 bg-slate-50 dark:bg-slate-900 text-xs" placeholder="Tên quiz" value={quizForm.title} onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })} required />
                <textarea className="px-3 py-2 rounded-xl border-2 bg-slate-50 dark:bg-slate-900 text-xs" placeholder="Mô tả" value={quizForm.description} onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })} />
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" min="0" className="px-3 py-2 rounded-xl border-2 bg-slate-50 dark:bg-slate-900 text-xs" value={quizForm.timeLimit} onChange={(e) => setQuizForm({ ...quizForm, timeLimit: e.target.value })} placeholder="Phút" />
                  <input type="number" min="0" max="100" className="px-3 py-2 rounded-xl border-2 bg-slate-50 dark:bg-slate-900 text-xs" value={quizForm.passingScore} onChange={(e) => setQuizForm({ ...quizForm, passingScore: e.target.value })} placeholder="% đạt" />
                </div>
                <button disabled={saving || allLessons.length === 0} className="py-2.5 bg-sunny-500 text-white rounded-xl text-xs font-black">Lưu quiz</button>
              </form>
            </section>

            <section className="card-playful bg-white dark:bg-slate-800 p-6 border-slate-100">
              <h3 className="text-base font-black mb-4 flex items-center gap-2"><Send size={18} />Thêm câu hỏi vào quiz</h3>
              <form onSubmit={handleCreateQuestion} className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                <div className="flex flex-col gap-3">
                  <select className="px-3 py-2 rounded-xl border-2 bg-white dark:bg-slate-900" value={activeQuizId} onChange={(e) => setActiveQuizId(e.target.value)} required>
                    <option value="">Chọn quiz</option>
                    {Object.values(lessonQuizzes).flat().map((quiz) => <option key={quiz._id} value={quiz._id}>{quiz.title}</option>)}
                  </select>
                  <textarea className="px-3 py-2 rounded-xl border-2 bg-slate-50 dark:bg-slate-900" rows="3" placeholder="Nội dung câu hỏi" value={questionText} onChange={(e) => setQuestionText(e.target.value)} required />
                  <div className="grid grid-cols-2 gap-2">
                    <select className="px-3 py-2 rounded-xl border-2 bg-white dark:bg-slate-900" value={questionType} onChange={(e) => setQuestionType(e.target.value)}>
                      <option value="single">Một đáp án</option>
                      <option value="multiple">Nhiều đáp án</option>
                      <option value="text">Tự luận ngắn</option>
                      <option value="match">Ghép nối</option>
                    </select>
                    <input type="number" min="1" className="px-3 py-2 rounded-xl border-2 bg-slate-50 dark:bg-slate-900" value={questionPoints} onChange={(e) => setQuestionPoints(e.target.value)} />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {answers.map((answer, index) => (
                    <div key={index} className="grid grid-cols-[1fr_auto] gap-2 items-center">
                      <input className="px-3 py-2 rounded-xl border-2 bg-slate-50 dark:bg-slate-900" placeholder={questionType === 'match' ? `Vế trái ${index + 1}` : `Đáp án ${index + 1}`} value={answer.text} onChange={(e) => updateAnswer(index, 'text', e.target.value)} />
                      <label className="flex items-center gap-1 text-[11px] text-slate-500">
                        <input type={questionType === 'single' ? 'radio' : 'checkbox'} name="correctAnswer" checked={answer.isCorrect} onChange={(e) => {
                          if (questionType === 'single') {
                            setAnswers(answers.map((item, itemIndex) => ({ ...item, isCorrect: itemIndex === index })));
                          } else {
                            updateAnswer(index, 'isCorrect', e.target.checked);
                          }
                        }} />
                        Đúng
                      </label>
                      {questionType === 'match' && (
                        <input className="px-3 py-2 rounded-xl border-2 bg-slate-50 dark:bg-slate-900 col-span-2" placeholder={`Vế phải ${index + 1}`} value={answer.matchingPair || ''} onChange={(e) => updateAnswer(index, 'matchingPair', e.target.value)} />
                      )}
                    </div>
                  ))}
                  <button disabled={saving || !activeQuizId} className="mt-2 py-2.5 bg-primary-500 text-white rounded-xl font-black">Lưu câu hỏi</button>
                </div>
              </form>
            </section>

            <section className="card-playful bg-white dark:bg-slate-800 p-6 border-slate-100">
              <h3 className="text-base font-black mb-4">Nội dung hiện có</h3>
              <div className="flex flex-col gap-4">
                {chapters.length === 0 ? (
                  <p className="text-xs text-slate-400">Chưa có chương học.</p>
                ) : chapters.map((chapter) => (
                  <div key={chapter._id} className="border rounded-2xl p-4 dark:border-slate-700">
                    <h4 className="font-black">{chapter.title}</h4>
                    <div className="mt-3 flex flex-col gap-2">
                      {chapter.lessons.length === 0 ? (
                        <span className="text-xs text-slate-400">Chưa có bài học.</span>
                      ) : chapter.lessons.map((lesson) => (
                        <div key={lesson._id} className="flex flex-col md:flex-row md:items-center justify-between gap-2 rounded-xl bg-slate-50 dark:bg-slate-900 p-3">
                          <div className="flex items-center gap-2 text-xs">
                            {lesson.contentType === 'video' ? <Video size={14} /> : <FileText size={14} />}
                            <span className="font-black">{lesson.title}</span>
                          </div>
                          <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                            {(lessonQuizzes[lesson._id] || []).map((quiz) => (
                              <button key={quiz._id} onClick={() => setActiveQuizId(quiz._id)} className="px-2 py-1 bg-sunny-100 text-sunny-700 rounded-lg font-black">{quiz.title}</button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {assignments.length > 0 && (
                <div className="mt-6 border-t pt-4">
                  <h4 className="text-sm font-black mb-3">Bài tập đã tạo</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {assignments.map((assignment) => (
                      <div key={assignment._id} className="p-3 rounded-xl bg-coral-50 dark:bg-slate-900 border border-coral-100 dark:border-slate-700 text-xs">
                        <div className="font-black">{assignment.title}</div>
                        <div className="text-slate-500 mt-1">Hạn: {new Date(assignment.deadline).toLocaleDateString('vi-VN')} · {assignment.maxPoints} điểm</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </main>
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 max-w-3xl w-full rounded-3xl shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b dark:border-slate-700">
              <h2 className="text-xl font-black">
                📚 Hướng dẫn tạo khóa học
              </h2>

              <button
                onClick={handleCloseGuide}
                className="text-slate-500 hover:text-red-500 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[65vh] text-sm space-y-6">

              <section>
                <h3 className="font-black text-primary-600 mb-2">
                  Bước 1: Tạo khóa học
                </h3>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Nhập tên khóa học.</li>
                  <li>Nhập mô tả khóa học.</li>
                  <li>Chọn môn học.</li>
                  <li>Chọn khối lớp.</li>
                  <li>Nhấn <b>Tạo khóa học</b>.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-black text-primary-600 mb-2">
                  Bước 2: Tạo chương học
                </h3>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Nhập tên chương học.</li>
                  <li>Nhấn <b>Lưu chương</b>.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-black text-primary-600 mb-2">
                  Bước 3: Thêm bài học
                </h3>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Chọn chương học.</li>
                  <li>Nhập tên bài học.</li>
                  <li>Chọn loại Video hoặc Văn bản.</li>
                  <li>Nhập nội dung tương ứng.</li>
                  <li>Nhấn <b>Lưu bài học</b>.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-black text-primary-600 mb-2">
                  Bước 4: Tạo Quiz
                </h3>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Chọn bài học cần gắn quiz.</li>
                  <li>Nhập tên quiz.</li>
                  <li>Thiết lập thời gian làm bài.</li>
                  <li>Thiết lập điểm đạt tối thiểu.</li>
                  <li>Nhấn <b>Lưu quiz</b>.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-black text-primary-600 mb-2">
                  Bước 5: Tạo câu hỏi
                </h3>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Chọn quiz vừa tạo.</li>
                  <li>Nhập nội dung câu hỏi.</li>
                  <li>Chọn loại câu hỏi.</li>
                  <li>Nhập các đáp án.</li>
                  <li>Đánh dấu đáp án đúng.</li>
                  <li>Nhấn <b>Lưu câu hỏi</b>.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-black text-primary-600 mb-2">
                  Bước 6: Xuất bản khóa học
                </h3>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Kiểm tra lại toàn bộ nội dung.</li>
                  <li>Nhấn <b>Xuất bản khóa học</b>.</li>
                  <li>Khóa học sẽ được duyệt trước khi hiển thị cho học sinh.</li>
                </ul>
              </section>

            </div>

            {/* Footer */}
            <div className="border-t dark:border-slate-700 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">

              <label
                htmlFor="dont-show-guide"
                className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 dark:text-slate-300"
              >
                <input
                  id="dont-show-guide"
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="w-4 h-4"
                />
                Không hiển thị hướng dẫn này lần nữa
              </label>

              <button
                onClick={handleCloseGuide}
                className="px-5 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-black"
              >
                Đã hiểu
              </button>

            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManager;
