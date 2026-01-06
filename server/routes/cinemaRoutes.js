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
  deleteRoom
} = require('../controllers/cinemaController');
const { protect, admin } = require('../middlewares/auth');

// Cinema routes
router.get('/', getCinemas);
router.get('/:id', getCinema);
router.post('/', protect, admin, createCinema);
router.put('/:id', protect, admin, updateCinema);
router.delete('/:id', protect, admin, deleteCinema);

// Room routes (nested)
router.get('/:cinemaId/rooms', getRoomsByCinema);
router.post('/:cinemaId/rooms', protect, admin, createRoom);

module.exports = router;