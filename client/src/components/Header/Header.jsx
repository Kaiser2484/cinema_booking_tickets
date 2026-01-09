import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaSignOutAlt, FaTicketAlt, FaCog } from 'react-icons/fa';
import './Header.css';

const Header = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="logo">
          <FaTicketAlt className="logo-icon" />
          <span>CineBook</span>
        </Link>

        {/* Navigation */}
        <nav className="nav">
          <Link to="/" className="nav-link">Trang chủ</Link>
          <Link to="/movies" className="nav-link">Phim</Link>
          <Link to="/cinemas" className="nav-link">Rạp</Link>
        </nav>

        {/* Auth */}
        <div className="auth-buttons">
          {isAuthenticated ? (
            <div className="user-menu">
              {isAdmin && (
                <Link to="/admin" className="btn-admin">
                  <FaCog />
                  <span>Quản trị</span>
                </Link>
              )}
              <Link to="/profile" className="user-info">
                <FaUser />
                <span>{user?.name}</span>
              </Link>
              <button onClick={handleLogout} className="btn-logout">
                <FaSignOutAlt />
                <span>Đăng xuất</span>
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-login">Đăng nhập</Link>
              <Link to="/register" className="btn-register">Đăng ký</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;