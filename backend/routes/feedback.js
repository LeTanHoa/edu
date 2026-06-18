import express from 'express';
import { ParentFeedback } from '../models/index.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { parentName, studentName, email, phone, gradeLevel, rating, message } = req.body;
    const cleanParentName = (parentName || '').trim();
    const cleanEmail = (email || '').trim();
    const cleanMessage = (message || '').trim();

    if (!cleanParentName || !cleanEmail || !cleanMessage) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập họ tên, email và nội dung góp ý' });
    }

    const feedback = await ParentFeedback.create({
      parentName: cleanParentName,
      studentName: studentName || '',
      email: cleanEmail,
      phone: phone || '',
      gradeLevel: Number(gradeLevel) || 1,
      rating: Number(rating) || 5,
      message: cleanMessage
    });

    res.status(201).json({
      success: true,
      feedback,
      message: 'Cảm ơn phụ huynh đã gửi ý kiến. EduKids sẽ xem xét và phản hồi khi cần thiết.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Không thể gửi ý kiến lúc này' });
  }
});

export default router;
