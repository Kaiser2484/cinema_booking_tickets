// Script seed toàn bộ dữ liệu mẫu cho hệ thống đặt vé xem phim
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

const Genre = require('./models/Genre');
const Cinema = require('./models/Cinema');
const Room = require('./models/Room');
const Movie = require('./models/Movie');
const Showtime = require('./models/Showtime');
const User = require('./models/User');
const PaymentConfig = require('./models/PaymentConfig');

dotenv.config();

// ==================== DỮ LIỆU MẪU ====================

const genres = [
  { name: 'Hành động', description: 'Phim hành động với nhiều cảnh chiến đấu và mạo hiểm' },
  { name: 'Phiêu lưu', description: 'Phim về những cuộc phiêu lưu khám phá' },
  { name: 'Hoạt hình', description: 'Phim hoạt hình dành cho mọi lứa tuổi' },
  { name: 'Hài', description: 'Phim hài hước, giải trí' },
  { name: 'Tội phạm', description: 'Phim về tội phạm và điều tra' },
  { name: 'Tài liệu', description: 'Phim tài liệu về sự kiện thực tế' },
  { name: 'Chính kịch', description: 'Phim kịch tính với cốt truyện sâu sắc' },
  { name: 'Gia đình', description: 'Phim dành cho cả gia đình' },
  { name: 'Giả tưởng', description: 'Phim về thế giới tưởng tượng' },
  { name: 'Kinh dị', description: 'Phim kinh dị, rùng rợn' },
  { name: 'Lãng mạn', description: 'Phim tình cảm lãng mạn' },
  { name: 'Khoa học viễn tưởng', description: 'Phim về khoa học và công nghệ tương lai' },
  { name: 'Bí ẩn', description: 'Phim về những bí ẩn cần giải đáp' },
  { name: 'Chiến tranh', description: 'Phim về chiến tranh và lịch sử' },
  { name: 'Tâm lý', description: 'Phim tâm lý, phân tích nhân vật sâu sắc' },
  { name: 'Âm nhạc', description: 'Phim về âm nhạc và nghệ sĩ' },
  { name: 'Thể thao', description: 'Phim về thể thao và vận động viên' },
  { name: 'Võ thuật', description: 'Phim võ thuật châu Á' },
  { name: 'Siêu anh hùng', description: 'Phim về các siêu anh hùng' },
  { name: 'Anime', description: 'Phim hoạt hình Nhật Bản' }
];

const cinemas = [
  {
    name: 'CineBook Quốc Thanh',
    address: '271 Nguyễn Trãi, Quận 1',
    city: 'Hồ Chí Minh',
    phone: '028 3920 1234',
    description: 'Rạp chiếu phim hiện đại tại trung tâm Quận 1 với hệ thống âm thanh Dolby Atmos',
    facilities: ['Bãi đỗ xe', 'Đồ ăn', 'Dolby Atmos'],
    isActive: true
  },
  {
    name: 'CineBook Hai Bà Trưng',
    address: '135 Hai Bà Trưng, Quận 1',
    city: 'Hồ Chí Minh',
    phone: '028 3822 5678',
    description: 'Rạp chiếu phim chất lượng cao với phòng IMAX và 4DX',
    facilities: ['Bãi đỗ xe', 'Phòng chờ VIP', 'Đồ ăn', 'IMAX', '4DX'],
    isActive: true
  },
  {
    name: 'CineBook Hà Nội',
    address: '29 Láng Hạ, Ba Đình',
    city: 'Hà Nội',
    phone: '024 3776 9012',
    description: 'Rạp chiếu phim hiện đại tại trung tâm Hà Nội',
    facilities: ['Bãi đỗ xe', 'Đồ ăn', 'IMAX'],
    isActive: true
  },
  {
    name: 'CineBook Đà Nẵng',
    address: '112 Đường 2/9, Hải Châu',
    city: 'Đà Nẵng',
    phone: '0236 382 3456',
    description: 'Rạp chiếu phim lớn nhất Đà Nẵng',
    facilities: ['Bãi đỗ xe', 'Đồ ăn', 'Dolby Atmos', 'Phòng chờ VIP'],
    isActive: true
  },
  {
    name: 'CineBook Cần Thơ',
    address: '50 Đại lộ Hòa Bình, Ninh Kiều',
    city: 'Cần Thơ',
    phone: '0292 381 7890',
    description: 'Rạp chiếu phim hiện đại tại Cần Thơ',
    facilities: ['Bãi đỗ xe', 'Đồ ăn'],
    isActive: true
  }
];

// Mỗi rạp sẽ có các phòng chiếu này
const roomTemplates = [
  { name: 'Phòng 1', type: '2D', rows: 10, seatsPerRow: 12, vipRows: ['E', 'F', 'G', 'H'], coupleRows: ['J'] },
  { name: 'Phòng 2', type: '2D', rows: 8, seatsPerRow: 10, vipRows: ['D', 'E', 'F'], coupleRows: ['H'] },
  { name: 'Phòng 3', type: '3D', rows: 10, seatsPerRow: 14, vipRows: ['E', 'F', 'G', 'H'], coupleRows: ['J'] },
  { name: 'Phòng 4', type: 'IMAX', rows: 12, seatsPerRow: 16, vipRows: ['F', 'G', 'H', 'I'], coupleRows: ['L'] },
];

const movies = [
  {
    title: 'Avengers: Kỷ Nguyên Mới',
    description: 'Các siêu anh hùng Avengers tập hợp lần nữa để đối đầu với mối đe dọa mới từ vũ trụ. Khi một thế lực bóng tối cổ xưa thức tỉnh, các anh hùng phải vượt qua mọi giới hạn để bảo vệ Trái Đất.',
    duration: 150,
    releaseDate: new Date('2026-02-15'),
    endDate: new Date('2026-04-15'),
    genres: ['Hành động', 'Khoa học viễn tưởng', 'Phiêu lưu'],
    director: 'Anthony Russo',
    actors: ['Robert Downey Jr.', 'Chris Evans', 'Scarlett Johansson'],
    language: 'Tiếng Anh - Phụ đề Việt',
    rated: 'C13',
    rating: 8.5,
    status: 'now_showing',
    isFeatured: true
  },
  {
    title: 'Lật Mặt 8: Mặt Trời Đen',
    description: 'Phần tiếp theo của loạt phim Lật Mặt đình đám. Câu chuyện xoay quanh một âm mưu kinh hoàng liên quan đến tổ chức tội phạm xuyên quốc gia.',
    duration: 130,
    releaseDate: new Date('2026-02-28'),
    endDate: new Date('2026-04-28'),
    genres: ['Hành động', 'Tâm lý'],
    director: 'Lý Hải',
    actors: ['Trấn Thành', 'Kiều Minh Tuấn', 'Huy Khánh'],
    language: 'Tiếng Việt',
    rated: 'C16',
    rating: 7.8,
    status: 'now_showing',
    isFeatured: true
  },
  {
    title: 'Doraemon: Cuộc Phiêu Lưu Tới Hành Tinh Xa',
    description: 'Nobita và các bạn cùng Doraemon bắt đầu hành trình khám phá hành tinh bí ẩn nơi có nền văn minh cổ đại.',
    duration: 105,
    releaseDate: new Date('2026-03-01'),
    endDate: new Date('2026-05-01'),
    genres: ['Hoạt hình', 'Phiêu lưu'],
    director: 'Shinnosuke Yakuwa',
    actors: ['Wasabi Mizuta', 'Megumi Ohara'],
    language: 'Tiếng Nhật - Lồng tiếng Việt',
    rated: 'P',
    rating: 8.0,
    status: 'now_showing',
    isFeatured: true
  },
  {
    title: 'Quỷ Nhập Tràng',
    description: 'Một gia đình chuyển đến ngôi nhà cổ ở vùng quê và phát hiện những bí mật kinh hoàng ẩn giấu bên dưới tầng hầm.',
    duration: 110,
    releaseDate: new Date('2026-03-10'),
    endDate: new Date('2026-05-10'),
    genres: ['Kinh dị', 'Tâm lý'],
    director: 'James Wan',
    actors: ['Patrick Wilson', 'Vera Farmiga'],
    language: 'Tiếng Anh - Phụ đề Việt',
    rated: 'C18',
    rating: 7.5,
    status: 'now_showing',
    isFeatured: false
  },
  {
    title: 'Tình Yêu Không Hẹn Trước',
    description: 'Câu chuyện tình yêu lãng mạn giữa một cô gái Việt kiều về nước và chàng kiến trúc sư trẻ tại Đà Lạt.',
    duration: 115,
    releaseDate: new Date('2026-02-14'),
    endDate: new Date('2026-04-14'),
    genres: ['Tình cảm', 'Hài hước'],
    director: 'Victor Vũ',
    actors: ['Ninh Dương Lan Ngọc', 'Chi Dân'],
    language: 'Tiếng Việt',
    rated: 'P',
    rating: 7.2,
    status: 'now_showing',
    isFeatured: false
  },
  {
    title: 'Fast & Furious 12',
    description: 'Dom Toretto và đội của anh đối mặt với kẻ thù nguy hiểm nhất - một hacker thiên tài kiểm soát mọi phương tiện trên thế giới.',
    duration: 140,
    releaseDate: new Date('2026-04-01'),
    endDate: new Date('2026-06-01'),
    genres: ['Hành động', 'Phiêu lưu'],
    director: 'Louis Leterrier',
    actors: ['Vin Diesel', 'Jason Momoa', 'Charlize Theron'],
    language: 'Tiếng Anh - Phụ đề Việt',
    rated: 'C13',
    rating: 0,
    status: 'coming_soon',
    isFeatured: true
  },
  {
    title: 'Hai Muời - Phần 2',
    description: 'Tiếp nối câu chuyện kinh dị Việt Nam, nhóm bạn trẻ quay lại ngôi làng bị nguyền rủa để giải cứu người bạn bị mất tích.',
    duration: 120,
    releaseDate: new Date('2026-04-15'),
    endDate: new Date('2026-06-15'),
    genres: ['Kinh dị'],
    director: 'Trần Hữu Tấn',
    actors: ['Quốc Trường', 'Thúy Diễm'],
    language: 'Tiếng Việt',
    rated: 'C18',
    rating: 0,
    status: 'coming_soon',
    isFeatured: false
  },
  {
    title: 'Kungfu Panda 5',
    description: 'Po tiếp tục hành trình trở thành Rồng Chiến Binh vĩ đại nhất, lần này đối mặt với mối đe dọa từ vương quốc Phượng Hoàng.',
    duration: 95,
    releaseDate: new Date('2026-05-01'),
    endDate: new Date('2026-07-01'),
    genres: ['Hoạt hình', 'Hài hước', 'Phiêu lưu'],
    director: 'Mike Mitchell',
    actors: ['Jack Black', 'Awkwafina'],
    language: 'Tiếng Anh - Lồng tiếng Việt',
    rated: 'P',
    rating: 0,
    status: 'coming_soon',
    isFeatured: true
  },
  {
    title: 'Mai 2: Hạnh Phúc',
    description: 'Phần tiếp theo của bộ phim Mai - câu chuyện về tình yêu, sự tha thứ và tìm kiếm hạnh phúc giữa Sài Gòn nhộn nhịp.',
    duration: 125,
    releaseDate: new Date('2026-01-20'),
    endDate: new Date('2026-03-05'),
    genres: ['Tình cảm', 'Tâm lý'],
    director: 'Trấn Thành',
    actors: ['Phương Anh Đào', 'Tuấn Trần', 'NSƯT Hữu Châu'],
    language: 'Tiếng Việt',
    rated: 'C13',
    rating: 8.2,
    status: 'now_showing',
    isFeatured: true
  },
  {
    title: 'Biệt Đội Siêu Cường',
    description: 'Một nhóm đặc nhiệm bí mật được thành lập để ngăn chặn một tổ chức khủng bố quốc tế âm mưu tấn công mạng lưới năng lượng toàn cầu.',
    duration: 135,
    releaseDate: new Date('2026-03-20'),
    endDate: new Date('2026-05-20'),
    genres: ['Hành động', 'Khoa học viễn tưởng'],
    director: 'Christopher Nolan',
    actors: ['Tom Hardy', 'Florence Pugh', 'Timothée Chalamet'],
    language: 'Tiếng Anh - Phụ đề Việt',
    rated: 'C16',
    rating: 9.0,
    status: 'now_showing',
    isFeatured: true
  }
];

const paymentConfigs = [
  {
    bankCode: 'VCB',
    bankName: 'Vietcombank',
    accountNumber: '1234567890',
    accountName: 'CONG TY CINEBOOK',
    branch: 'Chi nhánh Hồ Chí Minh',
    isActive: true,
    isPrimary: true,
    qrMethod: 'vietqr',
    notes: 'Tài khoản chính để nhận thanh toán'
  },
  {
    bankCode: 'TCB',
    bankName: 'Techcombank',
    accountNumber: '9876543210',
    accountName: 'CONG TY CINEBOOK',
    branch: 'Chi nhánh Hà Nội',
    isActive: true,
    isPrimary: false,
    qrMethod: 'vietqr',
    notes: 'Tài khoản phụ'
  },
  {
    bankCode: 'MB',
    bankName: 'MB Bank',
    accountNumber: '5566778899',
    accountName: 'CONG TY CINEBOOK',
    branch: 'Chi nhánh Đà Nẵng',
    isActive: true,
    isPrimary: false,
    qrMethod: 'vietqr',
    notes: 'Tài khoản MB Bank'
  }
];

// ==================== HÀM SEED ====================

const seedAll = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Đã kết nối MongoDB\n');

    // 1. Seed Genres
    console.log('📁 [1/7] Đang thêm Thể loại phim...');
    let genreCount = 0;
    for (const g of genres) {
      const exists = await Genre.findOne({ name: g.name });
      if (!exists) {
        await Genre.create(g);
        genreCount++;
      }
    }
    console.log(`   ✅ Đã thêm ${genreCount} thể loại (bỏ qua ${genres.length - genreCount} đã có)\n`);

    // 2. Seed Admin User
    console.log('👤 [2/7] Đang tạo tài khoản Admin...');
    let adminUser = await User.findOne({ email: 'admin@gmail.com' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Admin CineBook',
        email: 'admin@gmail.com',
        password: 'admin123',
        phone: '0901234567',
        role: 'admin'
      });
      console.log('   ✅ Đã tạo tài khoản Admin');
      console.log('   📧 Email: admin@gmail.com');
      console.log('   🔑 Password: admin123\n');
    } else {
      console.log('   ⏭️  Admin đã tồn tại\n');
    }

    // 3. Seed User mẫu
    console.log('👤 [3/7] Đang tạo tài khoản User mẫu...');
    let normalUser = await User.findOne({ email: 'user@gmail.com' });
    if (!normalUser) {
      normalUser = await User.create({
        name: 'Nguyễn Văn A',
        email: 'user@gmail.com',
        password: 'user123',
        phone: '0912345678',
        role: 'user'
      });
      console.log('   ✅ Đã tạo tài khoản User');
      console.log('   📧 Email: user@gmail.com');
      console.log('   🔑 Password: user123\n');
    } else {
      console.log('   ⏭️  User mẫu đã tồn tại\n');
    }

    // 4. Seed Cinemas
    console.log('🏢 [4/7] Đang thêm Rạp chiếu phim...');
    const createdCinemas = [];
    for (const c of cinemas) {
      let cinema = await Cinema.findOne({ name: c.name });
      if (!cinema) {
        cinema = await Cinema.create(c);
        console.log(`   ✅ ${cinema.name}`);
      } else {
        console.log(`   ⏭️  ${c.name} (đã có)`);
      }
      createdCinemas.push(cinema);
    }
    console.log(`   → Tổng: ${createdCinemas.length} rạp\n`);

    // 5. Seed Rooms
    console.log('🎬 [5/7] Đang thêm Phòng chiếu...');
    const createdRooms = [];
    for (const cinema of createdCinemas) {
      for (const template of roomTemplates) {
        let room = await Room.findOne({ name: template.name, cinema: cinema._id });
        if (!room) {
          room = await Room.create({
            ...template,
            cinema: cinema._id
          });
          console.log(`   ✅ ${cinema.name} - ${room.name} (${room.type}, ${room.totalSeats} ghế)`);
        } else {
          console.log(`   ⏭️  ${cinema.name} - ${template.name} (đã có)`);
        }
        createdRooms.push(room);
      }
    }
    console.log(`   → Tổng: ${createdRooms.length} phòng\n`);

    // 6. Seed Movies
    console.log('🎥 [6/7] Đang thêm Phim...');
    const createdMovies = [];
    for (const m of movies) {
      let movie = await Movie.findOne({ title: m.title });
      if (!movie) {
        movie = await Movie.create(m);
        console.log(`   ✅ ${movie.title} (${movie.status})`);
      } else {
        console.log(`   ⏭️  ${m.title} (đã có)`);
      }
      createdMovies.push(movie);
    }
    console.log(`   → Tổng: ${createdMovies.length} phim\n`);

    // 7. Seed Showtimes (chỉ cho phim đang chiếu)
    console.log('🕐 [7/7] Đang thêm Suất chiếu...');
    const nowShowingMovies = createdMovies.filter(m => m.status === 'now_showing');
    let showtimeCount = 0;

    // Tạo suất chiếu cho 3 ngày tới
    for (let dayOffset = 0; dayOffset <= 2; dayOffset++) {
      const date = new Date();
      date.setDate(date.getDate() + dayOffset);

      for (const movie of nowShowingMovies) {
        // Mỗi phim chiếu ở 2 rạp đầu tiên
        for (let cinemaIdx = 0; cinemaIdx < 2 && cinemaIdx < createdCinemas.length; cinemaIdx++) {
          const cinema = createdCinemas[cinemaIdx];
          // Lấy rooms của rạp này
          const cinemaRooms = createdRooms.filter(r => r.cinema.toString() === cinema._id.toString());

          if (cinemaRooms.length === 0) continue;

          // Chọn phòng chiếu (xoay vòng)
          const room = cinemaRooms[showtimeCount % cinemaRooms.length];

          // Tạo 2 suất chiếu mỗi ngày: 14:00 và 19:00
          const times = [
            { hour: 14, minute: 0 },
            { hour: 19, minute: 0 }
          ];

          for (const time of times) {
            const startTime = new Date(date);
            startTime.setHours(time.hour, time.minute, 0, 0);

            const endTime = new Date(startTime);
            endTime.setMinutes(endTime.getMinutes() + movie.duration + 15); // +15 phút nghỉ

            // Kiểm tra trùng lịch
            const existingShowtime = await Showtime.findOne({
              room: room._id,
              startTime: startTime
            });

            if (!existingShowtime) {
              await Showtime.create({
                movie: movie._id,
                cinema: cinema._id,
                room: room._id,
                startTime,
                endTime,
                price: {
                  standard: room.type === 'IMAX' ? 100000 : 75000,
                  vip: room.type === 'IMAX' ? 130000 : 95000,
                  couple: room.type === 'IMAX' ? 220000 : 160000
                },
                bookedSeats: [],
                isActive: true
              });
              showtimeCount++;
            }
          }
        }
      }
    }
    console.log(`   ✅ Đã thêm ${showtimeCount} suất chiếu (3 ngày tới)\n`);

    // 8. Seed Payment Config
    console.log('💳 [Bonus] Đang thêm Cấu hình thanh toán...');
    for (const pc of paymentConfigs) {
      const exists = await PaymentConfig.findOne({ bankCode: pc.bankCode });
      if (!exists) {
        await PaymentConfig.create(pc);
        console.log(`   ✅ ${pc.bankName} - ${pc.accountNumber}`);
      } else {
        console.log(`   ⏭️  ${pc.bankName} (đã có)`);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 SEED HOÀN TẤT! Tổng kết:');
    console.log('='.repeat(50));
    console.log(`   📁 Thể loại:    ${await Genre.countDocuments()} records`);
    console.log(`   👤 Users:       ${await User.countDocuments()} records`);
    console.log(`   🏢 Rạp:         ${await Cinema.countDocuments()} records`);
    console.log(`   🎬 Phòng:       ${await Room.countDocuments()} records`);
    console.log(`   🎥 Phim:        ${await Movie.countDocuments()} records`);
    console.log(`   🕐 Suất chiếu:  ${await Showtime.countDocuments()} records`);
    console.log(`   💳 Thanh toán:   ${await PaymentConfig.countDocuments()} records`);
    console.log('='.repeat(50));
    console.log('\n🔑 Tài khoản Admin: admin@gmail.com / admin123');
    console.log('🔑 Tài khoản User:  user@gmail.com / user123');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    console.error(error);
    process.exit(1);
  }
};

seedAll();
