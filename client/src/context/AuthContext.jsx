import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Kiểm tra đăng nhập khi load trang
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  // Load thông tin user
  const loadUser = async () => {
    try {
      const response = await authAPI.getMe();
      setUser(response.data.data);
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Đăng ký
  const register = async (userData) => {
    const response = await authAPI.register(userData);
    const { token, ...user } = response.data.data;
    localStorage.setItem('token', token);
    setUser(user);
    return response.data;
  };

  // Đăng nhập
  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    const { token, ...user } = response.data.data;
    localStorage.setItem('token', token);
    setUser(user);
    return response.data;
  };

  // Đăng xuất
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Cập nhật profile
  const updateProfile = async (userData) => {
    const response = await authAPI.updateProfile(userData);
    const { token, ...user } = response.data.data;
    if (token) {
      localStorage.setItem('token', token);
    }
    setUser(user);
    return response.data;
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};