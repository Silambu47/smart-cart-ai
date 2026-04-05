const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const { paginate, paginationResponse } = require('../utils/pagination');

// @desc    Create order from cart
// @route   POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return next(new AppError('Cart is empty.', 400));
    }

    // Verify stock availability
    for (const item of cart.items) {
      if (!item.product || !item.product.isActive) {
        return next(new AppError(`Product ${item.product?.name || 'unknown'} is no longer available.`, 400));
      }
      if (item.product.stock < item.quantity) {
        return next(new AppError(`Insufficient stock for ${item.product.name}.`, 400));
      }
    }

    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      image: item.product.images?.[0] || '',
    }));

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod || 'cod',
      totalAmount,
    });

    // Decrement stock
    const bulkOps = cart.items.map((item) => ({
      updateOne: {
        filter: { _id: item.product._id },
        update: { $inc: { stock: -item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOps);

    // Clear cart
    await Cart.findOneAndDelete({ user: req.user._id });

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user orders
// @route   GET /api/orders
exports.getMyOrders = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query);

    const [orders, total] = await Promise.all([
      Order.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments({ user: req.user._id }),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: paginationResponse(total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return next(new AppError('Order not found.', 404));
    }

    // Users can only see their own orders; admins can see all
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to view this order.', 403));
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders/admin/all
exports.getAllOrders = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query);

    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: paginationResponse(total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return next(new AppError('Order not found.', 404));
    }

    order.status = status;
    if (status === 'delivered') {
      order.deliveredAt = new Date();
    }

    await order.save();

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/orders/admin/stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [totalOrders, totalRevenue, ordersByStatus, recentOrders] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Order.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const totalProducts = await Product.countDocuments({ isActive: true });
    const totalUsers = await (require('../models/User')).countDocuments();

    res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalProducts,
        totalUsers,
        ordersByStatus: ordersByStatus.map((s) => ({
          status: s._id,
          count: s.count,
        })),
        recentOrders,
      },
    });
  } catch (error) {
    next(error);
  }
};
