const mongoose = require('mongoose');

const sustainabilityGoalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  goalType: {
    type: String,
    required: true,
    enum: ['grade-based', 'score-based', 'category-based'],
    default: 'grade-based'
  },
  goalConfig: {
    // For grade-based goals (e.g., "Only buy A/B rated products")
    targetGrades: [{
      type: String,
      enum: ['A', 'B', 'C', 'D', 'E', 'F']
    }],
    
    // For score-based goals (e.g., "Only buy products with 80+ sustainability score")
    minimumScore: {
      type: Number,
      min: 0,
      max: 100
    },
    
    // For category-based goals (e.g., "Only buy sustainable Electronics")
    categories: [{
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
    }],
    
    // Goal threshold percentage (e.g., 80% of purchases should meet criteria)
    percentage: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
      default: 80
    }
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 300
  },
  isActive: {
    type: Boolean,
    default: true
  },
  progress: {
    totalPurchases: {
      type: Number,
      default: 0,
      min: 0
    },
    goalMetPurchases: {
      type: Number,
      default: 0,
      min: 0
    },
    currentPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
sustainabilityGoalSchema.index({ userId: 1, isActive: 1 });
sustainabilityGoalSchema.index({ userId: 1, createdAt: -1 });

// Virtual for goal achievement status
sustainabilityGoalSchema.virtual('isAchieved').get(function() {
  return this.progress.currentPercentage >= this.goalConfig.percentage;
});

// Virtual for goal progress status
sustainabilityGoalSchema.virtual('progressStatus').get(function() {
  const percentage = this.progress.currentPercentage;
  if (percentage >= this.goalConfig.percentage) return 'achieved';
  if (percentage >= this.goalConfig.percentage * 0.7) return 'close';
  if (percentage >= this.goalConfig.percentage * 0.3) return 'in-progress';
  return 'starting';
});

// Method to update progress
sustainabilityGoalSchema.methods.updateProgress = function(totalPurchases, goalMetPurchases) {
  this.progress.totalPurchases = totalPurchases;
  this.progress.goalMetPurchases = goalMetPurchases;
  this.progress.currentPercentage = totalPurchases > 0 
    ? Math.round((goalMetPurchases / totalPurchases) * 100) 
    : 0;
  this.progress.lastUpdated = new Date();
  this.updatedAt = new Date();
};

// Method to check if a product meets this goal's criteria
sustainabilityGoalSchema.methods.doesProductMeetGoal = function(product) {
  switch (this.goalType) {
    case 'grade-based':
      return this.goalConfig.targetGrades.includes(product.sustainabilityGrade);
    
    case 'score-based':
      return product.sustainabilityScore >= this.goalConfig.minimumScore;
    
    case 'category-based':
      return this.goalConfig.categories.includes(product.category) &&
             this.goalConfig.targetGrades.includes(product.sustainabilityGrade);
    
    default:
      return false;
  }
};

// Static method to find active goals for a user
sustainabilityGoalSchema.statics.findActiveGoalsForUser = function(userId) {
  return this.find({ userId, isActive: true }).sort({ createdAt: -1 });
};

// Pre-save middleware to update the updatedAt field
sustainabilityGoalSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const SustainabilityGoal = mongoose.model('SustainabilityGoal', sustainabilityGoalSchema);

module.exports = SustainabilityGoal;
