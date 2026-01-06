const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Đăng ký user mới
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Kiểm tra user đã tồn tại
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng'
      });
    }

    // Tạo user mới
    const user = await User.create({
      name,
      email,
      password,
      phone
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name:  user.name,
          email: user. email,
          phone: user.phone,
          role: user.role,
          token: generateToken(user._id)
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Đăng nhập user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:  'Vui lòng nhập email và mật khẩu'
      });
    }

    // Tìm user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res. status(401).json({
        success:  false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    // Kiểm tra password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    res.status(200).json({
      success: true,
      data:  {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone:  user.phone,
        role: user. role,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Lấy thông tin user hiện tại
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res. status(500).json({
      success:  false,
      message: error.message
    });
  }
};

// @desc    Cập nhật thông tin user
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req. body.name || user.name;
      user.phone = req.body. phone || user.phone;
      user. avatar = req.body.avatar || user. avatar;

      if (req.body. password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.status(200).json({
        success: true,
        data: {
          _id:  updatedUser._id,
          name:  updatedUser.name,
          email:  updatedUser.email,
          phone:  updatedUser.phone,
          role:  updatedUser.role,
          token: generateToken(updatedUser._id)
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }
  } catch (error) {
    res. status(500).json({
      success:  false,
      message: error.message
    });
  }
};

module. exports = { register, login, getMe, updateProfile };