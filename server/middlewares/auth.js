const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware bảo vệ route - yêu cầu đăng nhập
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers. authorization &&
    req.headers.authorization. startsWith('Bearer')
  ) {
    try {
      // Lấy token từ header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Lấy user từ token (không lấy password)
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({
        success: false,
        message: 'Token không hợp lệ'
      });
    }
  }

  if (! token) {
    res.status(401).json({
      success: false,
      message: 'Bạn chưa đăng nhập'
    });
  }
};

// Middleware kiểm tra quyền admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message:  'Bạn không có quyền truy cập'
    });
  }
};

module.exports = { protect, admin };