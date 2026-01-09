import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { movieAPI, cinemaAPI, bookingAPI } from '../../services/api';
import { 
  FaFilm, 
  FaBuilding, 
  FaTicketAlt, 
  FaMoneyBillWave,
  FaChartLine
} from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalCinemas: 0,
    totalBookings: 0,
    totalRevenue: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [moviesRes, cinemasRes, bookingsRes] = await Promise.all([
        movieAPI.getAll(),
        cinemaAPI.getAll(),
        bookingAPI.getAll()
      ]);

      const bookings = bookingsRes.data.data || [];
      const totalRevenue = bookings.reduce((sum, b) => {
        if (b.bookingStatus !== 'cancelled') {
          return sum + (b.totalPrice || 0);
        }
        return sum;
      }, 0);

      setStats({
        totalMovies: moviesRes.data.count || 0,
        totalCinemas: cinemasRes.data.count || 0,
        totalBookings: bookings.length,
        totalRevenue
      });

      setRecentBookings(bookings.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
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

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="dashboard">
      <h2>📊 Tổng Quan</h2>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon movies">
            <FaFilm />
          </div>
          <div className="stat-info">
            <h3>{stats.totalMovies}</h3>
            <p>Tổng số phim</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon cinemas">
            <FaBuilding />
          </div>
          <div className="stat-info">
            <h3>{stats.totalCinemas}</h3>
            <p>Rạp chiếu phim</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bookings">
            <FaTicketAlt />
          </div>
          <div className="stat-info">
            <h3>{stats.totalBookings}</h3>
            <p>Tổng đặt vé</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue">
            <FaMoneyBillWave />
          </div>
          <div className="stat-info">
            <h3>{formatPrice(stats.totalRevenue)}</h3>
            <p>Doanh thu</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>⚡ Thao Tác Nhanh</h3>
        <div className="actions-grid">
          <Link to="/admin/movies" className="action-btn">
            <FaFilm /> Thêm Phim Mới
          </Link>
          <Link to="/admin/showtimes" className="action-btn">
            <FaChartLine /> Tạo Lịch Chiếu
          </Link>
          <Link to="/admin/cinemas" className="action-btn">
            <FaBuilding /> Quản Lý Rạp
          </Link>
          <Link to="/admin/bookings" className="action-btn">
            <FaTicketAlt /> Xem Đặt Vé
          </Link>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="recent-section">
        <div className="section-header">
          <h3>🎫 Đặt Vé Gần Đây</h3>
          <Link to="/admin/bookings" className="view-all">Xem tất cả</Link>
        </div>

        {recentBookings.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã vé</th>
                <th>Khách hàng</th>
                <th>Phim</th>
                <th>Số ghế</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Ngày đặt</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map(booking => (
                <tr key={booking._id}>
                  <td><strong>{booking.bookingCode}</strong></td>
                  <td>{booking.user?.name || 'N/A'}</td>
                  <td>{booking.showtime?.movie?.title || 'N/A'}</td>
                  <td>{booking.totalSeats} ghế</td>
                  <td className="price">{formatPrice(booking.totalPrice)}</td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ background: getStatusColor(booking.bookingStatus) }}
                    >
                      {getStatusText(booking.bookingStatus)}
                    </span>
                  </td>
                  <td>{formatDate(booking.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-data">Chưa có đặt vé nào</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;