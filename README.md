# 🎬 Cinema Booking Tickets

Hệ thống đặt vé xem phim trực tuyến - Đồ án Lập trình Nâng cao

## 📋 Giới thiệu

Website đặt vé xem phim online với đầy đủ tính năng chuyên nghiệp, thiết kế hiện đại và trải nghiệm người dùng mượt mà.

### 🎯 Tính năng Người dùng

#### Xem & Tìm kiếm Phim
- 🎥 Xem danh sách phim đang chiếu & sắp chiếu
- 🎬 Tìm kiếm phim theo tên, thể loại
- 📝 Xem chi tiết phim (mô tả, thời lượng, đạo diễn, diễn viên, trailer)
- ⭐ Xem rating và thông tin phim

#### Đặt vé
- 🏢 Chọn rạp chiếu phim
- 📅 Xem lịch chiếu theo ngày
- 💺 Chọn ghế ngồi trực quan (Thường, VIP, Couple)
- 🎨 Sơ đồ ghế với màu sắc phân biệt trạng thái
- 🔒 Real-time cập nhật ghế đã đặt
- 💳 Thanh toán và xác nhận đặt vé

#### Quản lý Tài khoản
- 👤 Đăng ký / Đăng nhập
- 📜 Xem lịch sử đặt vé
- 🎫 **Xem chi tiết vé điện tử** với:
  - Thông tin đầy đủ về phim, rạp, suất chiếu
  - Danh sách ghế đã đặt
  - Mã booking
  - **QR Code** để quét tại rạp
  - Chức năng in vé
- ✏️ Cập nhật thông tin cá nhân
- ❌ Hủy vé (nếu còn thời gian)

### 👨‍💼 Tính năng Quản trị viên

#### Dashboard
- 📊 Thống kê tổng quan (doanh thu, booking, phim)
- 📈 Biểu đồ phân tích
- 🎯 Các chỉ số quan trọng

#### Quản lý Phim
- ➕ Thêm phim mới với đầy đủ thông tin
- ✏️ Chỉnh sửa thông tin phim
- 🗑️ Xóa phim
- 📤 Upload poster phim
- 🎭 Gán thể loại cho phim
- 📊 Theo dõi thống kê phim

#### Quản lý Rạp & Phòng chiếu
- 🏢 Thêm/sửa/xóa rạp chiếu
- 🚪 Quản lý phòng chiếu trong từng rạp
- 💺 Cấu hình số lượng ghế và loại ghế
- 🗺️ Quản lý vị trí và thông tin rạp

#### Quản lý Lịch chiếu (Nâng cao)
- 📅 **Bộ lọc thông minh**:
  - Xem theo **Ngày/Tuần/Tháng**
  - **Date picker** để chọn ngày trực tiếp
  - Lọc theo rạp chiếu
  - Lọc theo phim
  - Kết hợp nhiều bộ lọc
- ➕ Thêm suất chiếu mới
- ✏️ Chỉnh sửa suất chiếu
- 🗑️ Xóa suất chiếu
- ⏰ Tự động tính thời gian kết thúc dựa trên độ dài phim
- 🎨 Hiển thị trực quan theo timeline
- 💰 Cấu hình giá vé cho từng loại ghế

#### Quản lý Đặt vé
- 📋 Xem tất cả booking
- 🔍 Lọc theo trạng thái
- 👁️ Xem chi tiết từng booking
- ✅ Xác nhận/Hủy booking

#### Quản lý khác
- 🎭 Quản lý thể loại phim (CRUD)
- 💰 Cấu hình thanh toán
- 🔧 Cài đặt hệ thống

## 🛠️ Công nghệ sử dụng

### Backend
- **Node.js & Express.js** - Server framework
- **MongoDB & Mongoose** - NoSQL Database
- **JWT (jsonwebtoken)** - Authentication & Authorization
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **Express Validator** - Request validation
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - Environment variables

### Frontend
- **React.js 18** - UI library
- **React Router DOM v6** - Client-side routing
- **Axios** - HTTP client
- **React Icons** - Icon library
- **React Toastify** - Toast notifications
- **React QR Code** - QR code generation
- **CSS3** - Modern styling với animations
- **Vite** - Build tool & dev server

### DevOps & Tools
- **Nodemon** - Development auto-reload
- **ESLint** - Code linting
- **Git** - Version control

## ✨ Tính năng nổi bật

### 1. 🎫 Vé Điện tử với QR Code
- Thiết kế vé điện tử chuyên nghiệp
- Hiển thị đầy đủ thông tin: phim, rạp, ghế, giá
- **Mã QR** chứa thông tin booking để quét tại rạp
- Chức năng in vé tiện lợi
- Responsive design, tương thích mobile

### 2. 📅 Quản lý Lịch chiếu Thông minh
- **3 chế độ xem**: Ngày, Tuần, Tháng
- **Date Picker**: Click để chọn ngày bất kỳ thay vì chuyển từng ngày
- **Bộ lọc đa chiều**: 
  - Khi chọn "Ngày" → Hiển thị lịch chiếu ngày đó
  - Khi chọn "Tuần" + ngày → Hiển thị cả tuần chứa ngày đó
  - Khi chọn "Tháng" + ngày → Hiển thị cả tháng
- Lọc theo rạp và phim đồng thời
- Hiển thị trực quan với card đẹp mắt
- Tự động tính toán thời gian kết thúc

### 3. 💺 Đặt vé Trực quan
- Sơ đồ ghế interactive
- 3 loại ghế: Thường, VIP, Couple
- Màu sắc phân biệt rõ ràng
- Real-time cập nhật trạng thái ghế
- Tính toán giá tự động

### 4. 🎨 Giao diện Hiện đại
- Dark theme sang trọng
- Gradient colors bắt mắt
- Smooth animations
- Responsive design
- Loading states mượt mà

## 📁 Cấu trúc thư mục

```
cinema_booking_tickets/
├── server/                     # Backend API
│   ├── config/                
│   │   └── db.js              # MongoDB connection
│   ├── controllers/           # Business logic
│   │   ├── authController.js
│   │   ├── movieController.js
│   │   ├── cinemaController.js
│   │   ├── showtimeController.js
│   │   ├── bookingController.js
│   │   ├── genreController.js
│   │   └── paymentConfigController.js
│   ├── middlewares/           
│   │   ├── auth.js           # JWT verification
│   │   ├── errorHandler.js   # Error handling
│   │   └── upload.js         # Multer config
│   ├── models/               # Mongoose schemas
│   │   ├── User.js
│   │   ├── Movie.js
│   │   ├── Cinema.js
│   │   ├── Room.js
│   │   ├── Showtime.js
│   │   ├── Booking.js
│   │   ├── Genre.js
│   │   └── PaymentConfig.js
│   ├── routes/               # API endpoints
│   │   ├── authRoutes.js
│   │   ├── movieRoutes.js
│   │   ├── cinemaRoutes.js
│   │   ├── showtimeRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── genreRoutes.js
│   │   └── paymentConfigRoutes.js
│   ├── uploads/              # Static files
│   │   └── posters/         # Movie posters
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── paymentValidator.js
│   ├── seedGenres.js        # Seed genres
│   ├── seedMovies.js        # Seed movies
│   ├── server.js            # Entry point
│   ├── package.json
│   └── .env
│
├── client/                    # Frontend React App
│   ├── public/
│   │   ├── index.html
│   │   ├── manifest.json
│   │   └── robots.txt
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── Header/
│   │   │   │   ├── Header.jsx
│   │   │   │   └── Header.css
│   │   │   ├── Footer/
│   │   │   ├── MovieCard/
│   │   │   ├── SeatMap/
│   │   │   ├── Loading/
│   │   │   ├── AdminLayout/
│   │   │   ├── PrivateRoute/
│   │   │   ├── PaymentModal/
│   │   │   └── TicketDetail/  # ⭐ Component vé điện tử
│   │   │       ├── TicketDetail.jsx
│   │   │       └── TicketDetail.css
│   │   ├── pages/            # Main pages
│   │   │   ├── Home/
│   │   │   ├── Movies/
│   │   │   ├── Cinemas/
│   │   │   ├── Booking/      # Đặt vé
│   │   │   │   ├── Booking.jsx
│   │   │   │   └── BookingSuccess.jsx
│   │   │   ├── Auth/         # Login/Register
│   │   │   ├── Profile/      # Lịch sử đặt vé, Chi tiết vé
│   │   │   └── Admin/        # Admin pages
│   │   │       ├── Dashboard.jsx
│   │   │       ├── AdminMovies.jsx
│   │   │       ├── AdminCinemas.jsx
│   │   │       ├── AdminRooms.jsx
│   │   │       ├── AdminShowtimes.jsx  # ⭐ Quản lý lịch chiếu nâng cao
│   │   │       ├── AdminBookings.jsx
│   │   │       ├── AdminGenres.jsx
│   │   │       └── AdminPaymentConfig.jsx
│   │   ├── context/          
│   │   │   └── AuthContext.jsx  # Global auth state
│   │   ├── services/         
│   │   │   └── api.js        # API calls
│   │   ├── assets/           # Images, icons
│   │   ├── App.jsx           # Main component
│   │   ├── App.css
│   │   └── index.js          # Entry point
│   ├── package.json
│   ├── vite.config.js
│   └── .env
│
├── postman/                   # API testing
│   ├── collections/
│   └── environments/
│
└── README.md
```

## ⚙️ Cài đặt & Chạy ứng dụng

### Yêu cầu hệ thống
- **Node.js** >= 18.x
- **MongoDB** (Local hoặc MongoDB Atlas)
- **npm** hoặc **yarn**
- **Git** (để clone repository)

### Bước 1: Clone Repository

```bash
git clone <repository-url>
cd cinema_booking_tickets
```

### Bước 2: Cài đặt Backend

```bash
cd server
npm install
```

Tạo file `.env` trong thư mục `server`:
```env
# Database
MONGO_URI=mongodb://localhost:27017/cinema_booking
# hoặc MongoDB Atlas: mongodb+srv://<username>:<password>@cluster.mongodb.net/cinema_booking

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=30d

# Upload
MAX_FILE_SIZE=5000000
```

**Seed dữ liệu mẫu** (khuyến nghị để test):
```bash
node seedGenres.js    # Tạo các thể loại phim
node seedMovies.js    # Tạo dữ liệu phim mẫu
```

**Chạy server:**
```bash
# Development mode với nodemon (auto-reload)
npm run dev

# Production mode
npm start
```

Server sẽ chạy tại: `http://localhost:5000`

### Bước 3: Cài đặt Frontend

Mở terminal mới:

```bash
cd client
npm install
```

Tạo file `.env` trong thư mục `client`:
```env
VITE_API_URL=http://localhost:5000
```

**Chạy client:**
```bash
npm run dev
```

Client sẽ chạy tại: `http://localhost:5173`

### Bước 4: Truy cập ứng dụng

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Docs**: http://localhost:5000/api

## 🔗 API Endpoints

### Auth APIs
| Method | Endpoint | Mô tả | Auth Required |
|--------|----------|-------|---------------|
| POST | `/api/auth/register` | Đăng ký tài khoản mới | - |
| POST | `/api/auth/login` | Đăng nhập | - |
| GET | `/api/auth/me` | Lấy thông tin user hiện tại | ✓ User |
| PUT | `/api/auth/profile` | Cập nhật profile | ✓ User |

### Movies APIs
| Method | Endpoint | Mô tả | Auth Required |
|--------|----------|-------|---------------|
| GET | `/api/movies` | Danh sách tất cả phim | - |
| GET | `/api/movies/:id` | Chi tiết phim | - |
| POST | `/api/movies` | Thêm phim mới | ✓ Admin |
| PUT | `/api/movies/:id` | Cập nhật phim | ✓ Admin |
| DELETE | `/api/movies/:id` | Xóa phim | ✓ Admin |
| POST | `/api/movies/:id/upload-poster` | Upload poster | ✓ Admin |

**Query params cho GET /api/movies:**
- `status`: Filter theo trạng thái (now-showing, coming-soon, ended)
- `genre`: Filter theo thể loại
- `search`: Tìm kiếm theo tên

### Cinemas APIs
| Method | Endpoint | Mô tả | Auth Required |
|--------|----------|-------|---------------|
| GET | `/api/cinemas` | Danh sách rạp | - |
| GET | `/api/cinemas/:id` | Chi tiết rạp | - |
| POST | `/api/cinemas` | Thêm rạp mới | ✓ Admin |
| PUT | `/api/cinemas/:id` | Cập nhật rạp | ✓ Admin |
| DELETE | `/api/cinemas/:id` | Xóa rạp | ✓ Admin |

### Rooms APIs
| Method | Endpoint | Mô tả | Auth Required |
|--------|----------|-------|---------------|
| GET | `/api/cinemas/:id/rooms` | Danh sách phòng của rạp | - |
| POST | `/api/rooms` | Thêm phòng mới | ✓ Admin |
| PUT | `/api/rooms/:id` | Cập nhật phòng | ✓ Admin |
| DELETE | `/api/rooms/:id` | Xóa phòng | ✓ Admin |

### Showtimes APIs
| Method | Endpoint | Mô tả | Auth Required |
|--------|----------|-------|---------------|
| GET | `/api/showtimes` | Danh sách suất chiếu | - |
| GET | `/api/showtimes/:id` | Chi tiết suất chiếu | - |
| POST | `/api/showtimes` | Thêm suất chiếu | ✓ Admin |
| PUT | `/api/showtimes/:id` | Cập nhật suất chiếu | ✓ Admin |
| DELETE | `/api/showtimes/:id` | Xóa suất chiếu | ✓ Admin |

**Query params cho GET /api/showtimes:**
- `startDate`: Ngày bắt đầu (YYYY-MM-DD)
- `endDate`: Ngày kết thúc (YYYY-MM-DD)
- `cinema`: ID rạp chiếu
- `movie`: ID phim
- `date`: Lọc theo ngày cụ thể

### Bookings APIs
| Method | Endpoint | Mô tả | Auth Required |
|--------|----------|-------|---------------|
| POST | `/api/bookings` | Tạo booking mới | ✓ User |
| GET | `/api/bookings/my` | Lịch sử đặt vé của user | ✓ User |
| GET | `/api/bookings/:id` | Chi tiết booking | ✓ User/Admin |
| GET | `/api/bookings` | Tất cả bookings | ✓ Admin |
| PUT | `/api/bookings/:id/cancel` | Hủy booking | ✓ User |
| PUT | `/api/bookings/:id/status` | Cập nhật trạng thái | ✓ Admin |

### Genres APIs
| Method | Endpoint | Mô tả | Auth Required |
|--------|----------|-------|---------------|
| GET | `/api/genres` | Danh sách thể loại | - |
| POST | `/api/genres` | Thêm thể loại | ✓ Admin |
| PUT | `/api/genres/:id` | Cập nhật thể loại | ✓ Admin |
| DELETE | `/api/genres/:id` | Xóa thể loại | ✓ Admin |

## 👤 Tài khoản Test

Sau khi seed dữ liệu, sử dụng các tài khoản sau để test:

### Admin Account
```
Email: admin@cinema.com
Password: admin123
```
**Quyền hạn**: Truy cập tất cả tính năng quản trị

### User Account
Đăng ký tài khoản mới hoặc tạo tài khoản test

## 🎯 Hướng dẫn sử dụng

### Dành cho Người dùng

1. **Đăng ký/Đăng nhập**
   - Truy cập trang chủ
   - Click "Đăng ký" và điền thông tin
   - Hoặc đăng nhập nếu đã có tài khoản

2. **Tìm phim**
   - Xem danh sách phim trên trang chủ
   - Tìm kiếm theo tên hoặc thể loại
   - Click vào phim để xem chi tiết

3. **Đặt vé**
   - Chọn "Đặt vé" trên phim muốn xem
   - Chọn rạp chiếu
   - Chọn suất chiếu
   - Chọn ghế ngồi trên sơ đồ
   - Xác nhận và thanh toán

4. **Xem vé điện tử**
   - Vào "Profile" → "Lịch sử đặt vé"
   - Click nút "Chi tiết" trên vé
   - Xem thông tin và mã QR
   - Có thể in vé

### Dành cho Admin

1. **Đăng nhập Admin**
   - Sử dụng tài khoản admin
   - Truy cập menu Admin

2. **Quản lý Phim**
   - Thêm phim mới với đầy đủ thông tin
   - Upload poster
   - Gán thể loại
   - Cập nhật hoặc xóa phim

3. **Quản lý Rạp & Phòng**
   - Thêm rạp chiếu mới
   - Thêm phòng cho rạp
   - Cấu hình số ghế và loại ghế

4. **Quản lý Lịch chiếu**
   - Chọn chế độ xem (Ngày/Tuần/Tháng)
   - Sử dụng date picker để chọn ngày
   - Lọc theo rạp và phim
   - Thêm/sửa/xóa suất chiếu
   - Hệ thống tự động tính thời gian kết thúc

5. **Quản lý Booking**
   - Xem tất cả booking
   - Xác nhận hoặc hủy booking
   - Xem thống kê

## 🚀 Tính năng sắp tới

- [ ] 💳 Tích hợp cổng thanh toán (VNPay, Momo, ZaloPay)
- [ ] 📧 Gửi email xác nhận booking
- [ ] 📱 PWA - Progressive Web App
- [ ] 🔔 Push notifications
- [ ] ⭐ Đánh giá & review phim
- [ ] 🎁 Voucher & chương trình khuyến mãi
- [ ] 📊 Analytics & reports nâng cao
- [x] 📱 QR code cho vé điện tử
- [ ] 🎫 Quét QR tại rạp (mobile app cho nhân viên)
- [ ] 🌐 Đa ngôn ngữ (EN/VI)
- [ ] 🎨 Light/Dark theme toggle

## 🐛 Known Issues & Solutions

### Issue: MongoDB connection error
```
Solution: Kiểm tra MongoDB đang chạy và MONGO_URI trong .env đúng
```

### Issue: Port already in use
```
Solution: Đổi PORT trong .env hoặc kill process đang dùng port đó
```

### Issue: CORS error
```
Solution: Đảm bảo VITE_API_URL trong client/.env đúng với server URL
```