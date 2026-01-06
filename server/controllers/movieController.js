const Movie = require('../models/Movie');

// @desc    Lấy tất cả phim
// @route   GET /api/movies
// @access  Public
const getMovies = async (req, res) => {
  try {
    const { status, genre, search } = req.query;

    // Build query
    let query = {};

    if (status) {
      query.status = status;
    }

    if (genre) {
      query.genres = genre;
    }

    if (search) {
      query. title = { $regex: search, $options: 'i' };
    }

    const movies = await Movie.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: movies.length,
      data: movies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Lấy phim đang chiếu
// @route   GET /api/movies/now-showing
// @access  Public
const getNowShowing = async (req, res) => {
  try {
    const movies = await Movie.find({ status: 'now_showing' })
      .sort({ releaseDate: -1 });

    res.status(200).json({
      success: true,
      count:  movies.length,
      data: movies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:  error.message
    });
  }
};

// @desc    Lấy phim sắp chiếu
// @route   GET /api/movies/coming-soon
// @access  Public
const getComingSoon = async (req, res) => {
  try {
    const movies = await Movie. find({ status: 'coming_soon' })
      .sort({ releaseDate:  1 });

    res.status(200).json({
      success: true,
      count:  movies.length,
      data: movies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:  error.message
    });
  }
};

// @desc    Lấy chi tiết phim
// @route   GET /api/movies/: id
// @access  Public
const getMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phim'
      });
    }

    res.status(200).json({
      success: true,
      data:  movie
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Tạo phim mới
// @route   POST /api/movies
// @access  Private/Admin
const createMovie = async (req, res) => {
  try {
    const movie = await Movie.create(req.body);

    res.status(201).json({
      success: true,
      data: movie
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cập nhật phim
// @route   PUT /api/movies/:id
// @access  Private/Admin
const updateMovie = async (req, res) => {
  try {
    const movie = await Movie. findByIdAndUpdate(
      req. params.id,
      req.body,
      { new:  true, runValidators: true }
    );

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phim'
      });
    }

    res.status(200).json({
      success: true,
      data: movie
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:  error.message
    });
  }
};

// @desc    Xóa phim
// @route   DELETE /api/movies/:id
// @access  Private/Admin
const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req. params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phim'
      });
    }

    res. status(200).json({
      success:  true,
      message: 'Xóa phim thành công'
    });
  } catch (error) {
    res. status(500).json({
      success:  false,
      message: error.message
    });
  }
};

module. exports = {
  getMovies,
  getNowShowing,
  getComingSoon,
  getMovie,
  createMovie,
  updateMovie,
  deleteMovie
};