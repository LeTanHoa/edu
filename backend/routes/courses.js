import express from 'express';
import jwt from 'jsonwebtoken';
import { Course, Chapter, Lesson, Category, Enrollment, Comment, Student, Assignment, Submission, Grade, Log, Notification, Certificate, Quiz } from '../models/index.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
const issueCertificateIfNeeded = async (studentId, courseId) => {
  const existing = await Certificate.findOne({ student: studentId, course: courseId });
  if (existing) return existing;

  const course = await Course.findById(courseId).populate('instructor', 'fullName');
  if (!course) return null;

  const certId = `CERT-${courseId.toString().slice(-4).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  const certificate = await Certificate.create({
    student: studentId,
    course: courseId,
    certId
  });

  await Notification.create({
    recipient: studentId,
    title: '🎓 Chúc mừng! Bé đã nhận chứng chỉ!',
    content: `Bé đã hoàn thành khóa học "${course.title}" và nhận được chứng chỉ hoàn thành!`,
    type: 'system'
  });

  return certificate;
};

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const courses = await Course.find({});
    res.json({ success: true, data:courses });
  } catch (error) {
    console.error(error); 
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
// // Get list of categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort('gradeLevel name');
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi tải danh mục môn học' });
  }
});

// Get enrolled courses for current student
router.get('/enrolled', protect, authorize('student'), async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate({
        path: 'course',
        populate: [
          { path: 'instructor', select: 'fullName avatar' },
          { path: 'category' }
        ]
      })
      .sort('-updatedAt');

    const courses = enrollments
      .filter(e => e.course)
      .map(e => ({
        ...e.course.toObject(),
        progress: e.progress,
        isCompleted: e.isCompleted,
        completedLessons: e.completedLessons,
        enrolledAt: e.createdAt
      }));

    res.json({ success: true, courses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi tải khóa học đã đăng ký' });
  }
});

// Get courses managed by current teacher/admin
router.get('/manage/mine', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { instructor: req.user._id };
    const courses = await Course.find(query)
      .populate('instructor', 'fullName avatar')
      .populate('category')
      .sort('-updatedAt');

    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi tải danh sách khóa học quản lý' });
  }
});

// Update publish/approval status for a course
router.put('/:id/status', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khóa học' });
    }

    const isOwner = course.instructor.toString() === req.user._id.toString();
    if (req.user.role !== 'admin' && !isOwner) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền cập nhật khóa học này' });
    }

    const { isPublished, isApproved } = req.body;
    if (typeof isPublished === 'boolean') course.isPublished = isPublished;
    if (typeof isApproved === 'boolean' && req.user.role === 'admin') course.isApproved = isApproved;
    if (req.user.role === 'teacher' && isPublished === true) course.isApproved = true;

    await course.save();
    res.json({ success: true, course, message: 'Đã cập nhật trạng thái khóa học' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi cập nhật trạng thái khóa học' });
  }
});

// Search and filter courses
router.get('/search', async (req, res) => {
  try {
    const { gradeLevel, category, keyword } = req.query;
    let query = { isPublished: true, isApproved: true };

    if (gradeLevel) query.gradeLevel = Number(gradeLevel);
    if (category) query.category = category;
    if (keyword) {
      query.title = { $regex: keyword, $options: 'i' };
    }

    const courses = await Course.find(query).populate('instructor', 'fullName avatar').populate('category');
    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi tải danh sách khóa học' });
  }
});


// Get course detail (with chapters and lessons)
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
 

    if (!course) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khóa học' });
    }

    let decodedUser = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
      try {
        decodedUser = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET || 'edukids_super_secret_key_12345');
      } catch (err) {
        decodedUser = null;
      }
    }
    console.log(decodedUser, "Decoded User in Course Detail");

    const canViewDraft = decodedUser && (
      decodedUser.role === 'admin' ||
      course.instructor?._id?.toString() === decodedUser.id
    );
    // if ((!course.isPublished || !course.isApproved) && !canViewDraft) {
    //   return res.status(404).json({ success: false, message: 'Khóa học chưa được xuất bản' });
    // }

    const chapters = await Chapter.find({ course: course._id }).sort('order');
    
    // Fetch lessons and quizzes for all chapters
    const chaptersData = [];
    for (let chap of chapters) {
      const lessons = await Lesson.find({ chapter: chap._id }).sort('order');
      chaptersData.push({
        _id: chap._id,
        title: chap.title,
        order: chap.order,
        lessons: lessons
      });
    }

    // Check if enrolled
    let isEnrolled = false;
    let enrollmentProgress = 0;
    let completedLessons = [];

    if (decodedUser) {
      try {
        const enroll = await Enrollment.findOne({ student: decodedUser.id, course: course._id });
        if (enroll) {
          isEnrolled = true;
          enrollmentProgress = enroll.progress;
          completedLessons = enroll.completedLessons;
        }
      } catch (err) {
        // Token verification failed or not logged in, ignore
      }
    }

    res.json({
      success: true,
      course,
      chapters: chaptersData,
      isEnrolled,
      progress: enrollmentProgress,
      completedLessons
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi tải chi tiết khóa học' });
  }
});

// Enroll in a course (Students only)
router.post('/:id/enroll', protect, authorize('student'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khóa học này' });
    }

    const alreadyEnrolled = await Enrollment.findOne({ student: req.user._id, course: course._id });
    if (alreadyEnrolled) {
      return res.status(400).json({ success: false, message: 'Bạn đã đăng ký khóa học này rồi!' });
    }

    await Enrollment.create({
      student: req.user._id,
      course: course._id,
    });

    course.enrollmentCount += 1;
    await course.save();

    await Log.create({ user: req.user._id, action: 'COURSE_ENROLL', details: `Đăng ký khóa học: ${course.title}` });

    res.json({ success: true, message: 'Đăng ký khóa học thành công!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Đăng ký học thất bại' });
  }
});

// Mark Lesson Completed and Award XP/Coins
router.post('/lessons/:lessonId/complete', protect, authorize('student'), async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Bài học không tồn tại' });
    }

    const enrollment = await Enrollment.findOne({ student: req.user._id, course: lesson.course });
    if (!enrollment) {
      return res.status(400).json({ success: false, message: 'Bạn chưa đăng ký khóa học này!' });
    }

    const isAlreadyCompleted = enrollment.completedLessons.some(id => id.toString() === lesson._id.toString());
    if (!isAlreadyCompleted) {
      enrollment.completedLessons.push(lesson._id);
      
      // Calculate new progress percentage
      const totalLessons = await Lesson.countDocuments({ course: lesson.course });
      enrollment.progress = Math.round((enrollment.completedLessons.length / totalLessons) * 100);
      
      if (enrollment.progress === 100 && !enrollment.isCompleted) {
        enrollment.isCompleted = true;
        enrollment.completedAt = new Date();
        await issueCertificateIfNeeded(req.user._id, lesson.course);
      }

      await enrollment.save();

      // Award XP and Coins to student
      const student = await Student.findOne({ user: req.user._id });
      if (student) {
        student.xp += 15; // 15 XP per lesson completion
        student.coins += 5; // 5 Coins
        
        // Level up check (every 100 XP is a level)
        const newLevel = Math.floor(student.xp / 100) + 1;
        if (newLevel > student.level) {
          student.level = newLevel;
          // Notify Student of Level Up
          await Notification.create({
            recipient: req.user._id,
            title: '🎉 Chúc mừng bạn lên cấp!',
            content: `Bạn đã đạt cấp độ ${newLevel}! Tiếp tục cố gắng nhé!`,
            type: 'system'
          });
        }
        await student.save();
      }
    }

    res.json({ success: true, progress: enrollment.progress, isCompleted: enrollment.isCompleted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi hoàn thành bài học' });
  }
});

// GET Quizzes for a lesson
router.get('/lessons/:lessonId/quizzes', protect, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ lesson: req.params.lessonId }).select('title description timeLimit passingScore lesson');
    const quizzesWithGrades = [];
    for (let q of quizzes) {
      const grade = await Grade.findOne({ student: req.user._id, referenceId: q._id }).sort('-score');
      quizzesWithGrades.push({
        ...q.toObject(),
        userScore: grade ? grade.score : null
      });
    }
    res.json({ success: true, quizzes: quizzesWithGrades });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi tải bài trắc nghiệm' });
  }
});

// GET Comments
router.get('/lessons/:lessonId/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ lesson: req.params.lessonId, parentComment: null })
      .populate('user', 'fullName role avatar')
      .sort('-createdAt');
      
    // Fetch replies for each comment
    const commentsWithReplies = [];
    for (let comment of comments) {
      const replies = await Comment.find({ parentComment: comment._id })
        .populate('user', 'fullName role avatar')
        .sort('createdAt');
      commentsWithReplies.push({
        ...comment.toObject(),
        replies
      });
    }

    res.json({ success: true, comments: commentsWithReplies });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi tải bình luận' });
  }
});

// POST Comment/Reply
router.post('/lessons/:lessonId/comments', protect, async (req, res) => {
  try {
    const { content, parentCommentId } = req.body;
    
    const comment = await Comment.create({
      lesson: req.params.lessonId,
      user: req.user._id,
      content,
      parentComment: parentCommentId || null
    });

    const populated = await Comment.findById(comment._id).populate('user', 'fullName role avatar');

    res.status(201).json({ success: true, comment: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Không thể đăng bình luận' });
  }
});

// GET Assignments for course
router.get('/:id/assignments', protect, async (req, res) => {
  try {
    const assignments = await Assignment.find({ course: req.params.id }).sort('deadline');
    res.json({ success: true, assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi tải bài tập' });
  }
});

// Student Submit Assignment
router.post('/assignments/:assignmentId/submit', protect, authorize('student'), upload.single('submissionFile'), async (req, res) => {
  try {
    const { content } = req.body;
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Bài tập không tồn tại' });
    }

    let fileUrl = '';
    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
    }

    // Check if already submitted
    let submission = await Submission.findOne({ assignment: assignment._id, student: req.user._id });
    if (submission) {
      submission.content = content || submission.content;
      submission.fileUrl = fileUrl || submission.fileUrl;
      submission.status = 'submitted';
      await submission.save();
    } else {
      submission = await Submission.create({
        assignment: assignment._id,
        student: req.user._id,
        content,
        fileUrl,
        status: 'submitted'
      });
    }

    res.json({ success: true, message: 'Nộp bài tập thành công!', submission });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Không thể nộp bài tập' });
  }
});

// GET Teacher Submissions Pending Grading
router.get('/submissions/pending', protect, authorize('teacher'), async (req, res) => {
  try {
    // Find courses taught by this teacher
    const courses = await Course.find({ instructor: req.user._id });
    const courseIds = courses.map(c => c._id);
    
    // Find assignments in those courses
    const assignments = await Assignment.find({ course: { $in: courseIds } });
    const assignmentIds = assignments.map(a => a._id);

    const submissions = await Submission.find({ assignment: { $in: assignmentIds }, status: 'submitted' })
      .populate('student', 'fullName email')
      .populate({
        path: 'assignment',
        populate: { path: 'course', select: 'title' }
      });

    res.json({ success: true, submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi tải danh sách bài chấm' });
  }
});

// Grade Student Submission (Teachers only)
router.post('/submissions/:submissionId/grade', protect, authorize('teacher'), async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    const submission = await Submission.findById(req.params.submissionId).populate('assignment');
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài nộp' });
    }

    submission.grade = grade;
    submission.feedback = feedback;
    submission.status = 'graded';
    submission.gradedAt = new Date();
    await submission.save();

    // Log Grade
    await Grade.create({
      student: submission.student,
      course: submission.assignment.course,
      type: 'assignment',
      referenceId: submission.assignment._id,
      score: grade,
      maxScore: submission.assignment.maxPoints,
      remarks: feedback
    });

    // Notify Student
    await Notification.create({
      recipient: submission.student,
      sender: req.user._id,
      title: '📝 Bài tập của bạn đã được chấm điểm!',
      content: `Bài tập "${submission.assignment.title}" đạt điểm ${grade}/${submission.assignment.maxPoints}. Nhận xét: "${feedback}"`,
      type: 'teacher'
    });

    // Award XP to student for completing homework
    const student = await Student.findOne({ user: submission.student });
    if (student) {
      student.xp += 30; // 30 XP for homework completed
      student.coins += 10;
      await student.save();
    }

    res.json({ success: true, message: 'Chấm điểm thành công!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi khi lưu điểm' });
  }
});

// Create Course (Teacher/Admin)
router.post('/', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { title, description, category, gradeLevel, xpReward, coinReward, thumbnail } = req.body;
    
    const course = await Course.create({
      title,
      description,
      instructor: req.user._id,
      category,
      gradeLevel,
      xpReward: xpReward || 100,
      coinReward: coinReward || 50,
      thumbnail: thumbnail || '',
      isApproved: req.user.role === 'admin' ? true : false // Auto approve if admin
    });

    res.status(201).json({ success: true, course });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi khi tạo khóa học' });
  }
});

// CRUD Chapters (Teacher/Admin)
router.post('/:id/chapters', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { title, order } = req.body;
    const chapter = await Chapter.create({
      course: req.params.id,
      title,
      order: order || 0
    });
    res.status(201).json({ success: true, chapter });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi tạo chương học' });
  }
});

// CRUD Lessons (Teacher/Admin)
router.post('/:id/chapters/:chapterId/lessons', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { title, description, contentType, contentUrl, bodyText, duration, order } = req.body;
    const lesson = await Lesson.create({
      course: req.params.id,
      chapter: req.params.chapterId,
      title,
      description,
      contentType,
      contentUrl,
      bodyText,
      duration: duration || 0,
      order: order || 0
    });
    res.status(201).json({ success: true, lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi tạo bài học' });
  }
});

// Create Assignment (Teacher/Admin)
router.post('/:id/assignments', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khóa học' });
    }

    const isOwner = course.instructor.toString() === req.user._id.toString();
    if (req.user.role !== 'admin' && !isOwner) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền tạo bài tập cho khóa học này' });
    }

    const { title, instructions, chapterId, deadline, maxPoints, fileUrl } = req.body;
    const assignment = await Assignment.create({
      course: course._id,
      chapter: chapterId || null,
      title,
      instructions,
      deadline,
      maxPoints: maxPoints || 10,
      fileUrl: fileUrl || ''
    });

    res.status(201).json({ success: true, assignment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi tạo bài tập' });
  }
});


 export default router;
