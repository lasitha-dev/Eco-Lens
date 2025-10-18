const mongoose = require('mongoose');

const ecoMetricsSchema = new mongoose.Schema({
  materialsScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 50
  },
  carbonFootprint: {
    type: Number,
    required: true,
    min: 0,
    default: 1.0
  },
  packagingType: {
    type: String,
    required: true,
    enum: ['minimal', 'paper', 'biodegradable', 'plastic'],
    default: 'plastic'
  },
  manufacturingProcess: {
    type: String,
    required: true,
    enum: ['sustainable', 'renewable-energy', 'conventional'],
    default: 'conventional'
  },
  productLifespan: {
    type: Number,
    required: true,
    min: 1,
    default: 12
  },
  recyclablePercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 50
  },
  biodegradablePercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0
  }
}, { _id: false });

const sellerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  certifications: [{
    type: String,
    trim: true
  }]
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Electronics',
      'Fashion',
      'Home & Garden',
      'Food & Beverages',
      'Personal Care',
      'Sports & Outdoors',
      'Books & Stationery',
      'Toys & Games'
    ]
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  image: {
    type: String,
    required: true,
    trim: true
  },
  ecoMetrics: {
    type: ecoMetricsSchema,
    required: true
  },
  sustainabilityScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  sustainabilityGrade: {
    type: String,
    required: true,
    enum: ['A', 'B', 'C', 'D', 'E', 'F']
  },
  seller: {
    type: sellerSchema,
    required: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviewCount: {
    type: Number,
    min: 0,
    default: 0
  },
  ratingStats: {
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    totalRatings: {
      type: Number,
      min: 0,
      default: 0
    },
    ratingDistribution: {
      type: {
        '1': { type: Number, default: 0 },
        '2': { type: Number, default: 0 },
        '3': { type: Number, default: 0 },
        '4': { type: Number, default: 0 },
        '5': { type: Number, default: 0 }
      },
      default: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient searching
productSchema.index({ name: 'text', description: 'text', category: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ sustainabilityGrade: 1 });
productSchema.index({ sustainabilityScore: -1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ isActive: 1 });

// Virtual for product ID string
productSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Product', productSchema);