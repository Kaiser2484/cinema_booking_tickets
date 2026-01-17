import { useEffect } from 'react';
import QRCode from 'react-qr-code';
import { 
  FaTimes, 
  FaTicketAlt, 
  FaFilm, 
  FaMapMarkerAlt, 
  FaCalendarAlt,
  FaClock,
  FaChair,
  FaMoneyBillWave,
  FaQrcode,
  FaBuilding,
  FaDoorOpen
} from 'react-icons/fa';
import './TicketDetail.css';

const TicketDetail = ({ booking, onClose }) => {
  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!booking) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f39c12',
      confirmed: '#27ae60',
      cancelled: '#e74c3c',
      completed: '#3498db'
    };
    return colors[status] || '#888';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      cancelled: 'Đã hủy',
      completed: 'Hoàn thành'
    };
    return texts[status] || status;
  };

  // Tạo dữ liệu cho QR code
  const qrData = JSON.stringify({
    bookingCode: booking.bookingCode,
    bookingId: booking._id,
    movieTitle: booking.showtime?.movie?.title,
    cinema: booking.showtime?.cinema?.name,
    showtime: booking.showtime?.startTime,
    seats: booking.seats?.map(s => s.seatNumber),
    totalPrice: booking.totalPrice,
    status: booking.bookingStatus
  });

  return (
    <div className="ticket-detail-overlay" onClick={onClose}>
      <div className="ticket-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="btn-close-ticket" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="ticket-container">
          {/* Ticket Header */}
          <div className="ticket-header">
            <div className="ticket-logo">
              <FaTicketAlt />
              <h2>VÉ XEM PHIM ĐIỆN TỬ</h2>
            </div>
            <div 
              className="ticket-status"
              style={{ background: getStatusColor(booking.bookingStatus) }}
            >
              {getStatusText(booking.bookingStatus)}
            </div>
          </div>

          {/* Ticket Body */}
          <div className="ticket-body">
            <div className="ticket-left">
              {/* Movie Info */}
              <div className="ticket-movie">
                <img 
                  src={booking.showtime?.movie?.poster} 
                  alt={booking.showtime?.movie?.title}
                  className="ticket-poster"
                />
                <div className="movie-details">
                  <h3><FaFilm /> {booking.showtime?.movie?.title}</h3>
                  <p className="movie-genre">
                    {booking.showtime?.movie?.genres?.map(g => g.name).join(', ')}
                  </p>
                  <p className="movie-duration">
                    <FaClock /> {booking.showtime?.movie?.duration} phút
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="ticket-divider"></div>

              {/* Booking Details */}
              <div className="ticket-details">
                <div className="detail-row">
                  <span className="detail-label">
                    <FaBuilding /> Rạp chiếu
                  </span>
                  <span className="detail-value">
                    {booking.showtime?.cinema?.name}
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">
                    <FaMapMarkerAlt /> Địa chỉ
                  </span>
                  <span className="detail-value">
                    {booking.showtime?.cinema?.address}, {booking.showtime?.cinema?.city}
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">
                    <FaDoorOpen /> Phòng chiếu
                  </span>
                  <span className="detail-value">
                    {booking.showtime?.room?.name} ({booking.showtime?.room?.type})
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">
                    <FaCalendarAlt /> Ngày chiếu
                  </span>
                  <span className="detail-value">
                    {formatDate(booking.showtime?.startTime)}
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">
                    <FaClock /> Giờ chiếu
                  </span>
                  <span className="detail-value time-highlight">
                    {formatTime(booking.showtime?.startTime)} - {formatTime(booking.showtime?.endTime)}
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">
                    <FaChair /> Ghế ngồi
                  </span>
                  <span className="detail-value seats-list">
                    {booking.seats?.map((seat, idx) => (
                      <span 
                        key={idx} 
                        className={`seat-badge seat-${seat.type?.toLowerCase()}`}
                      >
                        {seat.seatNumber}
                      </span>
                    ))}
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">
                    <FaMoneyBillWave /> Tổng tiền
                  </span>
                  <span className="detail-value price-highlight">
                    {formatPrice(booking.totalPrice)}
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">
                    <FaTicketAlt /> Mã đặt vé
                  </span>
                  <span className="detail-value booking-code">
                    {booking.bookingCode}
                  </span>
                </div>
              </div>
            </div>

            {/* Ticket Right - QR Code */}
            <div className="ticket-right">
              <div className="qr-section">
                <div className="qr-header">
                  <FaQrcode />
                  <h4>Quét mã QR tại rạp</h4>
                </div>
                <div className="qr-code-wrapper">
                  <QRCode
                    value={qrData}
                    size={200}
                    level="H"
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                </div>
                <p className="qr-instruction">
                  Vui lòng xuất trình mã QR này cho nhân viên tại quầy để xác nhận vé
                </p>
                <div className="qr-booking-code">
                  {booking.bookingCode}
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Footer */}
          <div className="ticket-footer">
            <p className="ticket-note">
              ⚠️ Vui lòng đến rạp trước giờ chiếu 15 phút để làm thủ tục vào phòng
            </p>
            <p className="ticket-date">
              Ngày đặt: {formatDate(booking.createdAt)} lúc {formatTime(booking.createdAt)}
            </p>
          </div>
        </div>

        {/* Print Button */}
        <div className="ticket-actions">
          <button className="btn-print" onClick={() => window.print()}>
            📄 In vé
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
