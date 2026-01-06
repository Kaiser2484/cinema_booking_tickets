const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBooking,
  getAllBookings,
  updateBookingStatus,
  cancelBooking
} = require('../controllers/bookingController');
const { protect, admin } = require('../middlewares/auth');

// User routes (yêu cầu đăng nhập)
router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/:id', protect, getBooking);
router.put('/:id/cancel', protect, cancelBooking);

// Admin routes
router. get('/', protect, admin, getAllBookings);
router.put('/:id/status', protect, admin, updateBookingStatus);

module.exports = router;