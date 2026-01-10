// Script để cập nhật totalSeats cho các phòng đã tồn tại
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Room = require('./models/Room');

// Load env vars
dotenv.config();

const updateTotalSeats = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Đã kết nối MongoDB');

    // Lấy tất cả phòng
    const rooms = await Room.find({});
    console.log(`📊 Tìm thấy ${rooms.length} phòng`);

    let updated = 0;
    for (const room of rooms) {
      const calculatedTotal = room.rows * room.seatsPerRow;
      
      if (room.totalSeats !== calculatedTotal) {
        room.totalSeats = calculatedTotal;
        await room.save();
        console.log(`✅ Cập nhật phòng ${room.name}: ${calculatedTotal} ghế`);
        updated++;
      }
    }

    console.log(`\n🎉 Hoàn thành! Đã cập nhật ${updated} phòng`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
};

updateTotalSeats();
