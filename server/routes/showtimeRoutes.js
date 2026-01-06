const express = require('express');
const router = express.Router();
const {
  getShowtimes,
  getShowtimesByMovie,
  getShowtime,
  createShowtime,
  updateShowtime,
  deleteShowtime
} = require('../controllers/showtimeController');
const { protect, admin } = require('../middlewares/auth');

// Public routes
router.get('/', getShowtimes);
router.get('/movie/:movieId', getShowtimesByMovie);
router.get('/:id', getShowtime);

// Admin routes
router.post('/', protect, admin, createShowtime);
router.put('/:id', protect, admin, updateShowtime);
router.delete('/:id', protect, admin, deleteShowtime);

module.exports = router;