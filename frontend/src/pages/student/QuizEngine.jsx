import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Clock, HelpCircle, ArrowRight, ArrowLeft, CheckCircle, Award, AlertTriangle } from 'lucide-react';
import api from '../../services/api';

const QuizEngine = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const [quizData, setQuizData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersState, setAnswersState] = useState({}); // questionId -> answer details
  const [loading, setLoading] = useState(true);

  // Timer state
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const timerRef = useRef(null);

  // Graded state
  const [gradedResult, setGradedResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Fetch quiz data
    api.get(`/quizzes/${quizId}`)
      .then(res => {
        if (res.data.success) {
          setQuizData(res.data.quiz);
          setQuestions(res.data.questions);
          if (res.data.quiz.timeLimit > 0) {
            setTimeLeft(res.data.quiz.timeLimit * 60);
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quizId]);

  // Timer countdown hook
  useEffect(() => {
    if (timeLeft > 0 && !gradedResult && !loading) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            autoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, gradedResult, loading]);

  const handleSingleSelect = (questionId, optionId) => {
    setAnswersState({
      ...answersState,
      [questionId]: {
        questionId,
        selectedAnswerId: optionId
      }
    });
  };

  const handleMultipleSelect = (questionId, optionId) => {
    const selectedAnswerIds = answersState[questionId]?.selectedAnswerIds || [];
    const nextSelected = selectedAnswerIds.includes(optionId)
      ? selectedAnswerIds.filter((id) => id !== optionId)
      : [...selectedAnswerIds, optionId];

    setAnswersState({
      ...answersState,
      [questionId]: {
        questionId,
        selectedAnswerIds: nextSelected
      }
    });
  };

  const handleTextChange = (questionId, text) => {
    setAnswersState({
      ...answersState,
      [questionId]: {
        questionId,
        textAnswer: text
      }
    });
  };

  const handleMatchSelect = (questionId, leftKey, rightValue) => {
    const currentMatches = answersState[questionId]?.matchAnswers || {};
    setAnswersState({
      ...answersState,
      [questionId]: {
        questionId,
        matchAnswers: {
          ...currentMatches,
          [leftKey]: rightValue
        }
      }
    });
  };

  const formatSubmissions = () => {
    return Object.values(answersState);
  };

  const autoSubmit = () => {
    alert('⏰ Hết giờ làm bài! Hệ thống đang tự động nộp bài của bé.');
    submitQuiz();
  };

  const submitQuiz = async () => {
    if (submitting) return;
    setSubmitting(true);
    
    try {
      const submissions = formatSubmissions();
      const res = await api.post(`/quizzes/${quizId}/submit`, { submissions });
      if (res.data.success) {
        setGradedResult(res.data);
        refreshProfile();
      }
    } catch (error) {
      alert('Không thể nộp bài kiểm tra!');
    }
    setSubmitting(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!quizData || questions.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-black text-coral-500 font-comic">Không thể tải bài kiểm tra!</h2>
        <button onClick={() => navigate(-1)} className="mt-4 px-6 py-3.5 bg-primary-500 text-white rounded-2xl font-bold">
          Quay lại
        </button>
      </div>
    );
  }

  // Render Graded Result Panel
  if (gradedResult) {
    const { score, isPassed, xpAwarded, coinsAwarded } = gradedResult;
    return (
      <div className="max-w-2xl mx-auto py-10 px-6 pb-20">
        <div className="card-playful bg-white dark:bg-slate-800 p-8 flex flex-col gap-8 text-center border-slate-100">
          
          <div className="flex flex-col gap-2 items-center">
            <span className="text-7xl animate-bounce">{isPassed ? '🎉' : '💪'}</span>
            <h2 className="text-3xl font-black font-comic">
              {isPassed ? 'Hoàn Thành Xuất Sắc!' : 'Cố Gắng Lên Bé Ơi!'}
            </h2>
            <p className="text-slate-400 font-bold text-sm">
              {isPassed ? 'Bé đã vượt qua bài kiểm tra rồi đấy!' : 'Hãy ôn lại bài giảng và thử sức lần nữa nhé!'}
            </p>
          </div>

          {/* Score Circle */}
          <div className="w-40 h-40 rounded-full border-8 border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center mx-auto bg-sky-50/50 dark:bg-slate-900 shadow-inner">
            <span className="text-4xl font-black font-comic">{score}%</span>
            <span className="text-xs text-slate-400 font-extrabold uppercase">Điểm Số</span>
          </div>

          {/* Rewards info */}
          {isPassed && (
            <div className="p-4 bg-sunny-100 dark:bg-slate-900 border-2 border-sunny-400 rounded-3xl flex justify-around text-amber-950 dark:text-sunny-300 font-black text-sm">
              <div className="flex items-center gap-1.5">
                <span>✨</span>
                <span>+{xpAwarded} XP</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>🪙</span>
                <span>+{coinsAwarded} Xu</span>
              </div>
            </div>
          )}

          <div className="flex gap-4 w-full font-bold">
            <button 
              onClick={() => navigate(-1)} 
              className="flex-1 py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl shadow-[0_4px_0_0_#0284c7] hover:scale-102 transition-all active:translate-y-0.5 active:shadow-none"
            >
              Quay Lại Lớp Học
            </button>
            {!isPassed && (
              <button 
                onClick={() => window.location.reload()} 
                className="flex-1 py-4 bg-sunny-500 hover:bg-sunny-600 text-white rounded-2xl shadow-[0_4px_0_0_#d97706] hover:scale-102 transition-all active:translate-y-0.5 active:shadow-none"
              >
                Làm Lại Bài Thi
              </button>
            )}
          </div>

        </div>
      </div>
    );
  }

  const q = questions[currentIndex];
  const totalQuestions = questions.length;
  const currentAnswer = answersState[q._id];

  return (
    <div className="max-w-3xl mx-auto py-8 px-6 pb-20 font-bold">
      
      {/* Quiz Top bar */}
      <div className="flex items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl border-4 border-slate-100 dark:border-slate-700/80 shadow-sm mb-8">
        <div>
          <span className="text-xs text-primary-500 font-black uppercase">Đang làm bài trắc nghiệm</span>
          <h2 className="text-xl font-black font-comic mt-1 line-clamp-1">{quizData.title}</h2>
        </div>

        {/* Timer */}
        {quizData.timeLimit > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-coral-100 dark:bg-coral-950/20 border-2 border-coral-400 text-coral-600 dark:text-coral-300 rounded-2xl text-sm font-extrabold animate-pulse">
            <Clock size={16} />
            <span>{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      {/* Question Card */}
      <div className="card-playful bg-white dark:bg-slate-800 p-8 flex flex-col gap-6 border-slate-100">
        
        {/* Progress indicator */}
        <div className="flex items-center justify-between text-xs text-slate-400 border-b pb-4">
          <span>Câu hỏi {currentIndex + 1} / {totalQuestions}</span>
          <span>Điểm: {q.points}đ</span>
        </div>

        {/* Question text */}
        <h3 className="text-xl font-black font-comic leading-relaxed text-slate-800 dark:text-slate-100">
          {q.text}
        </h3>

        {/* Options / Inputs layout */}
        <div className="mt-4">
          
          {/* Single Choice (Trắc nghiệm 1 đáp án) */}
          {q.type === 'single' && (
            <div className="flex flex-col gap-3">
              {q.options.map(opt => {
                const isSelected = currentAnswer?.selectedAnswerId === opt._id;
                return (
                  <button
                    key={opt._id}
                    onClick={() => handleSingleSelect(q._id, opt._id)}
                    className={`w-full py-4 px-6 rounded-2xl border-4 text-left transition-all text-sm font-bold flex items-center justify-between ${
                      isSelected 
                        ? 'bg-primary-50 dark:bg-slate-900 border-primary-500 text-primary-700 dark:text-primary-300 shadow-sm' 
                        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                  >
                    <span>{opt.text}</span>
                    <span className={`w-5 h-5 rounded-full border-2 shrink-0 ${isSelected ? 'border-primary-500 bg-primary-500' : 'border-slate-300 bg-white'}`} />
                  </button>
                );
              })}
            </div>
          )}

          {/* Multiple Choice */}
          {q.type === 'multiple' && (
            <div className="flex flex-col gap-3">
              {q.options.map(opt => {
                const isSelected = currentAnswer?.selectedAnswerIds?.includes(opt._id);
                return (
                  <button
                    key={opt._id}
                    onClick={() => handleMultipleSelect(q._id, opt._id)}
                    className={`w-full py-4 px-6 rounded-2xl border-4 text-left transition-all text-sm font-bold flex items-center justify-between ${
                      isSelected
                        ? 'bg-primary-50 dark:bg-slate-900 border-primary-500 text-primary-700 dark:text-primary-300 shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                  >
                    <span>{opt.text}</span>
                    <span className={`w-5 h-5 rounded-md border-2 shrink-0 ${isSelected ? 'border-primary-500 bg-primary-500' : 'border-slate-300 bg-white'}`} />
                  </button>
                );
              })}
            </div>
          )}

          {/* Text Input (Điền câu trả lời) */}
          {q.type === 'text' && (
            <div className="flex flex-col gap-2">
              <label className="text-xs text-slate-400 font-extrabold">Nhập đáp án của em ở đây</label>
              <input
                type="text"
                placeholder="Nhập câu trả lời..."
                value={currentAnswer?.textAnswer || ''}
                onChange={(e) => handleTextChange(q._id, e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border-4 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:border-primary-400 focus:outline-none transition-all text-lg font-bold"
              />
            </div>
          )}

          {/* Matching (Ghép nối) */}
          {q.type === 'match' && (
            <div className="flex flex-col gap-4">
              <p className="text-xs text-slate-400 font-bold">Hãy chọn kết quả phù hợp cho từng phép tính:</p>
              
              <div className="flex flex-col gap-3">
                {q.options.map(opt => {
                  const leftKey = opt.text;
                  const rightValue = currentAnswer?.matchAnswers?.[leftKey] || '';
                  
                  // Extract all matchingPair options as values
                  const uniquePairs = q.matchingOptions?.length
                    ? q.matchingOptions
                    : Array.from(new Set(q.options.map(o => o.matchingPair).filter(Boolean)));

                  return (
                    <div key={opt._id} className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 justify-between">
                      <span className="text-sm font-black text-slate-700 dark:text-slate-300">{leftKey}</span>
                      
                      <select
                        value={rightValue}
                        onChange={(e) => handleMatchSelect(q._id, leftKey, e.target.value)}
                        className="px-3 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs font-bold focus:outline-none"
                      >
                        <option value="">-- Chọn --</option>
                        {uniquePairs.map(val => (
                          <option key={val} value={val}>{val}</option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-8 border-t pt-6">
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="px-5 py-3 border-4 border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
          >
            <ArrowLeft size={16} />
            <span>Quay lại</span>
          </button>

          {currentIndex < totalQuestions - 1 ? (
            <button
              onClick={() => setCurrentIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
              className="px-5 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl text-sm font-bold flex items-center gap-1.5 shadow-[0_3px_0_0_#0284c7]"
            >
              <span>Tiếp theo</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={submitQuiz}
              disabled={submitting}
              className="px-6 py-3.5 bg-sunny-500 hover:bg-sunny-600 text-white rounded-2xl text-sm font-black flex items-center gap-1.5 shadow-[0_4px_0_0_#d97706] hover:scale-102 active:translate-y-0.5 active:shadow-none"
            >
              <CheckCircle size={18} />
              <span>{submitting ? 'Đang Nộp...' : 'Nộp Bài Thi 🎉'}</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
};

export default QuizEngine;
