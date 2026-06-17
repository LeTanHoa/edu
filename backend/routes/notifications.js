import express from 'express';
import { Notification } from '../models/index.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET notifications for current user
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { recipient: req.user._id },
        { recipient: null, recipientRole: { $in: ['all', req.user.role] } }
      ]
    })
      .populate('sender', 'fullName avatar role')
      .sort('-createdAt')
      .limit(50);

    res.json({ success: true, notifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi tải thông báo' });
  }
});

// Mark all notifications as read (must be before /:id/read)
router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      {
        isRead: false,
        $or: [
          { recipient: req.user._id },
          { recipient: null, recipientRole: { $in: ['all', req.user.role] } }
        ]
      },
      { isRead: true }
    );

    res.json({ success: true, message: 'Đã đánh dấu tất cả thông báo là đã đọc' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi cập nhật thông báo' });
  }
});

// Mark single notification as read
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông báo' });
    }

    const isOwner = notification.recipient?.toString() === req.user._id.toString();
    const isBroadcast = !notification.recipient && ['all', req.user.role].includes(notification.recipientRole);
    if (!isOwner && !isBroadcast) {
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập thông báo này' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ success: true, message: 'Đã đánh dấu đã đọc', notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi cập nhật thông báo' });
  }
});

export default router;
