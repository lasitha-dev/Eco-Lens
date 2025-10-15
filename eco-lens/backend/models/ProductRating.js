const mongoose = require('mongoose');

const productRatingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be a whole number between 1 and 5'
    }
  },
  review: {
    type: String,
    trim: true,
    maxlength: 500
  },
  helpfulVotes: {
    type: Number,
    default: 0,
    min: 0
  },
  isVerifiedPurchase: {
    type: Boolean,
    default: true
  },
  isVisible: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to ensure one rating per user per product per order
productRatingSchema.index({ user: 1, product: 1, order: 1 }, { unique: true });

// Index for efficient querying
productRatingSchema.index({ product: 1, rating: 1 });
productRatingSchema.index({ user: 1, createdAt: -1 });
productRatingSchema.index({ isVisible: 1 });

// Virtual for rating ID string
productRatingSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
productRatingSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Static method to calculate average rating for a product
productRatingSchema.statics.calculateAverageRating = async function(productId) {
  const result = await this.aggregate([
    { $match: { product: mongoose.Types.ObjectId(productId), isVisible: true } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 },
        ratingDistribution: {
          $push: {
            rating: '$rating',
            count: 1
          }
        }
      }
    }
  ]);

  if (result.length === 0) {
    return {
      averageRating: 0,
      totalRatings: 0,
      ratingDistribution: {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0
      }
    };
  }

  const data = result[0];
  
  // Calculate rating distribution
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  data.ratingDistribution.forEach(item => {
    distribution[item.rating] = (distribution[item.rating] || 0) + item.count;
  });

  return {
    averageRating: Math.round(data.averageRating * 10) / 10, // Round to 1 decimal place
    totalRatings: data.totalRatings,
    ratingDistribution: distribution
  };
};

// Static method to get user's rating for a product
productRatingSchema.statics.getUserRating = async function(userId, productId) {
  return await this.findOne({ 
    user: userId, 
    product: productId 
  }).populate('product', 'name image');
};

// Static method to get recent ratings for a product
productRatingSchema.statics.getProductRatings = async function(productId, limit = 10, skip = 0) {
  return await this.find({ 
    product: productId, 
    isVisible: true 
  })
  .populate('user', 'firstName lastName')
  .sort({ createdAt: -1 })
  .limit(limit)
  .skip(skip);
};

const ProductRating = mongoose.model('ProductRating', productRatingSchema);

module.exports = ProductRating;
