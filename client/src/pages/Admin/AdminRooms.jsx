import { useState, useEffect } from 'react';
import { cinemaAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash,
  FaTimes,
  FaSave,
  FaDoorOpen
} from 'react-icons/fa';
import './Admin.css';

const AdminRooms = () => {
  const [cinemas, setCinemas] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCinema, setSelectedCinema] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    cinema: '',
    type: '2D',
    rows: 10,
    seatsPerRow: 12,
    vipRows: '',
    coupleRows: ''
  });

  const roomTypes = ['2D', '3D', 'IMAX', '4DX', 'Dolby Atmos'];

  useEffect(() => {
    fetchCinemas();
  }, []);

  useEffect(() => {
    if (selectedCinema) {
      fetchRooms(selectedCinema);
    }
  }, [selectedCinema]);

  const fetchCinemas = async () => {
    try {
      const response = await cinemaAPI.getAll();
      setCinemas(response.data.data);
      if (response.data.data.length > 0) {
        setSelectedCinema(response.data.data[0]._id);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách rạp');
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async (cinemaId) => {
    try {
      const response = await cinemaAPI.getRooms(cinemaId);
      setRooms(response.data.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
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
      name:  '',
      cinema:  selectedCinema,
      type: '2D',
      rows: 10,
      seatsPerRow: 12,
      vipRows: '',
      coupleRows: ''
    });
    setEditingRoom(null);
  };

  const openAddModal = () => {
    resetForm();
    setFormData(prev => ({ ...prev, cinema: selectedCinema }));
    setShowModal(true);
  };

  const openEditModal = (room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name || '',
      cinema: room.cinema?._id || room.cinema || selectedCinema,
      type: room.type || '2D',
      rows: room.rows || 10,
      seatsPerRow: room.seatsPerRow || 12,
      vipRows: room.vipRows?.join(', ') || '',
      coupleRows: room.coupleRows?.join(', ') || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const roomData = {
      ...formData,
      rows: parseInt(formData.rows),
      seatsPerRow: parseInt(formData.seatsPerRow),
      vipRows: formData.vipRows.split(',').map(r => r.trim().toUpperCase()).filter(r => r),
      coupleRows: formData.coupleRows.split(',').map(r => r.trim().toUpperCase()).filter(r => r)
    };

    try {
      if (editingRoom) {
        await cinemaAPI.updateRoom(editingRoom._id, roomData);
        toast.success('Cập nhật phòng thành công!');
      } else {
        await cinemaAPI.createRoom(selectedCinema, roomData);
        toast.success('Thêm phòng thành công!');
      }
      setShowModal(false);
      resetForm();
      fetchRooms(selectedCinema);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra!');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa phòng này?')) return;

    try {
      await cinemaAPI.deleteRoom(id);
      toast.success('Xóa phòng thành công!');
      fetchRooms(selectedCinema);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Xóa thất bại!');
    }
  };

  const getSelectedCinemaName = () => {
    const cinema = cinemas.find(c => c._id === selectedCinema);
    return cinema?.name || '';
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2><FaDoorOpen /> Quản Lý Phòng Chiếu</h2>
        <button className="btn-add" onClick={openAddModal} disabled={!selectedCinema}>
          <FaPlus /> Thêm Phòng
        </button>
      </div>

      {/* Cinema Selector */}
      <div className="filter-bar">
        <label>Chọn rạp: </label>
        <select 
          value={selectedCinema} 
          onChange={(e) => setSelectedCinema(e.target.value)}
        >
          {cinemas.map(cinema => (
            <option key={cinema._id} value={cinema._id}>
              {cinema.name} - {cinema.city}
            </option>
          ))}
        </select>
      </div>

      {/* Rooms Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tên phòng</th>
              <th>Loại</th>
              <th>Số hàng</th>
              <th>Ghế/hàng</th>
              <th>Tổng ghế</th>
              <th>Hàng VIP</th>
              <th>Hàng đôi</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => (
              <tr key={room._id}>
                <td><strong>{room.name}</strong></td>
                <td>
                  <span className={`room-type type-${room.type?.toLowerCase()}`}>
                    {room.type}
                  </span>
                </td>
                <td>{room.rows}</td>
                <td>{room.seatsPerRow}</td>
                <td>{room.totalSeats || room.rows * room.seatsPerRow}</td>
                <td>{room.vipRows?.join(', ') || '-'}</td>
                <td>{room.coupleRows?.join(', ') || '-'}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-edit" 
                      onClick={() => openEditModal(room)}
                      title="Sửa"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="btn-delete" 
                      onClick={() => handleDelete(room._id)}
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

        {rooms.length === 0 && (
          <p className="no-data">Rạp này chưa có phòng chiếu nào</p>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-small" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingRoom ? 'Sửa Phòng' : 'Thêm Phòng Mới'}</h3>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Rạp</label>
                <input type="text" value={getSelectedCinemaName()} disabled />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tên phòng *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="VD:  Phòng 1, Room A..."
                  />
                </div>
                <div className="form-group">
                  <label>Loại phòng *</label>
                  <select name="type" value={formData.type} onChange={handleChange} required>
                    {roomTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Số hàng ghế *</label>
                  <input
                    type="number"
                    name="rows"
                    value={formData.rows}
                    onChange={handleChange}
                    required
                    min="1"
                    max="26"
                  />
                </div>
                <div className="form-group">
                  <label>Số ghế mỗi hàng *</label>
                  <input
                    type="number"
                    name="seatsPerRow"
                    value={formData.seatsPerRow}
                    onChange={handleChange}
                    required
                    min="1"
                    max="30"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Hàng VIP (cách nhau bởi dấu phẩy)</label>
                <input
                  type="text"
                  name="vipRows"
                  value={formData.vipRows}
                  onChange={handleChange}
                  placeholder="VD: E, F, G"
                />
                <small className="form-hint">Nhập các chữ cái hàng VIP, cách nhau bởi dấu phẩy</small>
              </div>

              <div className="form-group">
                <label>Hàng đôi (cách nhau bởi dấu phẩy)</label>
                <input
                  type="text"
                  name="coupleRows"
                  value={formData.coupleRows}
                  onChange={handleChange}
                  placeholder="VD: J"
                />
                <small className="form-hint">Nhập các chữ cái hàng ghế đôi</small>
              </div>

              <div className="seat-preview">
                <label>Xem trước: </label>
                <p>Tổng số ghế: <strong>{formData.rows * formData.seatsPerRow}</strong></p>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn-save">
                  <FaSave /> {editingRoom ? 'Cập nhật' : 'Thêm phòng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRooms;