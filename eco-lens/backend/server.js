const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URL = 'mongodb+srv://pramod:Pramod25@wijeboytechnology.rlmu075.mongodb.net/?retryWrites=true&w=majority&appName=Wijeboytechnology';

let isMongoConnected = false;

mongoose.connect(MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  isMongoConnected = true;
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  console.log('Server will continue without database - using in-memory storage for demo');
  isMongoConnected = false;
});

// In-memory storage for demo purposes when MongoDB is not available
let inMemoryUsers = [];
let userIdCounter = 1;

// User Schema
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email']
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

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
    } else {
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

    res.json({
      message: 'Login successful',
      token: 'demo-token-' + Date.now(), // Simple token for demo
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
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
    const users = await User.find({}, { password: 0 });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
