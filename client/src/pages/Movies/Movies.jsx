import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { movieAPI } from '../../services/api';
import MovieCard from '../../components/MovieCard/MovieCard';
import Loading from '../../components/Loading/Loading';
import { FaFilm, FaSearch } from 'react-icons/fa';
import './Movies.css';

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('status') || 'now_showing');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMovies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      let response;
      if (activeTab === 'now_showing') {
        response = await movieAPI.getNowShowing();
      } else if (activeTab === 'coming_soon') {
        response = await movieAPI.getComingSoon();
      } else {
        response = await movieAPI.getAll();
      }
      setMovies(response.data.data);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ status: tab });
  };

  // Lọc phim theo search
  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="movies-page">
      <div className="movies-container">
        {/* Header */}
        <div className="movies-header">
          <h1><FaFilm /> Danh Sách Phim</h1>
          
          {/* Search */}
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm phim..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="movies-tabs">
          <button
            className={`tab-btn ${activeTab === 'now_showing' ? 'active' : ''}`}
            onClick={() => handleTabChange('now_showing')}
          >
            🎬 Đang Chiếu
          </button>
          <button
            className={`tab-btn ${activeTab === 'coming_soon' ?  'active' :  ''}`}
            onClick={() => handleTabChange('coming_soon')}
          >
            🎥 Sắp Chiếu
          </button>
          <button
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => handleTabChange('all')}
          >
            📽️ Tất Cả
          </button>
        </div>

        {/* Movies Grid */}
        {loading ? (
          <Loading />
        ) : filteredMovies.length > 0 ? (
          <div className="movies-grid">
            {filteredMovies.map(movie => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="no-movies">
            <p>Không tìm thấy phim nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Movies;