import express from 'express';
import { Quiz, Question, Answer, Grade, Student, Notification, Log, Course } from '../models/index.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get Quiz details and questions (Secured: choice correctness is hidden for students)
router.get('/:quizId', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Bài kiểm tra không tồn tại' });
    }

    const questions = await Question.find({ quiz: quiz._id });
    const formattedQuestions = [];

    for (let q of questions) {
      const answers = await Answer.find({ question: q._id }).select('-__v');
      const matchingOptions = q.type === 'match'
        ? Array.from(new Set(answers.map(a => a.matchingPair).filter(Boolean)))
        : [];
      
      // If student, strip correctness fields to prevent cheating
      const cleanAnswers = answers.map(a => {
        const obj = a.toObject();
        if (req.user.role === 'student') {
          delete obj.isCorrect;
          delete obj.matchingPair;
          delete obj.order;
        }
        return obj;
      });

      formattedQuestions.push({
        ...q.toObject(),
        options: cleanAnswers,
        matchingOptions
      });
    }

    res.json({
      success: true,
      quiz,
      questions: formattedQuestions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi tải bài kiểm tra' });
  }
});

// Submit Quiz answers and auto-grade
router.post('/:quizId/submit', protect, authorize('student'), async (req, res) => {
  try {
    const { submissions } = req.body; // Array of { questionId, selectedAnswerId, textAnswer, matchAnswers: { [left]: [right] } }
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Bài kiểm tra không tồn tại' });
    }

    const questions = await Question.find({ quiz: quiz._id });
    let totalPoints = 0;
    let earnedPoints = 0;
    const gradedQuestions = [];

    for (let q of questions) {
      totalPoints += q.points;
      const dbAnswers = await Answer.find({ question: q._id });
      const userSub = submissions.find(s => s.questionId === q._id.toString());
      
      let isCorrect = false;
      let studentAnswersText = '';

      if (userSub) {
        if (q.type === 'single') {
          const correctAns = dbAnswers.find(a => a.isCorrect);
          if (correctAns && correctAns._id.toString() === userSub.selectedAnswerId) {
            isCorrect = true;
          }
          const chosen = dbAnswers.find(a => a._id.toString() === userSub.selectedAnswerId);
          studentAnswersText = chosen ? chosen.text : '';
        } else if (q.type === 'multiple') {
          const correctIds = dbAnswers.filter(a => a.isCorrect).map(a => a._id.toString()).sort();
          const selectedIds = (userSub.selectedAnswerIds || []).sort();
          if (JSON.stringify(correctIds) === JSON.stringify(selectedIds)) {
            isCorrect = true;
          }
          studentAnswersText = dbAnswers.filter(a => selectedIds.includes(a._id.toString())).map(a => a.text).join(', ');
        } else if (q.type === 'text') {
          const correctAns = dbAnswers.find(a => a.isCorrect);
          const cleanUserAns = (userSub.textAnswer || '').trim().toLowerCase();
          const cleanCorrectAns = correctAns ? correctAns.text.trim().toLowerCase() : '';
          if (cleanUserAns === cleanCorrectAns) {
            isCorrect = true;
          }
          studentAnswersText = userSub.textAnswer || '';
        } else if (q.type === 'match') {
          // Check matching pairs
          // dbAnswers has text as 'left key' and matchingPair as 'right value'
          const studentMatches = userSub.matchAnswers || {};
          let allMatched = true;
          for (let dbAns of dbAnswers) {
            if (studentMatches[dbAns.text] !== dbAns.matchingPair) {
              allMatched = false;
              break;
            }
          }
          isCorrect = allMatched;
          studentAnswersText = JSON.stringify(studentMatches);
        } else if (q.type === 'drag') {
          // Check sorting orders
          const sortedIds = userSub.sortedAnswerIds || [];
          let correctSeq = true;
          const orderedAnswers = [...dbAnswers].sort((a, b) => a.order - b.order);
          for (let i = 0; i < orderedAnswers.length; i++) {
            if (sortedIds[i] !== orderedAnswers[i]._id.toString()) {
              correctSeq = false;
              break;
            }
          }
          isCorrect = correctSeq;
          studentAnswersText = 'Đã sắp xếp thứ tự';
        }
      }

      if (isCorrect) {
        earnedPoints += q.points;
      }

      gradedQuestions.push({
        questionId: q._id,
        text: q.text,
        type: q.type,
        points: q.points,
        isCorrect,
        correctAnswers: dbAnswers.filter(a => a.isCorrect).map(a => ({ text: a.text, matchingPair: a.matchingPair })),
        studentAnswer: studentAnswersText
      });
    }

    const percentageScore = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const isPassed = percentageScore >= quiz.passingScore;

    // Save Grade
    await Grade.create({
      student: req.user._id,
      course: quiz.course,
      type: 'quiz',
      referenceId: quiz._id,
      score: percentageScore,
      maxScore: 100,
      remarks: isPassed ? 'Đạt' : 'Chưa đạt'
    });

    let xpAwarded = 0;
    let coinsAwarded = 0;

    if (isPassed) {
      xpAwarded = 50; // Quiz rewards
      coinsAwarded = 15;
      
      const student = await Student.findOne({ user: req.user._id });
      if (student) {
        student.xp += xpAwarded;
        student.coins += coinsAwarded;
        await student.save();
      }

      await Notification.create({
        recipient: req.user._id,
        title: '🌟 Hoàn thành bài trắc nghiệm!',
        content: `Chúc mừng bạn đã vượt qua bài kiểm tra "${quiz.title}" với điểm số ${percentageScore}%. Nhận được +${xpAwarded} XP và +${coinsAwarded} xu!`,
        type: 'system'
      });
    }

    await Log.create({ user: req.user._id, action: 'QUIZ_SUBMIT', details: `Nộp bài trắc nghiệm: ${quiz.title}. Điểm: ${percentageScore}%` });

    res.json({
      success: true,
      score: percentageScore,
      isPassed,
      xpAwarded,
      coinsAwarded,
      details: quiz.showAnswersAfterSubmission ? gradedQuestions : []
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Nộp bài kiểm tra thất bại' });
  }
});

// Create Quiz (Teacher/Admin)
router.post('/', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { title, description, courseId, chapterId, lessonId, timeLimit, passingScore } = req.body;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khóa học' });
    }
    const isOwner = course.instructor.toString() === req.user._id.toString();
    if (req.user.role !== 'admin' && !isOwner) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền tạo quiz cho khóa học này' });
    }

    const quiz = await Quiz.create({
      title,
      description,
      course: courseId,
      chapter: chapterId || null,
      lesson: lessonId || null,
      timeLimit: timeLimit || 0,
      passingScore: passingScore || 50
    });
    res.status(201).json({ success: true, quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi tạo bài trắc nghiệm' });
  }
});

// Create question with answer options (Teacher/Admin)
router.post('/:quizId/questions', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId).populate('course');
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy quiz' });
    }

    const isOwner = quiz.course?.instructor?.toString() === req.user._id.toString();
    if (req.user.role !== 'admin' && !isOwner) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền thêm câu hỏi cho quiz này' });
    }

    const { text, type, points, answers } = req.body;
    const question = await Question.create({
      quiz: quiz._id,
      text,
      type: type || 'single',
      points: points || 10
    });

    const createdAnswers = await Answer.insertMany((answers || []).map((answer, index) => ({
      question: question._id,
      text: answer.text,
      isCorrect: Boolean(answer.isCorrect),
      matchingPair: answer.matchingPair || '',
      order: Number.isFinite(Number(answer.order)) ? Number(answer.order) : index
    })));

    res.status(201).json({ success: true, question, answers: createdAnswers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi tạo câu hỏi' });
  }
});

export default router;
