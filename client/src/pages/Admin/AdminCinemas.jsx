import { useState, useEffect } from 'react';
import { cinemaAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch,
  FaTimes,
  FaSave,
  FaBuilding,
  FaMapMarkerAlt
} from 'react-icons/fa';
import './Admin.css';

const AdminCinemas = () => {
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCinema, setEditingCinema] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    description: '',
    image: '',
    facilities: ''
  });

  const cityOptions = [
    'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
    'Biên Hòa', 'Nha Trang', 'Huế', 'Vũng Tàu', 'Bắc Ninh'
  ];

  const facilityOptions = [
    'Bãi đỗ xe', 'Đồ ăn', 'IMAX', '4DX', 'Dolby Atmos', 
    'Phòng chờ VIP', 'Wifi miễn phí', 'Ghế massage'
  ];

  useEffect(() => {
    fetchCinemas();
  }, []);

  const fetchCinemas = async () => {
    try {
      const response = await cinemaAPI.getAll();
      setCinemas(response.data.data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách rạp');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước ảnh không được vượt quá 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFacilityChange = (facility) => {
    const currentFacilities = formData.facilities ?  formData.facilities.split(', ').filter(f => f) : [];
    let newFacilities;
    
    if (currentFacilities.includes(facility)) {
      newFacilities = currentFacilities.filter(f => f !== facility);
    } else {
      newFacilities = [...currentFacilities, facility];
    }
    
    setFormData(prev => ({
      ...prev,
      facilities: newFacilities.join(', ')
    }));
  };

  const resetForm = () => {
    setFormData({
      name:  '',
      address:  '',
      city:  '',
      phone:  '',
      email:  '',
      description:  '',
      image:  '',
      facilities:  ''
    });
    setImageFile(null);
    setImagePreview('');
    setEditingCinema(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (cinema) => {
    setEditingCinema(cinema);
    setImageFile(null);
    setImagePreview(cinema.image || '');
    setFormData({
      name: cinema.name || '',
      address:  cinema.address || '',
      city: cinema.city || '',
      phone: cinema.phone || '',
      email: cinema.email || '',
      description: cinema.description || '',
      image:  cinema.image || '',
      facilities: cinema.facilities?.join(', ') || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let imageUrl = formData.image;

      // Upload image if file is selected
      if (imageFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('image', imageFile);
        
        const uploadResponse = await cinemaAPI.uploadImage(formDataUpload);
        imageUrl = uploadResponse.data.url;
      }

      const cinemaData = {
        ...formData,
        image: imageUrl,
        facilities: formData.facilities.split(',').map(f => f.trim()).filter(f => f)
      };

      if (editingCinema) {
        await cinemaAPI.update(editingCinema._id, cinemaData);
        toast.success('Cập nhật rạp thành công! ');
      } else {
        await cinemaAPI.create(cinemaData);
        toast.success('Thêm rạp thành công!');
      }
      setShowModal(false);
      resetForm();
      fetchCinemas();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra! ');
    }
  };

  const handleDelete = async (id) => {
    if (! window.confirm('Bạn có chắc muốn xóa rạp này? ')) return;

    try {
      await cinemaAPI.delete(id);
      toast.success('Xóa rạp thành công!');
      fetchCinemas();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Xóa thất bại!');
    }
  };

  const filteredCinemas = cinemas.filter(cinema =>
    cinema.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cinema.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading">Đang tải... </div>;
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2><FaBuilding /> Quản Lý Rạp</h2>
        <button className="btn-add" onClick={openAddModal}>
          <FaPlus /> Thêm Rạp
        </button>
      </div>

      {/* Search */}
      <div className="search-bar">
        <FaSearch />
        <input
          type="text"
          placeholder="Tìm kiếm rạp theo tên hoặc thành phố..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Cinemas Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tên rạp</th>
              <th>Địa chỉ</th>
              <th>Thành phố</th>
              <th>Điện thoại</th>
              <th>Số phòng</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredCinemas.map(cinema => (
              <tr key={cinema._id}>
                <td><strong>{cinema.name}</strong></td>
                <td>
                  <FaMapMarkerAlt style={{ color: '#e94560', marginRight: '8px' }} />
                  {cinema.address}
                </td>
                <td>{cinema.city}</td>
                <td>{cinema.phone || 'N/A'}</td>
                <td>{cinema.rooms?.length || 0} phòng</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-edit" 
                      onClick={() => openEditModal(cinema)}
                      title="Sửa"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="btn-delete" 
                      onClick={() => handleDelete(cinema._id)}
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

        {filteredCinemas.length === 0 && (
          <p className="no-data">Không tìm thấy rạp nào</p>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCinema ? 'Sửa Rạp' : 'Thêm Rạp Mới'}</h3>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Tên rạp *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="VD: CGV Vincom Center"
                  />
                </div>
                <div className="form-group">
                  <label>Thành phố *</label>
                  <select name="city" value={formData.city} onChange={handleChange} required>
                    <option value="">Chọn thành phố</option>
                    {cityOptions.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Địa chỉ *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  placeholder="VD: Tầng 5, TTTM Vincom, 191 Bà Triệu"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="VD: 1900 6017"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="VD: contact@cgv.vn"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Tiện ích</label>
                <div className="genre-checkboxes">
                  {facilityOptions.map(facility => (
                    <label key={facility} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.facilities.includes(facility)}
                        onChange={() => handleFacilityChange(facility)}
                      />
                      {facility}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Mô tả về rạp..."
                />
              </div>

              <div className="form-group">
                <label>Hình ảnh rạp</label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    id="image-upload"
                    className="file-input"
                  />
                  <label htmlFor="image-upload" className="file-input-label">
                    <FaPlus /> {imageFile ? imageFile.name : 'Chọn ảnh từ máy tính'}
                  </label>
                </div>
                <small style={{ color: '#888', display: 'block', marginTop: '5px' }}>
                  Hoặc nhập URL ảnh:
                </small>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/cinema.jpg"
                  style={{ marginTop: '8px' }}
                />
              </div>

              {imagePreview && (
                <div className="poster-preview">
                  <label>Xem trước hình ảnh:</label>
                  <img src={imagePreview} alt="Preview" />
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn-save">
                  <FaSave /> {editingCinema ? 'Cập nhật' : 'Thêm rạp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCinemas;