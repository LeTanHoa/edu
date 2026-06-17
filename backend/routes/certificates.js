import express from 'express';
import { Certificate } from '../models/index.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET certificates for current student
router.get('/', protect, authorize('student'), async (req, res) => {
  try {
    const certs = await Certificate.find({ student: req.user._id })
      .populate({
        path: 'course',
        populate: { path: 'instructor', select: 'fullName' }
      })
      .sort('-issueDate');

    const certificates = certs.map(cert => ({
      _id: cert._id,
      certId: cert.certId,
      courseTitle: cert.course?.title || 'Khóa học',
      studentName: req.user.fullName,
      issueDate: cert.issueDate,
      teacherName: cert.course?.instructor?.fullName || 'Giáo viên',
      pdfUrl: cert.pdfUrl
    }));

    res.json({ success: true, certificates });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi tải danh sách chứng chỉ' });
  }
});

// GET single certificate by id
router.get('/:id', protect, authorize('student'), async (req, res) => {
  try {
    const cert = await Certificate.findOne({ _id: req.params.id, student: req.user._id })
      .populate({
        path: 'course',
        populate: { path: 'instructor', select: 'fullName' }
      });

    if (!cert) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy chứng chỉ' });
    }

    res.json({
      success: true,
      certificate: {
        _id: cert._id,
        certId: cert.certId,
        courseTitle: cert.course?.title || 'Khóa học',
        studentName: req.user.fullName,
        issueDate: cert.issueDate,
        teacherName: cert.course?.instructor?.fullName || 'Giáo viên',
        pdfUrl: cert.pdfUrl
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi tải chứng chỉ' });
  }
});

export default router;
