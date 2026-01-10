// Script để thêm các thể loại phim mặc định vào database
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Genre = require('./models/Genre');

// Load env vars
dotenv.config();

const defaultGenres = [
  { name: 'Hành động', description: 'Phim hành động với nhiều cảnh chiến đấu và mạo hiểm' },
  { name: 'Phiêu lưu', description: 'Phim về những cuộc phiêu lưu khám phá' },
  { name: 'Hoạt hình', description: 'Phim hoạt hình dành cho mọi lứa tuổi' },
  { name: 'Hài', description: 'Phim hài hước, giải trí' },
  { name: 'Tội phạm', description: 'Phim về tội phạm và điều tra' },
  { name: 'Tài liệu', description: 'Phim tài liệu về sự kiện thực tế' },
  { name: 'Chính kịch', description: 'Phim kịch tính với cốt truyện sâu sắc' },
  { name: 'Gia đình', description: 'Phim dành cho cả gia đình' },
  { name: 'Giả tưởng', description: 'Phim về thế giới tưởng tượng' },
  { name: 'Kinh dị', description: 'Phim kinh dị, rùng rợn' },
  { name: 'Lãng mạn', description: 'Phim tình cảm lãng mạn' },
  { name: 'Khoa học viễn tưởng', description: 'Phim về khoa học và công nghệ tương lai' },
  { name: 'Bí ẩn', description: 'Phim về những bí ẩn cần giải đáp' },
  { name: 'Chiến tranh', description: 'Phim về chiến tranh và lịch sử' },
  { name: 'Tâm lý', description: 'Phim tâm lý, phân tích nhân vật sâu sắc' },
  { name: 'Âm nhạc', description: 'Phim về âm nhạc và nghệ sĩ' },
  { name: 'Thể thao', description: 'Phim về thể thao và vận động viên' },
  { name: 'Võ thuật', description: 'Phim võ thuật châu Á' },
  { name: 'Siêu anh hùng', description: 'Phim về các siêu anh hùng' },
  { name: 'Anime', description: 'Phim hoạt hình Nhật Bản' }
];

const seedGenres = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Đã kết nối MongoDB');

    // Xóa các thể loại cũ (nếu muốn)
    // await Genre.deleteMany({});
    // console.log('🗑️  Đã xóa thể loại cũ');

    // Thêm các thể loại mới
    let added = 0;
    let skipped = 0;

    for (const genreData of defaultGenres) {
      const existing = await Genre.findOne({ name: genreData.name });
      if (!existing) {
        await Genre.create(genreData);
        console.log(`✅ Đã thêm: ${genreData.name}`);
        added++;
      } else {
        console.log(`⏭️  Bỏ qua (đã tồn tại): ${genreData.name}`);
        skipped++;
      }
    }

    console.log(`\n🎉 Hoàn thành!`);
    console.log(`   - Đã thêm: ${added} thể loại`);
    console.log(`   - Bỏ qua: ${skipped} thể loại`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
};

seedGenres();
