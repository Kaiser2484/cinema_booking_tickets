import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Movies from './pages/Movies/Movies';
import MovieDetail from './pages/Movies/MovieDetail';
import Booking from './pages/Booking/Booking';
import BookingSuccess from './pages/Booking/BookingSuccess';
import Profile from './pages/Profile/Profile';
import Cinemas from './pages/Cinemas/Cinemas';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/movies" element={<Movies />} />
              <Route path="/movies/:id" element={<MovieDetail />} />
              <Route path="/booking/:id" element={<Booking />} />
              <Route path="/booking/success/:id" element={<BookingSuccess />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/cinemas" element={<Cinemas />} />
            </Routes>
          </main>
          <Footer />
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
    </AuthProvider>
  );
}

export default App;