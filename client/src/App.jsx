import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import AdminLayout from './components/AdminLayout/AdminLayout';

// Pages
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Movies from './pages/Movies/Movies';
import MovieDetail from './pages/Movies/MovieDetail';
import Booking from './pages/Booking/Booking';
import BookingSuccess from './pages/Booking/BookingSuccess';
import Profile from './pages/Profile/Profile';
import Cinemas from './pages/Cinemas/Cinemas';

// Admin Pages
import Dashboard from './pages/Admin/Dashboard';
import AdminMovies from './pages/Admin/AdminMovies';
import AdminCinemas from './pages/Admin/AdminCinemas';
import AdminRooms from './pages/Admin/AdminRooms';
import AdminShowtimes from './pages/Admin/AdminShowtimes';
import AdminBookings from './pages/Admin/AdminBookings';

import './App.css';

// Protected Route cho Admin
const AdminRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return children;
};

// Layout cho trang user (có Header/Footer)
const UserLayout = ({ children }) => {
  return (
    <>
      <Header />
      <main className="main-content">{children}</main>
      <Footer />
    </>
  );
};

function AppContent() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* User Routes */}
          <Route path="/" element={<UserLayout><Home /></UserLayout>} />
          <Route path="/login" element={<UserLayout><Login /></UserLayout>} />
          <Route path="/register" element={<UserLayout><Register /></UserLayout>} />
          <Route path="/movies" element={<UserLayout><Movies /></UserLayout>} />
          <Route path="/movies/:id" element={<UserLayout><MovieDetail /></UserLayout>} />
          <Route path="/booking/:id" element={<UserLayout><Booking /></UserLayout>} />
          <Route path="/booking/success/:id" element={<UserLayout><BookingSuccess /></UserLayout>} />
          <Route path="/profile" element={<UserLayout><Profile /></UserLayout>} />
          <Route path="/cinemas" element={<UserLayout><Cinemas /></UserLayout>} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="movies" element={<AdminMovies />} />
            <Route path="cinemas" element={<AdminCinemas />} />
            <Route path="rooms" element={<AdminRooms />} />
            <Route path="showtimes" element={<AdminShowtimes />} />
            <Route path="bookings" element={<AdminBookings />} />
          </Route>
        </Routes>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="dark"
      />
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;