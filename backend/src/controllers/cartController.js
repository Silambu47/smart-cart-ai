const Cart = require('../models/Cart');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');

// @desc    Get user cart
// @route   GET /api/cart
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate(
      'items.product',
      'name images price stock'
    );

    if (!cart) {
      cart = { items: [], totalPrice: 0, totalItems: 0 };
    }

    res.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return next(new AppError('Product not found.', 404));
    }

    if (product.stock < quantity) {
      return next(new AppError('Insufficient stock.', 400));
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      const newQty = cart.items[existingItemIndex].quantity + quantity;
      if (newQty > product.stock) {
        return next(new AppError('Insufficient stock.', 400));
      }
      cart.items[existingItemIndex].quantity = newQty;
      cart.items[existingItemIndex].price = product.price;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
      });
    }

    await cart.save();

    cart = await Cart.findById(cart._id).populate(
      'items.product',
      'name images price stock'
    );

    res.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return next(new AppError('Quantity must be at least 1.', 400));
    }

    const product = await Product.findById(req.params.productId);
    if (!product) {
      return next(new AppError('Product not found.', 404));
    }

    if (quantity > product.stock) {
      return next(new AppError('Insufficient stock.', 400));
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return next(new AppError('Cart not found.', 404));
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === req.params.productId
    );

    if (itemIndex === -1) {
      return next(new AppError('Item not found in cart.', 404));
    }

    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].price = product.price;
    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate(
      'items.product',
      'name images price stock'
    );

    res.json({
      success: true,
      data: updatedCart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
exports.removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return next(new AppError('Cart not found.', 404));
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== req.params.productId
    );

    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate(
      'items.product',
      'name images price stock'
    );

    res.json({
      success: true,
      data: updatedCart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
exports.clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndDelete({ user: req.user._id });
    res.json({
      success: true,
      message: 'Cart cleared.',
    });
  } catch (error) {
    next(error);
  }
};
