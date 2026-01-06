const Showtime = require('../models/Showtime');
const Movie = require('../models/Movie');
const Room = require('../models/Room');

// @desc    Lấy tất cả suất chiếu
// @route   GET /api/showtimes
// @access  Public
const getShowtimes = async (req, res) => {
  try {
    const { movie, cinema, date } = req.query;
    let query = { isActive: true };

    if (movie) {
      query.movie = movie;
    }

    if (cinema) {
      query. cinema = cinema;
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay. setHours(23, 59, 59, 999);
      
      query.startTime = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }

    const showtimes = await Showtime.find(query)
      .populate('movie', 'title poster duration rated')
      .populate('cinema', 'name address city')
      .populate('room', 'name type')
      .sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      count: showtimes. length,
      data: showtimes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Lấy suất chiếu theo phim
// @route   GET /api/showtimes/movie/: movieId
// @access  Public
const getShowtimesByMovie = async (req, res) => {
  try {
    const { date } = req.query;
    let query = { 
      movie: req.params. movieId,
      isActive: true 
    };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      query.startTime = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    } else {
      // Mặc định lấy từ hôm nay trở đi
      query. startTime = { $gte: new Date() };
    }

    const showtimes = await Showtime.find(query)
      .populate('cinema', 'name address city')
      .populate('room', 'name type')
      .sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      count:  showtimes.length,
      data:  showtimes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Lấy chi tiết suất chiếu (bao gồm ghế đã đặt)
// @route   GET /api/showtimes/: id
// @access  Public
const getShowtime = async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id)
      .populate('movie', 'title poster duration rated description')
      .populate('cinema', 'name address city phone')
      .populate('room', 'name type rows seatsPerRow vipRows coupleRows totalSeats');

    if (!showtime) {
      return res. status(404).json({
        success:  false,
        message: 'Không tìm thấy suất chiếu'
      });
    }

    res.status(200).json({
      success: true,
      data:  showtime
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error. message
    });
  }
};

// @desc    Tạo suất chiếu mới
// @route   POST /api/showtimes
// @access  Private/Admin
const createShowtime = async (req, res) => {
  try {
    const { movie, room, startTime } = req.body;

    // Lấy thông tin phim để tính endTime
    const movieData = await Movie.findById(movie);
    if (!movieData) {
      return res. status(404).json({
        success:  false,
        message: 'Không tìm thấy phim'
      });
    }

    // Lấy thông tin phòng để lấy cinema
    const roomData = await Room. findById(room);
    if (!roomData) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng chiếu'
      });
    }

    // Tính endTime = startTime + duration + 15 phút (dọn dẹp)
    const start = new Date(startTime);
    const end = new Date(start.getTime() + (movieData.duration + 15) * 60000);

    // Kiểm tra xung đột lịch chiếu
    const conflict = await Showtime.findOne({
      room: room,
      $or: [
        {
          startTime:  { $lt: end },
          endTime: { $gt:  start }
        }
      ]
    });

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: 'Phòng chiếu đã có suất chiếu trong khung giờ này'
      });
    }

    const showtime = await Showtime.create({
      ... req.body,
      cinema: roomData.cinema,
      endTime: end
    });

    res.status(201).json({
      success:  true,
      data: showtime
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:  error.message
    });
  }
};

// @desc    Cập nhật suất chiếu
// @route   PUT /api/showtimes/:id
// @access  Private/Admin
const updateShowtime = async (req, res) => {
  try {
    const showtime = await Showtime.findByIdAndUpdate(
      req.params. id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy suất chiếu'
      });
    }

    res.status(200).json({
      success: true,
      data:  showtime
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error. message
    });
  }
};

// @desc    Xóa suất chiếu
// @route   DELETE /api/showtimes/: id
// @access  Private/Admin
const deleteShowtime = async (req, res) => {
  try {
    const showtime = await Showtime.findByIdAndDelete(req.params.id);

    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy suất chiếu'
      });
    }

    res. status(200).json({
      success:  true,
      message: 'Xóa suất chiếu thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getShowtimes,
  getShowtimesByMovie,
  getShowtime,
  createShowtime,
  updateShowtime,
  deleteShowtime
};