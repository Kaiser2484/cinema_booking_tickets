const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBooking,
  getAllBookings,
  updateBookingStatus,
  cancelBooking,
  verifyPayment,
  autoVerifyPayment,
  cleanupExpiredBookings
} = require('../controllers/bookingController');
const { protect, admin } = require('../middlewares/auth');

// User routes (yêu cầu đăng nhập)
router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/:id', protect, getBooking);
router.put('/:id/cancel', protect, cancelBooking);
router.post('/:id/verify-payment', protect, verifyPayment);
router.post('/:id/auto-verify', protect, autoVerifyPayment);

// Admin routes
router.get('/', protect, admin, getAllBookings);
router.put('/:id/status', protect, admin, updateBookingStatus);
router.post('/cleanup-expired', protect, admin, cleanupExpiredBookings);

module.exports = router;