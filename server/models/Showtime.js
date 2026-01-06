const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema. Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Vui lòng chọn phim']
    },
    cinema: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Cinema',
      required: [true, 'Vui lòng chọn rạp']
    },
    room: {
      type: mongoose.Schema. Types.ObjectId,
      ref: 'Room',
      required: [true, 'Vui lòng chọn phòng chiếu']
    },
    startTime: {
      type: Date,
      required: [true, 'Vui lòng nhập giờ bắt đầu']
    },
    endTime: {
      type: Date,
      required: [true, 'Vui lòng nhập giờ kết thúc']
    },
    price: {
      standard: {
        type: Number,
        required: [true, 'Vui lòng nhập giá vé thường'],
        default: 75000
      },
      vip: {
        type: Number,
        default: 95000
      },
      couple: {
        type: Number,
        default: 160000
      }
    },
    bookedSeats: [{
      type: String  // Ví dụ: ['A1', 'A2', 'B5']
    }],
    isActive: {
      type: Boolean,
      default:  true
    }
  },
  {
    timestamps: true
  }
);

// Index để tìm kiếm nhanh
showtimeSchema.index({ movie: 1, cinema: 1, startTime: 1 });

module.exports = mongoose.model('Showtime', showtimeSchema);