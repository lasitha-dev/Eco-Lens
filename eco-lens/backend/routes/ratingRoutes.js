const express = require('express');
const mongoose = require('mongoose');
const ProductRating = require('../models/ProductRating');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Submit a product rating
router.post('/submit', authenticateToken, async (req, res) => {
  try {
    const { productId, orderId, rating, review } = req.body;
    const userId = req.user.id;

    // Validation
    if (!productId || !orderId || !rating) {
      return res.status(400).json({ 
        error: 'Product ID, Order ID, and rating are required' 
      });
    }

    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res.status(400).json({ 
        error: 'Rating must be a whole number between 1 and 5' 
      });
    }

    // Verify the order belongs to the user and contains the product
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
      'items.product': productId,
      paymentStatus: 'paid'
    });

    if (!order) {
      return res.status(400).json({ 
        error: 'Order not found or does not contain this product' 
      });
    }

    // Check if user has already rated this product for this order
    const existingRating = await ProductRating.findOne({
      user: userId,
      product: productId,
      order: orderId
    });

    if (existingRating) {
      return res.status(400).json({ 
        error: 'You have already rated this product for this order' 
      });
    }

    // Create new rating
    const productRating = new ProductRating({
      user: userId,
      product: productId,
      order: orderId,
      rating,
      review: review || '',
      isVerifiedPurchase: true
    });

    await productRating.save();

    // Update product rating statistics
    await updateProductRatingStats(productId);

    // Populate the rating with user info for response
    await productRating.populate('user', 'firstName lastName');

    res.status(201).json({
      message: 'Rating submitted successfully',
      rating: productRating
    });

  } catch (error) {
    console.error('Rating submission error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get product ratings
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const skip = (page - 1) * limit;

    // Get ratings with pagination
    const ratings = await ProductRating.getProductRatings(
      productId, 
      parseInt(limit), 
      parseInt(skip)
    );

    // Get total count for pagination
    const totalRatings = await ProductRating.countDocuments({
      product: productId,
      isVisible: true
    });

    // Get rating statistics
    const stats = await ProductRating.calculateAverageRating(productId);

    res.json({
      ratings,
      stats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalRatings / limit),
        totalRatings,
        hasNext: skip + ratings.length < totalRatings,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get product ratings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's rating for a specific product
router.get('/user/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const rating = await ProductRating.getUserRating(userId, productId);

    res.json({ rating });

  } catch (error) {
    console.error('Get user rating error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user's rating
router.patch('/:ratingId', authenticateToken, async (req, res) => {
  try {
    const { ratingId } = req.params;
    const { rating, review } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res.status(400).json({ 
        error: 'Rating must be a whole number between 1 and 5' 
      });
    }

    const productRating = await ProductRating.findOne({
      _id: ratingId,
      user: userId
    });

    if (!productRating) {
      return res.status(404).json({ error: 'Rating not found' });
    }

    // Update rating
    productRating.rating = rating;
    if (review !== undefined) {
      productRating.review = review;
    }

    await productRating.save();

    // Update product rating statistics
    await updateProductRatingStats(productRating.product);

    res.json({
      message: 'Rating updated successfully',
      rating: productRating
    });

  } catch (error) {
    console.error('Update rating error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user's rating
router.delete('/:ratingId', authenticateToken, async (req, res) => {
  try {
    const { ratingId } = req.params;
    const userId = req.user.id;

    const productRating = await ProductRating.findOne({
      _id: ratingId,
      user: userId
    });

    if (!productRating) {
      return res.status(404).json({ error: 'Rating not found' });
    }

    const productId = productRating.product;

    // Soft delete by setting isVisible to false
    productRating.isVisible = false;
    await productRating.save();

    // Update product rating statistics
    await updateProductRatingStats(productId);

    res.json({ message: 'Rating deleted successfully' });

  } catch (error) {
    console.error('Delete rating error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get products that need rating (for post-purchase popup)
router.get('/pending-ratings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find orders that are paid and delivered but don't have ratings yet
    const orders = await Order.find({
      user: userId,
      paymentStatus: 'paid',
      orderStatus: { $in: ['delivered', 'shipped'] }
    }).populate('items.product', 'name image');

    const pendingRatings = [];

    for (const order of orders) {
      for (const item of order.items) {
        // Check if user has already rated this product for this order
        const existingRating = await ProductRating.findOne({
          user: userId,
          product: item.product._id,
          order: order._id
        });

        if (!existingRating) {
          pendingRatings.push({
            orderId: order._id,
            orderNumber: order.orderNumber,
            product: {
              id: item.product._id,
              name: item.product.name,
              image: item.product.image,
              quantity: item.quantity
            },
            purchasedAt: order.createdAt
          });
        }
      }
    }

    res.json({ pendingRatings });

  } catch (error) {
    console.error('Get pending ratings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper function to update product rating statistics
async function updateProductRatingStats(productId) {
  try {
    const stats = await ProductRating.calculateAverageRating(productId);
    
    await Product.findByIdAndUpdate(productId, {
      $set: {
        rating: stats.averageRating,
        reviewCount: stats.totalRatings,
        'ratingStats.averageRating': stats.averageRating,
        'ratingStats.totalRatings': stats.totalRatings,
        'ratingStats.ratingDistribution': stats.ratingDistribution,
        'ratingStats.lastUpdated': new Date()
      }
    });

    console.log(`Updated rating stats for product ${productId}:`, stats);
  } catch (error) {
    console.error('Error updating product rating stats:', error);
  }
}

module.exports = router;
