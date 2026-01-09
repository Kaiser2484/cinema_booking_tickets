import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FaFilm, 
  FaBuilding, 
  FaDoorOpen,
  FaCalendarAlt,
  FaTicketAlt,
  FaChartBar,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaArrowLeft
} from 'react-icons/fa';
import './AdminLayout.css';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/admin', icon: <FaChartBar />, label: 'Tổng quan', exact: true },
    { path: '/admin/movies', icon:  <FaFilm />, label: 'Quản lý Phim' },
    { path: '/admin/cinemas', icon: <FaBuilding />, label: 'Quản lý Rạp' },
    { path: '/admin/rooms', icon: <FaDoorOpen />, label: 'Quản lý Phòng' },
    { path: '/admin/showtimes', icon:  <FaCalendarAlt />, label: 'Lịch Chiếu' },
    { path: '/admin/bookings', icon: <FaTicketAlt />, label: 'Đặt Vé' },
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={`admin-layout ${sidebarOpen ?  '' : 'sidebar-collapsed'}`}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <Link to="/admin" className="admin-logo">
            <FaFilm />
            {sidebarOpen && <span>CineBook Admin</span>}
          </Link>
          <button 
            className="toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path, item.exact) ? 'active' :  ''}`}
            >
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link to="/" className="nav-item back-home">
            <FaArrowLeft />
            {sidebarOpen && <span>Về trang chủ</span>}
          </Link>
          <button onClick={handleLogout} className="nav-item logout-btn">
            <FaSignOutAlt />
            {sidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <h1>Admin Dashboard</h1>
          <div className="admin-user">
            <span>👋 Xin chào, <strong>{user?.name}</strong></span>
          </div>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;