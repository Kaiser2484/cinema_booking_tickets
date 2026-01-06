const Cinema = require('../models/Cinema');
const Room = require('../models/Room');

// @desc    Lấy tất cả rạp
// @route   GET /api/cinemas
// @access  Public
const getCinemas = async (req, res) => {
  try {
    const { city } = req.query;
    let query = { isActive:  true };

    if (city) {
      query. city = city;
    }

    const cinemas = await Cinema.find(query).populate('rooms');

    res.status(200).json({
      success: true,
      count: cinemas.length,
      data: cinemas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Lấy chi tiết rạp
// @route   GET /api/cinemas/: id
// @access  Public
const getCinema = async (req, res) => {
  try {
    const cinema = await Cinema.findById(req.params.id).populate('rooms');

    if (!cinema) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy rạp'
      });
    }

    res. status(200).json({
      success:  true,
      data: cinema
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error. message
    });
  }
};

// @desc    Tạo rạp mới
// @route   POST /api/cinemas
// @access  Private/Admin
const createCinema = async (req, res) => {
  try {
    const cinema = await Cinema.create(req.body);

    res.status(201).json({
      success: true,
      data: cinema
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error. message
    });
  }
};

// @desc    Cập nhật rạp
// @route   PUT /api/cinemas/:id
// @access  Private/Admin
const updateCinema = async (req, res) => {
  try {
    const cinema = await Cinema.findByIdAndUpdate(
      req.params. id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!cinema) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy rạp'
      });
    }

    res.status(200).json({
      success: true,
      data: cinema
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Xóa rạp
// @route   DELETE /api/cinemas/:id
// @access  Private/Admin
const deleteCinema = async (req, res) => {
  try {
    const cinema = await Cinema.findByIdAndDelete(req.params.id);

    if (!cinema) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy rạp'
      });
    }

    // Xóa tất cả phòng thuộc rạp này
    await Room.deleteMany({ cinema: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Xóa rạp thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:  error.message
    });
  }
};

// ============ ROOM CONTROLLERS ============

// @desc    Lấy phòng theo rạp
// @route   GET /api/cinemas/:cinemaId/rooms
// @access  Public
const getRoomsByCinema = async (req, res) => {
  try {
    const rooms = await Room.find({ 
      cinema: req.params.cinemaId,
      isActive:  true 
    });

    res.status(200).json({
      success: true,
      count:  rooms.length,
      data: rooms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:  error.message
    });
  }
};

// @desc    Tạo phòng mới
// @route   POST /api/cinemas/: cinemaId/rooms
// @access  Private/Admin
const createRoom = async (req, res) => {
  try {
    console.log('=== CREATE ROOM ===');           // 👈 Thêm
    console.log('cinemaId:', req. params.cinemaId); // 👈 Thêm
    console.log('body:', req.body);                // 👈 Thêm

    req.body. cinema = req.params.cinemaId;

    // Kiểm tra rạp tồn tại
    const cinema = await Cinema.findById(req.params.cinemaId);
    console.log('cinema found:', cinema);       

    if (!cinema) {
      return res.status(404).json({
        success: false,
        message:  'Không tìm thấy rạp'
      });
    }

    const room = await Room.create(req.body);
    console.log('room created:', room);          

    res.status(201).json({
      success: true,
      data:  room
    });
  } catch (error) {
    console.error('=== ERROR ===');             
    console.error(error);                      
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cập nhật phòng
// @route   PUT /api/rooms/:id
// @access  Private/Admin
const updateRoom = async (req, res) => {
  try {
    const room = await Room. findByIdAndUpdate(
      req. params.id,
      req.body,
      { new:  true, runValidators: true }
    );

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng'
      });
    }

    res.status(200).json({
      success: true,
      data: room
    });
  } catch (error) {
    res. status(500).json({
      success:  false,
      message: error.message
    });
  }
};

// @desc    Xóa phòng
// @route   DELETE /api/rooms/: id
// @access  Private/Admin
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Xóa phòng thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:  error.message
    });
  }
};

module.exports = {
  getCinemas,
  getCinema,
  createCinema,
  updateCinema,
  deleteCinema,
  getRoomsByCinema,
  createRoom,
  updateRoom,
  deleteRoom
};