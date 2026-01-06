const mongoose = require('mongoose');

const movieSchema = new mongoose. Schema(
  {
    title: {
      type: String,
      required: [true, 'Vui lòng nhập tên phim'],
      trim:  true
    },
    description: {
      type: String,
      required: [true, 'Vui lòng nhập mô tả phim']
    },
    poster: {
      type: String,
      default: ''
    },
    trailer: {
      type: String,
      default: ''
    },
    duration: {
      type: Number, // Thời lượng (phút)
      required: [true, 'Vui lòng nhập thời lượng phim']
    },
    releaseDate: {
      type: Date,
      required: [true, 'Vui lòng nhập ngày khởi chiếu']
    },
    endDate: {
      type: Date
    },
    genres: [{
      type: String,
      enum:  [
        'Hành động',
        'Kinh dị',
        'Hài hước',
        'Tình cảm',
        'Hoạt hình',
        'Khoa học viễn tưởng',
        'Phiêu lưu',
        'Tâm lý',
        'Tài liệu',
        'Âm nhạc'
      ]
    }],
    director: {
      type: String,
      default: ''
    },
    actors: [{
      type: String
    }],
    language: {
      type: String,
      default: 'Tiếng Việt'
    },
    rated: {
      type: String,
      enum: ['P', 'C13', 'C16', 'C18'],
      default: 'P'
      // P: Phổ biến, C13: 13+, C16: 16+, C18: 18+
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 10
    },
    totalRatings: {
      type: Number,
      default:  0
    },
    status: {
      type: String,
      enum:  ['coming_soon', 'now_showing', 'ended'],
      default: 'coming_soon'
    },
    isFeatured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps:  true
  }
);

module.exports = mongoose.model('Movie', movieSchema);