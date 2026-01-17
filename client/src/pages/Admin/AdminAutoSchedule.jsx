import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { showtimeAPI, movieAPI, cinemaAPI } from '../../services/api';
import { FaCalendarAlt, FaFilm, FaTheaterMasks, FaClock, FaMagic, FaTrash, FaChartLine } from 'react-icons/fa';
import '../Admin/Admin.css';

const AdminAutoSchedule = () => {
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [selectedCinema, setSelectedCinema] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [breakTime, setBreakTime] = useState(15);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleResult, setScheduleResult] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [moviesRes, cinemasRes] = await Promise.all([
        movieAPI.getAll({ status: 'now_showing' }),
        cinemaAPI.getAll()
      ]);

      setMovies(moviesRes.data.data || []);
      setCinemas(cinemasRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Lỗi khi tải dữ liệu');
    }
  };

  const handleMovieToggle = (movieId) => {
    if (selectedMovies.includes(movieId)) {
      setSelectedMovies(selectedMovies.filter(id => id !== movieId));
    } else {
      setSelectedMovies([...selectedMovies, movieId]);
    }
  };

  const handleSelectAllMovies = () => {
    if (selectedMovies.length === movies.length) {
      setSelectedMovies([]);
    } else {
      setSelectedMovies(movies.map(m => m._id));
    }
  };

  const handleAutoSchedule = async () => {
    if (selectedMovies.length === 0) {
      toast.warning('Vui lòng chọn ít nhất 1 phim');
      return;
    }

    if (!selectedCinema) {
      toast.warning('Vui lòng chọn rạp chiếu');
      return;
    }

    if (!startDate || !endDate) {
      toast.warning('Vui lòng chọn khoảng thời gian');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.warning('Ngày bắt đầu phải trước ngày kết thúc');
      return;
    }

    try {
      setIsScheduling(true);
      const response = await showtimeAPI.autoSchedule({
        movieIds: selectedMovies,
        cinemaId: selectedCinema,
        startDate,
        endDate,
        breakTime: parseInt(breakTime)
      });

      setScheduleResult(response.data.data);
      toast.success(response.data.message);
    } catch (error) {
      console.error('Auto schedule error:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi tạo lịch chiếu tự động');
    } finally {
      setIsScheduling(false);
    }
  };

  const handleClearRange = async () => {
    if (!selectedCinema || !startDate || !endDate) {
      toast.warning('Vui lòng chọn rạp và khoảng thời gian');
      return;
    }

    if (!window.confirm('Bạn có chắc chắn muốn xóa tất cả lịch chiếu trong khoảng thời gian này?')) {
      return;
    }

    try {
      const response = await showtimeAPI.clearRange({
        cinemaId: selectedCinema,
        startDate,
        endDate
      });

      toast.success(response.data.message);
      setScheduleResult(null);
    } catch (error) {
      console.error('Clear range error:', error);
      toast.error('Lỗi khi xóa lịch chiếu');
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>
          <FaMagic /> Tự Động Sắp Xếp Lịch Chiếu
        </h1>
        <p>Tự động tạo lịch chiếu thông minh dựa trên độ ưu tiên phim</p>
      </div>

      <div className="auto-schedule-grid">
        {/* Configuration Panel */}
        <div className="schedule-config-panel">
          <div className="config-section">
            <h3><FaTheaterMasks /> Chọn Rạp Chiếu</h3>
            <select
              className="form-input"
              value={selectedCinema}
              onChange={(e) => setSelectedCinema(e.target.value)}
            >
              <option value="">-- Chọn rạp --</option>
              {cinemas.map(cinema => (
                <option key={cinema._id} value={cinema._id}>
                  {cinema.name} - {cinema.address}
                </option>
              ))}
            </select>
          </div>

          <div className="config-section">
            <h3><FaCalendarAlt /> Khoảng Thời Gian</h3>
            <div className="date-range">
              <div className="form-group">
                <label>Từ ngày</label>
                <input
                  type="date"
                  className="form-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Đến ngày</label>
                <input
                  type="date"
                  className="form-input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="config-section">
            <h3><FaClock /> Cài Đặt Thời Gian</h3>
            <div className="form-group">
              <label>Thời gian nghỉ giữa 2 phim</label>
              <select
                className="form-input"
                value={breakTime}
                onChange={(e) => setBreakTime(e.target.value)}
              >
                <option value="10">10 phút</option>
                <option value="15">15 phút</option>
                <option value="20">20 phút</option>
                <option value="30">30 phút</option>
              </select>
            </div>
          </div>

          <div className="action-buttons">
            <button
              className="btn btn-primary"
              onClick={handleAutoSchedule}
              disabled={isScheduling}
            >
              <FaMagic />
              {isScheduling ? 'Đang tạo...' : 'Tạo Lịch Tự Động'}
            </button>
            <button
              className="btn btn-danger"
              onClick={handleClearRange}
            >
              <FaTrash />
              Xóa Lịch Trong Khoảng
            </button>
          </div>
        </div>

        {/* Movie Selection */}
        <div className="movie-selection-panel">
          <div className="panel-header">
            <h3><FaFilm /> Chọn Phim ({selectedMovies.length}/{movies.length})</h3>
            <button className="btn-select-all" onClick={handleSelectAllMovies}>
              {selectedMovies.length === movies.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </button>
          </div>

          <div className="movie-list">
            {movies.length === 0 ? (
              <div className="no-data">
                <p>Không có phim đang chiếu</p>
              </div>
            ) : (
              movies.map(movie => (
                <div
                  key={movie._id}
                  className={`movie-item ${selectedMovies.includes(movie._id) ? 'selected' : ''}`}
                  onClick={() => handleMovieToggle(movie._id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedMovies.includes(movie._id)}
                    onChange={() => {}}
                  />
                  <img src={movie.poster} alt={movie.title} className="movie-thumb" />
                  <div className="movie-info">
                    <h4>{movie.title}</h4>
                    <p>
                      <FaClock /> {movie.duration} phút
                      {movie.isFeatured && <span className="featured-badge">⭐ Nổi bật</span>}
                    </p>
                    <div className="movie-genres">
                      {movie.genres.slice(0, 2).map((genre, idx) => (
                        <span key={idx} className="genre-tag">{genre}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Result Panel */}
      {scheduleResult && (
        <div className="schedule-result">
          <h3><FaChartLine /> Kết Quả Sắp Xếp</h3>
          <div className="result-stats">
            <div className="stat-card">
              <h4>{scheduleResult.totalShowtimes}</h4>
              <p>Suất chiếu đã tạo</p>
            </div>
            <div className="stat-card">
              <h4>{scheduleResult.rooms}</h4>
              <p>Phòng chiếu</p>
            </div>
            <div className="stat-card">
              <h4>{selectedMovies.length}</h4>
              <p>Phim được sắp xếp</p>
            </div>
          </div>

          <div className="priority-table">
            <h4>Độ Ưu Tiên Phim (Từ cao đến thấp)</h4>
            <table className="data-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên Phim</th>
                  <th>Tỷ Lệ (%)</th>
                  <th>Doanh Số</th>
                  <th>Số Booking</th>
                </tr>
              </thead>
              <tbody>
                {scheduleResult.moviePriority.map((movie, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td><strong>{movie.title}</strong></td>
                    <td>
                      <span className="priority-badge">{movie.percentage}%</span>
                    </td>
                    <td>{movie.revenue.toLocaleString('vi-VN')} đ</td>
                    <td>{movie.bookings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAutoSchedule;
