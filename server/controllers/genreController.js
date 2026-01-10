const Genre = require('../models/Genre');

// @desc    Lấy tất cả thể loại
// @route   GET /api/genres
// @access  Public
const getGenres = async (req, res) => {
  try {
    const genres = await Genre.find({ isActive: true }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: genres.length,
      data: genres
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Lấy thể loại theo ID
// @route   GET /api/genres/:id
// @access  Public
const getGenre = async (req, res) => {
  try {
    const genre = await Genre.findById(req.params.id);

    if (!genre) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thể loại'
      });
    }

    res.status(200).json({
      success: true,
      data: genre
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Tạo thể loại mới
// @route   POST /api/genres
// @access  Private/Admin
const createGenre = async (req, res) => {
  try {
    const genre = await Genre.create(req.body);

    res.status(201).json({
      success: true,
      data: genre
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Thể loại này đã tồn tại'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cập nhật thể loại
// @route   PUT /api/genres/:id
// @access  Private/Admin
const updateGenre = async (req, res) => {
  try {
    const genre = await Genre.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!genre) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thể loại'
      });
    }

    res.status(200).json({
      success: true,
      data: genre
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Tên thể loại này đã tồn tại'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Xóa thể loại
// @route   DELETE /api/genres/:id
// @access  Private/Admin
const deleteGenre = async (req, res) => {
  try {
    const genre = await Genre.findByIdAndDelete(req.params.id);

    if (!genre) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thể loại'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Xóa thể loại thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getGenres,
  getGenre,
  createGenre,
  updateGenre,
  deleteGenre
};
