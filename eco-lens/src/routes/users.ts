import express, { Request, Response } from 'express';
import { User } from '../models/User';
import { connectToDatabase } from '../lib/mongodb';

const router = express.Router();

// Register new user
router.post('/register', async (req: Request, res: Response) => {
  console.log('=== SERVER: Registration request received ===');
  console.log('Request body:', req.body);
  console.log('Request headers:', req.headers);
  
  try {
    await connectToDatabase();
    console.log('Database connected successfully');
    
    const { fullName, email, password } = req.body;

    // Validate input
    if (!fullName || !email || !password) {
      console.log('Validation failed: Missing fields');
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    if (password.length < 6) {
      console.log('Validation failed: Password too short');
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }

    console.log('Checking if user already exists...');
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    console.log('Creating new user...');
    // Create new user
    const user = new User({
      fullName,
      email,
      password, // In production, you should hash this password
    });

    console.log('Saving user to database...');
    await user.save();
    console.log('User saved successfully:', user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        createdAt: user.createdAt,
      }
    });

  } catch (error) {
    console.error('=== SERVER: Registration error ===');
    console.error('Error details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Login user
router.post('/login', async (req: Request, res: Response) => {
  try {
    await connectToDatabase();
    
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Check password (in production, you should compare hashed passwords)
    if (user.password !== password) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        createdAt: user.createdAt,
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Get all users (for testing purposes)
router.get('/', async (req: Request, res: Response) => {
  try {
    await connectToDatabase();
    
    const users = await User.find({}, { password: 0 }); // Exclude password field
    
    res.status(200).json({
      success: true,
      count: users.length,
      users
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

export default router;
