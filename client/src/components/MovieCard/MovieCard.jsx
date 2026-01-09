import { Link } from 'react-router-dom';
import { FaClock, FaStar } from 'react-icons/fa';
import './MovieCard.css';

const MovieCard = ({ movie }) => {
  // Hình ảnh mặc định nếu không có poster
  const defaultPoster = 'https://via.placeholder.com/300x450? text=No+Image';

  return (
    <div className="movie-card">
      <div className="movie-poster">
        <img 
          src={movie.poster || defaultPoster} 
          alt={movie.title}
          onError={(e) => e.target.src = defaultPoster}
        />
        <div className="movie-overlay">
          <Link to={`/movies/${movie._id}`} className="btn-detail">
            Chi tiết
          </Link>
          <Link to={`/booking/${movie._id}`} className="btn-booking">
            Đặt vé
          </Link>
        </div>
        {movie.rated && (
          <span className={`movie-rated rated-${movie.rated}`}>
            {movie.rated}
          </span>
        )}
      </div>
      
      <div className="movie-info">
        <h3 className="movie-title">{movie.title}</h3>
        
        <div className="movie-meta">
          <span className="movie-duration">
            <FaClock /> {movie.duration} phút
          </span>
          {movie.rating > 0 && (
            <span className="movie-rating">
              <FaStar /> {movie.rating.toFixed(1)}
            </span>
          )}
        </div>

        <div className="movie-genres">
          {movie.genres?.slice(0, 2).map((genre, index) => (
            <span key={index} className="genre-tag">{genre}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;