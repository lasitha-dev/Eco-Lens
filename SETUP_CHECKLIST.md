# Cart & Payment System - Setup Checklist

## ✅ Completed Implementation

### Backend Components
- [x] Cart Model (`backend/models/Cart.js`)
- [x] Order Model (`backend/models/Order.js`)
- [x] Cart Routes (`backend/routes/cartRoutes.js`)
- [x] Order Routes with Stripe (`backend/routes/orderRoutes.js`)
- [x] Updated `server.js` with new routes
- [x] Added Stripe dependency to `package.json`
- [x] Updated `.env.example` with Stripe configuration

### Frontend Components
- [x] OrderHistoryScreen (`src/screens/customer/OrderHistoryScreen.js`)
- [x] OrderDetailsScreen (`src/screens/customer/OrderDetailsScreen.js`)
- [x] Enhanced CartScreen with API integration
- [x] CartService API utility (`src/api/cartService.js`)
- [x] Updated AppNavigator with new screens
- [x] Updated ProfileScreen with Order History link
- [x] Updated CustomerDashboard with cart integration

## 🔧 Setup Steps

### 1. Install Dependencies

```bash
# Backend
cd eco-lens/backend
npm install

# Frontend (if needed)
cd ../
npm install
```

### 2. Configure Environment Variables

Edit `eco-lens/backend/.env` and add:

```env
# Existing variables...
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password

# NEW: Add these Stripe variables
STRIPE_SECRET_KEY=sk_test_your_stripe_test_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
FRONTEND_URL=exp://localhost:8081
```

### 3. Get Stripe Test Keys

1. Go to https://dashboard.stripe.com/register
2. Create account or login
3. Navigate to Developers > API keys
4. Copy "Secret key" (starts with `sk_test_`)
5. Add to `.env` file

**Note**: For development, webhook secret can be temporary. For production deployment, set up proper webhooks.

### 4. Start the Application

```bash
# Terminal 1: Start Backend
cd eco-lens/backend
npm run dev

# Terminal 2: Start Frontend
cd eco-lens
npm start
```

## 🧪 Testing the Features

### Test 1: Add Products to Cart
1. Login as a customer
2. Browse products in Dashboard
3. Click on a product
4. Select quantity and click "Add to Cart"
5. Choose "View Cart" to see the cart

### Test 2: Cart Management
1. Navigate to Cart tab (bottom navigation)
2. Update item quantities using +/- buttons
3. Remove items using "Remove" button
4. Verify total price and eco-score update

### Test 3: Checkout Process
1. In Cart, click "Proceed to Checkout"
2. Fill in shipping address form:
   - Full Name: Test User
   - Address Line 1: 123 Main St
   - City: Test City
   - Postal Code: 12345
   - Country: USA
   - Phone: 1234567890
3. Click "Proceed to Payment"
4. Browser opens with Stripe checkout page

### Test 4: Complete Payment (Test Mode)
Use Stripe test card:
- **Card Number**: 4242 4242 4242 4242
- **Expiry**: Any future date (e.g., 12/25)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

Click "Pay" to complete the test payment

### Test 5: View Order History
1. Navigate to Profile tab
2. Click "Order History"
3. See your completed order
4. Click on order to view details

### Test 6: Order Details
1. From Order History, click an order
2. View order details, items, and shipping address
3. If order is pending/processing, try "Cancel Order"

## 📋 API Endpoints Reference

### Cart Endpoints
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PATCH /api/cart/update` - Update item quantity
- `DELETE /api/cart/remove/:productId` - Remove item
- `DELETE /api/cart/clear` - Clear cart

### Order Endpoints
- `POST /api/orders/create-checkout-session` - Start checkout
- `GET /api/orders/my-orders` - Get order history
- `GET /api/orders/order/:orderId` - Get order details
- `POST /api/orders/cancel/:orderId` - Cancel order
- `GET /api/orders/verify-payment/:sessionId` - Verify payment

## 🎯 User Flows

### Customer Purchase Flow
```
1. Browse Products (Dashboard) 
   ↓
2. Add to Cart (Product Detail Modal)
   ↓
3. View Cart (Cart Tab)
   ↓
4. Proceed to Checkout (Shipping Form)
   ↓
5. Stripe Payment (Browser)
   ↓
6. Order Confirmation
   ↓
7. View in Order History (Profile > Order History)
```

## 🔍 Verification Checklist

After setup, verify:

- [ ] Backend server starts without errors
- [ ] Frontend connects to backend
- [ ] Can add products to cart
- [ ] Cart updates correctly
- [ ] Can proceed to checkout
- [ ] Stripe payment page opens
- [ ] Can complete test payment
- [ ] Order appears in order history
- [ ] Can view order details
- [ ] Can cancel pending orders

## 🐛 Common Issues & Solutions

### Issue: "STRIPE_SECRET_KEY is undefined"
**Solution**: Add Stripe keys to `backend/.env` file

### Issue: Cart not loading
**Solution**: 
- Check backend is running
- Verify MongoDB connection
- Check JWT token is valid

### Issue: Payment page not opening
**Solution**:
- Verify Stripe API key is correct
- Check if running in test mode
- Ensure FRONTEND_URL is set correctly

### Issue: Order not appearing after payment
**Solution**:
- Check backend logs for errors
- Verify webhook configuration (production)
- Manually verify payment in Stripe Dashboard

## 📝 Next Steps

### For Development
1. Test all features thoroughly
2. Add more products to test with
3. Test edge cases (empty cart, out of stock, etc.)

### For Production
1. Replace test Stripe keys with live keys
2. Set up Stripe webhooks properly
3. Configure production FRONTEND_URL
4. Add email notifications for orders
5. Implement proper error monitoring
6. Set up backup and recovery procedures

## 📚 Documentation

For detailed information, see:
- `CART_AND_PAYMENT_GUIDE.md` - Complete implementation guide
- Backend API documentation in route files
- Frontend component documentation in screen files

## 🎉 Features Available

✅ User-specific shopping cart
✅ Add/remove/update cart items  
✅ Real-time cart calculations
✅ Secure Stripe payment integration
✅ Order creation and tracking
✅ Order history with filtering
✅ Order cancellation (before shipping)
✅ Automatic inventory management
✅ Automatic refund processing
✅ Eco-score tracking per order
✅ Responsive UI with loading states
✅ Error handling and user feedback

## 🚀 Ready to Test!

Your cart and payment system is fully implemented and ready to test. Follow the testing steps above to verify everything works correctly.

Happy Testing! 🎊
