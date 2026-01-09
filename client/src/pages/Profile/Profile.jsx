import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingAPI } from '../../services/api';
import Loading from '../../components/Loading/Loading';
import { toast } from 'react-toastify';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaTicketAlt, 
  FaEdit, 
  FaSave,
  FaTimes,
  FaCalendar,
  FaMapMarkerAlt
} from 'react-icons/fa';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });

  useEffect(() => {
    if (! isAuthenticated) {
      navigate('/login');
      return;
    }
    
    setFormData({
      name: user?.name || '',
      phone:  user?.phone || ''
    });
    
    fetchBookings();
  }, [isAuthenticated, user, navigate]);

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getMyBookings();
      setBookings(response.data.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      toast.success('Cập nhật thông tin thành công! ');
      setEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cập nhật thất bại! ');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (! window.confirm('Bạn có chắc muốn hủy vé này?')) return;

    try {
      await bookingAPI.cancel(bookingId);
      toast.success('Hủy vé thành công! ');
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Hủy vé thất bại!');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour:  '2-digit',
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
      confirmed:  'Đã xác nhận',
      cancelled:  'Đã hủy',
      completed: 'Hoàn thành'
    };
    return texts[status] || status;
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Sidebar */}
        <div className="profile-sidebar">
          <div className="user-avatar">
            <FaUser />
          </div>
          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
          
          <div className="sidebar-menu">
            <button
              className={`menu-item ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              <FaTicketAlt /> Lịch sử đặt vé
            </button>
            <button
              className={`menu-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <FaUser /> Thông tin cá nhân
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="profile-content">
          {activeTab === 'bookings' && (
            <div className="bookings-section">
              <h2><FaTicketAlt /> Lịch Sử Đặt Vé</h2>

              {bookings.length > 0 ? (
                <div className="bookings-list">
                  {bookings.map(booking => (
                    <div key={booking._id} className="booking-card">
                      <div className="booking-poster">
                        <img 
                          src={booking.showtime?.movie?.poster} 
                          alt={booking.showtime?.movie?.title}
                        />
                      </div>

                      <div className="booking-info">
                        <h3>{booking.showtime?.movie?.title}</h3>
                        
                        <div className="booking-details">
                          <p>
                            <FaMapMarkerAlt />
                            {booking.showtime?.cinema?.name}
                          </p>
                          <p>
                            <FaCalendar />
                            {formatDateTime(booking.showtime?.startTime)}
                          </p>
                          <p>
                            <FaTicketAlt />
                            Ghế: {booking.seats?.map(s => s.seatNumber).join(', ')}
                          </p>
                        </div>

                        <div className="booking-footer">
                          <span className="booking-code">
                            Mã:  {booking.bookingCode}
                          </span>
                          <span className="booking-price">
                            {formatPrice(booking.totalPrice)}
                          </span>
                        </div>
                      </div>

                      <div className="booking-status">
                        <span 
                          className="status-badge"
                          style={{ background: getStatusColor(booking.bookingStatus) }}
                        >
                          {getStatusText(booking.bookingStatus)}
                        </span>

                        {booking.bookingStatus === 'pending' && (
                          <button
                            className="btn-cancel"
                            onClick={() => handleCancelBooking(booking._id)}
                          >
                            <FaTimes /> Hủy vé
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-bookings">
                  <FaTicketAlt />
                  <p>Bạn chưa có lịch sử đặt vé nào</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="profile-section">
              <div className="section-header">
                <h2><FaUser /> Thông Tin Cá Nhân</h2>
                {! editing && (
                  <button className="btn-edit" onClick={() => setEditing(true)}>
                    <FaEdit /> Chỉnh sửa
                  </button>
                )}
              </div>

              <form onSubmit={handleUpdateProfile} className="profile-form">
                <div className="form-group">
                  <label><FaUser /> Họ và tên</label>
                  {editing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  ) : (
                    <p>{user?.name}</p>
                  )}
                </div>

                <div className="form-group">
                  <label><FaEnvelope /> Email</label>
                  <p>{user?.email}</p>
                  <small>Email không thể thay đổi</small>
                </div>

                <div className="form-group">
                  <label><FaPhone /> Số điện thoại</label>
                  {editing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  ) : (
                    <p>{user?.phone || 'Chưa cập nhật'}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Vai trò</label>
                  <p className="role-badge">
                    {user?.role === 'admin' ?  '👑 Admin' : '👤 Người dùng'}
                  </p>
                </div>

                {editing && (
                  <div className="form-actions">
                    <button type="submit" className="btn-save">
                      <FaSave /> Lưu thay đổi
                    </button>
                    <button 
                      type="button" 
                      className="btn-cancel-edit"
                      onClick={() => {
                        setEditing(false);
                        setFormData({
                          name: user?.name || '',
                          phone: user?.phone || ''
                        });
                      }}
                    >
                      <FaTimes /> Hủy
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;