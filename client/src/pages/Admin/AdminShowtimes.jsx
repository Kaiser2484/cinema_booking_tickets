import { useState, useEffect } from 'react';
import { movieAPI, cinemaAPI, showtimeAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaTimes,
  FaSave,
  FaCalendarAlt,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaFilm,
  FaBuilding
} from 'react-icons/fa';
import './Admin.css';
import './AdminShowtimes.css';

const AdminShowtimes = () => {
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingShowtime, setEditingShowtime] = useState(null);
  
  // Filters
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterCinema, setFilterCinema] = useState('');
  const [filterMovie, setFilterMovie] = useState('');

  const [formData, setFormData] = useState({
    movie: '',
    cinema: '',
    room: '',
    startTime: '',
    endTime: '',
    priceStandard: 75000,
    priceVip: 95000,
    priceCouple: 160000
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (showtimes || currentDate) {
      // Force re-fetch when currentDate changes
      fetchShowtimes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate.getTime(), filterCinema, filterMovie]);

  useEffect(() => {
    if (formData.cinema) {
      fetchRooms(formData.cinema);
    }
  }, [formData.cinema]);

  // Tự động tính endTime khi chọn movie và startTime
  useEffect(() => {
    if (formData.movie && formData.startTime) {
      const selectedMovie = movies.find(m => m._id === formData.movie);
      if (selectedMovie) {
        const start = new Date(formData.startTime);
        const end = new Date(start.getTime() + (selectedMovie.duration + 15) * 60000); // +15 phút dọn dẹp
        setFormData(prev => ({
          ...prev,
          endTime: end.toISOString().slice(0, 16)
        }));
      }
    }
  }, [formData.movie, formData.startTime, movies]);

  const fetchInitialData = async () => {
    try {
      const [moviesRes, cinemasRes] = await Promise.all([
        movieAPI.getAll(),
        cinemaAPI.getAll()
      ]);
      setMovies(moviesRes.data.data);
      setCinemas(cinemasRes.data.data);
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const fetchShowtimes = async () => {
    try {
      const params = {};
      
      // Get date range based on view mode
      const dateRange = getDateRange();
      params.startDate = dateRange.start;
      params.endDate = dateRange.end;
      
      console.log('🔍 Fetching showtimes with params:', {
        startDate: params.startDate,
        endDate: params.endDate,
        cinema: filterCinema,
        movie: filterMovie,
        currentDate: currentDate.toISOString()
      });
      
      if (filterCinema) params.cinema = filterCinema;
      if (filterMovie) params.movie = filterMovie;
      
      const response = await showtimeAPI.getAll(params);
      console.log('✅ Received showtimes:', response.data.data.length);
      setShowtimes(response.data.data);
    } catch (error) {
      console.error('Error fetching showtimes:', error);
    }
  };

  const getDateRange = () => {
    const date = new Date(currentDate);
    
    // Lấy ngày theo local timezone, không bị ảnh hưởng bởi GMT
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    const dateString = `${year}-${month}-${day}`;
    
    console.log('📅 getDateRange - currentDate:', currentDate);
    console.log('📅 getDateRange - dateString:', dateString);

    return {
      start: dateString,
      end: dateString
    };
  };

  const groupShowtimesByDate = () => {
    const grouped = {};
    const now = new Date(); // Thời điểm hiện tại
    
    showtimes.forEach(showtime => {
      const showtimeStart = new Date(showtime.startTime);
      
      // Bỏ qua các suất chiếu đã qua
      if (showtimeStart < now) {
        return; // Skip suất chiếu này
      }
      
      const date = showtimeStart.toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(showtime);
    });

    // Sort showtimes within each date
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => 
        new Date(a.startTime) - new Date(b.startTime)
      );
    });

    return grouped;
  };

  const fetchRooms = async (cinemaId) => {
    try {
      const response = await cinemaAPI.getRooms(cinemaId);
      setRooms(response.data.data);
    } catch (error) {
      setRooms([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDatePickerChange = (e) => {
    const dateValue = e.target.value; // Format: YYYY-MM-DD
    console.log('📅 Date picker changed:', dateValue);
    
    // Tạo date object từ string với timezone local
    const [year, month, day] = dateValue.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day, 12, 0, 0, 0); // Set giờ 12h để tránh lỗi timezone
    
    console.log('📅 Selected Date Object:', selectedDate);
    console.log('📅 ISO String:', selectedDate.toISOString());
    
    setCurrentDate(selectedDate);
  };

  const resetForm = () => {
    setFormData({
      movie:  '',
      cinema:  '',
      room:  '',
      startTime: '',
      endTime: '',
      priceStandard: 75000,
      priceVip: 95000,
      priceCouple: 160000
    });
    setEditingShowtime(null);
    setRooms([]);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit'
    });
  };

  const openAddModal = () => {
    resetForm();
    // Set default date to today
    const today = new Date();
    today.setHours(today.getHours() + 1);
    today.setMinutes(0);
    setFormData(prev => ({
      ...prev,
      startTime: today.toISOString().slice(0, 16)
    }));
    setShowModal(true);
  };

  const openEditModal = async (showtime) => {
    setEditingShowtime(showtime);
    
    // Fetch rooms for the cinema
    if (showtime.cinema?._id) {
      await fetchRooms(showtime.cinema._id);
    }

    setFormData({
      movie: showtime.movie?._id || '',
      cinema: showtime.cinema?._id || '',
      room: showtime.room?._id || '',
      startTime: showtime.startTime?.slice(0, 16) || '',
      endTime: showtime.endTime?.slice(0, 16) || '',
      priceStandard: showtime.price?.standard || 75000,
      priceVip: showtime.price?.vip || 95000,
      priceCouple: showtime.price?.couple || 160000
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const showtimeData = {
      movie: formData.movie,
      cinema: formData.cinema,
      room: formData.room,
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString(),
      price: {
        standard: parseInt(formData.priceStandard),
        vip: parseInt(formData.priceVip),
        couple: parseInt(formData.priceCouple)
      }
    };

    try {
      if (editingShowtime) {
        await showtimeAPI.update(editingShowtime._id, showtimeData);
        toast.success('Cập nhật lịch chiếu thành công!');
      } else {
        await showtimeAPI.create(showtimeData);
        toast.success('Thêm lịch chiếu thành công!');
      }
      setShowModal(false);
      resetForm();
      fetchShowtimes();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra! ');
    }
  };

  const handleDelete = async (id) => {
    if (! window.confirm('Bạn có chắc muốn xóa lịch chiếu này?')) return;

    try {
      await showtimeAPI.delete(id);
      toast.success('Xóa lịch chiếu thành công!');
      fetchShowtimes();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Xóa thất bại!');
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  const groupedShowtimes = groupShowtimesByDate();

  return (
    <div className="admin-showtimes">
      <div className="page-header">
        <h2><FaCalendarAlt /> Quản lý lịch chiếu</h2>
        <button className="btn-add" onClick={openAddModal}>
          <FaPlus /> Thêm lịch chiếu
        </button>
      </div>

      {/* Filter Section - Redesigned */}
      <div className="filters-container">
        <div className="filters-header">
          <FaFilter className="filter-icon" />
          <h3>Bộ lọc tìm kiếm</h3>
        </div>
        
        <div className="filters-grid">
          <div className="filter-item">
            <label>
              <FaCalendarAlt className="label-icon" />
              Chọn ngày
            </label>
            <input
              type="date"
              className="filter-input"
              value={currentDate.toISOString().split('T')[0]}
              onChange={handleDatePickerChange}
            />
          </div>

          <div className="filter-item">
            <label>
              <FaFilm className="label-icon" />
              Chọn phim
            </label>
            <select 
              className="filter-select"
              value={filterMovie} 
              onChange={(e) => setFilterMovie(e.target.value)}
            >
              <option value="">-- Tất cả phim --</option>
              {movies.map(movie => (
                <option key={movie._id} value={movie._id}>
                  {movie.title}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>
              <FaBuilding className="label-icon" />
              Chọn rạp
            </label>
            <select 
              className="filter-select"
              value={filterCinema} 
              onChange={(e) => setFilterCinema(e.target.value)}
            >
              <option value="">-- Tất cả rạp --</option>
              {cinemas.map(cinema => (
                <option key={cinema._id} value={cinema._id}>
                  {cinema.name} - {cinema.city}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-actions">
            <button 
              className="btn-reset-filter"
              onClick={() => {
                setFilterMovie('');
                setFilterCinema('');
                setCurrentDate(new Date());
              }}
            >
              <FaTimes /> Xóa bộ lọc
            </button>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="filter-summary">
          <span className="summary-label">Đang hiển thị:</span>
          <div className="summary-tags">
            <span className="tag tag-date">
              {currentDate.toLocaleDateString('vi-VN', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric' 
              })}
            </span>
            {filterMovie && (
              <span className="tag tag-movie">
                {movies.find(m => m._id === filterMovie)?.title}
              </span>
            )}
            {filterCinema && (
              <span className="tag tag-cinema">
                {cinemas.find(c => c._id === filterCinema)?.name}
              </span>
            )}
            <span className="tag tag-count">
              {showtimes.length} suất chiếu
            </span>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <div className="showtime-calendar">
        {Object.keys(groupedShowtimes).length > 0 ? (
          Object.entries(groupedShowtimes).map(([date, dateShowtimes]) => (
            <div key={date} className="calendar-day-section">
              <div className="day-header">
                <h3>{formatDate(date)}</h3>
                <span className="showtime-count">{dateShowtimes.length} suất chiếu</span>
              </div>
              
              <div className="showtimes-grid">
                {dateShowtimes.map(showtime => (
                  <div key={showtime._id} className="showtime-card">
                    <div className="showtime-time">
                      <span className="time-start">{formatTime(showtime.startTime)}</span>
                      <span className="time-separator">→</span>
                      <span className="time-end">{formatTime(showtime.endTime)}</span>
                    </div>
                    
                    <div className="showtime-movie">
                      <img 
                        src={showtime.movie?.poster || 'https://via.placeholder.com/60x90'} 
                        alt={showtime.movie?.title}
                        className="showtime-poster"
                      />
                      <div className="movie-info">
                        <h4>{showtime.movie?.title || 'N/A'}</h4>
                        <span className="movie-duration">{showtime.movie?.duration} phút</span>
                      </div>
                    </div>

                    <div className="showtime-details">
                      <div className="detail-item">
                        <span className="label">Rạp:</span>
                        <span className="value">{showtime.cinema?.name}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Phòng:</span>
                        <span className={`room-badge type-${showtime.room?.type?.toLowerCase()}`}>
                          {showtime.room?.name} ({showtime.room?.type})
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Giá vé:</span>
                        <div className="price-list">
                          <span>Thường: {formatPrice(showtime.price?.standard)}</span>
                          <span>VIP: {formatPrice(showtime.price?.vip)}</span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <span className="label">Đã đặt:</span>
                        <span className="booked-info">
                          {showtime.bookedSeats?.length || 0}/{showtime.room?.totalSeats || 0}
                        </span>
                      </div>
                    </div>

                    <div className="showtime-actions">
                      <button 
                        className="btn-edit-small" 
                        onClick={() => openEditModal(showtime)}
                        title="Sửa"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="btn-delete-small" 
                        onClick={() => handleDelete(showtime._id)}
                        title="Xóa"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="no-data">
            Không có lịch chiếu nào trong khoảng thời gian này
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingShowtime ?  'Sửa Lịch Chiếu' : 'Thêm Lịch Chiếu Mới'}</h3>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Phim *</label>
                <select 
                  name="movie" 
                  value={formData.movie} 
                  onChange={handleChange} 
                  required
                >
                  <option value="">Chọn phim</option>
                  {movies.filter(m => m.status !== 'ended').map(movie => (
                    <option key={movie._id} value={movie._id}>
                      {movie.title} ({movie.duration} phút)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Rạp *</label>
                  <select 
                    name="cinema" 
                    value={formData.cinema} 
                    onChange={handleChange} 
                    required
                  >
                    <option value="">Chọn rạp</option>
                    {cinemas.map(cinema => (
                      <option key={cinema._id} value={cinema._id}>
                        {cinema.name} - {cinema.city}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Phòng chiếu *</label>
                  <select 
                    name="room" 
                    value={formData.room} 
                    onChange={handleChange} 
                    required
                    disabled={!formData.cinema}
                  >
                    <option value="">Chọn phòng</option>
                    {rooms.map(room => (
                      <option key={room._id} value={room._id}>
                        {room.name} - {room.type} ({room.totalSeats} ghế)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Giờ bắt đầu *</label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Giờ kết thúc *</label>
                  <input
                    type="datetime-local"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Giá ghế thường (VNĐ)</label>
                  <input
                    type="number"
                    name="priceStandard"
                    value={formData.priceStandard}
                    onChange={handleChange}
                    min="0"
                    step="1000"
                  />
                </div>
                <div className="form-group">
                  <label>Giá ghế VIP (VNĐ)</label>
                  <input
                    type="number"
                    name="priceVip"
                    value={formData.priceVip}
                    onChange={handleChange}
                    min="0"
                    step="1000"
                  />
                </div>
                <div className="form-group">
                  <label>Giá ghế đôi (VNĐ)</label>
                  <input
                    type="number"
                    name="priceCouple"
                    value={formData.priceCouple}
                    onChange={handleChange}
                    min="0"
                    step="1000"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn-save">
                  <FaSave /> {editingShowtime ?  'Cập nhật' : 'Thêm lịch chiếu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminShowtimes;