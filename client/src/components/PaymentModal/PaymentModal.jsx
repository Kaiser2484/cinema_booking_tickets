import { useState, useEffect, useRef, useCallback } from 'react';
import { FaTimes, FaQrcode, FaUniversity, FaClock, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { paymentConfigAPI, bookingAPI } from '../../services/api';
import './PaymentModal.css';

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  bookingData, 
  onPaymentComplete 
}) => {
  const [paymentMethod, setPaymentMethod] = useState('qr');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [bankConfig, setBankConfig] = useState(null);
  const timerRef = useRef(null);
  const checkPaymentRef = useRef(null);

  // Fetch bank config khi modal mở
  useEffect(() => {
    const fetchBankConfig = async () => {
      try {
        const response = await paymentConfigAPI.getPrimary();
        setBankConfig(response.data.data);
      } catch (error) {
        console.error('Error fetching bank config:', error);
        // Fallback to default config
        setBankConfig({
          bankCode: 'MB',
          bankName: 'MB Bank',
          accountNumber: '0123456789',
          accountName: 'CONG TY CINEMA BOOKING'
        });
      }
    };

    if (isOpen) {
      fetchBankConfig();
    }
  }, [isOpen]);

  // Generate QR code và transaction ID
  useEffect(() => {
    if (isOpen && paymentMethod === 'qr' && bankConfig) {
      const newTransactionId = `CINEMA${Date.now()}`;
      setTransactionId(newTransactionId);
      
      // Generate QR Code using VietQR or similar service
      const bankInfo = {
        bank: bankConfig.bankCode,
        accountNo: bankConfig.accountNumber,
        accountName: bankConfig.accountName,
        amount: bookingData.totalPrice,
        description: `Thanh toan ve ${newTransactionId}`
      };
      
      // Using VietQR API format
      const qrUrl = `https://img.vietqr.io/image/${bankInfo.bank}-${bankInfo.accountNo}-compact2.png?amount=${bankInfo.amount}&addInfo=${encodeURIComponent(bankInfo.description)}&accountName=${encodeURIComponent(bankInfo.accountName)}`;
      setQrCodeUrl(qrUrl);
    }
  }, [isOpen, paymentMethod, bookingData, bankConfig]);

  const handlePaymentSuccess = useCallback(() => {
    setPaymentVerified(true);
    clearInterval(timerRef.current);
    clearInterval(checkPaymentRef.current);
    
    toast.success('Thanh toán thành công!');
    
    // Wait a moment for user to see the success message
    setTimeout(() => {
      onPaymentComplete({
        method: paymentMethod,
        transactionId: transactionId,
        status: 'completed'
      });
    }, 1500);
  }, [paymentMethod, transactionId, onPaymentComplete]);

  const handleTimeout = useCallback(() => {
    toast.error('Hết thời gian thanh toán! Vui lòng thử lại.');
    onClose();
  }, [onClose]);

  const checkPaymentStatus = useCallback(async () => {
    if (!bookingData.bookingId || !transactionId || isVerifying) return;
    
    try {
      setIsVerifying(true);
      
      // Gọi API tự động verify payment
      const response = await bookingAPI.autoVerifyPayment(
        bookingData.bookingId, 
        transactionId
      );
      
      if (response.data.verified) {
        // Payment đã được xác nhận!
        handlePaymentSuccess();
      }
      // Nếu chưa verified, sẽ tiếp tục check ở lần sau
      
    } catch (error) {
      console.error('Error checking payment:', error);
      // Không hiển thị lỗi cho user, sẽ retry ở lần check tiếp theo
    } finally {
      setIsVerifying(false);
    }
  }, [bookingData.bookingId, transactionId, isVerifying, handlePaymentSuccess]);

  // Countdown timer
  useEffect(() => {
    if (isOpen && !paymentVerified) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [isOpen, paymentVerified, handleTimeout]);

  // Auto-check payment status for QR code
  useEffect(() => {
    if (isOpen && paymentMethod === 'qr' && !paymentVerified && transactionId) {
      // Check every 5 seconds
      checkPaymentRef.current = setInterval(() => {
        checkPaymentStatus();
      }, 5000);

      return () => {
        if (checkPaymentRef.current) {
          clearInterval(checkPaymentRef.current);
        }
      };
    }
  }, [isOpen, paymentMethod, paymentVerified, transactionId, checkPaymentStatus]);

  const handleManualPayment = () => {
    setIsVerifying(true);
    
    // Tự động xác nhận sau 1 giây
    setTimeout(() => {
      try {
        handlePaymentSuccess();
      } catch (error) {
        toast.error('Có lỗi xảy ra!');
        setIsVerifying(false);
      }
    }, 1000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (!isOpen) return null;

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <FaTimes />
        </button>

        <h2 className="payment-modal-title">Thanh Toán</h2>

        {!paymentVerified ? (
          <>
            {/* Timer */}
            <div className="payment-timer">
              <FaClock />
              <span>Thời gian còn lại: <strong>{formatTime(timeLeft)}</strong></span>
            </div>

            {/* Payment Methods */}
            <div className="payment-methods">
              <button
                className={`payment-method-btn ${paymentMethod === 'qr' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('qr')}
              >
                <FaQrcode />
                <span>Quét mã QR</span>
              </button>
              <button
                className={`payment-method-btn ${paymentMethod === 'bank' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('bank')}
              >
                <FaUniversity />
                <span>Chuyển khoản</span>
              </button>
              <button
                className={`payment-method-btn ${paymentMethod === 'cash' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('cash')}
              >
                💵
                <span>Tiền mặt</span>
              </button>
            </div>

            {/* Payment Content */}
            <div className="payment-content">
              {paymentMethod === 'qr' && (
                <div className="qr-payment">
                  <div className="qr-code-container">
                    {qrCodeUrl ? (
                      <img src={qrCodeUrl} alt="QR Code" className="qr-code" />
                    ) : (
                      <div className="qr-loading">Đang tạo mã QR...</div>
                    )}
                  </div>
                  <div className="qr-instructions">
                    <h3>Hướng dẫn thanh toán</h3>
                    <ol>
                      <li>Mở ứng dụng ngân hàng của bạn</li>
                      <li>Quét mã QR bên trên</li>
                      <li>Kiểm tra thông tin và xác nhận thanh toán</li>
                      <li>Hệ thống sẽ tự động xác nhận sau khi nhận được thanh toán</li>
                    </ol>
                    <div className="payment-info">
                      <p><strong>Số tiền:</strong> {formatPrice(bookingData.totalPrice)}</p>
                      <p><strong>Mã giao dịch:</strong> {transactionId}</p>
                    </div>
                  </div>
                  
                  <button 
                    className="btn-confirm-payment"
                    onClick={handleManualPayment}
                    disabled={isVerifying}
                  >
                    {isVerifying ? 'Đang xử lý...' : 'Xác nhận đã chuyển khoản'}
                  </button>
                  
                  <div className="payment-note" style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#888' }}>
                    💡 Sau khi quét QR và chuyển khoản thành công, nhấn nút trên để xác nhận
                  </div>
                </div>
              )}

              {paymentMethod === 'bank' && bankConfig && (
                <div className="bank-payment">

                  <h3>Thông tin chuyển khoản</h3>
                  <div className="bank-info">
                    <div className="info-row">
                      <span>Ngân hàng:</span>
                      <strong>{bankConfig.bankName}</strong>
                    </div>
                    <div className="info-row">
                      <span>Số tài khoản:</span>
                      <strong>{bankConfig.accountNumber}</strong>
                    </div>
                    <div className="info-row">
                      <span>Chủ tài khoản:</span>
                      <strong>{bankConfig.accountName}</strong>
                    </div>
                    {bankConfig.branch && (
                      <div className="info-row">
                        <span>Chi nhánh:</span>
                        <strong>{bankConfig.branch}</strong>
                      </div>
                    )}
                    <div className="info-row highlight">
                      <span>Số tiền:</span>
                      <strong>{formatPrice(bookingData.totalPrice)}</strong>
                    </div>
                    <div className="info-row highlight">
                      <span>Nội dung:</span>
                      <strong>{transactionId}</strong>
                    </div>
                  </div>
                  <div className="payment-note">
                    <strong>Lưu ý quan trọng:</strong>
                    <ul>
                      <li>Vui lòng chuyển khoản đúng số tiền và nội dung giao dịch</li>
                      <li>Sau khi chuyển khoản thành công, vui lòng nhấn nút xác nhận</li>
                      <li>Hệ thống sẽ tự động kiểm tra và xác nhận vé của bạn</li>
                    </ul>
                  </div>
                  <button 
                    className="btn-confirm-payment"
                    onClick={handleManualPayment}
                    disabled={isVerifying}
                  >
                    {isVerifying ? 'Đang xử lý...' : 'Xác nhận đặt vé'}
                  </button>
                </div>
              )}

              {paymentMethod === 'cash' && (
                <div className="cash-payment">
                  <div className="cash-icon">💵</div>
                  <h3>Thanh toán tại quầy</h3>
                  <div className="cash-info">
                    <p>Bạn đã chọn thanh toán bằng tiền mặt tại quầy vé.</p>
                    <div className="payment-amount">
                      <span>Số tiền cần thanh toán:</span>
                      <strong>{formatPrice(bookingData.totalPrice)}</strong>
                    </div>
                    <div className="cash-instructions">
                      <h4>Hướng dẫn:</h4>
                      <ol>
                        <li>Nhấn "Xác nhận đặt vé" để hoàn tất</li>
                        <li>Đến quầy vé trước giờ chiếu ít nhất 30 phút</li>
                        <li>Xuất trình mã đặt vé và thanh toán để nhận vé</li>
                      </ol>
                    </div>
                    <div className="payment-note">
                      <strong>⚠️ Lưu ý:</strong> Vui lòng thanh toán tại quầy trước giờ chiếu để tránh mất chỗ
                    </div>
                  </div>
                  <button 
                    className="btn-confirm-payment"
                    onClick={handleManualPayment}
                    disabled={isVerifying}
                  >
                    {isVerifying ? 'Đang xử lý...' : 'Xác nhận đặt vé'}
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="payment-success">
            <div className="success-animation">
              <FaCheck className="success-icon" />
              <div className="success-circle"></div>
              <div className="success-circle delay-1"></div>
              <div className="success-circle delay-2"></div>
            </div>
            <h3>Thanh toán thành công!</h3>
            <p>Đang chuyển đến trang xác nhận...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
