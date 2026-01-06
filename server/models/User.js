const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose. Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Vui lòng nhập email'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ']
    },
    password: {
      type: String,
      required: [true, 'Vui lòng nhập mật khẩu'],
      minlength:  [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
      select: false
    },
    phone: {
      type: String,
      default: ''
    },
    avatar: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    }
  },
  {
    timestamps:  true
  }
);

// Mã hóa password trước khi lưu
userSchema. pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// So sánh password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose. model('User', userSchema);