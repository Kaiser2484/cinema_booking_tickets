import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { movieAPI, showtimeAPI, bookingAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/Loading/Loading';
import { toast } from 'react-toastify';
import { FaTicketAlt, FaClock } from 'react-icons/fa';
import './Booking.css';

const Booking = () => {
  const { id:  movieId } = useParams();
  const [searchParams] = useSearchParams();
  const showtimeId = searchParams.get('showtime');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [movie, setMovie] = useState(null);
  const [showtime, setShowtime] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [selectedShowtime, setSelectedShowtime] = useState(showtimeId || '');
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  const fetchMovie = useCallback(async () => {
    try {
      const response = await movieAPI.getById(movieId);
      setMovie(response.data.data);
    } catch (error) {
      console.error('Error fetching movie:', error);
      toast.error('Không tìm thấy phim');
    } finally {
      setLoading(false);
    }
  }, [movieId]);

  const fetchShowtimes = useCallback(async () => {
    try {
      const response = await showtimeAPI.getByMovie(movieId, { date: selectedDate });
      setShowtimes(response.data.data);
    } catch (error) {
      console.error('Error fetching showtimes:', error);
    }
  }, [movieId, selectedDate]);

  const fetchShowtimeDetail = useCallback(async () => {
    try {
      const response = await showtimeAPI.getById(selectedShowtime);
      setShowtime(response.data.data);
      setSelectedSeats([]);
    } catch (error) {
      console.error('Error fetching showtime:', error);
    }
  }, [selectedShowtime]);

  useEffect(() => {
    fetchMovie();
  }, [fetchMovie]);

  useEffect(() => {
    if (movieId) {
      fetchShowtimes();
    }
  }, [movieId, fetchShowtimes]);

  useEffect(() => {
    if (selectedShowtime) {
      fetchShowtimeDetail();
    }
  }, [selectedShowtime, fetchShowtimeDetail]);

  // Tạo danh sách 7 ngày tiếp theo
  const getNextDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push({
        value: date.toISOString().split('T')[0],
        label: i === 0 ? 'Hôm nay' : i === 1 ?  'Ngày mai' : 
          date.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })
      });
    }
    return days;
  };

  // Tạo sơ đồ ghế
  const generateSeats = () => {
    if (!showtime?.room) return [];

    const { rows, seatsPerRow, vipRows = [], coupleRows = [] } = showtime.room;
    const seats = [];

    for (let i = 0; i < rows; i++) {
      const rowLabel = String.fromCharCode(65 + i); // A, B, C, ...
      const rowSeats = [];

      for (let j = 1; j <= seatsPerRow; j++) {
        const seatNumber = `${rowLabel}${j}`;
        let seatType = 'standard';

        if (vipRows.includes(rowLabel)) {
          seatType = 'vip';
        } else if (coupleRows.includes(rowLabel)) {
          seatType = 'couple';
        }

        const isBooked = showtime.bookedSeats?.includes(seatNumber);
        const isSelected = selectedSeats.some(s => s.seatNumber === seatNumber);

        rowSeats.push({
          seatNumber,
          seatType,
          isBooked,
          isSelected
        });
      }

      seats.push({
        rowLabel,
        seats: rowSeats
      });
    }

    return seats;
  };

  // Xử lý chọn ghế
  const handleSeatClick = (seat) => {
    if (seat.isBooked) return;

    const isSelected = selectedSeats.some(s => s.seatNumber === seat.seatNumber);

    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(s => s.seatNumber !== seat.seatNumber));
    } else {
      if (selectedSeats.length >= 8) {
        toast.warning('Chỉ được chọn tối đa 8 ghế! ');
        return;
      }
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  // Tính giá vé
  const calculatePrice = () => {
    if (!showtime) return 0;

    return selectedSeats.reduce((total, seat) => {
      const price = showtime.price[seat.seatType] || showtime.price.standard;
      return total + price;
    }, 0);
  };

  // Format tiền VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Format giờ
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Xử lý đặt vé
  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để đặt vé!');
      navigate('/login');
      return;
    }

    if (selectedSeats.length === 0) {
      toast.error('Vui lòng chọn ghế! ');
      return;
    }

    setBooking(true);

    try {
      const response = await bookingAPI.create({
        showtime:  selectedShowtime,
        seats: selectedSeats.map(s => ({ seatNumber: s.seatNumber })),
        paymentMethod: 'cash'
      });

      toast.success('Đặt vé thành công!');
      navigate(`/booking/success/${response.data.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đặt vé thất bại! ');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!movie) {
    return (
      <div className="not-found">
        <h2>Không tìm thấy phim</h2>
      </div>
    );
  }

  const seatMap = generateSeats();

  return (
    <div className="booking-page">
      <div className="booking-container">
        {/* Movie Info */}
        <div className="booking-movie-info">
          <img src={movie.poster} alt={movie.title} />
          <div className="movie-details">
            <h1>{movie.title}</h1>
            <p><FaClock /> {movie.duration} phút • {movie.rated}</p>
          </div>
        </div>

        {/* Date Selection */}
        <div className="booking-section">
          <h2>📅 Chọn Ngày</h2>
          <div className="date-selector">
            {getNextDays().map(day => (
              <button
                key={day.value}
                className={`date-btn ${selectedDate === day.value ? 'active' : ''}`}
                onClick={() => {
                  setSelectedDate(day.value);
                  setSelectedShowtime('');
                  setShowtime(null);
                }}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        {/* Showtime Selection */}
        <div className="booking-section">
          <h2>🕐 Chọn Suất Chiếu</h2>
          {showtimes.length > 0 ? (
            <div className="showtime-grid">
              {showtimes.map(st => (
                <button
                  key={st._id}
                  className={`showtime-btn ${selectedShowtime === st._id ? 'active' : ''}`}
                  onClick={() => setSelectedShowtime(st._id)}
                >
                  <span className="time">{formatTime(st.startTime)}</span>
                  <span className="cinema">{st.cinema?.name}</span>
                  <span className="room">{st.room?.name} • {st.room?.type}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="no-data">Chưa có suất chiếu cho ngày này</p>
          )}
        </div>

        {/* Seat Selection */}
        {showtime && (
          <div className="booking-section">
            <h2>💺 Chọn Ghế</h2>

            {/* Screen */}
            <div className="screen-container">
              <div className="screen">MÀN HÌNH</div>
            </div>

            {/* Seat Map */}
            <div className="seat-map">
              {seatMap.map(row => (
                <div key={row.rowLabel} className="seat-row">
                  <span className="row-label">{row.rowLabel}</span>
                  <div className="seats">
                    {row.seats.map(seat => (
                      <button
                        key={seat.seatNumber}
                        className={`seat ${seat.seatType} ${seat.isBooked ? 'booked' : ''} ${seat.isSelected ? 'selected' : ''}`}
                        onClick={() => handleSeatClick(seat)}
                        disabled={seat.isBooked}
                        title={seat.seatNumber}
                      >
                        {seat.seatNumber.slice(1)}
                      </button>
                    ))}
                  </div>
                  <span className="row-label">{row.rowLabel}</span>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="seat-legend">
              <div className="legend-item">
                <span className="seat-demo standard"></span>
                <span>Ghế thường - {formatPrice(showtime.price?.standard || 75000)}</span>
              </div>
              <div className="legend-item">
                <span className="seat-demo vip"></span>
                <span>Ghế VIP - {formatPrice(showtime.price?.vip || 95000)}</span>
              </div>
              <div className="legend-item">
                <span className="seat-demo couple"></span>
                <span>Ghế đôi - {formatPrice(showtime.price?.couple || 160000)}</span>
              </div>
              <div className="legend-item">
                <span className="seat-demo selected"></span>
                <span>Đang chọn</span>
              </div>
              <div className="legend-item">
                <span className="seat-demo booked"></span>
                <span>Đã đặt</span>
              </div>
            </div>
          </div>
        )}

        {/* Booking Summary */}
        {selectedSeats.length > 0 && (
          <div className="booking-summary">
            <div className="summary-info">
              <div className="summary-row">
                <span>Phim:</span>
                <strong>{movie.title}</strong>
              </div>
              <div className="summary-row">
                <span>Rạp:</span>
                <strong>{showtime?.cinema?.name}</strong>
              </div>
              <div className="summary-row">
                <span>Suất chiếu:</span>
                <strong>
                  {formatTime(showtime?.startTime)} - {new Date(showtime?.startTime).toLocaleDateString('vi-VN')}
                </strong>
              </div>
              <div className="summary-row">
                <span>Phòng:</span>
                <strong>{showtime?.room?.name}</strong>
              </div>
              <div className="summary-row">
                <span>Ghế:</span>
                <strong>{selectedSeats.map(s => s.seatNumber).join(', ')}</strong>
              </div>
              <div className="summary-row total">
                <span>Tổng tiền:</span>
                <strong>{formatPrice(calculatePrice())}</strong>
              </div>
            </div>

            <button
              className="btn-confirm-booking"
              onClick={handleBooking}
              disabled={booking}
            >
              <FaTicketAlt />
              {booking ? 'Đang xử lý...' : 'Xác Nhận Đặt Vé'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking;