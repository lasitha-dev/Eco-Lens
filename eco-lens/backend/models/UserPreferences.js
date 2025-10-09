const mongoose = require('mongoose');

const userPreferencesSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  surveyCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  },
  preferences: {
    productInterests: [{
      type: String,
      enum: [
        'Electronics',
        'Fashion & Apparel', 
        'Home & Kitchen',
        'Books & Learning',
        'Beauty & Personal Care',
        'Fitness & Wellness',
        'Gaming',
        'Automotive'
      ]
    }],
    shoppingFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'occasionally', 'Occasionally', 'sales-only'],
      default: 'occasionally'
    },
    shoppingPurpose: {
      type: String,
      enum: ['personal', 'Personal use', 'gifts', 'business', 'browsing'],
      default: 'personal'
    },
    priceRange: {
      type: String,
      enum: ['budget', 'Budget-friendly', 'mid-range', 'Mid-range', 'premium', 'Premium'],
      default: 'mid-range'
    },
    wantsDeals: {
      type: Boolean,
      default: true
    },
    preferredDevices: [{
      type: String,
      enum: ['mobile', 'desktop', 'tablet', 'all']
    }],
    suggestionType: {
      type: String,
      enum: ['trends', 'activity', 'both', 'Both', 'yes,-based on trends', 'none'],
      default: 'both'
    },
    ecoFriendlyPreference: {
      type: String,
      enum: ['yes', 'no-preference', 'not-important'],
      default: 'yes'
    },
    interestedInNewProducts: {
      type: Boolean,
      default: true
    },
    dashboardCategories: [{
      type: String,
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
    }]
  },
  aiRecommendations: {
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    recommendedProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    personalizedFilters: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    engagementScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Index for efficient querying
userPreferencesSchema.index({ userId: 1 }, { unique: true });
userPreferencesSchema.index({ 'preferences.dashboardCategories': 1 });

const UserPreferences = mongoose.model('UserPreferences', userPreferencesSchema);

module.exports = UserPreferences;
