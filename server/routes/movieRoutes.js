const express = require('express');
const router = express.Router();
const {
  getMovies,
  getNowShowing,
  getComingSoon,
  getMovie,
  createMovie,
  updateMovie,
  deleteMovie
} = require('../controllers/movieController');
const { protect, admin } = require('../middlewares/auth');

// Public routes
router.get('/', getMovies);
router.get('/now-showing', getNowShowing);
router.get('/coming-soon', getComingSoon);
router.get('/:id', getMovie);

// Admin routes
router.post('/', protect, admin, createMovie);
router.put('/:id', protect, admin, updateMovie);
router.delete('/:id', protect, admin, deleteMovie);

module.exports = router;