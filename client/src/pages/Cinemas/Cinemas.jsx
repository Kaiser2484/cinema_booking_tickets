import { useState, useEffect, useCallback } from 'react';
import { cinemaAPI } from '../../services/api';
import Loading from '../../components/Loading/Loading';
import { FaMapMarkerAlt, FaPhone, FaFilm, FaParking, FaUtensils, FaStar } from 'react-icons/fa';
import './Cinemas.css';

const Cinemas = () => {
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('');

  const cities = [
    'Tất cả',
    'Hà Nội',
    'Hồ Chí Minh',
    'Đà Nẵng',
    'Hải Phòng',
    'Cần Thơ',
    'Biên Hòa',
    'Nha Trang',
    'Huế',
    'Vũng Tàu'
  ];

  const fetchCinemas = useCallback(async () => {
    setLoading(true);
    try {
      const params = selectedCity && selectedCity !== 'Tất cả' 
        ? { city: selectedCity } 
        : {};
      const response = await cinemaAPI.getAll(params);
      setCinemas(response.data.data);
    } catch (error) {
      console.error('Error fetching cinemas:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCity]);

  useEffect(() => {
    fetchCinemas();
  }, [fetchCinemas]);

  const getFacilityIcon = (facility) => {
    const icons = {
      'Bãi đỗ xe': <FaParking />,
      'Đồ ăn': <FaUtensils />,
      'IMAX': <FaStar />,
      '4DX': <FaStar />,
      'Dolby Atmos':  <FaStar />,
      'Phòng chờ VIP': <FaStar />
    };
    return icons[facility] || <FaStar />;
  };

  return (
    <div className="cinemas-page">
      <div className="cinemas-container">
        {/* Header */}
        <div className="cinemas-header">
          <h1><FaFilm /> Hệ Thống Rạp</h1>
          <p>Tìm rạp phim gần bạn nhất</p>
        </div>

        {/* City Filter */}
        <div className="city-filter">
          {cities.map(city => (
            <button
              key={city}
              className={`city-btn ${(selectedCity === city || (! selectedCity && city === 'Tất cả')) ? 'active' : ''}`}
              onClick={() => setSelectedCity(city === 'Tất cả' ? '' : city)}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Cinemas List */}
        {loading ? (
          <Loading />
        ) : cinemas.length > 0 ? (
          <div className="cinemas-grid">
            {cinemas.map(cinema => (
              <div key={cinema._id} className="cinema-card">
                <div className="cinema-image">
                  {cinema.image ? (
                    <img src={cinema.image} alt={cinema.name} />
                  ) : (
                    <div className="cinema-placeholder">
                      <FaFilm />
                    </div>
                  )}
                  <span className="cinema-city">{cinema.city}</span>
                </div>

                <div className="cinema-info">
                  <h3>{cinema.name}</h3>
                  
                  <div className="cinema-details">
                    <p className="cinema-address">
                      <FaMapMarkerAlt />
                      {cinema.address}
                    </p>
                    
                    {cinema.phone && (
                      <p className="cinema-phone">
                        <FaPhone />
                        {cinema.phone}
                      </p>
                    )}
                  </div>

                  {cinema.facilities?.length > 0 && (
                    <div className="cinema-facilities">
                      {cinema.facilities.map((facility, index) => (
                        <span key={index} className="facility-tag">
                          {getFacilityIcon(facility)}
                          {facility}
                        </span>
                      ))}
                    </div>
                  )}

                  {cinema.rooms?.length > 0 && (
                    <div className="cinema-rooms">
                      <span>{cinema.rooms.length} phòng chiếu</span>
                    </div>
                  )}

                  {cinema.description && (
                    <p className="cinema-description">{cinema.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-cinemas">
            <FaFilm />
            <p>Không tìm thấy rạp nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cinemas;