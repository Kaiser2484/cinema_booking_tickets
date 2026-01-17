const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const Movie = require('../models/Movie');

// Validate transaction ID pattern
const validateTransactionId = (transactionId) => {
  if (!transactionId || typeof transactionId !== 'string') {
    return { valid: false, error: 'Mã giao dịch không hợp lệ' };
  }

  if (!transactionId.startsWith('CINEMA')) {
    return { valid: false, error: 'Mã giao dịch không đúng định dạng' };
  }

  const timestampStr = transactionId.replace('CINEMA', '');
  const timestamp = parseInt(timestampStr);

  if (isNaN(timestamp) || transactionId.length !== 19) {
    return { valid: false, error: 'Mã giao dịch không hợp lệ' };
  }

  // Check trong vòng 15 phút
  const now = Date.now();
  const fifteenMinutes = 15 * 60 * 1000;
  
  if (now - timestamp > fifteenMinutes) {
    return { valid: false, error: 'Mã giao dịch đã hết hạn (quá 15 phút)' };
  }

  return { valid: true };
};

// @desc    Tạo booking mới
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  try {
    const { showtime, seats, paymentMethod = 'cash', transactionId, paymentStatus = 'pending' } = req.body;

    // Validate transaction ID nếu có (cho QR và Bank)
    if ((paymentMethod === 'qr' || paymentMethod === 'bank') && transactionId) {
      const validation = validateTransactionId(transactionId);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.error
        });
      }
    }

    // Kiểm tra suất chiếu
    const showtimeData = await Showtime.findById(showtime)
      .populate('room', 'vipRows coupleRows')
      .populate('movie')
      .populate('cinema');

    if (!showtimeData) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy suất chiếu'
      });
    }

    // Kiểm tra ghế đã được đặt chưa
    const seatNumbers = seats.map(s => s.seatNumber);
    const alreadyBooked = showtimeData.bookedSeats.filter(
      seat => seatNumbers.includes(seat)
    );

    if (alreadyBooked.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Ghế ${alreadyBooked.join(', ')} đã được đặt`
      });
    }

    // Tính giá cho từng ghế
    const seatsWithPrice = seats.map(seat => {
      const row = seat.seatNumber.charAt(0);
      let seatType = 'standard';
      let price = showtimeData.price.standard;

      if (showtimeData.room.vipRows.includes(row)) {
        seatType = 'vip';
        price = showtimeData.price.vip;
      } else if (showtimeData.room.coupleRows.includes(row)) {
        seatType = 'couple';
        price = showtimeData.price.couple;
      }

      return {
        seatNumber: seat.seatNumber,
        seatType,
        price
      };
    });

    // Tính tổng tiền
    const totalPrice = seatsWithPrice.reduce((sum, seat) => sum + seat.price, 0);

    // Tạo payment expiry (15 phút cho QR/bank, 30 phút cho cash)
    const paymentExpiry = new Date();
    if (paymentMethod === 'qr' || paymentMethod === 'bank') {
      paymentExpiry.setMinutes(paymentExpiry.getMinutes() + 15);
    } else if (paymentMethod === 'cash') {
      // Cash payment expires 30 minutes before showtime
      paymentExpiry.setTime(new Date(showtimeData.startTime).getTime() - 30 * 60 * 1000);
    }

    // Tạo booking
    const booking = await Booking.create({
      user: req.user._id,
      showtime,
      seats: seatsWithPrice,
      totalSeats: seats.length,
      totalPrice,
      paymentMethod,
      transactionId,
      paymentStatus,
      paymentExpiry,
      bookingStatus: paymentStatus === 'completed' ? 'confirmed' : 'pending'
    });

    // Cập nhật ghế đã đặt trong suất chiếu
    await Showtime.findByIdAndUpdate(showtime, {
      $push: { bookedSeats: { $each: seatNumbers } }
    });

    // Cập nhật totalBookings và totalRevenue cho phim khi thanh toán thành công
    if (paymentStatus === 'completed') {
      await Movie.findByIdAndUpdate(showtimeData.movie, {
        $inc: {
          totalBookings: seats.length,
          totalRevenue: totalPrice
        }
      });
    }

    // Populate thông tin cho response
    const populatedBooking = await Booking.findById(booking._id)
      .populate({
        path: 'showtime',
        populate: [
          { path: 'movie', select: 'title poster duration rated' },
          { path: 'cinema', select: 'name address city phone' },
          { path: 'room', select: 'name type' }
        ]
      })
      .populate('user', 'name email phone');

    res.status(201).json({
      success: true,
      data: populatedBooking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
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

    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'showtime',
        populate: { path: 'movie' }
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy booking'
      });
    }

    // Cập nhật doanh thu khi chuyển từ pending sang completed
    if (paymentStatus === 'completed' && booking.paymentStatus !== 'completed') {
      await Movie.findByIdAndUpdate(booking.showtime.movie._id, {
        $inc: {
          totalBookings: booking.totalSeats,
          totalRevenue: booking.totalPrice
        }
      });
    }

    if (bookingStatus) {
      booking.bookingStatus = bookingStatus;
    }

    if (paymentStatus) {
      booking.paymentStatus = paymentStatus;
    }

    await booking.save();

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

// @desc    Verify thanh toán QR/Bank
// @route   POST /api/bookings/:id/verify-payment
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy booking'
      });
    }

    // Kiểm tra quyền (chỉ user sở hữu hoặc admin)
    if (booking.user.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thực hiện thao tác này'
      });
    }

    // Kiểm tra đã hết hạn chưa
    if (booking.paymentExpiry && new Date() > booking.paymentExpiry) {
      booking.bookingStatus = 'cancelled';
      await booking.save();

      // Trả lại ghế
      const seatNumbers = booking.seats.map(s => s.seatNumber);
      await Showtime.findByIdAndUpdate(booking.showtime, {
        $pull: { bookedSeats: { $in: seatNumbers } }
      });

      return res.status(400).json({
        success: false,
        message: 'Booking đã hết hạn thanh toán'
      });
    }

    // TODO: Kết nối với API ngân hàng để verify transaction
    // Giả sử verify thành công
    booking.paymentStatus = 'completed';
    booking.bookingStatus = 'confirmed';
    await booking.save();

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

// @desc    Tự động verify thanh toán theo transaction ID
// @route   POST /api/bookings/:id/auto-verify
// @access  Private
const autoVerifyPayment = async (req, res) => {
  try {
    const { transactionId } = req.body;
    const booking = await Booking.findById(req.params.id)
      .populate('showtime');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy booking'
      });
    }

    // Kiểm tra quyền (chỉ user sở hữu hoặc admin)
    if (booking.user.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thực hiện thao tác này'
      });
    }

    // Kiểm tra đã hết hạn chưa
    if (booking.paymentExpiry && new Date() > booking.paymentExpiry) {
      booking.bookingStatus = 'cancelled';
      await booking.save();

      // Trả lại ghế
      const seatNumbers = booking.seats.map(s => s.seatNumber);
      await Showtime.findByIdAndUpdate(booking.showtime, {
        $pull: { bookedSeats: { $in: seatNumbers } }
      });

      return res.status(400).json({
        success: false,
        message: 'Booking đã hết hạn thanh toán',
        verified: false
      });
    }

    // Đã thanh toán rồi
    if (booking.paymentStatus === 'completed') {
      return res.status(200).json({
        success: true,
        verified: true,
        message: 'Booking đã được xác nhận trước đó',
        data: booking
      });
    }

    // ===== TỰ ĐỘNG VERIFY PAYMENT - DEMO MODE =====
    // Đây là chế độ thanh toán ảo để demo/test
    // Trong production: Tích hợp API ngân hàng thực (Casso, VNPay, etc.)
    
    // Mock function: Tự động accept mọi transaction (Virtual Payment)
    const mockBankTransactionCheck = async (txId, amount) => {
      // DEMO MODE: Tự động chấp nhận thanh toán ngay lập tức
      // Trong production thực tế:
      // - Gọi API Casso.vn: await cassoAPI.getTransactions()
      // - Hoặc VNPay: await vnpayAPI.queryTransaction(txId)
      // - Hoặc bank statement API
      
      if (txId && txId.startsWith('CINEMA')) {
        const timestamp = parseInt(txId.replace('CINEMA', ''));
        const isValidTimestamp = timestamp > 1600000000000; // After 2020
        
        if (isValidTimestamp) {
          // ✅ Tự động chấp nhận thanh toán ngay (Virtual Payment)
          return {
            found: true,
            amount: amount,
            status: 'success',
            transactionTime: new Date(),
            isDemo: true
          };
        }
      }
      
      return { found: false };
    };

    // Check payment từ bank
    const bankCheck = await mockBankTransactionCheck(
      transactionId, 
      booking.totalPrice
    );

    if (bankCheck.found) {
      // Payment verified! Cập nhật booking
      booking.paymentStatus = 'completed';
      booking.bookingStatus = 'confirmed';
      booking.transactionId = transactionId;
      await booking.save();

      return res.status(200).json({
        success: true,
        verified: true,
        message: 'Thanh toán đã được xác nhận tự động!',
        data: booking
      });
    } else {
      // Chưa tìm thấy giao dịch
      return res.status(200).json({
        success: true,
        verified: false,
        message: 'Chưa tìm thấy giao dịch. Vui lòng đợi...'
      });
    }

  } catch (error) {
    console.error('Auto verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xác thực thanh toán',
      verified: false
    });
  }
};

// @desc    Kiểm tra và hủy các booking hết hạn
// @route   POST /api/bookings/cleanup-expired
// @access  Private/Admin
const cleanupExpiredBookings = async (req, res) => {
  try {
    const now = new Date();
    
    // Tìm các booking hết hạn và chưa thanh toán
    const expiredBookings = await Booking.find({
      paymentExpiry: { $lt: now },
      paymentStatus: 'pending',
      bookingStatus: { $ne: 'cancelled' }
    });

    for (const booking of expiredBookings) {
      booking.bookingStatus = 'cancelled';
      await booking.save();

      // Trả lại ghế
      const seatNumbers = booking.seats.map(s => s.seatNumber);
      await Showtime.findByIdAndUpdate(booking.showtime, {
        $pull: { bookedSeats: { $in: seatNumbers } }
      });
    }

    res.status(200).json({
      success: true,
      message: `Đã hủy ${expiredBookings.length} booking hết hạn`,
      count: expiredBookings.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBooking,
  getAllBookings,
  updateBookingStatus,
  cancelBooking,
  verifyPayment,
  autoVerifyPayment,
  cleanupExpiredBookings
};