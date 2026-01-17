const PaymentConfig = require('../models/PaymentConfig');

// @desc    Lấy tất cả cấu hình thanh toán
// @route   GET /api/payment-config
// @access  Public (để client lấy thông tin hiển thị)
const getAllPaymentConfigs = async (req, res) => {
  try {
    const configs = await PaymentConfig.find({ isActive: true }).sort({ isPrimary: -1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: configs.length,
      data: configs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Lấy cấu hình thanh toán primary
// @route   GET /api/payment-config/primary
// @access  Public
const getPrimaryPaymentConfig = async (req, res) => {
  try {
    let config = await PaymentConfig.findOne({ isPrimary: true, isActive: true });
    
    // Nếu không có primary, lấy config đầu tiên
    if (!config) {
      config = await PaymentConfig.findOne({ isActive: true });
    }
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Chưa có cấu hình thanh toán'
      });
    }
    
    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Lấy chi tiết cấu hình thanh toán
// @route   GET /api/payment-config/:id
// @access  Private/Admin
const getPaymentConfigById = async (req, res) => {
  try {
    const config = await PaymentConfig.findById(req.params.id);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy cấu hình'
      });
    }
    
    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Tạo cấu hình thanh toán mới
// @route   POST /api/payment-config
// @access  Private/Admin
const createPaymentConfig = async (req, res) => {
  try {
    const { bankCode, bankName, accountNumber, accountName, branch, isPrimary, qrMethod, notes } = req.body;
    
    const config = await PaymentConfig.create({
      bankCode,
      bankName,
      accountNumber,
      accountName,
      branch,
      isPrimary: isPrimary || false,
      qrMethod,
      notes
    });
    
    res.status(201).json({
      success: true,
      data: config
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cập nhật cấu hình thanh toán
// @route   PUT /api/payment-config/:id
// @access  Private/Admin
const updatePaymentConfig = async (req, res) => {
  try {
    const config = await PaymentConfig.findById(req.params.id);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy cấu hình'
      });
    }
    
    const { bankCode, bankName, accountNumber, accountName, branch, isPrimary, isActive, qrMethod, notes } = req.body;
    
    if (bankCode !== undefined) config.bankCode = bankCode;
    if (bankName !== undefined) config.bankName = bankName;
    if (accountNumber !== undefined) config.accountNumber = accountNumber;
    if (accountName !== undefined) config.accountName = accountName;
    if (branch !== undefined) config.branch = branch;
    if (isPrimary !== undefined) config.isPrimary = isPrimary;
    if (isActive !== undefined) config.isActive = isActive;
    if (qrMethod !== undefined) config.qrMethod = qrMethod;
    if (notes !== undefined) config.notes = notes;
    
    await config.save();
    
    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Xóa cấu hình thanh toán
// @route   DELETE /api/payment-config/:id
// @access  Private/Admin
const deletePaymentConfig = async (req, res) => {
  try {
    const config = await PaymentConfig.findById(req.params.id);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy cấu hình'
      });
    }
    
    // Không cho xóa tài khoản primary cuối cùng
    if (config.isPrimary) {
      const otherConfigs = await PaymentConfig.countDocuments({ _id: { $ne: config._id } });
      if (otherConfigs === 0) {
        return res.status(400).json({
          success: false,
          message: 'Không thể xóa cấu hình thanh toán duy nhất'
        });
      }
    }
    
    await config.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Đã xóa cấu hình thanh toán'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Đặt cấu hình làm primary
// @route   PUT /api/payment-config/:id/set-primary
// @access  Private/Admin
const setPrimaryConfig = async (req, res) => {
  try {
    const config = await PaymentConfig.findById(req.params.id);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy cấu hình'
      });
    }
    
    config.isPrimary = true;
    config.isActive = true;
    await config.save();
    
    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllPaymentConfigs,
  getPrimaryPaymentConfig,
  getPaymentConfigById,
  createPaymentConfig,
  updatePaymentConfig,
  deletePaymentConfig,
  setPrimaryConfig
};
