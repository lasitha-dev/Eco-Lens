/**
 * Database Seeding Script for Eco-Lens
 * This script adds extended products directly to your MongoDB database
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import the Product model
const Product = require('./models/Product');

// Extended products data
const EXTENDED_PRODUCTS = [
  // Electronics - More variety
  {
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium wireless headphones with active noise cancellation. Made with recycled aluminum and sustainable materials.',
    price: 89.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
    stock: 45,
    ecoMetrics: {
      materialsScore: 75,
      carbonFootprint: 4.2,
      packagingType: 'paper',
      manufacturingProcess: 'renewable-energy',
      productLifespan: 60,
      recyclablePercentage: 85,
      biodegradablePercentage: 15,
    },
    sustainabilityScore: 76,
    sustainabilityGrade: 'B',
    seller: {
      name: 'AudioEco Tech',
      certifications: ['Energy Star', 'RoHS'],
    },
    rating: 4.6,
    reviewCount: 234,
  },
  {
    name: 'Eco-Friendly Laptop Stand',
    description: 'Adjustable bamboo laptop stand with ergonomic design. Sustainable bamboo construction with non-slip base.',
    price: 34.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop',
    stock: 80,
    ecoMetrics: {
      materialsScore: 92,
      carbonFootprint: 1.1,
      packagingType: 'minimal',
      manufacturingProcess: 'sustainable',
      productLifespan: 72,
      recyclablePercentage: 95,
      biodegradablePercentage: 90,
    },
    sustainabilityScore: 89,
    sustainabilityGrade: 'A',
    seller: {
      name: 'BambooTech Solutions',
      certifications: ['FSC', 'Carbon Neutral'],
    },
    rating: 4.7,
    reviewCount: 156,
  },
  {
    name: 'Smart Home Energy Monitor',
    description: 'Real-time energy consumption monitor for smart homes. Helps reduce electricity usage and carbon footprint.',
    price: 67.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
    stock: 35,
    ecoMetrics: {
      materialsScore: 78,
      carbonFootprint: 2.8,
      packagingType: 'biodegradable',
      manufacturingProcess: 'renewable-energy',
      productLifespan: 120,
      recyclablePercentage: 70,
      biodegradablePercentage: 25,
    },
    sustainabilityScore: 79,
    sustainabilityGrade: 'B',
    seller: {
      name: 'GreenHome Tech',
      certifications: ['Energy Star', 'B Corp'],
    },
    rating: 4.4,
    reviewCount: 89,
  },

  // Fashion - More sustainable options
  {
    name: 'Recycled Polyester Jacket',
    description: 'Waterproof jacket made from recycled plastic bottles. Lightweight, durable, and environmentally conscious.',
    price: 79.99,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=300&fit=crop',
    stock: 55,
    ecoMetrics: {
      materialsScore: 82,
      carbonFootprint: 3.1,
      packagingType: 'paper',
      manufacturingProcess: 'sustainable',
      productLifespan: 48,
      recyclablePercentage: 90,
      biodegradablePercentage: 5,
    },
    sustainabilityScore: 80,
    sustainabilityGrade: 'B',
    seller: {
      name: 'RecycledWear Co.',
      certifications: ['GRS', 'OEKO-TEX'],
    },
    rating: 4.5,
    reviewCount: 178,
  },
  {
    name: 'Cork Wallet',
    description: 'Minimalist wallet made from sustainable cork leather. Water-resistant and naturally antimicrobial.',
    price: 28.99,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop',
    stock: 120,
    ecoMetrics: {
      materialsScore: 95,
      carbonFootprint: 0.9,
      packagingType: 'minimal',
      manufacturingProcess: 'sustainable',
      productLifespan: 36,
      recyclablePercentage: 100,
      biodegradablePercentage: 100,
    },
    sustainabilityScore: 93,
    sustainabilityGrade: 'A',
    seller: {
      name: 'CorkCraft Studio',
      certifications: ['FSC', 'PETA Approved'],
    },
    rating: 4.8,
    reviewCount: 267,
  },
  {
    name: 'Organic Cotton Denim Jeans',
    description: 'Classic fit jeans made from 100% organic cotton. Fair trade certified with sustainable dyeing process.',
    price: 95.00,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=300&fit=crop',
    stock: 40,
    ecoMetrics: {
      materialsScore: 88,
      carbonFootprint: 4.5,
      packagingType: 'paper',
      manufacturingProcess: 'sustainable',
      productLifespan: 60,
      recyclablePercentage: 95,
      biodegradablePercentage: 100,
    },
    sustainabilityScore: 85,
    sustainabilityGrade: 'A',
    seller: {
      name: 'Ethical Denim Co.',
      certifications: ['GOTS', 'Fair Trade', 'OEKO-TEX'],
    },
    rating: 4.6,
    reviewCount: 145,
  },

  // Home & Garden - More variety
  {
    name: 'Indoor Herb Garden Kit',
    description: 'Complete indoor herb garden with LED grow lights. Includes seeds, soil, and sustainable pots.',
    price: 49.99,
    category: 'Home & Garden',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=300&fit=crop',
    stock: 65,
    ecoMetrics: {
      materialsScore: 90,
      carbonFootprint: 1.8,
      packagingType: 'biodegradable',
      manufacturingProcess: 'sustainable',
      productLifespan: 24,
      recyclablePercentage: 85,
      biodegradablePercentage: 95,
    },
    sustainabilityScore: 87,
    sustainabilityGrade: 'A',
    seller: {
      name: 'GreenThumb Gardens',
      certifications: ['USDA Organic', 'Non-GMO'],
    },
    rating: 4.7,
    reviewCount: 198,
  },
  {
    name: 'Bamboo Cutting Board Set',
    description: 'Set of 3 bamboo cutting boards in different sizes. Naturally antimicrobial and knife-friendly surface.',
    price: 24.99,
    category: 'Home & Garden',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300&h=300&fit=crop',
    stock: 90,
    ecoMetrics: {
      materialsScore: 94,
      carbonFootprint: 0.7,
      packagingType: 'minimal',
      manufacturingProcess: 'sustainable',
      productLifespan: 48,
      recyclablePercentage: 100,
      biodegradablePercentage: 100,
    },
    sustainabilityScore: 91,
    sustainabilityGrade: 'A',
    seller: {
      name: 'BambooKitchen Co.',
      certifications: ['FSC', 'Food Safe'],
    },
    rating: 4.8,
    reviewCount: 312,
  },
  {
    name: 'Compost Bin with Worms',
    description: 'Indoor compost bin with live worms for efficient food waste decomposition. Includes starter worms and bedding.',
    price: 39.99,
    category: 'Home & Garden',
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=300&h=300&fit=crop',
    stock: 30,
    ecoMetrics: {
      materialsScore: 98,
      carbonFootprint: 0.2,
      packagingType: 'biodegradable',
      manufacturingProcess: 'sustainable',
      productLifespan: 60,
      recyclablePercentage: 100,
      biodegradablePercentage: 100,
    },
    sustainabilityScore: 96,
    sustainabilityGrade: 'A',
    seller: {
      name: 'VermiCompost Solutions',
      certifications: ['USDA Organic', 'Zero Waste'],
    },
    rating: 4.9,
    reviewCount: 89,
  },

  // Food & Beverages - More options
  {
    name: 'Organic Green Tea Collection',
    description: 'Premium collection of organic green teas from sustainable farms. Packaged in biodegradable tea bags.',
    price: 22.99,
    category: 'Food & Beverages',
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&h=300&fit=crop',
    stock: 75,
    ecoMetrics: {
      materialsScore: 96,
      carbonFootprint: 2.1,
      packagingType: 'biodegradable',
      manufacturingProcess: 'sustainable',
      productLifespan: 2,
      recyclablePercentage: 100,
      biodegradablePercentage: 100,
    },
    sustainabilityScore: 92,
    sustainabilityGrade: 'A',
    seller: {
      name: 'PureLeaf Teas',
      certifications: ['USDA Organic', 'Fair Trade', 'Rainforest Alliance'],
    },
    rating: 4.8,
    reviewCount: 156,
  },
  {
    name: 'Plant-Based Protein Powder',
    description: 'Vegan protein powder made from organic peas and rice. No artificial additives or preservatives.',
    price: 34.99,
    category: 'Food & Beverages',
    image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=300&h=300&fit=crop',
    stock: 50,
    ecoMetrics: {
      materialsScore: 89,
      carbonFootprint: 2.8,
      packagingType: 'paper',
      manufacturingProcess: 'sustainable',
      productLifespan: 1,
      recyclablePercentage: 100,
      biodegradablePercentage: 100,
    },
    sustainabilityScore: 86,
    sustainabilityGrade: 'A',
    seller: {
      name: 'PlantPower Nutrition',
      certifications: ['USDA Organic', 'Non-GMO', 'Vegan'],
    },
    rating: 4.6,
    reviewCount: 234,
  },
  {
    name: 'Local Honey Jar',
    description: 'Raw, unfiltered honey from local beekeepers. Supports local agriculture and bee conservation.',
    price: 18.99,
    category: 'Food & Beverages',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&h=300&fit=crop',
    stock: 100,
    ecoMetrics: {
      materialsScore: 97,
      carbonFootprint: 0.8,
      packagingType: 'glass',
      manufacturingProcess: 'sustainable',
      productLifespan: 1,
      recyclablePercentage: 100,
      biodegradablePercentage: 100,
    },
    sustainabilityScore: 94,
    sustainabilityGrade: 'A',
    seller: {
      name: 'Local Bee Co.',
      certifications: ['Local Sourced', 'Raw Honey'],
    },
    rating: 4.9,
    reviewCount: 189,
  },

  // Personal Care - More sustainable options
  {
    name: 'Shampoo Bar Set',
    description: 'Set of 3 solid shampoo bars for different hair types. Zero waste, plastic-free packaging.',
    price: 19.99,
    category: 'Personal Care',
    image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=300&h=300&fit=crop',
    stock: 85,
    ecoMetrics: {
      materialsScore: 93,
      carbonFootprint: 0.5,
      packagingType: 'minimal',
      manufacturingProcess: 'sustainable',
      productLifespan: 6,
      recyclablePercentage: 100,
      biodegradablePercentage: 100,
    },
    sustainabilityScore: 90,
    sustainabilityGrade: 'A',
    seller: {
      name: 'ZeroWaste Beauty',
      certifications: ['Cruelty Free', 'Vegan', 'Zero Waste'],
    },
    rating: 4.7,
    reviewCount: 267,
  },
  {
    name: 'Natural Deodorant Stick',
    description: 'Aluminum-free deodorant made with natural ingredients. Effective 24-hour protection without harmful chemicals.',
    price: 12.99,
    category: 'Personal Care',
    image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=300&h=300&fit=crop',
    stock: 150,
    ecoMetrics: {
      materialsScore: 91,
      carbonFootprint: 0.4,
      packagingType: 'biodegradable',
      manufacturingProcess: 'sustainable',
      productLifespan: 3,
      recyclablePercentage: 95,
      biodegradablePercentage: 98,
    },
    sustainabilityScore: 88,
    sustainabilityGrade: 'A',
    seller: {
      name: 'PureCare Essentials',
      certifications: ['Cruelty Free', 'Natural', 'Aluminum Free'],
    },
    rating: 4.5,
    reviewCount: 345,
  },
  {
    name: 'Reusable Makeup Remover Pads',
    description: 'Set of 20 reusable cotton pads for makeup removal. Machine washable and eco-friendly alternative to disposables.',
    price: 15.99,
    category: 'Personal Care',
    image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=300&h=300&fit=crop',
    stock: 200,
    ecoMetrics: {
      materialsScore: 89,
      carbonFootprint: 0.3,
      packagingType: 'minimal',
      manufacturingProcess: 'sustainable',
      productLifespan: 12,
      recyclablePercentage: 100,
      biodegradablePercentage: 100,
    },
    sustainabilityScore: 87,
    sustainabilityGrade: 'A',
    seller: {
      name: 'EcoBeauty Solutions',
      certifications: ['Cruelty Free', 'Organic Cotton'],
    },
    rating: 4.6,
    reviewCount: 178,
  },

  // Sports & Outdoors - More variety
  {
    name: 'Hiking Backpack',
    description: 'Lightweight hiking backpack made from recycled materials. Water-resistant with multiple compartments.',
    price: 89.99,
    category: 'Sports & Outdoors',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop',
    stock: 40,
    ecoMetrics: {
      materialsScore: 84,
      carbonFootprint: 3.2,
      packagingType: 'paper',
      manufacturingProcess: 'sustainable',
      productLifespan: 72,
      recyclablePercentage: 85,
      biodegradablePercentage: 20,
    },
    sustainabilityScore: 81,
    sustainabilityGrade: 'B',
    seller: {
      name: 'EcoAdventure Gear',
      certifications: ['GRS', 'Bluesign'],
    },
    rating: 4.7,
    reviewCount: 123,
  },
  {
    name: 'Yoga Mat Bag',
    description: 'Stylish bag for yoga mat made from hemp canvas. Includes shoulder strap and small pocket for essentials.',
    price: 16.99,
    category: 'Sports & Outdoors',
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=300&h=300&fit=crop',
    stock: 80,
    ecoMetrics: {
      materialsScore: 87,
      carbonFootprint: 1.2,
      packagingType: 'minimal',
      manufacturingProcess: 'sustainable',
      productLifespan: 48,
      recyclablePercentage: 90,
      biodegradablePercentage: 95,
    },
    sustainabilityScore: 83,
    sustainabilityGrade: 'B',
    seller: {
      name: 'HempYoga Co.',
      certifications: ['OEKO-TEX', 'PETA Approved'],
    },
    rating: 4.5,
    reviewCount: 89,
  },
  {
    name: 'Camping Cookware Set',
    description: 'Lightweight camping cookware made from titanium. Durable, non-stick, and perfect for outdoor adventures.',
    price: 67.99,
    category: 'Sports & Outdoors',
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=300&h=300&fit=crop',
    stock: 25,
    ecoMetrics: {
      materialsScore: 76,
      carbonFootprint: 4.8,
      packagingType: 'minimal',
      manufacturingProcess: 'conventional',
      productLifespan: 120,
      recyclablePercentage: 100,
      biodegradablePercentage: 0,
    },
    sustainabilityScore: 72,
    sustainabilityGrade: 'C',
    seller: {
      name: 'TitaniumOutdoor',
      certifications: ['Food Safe'],
    },
    rating: 4.6,
    reviewCount: 67,
  },

  // Books & Stationery - More options
  {
    name: 'Eco-Friendly Pen Set',
    description: 'Set of 5 pens made from recycled materials. Refillable with eco-friendly ink cartridges.',
    price: 11.99,
    category: 'Books & Stationery',
    image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=300&h=300&fit=crop',
    stock: 180,
    ecoMetrics: {
      materialsScore: 83,
      carbonFootprint: 0.8,
      packagingType: 'paper',
      manufacturingProcess: 'sustainable',
      productLifespan: 24,
      recyclablePercentage: 95,
      biodegradablePercentage: 60,
    },
    sustainabilityScore: 80,
    sustainabilityGrade: 'B',
    seller: {
      name: 'GreenWrite Co.',
      certifications: ['Recycled Content', 'Refillable'],
    },
    rating: 4.4,
    reviewCount: 145,
  },
  {
    name: 'Sustainable Planner',
    description: 'Annual planner made from recycled paper with soy-based ink. Includes eco-friendly tips and sustainability goals.',
    price: 19.99,
    category: 'Books & Stationery',
    image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=300&h=300&fit=crop',
    stock: 120,
    ecoMetrics: {
      materialsScore: 88,
      carbonFootprint: 0.9,
      packagingType: 'minimal',
      manufacturingProcess: 'sustainable',
      productLifespan: 12,
      recyclablePercentage: 100,
      biodegradablePercentage: 100,
    },
    sustainabilityScore: 85,
    sustainabilityGrade: 'A',
    seller: {
      name: 'EcoPlanning Co.',
      certifications: ['FSC', 'Soy Ink'],
    },
    rating: 4.7,
    reviewCount: 98,
  },
  {
    name: 'Bamboo Desk Organizer',
    description: 'Multi-compartment desk organizer made from sustainable bamboo. Helps keep workspace tidy and organized.',
    price: 29.99,
    category: 'Books & Stationery',
    image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=300&h=300&fit=crop',
    stock: 60,
    ecoMetrics: {
      materialsScore: 92,
      carbonFootprint: 1.1,
      packagingType: 'minimal',
      manufacturingProcess: 'sustainable',
      productLifespan: 60,
      recyclablePercentage: 100,
      biodegradablePercentage: 100,
    },
    sustainabilityScore: 89,
    sustainabilityGrade: 'A',
    seller: {
      name: 'BambooOffice Solutions',
      certifications: ['FSC', 'Carbon Neutral'],
    },
    rating: 4.6,
    reviewCount: 76,
  },

  // Toys & Games - More sustainable options
  {
    name: 'Educational Solar Robot Kit',
    description: 'Build your own solar-powered robot kit. Teaches kids about renewable energy while having fun.',
    price: 45.99,
    category: 'Toys & Games',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
    stock: 35,
    ecoMetrics: {
      materialsScore: 78,
      carbonFootprint: 2.5,
      packagingType: 'paper',
      manufacturingProcess: 'renewable-energy',
      productLifespan: 36,
      recyclablePercentage: 80,
      biodegradablePercentage: 30,
    },
    sustainabilityScore: 76,
    sustainabilityGrade: 'B',
    seller: {
      name: 'EcoKids Learning',
      certifications: ['CE Mark', 'Educational', 'Solar Powered'],
    },
    rating: 4.8,
    reviewCount: 123,
  },
  {
    name: 'Organic Cotton Stuffed Animal',
    description: 'Soft stuffed animal made from organic cotton and natural dyes. Safe for babies and toddlers.',
    price: 24.99,
    category: 'Toys & Games',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
    stock: 90,
    ecoMetrics: {
      materialsScore: 94,
      carbonFootprint: 1.3,
      packagingType: 'minimal',
      manufacturingProcess: 'sustainable',
      productLifespan: 60,
      recyclablePercentage: 100,
      biodegradablePercentage: 100,
    },
    sustainabilityScore: 91,
    sustainabilityGrade: 'A',
    seller: {
      name: 'NaturalToys Co.',
      certifications: ['GOTS', 'Non-Toxic', 'Baby Safe'],
    },
    rating: 4.9,
    reviewCount: 234,
  },
  {
    name: 'Recycled Cardboard Playhouse',
    description: 'Large cardboard playhouse that kids can color and decorate. Made from recycled materials and fully recyclable.',
    price: 39.99,
    category: 'Toys & Games',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
    stock: 50,
    ecoMetrics: {
      materialsScore: 96,
      carbonFootprint: 0.6,
      packagingType: 'minimal',
      manufacturingProcess: 'sustainable',
      productLifespan: 6,
      recyclablePercentage: 100,
      biodegradablePercentage: 100,
    },
    sustainabilityScore: 93,
    sustainabilityGrade: 'A',
    seller: {
      name: 'CardboardPlay Co.',
      certifications: ['FSC', 'Recycled Content', 'Non-Toxic'],
    },
    rating: 4.7,
    reviewCount: 89,
  },

  // Additional products with different sustainability grades for testing
  {
    name: 'Conventional Plastic Toy',
    description: 'Standard plastic toy with electronic features. Made from conventional materials.',
    price: 15.99,
    category: 'Toys & Games',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
    stock: 200,
    ecoMetrics: {
      materialsScore: 25,
      carbonFootprint: 6.8,
      packagingType: 'plastic',
      manufacturingProcess: 'conventional',
      productLifespan: 12,
      recyclablePercentage: 40,
      biodegradablePercentage: 0,
    },
    sustainabilityScore: 28,
    sustainabilityGrade: 'E',
    seller: {
      name: 'Generic Toys Inc.',
      certifications: ['CE Mark'],
    },
    rating: 3.8,
    reviewCount: 45,
  },
  {
    name: 'Fast Fashion T-Shirt',
    description: 'Basic cotton t-shirt from conventional manufacturing. Low-cost fashion item.',
    price: 8.99,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
    stock: 500,
    ecoMetrics: {
      materialsScore: 35,
      carbonFootprint: 5.2,
      packagingType: 'plastic',
      manufacturingProcess: 'conventional',
      productLifespan: 12,
      recyclablePercentage: 60,
      biodegradablePercentage: 80,
    },
    sustainabilityScore: 42,
    sustainabilityGrade: 'D',
    seller: {
      name: 'BudgetFashion Store',
      certifications: [],
    },
    rating: 3.5,
    reviewCount: 78,
  },
  {
    name: 'Disposable Coffee Cups (Pack of 50)',
    description: 'Single-use coffee cups made from paper with plastic lining. Convenient but not eco-friendly.',
    price: 12.99,
    category: 'Food & Beverages',
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&h=300&fit=crop',
    stock: 300,
    ecoMetrics: {
      materialsScore: 15,
      carbonFootprint: 4.5,
      packagingType: 'plastic',
      manufacturingProcess: 'conventional',
      productLifespan: 0.1,
      recyclablePercentage: 20,
      biodegradablePercentage: 30,
    },
    sustainabilityScore: 22,
    sustainabilityGrade: 'F',
    seller: {
      name: 'Convenience Store',
      certifications: [],
    },
    rating: 3.2,
    reviewCount: 23,
  },
];

// Database connection function
async function connectToDatabase() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI environment variable is required');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    console.log('MongoDB URI (partial):', MONGODB_URI.substring(0, 50) + '...');

    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000
    });

    console.log('✅ Successfully connected to MongoDB Atlas');
    console.log('Database Name:', mongoose.connection.db.databaseName);
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    return false;
  }
}

// Function to add products to database
async function addProductsToDatabase() {
  try {
    console.log('🚀 Starting to add products to database...');
    
    // Check if products already exist
    const existingProducts = await Product.find({});
    console.log(`📊 Found ${existingProducts.length} existing products in database`);

    // Filter out products that might already exist
    const productsToAdd = [];
    for (const product of EXTENDED_PRODUCTS) {
      const exists = await Product.findOne({ name: product.name });
      if (!exists) {
        productsToAdd.push(product);
      } else {
        console.log(`⚠️  Product "${product.name}" already exists, skipping...`);
      }
    }

    if (productsToAdd.length === 0) {
      console.log('✅ All products already exist in database!');
      return;
    }

    console.log(`📦 Adding ${productsToAdd.length} new products...`);

    // Add products in batches
    const batchSize = 10;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < productsToAdd.length; i += batchSize) {
      const batch = productsToAdd.slice(i, i + batchSize);
      console.log(`📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(productsToAdd.length/batchSize)} (${batch.length} products)...`);

      try {
        const createdProducts = await Product.insertMany(batch, { ordered: false });
        successCount += createdProducts.length;
        console.log(`✅ Batch successful: ${createdProducts.length} products added`);
      } catch (error) {
        console.error(`❌ Batch failed:`, error.message);
        errorCount += batch.length;
      }

      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n📊 Summary:`);
    console.log(`✅ Successfully added: ${successCount} products`);
    console.log(`❌ Failed: ${errorCount} products`);
    console.log(`📈 Total processed: ${productsToAdd.length} products`);

    return {
      success: successCount,
      failed: errorCount,
      total: productsToAdd.length
    };

  } catch (error) {
    console.error('💥 Error adding products:', error);
    throw error;
  }
}

// Function to verify products were added
async function verifyProductsAdded() {
  try {
    console.log('🔍 Verifying products in database...');
    
    const allProducts = await Product.find({});
    console.log(`📊 Total products in database: ${allProducts.length}`);
    
    // Count by category
    const categoryCount = {};
    const gradeCount = {};
    
    allProducts.forEach(product => {
      categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
      gradeCount[product.sustainabilityGrade] = (gradeCount[product.sustainabilityGrade] || 0) + 1;
    });

    console.log('\n📈 Products by Category:');
    Object.entries(categoryCount).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} products`);
    });

    console.log('\n🌱 Products by Sustainability Grade:');
    Object.entries(gradeCount).forEach(([grade, count]) => {
      console.log(`  Grade ${grade}: ${count} products`);
    });

    return allProducts;
  } catch (error) {
    console.error('💥 Error verifying products:', error);
    return [];
  }
}

// Main function
async function main() {
  try {
    console.log('🎯 Starting Eco-Lens Product Seeding Process...\n');
    
    // Step 1: Connect to database
    const connected = await connectToDatabase();
    if (!connected) {
      console.log('❌ Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Step 2: Add products
    console.log('\nStep 1: Adding products to database');
    const addResult = await addProductsToDatabase();
    
    if (addResult && addResult.success > 0) {
      // Step 3: Verify products
      console.log('\nStep 2: Verifying products');
      await verifyProductsAdded();
      
      console.log('\n🎉 Product seeding process completed successfully!');
      console.log(`📊 Added ${addResult.success} new products to test the recommendation system`);
    } else {
      console.log('ℹ️  No new products were added (they may already exist)');
    }

  } catch (error) {
    console.error('💥 Product seeding process failed:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  addProductsToDatabase,
  verifyProductsAdded,
  EXTENDED_PRODUCTS
};
