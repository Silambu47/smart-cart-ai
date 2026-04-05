const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');
const { orderRules, validate } = require('../middleware/validate');

router.use(protect); // All order routes require auth

router.post('/', orderRules, validate, createOrder);
router.get('/', getMyOrders);

// Admin routes
router.get('/admin/stats', authorize('admin'), getDashboardStats);
router.get('/admin/all', authorize('admin'), getAllOrders);
router.put('/:id/status', authorize('admin'), updateOrderStatus);

router.get('/:id', getOrder);

module.exports = router;
