# Critical Goal Tracking Fixes Required

## Issue 1: Wrong Order Query Fields in sustainabilityGoalRoutes.js

### Lines to Fix:

**Line 204-207 (/:id/progress endpoint):**
```javascript
// WRONG:
const orders = await Order.find({ 
  userId,  // ❌ Wrong field name
  status: 'completed'  // ❌ Wrong field name
}).populate('items.product');

// CORRECT:
const orders = await Order.find({ 
  user: userId,  // ✅ Correct
  paymentStatus: 'paid'  // ✅ Correct
}).populate('items.product');
```

**Line 276-279 (/track-purchase endpoint):**
```javascript
// WRONG:
const order = await Order.findOne({ 
  _id: orderId, 
  userId  // ❌ Wrong field name
}).populate('items.product');

// CORRECT:
const order = await Order.findOne({ 
  _id: orderId, 
  user: userId  // ✅ Correct
}).populate('items.product');
```

**Line 304-307 (/track-purchase endpoint):**
```javascript
// WRONG:
const allOrders = await Order.find({ 
  userId,  // ❌ Wrong field name
  status: 'completed'  // ❌ Wrong field name
}).populate('items.product');

// CORRECT:
const allOrders = await Order.find({ 
  user: userId,  // ✅ Correct
  paymentStatus: 'paid'  // ✅ Correct
}).populate('items.product');
```

## Issue 2: Explicit isActive Setting

**Line 88-94 (POST / endpoint):**
```javascript
// Add explicit isActive: true
const newGoal = new SustainabilityGoal({
  userId,
  goalType,
  goalConfig,
  title: title.trim(),
  description: description ? description.trim() : '',
  isActive: true  // ✅ Add this explicitly
});
```

## Testing After Fixes

1. Create a new goal
2. Make a purchase
3. Check logs for: "📊 Processing X items against Y goals"
4. Verify progress updates in goal details
5. Verify Recent Activity shows purchases
