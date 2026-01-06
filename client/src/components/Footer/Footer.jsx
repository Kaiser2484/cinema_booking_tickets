import { FaFacebook, FaInstagram, FaYoutube, FaPhone, FaEnvelope } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>CineBook</h3>
          <p>Hệ thống đặt vé xem phim trực tuyến hàng đầu Việt Nam</p>
          <div className="social-links">
            <a href="#"><FaFacebook /></a>
            <a href="#"><FaInstagram /></a>
            <a href="#"><FaYoutube /></a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Liên kết</h4>
          <ul>
            <li><a href="/">Trang chủ</a></li>
            <li><a href="/movies">Phim</a></li>
            <li><a href="/cinemas">Rạp</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Hỗ trợ</h4>
          <ul>
            <li><a href="#">Hướng dẫn đặt vé</a></li>
            <li><a href="#">Chính sách bảo mật</a></li>
            <li><a href="#">Điều khoản sử dụng</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Liên hệ</h4>
          <p><FaPhone /> 1900 6017</p>
          <p><FaEnvelope /> support@cinebook.vn</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 CineBook. Made with ❤️ by Kaiser2484</p>
      </div>
    </footer>
  );
};

export default Footer;