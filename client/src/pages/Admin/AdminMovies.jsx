import { useState, useEffect } from 'react';
import { movieAPI, genreAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch,
  FaTimes,
  FaSave,
  FaFilm
} from 'react-icons/fa';
import './Admin.css';

const AdminMovies = () => {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    genres: '',
    director: '',
    cast: '',
    releaseDate: '',
    endDate: '',
    poster: '',
    trailer: '',
    rated: 'P',
    language: 'Tiếng Việt',
    status: 'coming_soon'
  });

  const ratedOptions = ['P', 'C13', 'C16', 'C18'];
  const statusOptions = [
    { value: 'coming_soon', label:  'Sắp chiếu' },
    { value: 'now_showing', label:  'Đang chiếu' },
    { value: 'ended', label: 'Đã kết thúc' }
  ];

  useEffect(() => {
    fetchMovies();
    fetchGenres();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await movieAPI.getAll();
      setMovies(response.data.data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách phim');
    } finally {
      setLoading(false);
    }
  };

  const fetchGenres = async () => {
    try {
      const response = await genreAPI.getAll();
      setGenres(response.data.data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách thể loại:', error);
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
      setPosterFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPosterPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenreChange = (genre) => {
    const currentGenres = formData.genres ?  formData.genres.split(', ').filter(g => g) : [];
    let newGenres;
    
    if (currentGenres.includes(genre)) {
      newGenres = currentGenres.filter(g => g !== genre);
    } else {
      newGenres = [...currentGenres, genre];
    }
    
    setFormData(prev => ({
      ...prev,
      genres: newGenres.join(', ')
    }));
  };

  const resetForm = () => {
    setFormData({
      title:  '',
      description:  '',
      duration:  '',
      genres:  '',
      director:  '',
      cast:  '',
      releaseDate: '',
      endDate: '',
      poster: '',
      trailer: '',
      rated: 'P',
      language: 'Tiếng Việt',
      status:  'coming_soon'
    });
    setPosterFile(null);
    setPosterPreview('');
    setEditingMovie(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (movie) => {
    setEditingMovie(movie);
    setPosterFile(null);
    setPosterPreview(movie.poster || '');
    setFormData({
      title: movie.title || '',
      description:  movie.description || '',
      duration: movie.duration || '',
      genres: movie.genres?.join(', ') || '',
      director:  movie.director || '',
      cast: movie.cast?.join(', ') || '',
      releaseDate: movie.releaseDate?.split('T')[0] || '',
      endDate: movie.endDate?.split('T')[0] || '',
      poster: movie.poster || '',
      trailer: movie.trailer || '',
      rated: movie.rated || 'P',
      language: movie.language || 'Tiếng Việt',
      status: movie.status || 'coming_soon'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let posterUrl = formData.poster;

      // Upload poster if file is selected
      if (posterFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('poster', posterFile);
        
        const uploadResponse = await movieAPI.uploadPoster(formDataUpload);
        posterUrl = uploadResponse.data.url;
      }

      const movieData = {
        ...formData,
        poster: posterUrl,
        duration: parseInt(formData.duration),
        genres: formData.genres.split(',').map(g => g.trim()).filter(g => g),
        cast: formData.cast.split(',').map(c => c.trim()).filter(c => c)
      };

      if (editingMovie) {
        await movieAPI.update(editingMovie._id, movieData);
        toast.success('Cập nhật phim thành công!');
      } else {
        await movieAPI.create(movieData);
        toast.success('Thêm phim thành công!');
      }
      setShowModal(false);
      resetForm();
      fetchMovies();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra! ');
    }
  };

  const handleDelete = async (id) => {
    if (! window.confirm('Bạn có chắc muốn xóa phim này?')) return;

    try {
      await movieAPI.delete(id);
      toast.success('Xóa phim thành công!');
      fetchMovies();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Xóa thất bại!');
    }
  };

  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (status) => {
    const badges = {
      now_showing: { color: '#27ae60', text:  'Đang chiếu' },
      coming_soon: { color: '#f39c12', text: 'Sắp chiếu' },
      ended: { color: '#888', text: 'Đã kết thúc' }
    };
    return badges[status] || badges.coming_soon;
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2><FaFilm /> Quản Lý Phim</h2>
        <button className="btn-add" onClick={openAddModal}>
          <FaPlus /> Thêm Phim
        </button>
      </div>

      {/* Search */}
      <div className="search-bar">
        <FaSearch />
        <input
          type="text"
          placeholder="Tìm kiếm phim..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Movies Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Poster</th>
              <th>Tên phim</th>
              <th>Thể loại</th>
              <th>Thời lượng</th>
              <th>Ngày chiếu</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredMovies.map(movie => (
              <tr key={movie._id}>
                <td>
                  <img 
                    src={movie.poster || 'https://via.placeholder.com/50x75? text=No+Image'} 
                    alt={movie.title}
                    className="table-poster"
                  />
                </td>
                <td>
                  <strong>{movie.title}</strong>
                  <br />
                  <small className="text-muted">{movie.rated}</small>
                </td>
                <td>{movie.genres?.slice(0, 2).join(', ')}</td>
                <td>{movie.duration} phút</td>
                <td>{formatDate(movie.releaseDate)}</td>
                <td>
                  <span 
                    className="status-badge"
                    style={{ background: getStatusBadge(movie.status).color }}
                  >
                    {getStatusBadge(movie.status).text}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-edit" 
                      onClick={() => openEditModal(movie)}
                      title="Sửa"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="btn-delete" 
                      onClick={() => handleDelete(movie._id)}
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

        {filteredMovies.length === 0 && (
          <p className="no-data">Không tìm thấy phim nào</p>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingMovie ? 'Sửa Phim' : 'Thêm Phim Mới'}</h3>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Tên phim *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Thời lượng (phút) *</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                    min="1"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Thể loại</label>
                <div className="genre-checkboxes">
                  {genres.map(genre => (
                    <label key={genre._id} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.genres.includes(genre.name)}
                        onChange={() => handleGenreChange(genre.name)}
                      />
                      {genre.name}
                    </label>
                  ))}
                </div>
                {genres.length === 0 && (
                  <p style={{ color: '#888', fontSize: '13px', marginTop: '10px' }}>
                    Chưa có thể loại. Vui lòng thêm thể loại trong phần Quản lý Thể loại.
                  </p>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Đạo diễn</label>
                  <input
                    type="text"
                    name="director"
                    value={formData.director}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Diễn viên (cách nhau bởi dấu phẩy)</label>
                  <input
                    type="text"
                    name="cast"
                    value={formData.cast}
                    onChange={handleChange}
                    placeholder="Diễn viên 1, Diễn viên 2, ..."
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ngày khởi chiếu *</label>
                  <input
                    type="date"
                    name="releaseDate"
                    value={formData.releaseDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Ngày kết thúc</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phân loại</label>
                  <select name="rated" value={formData.rated} onChange={handleChange}>
                    {ratedOptions.map(rated => (
                      <option key={rated} value={rated}>{rated}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Ngôn ngữ</label>
                  <input
                    type="text"
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Trạng thái</label>
                  <select name="status" value={formData.status} onChange={handleChange}>
                    {statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Poster phim</label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    id="poster-upload"
                    className="file-input"
                  />
                  <label htmlFor="poster-upload" className="file-input-label">
                    <FaPlus /> {posterFile ? posterFile.name : 'Chọn ảnh từ máy tính'}
                  </label>
                </div>
                <small style={{ color: '#888', display: 'block', marginTop: '5px' }}>
                  Hoặc nhập URL ảnh:
                </small>
                <input
                  type="url"
                  name="poster"
                  value={formData.poster}
                  onChange={handleChange}
                  placeholder="https://example.com/poster.jpg"
                  style={{ marginTop: '8px' }}
                />
              </div>

              <div className="form-group">
                <label>URL Trailer (YouTube)</label>
                <input
                  type="url"
                  name="trailer"
                  value={formData.trailer}
                  onChange={handleChange}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              {posterPreview && (
                <div className="poster-preview">
                  <label>Xem trước poster:</label>
                  <img src={posterPreview} alt="Preview" />
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn-save">
                  <FaSave /> {editingMovie ? 'Cập nhật' : 'Thêm phim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMovies;