const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên phòng'],
      trim: true
    },
    cinema: {
      type: mongoose.Schema.Types. ObjectId,
      ref: 'Cinema',
      required:  [true, 'Vui lòng chọn rạp']
    },
    type:  {
      type:  String,
      enum: ['2D', '3D', 'IMAX', '4DX', 'Dolby Atmos'],
      default: '2D'
    },
    rows: {
      type: Number,
      required:  [true, 'Vui lòng nhập số hàng ghế'],
      min: [1, 'Số hàng phải lớn hơn 0'],
      max: [26, 'Số hàng tối đa là 26 (A-Z)']
    },
    seatsPerRow: {
      type: Number,
      required: [true, 'Vui lòng nhập số ghế mỗi hàng'],
      min: [1, 'Số ghế mỗi hàng phải lớn hơn 0'],
      max: [30, 'Số ghế mỗi hàng tối đa là 30']
    },
    totalSeats: {
      type: Number,
      default: 0
    },
    vipRows: [{
      type: String
    }],
    coupleRows: [{
      type: String
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

module.exports = mongoose.model('Room', roomSchema);