// Validation logic cho payment transactions

/**
 * Validate transaction ID pattern
 * Format: CINEMA + timestamp (13 digits)
 * Ví dụ: CINEMA1736755200000
 */
const validateTransactionId = (transactionId) => {
  // Check format
  if (!transactionId || typeof transactionId !== 'string') {
    return { valid: false, error: 'Mã giao dịch không hợp lệ' };
  }

  // Check prefix
  if (!transactionId.startsWith('CINEMA')) {
    return { valid: false, error: 'Mã giao dịch không đúng định dạng' };
  }

  // Extract timestamp
  const timestampStr = transactionId.replace('CINEMA', '');
  const timestamp = parseInt(timestampStr);

  if (isNaN(timestamp)) {
    return { valid: false, error: 'Mã giao dịch không hợp lệ' };
  }

  // Check timestamp trong vòng 15 phút
  const now = Date.now();
  const fifteenMinutes = 15 * 60 * 1000;
  
  if (now - timestamp > fifteenMinutes) {
    return { valid: false, error: 'Mã giao dịch đã hết hạn' };
  }

  return { valid: true };
};

// Verify transaction pattern
const verifyTransactionPattern = (transactionId, amount) => {
  // Check format: CINEMA + timestamp
  if (!transactionId || !transactionId.startsWith('CINEMA')) {
    return { valid: false, error: 'Mã giao dịch không hợp lệ' };
  }
  
  // Check length
  if (transactionId.length !== 19) {
    return { valid: false, error: 'Mã giao dịch không đúng định dạng' };
  }
  
  // Extract timestamp
  const timestamp = parseInt(transactionId.replace('CINEMA', ''));
  if (isNaN(timestamp)) {
    return { valid: false, error: 'Mã giao dịch không hợp lệ' };
  }
  
  // Check trong vòng 15 phút
  const now = Date.now();
  const fifteenMinutes = 15 * 60 * 1000;
  
  if (now - timestamp > fifteenMinutes) {
    return { valid: false, error: 'Mã giao dịch đã hết hạn' };
  }
  
  return { valid: true };
};

// Verify payment khi có transaction
const verifyPayment = async (req, res) => {
  try {
    const { transactionId, amount } = req.body;
    
    // 1. Validate transaction ID format
    if (!transactionId || !transactionId.startsWith('CINEMA')) {
      return res.status(400).json({
        success: false,
        message: 'Mã giao dịch không hợp lệ'
      });
    }
    
    // 2. Extract timestamp từ transaction ID
    const timestamp = parseInt(transactionId.replace('CINEMA', ''));
    const now = Date.now();
    const fifteenMinutes = 15 * 60 * 1000;
    
    // 3. Check expiry (15 phút)
    if (now - timestamp > fifteenMinutes) {
      return res.status(400).json({
        success: false,
        message: 'Mã giao dịch đã hết hạn. Vui lòng tạo đơn mới.'
      });
    }
    
    // 4. Check format timestamp
    if (isNaN(timestamp) || timestamp > now) {
      return res.status(400).json({
        success: false,
        message: 'Mã giao dịch không hợp lệ'
      });
    }
    
    return res.status(200).json({
      success: true,
      verified: true,
      message: 'Xác thực thanh toán thành công'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBooking,
  getAllBookings,
  updateBookingStatus,
  cancelBooking,
  verifyPayment,
  autoVerifyPayment
};
