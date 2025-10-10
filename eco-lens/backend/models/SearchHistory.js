const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  searchQuery: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  searchType: {
    type: String,
    enum: ['product', 'category', 'brand', 'material', 'general'],
    default: 'general'
  },
  category: {
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
  },
  filters: {
    sustainabilityGrade: {
      type: String,
      enum: ['A', 'B', 'C', 'D', 'E', 'F']
    },
    priceRange: {
      min: { type: Number, min: 0 },
      max: { type: Number, min: 0 }
    },
    materials: [{
      type: String,
      trim: true
    }],
    brands: [{
      type: String,
      trim: true
    }]
  },
  resultsCount: {
    type: Number,
    default: 0
  },
  clickedProducts: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    clickedAt: {
      type: Date,
      default: Date.now
    },
    timeSpent: {
      type: Number, // in seconds
      default: 0
    }
  }],
  sessionId: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    maxlength: 500
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for efficient querying
searchHistorySchema.index({ userId: 1, timestamp: -1 });
searchHistorySchema.index({ userId: 1, searchType: 1, timestamp: -1 });
searchHistorySchema.index({ userId: 1, category: 1, timestamp: -1 });
searchHistorySchema.index({ 'filters.sustainabilityGrade': 1, timestamp: -1 });
searchHistorySchema.index({ sessionId: 1 });

// Virtual for search recency (days since search)
searchHistorySchema.virtual('daysAgo').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.timestamp);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Static method to get user search patterns
searchHistorySchema.statics.getUserSearchPatterns = async function(userId, days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const patterns = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        timestamp: { $gte: cutoffDate }
      }
    },
    {
      $group: {
        _id: null,
        totalSearches: { $sum: 1 },
        categories: {
          $push: {
            $cond: [
              { $ne: ['$category', null] },
              '$category',
              null
            ]
          }
        },
        searchTypes: {
          $push: '$searchType'
        },
        sustainabilityGrades: {
          $push: {
            $cond: [
              { $ne: ['$filters.sustainabilityGrade', null] },
              '$filters.sustainabilityGrade',
              null
            ]
          }
        },
        materials: {
          $push: {
            $cond: [
              { $ne: ['$filters.materials', null] },
              '$filters.materials',
              []
            ]
          }
        },
        brands: {
          $push: {
            $cond: [
              { $ne: ['$filters.brands', null] },
              '$filters.brands',
              []
            ]
          }
        },
        recentSearches: {
          $push: {
            query: '$searchQuery',
            timestamp: '$timestamp',
            category: '$category',
            searchType: '$searchType'
          }
        }
      }
    },
    {
      $project: {
        totalSearches: 1,
        categoryFrequency: {
          $reduce: {
            input: '$categories',
            initialValue: {},
            in: {
              $mergeObjects: [
                '$$value',
                {
                  $arrayToObject: [
                    [{
                      k: '$$this',
                      v: {
                        $add: [
                          { $ifNull: [{ $getField: { field: '$$this', input: '$$value' } }, 0] },
                          1
                        ]
                      }
                    }]
                  ]
                }
              ]
            }
          }
        },
        searchTypeFrequency: {
          $reduce: {
            input: '$searchTypes',
            initialValue: {},
            in: {
              $mergeObjects: [
                '$$value',
                {
                  $arrayToObject: [
                    [{
                      k: '$$this',
                      v: {
                        $add: [
                          { $ifNull: [{ $getField: { field: '$$this', input: '$$value' } }, 0] },
                          1
                        ]
                      }
                    }]
                  ]
                }
              ]
            }
          }
        },
        sustainabilityGradeFrequency: {
          $reduce: {
            input: '$sustainabilityGrades',
            initialValue: {},
            in: {
              $mergeObjects: [
                '$$value',
                {
                  $arrayToObject: [
                    [{
                      k: '$$this',
                      v: {
                        $add: [
                          { $ifNull: [{ $getField: { field: '$$this', input: '$$value' } }, 0] },
                          1
                        ]
                      }
                    }]
                  ]
                }
              ]
            }
          }
        },
        allMaterials: {
          $reduce: {
            input: '$materials',
            initialValue: [],
            in: { $concatArrays: ['$$value', '$$this'] }
          }
        },
        allBrands: {
          $reduce: {
            input: '$brands',
            initialValue: [],
            in: { $concatArrays: ['$$value', '$$this'] }
          }
        },
        recentSearches: {
          $sortArray: {
            input: '$recentSearches',
            sortBy: { timestamp: -1 }
          }
        }
      }
    }
  ]);

  return patterns[0] || {
    totalSearches: 0,
    categoryFrequency: {},
    searchTypeFrequency: {},
    sustainabilityGradeFrequency: {},
    allMaterials: [],
    allBrands: [],
    recentSearches: []
  };
};

// Static method to get trending searches
searchHistorySchema.statics.getTrendingSearches = async function(days = 7, limit = 10) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return await this.aggregate([
    {
      $match: {
        timestamp: { $gte: cutoffDate }
      }
    },
    {
      $group: {
        _id: '$searchQuery',
        count: { $sum: 1 },
        categories: { $addToSet: '$category' },
        avgResultsCount: { $avg: '$resultsCount' }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: limit
    },
    {
      $project: {
        searchQuery: '$_id',
        count: 1,
        categories: 1,
        avgResultsCount: 1,
        _id: 0
      }
    }
  ]);
};

module.exports = mongoose.model('SearchHistory', searchHistorySchema);
