const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');

// @desc    Tạo booking mới
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  try {
    const { showtime, seats } = req.body;

    // Kiểm tra suất chiếu
    const showtimeData = await Showtime.findById(showtime)
      .populate('room', 'vipRows coupleRows');

    if (!showtimeData) {
      return res. status(404).json({
        success:  false,
        message: 'Không tìm thấy suất chiếu'
      });
    }

    // Kiểm tra ghế đã được đặt chưa
    const seatNumbers = seats.map(s => s.seatNumber);
    const alreadyBooked = showtimeData.bookedSeats.filter(
      seat => seatNumbers.includes(seat)
    );

    if (alreadyBooked. length > 0) {
      return res.status(400).json({
        success: false,
        message: `Ghế ${alreadyBooked. join(', ')} đã được đặt`
      });
    }

    // Tính giá cho từng ghế
    const seatsWithPrice = seats.map(seat => {
      const row = seat.seatNumber.charAt(0);
      let seatType = 'standard';
      let price = showtimeData.price. standard;

      if (showtimeData.room.vipRows. includes(row)) {
        seatType = 'vip';
        price = showtimeData. price.vip;
      } else if (showtimeData.room.coupleRows.includes(row)) {
        seatType = 'couple';
        price = showtimeData.price.couple;
      }

      return {
        seatNumber: seat. seatNumber,
        seatType,
        price
      };
    });

    // Tính tổng tiền
    const totalPrice = seatsWithPrice.reduce((sum, seat) => sum + seat.price, 0);

    // Tạo booking
    const booking = await Booking.create({
      user: req.user._id,
      showtime,
      seats: seatsWithPrice,
      totalSeats: seats.length,
      totalPrice,
      paymentMethod: req. body.paymentMethod || 'cash'
    });

    // Cập nhật ghế đã đặt trong suất chiếu
    await Showtime.findByIdAndUpdate(showtime, {
      $push: { bookedSeats:  { $each: seatNumbers } }
    });

    // Populate thông tin cho response
    const populatedBooking = await Booking.findById(booking._id)
      .populate({
        path: 'showtime',
        populate: [
          { path: 'movie', select: 'title poster' },
          { path: 'cinema', select: 'name address' },
          { path: 'room', select: 'name' }
        ]
      });

    res.status(201).json({
      success: true,
      data:  populatedBooking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:  error.message
    });
  }
};

// @desc    Lấy booking của user hiện tại
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req. user._id })
      .populate({
        path: 'showtime',
        populate: [
          { path: 'movie', select: 'title poster duration' },
          { path: 'cinema', select: 'name address city' },
          { path: 'room', select:  'name' }
        ]
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data:  bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error. message
    });
  }
};

// @desc    Lấy chi tiết booking
// @route   GET /api/bookings/: id
// @access  Private
const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path:  'showtime',
        populate: [
          { path: 'movie', select: 'title poster duration rated' },
          { path: 'cinema', select: 'name address city phone' },
          { path: 'room', select: 'name type' }
        ]
      })
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy booking'
      });
    }

    // Kiểm tra quyền xem (chỉ user sở hữu hoặc admin)
    if (booking. user._id. toString() !== req.user._id.toString() && 
        req. user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message:  'Bạn không có quyền xem booking này'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:  error.message
    });
  }
};

// @desc    Lấy tất cả bookings (Admin)
// @route   GET /api/bookings
// @access  Private/Admin
const getAllBookings = async (req, res) => {
  try {
    const { status, date } = req.query;
    let query = {};

    if (status) {
      query.bookingStatus = status;
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay. setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay. setHours(23, 59, 59, 999);
      
      query.createdAt = {
        $gte:  startOfDay,
        $lte:  endOfDay
      };
    }

    const bookings = await Booking.find(query)
      .populate({
        path: 'showtime',
        populate: [
          { path: 'movie', select: 'title' },
          { path: 'cinema', select: 'name' },
          { path: 'room', select: 'name' }
        ]
      })
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:  error.message
    });
  }
};

// @desc    Cập nhật trạng thái booking
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
const updateBookingStatus = async (req, res) => {
  try {
    const { bookingStatus, paymentStatus } = req.body;

    const booking = await Booking. findById(req. params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy booking'
      });
    }

    if (bookingStatus) {
      booking. bookingStatus = bookingStatus;
    }

    if (paymentStatus) {
      booking.paymentStatus = paymentStatus;
    }

    await booking. save();

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Hủy booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy booking'
      });
    }

    // Kiểm tra quyền hủy
    if (booking.user. toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res. status(403).json({
        success:  false,
        message: 'Bạn không có quyền hủy booking này'
      });
    }

    // Kiểm tra có thể hủy không
    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking đã được hủy trước đó'
      });
    }

    if (booking.bookingStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Không thể hủy booking đã hoàn thành'
      });
    }

    // Cập nhật trạng thái
    booking.bookingStatus = 'cancelled';
    await booking.save();

    // Trả lại ghế
    const seatNumbers = booking. seats.map(s => s.seatNumber);
    await Showtime.findByIdAndUpdate(booking.showtime, {
      $pull: { bookedSeats: { $in: seatNumbers } }
    });

    res.status(200).json({
      success: true,
      message: 'Hủy booking thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:  error.message
    });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBooking,
  getAllBookings,
  updateBookingStatus,
  cancelBooking
};