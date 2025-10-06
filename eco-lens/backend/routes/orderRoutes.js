const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { authenticateToken } = require('../middleware/auth');

// Initialize Stripe only if secret key is provided
let stripe = null;
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_your_stripe_secret_key_here') {
  const Stripe = require('stripe');
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
}

const router = express.Router();

// POST /order/create - Create Stripe checkout session
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { shippingInfo } = req.body;
    const userId = req.user.userId;

    // Get user's cart
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Validate stock for all items
    for (const item of cart.items) {
      const product = item.productId;
      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${product.name}`
        });
      }
    }

    // Create order items with current prices
    const orderItems = cart.items.map(item => ({
      productId: item.productId._id,
      quantity: item.quantity,
      price: item.productId.price
    }));

    // Create order in database
    const order = new Order({
      userId,
      items: orderItems,
      totalAmount: cart.totalAmount,
      shippingInfo,
      paymentStatus: stripe ? 'pending' : 'paid' // Mark as paid if no Stripe
    });

    await order.save();

    if (!stripe) {
      // If Stripe is not configured, simulate successful payment
      console.log('Stripe not configured - simulating payment success');

      // Clear user's cart
      await Cart.findOneAndUpdate(
        { userId },
        { items: [], totalAmount: 0 }
      );

      // Update product stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: -item.quantity } }
        );
      }

      return res.json({
        message: 'Order created successfully (Stripe not configured)',
        orderId: order._id
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: cart.items.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.productId.name,
            images: [item.productId.image],
          },
          unit_amount: Math.round(item.productId.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cart`,
      metadata: {
        orderId: order._id.toString()
      }
    });

    // Update order with session ID
    order.stripeSessionId = session.id;
    await order.save();

    res.json({
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /order/webhook - Stripe webhook for payment confirmation
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;

      // Find order by session ID
      const order = await Order.findOne({ stripeSessionId: session.id });
      if (order) {
        // Update order status
        order.paymentStatus = 'paid';
        order.stripePaymentIntentId = session.payment_intent;

        // Get receipt URL
        const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
        order.receiptUrl = paymentIntent.charges.data[0]?.receipt_url;

        await order.save();

        // Clear user's cart
        await Cart.findOneAndUpdate(
          { userId: order.userId },
          { items: [], totalAmount: 0 }
        );

        // Update product stock
        for (const item of order.items) {
          await Product.findByIdAndUpdate(
            item.productId,
            { $inc: { stock: -item.quantity } }
          );
        }

        console.log(`Order ${order._id} marked as paid`);
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// GET /orders/:userId - Get user's order history
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user can only access their own orders
    if (req.user.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const orders = await Order.find({ userId })
      .populate('items.productId')
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /orders/detail/:orderId - Get single order details
router.get('/detail/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate('items.productId');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify user owns this order
    if (order.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(order);

  } catch (error) {
    console.error('Get order detail error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;