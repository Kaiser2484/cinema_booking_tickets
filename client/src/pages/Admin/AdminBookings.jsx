import { useState, useEffect } from 'react';
import { bookingAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  FaTicketAlt, 
  FaSearch,
  FaCheck,
  FaTimes,
  FaEye,
  FaFilter
} from 'react-icons/fa';
import './Admin.css';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  const fetchBookings = async () => {
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      
      const response = await bookingAPI.getAll(params);
      setBookings(response.data.data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách đặt vé');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async (id) => {
    try {
      await bookingAPI.confirm(id);
      toast.success('Xác nhận đặt vé thành công!');
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Xác nhận thất bại! ');
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Bạn có chắc muốn hủy vé này?')) return;

    try {
      await bookingAPI.cancel(id);
      toast.success('Hủy vé thành công!');
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Hủy thất bại!');
    }
  };

  const openDetailModal = (booking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency:  'VND'
    }).format(price);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month:  '2-digit',
      year: 'numeric',
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

  const getPaymentStatusText = (status) => {
    const texts = {
      pending: 'Chưa thanh toán',
      completed: 'Đã thanh toán',
      failed: 'Thất bại',
      refunded: 'Đã hoàn tiền'
    };
    return texts[status] || status;
  };

  const filteredBookings = bookings.filter(booking => {
    const searchLower = searchTerm.toLowerCase();
    return (
      booking.bookingCode?.toLowerCase().includes(searchLower) ||
      booking.user?.name?.toLowerCase().includes(searchLower) ||
      booking.user?.email?.toLowerCase().includes(searchLower) ||
      booking.showtime?.movie?.title?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2><FaTicketAlt /> Quản Lý Đặt Vé</h2>
        <div className="header-stats">
          <span className="stat-item">
            Tổng:  <strong>{bookings.length}</strong>
          </span>
          <span className="stat-item pending">
            Chờ xác nhận: <strong>{bookings.filter(b => b.bookingStatus === 'pending').length}</strong>
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-bar" style={{ flex: 1, marginBottom: 0 }}>
          <FaSearch />
          <input
            type="text"
            placeholder="Tìm theo mã vé, tên khách hàng, email, tên phim..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label><FaFilter /> Trạng thái: </label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Tất cả</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="cancelled">Đã hủy</option>
            <option value="completed">Hoàn thành</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã vé</th>
              <th>Khách hàng</th>
              <th>Phim</th>
              <th>Suất chiếu</th>
              <th>Ghế</th>
              <th>Tổng tiền</th>
              <th>Thanh toán</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map(booking => (
              <tr key={booking._id}>
                <td>
                  <strong className="booking-code">{booking.bookingCode}</strong>
                </td>
                <td>
                  <div>
                    <strong>{booking.user?.name || 'N/A'}</strong>
                    <br />
                    <small className="text-muted">{booking.user?.email}</small>
                  </div>
                </td>
                <td>{booking.showtime?.movie?.title || 'N/A'}</td>
                <td>
                  <div>
                    <strong>{formatDateTime(booking.showtime?.startTime)}</strong>
                    <br />
                    <small className="text-muted">
                      {booking.showtime?.cinema?.name} - {booking.showtime?.room?.name}
                    </small>
                  </div>
                </td>
                <td>
                  <span className="seats-badge">
                    {booking.seats?.map(s => s.seatNumber).join(', ')}
                  </span>
                </td>
                <td className="price">
                  {formatPrice(booking.totalPrice)}
                </td>
                <td>
                  <span className={`payment-status ${booking.paymentStatus}`}>
                    {getPaymentStatusText(booking.paymentStatus)}
                  </span>
                </td>
                <td>
                  <span 
                    className="status-badge"
                    style={{ background: getStatusColor(booking.bookingStatus) }}
                  >
                    {getStatusText(booking.bookingStatus)}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-view" 
                      onClick={() => openDetailModal(booking)}
                      title="Xem chi tiết"
                    >
                      <FaEye />
                    </button>
                    {booking.bookingStatus === 'pending' && (
                      <>
                        <button 
                          className="btn-confirm" 
                          onClick={() => handleConfirmBooking(booking._id)}
                          title="Xác nhận"
                        >
                          <FaCheck />
                        </button>
                        <button 
                          className="btn-delete" 
                          onClick={() => handleCancelBooking(booking._id)}
                          title="Hủy"
                        >
                          <FaTimes />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredBookings.length === 0 && (
          <p className="no-data">Không tìm thấy đặt vé nào</p>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content modal-small" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi Ti���t Đặt Vé</h3>
              <button className="btn-close" onClick={() => setShowDetailModal(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="booking-detail">
              <div className="detail-section">
                <h4>Thông tin vé</h4>
                <div className="detail-row">
                  <span>Mã vé:</span>
                  <strong>{selectedBooking.bookingCode}</strong>
                </div>
                <div className="detail-row">
                  <span>Trạng thái: </span>
                  <span 
                    className="status-badge"
                    style={{ background: getStatusColor(selectedBooking.bookingStatus) }}
                  >
                    {getStatusText(selectedBooking.bookingStatus)}
                  </span>
                </div>
                <div className="detail-row">
                  <span>Ngày đặt:</span>
                  <span>{formatDateTime(selectedBooking.createdAt)}</span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Thông tin khách hàng</h4>
                <div className="detail-row">
                  <span>Họ tên:</span>
                  <span>{selectedBooking.user?.name}</span>
                </div>
                <div className="detail-row">
                  <span>Email:</span>
                  <span>{selectedBooking.user?.email}</span>
                </div>
                <div className="detail-row">
                  <span>Điện thoại: </span>
                  <span>{selectedBooking.user?.phone || 'N/A'}</span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Thông tin suất chiếu</h4>
                <div className="detail-row">
                  <span>Phim:</span>
                  <span>{selectedBooking.showtime?.movie?.title}</span>
                </div>
                <div className="detail-row">
                  <span>Rạp:</span>
                  <span>{selectedBooking.showtime?.cinema?.name}</span>
                </div>
                <div className="detail-row">
                  <span>Phòng: </span>
                  <span>{selectedBooking.showtime?.room?.name}</span>
                </div>
                <div className="detail-row">
                  <span>Suất chiếu: </span>
                  <span>{formatDateTime(selectedBooking.showtime?.startTime)}</span>
                </div>
                <div className="detail-row">
                  <span>Ghế:</span>
                  <span className="seats-list">
                    {selectedBooking.seats?.map(s => s.seatNumber).join(', ')}
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Thanh toán</h4>
                <div className="detail-row">
                  <span>Phương thức:</span>
                  <span>{selectedBooking.paymentMethod === 'momo' ? 'MoMo' : 'Tiền mặt'}</span>
                </div>
                <div className="detail-row">
                  <span>Trạng thái: </span>
                  <span className={`payment-status ${selectedBooking.paymentStatus}`}>
                    {getPaymentStatusText(selectedBooking.paymentStatus)}
                  </span>
                </div>
                <div className="detail-row total">
                  <span>Tổng tiền:</span>
                  <strong>{formatPrice(selectedBooking.totalPrice)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;