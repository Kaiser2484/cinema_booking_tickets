const mongoose = require('mongoose');

const cinemaSchema = new mongoose. Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên rạp'],
      trim: true
    },
    address: {
      type: String,
      required:  [true, 'Vui lòng nhập địa chỉ']
    },
    city: {
      type: String,
      required: [true, 'Vui lòng nhập thành phố'],
      enum: [
        'Hà Nội',
        'Hồ Chí Minh',
        'Đà Nẵng',
        'Hải Phòng',
        'Cần Thơ',
        'Biên Hòa',
        'Nha Trang',
        'Huế',
        'Vũng Tàu',
        'Khác'
      ]
    },
    phone: {
      type: String,
      default: ''
    },
    image: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    facilities: [{
      type: String,
      enum: ['Bãi đỗ xe', 'Phòng chờ VIP', 'Đồ ăn', 'IMAX', '4DX', 'Dolby Atmos']
    }],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject:  { virtuals: true }
  }
);

// Virtual populate - lấy danh sách phòng của rạp
cinemaSchema.virtual('rooms', {
  ref:  'Room',
  localField: '_id',
  foreignField: 'cinema',
  justOne: false
});

module.exports = mongoose. model('Cinema', cinemaSchema);