import express from 'express';
import { Message, User, Enrollment, Course } from '../models/index.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET all messages between logged-in user and another user
router.get('/messages/:userId', protect, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: targetUserId },
        { sender: targetUserId, receiver: currentUserId }
      ]
    }).sort('createdAt');

    // Mark received messages as read
    await Message.updateMany(
      { sender: targetUserId, receiver: currentUserId, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi tải lịch sử trò chuyện' });
  }
});

// POST send message
router.post('/send', protect, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Nội dung tin nhắn không thể bỏ trống' });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content: content.trim()
    });

    const populated = await Message.findById(message._id)
      .populate('sender', 'fullName avatar role')
      .populate('receiver', 'fullName avatar role');

    // Socket.io emission will be handled in server.js on connection,
    // we return the created message object here.
    res.status(201).json({ success: true, message: populated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Không thể gửi tin nhắn' });
  }
});

// GET contacts lists (role based)
router.get('/contacts', protect, async (req, res) => {
  try {
    const userRole = req.user.role;
    let contacts = [];

    if (userRole === 'student') {
      // Students can chat with teachers of courses they are enrolled in
      const enrollments = await Enrollment.find({ student: req.user._id }).populate('course');
      const teacherIds = enrollments.map(e => e.course.instructor.toString());
      
      contacts = await User.find({ _id: { $in: teacherIds }, role: 'teacher' }).select('fullName email avatar role');
    } else if (userRole === 'teacher') {
      // Teachers can chat with students enrolled in their courses
      const courses = await Course.find({ instructor: req.user._id });
      const courseIds = courses.map(c => c._id);
      
      const enrollments = await Enrollment.find({ course: { $in: courseIds } });
      const studentIds = enrollments.map(e => e.student.toString());

      contacts = await User.find({ _id: { $in: studentIds }, role: 'student' }).select('fullName email avatar role');
    } else if (userRole === 'admin') {
      // Admins can chat with any User
      contacts = await User.find({ _id: { $ne: req.user._id } }).select('fullName email avatar role');
    }

    res.json({ success: true, contacts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi tải danh bạ liên hệ' });
  }
});

export default router;
