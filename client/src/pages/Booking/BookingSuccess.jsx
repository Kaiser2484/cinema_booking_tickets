import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingAPI } from '../../services/api';
import Loading from '../../components/Loading/Loading';
import { FaCheckCircle, FaTicketAlt, FaHome } from 'react-icons/fa';
import './BookingSuccess.css';

const BookingSuccess = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  const fetchBooking = useCallback(async () => {
    try {
      const response = await bookingAPI.getById(id);
      const bookingData = response.data.data;
      
      console.log('=== BOOKING SUCCESS DEBUG ===');
      console.log('Full Booking:', bookingData);
      console.log('Cinema:', bookingData?.showtime?.cinema?.name);
      console.log('Address:', bookingData?.showtime?.cinema?.address);
      console.log('Room:', bookingData?.showtime?.room?.name);
      console.log('Seats:', bookingData?.seats?.map(s => s.seatNumber).join(', '));
      console.log('Total Seats:', bookingData?.totalSeats);
      
      setBooking(bookingData);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  // Create confetti elements
  const createConfetti = () => {
    const confettiElements = [];
    const colors = ['#e94560', '#f39c12', '#27ae60', '#3498db', '#9b59b6', '#f1c40f'];
    
    for (let i = 0; i < 50; i++) {
      const style = {
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 3}s`,
        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
        animationDuration: `${2 + Math.random() * 3}s`
      };
      confettiElements.push(<div key={i} className="confetti" style={style}></div>);
    }
    return confettiElements;
  };

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      weekday: 'long',
      year:  'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <Loading />;
  }

  if (!booking) {
    return (
      <div className="not-found">
        <h2>Không tìm thấy thông tin đặt vé</h2>
        <Link to="/">Về trang chủ</Link>
      </div>
    );
  }

  return (
    <div className="booking-success-page">
      {showConfetti && <div className="confetti-container">{createConfetti()}</div>}
      
      <div className="success-container animate-in">
        <div className="success-icon pulse-animation">
          <FaCheckCircle />
        </div>

        <h1 className="fade-in-up">Đặt Vé Thành Công!</h1>
        <p className="success-message fade-in-up delay-1">
          Cảm ơn bạn đã đặt vé tại CineBook. Vui lòng lưu lại thông tin bên dưới.
        </p>

        <div className="booking-ticket fade-in-up delay-2">
          <div className="ticket-header">
            <FaTicketAlt />
            <span>Mã đặt vé: <strong>{booking.bookingCode}</strong></span>
          </div>

          <div className="ticket-content">
            <div className="ticket-movie">
              <img 
                src={booking.showtime?.movie?.poster} 
                alt={booking.showtime?.movie?.title} 
              />
              <div className="movie-info">
                <h2>{booking.showtime?.movie?.title}</h2>
                <p>{booking.showtime?.movie?.rated} • {booking.showtime?.movie?.duration} phút</p>
              </div>
            </div>

            <div className="ticket-details">
              <div className="detail-row">
                <span>Rạp:</span>
                <strong>{booking.showtime?.cinema?.name}</strong>
              </div>
              <div className="detail-row">
                <span>Địa chỉ:</span>
                <strong>{booking.showtime?.cinema?.address}</strong>
              </div>
              <div className="detail-row">
                <span>Phòng:</span>
                <strong>{booking.showtime?.room?.name}</strong>
              </div>
              <div className="detail-row">
                <span>Suất chiếu: </span>
                <strong>{formatDateTime(booking.showtime?.startTime)}</strong>
              </div>
              <div className="detail-row">
                <span>Ghế:</span>
                <strong className="seats-list">
                  {booking.seats?.map(s => s.seatNumber).join(', ')}
                </strong>
              </div>
              <div className="detail-row">
                <span>Số lượng:</span>
                <strong>{booking.totalSeats} vé</strong>
              </div>
              <div className="detail-row total">
                <span>Tổng tiền:</span>
                <strong>{formatPrice(booking.totalPrice)}</strong>
              </div>
            </div>
          </div>

          <div className="ticket-footer">
            <p>Vui lòng đến trước giờ chiếu 15 phút để nhận vé</p>
            <p>Xuất trình mã đặt vé tại quầy để lấy vé</p>
          </div>
        </div>

        <div className="success-actions fade-in-up delay-3">
          <Link to="/profile" className="btn-my-bookings">
            <FaTicketAlt /> Xem Lịch Sử Đặt Vé
          </Link>
          <Link to="/" className="btn-home">
            <FaHome /> Về Trang Chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;