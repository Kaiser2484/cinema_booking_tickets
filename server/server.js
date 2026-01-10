const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files từ thư mục uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/movies', require('./routes/movieRoutes'));
app.use('/api/cinemas', require('./routes/cinemaRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));      
app.use('/api/showtimes', require('./routes/showtimeRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/genres', require('./routes/genreRoutes'));

// Home route
app.get('/', (req, res) => {
  res.json({
    message: '🎬 Cinema Booking API is running! ',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      movies: '/api/movies',
      cinemas: '/api/cinemas',
      rooms: '/api/rooms',
      showtimes:  '/api/showtimes',
      bookings: '/api/bookings'
    }
  });
});

// Error Handler
app.use(errorHandler);

// Start server
const PORT = process.env. PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});