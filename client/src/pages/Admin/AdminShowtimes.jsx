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
  FaFilter
} from 'react-icons/fa';
import './Admin.css';

const AdminShowtimes = () => {
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingShowtime, setEditingShowtime] = useState(null);
  
  // Filters
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterCinema, setFilterCinema] = useState('');

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
    fetchShowtimes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterDate, filterCinema]);

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
      const params = { date: filterDate };
      if (filterCinema) params.cinema = filterCinema;
      
      const response = await showtimeAPI.getAll(params);
      setShowtimes(response.data.data);
    } catch (error) {
      console.error('Error fetching showtimes:', error);
    }
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

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2><FaCalendarAlt /> Quản Lý Lịch Chiếu</h2>
        <button className="btn-add" onClick={openAddModal}>
          <FaPlus /> Thêm Lịch Chiếu
        </button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="filter-group">
          <label><FaFilter /> Ngày: </label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Rạp:</label>
          <select 
            value={filterCinema} 
            onChange={(e) => setFilterCinema(e.target.value)}
          >
            <option value="">Tất cả rạp</option>
            {cinemas.map(cinema => (
              <option key={cinema._id} value={cinema._id}>
                {cinema.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Showtimes Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Phim</th>
              <th>Rạp</th>
              <th>Phòng</th>
              <th>Giờ chiếu</th>
              <th>Giá vé</th>
              <th>Đã đặt</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {showtimes.map(showtime => (
              <tr key={showtime._id}>
                <td>
                  <div className="movie-cell">
                    <img 
                      src={showtime.movie?.poster || 'https://via.placeholder.com/40x60'} 
                      alt={showtime.movie?.title}
                      className="mini-poster"
                    />
                    <div>
                      <strong>{showtime.movie?.title || 'N/A'}</strong>
                      <br />
                      <small>{showtime.movie?.duration} phút</small>
                    </div>
                  </div>
                </td>
                <td>{showtime.cinema?.name || 'N/A'}</td>
                <td>
                  <span className={`room-type type-${showtime.room?.type?.toLowerCase()}`}>
                    {showtime.room?.name} ({showtime.room?.type})
                  </span>
                </td>
                <td>
                  <strong>{formatTime(showtime.startTime)}</strong>
                  <span className="time-separator"> - </span>
                  {formatTime(showtime.endTime)}
                </td>
                <td>
                  <small>
                    Thường:  {formatPrice(showtime.price?.standard)}<br />
                    VIP: {formatPrice(showtime.price?.vip)}
                  </small>
                </td>
                <td>
                  <span className="booked-count">
                    {showtime.bookedSeats?.length || 0}/{showtime.room?.totalSeats || 0}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-edit" 
                      onClick={() => openEditModal(showtime)}
                      title="Sửa"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="btn-delete" 
                      onClick={() => handleDelete(showtime._id)}
                      title="Xóa"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showtimes.length === 0 && (
          <p className="no-data">Không có lịch chiếu nào cho ngày này</p>
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