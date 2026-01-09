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

  const fetchBooking = useCallback(async () => {
    try {
      const response = await bookingAPI.getById(id);
      setBooking(response.data.data);
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

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
      <div className="success-container">
        <div className="success-icon">
          <FaCheckCircle />
        </div>

        <h1>Đặt Vé Thành Công! </h1>
        <p className="success-message">
          Cảm ơn bạn đã đặt vé tại CineBook. Vui lòng lưu lại thông tin bên dưới. 
        </p>

        <div className="booking-ticket">
          <div className="ticket-header">
            <FaTicketAlt />
            <span>Mã đặt vé:  <strong>{booking.bookingCode}</strong></span>
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

        <div className="success-actions">
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