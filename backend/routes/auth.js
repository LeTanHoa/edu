import express from 'express';
import jwt from 'jsonwebtoken';
import { User, Student, Teacher, Admin, Log } from '../models/index.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import nodemailer from 'nodemailer';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'edukids_super_secret_key_12345';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'edukids_refresh_secret_key_67890';

// Helper to generate tokens
const generateTokens = (user) => {
  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
  const refreshToken = jwt.sign({ id: user._id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { token, refreshToken };
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role, fullName, gradeLevel, className, specialty } = req.body;

    const userExists = await User.findOne({ $or: [{ username }, { email }] });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Tên đăng nhập hoặc Email đã được sử dụng' });
    }

    const user = await User.create({
      username,
      email,
      password,
      role: role || 'student',
      fullName,
    });

    if (user.role === 'student') {
      await Student.create({
        user: user._id,
        gradeLevel: gradeLevel || 1,
        className: className || '',
      });
    } else if (user.role === 'teacher') {
      await Teacher.create({
        user: user._id,
        specialty: specialty ? (Array.isArray(specialty) ? specialty : [specialty]) : ['Chưa phân loại'],
      });
    } else if (user.role === 'admin') {
      await Admin.create({ user: user._id });
    }

    // Log action
    await Log.create({ user: user._id, action: 'REGISTER_SUCCESS', details: `Đăng ký tài khoản: ${username} (${role})` });

    const { token, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        avatar: user.avatar,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Đăng ký thất bại, máy chủ gặp sự cố' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Tài khoản của bạn đang bị khóa' });
    }

    // Handle student login streak
    if (user.role === 'student') {
      const student = await Student.findOne({ user: user._id });
      if (student) {
        const now = new Date();
        const lastLogin = student.dailyStreak.lastLogin;
        if (lastLogin) {
          const diffTime = Math.abs(now - lastLogin);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            student.dailyStreak.count += 1;
            // Award coins for streak
            student.coins += 10;
          } else if (diffDays > 1) {
            student.dailyStreak.count = 1;
          }
        } else {
          student.dailyStreak.count = 1;
        }
        student.dailyStreak.lastLogin = now;
        await student.save();
      }
    }

    // Log action
    await Log.create({ user: user._id, action: 'LOGIN_SUCCESS', details: `Đăng nhập thành công` });

    const { token, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        avatar: user.avatar,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Đăng nhập thất bại, máy chủ gặp sự cố' });
  }
});

// Refresh Token
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ success: false, message: 'Thiếu Refresh Token' });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token không hợp lệ hoặc đã hết hạn' });
    }

    const tokens = generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.json({
      success: true,
      token: tokens.token,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({ success: false, message: 'Refresh token không hợp lệ' });
  }
});

// Forgot Password (OTP)
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng với email này' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
    user.otp = {
      code: otpCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins expiration
    };
    await user.save();

    console.log(`[DEVELOPMENT OTP] OTP Code for ${email}: ${otpCode}`);

    // Try sending email (fallback gracefully)
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: process.env.SMTP_PORT || 587,
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || '',
        },
      });

      await transporter.sendMail({
        from: '"EduKids Support" <support@edukids.com>',
        to: email,
        subject: 'Mã khôi phục mật khẩu EduKids',
        text: `Mã OTP khôi phục mật khẩu của bạn là: ${otpCode}. Mã này có hiệu lực trong 10 phút.`,
        html: `<p>Mã OTP khôi phục mật khẩu của bạn là: <strong>${otpCode}</strong></p><p>Mã này có hiệu lực trong 10 phút.</p>`,
      });
    } catch (mailError) {
      console.warn('SMTP sending error, fallback to developer console only: ', mailError.message);
    }

    res.json({ success: true, message: 'Mã OTP khôi phục mật khẩu đã được gửi (kiểm tra console hoặc hòm thư)' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Yêu cầu thất bại' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !user.otp || user.otp.code !== otp || user.otp.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Mã OTP không đúng hoặc đã hết hạn' });
    }

    user.password = newPassword;
    user.otp = undefined; // clear otp
    await user.save();

    await Log.create({ user: user._id, action: 'RESET_PASSWORD', details: `Khôi phục mật khẩu qua Email thành công` });

    res.json({ success: true, message: 'Đặt lại mật khẩu thành công!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi đặt lại mật khẩu' });
  }
});

// Change Password
router.post('/change-password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không chính xác' });
    }

    user.password = newPassword;
    await user.save();

    await Log.create({ user: user._id, action: 'CHANGE_PASSWORD', details: `Đổi mật khẩu thành công` });

    res.json({ success: true, message: 'Đổi mật khẩu thành công!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Đã xảy ra lỗi' });
  }
});

// Get Me
router.get('/me', protect, async (req, res) => {
  try {
    let profileData = null;
    if (req.user.role === 'student') {
      profileData = await Student.findOne({ user: req.user._id }).populate('badges.badge');
    } else if (req.user.role === 'teacher') {
      profileData = await Teacher.findOne({ user: req.user._id });
    } else if (req.user.role === 'admin') {
      profileData = await Admin.findOne({ user: req.user._id });
    }

    res.json({
      success: true,
      user: req.user,
      profile: profileData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lấy dữ liệu người dùng thất bại' });
  }
});

// Update Profile
router.put('/update-profile', protect, async (req, res) => {
  const { fullName, gradeLevel, className, specialty, bio } = req.body;
  try {
    const user = await User.findById(req.user.id);
    user.fullName = fullName || user.fullName;
    await user.save();

    if (user.role === 'student') {
      const student = await Student.findOne({ user: user._id });
      if (student) {
        student.gradeLevel = gradeLevel || student.gradeLevel;
        student.className = className || student.className;
        await student.save();
      }
    } else if (user.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: user._id });
      if (teacher) {
        teacher.specialty = specialty ? (Array.isArray(specialty) ? specialty : [specialty]) : teacher.specialty;
        teacher.bio = bio || teacher.bio;
        await teacher.save();
      }
    }

    res.json({ success: true, message: 'Cập nhật hồ sơ cá nhân thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Cập nhật hồ sơ thất bại' });
  }
});

// Upload Avatar
router.post('/upload-avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn một tệp ảnh để tải lên' });
    }
    const avatarUrl = `/uploads/${req.file.filename}`;
    
    const user = await User.findById(req.user.id);
    user.avatar = avatarUrl;
    await user.save();

    res.json({ success: true, avatarUrl, message: 'Tải ảnh đại diện thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Không thể upload ảnh đại diện' });
  }
});

export default router;
