import express from 'express';
import { Banner, Log } from '../models/index.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET active banners (public)
router.get('/', async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort('order');
    res.json({ success: true, banners });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi tải banner' });
  }
});

// GET all banners (admin)
router.get('/all', protect, authorize('admin'), async (req, res) => {
  try {
    const banners = await Banner.find().sort('order');
    res.json({ success: true, banners });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi tải danh sách banner' });
  }
});

// CREATE banner (admin)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { title, subtitle, imageUrl, linkUrl, order, isActive } = req.body;
    const banner = await Banner.create({
      title,
      subtitle: subtitle || '',
      imageUrl,
      linkUrl: linkUrl || '',
      order: order || 0,
      isActive: isActive !== false
    });

    await Log.create({ user: req.user._id, action: 'CREATE_BANNER', details: `Tạo banner: ${title}` });
    res.status(201).json({ success: true, banner });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi tạo banner' });
  }
});

// UPDATE banner (admin)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy banner' });
    }

    await Log.create({ user: req.user._id, action: 'UPDATE_BANNER', details: `Cập nhật banner: ${banner.title}` });
    res.json({ success: true, banner });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi cập nhật banner' });
  }
});

// DELETE banner (admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy banner' });
    }

    await Log.create({ user: req.user._id, action: 'DELETE_BANNER', details: `Xóa banner: ${banner.title}` });
    res.json({ success: true, message: 'Đã xóa banner' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi xóa banner' });
  }
});

export default router;
