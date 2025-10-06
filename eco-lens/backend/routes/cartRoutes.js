const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// POST /cart/add - Add item to cart
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user.userId;

    // Validate product exists and has stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Check if product already in cart
    const existingItem = cart.items.find(item =>
      item.productId.toString() === productId
    );

    if (existingItem) {
      // Update quantity
      existingItem.quantity += quantity;
      if (product.stock < existingItem.quantity) {
        return res.status(400).json({ error: 'Insufficient stock' });
      }
    } else {
      // Add new item
      cart.items.push({ productId, quantity });
    }

    await cart.save();
    await cart.populate('items.productId');

    res.json({
      message: 'Item added to cart',
      cart: {
        items: cart.items,
        totalAmount: cart.totalAmount
      }
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /cart/:userId - Get user's cart
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user can only access their own cart
    if (req.user.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart) {
      return res.json({ items: [], totalAmount: 0 });
    }

    res.json({
      items: cart.items,
      totalAmount: cart.totalAmount
    });

  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /cart/:userId/:productId - Update item quantity
router.put('/:userId/:productId', authenticateToken, async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const { quantity } = req.body;

    // Verify user can only modify their own cart
    if (req.user.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than 0' });
    }

    // Check stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const item = cart.items.find(item =>
      item.productId.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ error: 'Item not in cart' });
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate('items.productId');

    res.json({
      message: 'Cart updated',
      cart: {
        items: cart.items,
        totalAmount: cart.totalAmount
      }
    });

  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /cart/:userId/:productId - Remove item from cart
router.delete('/:userId/:productId', authenticateToken, async (req, res) => {
  try {
    const { userId, productId } = req.params;

    // Verify user can only modify their own cart
    if (req.user.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    cart.items = cart.items.filter(item =>
      item.productId.toString() !== productId
    );

    await cart.save();
    await cart.populate('items.productId');

    res.json({
      message: 'Item removed from cart',
      cart: {
        items: cart.items,
        totalAmount: cart.totalAmount
      }
    });

  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /cart/:userId - Clear entire cart
router.delete('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user can only modify their own cart
    if (req.user.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const cart = await Cart.findOneAndUpdate(
      { userId },
      { items: [], totalAmount: 0 },
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    res.json({
      message: 'Cart cleared',
      cart: {
        items: [],
        totalAmount: 0
      }
    });

  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;