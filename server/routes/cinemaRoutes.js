const express = require('express');
const router = express.Router();
const {
  getCinemas,
  getCinema,
  createCinema,
  updateCinema,
  deleteCinema,
  getRoomsByCinema,
  createRoom,
  updateRoom,
  deleteRoom,
  uploadImage
} = require('../controllers/cinemaController');
const { protect, admin } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// Cinema routes
router.get('/', getCinemas);
router.get('/:id', getCinema);
router.post('/', protect, admin, createCinema);
router.put('/:id', protect, admin, updateCinema);
router.delete('/:id', protect, admin, deleteCinema);
router.post('/upload-image', protect, admin, upload.single('image'), uploadImage);

// Room routes (nested)
router.get('/:cinemaId/rooms', getRoomsByCinema);
router.post('/:cinemaId/rooms', protect, admin, createRoom);

module.exports = router;