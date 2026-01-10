import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { movieAPI, showtimeAPI } from '../../services/api';
import Loading from '../../components/Loading/Loading';
import { FaClock, FaStar, FaCalendar, FaTicketAlt, FaPlay } from 'react-icons/fa';
import './MovieDetail.css';

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    fetchMovieDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (movie) {
      fetchShowtimes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movie, selectedDate]);

  const fetchMovieDetail = async () => {
    try {
      const response = await movieAPI.getById(id);
      setMovie(response.data.data);
    } catch (error) {
      console.error('Error fetching movie:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchShowtimes = async () => {
    try {
      const response = await showtimeAPI.getByMovie(id, { date: selectedDate });
      setShowtimes(response.data.data);
    } catch (error) {
      console.error('Error fetching showtimes:', error);
    }
  };

  // Tạo danh sách 7 ngày tiếp theo
  const getNextDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push({
        value: date.toISOString().split('T')[0],
        label: i === 0 ?  'Hôm nay' : i === 1 ?  'Ngày mai' : 
          date.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })
      });
    }
    return days;
  };

  // Format giờ chiếu
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Lấy YouTube video ID từ URL
  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Nhóm suất chiếu theo rạp
  const groupShowtimesByCinema = () => {
    const grouped = {};
    showtimes.forEach(showtime => {
      const cinemaId = showtime.cinema._id;
      if (!grouped[cinemaId]) {
        grouped[cinemaId] = {
          cinema: showtime.cinema,
          showtimes: []
        };
      }
      grouped[cinemaId].showtimes.push(showtime);
    });
    return Object.values(grouped);
  };

  if (loading) {
    return <Loading />;
  }

  if (!movie) {
    return (
      <div className="not-found">
        <h2>Không tìm thấy phim</h2>
        <Link to="/movies">Quay lại danh sách phim</Link>
      </div>
    );
  }

  const defaultPoster = 'https://via.placeholder.com/400x600? text=No+Image';

  return (
    <div className="movie-detail-page">
      {/* Hero Banner */}
      <div className="movie-hero" style={{
        backgroundImage: `linear-gradient(to bottom, rgba(15,15,26,0.7), rgba(15,15,26,1)), 
                          url(${movie.poster || defaultPoster})`
      }}>
        <div className="movie-hero-content">
          <div className="movie-poster-wrapper">
            <img 
              src={movie.poster || defaultPoster} 
              alt={movie.title}
              onError={(e) => e.target.src = defaultPoster}
            />
            {movie.trailer && (
              <button 
                onClick={() => setShowTrailer(true)} 
                className="btn-trailer"
              >
                <FaPlay /> Xem Trailer
              </button>
            )}
          </div>

          <div className="movie-info-detail">
            <h1>{movie.title}</h1>
            
            <div className="movie-meta-detail">
              <span className="meta-item">
                <FaClock /> {movie.duration} phút
              </span>
              {movie.rating > 0 && (
                <span className="meta-item rating">
                  <FaStar /> {movie.rating.toFixed(1)}
                </span>
              )}
              <span className="meta-item">
                <FaCalendar /> {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}
              </span>
              {movie.rated && (
                <span className={`rated-badge rated-${movie.rated}`}>
                  {movie.rated}
                </span>
              )}
            </div>

            <div className="movie-genres-detail">
              {movie.genres?.map((genre, index) => (
                <span key={index} className="genre-badge">{genre}</span>
              ))}
            </div>

            <div className="movie-description">
              <h3>Nội dung phim</h3>
              <p>{movie.description || 'Chưa có mô tả'}</p>
            </div>

            <div className="movie-extra-info">
              {movie.director && (
                <p><strong>Đạo diễn: </strong> {movie.director}</p>
              )}
              {movie.cast?.length > 0 && (
                <p><strong>Diễn viên: </strong> {movie.cast.join(', ')}</p>
              )}
              {movie.language && (
                <p><strong>Ngôn ngữ:</strong> {movie.language}</p>
              )}
            </div>

            <Link to={`/booking/${movie._id}`} className="btn-book-now">
              <FaTicketAlt /> Đặt Vé Ngay
            </Link>
          </div>
        </div>
      </div>

      {/* Showtimes Section */}
      <div className="showtimes-section">
        <div className="showtimes-container">
          <h2>🎬 Lịch Chiếu</h2>

          {/* Date Selector */}
          <div className="date-selector">
            {getNextDays().map(day => (
              <button
                key={day.value}
                className={`date-btn ${selectedDate === day.value ? 'active' : ''}`}
                onClick={() => setSelectedDate(day.value)}
              >
                {day.label}
              </button>
            ))}
          </div>

          {/* Showtimes by Cinema */}
          <div className="showtimes-list">
            {groupShowtimesByCinema().length > 0 ? (
              groupShowtimesByCinema().map(group => (
                <div key={group.cinema._id} className="cinema-showtimes">
                  <div className="cinema-info">
                    <h3>{group.cinema.name}</h3>
                    <p>{group.cinema.address}</p>
                  </div>
                  <div className="showtime-buttons">
                    {group.showtimes.map(showtime => (
                      <Link
                        key={showtime._id}
                        to={`/booking/${movie._id}?showtime=${showtime._id}`}
                        className="showtime-btn"
                      >
                        <span className="time">{formatTime(showtime.startTime)}</span>
                        <span className="room">{showtime.room?.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-showtimes">
                <p>Chưa có suất chiếu cho ngày này</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailer && movie.trailer && (
        <div className="trailer-modal-overlay" onClick={() => setShowTrailer(false)}>
          <div className="trailer-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="trailer-close-btn" onClick={() => setShowTrailer(false)}>
              ✕
            </button>
            <div className="trailer-wrapper">
              <iframe
                src={`https://www.youtube.com/embed/${getYouTubeId(movie.trailer)}?autoplay=1`}
                title="Movie Trailer"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetail;