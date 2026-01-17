const Showtime = require('../models/Showtime');
const Movie = require('../models/Movie');
const Cinema = require('../models/Cinema');
const Room = require('../models/Room');
const Booking = require('../models/Booking');

// @desc    Tự động tạo lịch chiếu
// @route   POST /api/showtimes/auto-schedule
// @access  Private/Admin
const autoScheduleShowtimes = async (req, res) => {
  try {
    const {
      movieIds,           // Danh sách ID phim cần sắp xếp
      cinemaId,           // Rạp chiếu
      startDate,          // Ngày bắt đầu sắp xếp
      endDate,            // Ngày kết thúc sắp xếp
      breakTime = 15      // Thời gian nghỉ giữa 2 phim (phút)
    } = req.body;

    // Rạp hoạt động 24/24
    const workingHours = {
      start: '00:00',
      end: '23:59'
    };

    // Validate
    if (!movieIds || movieIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn ít nhất 1 phim'
      });
    }

    if (!cinemaId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin'
      });
    }

    // Lấy thông tin cinema và rooms
    const cinema = await Cinema.findById(cinemaId);
    if (!cinema) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy rạp chiếu'
      });
    }

    const rooms = await Room.find({ cinema: cinemaId });
    if (rooms.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Rạp chưa có phòng chiếu'
      });
    }

    // Lấy thông tin phim và tính doanh số
    const movies = await Movie.find({ _id: { $in: movieIds } });
    
    // Tính doanh số từ bookings
    const movieRevenue = await Promise.all(
      movies.map(async (movie) => {
        const revenue = await Booking.aggregate([
          {
            $lookup: {
              from: 'showtimes',
              localField: 'showtime',
              foreignField: '_id',
              as: 'showtimeInfo'
            }
          },
          { $unwind: '$showtimeInfo' },
          {
            $match: {
              'showtimeInfo.movie': movie._id,
              paymentStatus: 'completed'
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$totalPrice' },
              bookings: { $sum: 1 }
            }
          }
        ]);

        return {
          movie,
          revenue: revenue[0]?.total || 0,
          bookings: revenue[0]?.bookings || 0,
          createdAt: movie.createdAt
        };
      })
    );

    // Sắp xếp phim theo độ ưu tiên:
    // 1. Phim mới (createdAt gần nhất)
    // 2. Doanh số cao
    // 3. Số lượng booking
    const sortedMovies = movieRevenue.sort((a, b) => {
      // Phim tạo trong 7 ngày gần nhất = mới
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const aIsNew = a.createdAt > sevenDaysAgo;
      const bIsNew = b.createdAt > sevenDaysAgo;

      if (aIsNew && !bIsNew) return -1;
      if (!aIsNew && bIsNew) return 1;

      // Cùng độ "mới", so sánh doanh số
      if (b.revenue !== a.revenue) {
        return b.revenue - a.revenue;
      }

      // Cùng doanh số, so sánh số booking
      return b.bookings - a.bookings;
    });

    // Tính số suất chiếu cho mỗi phim dựa trên độ ưu tiên
    const totalWeight = sortedMovies.reduce((sum, item, index) => {
      return sum + (sortedMovies.length - index);
    }, 0);

    const moviesWithSlots = sortedMovies.map((item, index) => {
      const weight = sortedMovies.length - index;
      const percentage = weight / totalWeight;
      return {
        ...item,
        weight,
        percentage: Math.round(percentage * 100)
      };
    });

    // Tạo lịch chiếu
    const start = new Date(startDate);
    const end = new Date(endDate);
    const createdShowtimes = [];

    // Duyệt qua từng ngày
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      // Duyệt qua từng phòng
      for (const room of rooms) {
        const currentDate = new Date(date);
        const [startHour, startMinute] = workingHours.start.split(':');
        const [endHour, endMinute] = workingHours.end.split(':');

        let currentTime = new Date(currentDate);
        currentTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);

        const endTime = new Date(currentDate);
        endTime.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

        let movieIndex = 0;

        // Lặp tạo suất chiếu trong ngày
        while (currentTime < endTime) {
          const movieData = moviesWithSlots[movieIndex % moviesWithSlots.length];
          const movie = movieData.movie;

          // Tính thời gian kết thúc suất chiếu
          const showtimeEnd = new Date(currentTime);
          showtimeEnd.setMinutes(showtimeEnd.getMinutes() + movie.duration + breakTime);

          // Kiểm tra có vượt quá giờ làm việc không
          if (showtimeEnd > endTime) {
            break;
          }

          // Kiểm tra xem suất chiếu đã tồn tại chưa
          const existingShowtime = await Showtime.findOne({
            room: room._id,
            startTime: currentTime,
            cinema: cinemaId
          });

          if (!existingShowtime) {
            // Tạo suất chiếu mới
            const showtime = await Showtime.create({
              movie: movie._id,
              cinema: cinemaId,
              room: room._id,
              startTime: new Date(currentTime),
              endTime: new Date(showtimeEnd),
              price: {
                standard: 75000,
                vip: 95000,
                couple: 160000
              },
              bookedSeats: []
            });

            createdShowtimes.push(showtime);
          }

          // Di chuyển đến suất chiếu tiếp theo
          currentTime = new Date(showtimeEnd);
          
          // Tăng index phim (phim có weight cao sẽ xuất hiện nhiều hơn)
          // Logic: lặp qua danh sách, nhưng phim đầu xuất hiện nhiều lần hơn
          const random = Math.random() * 100;
          let cumulativePercentage = 0;
          
          for (let i = 0; i < moviesWithSlots.length; i++) {
            cumulativePercentage += moviesWithSlots[i].percentage;
            if (random <= cumulativePercentage) {
              movieIndex = i;
              break;
            }
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Đã tạo ${createdShowtimes.length} suất chiếu tự động`,
      data: {
        totalShowtimes: createdShowtimes.length,
        dateRange: {
          start: startDate,
          end: endDate
        },
        rooms: rooms.length,
        moviePriority: moviesWithSlots.map(m => ({
          title: m.movie.title,
          weight: m.weight,
          percentage: m.percentage,
          revenue: m.revenue,
          bookings: m.bookings
        }))
      },
      showtimes: createdShowtimes
    });

  } catch (error) {
    console.error('Auto schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tự động tạo lịch chiếu',
      error: error.message
    });
  }
};

// @desc    Xóa tất cả lịch chiếu trong khoảng thời gian
// @route   DELETE /api/showtimes/clear-range
// @access  Private/Admin
const clearShowtimesInRange = async (req, res) => {
  try {
    const { cinemaId, startDate, endDate } = req.body;

    if (!cinemaId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const result = await Showtime.deleteMany({
      cinema: cinemaId,
      startTime: {
        $gte: start,
        $lte: end
      }
    });

    res.status(200).json({
      success: true,
      message: `Đã xóa ${result.deletedCount} suất chiếu`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Clear showtimes error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa lịch chiếu'
    });
  }
};

module.exports = {
  autoScheduleShowtimes,
  clearShowtimesInRange
};
