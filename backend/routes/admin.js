import express from 'express';
import { User, Student, Teacher, Course, Enrollment, Grade, Log, Setting, Category, Submission, Assignment, ParentFeedback } from '../models/index.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

const makeSlug = (value) => value
  .toString()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .replace(/Đ/g, 'D')
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

// ================= USER MANAGEMENT =================

// GET all users
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const { role, keyword } = req.query;
    let query = {};
    if (role) query.role = role;
    if (keyword) {
      query.$or = [
        { username: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } },
        { fullName: { $regex: keyword, $options: 'i' } }
      ];
    }
    const users = await User.find(query).select('-password').sort('-createdAt');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi tải danh sách người dùng' });
  }
});

// Create user
router.post('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const { username, email, password, role, fullName, gradeLevel } = req.body;
    const exists = await User.findOne({ $or: [{ username }, { email }] });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Tên tài khoản hoặc email đã tồn tại' });
    }

    const user = await User.create({ username, email, password, role, fullName });

    if (role === 'student') {
      await Student.create({ user: user._id, gradeLevel: gradeLevel || 1 });
    } else if (role === 'teacher') {
      await Teacher.create({ user: user._id, specialty: ['Tổng hợp'] });
    }

    await Log.create({ user: req.user._id, action: 'ADMIN_CREATE_USER', details: `Tạo người dùng mới: ${username} (${role})` });
    res.status(201).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi tạo người dùng' });
  }
});

// Toggle account Lock status
router.post('/users/:id/toggle-status', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Bạn không thể tự khóa tài khoản của chính mình!' });
    }

    user.isActive = !user.isActive;
    await user.save();

    const action = user.isActive ? 'USER_UNLOCK' : 'USER_LOCK';
    await Log.create({
      user: req.user._id,
      action,
      details: `${user.isActive ? 'Mở khóa' : 'Khóa'} tài khoản: ${user.username}`
    });

    res.json({ success: true, message: `Trạng thái hoạt động đã được cập nhật thành: ${user.isActive ? 'Hoạt động' : 'Tạm khóa'}` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi thay đổi trạng thái' });
  }
});

// Reset User Password
router.post('/users/:id/reset-password', protect, authorize('admin'), async (req, res) => {
  try {
    const { newPassword } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
    }

    user.password = newPassword;
    await user.save();

    await Log.create({ user: req.user._id, action: 'ADMIN_RESET_PWD', details: `Admin reset mật khẩu cho ${user.username}` });

    res.json({ success: true, message: 'Đặt lại mật khẩu thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi reset mật khẩu' });
  }
});

// ================= CATEGORY MANAGEMENT =================

// GET all subject categories
router.get('/categories', protect, authorize('admin'), async (req, res) => {
  try {
    const categories = await Category.find().sort('gradeLevel name');
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi tải danh sách môn học' });
  }
});

// Create subject category
router.post('/categories', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, slug, description, gradeLevel } = req.body;
    const cleanName = (name || '').trim();
    if (!cleanName) {
      return res.status(400).json({ success: false, message: 'Tên môn học là bắt buộc' });
    }

    const cleanSlug = makeSlug(slug || cleanName);
    const exists = await Category.findOne({ $or: [{ name: cleanName }, { slug: cleanSlug }] });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Môn học hoặc slug đã tồn tại' });
    }

    const category = await Category.create({
      name: cleanName,
      slug: cleanSlug,
      description: description || '',
      gradeLevel: Number(gradeLevel) || 1
    });

    await Log.create({ user: req.user._id, action: 'CREATE_CATEGORY', details: `Tạo môn học: ${category.name}` });
    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi tạo môn học' });
  }
});

// Update subject category
router.put('/categories/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy môn học' });
    }

    const { name, slug, description, gradeLevel } = req.body;
    if (name !== undefined) category.name = name.trim();
    if (slug !== undefined || name !== undefined) category.slug = makeSlug(slug || category.name);
    if (description !== undefined) category.description = description;
    if (gradeLevel !== undefined) category.gradeLevel = Number(gradeLevel) || 1;

    await category.save();
    await Log.create({ user: req.user._id, action: 'UPDATE_CATEGORY', details: `Cập nhật môn học: ${category.name}` });
    res.json({ success: true, category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Môn học hoặc slug đã tồn tại' });
    }
    res.status(500).json({ success: false, message: 'Lỗi cập nhật môn học' });
  }
});

// Delete subject category
router.delete('/categories/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const usedByCourses = await Course.countDocuments({ category: req.params.id });
    if (usedByCourses > 0) {
      return res.status(400).json({ success: false, message: 'Không thể xóa môn học đang được dùng bởi khóa học' });
    }

    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy môn học' });
    }

    await Log.create({ user: req.user._id, action: 'DELETE_CATEGORY', details: `Xóa môn học: ${category.name}` });
    res.json({ success: true, message: 'Đã xóa môn học' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi xóa môn học' });
  }
});

// ================= PARENT FEEDBACK MANAGEMENT =================

router.get('/feedback', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, keyword } = req.query;
    const query = {};

    if (status) query.status = status;
    if (keyword) {
      query.$or = [
        { parentName: { $regex: keyword, $options: 'i' } },
        { studentName: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } },
        { message: { $regex: keyword, $options: 'i' } }
      ];
    }

    const feedback = await ParentFeedback.find(query).sort('-createdAt');
    const stats = {
      total: await ParentFeedback.countDocuments(),
      new: await ParentFeedback.countDocuments({ status: 'new' }),
      reviewed: await ParentFeedback.countDocuments({ status: 'reviewed' }),
      archived: await ParentFeedback.countDocuments({ status: 'archived' })
    };

    res.json({ success: true, feedback, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi tải danh sách ý kiến phụ huynh' });
  }
});

router.put('/feedback/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const feedback = await ParentFeedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy ý kiến' });
    }

    const { status, adminNote } = req.body;
    if (status !== undefined) feedback.status = status;
    if (adminNote !== undefined) feedback.adminNote = adminNote;

    await feedback.save();
    await Log.create({
      user: req.user._id,
      action: 'ADMIN_UPDATE_FEEDBACK',
      details: `Cập nhật ý kiến phụ huynh: ${feedback.parentName}`
    });

    res.json({ success: true, feedback, message: 'Đã cập nhật ý kiến phụ huynh' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi cập nhật ý kiến phụ huynh' });
  }
});

router.delete('/feedback/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const feedback = await ParentFeedback.findByIdAndDelete(req.params.id);
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy ý kiến' });
    }

    await Log.create({
      user: req.user._id,
      action: 'ADMIN_DELETE_FEEDBACK',
      details: `Xóa ý kiến phụ huynh: ${feedback.parentName}`
    });

    res.json({ success: true, message: 'Đã xóa ý kiến phụ huynh' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi xóa ý kiến phụ huynh' });
  }
});

// ================= SYSTEM SETTINGS & AUDIT LOGS =================

// GET Settings
router.get('/settings', async (req, res) => {
  try {
    let settings = await Setting.findOne({ key: 'global_config' });
    if (!settings) {
      settings = await Setting.create({ key: 'global_config' });
    }
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi tải cấu hình hệ thống' });
  }
});

// PUT Settings
router.put('/settings', protect, authorize('admin'), async (req, res) => {
  try {
    const updateData = req.body;
    let settings = await Setting.findOne({ key: 'global_config' });
    if (!settings) {
      settings = new Setting({ key: 'global_config' });
    }

    Object.assign(settings, updateData);
    await settings.save();

    await Log.create({ user: req.user._id, action: 'UPDATE_SETTINGS', details: 'Cập nhật cấu hình hệ thống' });

    res.json({ success: true, message: 'Cập nhật cấu hình hệ thống thành công!', settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi lưu cấu hình' });
  }
});

// GET Audit Logs
router.get('/logs', protect, authorize('admin'), async (req, res) => {
  try {
    const logs = await Log.find().populate('user', 'fullName username role').sort('-createdAt').limit(100);
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi tải nhật ký hệ thống' });
  }
});

// ================= DASHBOARDS STATS =================

// Student Dashboard metrics
router.get('/dashboard/student', protect, authorize('student'), async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id }).populate('course');
    const studentProfile = await Student.findOne({ user: req.user._id });
    const grades = await Grade.find({ student: req.user._id }).populate('course');

    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter(e => e.isCompleted).length;

    // Get average grade
    let avgGrade = 0;
    if (grades.length > 0) {
      const totalScore = grades.reduce((acc, g) => acc + (g.score / g.maxScore) * 100, 0);
      avgGrade = Math.round(totalScore / grades.length);
    }

    // Pending assignments
    const enrolledCourseIds = enrollments.map(e => e.course._id);
    const assignments = await Assignment.find({ course: { $in: enrolledCourseIds } });
    const submissionCount = await Submission.countDocuments({
      student: req.user._id,
      assignment: { $in: assignments.map(a => a._id) }
    });
    const pendingHomework = Math.max(0, assignments.length - submissionCount);

    res.json({
      success: true,
      stats: {
        totalCourses,
        completedCourses,
        xp: studentProfile ? studentProfile.xp : 0,
        coins: studentProfile ? studentProfile.coins : 0,
        level: studentProfile ? studentProfile.level : 1,
        badgesCount: studentProfile ? studentProfile.badges.length : 0,
        dailyStreak: studentProfile ? studentProfile.dailyStreak.count : 0,
        avgGrade,
        pendingHomework
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi tải thống kê học sinh' });
  }
});

// Teacher Dashboard metrics
router.get('/dashboard/teacher', protect, authorize('teacher'), async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id });
    const courseIds = courses.map(c => c._id);

    const totalCourses = courses.length;
    const enrollments = await Enrollment.find({ course: { $in: courseIds } });
    const totalStudents = new Set(enrollments.map(e => e.student.toString())).size;

    const assignments = await Assignment.find({ course: { $in: courseIds } });
    const pendingGrading = await Submission.countDocuments({
      assignment: { $in: assignments.map(a => a._id) },
      status: 'submitted'
    });

    res.json({
      success: true,
      stats: {
        totalCourses,
        totalStudents,
        pendingGrading
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi tải thống kê giáo viên' });
  }
});

// Admin Dashboard metrics
router.get('/dashboard/admin', protect, authorize('admin'), async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalCourses = await Course.countDocuments();
    const activeCourses = await Course.countDocuments({ isPublished: true });

    // Recent user growth mockup or count
    const recentStudents = await User.find({ role: 'student' }).sort('-createdAt').limit(5).select('fullName createdAt');
    
    // Top course ratings
    const courses = await Course.find().sort('-enrollmentCount').limit(5).populate('instructor', 'fullName');

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalTeachers,
        totalCourses,
        activeCourses,
        recentStudents,
        topCourses: courses
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi tải thống kê quản trị' });
  }
});

export default router;
