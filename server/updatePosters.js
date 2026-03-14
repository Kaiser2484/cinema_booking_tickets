// Script cập nhật poster cho các phim đã seed
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Movie = require('./models/Movie');

dotenv.config();

// Poster URLs từ TMDB image service (ảnh miễn phí, ổn định)
const posterUpdates = [
  {
    title: 'Avengers: Kỷ Nguyên Mới',
    poster: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
    trailer: 'https://www.youtube.com/watch?v=TcMBFSGVi1c'
  },
  {
    title: 'Lật Mặt 8: Mặt Trời Đen',
    poster: 'https://image.tmdb.org/t/p/w500/yFHHfHcUgGAxziP1C3lLt0q2T4s.jpg',
    trailer: 'https://www.youtube.com/watch?v=example2'
  },
  {
    title: 'Doraemon: Cuộc Phiêu Lưu Tới Hành Tinh Xa',
    poster: 'https://image.tmdb.org/t/p/w500/kXMEV39qYGPFGuDpGRqnLIoNqIS.jpg',
    trailer: 'https://www.youtube.com/watch?v=example3'
  },
  {
    title: 'Quỷ Nhập Tràng',
    poster: 'https://image.tmdb.org/t/p/w500/9GBhzXMFjgcZ3FdR9YQRAufi3Li.jpg',
    trailer: 'https://www.youtube.com/watch?v=example4'
  },
  {
    title: 'Tình Yêu Không Hẹn Trước',
    poster: 'https://image.tmdb.org/t/p/w500/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg',
    trailer: 'https://www.youtube.com/watch?v=example5'
  },
  {
    title: 'Fast & Furious 12',
    poster: 'https://image.tmdb.org/t/p/w500/1E5baAaEse26fej7uHcjOgEERB2.jpg',
    trailer: 'https://www.youtube.com/watch?v=example6'
  },
  {
    title: 'Hai Muời - Phần 2',
    poster: 'https://image.tmdb.org/t/p/w500/wuMc08IPKEatf9rnMNXvIDxqP4W.jpg',
    trailer: 'https://www.youtube.com/watch?v=example7'
  },
  {
    title: 'Kungfu Panda 5',
    poster: 'https://image.tmdb.org/t/p/w500/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg',
    trailer: 'https://www.youtube.com/watch?v=example8'
  },
  {
    title: 'Mai 2: Hạnh Phúc',
    poster: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    trailer: 'https://www.youtube.com/watch?v=example9'
  },
  {
    title: 'Biệt Đội Siêu Cường',
    poster: 'https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDhRDpZFHSZwkry.jpg',
    trailer: 'https://www.youtube.com/watch?v=example10'
  }
];

const updatePosters = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Đã kết nối MongoDB\n');

    console.log('🖼️  Đang cập nhật poster phim...\n');

    for (const update of posterUpdates) {
      const movie = await Movie.findOne({ title: update.title });
      if (movie) {
        movie.poster = update.poster;
        if (update.trailer) movie.trailer = update.trailer;
        await movie.save();
        console.log(`   ✅ ${update.title}`);
      } else {
        console.log(`   ❌ Không tìm thấy: ${update.title}`);
      }
    }

    console.log('\n🎉 Cập nhật poster hoàn tất!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
};

updatePosters();
