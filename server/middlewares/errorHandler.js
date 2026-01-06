const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log lỗi cho developer
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Không tìm thấy dữ liệu';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Dữ liệu đã tồn tại';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err. errors).map((val) => val.message);
    error = { message, statusCode:  400 };
  }

  res.status(error. statusCode || 500).json({
    success: false,
    message: error.message || 'Lỗi server'
  });
};

module.exports = errorHandler;