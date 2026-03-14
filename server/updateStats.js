// Script cập nhật thống kê phong phú: doanh thu, lượt đặt vé, rating, booking mẫu
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Movie = require('./models/Movie');
const Booking = require('./models/Booking');
const Showtime = require('./models/Showtime');
const User = require('./models/User');

dotenv.config();

// Dữ liệu thống kê cho từng phim (phim đang chiếu có stats, phim sắp chiếu = 0)
const movieStats = [
  {
    title: 'Avengers: Kỷ Nguyên Mới',
    rating: 8.7,
    totalRatings: 1856,
    totalBookings: 4230,
    totalRevenue: 425000000 // 425 triệu
  },
  {
    title: 'Lật Mặt 8: Mặt Trời Đen',
    rating: 8.1,
    totalRatings: 2340,
    totalBookings: 5120,
    totalRevenue: 512000000 // 512 triệu  
  },
  {
    title: 'Doraemon: Cuộc Phiêu Lưu Tới Hành Tinh Xa',
    rating: 8.3,
    totalRatings: 980,
    totalBookings: 2150,
    totalRevenue: 186000000 // 186 triệu
  },
  {
    title: 'Quỷ Nhập Tràng',
    rating: 7.4,
    totalRatings: 1120,
    totalBookings: 1890,
    totalRevenue: 167000000 // 167 triệu
  },
  {
    title: 'Tình Yêu Không Hẹn Trước',
    rating: 7.6,
    totalRatings: 890,
    totalBookings: 1560,
    totalRevenue: 132000000 // 132 triệu
  },
  {
    title: 'Mai 2: Hạnh Phúc',
    rating: 8.5,
    totalRatings: 3200,
    totalBookings: 6800,
    totalRevenue: 680000000 // 680 triệu (phim ăn khách nhất)
  },
  {
    title: 'Biệt Đội Siêu Cường',
    rating: 9.1,
    totalRatings: 750,
    totalBookings: 1200,
    totalRevenue: 115000000 // 115 triệu (mới chiếu)
  },
  // Phim sắp chiếu - stats = 0
  {
    title: 'Fast & Furious 12',
    rating: 0,
    totalRatings: 0,
    totalBookings: 0,
    totalRevenue: 0
  },
  {
    title: 'Hai Muời - Phần 2',
    rating: 0,
    totalRatings: 0,
    totalBookings: 0,
    totalRevenue: 0
  },
  {
    title: 'Kungfu Panda 5',
    rating: 0,
    totalRatings: 0,
    totalBookings: 0,
    totalRevenue: 0
  }
];

// Tạo booking mẫu cho phim đang chiếu
const generateSampleBookings = async (user, showtimes) => {
  const paymentMethods = ['qr', 'momo', 'vnpay', 'bank'];
  const seatTypes = ['standard', 'vip', 'couple'];
  const prices = { standard: 75000, vip: 95000, couple: 160000 };
  let bookingsCreated = 0;

  for (const showtime of showtimes) {
    // Mỗi suất chiếu tạo 2-5 booking mẫu
    const numBookings = Math.floor(Math.random() * 4) + 2;
    
    for (let i = 0; i < numBookings; i++) {
      // Random ghế
      const numSeats = Math.floor(Math.random() * 3) + 1; // 1-3 ghế
      const seats = [];
      const bookedSeatNumbers = [];
      const row = String.fromCharCode(65 + Math.floor(Math.random() * 8)); // A-H

      for (let s = 0; s < numSeats; s++) {
        const seatNum = Math.floor(Math.random() * 10) + 1;
        const seatNumber = `${row}${seatNum}`;
        
        // Tránh trùng ghế
        if (bookedSeatNumbers.includes(seatNumber)) continue;
        bookedSeatNumbers.push(seatNumber);

        const seatType = seatTypes[Math.floor(Math.random() * 2)]; // standard hoặc vip
        seats.push({
          seatNumber,
          seatType,
          price: prices[seatType]
        });
      }

      if (seats.length === 0) continue;

      const totalPrice = seats.reduce((sum, s) => sum + s.price, 0);
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

      // Random ngày đặt trong 2 tuần gần đây
      const bookingDate = new Date();
      bookingDate.setDate(bookingDate.getDate() - Math.floor(Math.random() * 14));

      try {
        await Booking.create({
          user: user._id,
          showtime: showtime._id,
          seats,
          totalSeats: seats.length,
          totalPrice,
          paymentMethod,
          paymentStatus: 'completed',
          bookingStatus: 'confirmed',
          transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 10000)}`,
          createdAt: bookingDate,
          updatedAt: bookingDate
        });

        // Cập nhật bookedSeats của showtime
        await Showtime.findByIdAndUpdate(showtime._id, {
          $addToSet: { bookedSeats: { $each: bookedSeatNumbers } }
        });

        bookingsCreated++;
      } catch (err) {
        // Bỏ qua lỗi trùng bookingCode
      }
    }
  }
  return bookingsCreated;
};

const updateStats = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Đã kết nối MongoDB\n');

    // 1. Cập nhật stats cho phim
    console.log('📊 [1/2] Đang cập nhật thống kê phim...\n');
    for (const stats of movieStats) {
      const movie = await Movie.findOne({ title: stats.title });
      if (movie) {
        movie.rating = stats.rating;
        movie.totalRatings = stats.totalRatings;
        movie.totalBookings = stats.totalBookings;
        movie.totalRevenue = stats.totalRevenue;
        await movie.save();

        const revenue = stats.totalRevenue > 0 
          ? `${(stats.totalRevenue / 1000000).toFixed(0)} triệu` 
          : '0';
        console.log(`   ✅ ${stats.title}`);
        console.log(`      ⭐ ${stats.rating}/10 (${stats.totalRatings} đánh giá) | 🎫 ${stats.totalBookings} vé | 💰 ${revenue}\n`);
      }
    }

    // 2. Tạo booking mẫu
    console.log('🎫 [2/2] Đang tạo booking mẫu...\n');
    
    const existingBookings = await Booking.countDocuments();
    if (existingBookings > 5) {
      console.log(`   ⏭️  Đã có ${existingBookings} booking, bỏ qua\n`);
    } else {
      const user = await User.findOne({ email: 'user@gmail.com' });
      const admin = await User.findOne({ email: 'admin@gmail.com' });

      if (user) {
        const showtimes = await Showtime.find({ isActive: true }).limit(20);
        const count = await generateSampleBookings(user, showtimes);
        console.log(`   ✅ Đã tạo ${count} booking cho user@gmail.com`);
        
        if (admin) {
          const count2 = await generateSampleBookings(admin, showtimes.slice(0, 5));
          console.log(`   ✅ Đã tạo ${count2} booking cho admin@gmail.com`);
        }
      }
    }

    // 3. Tổng kết
    const totalRevenue = movieStats.reduce((sum, m) => sum + m.totalRevenue, 0);
    const totalBookings = movieStats.reduce((sum, m) => sum + m.totalBookings, 0);

    console.log('\n' + '='.repeat(55));
    console.log('🎉 CẬP NHẬT HOÀN TẤT! Tổng kết hệ thống:');
    console.log('='.repeat(55));
    console.log(`   🎥 Tổng phim:         ${await Movie.countDocuments()}`);
    console.log(`   🎫 Tổng lượt đặt vé:  ${totalBookings.toLocaleString()}`);
    console.log(`   💰 Tổng doanh thu:     ${(totalRevenue / 1000000000).toFixed(2)} tỷ VNĐ`);
    console.log(`   📋 Booking records:    ${await Booking.countDocuments()}`);
    console.log(`   🕐 Suất chiếu:         ${await Showtime.countDocuments()}`);
    console.log('='.repeat(55));

    // Top phim
    console.log('\n🏆 TOP PHIM DOANH THU CAO NHẤT:');
    const topMovies = await Movie.find({ totalRevenue: { $gt: 0 } })
      .sort({ totalRevenue: -1 })
      .limit(5);
    topMovies.forEach((m, i) => {
      console.log(`   ${i + 1}. ${m.title} - ${(m.totalRevenue / 1000000).toFixed(0)} triệu (⭐${m.rating})`);
    });
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    console.error(error);
    process.exit(1);
  }
};

updateStats();
