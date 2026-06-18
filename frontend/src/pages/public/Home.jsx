import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Award, BookOpen, CheckCircle2, HeartHandshake, PlayCircle, Send, ShieldCheck, Sparkles, Star, Trophy, Users } from 'lucide-react';
import api from '../../services/api';

const initialFeedbackForm = {
  parentName: '',
  studentName: '',
  email: '',
  phone: '',
  gradeLevel: '1',
  rating: '5',
  message: ''
};

const parentFeedback = [
  {
    name: 'Chị Thu Hà',
    role: 'Phụ huynh học sinh lớp 2',
    quote: 'Con chủ động vào học mỗi tối vì bài giảng ngắn, dễ hiểu và có phần thưởng sau mỗi nhiệm vụ.'
  },
  {
    name: 'Anh Minh Quân',
    role: 'Phụ huynh học sinh lớp 4',
    quote: 'Gia đình theo dõi được tiến độ học tập rõ ràng, biết con đang mạnh môn nào và cần ôn phần nào.'
  },
  {
    name: 'Chị Lan Anh',
    role: 'Phụ huynh học sinh lớp 1',
    quote: 'Các bài học nhiều hình ảnh, giọng văn thân thiện, phù hợp với bé mới làm quen học trực tuyến.'
  }
];

const teacherCommitments = [
  {
    icon: <ShieldCheck size={26} />,
    title: 'Nội dung đúng lứa tuổi',
    description: 'Bài học được chia nhỏ theo lớp 1-5, bám sát năng lực tiếp thu của học sinh tiểu học.'
  },
  {
    icon: <HeartHandshake size={26} />,
    title: 'Đồng hành nhẹ nhàng',
    description: 'Giáo viên ưu tiên khích lệ, phản hồi rõ ràng và giúp bé hình thành thói quen học đều.'
  },
  {
    icon: <Award size={26} />,
    title: 'Đánh giá có định hướng',
    description: 'Bài tập, quiz và tiến độ học giúp phụ huynh nhìn thấy sự tiến bộ thay vì chỉ nhìn điểm số.'
  }
];

const Home = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [feedbackForm, setFeedbackForm] = useState(initialFeedbackForm);
  const [feedbackStatus, setFeedbackStatus] = useState({ type: '', message: '' });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    api.get('/courses?limit=6')
      .then(res => {
        setCourses(res.data.courses || res.data.data || []);
      })
      .catch(err => console.error(err));
  }, []);

  const handleFeedbackChange = (event) => {
    const { name, value } = event.target;
    setFeedbackForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFeedbackSubmit = async (event) => {
    event.preventDefault();
    setSubmittingFeedback(true);
    setFeedbackStatus({ type: '', message: '' });

    try {
      const res = await api.post('/feedback', {
        ...feedbackForm,
        gradeLevel: Number(feedbackForm.gradeLevel),
        rating: Number(feedbackForm.rating)
      });

      if (res.data.success) {
        setFeedbackForm(initialFeedbackForm);
        setFeedbackStatus({ type: 'success', message: res.data.message });
      }
    } catch (error) {
      setFeedbackStatus({
        type: 'error',
        message: error.response?.data?.message || 'Chưa gửi được ý kiến. Phụ huynh vui lòng thử lại sau.'
      });
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <div className="bg-sky-50/20 dark:bg-slate-900 pb-20">
      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.02fr_0.98fr] items-center gap-10">
        <div className="flex flex-col gap-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white dark:bg-slate-800 border-2 border-primary-200 dark:border-slate-700 text-primary-700 dark:text-primary-300 rounded-full font-black text-sm mx-auto lg:mx-0 w-fit shadow-sm">
            <Sparkles size={16} />
            <span>Khóa học online cho học sinh lớp 1-5</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black leading-tight font-comic text-slate-900 dark:text-white">
            Học Vui Như Chơi,<br />
            Tiến Bộ <span className="text-primary-500 underline decoration-wavy decoration-sunny-400">Mỗi Ngày</span>
          </h1>

          <p className="text-lg text-slate-600 dark:text-slate-300 font-bold max-w-xl mx-auto lg:mx-0">
            EduKids biến Toán, Tiếng Việt và Khoa học thành những bài học ngắn, quiz vui, bài tập có phản hồi và phần thưởng giúp bé hào hứng quay lại học.
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
            <Link 
              to="/register" 
              className="px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-extrabold text-lg rounded-3xl shadow-[0_6px_0_0_#0284c7] transition-all hover:scale-105 active:translate-y-0.5 active:shadow-none flex items-center gap-2"
            >
              <PlayCircle size={22} />
              <span>Bắt Đầu Học Ngay</span>
            </Link>
            <Link 
              to="/courses" 
              className="px-8 py-4 border-4 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-extrabold text-lg rounded-3xl transition-all hover:scale-105 active:translate-y-0.5 flex items-center gap-2"
            >
              <BookOpen size={22} />
              <span>Xem Khóa Học</span>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-xl mx-auto lg:mx-0 w-full">
            {[
              { value: '15+', label: 'khóa học' },
              { value: '1-5', label: 'khối lớp' },
              { value: '3', label: 'môn chính' }
            ].map((item) => (
              <div key={item.label} className="bg-white dark:bg-slate-800 border-4 border-slate-100 dark:border-slate-700 rounded-3xl p-4 text-center shadow-sm">
                <p className="text-2xl md:text-3xl font-black font-comic text-primary-500">{item.value}</p>
                <p className="text-[11px] md:text-xs font-black text-slate-400 uppercase mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full">
          <div className="relative overflow-hidden rounded-[2rem] border-8 border-white dark:border-slate-800 bg-sky-100 dark:bg-slate-800 shadow-2xl">
            <div className="absolute inset-x-0 top-0 h-24 bg-primary-500" />
            <div className="relative p-5 md:p-7">
              <div className="flex items-center justify-between gap-4 mb-6 text-white">
                <div>
                  <p className="text-xs font-black uppercase opacity-90">Bảng học hôm nay</p>
                  <h2 className="text-2xl md:text-3xl font-black font-comic mt-1">Nhiệm Vụ Của Bé</h2>
                </div>
                <div className="w-16 h-16 rounded-3xl bg-white/20 flex items-center justify-center text-4xl border-2 border-white/40">
                  🎒
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_0.8fr] gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-4 border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-between gap-3">
                    <span className="px-3 py-1 rounded-full bg-sunny-100 text-amber-700 text-[11px] font-black">Toán lớp 3</span>
                    <span className="text-xs font-black text-slate-400">12 phút</span>
                  </div>
                  <h3 className="text-xl font-black mt-4">Nhân chia cùng bạn nhỏ siêu tốc</h3>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-300 mt-2">
                    Xem bài học, trả lời quiz và nhận huy hiệu khi hoàn thành nhiệm vụ.
                  </p>

                  <div className="mt-5 space-y-3">
                    {[
                      ['Bài giảng hoạt họa', 'Đang học', 'bg-primary-500'],
                      ['Quiz 5 câu vui', 'Sẵn sàng', 'bg-sunny-500'],
                      ['Bài tập về nhà', 'Có phản hồi', 'bg-forest-500']
                    ].map(([title, statusText, color]) => (
                      <div key={title} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 dark:bg-slate-800 p-3">
                        <div className="flex items-center gap-3">
                          <span className={`w-9 h-9 rounded-xl ${color} text-white flex items-center justify-center`}>
                            <CheckCircle2 size={18} />
                          </span>
                          <span className="font-black text-sm">{title}</span>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase">{statusText}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-1 gap-4">
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-4 border-slate-100 dark:border-slate-700 text-center">
                    <Trophy className="mx-auto text-sunny-500" size={34} />
                    <p className="text-3xl font-black font-comic mt-3 text-sunny-500">+120</p>
                    <p className="text-xs font-black text-slate-400 uppercase">XP hôm nay</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-4 border-slate-100 dark:border-slate-700">
                    <p className="text-xs font-black text-slate-400 uppercase">Tiến độ tuần</p>
                    <div className="mt-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full w-[76%] bg-forest-500 rounded-full" />
                    </div>
                    <p className="text-sm font-black mt-3 text-forest-600">76% hoàn thành</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 bg-white/95 dark:bg-slate-900 rounded-3xl border-4 border-white dark:border-slate-700 p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-playful-purple text-white flex items-center justify-center text-2xl">🏅</div>
                  <div>
                    <p className="font-black">Sắp mở khóa huy hiệu mới</p>
                    <p className="text-xs font-bold text-slate-400">Hoàn thành thêm 1 bài học để nhận thưởng</p>
                  </div>
                </div>
                <Link to="/courses" className="px-4 py-2 bg-sunny-500 text-white rounded-2xl font-black text-sm shadow-[0_3px_0_0_#d97706]">
                  Học tiếp
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Subjects categories */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-black text-center mb-10 font-comic">Môn Học Hot Nhất 📚</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card Math */}
          <div className="card-sunny p-8 flex flex-col gap-4 text-center cursor-pointer" onClick={() => navigate('/courses?category=toan-hoc')}>
            <span className="text-5xl">🧮</span>
            <h3 className="text-2xl font-black">Toán Học Lý Thú</h3>
            <p className="font-bold text-sunny-800">Cộng, trừ, nhân, chia, hình học qua các hình minh họa hoạt họa dễ hiểu.</p>
            <span className="mt-4 px-4 py-2 bg-white rounded-2xl font-bold text-sunny-600 border border-sunny-400 w-fit mx-auto">Vào Học</span>
          </div>

          {/* Card Vietnamese */}
          <div className="card-playful p-8 flex flex-col gap-4 text-center border-primary-300 bg-sky-50 dark:bg-slate-800 cursor-pointer" onClick={() => navigate('/courses?category=tieng-viet')}>
            <span className="text-5xl">📖</span>
            <h3 className="text-2xl font-black text-primary-600 dark:text-primary-300">Tiếng Việt Sinh Động</h3>
            <p className="font-bold text-slate-600 dark:text-slate-300">Đọc thơ, ghép chữ, làm văn miêu tả thật vui cùng các trò chơi từ ngữ.</p>
            <span className="mt-4 px-4 py-2 bg-white dark:bg-slate-700 rounded-2xl font-bold text-primary-500 border border-primary-300 w-fit mx-auto">Vào Học</span>
          </div>

          {/* Card Science */}
          <div className="card-forest p-8 flex flex-col gap-4 text-center cursor-pointer" onClick={() => navigate('/courses')}>
            <span className="text-5xl">🔬</span>
            <h3 className="text-2xl font-black">Khoa Học Kỳ Diệu</h3>
            <p className="font-bold text-forest-800">Tìm hiểu thế giới tự nhiên xung quanh, các loài động vật và hành tinh.</p>
            <span className="mt-4 px-4 py-2 bg-white rounded-2xl font-bold text-forest-600 border border-forest-400 w-fit mx-auto">Vào Học</span>
          </div>
        </div>
      </section>

      {/* Top Courses listing */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black font-comic">Khóa Học Nổi Bật 🌟</h2>
          <Link to="/courses" className="font-bold text-primary-500 hover:underline">Xem tất cả</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {courses.map(course => (
            <div key={course._id} className="card-playful flex flex-col h-full bg-white dark:bg-slate-800">
              <div className="h-48 bg-primary-100 flex items-center justify-center text-5xl relative overflow-hidden border-b-4 border-slate-100 dark:border-slate-700">
                {course.thumbnail ? (
                  <img src={course?.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <span>📚</span>
                )}
                <div className="absolute top-3 right-3 bg-sunny-400 border-2 border-white px-3 py-1 rounded-full text-xs font-black text-amber-900 shadow-sm">
                  Lớp {course.gradeLevel}
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-black uppercase text-primary-500">{course.category?.name || 'Môn học'}</span>
                  <h3 className="text-xl font-black mt-1 line-clamp-2">{course.title}</h3>
                  <p className="text-slate-500 text-sm mt-2 font-semibold line-clamp-3">{course.description}</p>
                </div>
                <div className="flex items-center justify-between mt-6 pt-4 border-t-2 border-slate-50 dark:border-slate-700/50">
                  <span className="text-xs font-bold text-slate-400">GV: {course.instructor?.fullName}</span>
                  <Link 
                    to={`/courses/${course._id}`} 
                    className="px-4 py-2 bg-primary-500 text-white rounded-2xl text-sm font-bold hover:scale-105 active:translate-y-0.5 transition-all shadow-[0_3px_0_0_#0284c7]"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Parent feedback */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-full text-primary-500 font-black text-xs mb-3">
              <Users size={16} />
              <span>Phụ huynh tin chọn</span>
            </div>
            <h2 className="text-3xl font-black font-comic">Phản Hồi Từ Gia Đình</h2>
          </div>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-300 max-w-xl">
            EduKids tập trung vào trải nghiệm học vui, có tiến độ rõ ràng để phụ huynh dễ đồng hành cùng con mỗi ngày.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {parentFeedback.map((item) => (
            <div key={item.name} className="card-playful bg-white dark:bg-slate-800 p-6 flex flex-col gap-5">
              <div className="flex gap-1 text-sunny-500">
                {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={18} fill="currentColor" />)}
              </div>
              <p className="text-slate-600 dark:text-slate-300 font-bold leading-relaxed">"{item.quote}"</p>
              <div className="pt-4 border-t-2 border-slate-50 dark:border-slate-700/60">
                <p className="font-black text-slate-800 dark:text-white">{item.name}</p>
                <p className="text-xs font-bold text-slate-400 mt-1">{item.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Parent feedback form */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-8 items-start">
          <div className="bg-primary-500 text-white rounded-3xl p-8 border-4 border-primary-400 shadow-[0_8px_0_0_#0284c7]">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mb-5">
              <HeartHandshake size={30} />
            </div>
            <h2 className="text-3xl font-black font-comic leading-tight">Gửi Ý Kiến Từ Phụ Huynh</h2>
            <p className="text-sm font-bold text-primary-50 mt-4 leading-relaxed">
              Mỗi góp ý giúp EduKids điều chỉnh bài học, bài tập và cách đồng hành để phù hợp hơn với từng bé.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-8 text-sm font-black">
              <div className="rounded-2xl bg-white/15 p-4">
                <span className="block text-2xl">24h</span>
                <span className="text-primary-50">ghi nhận phản hồi</span>
              </div>
              <div className="rounded-2xl bg-white/15 p-4">
                <span className="block text-2xl">1-5</span>
                <span className="text-primary-50">phù hợp tiểu học</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleFeedbackSubmit} className="card-playful bg-white dark:bg-slate-800 p-6 flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-500">Tên phụ huynh *</label>
                <input
                  name="parentName"
                  value={feedbackForm.parentName}
                  onChange={handleFeedbackChange}
                  required
                  className="px-4 py-3 rounded-2xl border-4 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:border-primary-400 focus:outline-none text-sm font-bold"
                  placeholder="Ví dụ: Nguyễn Thu Hà"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-500">Tên học sinh</label>
                <input
                  name="studentName"
                  value={feedbackForm.studentName}
                  onChange={handleFeedbackChange}
                  className="px-4 py-3 rounded-2xl border-4 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:border-primary-400 focus:outline-none text-sm font-bold"
                  placeholder="Ví dụ: Bé Minh Anh"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-500">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={feedbackForm.email}
                  onChange={handleFeedbackChange}
                  required
                  className="px-4 py-3 rounded-2xl border-4 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:border-primary-400 focus:outline-none text-sm font-bold"
                  placeholder="phuhuynh@email.com"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-500">Số điện thoại</label>
                <input
                  name="phone"
                  value={feedbackForm.phone}
                  onChange={handleFeedbackChange}
                  className="px-4 py-3 rounded-2xl border-4 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:border-primary-400 focus:outline-none text-sm font-bold"
                  placeholder="09..."
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-500">Lớp của bé</label>
                <select
                  name="gradeLevel"
                  value={feedbackForm.gradeLevel}
                  onChange={handleFeedbackChange}
                  className="px-4 py-3 rounded-2xl border-4 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:border-primary-400 focus:outline-none text-sm font-bold"
                >
                  {[1, 2, 3, 4, 5].map((grade) => <option key={grade} value={grade}>Lớp {grade}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-500">Mức hài lòng</label>
                <select
                  name="rating"
                  value={feedbackForm.rating}
                  onChange={handleFeedbackChange}
                  className="px-4 py-3 rounded-2xl border-4 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:border-primary-400 focus:outline-none text-sm font-bold"
                >
                  {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} sao</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-slate-500">Nội dung góp ý *</label>
              <textarea
                name="message"
                value={feedbackForm.message}
                onChange={handleFeedbackChange}
                required
                rows={5}
                className="px-4 py-3 rounded-2xl border-4 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:border-primary-400 focus:outline-none text-sm font-bold resize-none"
                placeholder="Phụ huynh có thể chia sẻ cảm nhận, mong muốn cải thiện, hoặc nội dung bé cần được hỗ trợ thêm..."
              />
            </div>

            {feedbackStatus.message && (
              <div className={`rounded-2xl px-4 py-3 text-sm font-bold ${
                feedbackStatus.type === 'success'
                  ? 'bg-forest-100 text-forest-700 border-2 border-forest-300'
                  : 'bg-coral-100 text-coral-700 border-2 border-coral-300'
              }`}>
                {feedbackStatus.message}
              </div>
            )}

            <button
              type="submit"
              disabled={submittingFeedback}
              className="w-full md:w-fit px-6 py-3.5 bg-primary-500 disabled:bg-slate-300 hover:bg-primary-600 text-white rounded-2xl font-black shadow-[0_4px_0_0_#0284c7] disabled:shadow-none active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <Send size={18} />
              <span>{submittingFeedback ? 'Đang gửi...' : 'Gửi ý kiến'}</span>
            </button>
          </form>
        </div>
      </section>

      {/* Teacher commitments */}
      <section className="bg-white dark:bg-slate-800 border-y-4 border-slate-100 dark:border-slate-700/70 py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-50 dark:bg-slate-900 border-2 border-primary-100 dark:border-slate-700 rounded-full text-primary-500 font-black text-xs mb-3">
              <BookOpen size={16} />
              <span>Cam kết từ giáo viên</span>
            </div>
            <h2 className="text-3xl font-black font-comic">Học Vững, Vui Và Có Người Đồng Hành</h2>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-300 mt-3">
              Mỗi khóa học được thiết kế để bé không bị quá tải, phụ huynh dễ theo dõi, giáo viên dễ hỗ trợ đúng lúc.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {teacherCommitments.map((item) => (
              <div key={item.title} className="rounded-3xl border-4 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-6">
                <div className="w-14 h-14 rounded-2xl bg-primary-500 text-white flex items-center justify-center shadow-[0_4px_0_0_#0284c7] mb-5">
                  {item.icon}
                </div>
                <h3 className="text-xl font-black mb-2">{item.title}</h3>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-300 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning journey */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-sunny-100 border-2 border-sunny-300 text-sunny-700 rounded-full font-black text-xs mb-4">
              <Trophy size={16} />
              <span>Lộ trình học tập</span>
            </div>
            <h2 className="text-3xl font-black font-comic leading-tight">Từ Bài Giảng Đến Bài Tập, Bé Luôn Có Mục Tiêu Nhỏ Để Tiến Bộ</h2>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-300 mt-4 leading-relaxed">
              Mỗi khóa học kết hợp bài học ngắn, kiểm tra nhanh, bài tập về nhà và phần thưởng để bé thấy việc học có nhịp điệu rõ ràng.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { step: '01', title: 'Học bài ngắn', text: 'Bé tiếp cận kiến thức bằng nội dung vừa sức.' },
              { step: '02', title: 'Làm quiz vui', text: 'Câu hỏi nhanh giúp bé nhớ bài ngay sau khi học.' },
              { step: '03', title: 'Nộp bài tập', text: 'Giáo viên theo dõi và phản hồi để bé tiến bộ.' }
            ].map((item) => (
              <div key={item.step} className="card-playful bg-white dark:bg-slate-800 p-5">
                <span className="text-sm font-black text-primary-500">{item.step}</span>
                <h3 className="text-lg font-black mt-3">{item.title}</h3>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-300 mt-2 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
