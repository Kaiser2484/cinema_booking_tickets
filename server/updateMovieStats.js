// Script để cập nhật thông tin totalBookings và totalRevenue cho các phim
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Movie = require('./models/Movie');

// Load env vars
dotenv.config();

const updateMovieStats = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Đã kết nối MongoDB');

    // Lấy tất cả phim
    const movies = await Movie.find({});
    console.log(`📊 Tìm thấy ${movies.length} phim`);

    // Dữ liệu phong phú cho từng phim
    const movieStats = {
      // Phim đang chiếu - phổ biến
      'Đào, Phở và Piano': {
        totalBookings: 15847,
        totalRevenue: 1268500000
      },
      'Mai': {
        totalBookings: 23541,
        totalRevenue: 1883280000
      },
      'Godzilla x Kong: The New Empire': {
        totalBookings: 18920,
        totalRevenue: 1513600000
      },
      'Kung Fu Panda 4': {
        totalBookings: 12456,
        totalRevenue: 996480000
      },
      'Dune: Part Two': {
        totalBookings: 21234,
        totalRevenue: 1698720000
      },
      'Ghostbusters: Frozen Empire': {
        totalBookings: 9876,
        totalRevenue: 790080000
      },
      'Road House': {
        totalBookings: 7654,
        totalRevenue: 612320000
      },
      'Imaginary': {
        totalBookings: 11234,
        totalRevenue: 898720000
      },

      // Phim sắp chiếu - ít booking hơn
      'Deadpool & Wolverine': {
        totalBookings: 3245,
        totalRevenue: 259600000
      },
      'Inside Out 2': {
        totalBookings: 2876,
        totalRevenue: 230080000
      },
      'A Quiet Place: Day One': {
        totalBookings: 1987,
        totalRevenue: 158960000
      },
      'Despicable Me 4': {
        totalBookings: 4123,
        totalRevenue: 329840000
      },
      'Twisters': {
        totalBookings: 1654,
        totalRevenue: 132320000
      },
      'Alien: Romulus': {
        totalBookings: 2341,
        totalRevenue: 187280000
      },
      'Beetlejuice Beetlejuice': {
        totalBookings: 1876,
        totalRevenue: 150080000
      },
      'Joker: Folie à Deux': {
        totalBookings: 5432,
        totalRevenue: 434560000
      }
    };

    let updated = 0;
    for (const movie of movies) {
      const stats = movieStats[movie.title];
      
      // Phim sắp chiếu không có doanh thu
      if (movie.status === 'coming_soon') {
        movie.totalBookings = 0;
        movie.totalRevenue = 0;
        await movie.save();
        console.log(`✅ Cập nhật phim "${movie.title}" (Sắp chiếu): 0 vé - 0 VNĐ`);
        updated++;
      } else if (stats) {
        // Phim đang chiếu/đã kết thúc có trong danh sách
        movie.totalBookings = stats.totalBookings;
        movie.totalRevenue = stats.totalRevenue;
        await movie.save();
        console.log(`✅ Cập nhật phim "${movie.title}": ${stats.totalBookings.toLocaleString('vi-VN')} vé - ${stats.totalRevenue.toLocaleString('vi-VN')} VNĐ`);
        updated++;
      } else {
        // Phim không có trong danh sách, tạo dữ liệu ngẫu nhiên cho phim đang chiếu
        const randomBookings = Math.floor(Math.random() * 5000) + 500;
        const avgPrice = 80000;
        movie.totalBookings = randomBookings;
        movie.totalRevenue = randomBookings * avgPrice;
        await movie.save();
        console.log(`✅ Cập nhật phim "${movie.title}": ${randomBookings.toLocaleString('vi-VN')} vé - ${(randomBookings * avgPrice).toLocaleString('vi-VN')} VNĐ`);
        updated++;
      }
    }

    console.log(`\n🎉 Hoàn thành! Đã cập nhật ${updated}/${movies.length} phim`);
    
    // Hiển thị top 5 phim có doanh thu cao nhất
    const topMovies = await Movie.find({}).sort({ totalRevenue: -1 }).limit(5);
    console.log('\n🏆 Top 5 phim có doanh thu cao nhất:');
    topMovies.forEach((movie, index) => {
      console.log(`${index + 1}. ${movie.title}: ${movie.totalBookings.toLocaleString('vi-VN')} vé - ${movie.totalRevenue.toLocaleString('vi-VN')} VNĐ`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
};

updateMovieStats();
