const express = require('express');
const router = express. Router();
const {
  updateRoom,
  deleteRoom
} = require('../controllers/cinemaController');
const { protect, admin } = require('../middlewares/auth');

// Room routes
router. put('/:id', protect, admin, updateRoom);
router.delete('/:id', protect, admin, deleteRoom);

module.exports = router;