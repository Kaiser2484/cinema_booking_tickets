import { useState, useEffect } from 'react';
import { paymentConfigAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaStar, FaUniversity, FaCheckCircle } from 'react-icons/fa';
import './Admin.css';

const AdminPaymentConfig = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [formData, setFormData] = useState({
    bankCode: '',
    bankName: '',
    accountNumber: '',
    accountName: '',
    branch: '',
    isPrimary: false,
    isActive: true,
    qrMethod: 'vietqr',
    notes: ''
  });

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const response = await paymentConfigAPI.getAll();
      setConfigs(response.data.data);
    } catch (error) {
      console.error('Error fetching configs:', error);
      toast.error('Không thể tải cấu hình thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingConfig) {
        await paymentConfigAPI.update(editingConfig._id, formData);
        toast.success('Cập nhật cấu hình thành công!');
      } else {
        await paymentConfigAPI.create(formData);
        toast.success('Thêm cấu hình thành công!');
      }
      setShowModal(false);
      resetForm();
      fetchConfigs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra!');
    }
  };

  const handleEdit = (config) => {
    setEditingConfig(config);
    setFormData({
      bankCode: config.bankCode,
      bankName: config.bankName,
      accountNumber: config.accountNumber,
      accountName: config.accountName,
      branch: config.branch || '',
      isPrimary: config.isPrimary,
      isActive: config.isActive,
      qrMethod: config.qrMethod,
      notes: config.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa cấu hình này?')) {
      try {
        await paymentConfigAPI.delete(id);
        toast.success('Xóa cấu hình thành công!');
        fetchConfigs();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Không thể xóa cấu hình!');
      }
    }
  };

  const handleSetPrimary = async (id) => {
    try {
      await paymentConfigAPI.setPrimary(id);
      toast.success('Đã đặt làm tài khoản chính!');
      fetchConfigs();
    } catch (error) {
      toast.error('Không thể đặt làm tài khoản chính!');
    }
  };

  const resetForm = () => {
    setEditingConfig(null);
    setFormData({
      bankCode: '',
      bankName: '',
      accountNumber: '',
      accountName: '',
      branch: '',
      isPrimary: false,
      isActive: true,
      qrMethod: 'vietqr',
      notes: ''
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h1>Quản Lý Thanh Toán</h1>
        <button className="btn-add" onClick={() => setShowModal(true)}>
          <FaPlus /> Thêm Tài Khoản
        </button>
      </div>

      <div className="payment-config-grid">
        {configs.map(config => (
          <div key={config._id} className={`payment-config-card ${config.isPrimary ? 'primary' : ''} ${!config.isActive ? 'inactive' : ''}`}>
            {config.isPrimary && (
              <div className="primary-badge">
                <FaStar /> Tài khoản chính
              </div>
            )}
            
            <div className="config-header">
              <FaUniversity className="bank-icon" />
              <div>
                <h3>{config.bankName}</h3>
                <span className="bank-code">{config.bankCode}</span>
              </div>
            </div>

            <div className="config-details">
              <div className="detail-row">
                <span>Số tài khoản:</span>
                <strong>{config.accountNumber}</strong>
              </div>
              <div className="detail-row">
                <span>Chủ tài khoản:</span>
                <strong>{config.accountName}</strong>
              </div>
              {config.branch && (
                <div className="detail-row">
                  <span>Chi nhánh:</span>
                  <strong>{config.branch}</strong>
                </div>
              )}
              <div className="detail-row">
                <span>Phương thức QR:</span>
                <strong>{config.qrMethod === 'vietqr' ? 'VietQR' : 'Manual'}</strong>
              </div>
              <div className="detail-row">
                <span>Trạng thái:</span>
                <strong className={config.isActive ? 'status-active' : 'status-inactive'}>
                  {config.isActive ? 'Hoạt động' : 'Tạm dừng'}
                </strong>
              </div>
            </div>

            {config.notes && (
              <div className="config-notes">
                <small>{config.notes}</small>
              </div>
            )}

            <div className="config-actions">
              {!config.isPrimary && config.isActive && (
                <button 
                  className="btn-set-primary"
                  onClick={() => handleSetPrimary(config._id)}
                  title="Đặt làm tài khoản chính"
                >
                  <FaStar /> Đặt làm chính
                </button>
              )}
              <button 
                className="btn-edit"
                onClick={() => handleEdit(config)}
              >
                <FaEdit /> Sửa
              </button>
              <button 
                className="btn-delete"
                onClick={() => handleDelete(config._id)}
              >
                <FaTrash /> Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {configs.length === 0 && (
        <div className="no-data">
          <FaUniversity />
          <p>Chưa có cấu hình thanh toán nào</p>
          <button className="btn-add" onClick={() => setShowModal(true)}>
            <FaPlus /> Thêm Tài Khoản Đầu Tiên
          </button>
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingConfig ? 'Cập Nhật Tài Khoản' : 'Thêm Tài Khoản Mới'}</h2>
              <button className="btn-close" onClick={handleCloseModal}>&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Mã ngân hàng *</label>
                  <input
                    type="text"
                    name="bankCode"
                    value={formData.bankCode}
                    onChange={handleInputChange}
                    placeholder="VD: MB, VCB, TCB..."
                    required
                    maxLength={10}
                  />
                  <small>Mã viết tắt của ngân hàng (VD: MB, VCB, TCB)</small>
                </div>

                <div className="form-group">
                  <label>Tên ngân hàng *</label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    placeholder="VD: MB Bank, Vietcombank..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Số tài khoản *</label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                    placeholder="Nhập số tài khoản"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Chủ tài khoản *</label>
                  <input
                    type="text"
                    name="accountName"
                    value={formData.accountName}
                    onChange={handleInputChange}
                    placeholder="Tên chủ tài khoản (in hoa)"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Chi nhánh</label>
                  <input
                    type="text"
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    placeholder="VD: Chi nhánh Hà Nội (không bắt buộc)"
                  />
                </div>

                <div className="form-group">
                  <label>Phương thức QR</label>
                  <select
                    name="qrMethod"
                    value={formData.qrMethod}
                    onChange={handleInputChange}
                  >
                    <option value="vietqr">VietQR (Tự động)</option>
                    <option value="manual">Manual (Tự tạo)</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Ghi chú</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Ghi chú thêm về tài khoản..."
                    rows="3"
                  ></textarea>
                </div>

                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="isPrimary"
                    name="isPrimary"
                    checked={formData.isPrimary}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="isPrimary">
                    <FaStar /> Đặt làm tài khoản chính
                  </label>
                </div>

                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="isActive">
                    <FaCheckCircle /> Kích hoạt ngay
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Hủy
                </button>
                <button type="submit" className="btn-submit">
                  {editingConfig ? 'Cập Nhật' : 'Thêm Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentConfig;
