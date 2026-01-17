// TEST PAYMENT MODAL
// Paste this code in browser console to test payment modal without full booking flow

// Mock data for testing
const mockBookingData = {
  movie: {
    title: 'Avengers: Endgame',
    poster: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
    duration: 181,
    rated: 'P13'
  },
  showtime: {
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    cinema: {
      name: 'CGV Vincom',
      address: '191 Bà Triệu, Hai Bà Trưng, Hà Nội'
    },
    room: {
      name: 'Phòng 1',
      type: '2D'
    }
  },
  seats: [
    { seatNumber: 'A1', seatType: 'standard' },
    { seatNumber: 'A2', seatType: 'standard' }
  ],
  totalPrice: 150000
};

// Test function
function testPaymentModal() {
  console.log('🧪 Testing Payment Modal...');
  console.log('Mock Data:', mockBookingData);
  
  // Instructions
  console.log(`
  📝 Test Scenarios:
  
  1. QR Payment:
     - Check QR code generation
     - Watch countdown timer
     - Wait for auto-verify (simulated after 10s)
  
  2. Bank Transfer:
     - Copy bank info
     - Check transaction ID format
     - Click confirm button
  
  3. Cash Payment:
     - Read instructions
     - Click confirm button
  
  4. Timeout Test:
     - Wait 15 minutes (or change timer in code)
     - Check if modal closes and shows error
  
  5. Animation Test:
     - Check fade in/out
     - Verify confetti on success page
     - Test button hover effects
  `);
}

// Payment method details
const PAYMENT_CONFIG = {
  bank: {
    name: 'MB Bank',
    accountNo: '0123456789',
    accountName: 'CONG TY CINEMA BOOKING'
  },
  timeout: {
    qr: 15 * 60, // 15 minutes
    bank: 15 * 60,
    cash: 30 * 60 // 30 minutes before showtime
  },
  checkInterval: 5000 // 5 seconds
};

console.log('💳 Payment Configuration:', PAYMENT_CONFIG);

// Run test
testPaymentModal();

// Export for use
window.CINEMA_TEST = {
  mockBookingData,
  PAYMENT_CONFIG,
  testPaymentModal
};

console.log('✅ Test utilities loaded! Access via window.CINEMA_TEST');
