import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Tạo instance axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Thêm token vào header trước mỗi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config. headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============ AUTH API ============
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

// ============ MOVIE API ============
export const movieAPI = {
  getAll: (params) => api.get('/movies', { params }),
  getNowShowing: () => api.get('/movies/now-showing'),
  getComingSoon: () => api.get('/movies/coming-soon'),
  getById: (id) => api.get(`/movies/${id}`),
  create: (data) => api.post('/movies', data),
  update: (id, data) => api.put(`/movies/${id}`, data),
  delete: (id) => api.delete(`/movies/${id}`)
};

// ============ CINEMA API ============
export const cinemaAPI = {
  getAll: (params) => api.get('/cinemas', { params }),
  getById: (id) => api.get(`/cinemas/${id}`),
  getRooms: (cinemaId) => api.get(`/cinemas/${cinemaId}/rooms`),
  create: (data) => api.post('/cinemas', data),
  createRoom: (cinemaId, data) => api.post(`/cinemas/${cinemaId}/rooms`, data)
};

// ============ SHOWTIME API ============
export const showtimeAPI = {
  getAll:  (params) => api.get('/showtimes', { params }),
  getByMovie: (movieId, params) => api.get(`/showtimes/movie/${movieId}`, { params }),
  getById: (id) => api.get(`/showtimes/${id}`),
  create: (data) => api.post('/showtimes', data),
  update: (id, data) => api.put(`/showtimes/${id}`, data),
  delete: (id) => api.delete(`/showtimes/${id}`)
};

// ============ BOOKING API ============
export const bookingAPI = {
  create: (data) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/my'),
  getById:  (id) => api.get(`/bookings/${id}`),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
  getAll: (params) => api.get('/bookings', { params })
};

export default api;