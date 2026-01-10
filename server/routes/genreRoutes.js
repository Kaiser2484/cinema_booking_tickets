const express = require('express');
const router = express.Router();
const {
  getGenres,
  getGenre,
  createGenre,
  updateGenre,
  deleteGenre
} = require('../controllers/genreController');
const { protect, admin } = require('../middlewares/auth');

// Public routes
router.get('/', getGenres);
router.get('/:id', getGenre);

// Admin routes
router.post('/', protect, admin, createGenre);
router.put('/:id', protect, admin, updateGenre);
router.delete('/:id', protect, admin, deleteGenre);

module.exports = router;
