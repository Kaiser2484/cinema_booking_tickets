import { useState, useEffect } from 'react';
import { genreAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaTimes,
  FaSave,
  FaTheaterMasks
} from 'react-icons/fa';
import './Admin.css';

const AdminGenres = () => {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGenre, setEditingGenre] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true
  });

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      const response = await genreAPI.getAll();
      setGenres(response.data.data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách thể loại');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      isActive: true
    });
    setEditingGenre(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (genre) => {
    setEditingGenre(genre);
    setFormData({
      name: genre.name || '',
      description: genre.description || '',
      isActive: genre.isActive !== undefined ? genre.isActive : true
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingGenre) {
        await genreAPI.update(editingGenre._id, formData);
        toast.success('Cập nhật thể loại thành công!');
      } else {
        await genreAPI.create(formData);
        toast.success('Thêm thể loại thành công!');
      }
      setShowModal(false);
      resetForm();
      fetchGenres();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra!');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa thể loại này?')) return;

    try {
      await genreAPI.delete(id);
      toast.success('Xóa thể loại thành công!');
      fetchGenres();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Xóa thất bại!');
    }
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2><FaTheaterMasks /> Quản Lý Thể Loại</h2>
        <button className="btn-add" onClick={openAddModal}>
          <FaPlus /> Thêm Thể Loại
        </button>
      </div>

      {/* Genres Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tên thể loại</th>
              <th>Slug</th>
              <th>Mô tả</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {genres.map(genre => (
              <tr key={genre._id}>
                <td><strong>{genre.name}</strong></td>
                <td>
                  <code style={{ 
                    background: 'rgba(255,255,255,0.1)', 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    {genre.slug}
                  </code>
                </td>
                <td>{genre.description || '-'}</td>
                <td>
                  <span className={`status-badge ${genre.isActive ? 'status-active' : 'status-inactive'}`}>
                    {genre.isActive ? 'Hoạt động' : 'Tạm ngưng'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-edit" 
                      onClick={() => openEditModal(genre)}
                      title="Sửa"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="btn-delete" 
                      onClick={() => handleDelete(genre._id)}
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

        {genres.length === 0 && (
          <p className="no-data">Chưa có thể loại nào</p>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingGenre ? 'Sửa Thể Loại' : 'Thêm Thể Loại Mới'}</h3>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Tên thể loại *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="VD: Hành động"
                />
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Mô tả về thể loại phim..."
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                  Hoạt động
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn-save">
                  <FaSave /> {editingGenre ? 'Cập nhật' : 'Thêm thể loại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGenres;
