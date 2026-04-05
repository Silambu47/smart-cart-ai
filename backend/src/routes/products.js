const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  getFeaturedProducts,
  getCategories,
  getRecommended,
  getRecentlyViewed,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const { productRules, validate } = require('../middleware/validate');

// Public routes
router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/', getProducts);

// Protected routes
router.get('/recently-viewed', protect, getRecentlyViewed);
router.get('/:id/recommended', getRecommended);
router.get('/:id', optionalAuth, getProduct);

// Admin routes
router.post('/', protect, authorize('admin'), productRules, validate, createProduct);
router.put('/:id', protect, authorize('admin'), productRules, validate, updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

// Middleware to optionally attach user (for recently viewed tracking)
function optionalAuth(req, res, next) {
  const { protect: protectMiddleware } = require('../middleware/auth');
  if (req.headers.authorization) {
    return protectMiddleware(req, res, next);
  }
  next();
}

module.exports = router;
