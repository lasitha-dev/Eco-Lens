const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  productImage: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  sustainabilityScore: {
    type: Number,
    min: 0,
    max: 100
  },
  sustainabilityGrade: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'E', 'F']
  }
}, { _id: false });

const shippingAddressSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  addressLine1: {
    type: String,
    required: true
  },
  addressLine2: String,
  city: {
    type: String,
    required: true
  },
  state: String,
  postalCode: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  phone: String
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  totalItems: {
    type: Number,
    required: true,
    min: 0
  },
  shippingAddress: {
    type: shippingAddressSchema,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'processing', 'processed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  stripePaymentIntentId: {
    type: String
  },
  stripeSessionId: {
    type: String
  },
  paidAt: {
    type: Date
  },
  shippedAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  ecoImpact: {
    averageSustainabilityScore: {
      type: Number,
      min: 0,
      max: 100
    },
    totalCarbonFootprint: {
      type: Number,
      min: 0
    }
  }
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.orderNumber = `ECO-${timestamp}-${random}`;
  }
  next();
});

// Index for efficient querying
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
