const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { authenticateToken } = require('../middleware/auth');

// Helper function to get card brand from number
const getCardBrand = (cardNumber) => {
  const firstDigit = cardNumber.charAt(0);
  if (firstDigit === '4') return 'visa';
  if (firstDigit === '5') return 'mastercard';
  return 'unknown';
};

// Create payment intent with custom card details (in-app payment)
router.post('/create-payment-intent', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { shippingAddress, paymentDetails } = req.body;
    
    if (!shippingAddress || !paymentDetails) {
      return res.status(400).json({
        success: false,
        error: 'Shipping address and payment details are required'
      });
    }
    
    // Get user's cart
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cart is empty'
      });
    }
    
    // Validate stock availability for all items
    for (const item of cart.items) {
      if (!item.product.isActive) {
        return res.status(400).json({
          success: false,
          error: `Product "${item.product.name}" is no longer available`
        });
      }
      
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for "${item.product.name}"`
        });
      }
    }
    
    // Create order items
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      productName: item.product.name,
      productImage: item.product.image,
      quantity: item.quantity,
      price: item.price,
      sustainabilityScore: item.product.sustainabilityScore,
      sustainabilityGrade: item.product.sustainabilityGrade
    }));
    
    // For test mode, simulate payment based on test card numbers
    const cardNumber = paymentDetails.cardNumber;
    let paymentStatus = 'paid';
    let paymentIntentId = `pi_test_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Stripe test card behaviors
    if (cardNumber === '4000000000000002') {
      // Decline card
      return res.status(400).json({
        success: false,
        error: 'Your card was declined. Please try another card.'
      });
    }
    
    // Generate order number
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderNumber = `ECO-${timestamp}-${random}`;
    
    // Create order with paid status
    const order = new Order({
      user: userId,
      orderNumber,
      items: orderItems,
      totalAmount: cart.totalAmount,
      totalItems: cart.totalItems,
      shippingAddress,
      paymentStatus,
      orderStatus: 'processing',
      stripePaymentIntentId: paymentIntentId,
      paidAt: new Date()
    });
    
    await order.save();
    
    // Update product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity }
      });
    }
    
    // Clear user's cart
    cart.items = [];
    await cart.save();
    
    res.json({
      success: true,
      message: 'Payment successful',
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus
      }
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process payment',
      details: error.message
    });
  }
});

// Create checkout session with Stripe
router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { shippingAddress } = req.body;
    
    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        error: 'Shipping address is required'
      });
    }
    
    // Get user's cart
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cart is empty'
      });
    }
    
    // Validate stock availability for all items
    for (const item of cart.items) {
      if (!item.product.isActive) {
        return res.status(400).json({
          success: false,
          error: `Product "${item.product.name}" is no longer available`
        });
      }
      
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for "${item.product.name}"`
        });
      }
    }
    
    // Create line items for Stripe
    const lineItems = cart.items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.product.name,
          description: item.product.description,
          images: item.product.image ? [item.product.image] : [],
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'exp://localhost:8081'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'exp://localhost:8081'}/payment-cancel`,
      customer_email: req.user.email,
      metadata: {
        userId: userId.toString(),
        shippingAddress: JSON.stringify(shippingAddress)
      }
    });
    
    // Create order in pending state
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      productName: item.product.name,
      productImage: item.product.image,
      quantity: item.quantity,
      price: item.price,
      sustainabilityScore: item.product.sustainabilityScore,
      sustainabilityGrade: item.product.sustainabilityGrade
    }));
    
    const order = new Order({
      user: userId,
      items: orderItems,
      totalAmount: cart.totalAmount,
      totalItems: cart.totalItems,
      shippingAddress,
      paymentStatus: 'pending',
      orderStatus: 'pending',
      stripeSessionId: session.id
    });
    
    await order.save();
    
    res.json({
      success: true,
      sessionId: session.id,
      sessionUrl: session.url,
      orderId: order._id
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create checkout session',
      details: error.message
    });
  }
});

// Webhook to handle Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      await handleSuccessfulPayment(session);
      break;
    case 'payment_intent.payment_failed':
      const paymentIntent = event.data.object;
      await handleFailedPayment(paymentIntent);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  
  res.json({ received: true });
});

// Handle successful payment
async function handleSuccessfulPayment(session) {
  try {
    const order = await Order.findOne({ stripeSessionId: session.id });
    
    if (order) {
      order.paymentStatus = 'paid';
      order.orderStatus = 'processing';
      order.paidAt = new Date();
      order.stripePaymentIntentId = session.payment_intent;
      
      await order.save();
      
      // Update product stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity }
        });
      }
      
      // Clear user's cart
      await Cart.findOneAndUpdate(
        { user: order.user },
        { items: [] }
      );
      
      console.log('Order payment successful:', order.orderNumber);
    }
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}

// Handle failed payment
async function handleFailedPayment(paymentIntent) {
  try {
    const order = await Order.findOne({ stripePaymentIntentId: paymentIntent.id });
    
    if (order) {
      order.paymentStatus = 'failed';
      await order.save();
      console.log('Order payment failed:', order.orderNumber);
    }
  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
}

// Verify payment status (for client-side verification)
router.get('/verify-payment/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const order = await Order.findOne({ 
      stripeSessionId: sessionId,
      user: userId 
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    // Update order status based on session
    if (session.payment_status === 'paid' && order.paymentStatus !== 'paid') {
      order.paymentStatus = 'paid';
      order.orderStatus = 'processing';
      order.paidAt = new Date();
      order.stripePaymentIntentId = session.payment_intent;
      
      await order.save();
      
      // Update stock and clear cart
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity }
        });
      }
      
      await Cart.findOneAndUpdate({ user: userId }, { items: [] });
    }
    
    res.json({
      success: true,
      paymentStatus: session.payment_status,
      order: {
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalAmount
      }
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify payment'
    });
  }
});

// Get user's orders
router.get('/my-orders', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { user: userId };
    if (status) {
      query.orderStatus = status;
    }
    
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('items.product', 'name image');
    
    const totalOrders = await Order.countDocuments(query);
    
    res.json({
      success: true,
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalOrders / parseInt(limit)),
        totalOrders,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders'
    });
  }
});

// Get order details
router.get('/order/:orderId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;
    
    const order = await Order.findOne({
      _id: orderId,
      user: userId
    }).populate('items.product', 'name image description');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order details'
    });
  }
});

// Cancel order (only if not yet shipped)
router.post('/cancel/:orderId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;
    
    const order = await Order.findOne({
      _id: orderId,
      user: userId
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    if (order.orderStatus === 'shipped' || order.orderStatus === 'delivered') {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel order that has been shipped or delivered'
      });
    }
    
    if (order.orderStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'Order is already cancelled'
      });
    }
    
    order.orderStatus = 'cancelled';
    order.cancelledAt = new Date();
    
    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }
    
    // If payment was made, initiate refund
    if (order.paymentStatus === 'paid' && order.stripePaymentIntentId) {
      try {
        await stripe.refunds.create({
          payment_intent: order.stripePaymentIntentId,
        });
        order.paymentStatus = 'refunded';
      } catch (refundError) {
        console.error('Error processing refund:', refundError);
      }
    }
    
    await order.save();
    
    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel order'
    });
  }
});

module.exports = router;
