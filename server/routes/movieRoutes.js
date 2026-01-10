const express = require('express');
const router = express.Router();
const {
  getMovies,
  getNowShowing,
  getComingSoon,
  getMovie,
  createMovie,
  updateMovie,
  deleteMovie,
  uploadPoster
} = require('../controllers/movieController');
const { protect, admin } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// Public routes
router.get('/', getMovies);
router.get('/now-showing', getNowShowing);
router.get('/coming-soon', getComingSoon);
router.get('/:id', getMovie);

// Admin routes
router.post('/', protect, admin, createMovie);
router.put('/:id', protect, admin, updateMovie);
router.delete('/:id', protect, admin, deleteMovie);
router.post('/upload-poster', protect, admin, upload.single('poster'), uploadPoster);

module.exports = router;