const mongoose = require('mongoose');

const paymentConfigSchema = new mongoose.Schema(
  {
    bankCode: {
      type: String,
      required: [true, 'Vui lòng nhập mã ngân hàng'],
      uppercase: true
    },
    bankName: {
      type: String,
      required: [true, 'Vui lòng nhập tên ngân hàng']
    },
    accountNumber: {
      type: String,
      required: [true, 'Vui lòng nhập số tài khoản']
    },
    accountName: {
      type: String,
      required: [true, 'Vui lòng nhập tên chủ tài khoản'],
      uppercase: true
    },
    branch: {
      type: String,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    qrMethod: {
      type: String,
      enum: ['vietqr', 'manual'],
      default: 'vietqr'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Chỉ cho phép 1 tài khoản primary
paymentConfigSchema.pre('save', async function(next) {
  if (this.isPrimary) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { isPrimary: false }
    );
  }
  next();
});

module.exports = mongoose.model('PaymentConfig', paymentConfigSchema);
