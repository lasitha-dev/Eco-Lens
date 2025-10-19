# 🚨 URGENT: Backend Goal Tracking Fixes Required

## Root Cause Analysis

The goal tracking system is completely broken due to **incorrect database query field names** in `backend/routes/sustainabilityGoalRoutes.js`.

### The Problem:
The code is querying the Order model with wrong field names, so it returns 0 orders every time:
- Using `userId` instead of `user`
- Using `status` instead of `paymentStatus`

This means:
- ❌ No purchases are ever found
- ❌ Progress always stays at 0%
- ❌ Recent Activity always empty
- ❌ Goals never tracked

---

## Fix 1: Update backend/routes/sustainabilityGoalRoutes.js

### Location 1: Line 204-207 (GET /:id/progress)

**FIND:**
```javascript
const orders = await Order.find({ 
  userId, 
  status: 'completed' 
}).populate('items.product');
```

**REPLACE WITH:**
```javascript
const orders = await Order.find({ 
  user: userId,           // Changed: userId → user
  paymentStatus: 'paid'   // Changed: status → paymentStatus
}).populate('items.product');
```

---

### Location 2: Line 276-279 (POST /track-purchase)

**FIND:**
```javascript
const order = await Order.findOne({ 
  _id: orderId, 
  userId 
}).populate('items.product');
```

**REPLACE WITH:**
```javascript
const order = await Order.findOne({ 
  _id: orderId, 
  user: userId  // Changed: userId → user
}).populate('items.product');
```

---

### Location 3: Line 304-307 (POST /track-purchase)

**FIND:**
```javascript
const allOrders = await Order.find({ 
  userId, 
  status: 'completed' 
}).populate('items.product');
```

**REPLACE WITH:**
```javascript
const allOrders = await Order.find({ 
  user: userId,           // Changed: userId → user
  paymentStatus: 'paid'   // Changed: status → paymentStatus
}).populate('items.product');
```

---

### Location 4: Line 88-94 (POST / - Create Goal)

**FIND:**
```javascript
const newGoal = new SustainabilityGoal({
  userId,
  goalType,
  goalConfig,
  title: title.trim(),
  description: description ? description.trim() : ''
});
```

**REPLACE WITH:**
```javascript
const newGoal = new SustainabilityGoal({
  userId,
  goalType,
  goalConfig,
  title: title.trim(),
  description: description ? description.trim() : '',
  isActive: true  // Add explicit isActive setting
});
```

---

## Verification

After making these changes, the backend logs should show:

```
🎯 Tracking purchase for sustainability goals - User: xxx, Order: yyy
📊 Processing 2 items against 1 goals
✅ Updated goal "My Sustainable Goal": 1/2 purchases (50.0%)
🎉 Successfully tracked purchase against 1 goals
```

### Before Fixes:
```
🎯 Tracking purchase for sustainability goals
No active goals found for user  // ← Wrong! But we have goals
```

OR

```
📊 Processing 0 items against 1 goals  // ← 0 items found = wrong query
```

---

## Testing Steps

1. **Stop the backend server**

2. **Apply all 4 fixes above**

3. **Restart the backend server**

4. **In the app:**
   - Create a new goal (e.g., "Buy 80% Grade A/B products")
   - Make a purchase with matching products
   - Check backend console for tracking logs

5. **Verify:**
   - Goal Details → Progress shows correct numbers
   - Goal Details → Recent Activity shows purchases
   - Profile → Sustainability Goals shows correct overall progress

---

## Why This Happened

The Order model uses:
```javascript
user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }  // Line 65
paymentStatus: { type: String, enum: ['pending', 'paid', ...] }  // Line 90
```

But the goal routes were written using:
- `userId` (doesn't exist)
- `status` (doesn't exist)

This is a simple field name mismatch that breaks the entire tracking system.

---

## Additional Note

The `orderRoutes.js` file (line 48) has the CORRECT field names:
```javascript
const allCompletedOrders = await Order.find({ 
  user: userId,  // ✅ Correct
  paymentStatus: 'paid'  // ✅ Correct
}).populate('items.product');
```

So we just need to make `sustainabilityGoalRoutes.js` match this pattern.
