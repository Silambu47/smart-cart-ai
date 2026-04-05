const Product = require('../models/Product');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { paginate, paginationResponse } = require('../utils/pagination');

// @desc    Get all products (with search, filter, sort, pagination)
// @route   GET /api/products
exports.getProducts = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query);
    const filter = { isActive: true };

    // Category filter
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }

    // Brand filter
    if (req.query.brand) {
      filter.brand = req.query.brand;
    }

    // Search by text
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    // In stock filter
    if (req.query.inStock === 'true') {
      filter.stock = { $gt: 0 };
    }

    // Sort
    let sort = { createdAt: -1 };
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'price_asc':
          sort = { price: 1 };
          break;
        case 'price_desc':
          sort = { price: -1 };
          break;
        case 'rating':
          sort = { 'ratings.average': -1 };
          break;
        case 'newest':
          sort = { createdAt: -1 };
          break;
        case 'name':
          sort = { name: 1 };
          break;
      }
    }

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: paginationResponse(total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(new AppError('Product not found.', 404));
    }

    // Track recently viewed if user is logged in
    if (req.user) {
      await req.user.addToRecentlyViewed(product._id);
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isFeatured: true, isActive: true })
      .limit(8)
      .lean();

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product categories with count
// @route   GET /api/products/categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: categories.map((c) => ({ name: c._id, count: c.count })),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recommended products (by category)
// @route   GET /api/products/:id/recommended
exports.getRecommended = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(new AppError('Product not found.', 404));
    }

    const recommended = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true,
    })
      .limit(6)
      .lean();

    res.json({
      success: true,
      data: recommended,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recently viewed products
// @route   GET /api/products/recently-viewed
exports.getRecentlyViewed = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'recentlyViewed',
      match: { isActive: true },
      options: { limit: 10 },
    });

    res.json({
      success: true,
      data: user.recentlyViewed,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product (admin)
// @route   POST /api/products
exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product (admin)
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return next(new AppError('Product not found.', 404));
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product (admin - soft delete)
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return next(new AppError('Product not found.', 404));
    }

    res.json({
      success: true,
      message: 'Product deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
