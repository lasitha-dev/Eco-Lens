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

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors());
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

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email
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
        role: user.role || 'customer'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Available at:`);
  console.log(`  - Local: http://localhost:${PORT}`);
  console.log(`  - Network: http://10.38.245.146:${PORT}`);
});
