import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { movieAPI } from '../../services/api';
import MovieCard from '../../components/MovieCard/MovieCard';
import Loading from '../../components/Loading/Loading';
import { FaPlay, FaArrowRight } from 'react-icons/fa';
import './Home.css';

const Home = () => {
  const [nowShowing, setNowShowing] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const [nowShowingRes, comingSoonRes] = await Promise.all([
        movieAPI.getNowShowing(),
        movieAPI.getComingSoon()
      ]);
      setNowShowing(nowShowingRes.data.data);
      setComingSoon(comingSoonRes.data.data);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Đặt Vé Xem Phim Online</h1>
          <p>Trải nghiệm đặt vé nhanh chóng, tiện lợi với hàng ngàn suất chiếu mỗi ngày</p>
          <div className="hero-buttons">
            <Link to="/movies" className="btn-primary">
              <FaPlay /> Xem Phim Ngay
            </Link>
          </div>
        </div>
        <div className="hero-overlay"></div>
      </section>

      {/* Now Showing Section */}
      <section className="movie-section">
        <div className="section-header">
          <h2>🎬 Phim Đang Chiếu</h2>
          <Link to="/movies? status=now_showing" className="view-all">
            Xem tất cả <FaArrowRight />
          </Link>
        </div>
        
        {nowShowing.length > 0 ?  (
          <div className="movie-grid">
            {nowShowing.slice(0, 8).map(movie => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        ) : (
          <p className="no-movies">Chưa có phim đang chiếu</p>
        )}
      </section>

      {/* Coming Soon Section */}
      <section className="movie-section">
        <div className="section-header">
          <h2>🎥 Phim Sắp Chiếu</h2>
          <Link to="/movies?status=coming_soon" className="view-all">
            Xem tất cả <FaArrowRight />
          </Link>
        </div>

        {comingSoon.length > 0 ? (
          <div className="movie-grid">
            {comingSoon.slice(0, 4).map(movie => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        ) : (
          <p className="no-movies">Chưa có phim sắp chiếu</p>
        )}
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Tại Sao Chọn CineBook? </h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎫</div>
            <h3>Đặt Vé Dễ Dàng</h3>
            <p>Chỉ với vài click, bạn đã có vé xem phim trong tay</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💺</div>
            <h3>Chọn Ghế Thoải Mái</h3>
            <p>Xem sơ đồ ghế và chọn vị trí yêu thích</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎁</div>
            <h3>Ưu Đãi Hấp Dẫn</h3>
            <p>Nhiều khuyến mãi và combo hấp dẫn</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Tích Điểm Thưởng</h3>
            <p>Đặt vé càng nhiều, ưu đãi càng lớn</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;