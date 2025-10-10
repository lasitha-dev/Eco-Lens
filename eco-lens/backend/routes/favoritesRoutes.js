const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Helper function to handle async route errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// GET /api/favorites - Get user's favorite products
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find user and populate favorites with product details
    const user = await User.findById(userId)
      .populate({
        path: 'favorites',
        match: { isActive: true }, // Only include active products
        select: '-__v' // Exclude version field
      })
      .lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Transform products to match frontend format
    const favoriteProducts = (user.favorites || []).map(product => ({
      ...product,
      id: product._id.toString()
    }));

    res.json({
      favorites: favoriteProducts,
      count: favoriteProducts.length
    });

  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ 
      error: 'Failed to fetch favorites',
      message: error.message 
    });
  }
}));

// POST /api/favorites/:productId - Add product to favorites
router.post('/:productId', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    // Verify product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Add to user's favorites (if not already there)
    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { favorites: productId } }, // $addToSet prevents duplicates
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`✅ Product ${product.name} added to favorites for user ${user.email}`);
    
    res.json({
      message: 'Product added to favorites',
      productId,
      productName: product.name,
      favoritesCount: user.favorites.length
    });

  } catch (error) {
    console.error('Error adding to favorites:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid product ID format' });
    }
    
    res.status(500).json({ 
      error: 'Failed to add to favorites',
      message: error.message 
    });
  }
}));

// DELETE /api/favorites/:productId - Remove product from favorites
router.delete('/:productId', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    // Remove from user's favorites
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { favorites: productId } }, // $pull removes the item
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`✅ Product removed from favorites for user ${user.email}`);
    
    res.json({
      message: 'Product removed from favorites',
      productId,
      favoritesCount: user.favorites.length
    });

  } catch (error) {
    console.error('Error removing from favorites:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid product ID format' });
    }
    
    res.status(500).json({ 
      error: 'Failed to remove from favorites',
      message: error.message 
    });
  }
}));

// GET /api/favorites/check/:productId - Check if product is in favorites
router.get('/check/:productId', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const user = await User.findById(userId).lean();
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isFavorite = user.favorites && user.favorites.some(
      favId => favId.toString() === productId
    );

    res.json({
      productId,
      isFavorite,
      favoritesCount: user.favorites ? user.favorites.length : 0
    });

  } catch (error) {
    console.error('Error checking favorite status:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid product ID format' });
    }
    
    res.status(500).json({ 
      error: 'Failed to check favorite status',
      message: error.message 
    });
  }
}));

module.exports = router;
