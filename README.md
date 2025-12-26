# 🎬 Cinema Booking Tickets

Hệ thống đặt vé xem phim trực tuyến - Đồ án Lập trình Nâng cao

## 📋 Giới thiệu

Website đặt vé xem phim online cho phép người dùng: 
- Xem danh sách phim đang chiếu & sắp chiếu
- Chọn rạp, suất chiếu và ghế ngồi
- Đặt vé và quản lý lịch sử đặt vé

## 🛠️ Công nghệ sử dụng

### Backend
- Node.js & Express. js
- MongoDB & Mongoose
- JWT Authentication
- bcryptjs

### Frontend
- React.js (Vite)
- React Router DOM
- Axios
- React Icons
- React Toastify

## 📁 Cấu trúc thư mục

```
cinema_booking_tickets/
├── server/                 # Backend
│   ├── config/            # Cấu hình database
│   ├── controllers/       # Xử lý logic
│   ├── middlewares/       # Middleware (auth, error)
│   ├── models/            # Schema MongoDB
│   ├── routes/            # API routes
│   └── server.js          # Entry point
│
├── client/                 # Frontend
│   ├── src/
│   │   ├── components/    # Components tái sử dụng
│   │   ├── pages/         # Các trang
│   │   ├── context/       # State management
│   │   ├── services/      # Gọi API
│   │   └── App.jsx        # Main component
│   └── index.html
│
└── README.md
```

## ⚙️ Cài đặt

### Yêu cầu
- Node.js >= 18.x
- MongoDB (Local hoặc Atlas)

### Backend

```bash
cd server
npm install
```

Tạo file `.env`:
```env
MONGO_URI=mongodb://localhost:27017/cinema_booking
PORT=5000
JWT_SECRET=your_secret_key
```

Chạy server:
```bash
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

## 🔗 API Endpoints

### Auth
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | /api/auth/register | Đăng ký |
| POST | /api/auth/login | Đăng nhập |
| GET | /api/auth/me | Thông tin user |

### Movies
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | /api/movies | Danh sách phim |
| GET | /api/movies/:id | Chi tiết phim |
| POST | /api/movies | Thêm phim (Admin) |

### Cinemas
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | /api/cinemas | Danh sách rạp |
| POST | /api/cinemas/: id/rooms | Thêm phòng (Admin) |

### Showtimes
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | /api/showtimes | Danh sách suất chiếu |
| GET | /api/showtimes/movie/:id | Suất chiếu theo phim |

### Bookings
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | /api/bookings | Đặt vé |
| GET | /api/bookings/my | Lịch sử đặt vé |

