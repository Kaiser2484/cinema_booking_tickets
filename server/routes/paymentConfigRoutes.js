const express = require('express');
const router = express.Router();
const {
  getAllPaymentConfigs,
  getPrimaryPaymentConfig,
  getPaymentConfigById,
  createPaymentConfig,
  updatePaymentConfig,
  deletePaymentConfig,
  setPrimaryConfig
} = require('../controllers/paymentConfigController');
const { protect, admin } = require('../middlewares/auth');

// Public routes
router.get('/', getAllPaymentConfigs);
router.get('/primary', getPrimaryPaymentConfig);

// Admin routes
router.post('/', protect, admin, createPaymentConfig);
router.get('/:id', protect, admin, getPaymentConfigById);
router.put('/:id', protect, admin, updatePaymentConfig);
router.delete('/:id', protect, admin, deletePaymentConfig);
router.put('/:id/set-primary', protect, admin, setPrimaryConfig);

module.exports = router;
