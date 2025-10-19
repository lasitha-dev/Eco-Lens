const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const User = require('./models/User');
const Product = require('./models/Product');
const forgotPasswordRoutes = require('./routes/forgotPasswordRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const favoritesRoutes = require('./routes/favoritesRoutes');
const { authenticateToken } = require('./middleware/auth');
const surveyRoutes = require('./routes/surveyRoutes');
const searchAnalyticsRoutes = require('./routes/searchAnalyticsRoutes');
const dynamicRecommendationRoutes = require('./routes/dynamicRecommendationRoutes');
const sustainabilityGoalRoutes = require('./routes/sustainabilityGoalRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:8081',  // Expo dev server
    'http://localhost:19006', // Expo web
    'http://localhost:5002',  // Backend itself
    'http://192.168.8.143:8081', // Mobile network IP
    'http://192.168.8.143:19006', // Web network IP
    'http://10.38.245.146:8081', // Mobile network IP (alternate)
    'http://10.38.245.146:19006' // Web network IP (alternate)
  ],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

if (!MONGODB_URI) {
  console.error('MONGODB_URI environment variable is required');
  process.exit(1);
}

if (!EMAIL_USER || !EMAIL_PASS) {
  console.error('EMAIL_USER and EMAIL_PASS environment variables are required for password reset functionality');
  process.exit(1);
}

console.log('Attempting to connect to MongoDB...');
console.log('MongoDB URI (partial):', MONGODB_URI.substring(0, 50) + '...');

let isMongoConnected = false;

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 10000, // Increased timeout
  socketTimeoutMS: 45000
})
.then(async () => {
  console.log('✅ Successfully connected to MongoDB Atlas');
  console.log('Database Name:', mongoose.connection.db.databaseName);
  isMongoConnected = true;
  
  // Seed admin user if not exists
  await seedAdminUser();
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  console.error('Full error:', err);
  console.log('⚠️  Server will continue with in-memory storage (data will not persist)');
  isMongoConnected = false;
});

// In-memory storage for demo purposes when MongoDB is not available
let inMemoryUsers = [];
let userIdCounter = 1;

// JWT Helper Functions
const generateToken = (user) => {
  const payload = {
    userId: user._id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET || 'your-fallback-secret-key', {
    expiresIn: '24h'
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-fallback-secret-key');
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Admin User Seeding Function
const seedAdminUser = async () => {
  try {
    const adminEmail = 'admin@ecolens.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      const adminPassword = 'EcoAdmin123!';
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      
      const adminUser = new User({
        firstName: 'Eco',
        lastName: 'Admin',
        email: adminEmail,
        address: 'Eco-Lens HQ, Green Street',
        dateOfBirth: new Date('1990-01-01'),
        country: 'Global',
        password: hashedPassword,
        role: 'admin'
      });
      
      await adminUser.save();
      console.log('🔑 Admin user created successfully!');
      console.log('   Email: admin@ecolens.com');
      console.log('   Password: EcoAdmin123!');
    } else {
      console.log('🔑 Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
  }
};


// Validation middleware
const validateAge = (dateOfBirth) => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 >= 18;
  }
  return age >= 18;
};

const validatePassword = (password) => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isLongEnough = password.length >= 8;
  
  return hasUpperCase && hasNumber && hasSpecialChar && isLongEnough;
};

// Routes

// Check if email exists
app.post('/api/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    let existingUser;
    if (isMongoConnected) {
      existingUser = await User.findOne({ email: email.toLowerCase() });
    } else {
      existingUser = inMemoryUsers.find(user => user.email === email.toLowerCase());
    }
    
    res.json({ exists: !!existingUser });
  } catch (error) {
    console.error('Error checking email:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Register user
app.post('/api/register', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      address,
      dateOfBirth,
      country,
      password
    } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !address || !dateOfBirth || !country || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if email already exists
    let existingUser;
    if (isMongoConnected) {
      existingUser = await User.findOne({ email: email.toLowerCase() });
    } else {
      existingUser = inMemoryUsers.find(user => user.email === email.toLowerCase());
    }
    
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Validate age
    if (!validateAge(dateOfBirth)) {
      return res.status(400).json({ error: 'You must be at least 18 years old' });
    }

    // Validate password
    if (!validatePassword(password)) {
      return res.status(400).json({
        error: 'Password must contain uppercase letter, number, special character, and be at least 8 characters'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    let newUser;
    if (isMongoConnected) {
      console.log('✅ Saving user to MongoDB...');
      // Create new user in MongoDB
      newUser = new User({
        firstName,
        lastName,
        email: email.toLowerCase(),
        address,
        dateOfBirth: new Date(dateOfBirth),
        country,
        password: hashedPassword
      });
      await newUser.save();
      console.log('✅ User successfully saved to MongoDB with ID:', newUser._id);
    } else {
      console.log('⚠️  Saving user to in-memory storage (data will be lost on server restart)');
      // Create new user in memory
      newUser = {
        _id: userIdCounter++,
        firstName,
        lastName,
        email: email.toLowerCase(),
        address,
        dateOfBirth: new Date(dateOfBirth),
        country,
        password: hashedPassword,
        createdAt: new Date()
      };
      inMemoryUsers.push(newUser);
      console.log('⚠️  User saved to in-memory storage. Total users in memory:', inMemoryUsers.length);
    }

    // Generate JWT token
    const token = generateToken(newUser);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        address: newUser.address,
        country: newUser.country,
        phone: newUser.phone,
        dateOfBirth: newUser.dateOfBirth,
        gender: newUser.gender,
        role: newUser.role || 'customer',
        profilePicture: newUser.profilePicture || null
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      res.status(400).json({ error: 'Email already registered' });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Login user
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    let user;
    if (isMongoConnected) {
      user = await User.findOne({ email: email.toLowerCase() });
    } else {
      user = inMemoryUsers.find(u => u.email === email.toLowerCase());
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        address: user.address,
        country: user.country,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        role: user.role || 'customer',
        profilePicture: user.profilePicture || null,
        fingerprintEnabled: user.fingerprintEnabled || false
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user profile
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        address: user.address,
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString().split('T')[0] : null, // Format as YYYY-MM-DD
        country: user.country,
        phone: user.phone,
        gender: user.gender,
        profilePicture: user.profilePicture,
        role: user.role,
        fingerprintEnabled: user.fingerprintEnabled || false
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete profile photo
app.post('/api/profile/delete-photo', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Update user to remove profile picture
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture: null },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile photo deleted successfully',
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        address: updatedUser.address,
        dateOfBirth: updatedUser.dateOfBirth ? updatedUser.dateOfBirth.toISOString().split('T')[0] : null,
        country: updatedUser.country,
        phone: updatedUser.phone,
        gender: updatedUser.gender,
        profilePicture: updatedUser.profilePicture
      }
    });

  } catch (error) {
    console.error('Profile photo delete error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update fingerprint setting
app.patch('/api/profile/fingerprint-settings', authenticateToken, async (req, res) => {
  try {
    const { fingerprintEnabled } = req.body;
    const userId = req.user.id;

    // Validate input
    if (typeof fingerprintEnabled !== 'boolean') {
      return res.status(400).json({ error: 'fingerprintEnabled must be a boolean value' });
    }

    // Update user's fingerprint setting
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fingerprintEnabled },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Fingerprint setting updated successfully',
      fingerprintEnabled: updatedUser.fingerprintEnabled
    });

  } catch (error) {
    console.error('Fingerprint setting update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
app.patch('/api/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, address, dateOfBirth, country, profilePicture } = req.body;
    const userId = req.user.id;

    // Prepare update object
    const updateData = {};

    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (address !== undefined) updateData.address = address;
    if (country !== undefined) updateData.country = country;
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture;

    // Handle dateOfBirth - convert string to Date object if provided
    if (dateOfBirth !== undefined) {
      if (dateOfBirth === '' || dateOfBirth === null) {
        updateData.dateOfBirth = null;
      } else {
        // Validate and parse the date string (expected format: YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (typeof dateOfBirth === 'string' && dateRegex.test(dateOfBirth)) {
          // Parse the YYYY-MM-DD format properly
          const [year, month, day] = dateOfBirth.split('-').map(Number);
          updateData.dateOfBirth = new Date(year, month - 1, day); // Month is 0-indexed in JavaScript
          
          // Validate the date is reasonable (not in the future and user is at least 13 years old)
          const today = new Date();
          const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate()); // 120 years ago
          const maxDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate()); // 13 years ago
          
          if (updateData.dateOfBirth > today) {
            return res.status(400).json({ error: 'Date of birth cannot be in the future' });
          }
          if (updateData.dateOfBirth < minDate) {
            return res.status(400).json({ error: 'Date of birth is too far in the past' });
          }
          if (updateData.dateOfBirth > maxDate) {
            return res.status(400).json({ error: 'You must be at least 13 years old' });
          }
        } else {
          return res.status(400).json({ error: 'Invalid date format. Please use YYYY-MM-DD format' });
        }
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        address: updatedUser.address,
        dateOfBirth: updatedUser.dateOfBirth ? updatedUser.dateOfBirth.toISOString().split('T')[0] : null,
        country: updatedUser.country,
        profilePicture: updatedUser.profilePicture
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Invalid data provided' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all users (for testing)
app.get('/api/users', async (req, res) => {
  try {
    let users;
    if (isMongoConnected) {
      console.log('ℹ️  Fetching users from MongoDB...');
      users = await User.find({}, { password: 0 });
      console.log(`✅ Found ${users.length} users in MongoDB`);
    } else {
      console.log('⚠️  Fetching users from in-memory storage...');
      users = inMemoryUsers.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      console.log(`⚠️  Found ${users.length} users in memory`);
    }
    res.json({
      source: isMongoConnected ? 'MongoDB' : 'In-Memory',
      count: users.length,
      users: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Database status endpoint
app.get('/api/db-status', (req, res) => {
  res.json({
    mongoConnected: isMongoConnected,
    connectionState: mongoose.connection.readyState,
    connectionStates: {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    },
    databaseName: mongoose.connection.db?.databaseName || 'Not connected',
    inMemoryUserCount: inMemoryUsers.length
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    database: {
      connected: isMongoConnected,
      state: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    },
    timestamp: new Date().toISOString()
  });
});


// Forgot Password Routes
app.use('/api/auth', forgotPasswordRoutes);

// Product Routes
app.use('/api/products', productRoutes);

// Cart Routes
app.use('/api/cart', cartRoutes);

// Order Routes
app.use('/api/orders', orderRoutes);
// Favorites Routes
app.use('/api/favorites', favoritesRoutes);

// Survey Routes
app.use('/api/survey', surveyRoutes);

// Search Analytics Routes
app.use('/api/search', searchAnalyticsRoutes);

// Dynamic Recommendation Routes
app.use('/api/dynamic', dynamicRecommendationRoutes);

// Sustainability Goals Routes
app.use('/api/goals', sustainabilityGoalRoutes);

// Rating Routes
app.use('/api/ratings', ratingRoutes);

// Notification Routes
app.use('/api/notifications', notificationRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Available at:`);
  console.log(`  - Local: http://localhost:${PORT}`);
  console.log(`  - Network: http://10.38.245.146:${PORT}`);
});
