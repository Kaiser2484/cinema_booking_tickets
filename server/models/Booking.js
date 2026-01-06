const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema. Types.ObjectId,
      ref: 'User',
      required: [true, 'Vui lòng đăng nhập để đặt vé']
    },
    showtime: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Showtime',
      required:  [true, 'Vui lòng chọn suất chiếu']
    },
    seats: [{
      seatNumber: {
        type: String,
        required: true  // Ví dụ:  'A1', 'B5'
      },
      seatType: {
        type: String,
        enum: ['standard', 'vip', 'couple'],
        default: 'standard'
      },
      price: {
        type: Number,
        required: true
      }
    }],
    totalSeats: {
      type: Number,
      required: true
    },
    totalPrice: {
      type: Number,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'momo', 'vnpay', 'credit_card'],
      default: 'cash'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    bookingStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending'
    },
    bookingCode: {
      type: String,
      unique: true
    },
    qrCode: {
      type: String,
      default: ''
    }
  },
  {
    timestamps:  true
  }
);

// Tạo mã booking tự động
bookingSchema.pre('save', function(next) {
  if (!this.bookingCode) {
    const date = new Date();
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.bookingCode = `CB${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}${randomNum}`;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);