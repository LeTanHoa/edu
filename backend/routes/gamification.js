import express from 'express';
import { Student, Badge, Achievement, Notification, Log } from '../models/index.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET Leaderboard (Top students by XP)
router.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await Student.find()
      .populate('user', 'fullName avatar')
      .sort('-xp')
      .limit(10);
    res.json({ success: true, leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi tải bảng xếp hạng' });
  }
});

// GET all badges
router.get('/badges', async (req, res) => {
  try {
    const badges = await Badge.find();
    res.json({ success: true, badges });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi tải danh sách huy hiệu' });
  }
});

// Purchase/Claim Badge with Coins
router.post('/badges/claim', protect, authorize('student'), async (req, res) => {
  try {
    const { badgeId } = req.body;
    const badge = await Badge.findById(badgeId);
    if (!badge) {
      return res.status(404).json({ success: false, message: 'Huy hiệu không tồn tại' });
    }

    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Hồ sơ học sinh không tồn tại' });
    }

    // Check if already unlocked
    const alreadyUnlocked = student.badges.some(b => b.badge.toString() === badgeId);
    if (alreadyUnlocked) {
      return res.status(400).json({ success: false, message: 'Bạn đã sở hữu huy hiệu này rồi!' });
    }

    // Check cost criteria (either coins or XP requirement)
    if (student.coins < badge.coinCost) {
      return res.status(400).json({ success: false, message: 'Bạn không đủ xu để đổi huy hiệu này!' });
    }
    if (student.xp < badge.xpRequired) {
      return res.status(400).json({ success: false, message: 'Bạn chưa đạt đủ XP yêu cầu để nhận huy hiệu này!' });
    }

    // Deduct coins and add badge
    student.coins -= badge.coinCost;
    student.badges.push({ badge: badge._id, unlockedAt: new Date() });
    await student.save();

    // Log achievement
    await Achievement.create({
      student: req.user._id,
      badge: badge._id
    });

    await Notification.create({
      recipient: req.user._id,
      title: '🏆 Đã nhận Huy hiệu mới!',
      content: `Chúc mừng bạn đã sở hữu thành công huy hiệu "${badge.name}"!`,
      type: 'system'
    });

    await Log.create({ user: req.user._id, action: 'BADGE_CLAIM', details: `Đổi huy hiệu: ${badge.name}` });

    res.json({ success: true, message: 'Đổi huy hiệu thành công!', coinsLeft: student.coins });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi khi đổi huy hiệu' });
  }
});

// GET current student's achievements
router.get('/achievements', protect, authorize('student'), async (req, res) => {
  try {
    const achievements = await Achievement.find({ student: req.user._id }).populate('badge');
    res.json({ success: true, achievements });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi tải thành tích cá nhân' });
  }
});

// Student Daily Check-in Claim
router.post('/daily-checkin', protect, authorize('student'), async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ học sinh' });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let lastLoginDate = null;
    if (student.dailyStreak.lastLogin) {
      const lld = new Date(student.dailyStreak.lastLogin);
      lastLoginDate = new Date(lld.getFullYear(), lld.getMonth(), lld.getDate());
    }

    if (lastLoginDate && today.getTime() === lastLoginDate.getTime()) {
      return res.status(400).json({ success: false, message: 'Hôm nay bạn đã điểm danh rồi!' });
    }

    // Check if yesterday is the last login
    const oneDay = 24 * 60 * 60 * 1000;
    const isConsecutive = lastLoginDate && today.getTime() - lastLoginDate.getTime() === oneDay;

    if (isConsecutive) {
      student.dailyStreak.count += 1;
    } else {
      student.dailyStreak.count = 1;
    }

    student.dailyStreak.lastLogin = now;
    
    // Streak reward: 10 + (2 * streak count) coins, cap at 30
    const bonusCoins = Math.min(10 + student.dailyStreak.count * 2, 30);
    student.coins += bonusCoins;
    student.xp += 10; // 10 XP daily checkin
    await student.save();

    await Notification.create({
      recipient: req.user._id,
      title: '📅 Điểm danh hằng ngày!',
      content: `Chuỗi điểm danh liên tiếp: ${student.dailyStreak.count} ngày. Nhận +${bonusCoins} xu và +10 XP!`,
      type: 'system'
    });

    res.json({
      success: true,
      message: 'Điểm danh hằng ngày thành công!',
      streakCount: student.dailyStreak.count,
      bonusCoins
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Không thể điểm danh' });
  }
});

export default router;
