import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'edukids_super_secret_key_12345';

// Authenticate JWT Token
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Người dùng không tồn tại' });
      }
      if (!req.user.isActive) {
        return res.status(403).json({ success: false, message: 'Tài khoản đã bị khóa' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ success: false, message: 'Không thể xác thực, token không hợp lệ' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Không có quyền truy cập, thiếu token' });
  }
};

// Check User Role Authorization
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Không tìm thấy thông tin người dùng để xác thực' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Vai trò '${req.user.role}' không được phép thực hiện hành động này` 
      });
    }
    next();
  };
};
