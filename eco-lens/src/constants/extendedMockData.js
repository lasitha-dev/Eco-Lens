/**
 * Extended Mock Product Data for Eco-Lens App Testing
 * Additional products to test personalized recommendation system
 */

export const EXTENDED_MOCK_PRODUCTS = [
  // Electronics - More variety
  {
    id: '16',
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
    sustainabilityGrade: 'B',
    sustainabilityScore: 76,
    seller: {
      name: 'AudioEco Tech',
      certifications: ['Energy Star', 'RoHS'],
    },
    rating: 4.6,
    reviewCount: 234,
  },
  {
    id: '17',
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
    sustainabilityGrade: 'A',
    sustainabilityScore: 89,
    seller: {
      name: 'BambooTech Solutions',
      certifications: ['FSC', 'Carbon Neutral'],
    },
    rating: 4.7,
    reviewCount: 156,
  },
  {
    id: '18',
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
    sustainabilityGrade: 'B',
    sustainabilityScore: 79,
    seller: {
      name: 'GreenHome Tech',
      certifications: ['Energy Star', 'B Corp'],
    },
    rating: 4.4,
    reviewCount: 89,
  },

  // Fashion - More sustainable options
  {
    id: '19',
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
    sustainabilityGrade: 'B',
    sustainabilityScore: 80,
    seller: {
      name: 'RecycledWear Co.',
      certifications: ['GRS', 'OEKO-TEX'],
    },
    rating: 4.5,
    reviewCount: 178,
  },
  {
    id: '20',
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
    sustainabilityGrade: 'A',
    sustainabilityScore: 93,
    seller: {
      name: 'CorkCraft Studio',
      certifications: ['FSC', 'PETA Approved'],
    },
    rating: 4.8,
    reviewCount: 267,
  },
  {
    id: '21',
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
    sustainabilityGrade: 'A',
    sustainabilityScore: 85,
    seller: {
      name: 'Ethical Denim Co.',
      certifications: ['GOTS', 'Fair Trade', 'OEKO-TEX'],
    },
    rating: 4.6,
    reviewCount: 145,
  },

  // Home & Garden - More variety
  {
    id: '22',
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
    sustainabilityGrade: 'A',
    sustainabilityScore: 87,
    seller: {
      name: 'GreenThumb Gardens',
      certifications: ['USDA Organic', 'Non-GMO'],
    },
    rating: 4.7,
    reviewCount: 198,
  },
  {
    id: '23',
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
    sustainabilityGrade: 'A',
    sustainabilityScore: 91,
    seller: {
      name: 'BambooKitchen Co.',
      certifications: ['FSC', 'Food Safe'],
    },
    rating: 4.8,
    reviewCount: 312,
  },
  {
    id: '24',
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
    sustainabilityGrade: 'A',
    sustainabilityScore: 96,
    seller: {
      name: 'VermiCompost Solutions',
      certifications: ['USDA Organic', 'Zero Waste'],
    },
    rating: 4.9,
    reviewCount: 89,
  },

  // Food & Beverages - More options
  {
    id: '25',
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
    sustainabilityGrade: 'A',
    sustainabilityScore: 92,
    seller: {
      name: 'PureLeaf Teas',
      certifications: ['USDA Organic', 'Fair Trade', 'Rainforest Alliance'],
    },
    rating: 4.8,
    reviewCount: 156,
  },
  {
    id: '26',
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
    sustainabilityGrade: 'A',
    sustainabilityScore: 86,
    seller: {
      name: 'PlantPower Nutrition',
      certifications: ['USDA Organic', 'Non-GMO', 'Vegan'],
    },
    rating: 4.6,
    reviewCount: 234,
  },
  {
    id: '27',
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
    sustainabilityGrade: 'A',
    sustainabilityScore: 94,
    seller: {
      name: 'Local Bee Co.',
      certifications: ['Local Sourced', 'Raw Honey'],
    },
    rating: 4.9,
    reviewCount: 189,
  },

  // Personal Care - More sustainable options
  {
    id: '28',
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
    sustainabilityGrade: 'A',
    sustainabilityScore: 90,
    seller: {
      name: 'ZeroWaste Beauty',
      certifications: ['Cruelty Free', 'Vegan', 'Zero Waste'],
    },
    rating: 4.7,
    reviewCount: 267,
  },
  {
    id: '29',
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
    sustainabilityGrade: 'A',
    sustainabilityScore: 88,
    seller: {
      name: 'PureCare Essentials',
      certifications: ['Cruelty Free', 'Natural', 'Aluminum Free'],
    },
    rating: 4.5,
    reviewCount: 345,
  },
  {
    id: '30',
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
    sustainabilityGrade: 'A',
    sustainabilityScore: 87,
    seller: {
      name: 'EcoBeauty Solutions',
      certifications: ['Cruelty Free', 'Organic Cotton'],
    },
    rating: 4.6,
    reviewCount: 178,
  },

  // Sports & Outdoors - More variety
  {
    id: '31',
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
    sustainabilityGrade: 'B',
    sustainabilityScore: 81,
    seller: {
      name: 'EcoAdventure Gear',
      certifications: ['GRS', 'Bluesign'],
    },
    rating: 4.7,
    reviewCount: 123,
  },
  {
    id: '32',
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
    sustainabilityGrade: 'B',
    sustainabilityScore: 83,
    seller: {
      name: 'HempYoga Co.',
      certifications: ['OEKO-TEX', 'PETA Approved'],
    },
    rating: 4.5,
    reviewCount: 89,
  },
  {
    id: '33',
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
    sustainabilityGrade: 'C',
    sustainabilityScore: 72,
    seller: {
      name: 'TitaniumOutdoor',
      certifications: ['Food Safe'],
    },
    rating: 4.6,
    reviewCount: 67,
  },

  // Books & Stationery - More options
  {
    id: '34',
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
    sustainabilityGrade: 'B',
    sustainabilityScore: 80,
    seller: {
      name: 'GreenWrite Co.',
      certifications: ['Recycled Content', 'Refillable'],
    },
    rating: 4.4,
    reviewCount: 145,
  },
  {
    id: '35',
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
    sustainabilityGrade: 'A',
    sustainabilityScore: 85,
    seller: {
      name: 'EcoPlanning Co.',
      certifications: ['FSC', 'Soy Ink'],
    },
    rating: 4.7,
    reviewCount: 98,
  },
  {
    id: '36',
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
    sustainabilityGrade: 'A',
    sustainabilityScore: 89,
    seller: {
      name: 'BambooOffice Solutions',
      certifications: ['FSC', 'Carbon Neutral'],
    },
    rating: 4.6,
    reviewCount: 76,
  },

  // Toys & Games - More sustainable options
  {
    id: '37',
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
    sustainabilityGrade: 'B',
    sustainabilityScore: 76,
    seller: {
      name: 'EcoKids Learning',
      certifications: ['CE Mark', 'Educational', 'Solar Powered'],
    },
    rating: 4.8,
    reviewCount: 123,
  },
  {
    id: '38',
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
    sustainabilityGrade: 'A',
    sustainabilityScore: 91,
    seller: {
      name: 'NaturalToys Co.',
      certifications: ['GOTS', 'Non-Toxic', 'Baby Safe'],
    },
    rating: 4.9,
    reviewCount: 234,
  },
  {
    id: '39',
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
    sustainabilityGrade: 'A',
    sustainabilityScore: 93,
    seller: {
      name: 'CardboardPlay Co.',
      certifications: ['FSC', 'Recycled Content', 'Non-Toxic'],
    },
    rating: 4.7,
    reviewCount: 89,
  },

  // Additional products with different sustainability grades for testing
  {
    id: '40',
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
    sustainabilityGrade: 'E',
    sustainabilityScore: 28,
    seller: {
      name: 'Generic Toys Inc.',
      certifications: ['CE Mark'],
    },
    rating: 3.8,
    reviewCount: 45,
  },
  {
    id: '41',
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
    sustainabilityGrade: 'D',
    sustainabilityScore: 42,
    seller: {
      name: 'BudgetFashion Store',
      certifications: [],
    },
    rating: 3.5,
    reviewCount: 78,
  },
  {
    id: '42',
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
    sustainabilityGrade: 'F',
    sustainabilityScore: 22,
    seller: {
      name: 'Convenience Store',
      certifications: [],
    },
    rating: 3.2,
    reviewCount: 23,
  },
];

// Helper function to get all extended products
export const getAllExtendedProducts = () => {
  return EXTENDED_MOCK_PRODUCTS;
};

// Helper function to get products by category
export const getProductsByCategory = (category) => {
  return EXTENDED_MOCK_PRODUCTS.filter(product => product.category === category);
};

// Helper function to get products by sustainability grade
export const getProductsByGrade = (grade) => {
  return EXTENDED_MOCK_PRODUCTS.filter(product => product.sustainabilityGrade === grade);
};

// Helper function to get products by price range
export const getProductsByPriceRange = (minPrice, maxPrice) => {
  return EXTENDED_MOCK_PRODUCTS.filter(product => 
    product.price >= minPrice && product.price <= maxPrice
  );
};

// Helper function to get eco-friendly products (A and B grades)
export const getEcoFriendlyProducts = () => {
  return EXTENDED_MOCK_PRODUCTS.filter(product => 
    ['A', 'B'].includes(product.sustainabilityGrade)
  );
};

// Helper function to get budget products (under $25)
export const getBudgetProducts = () => {
  return EXTENDED_MOCK_PRODUCTS.filter(product => product.price < 25);
};

// Helper function to get premium products (over $50)
export const getPremiumProducts = () => {
  return EXTENDED_MOCK_PRODUCTS.filter(product => product.price > 50);
};

// Category distribution for testing
export const CATEGORY_DISTRIBUTION = {
  'Electronics': 6,
  'Fashion': 6,
  'Home & Garden': 6,
  'Food & Beverages': 6,
  'Personal Care': 6,
  'Sports & Outdoors': 6,
  'Books & Stationery': 6,
  'Toys & Games': 6,
};

// Sustainability grade distribution for testing
export const GRADE_DISTRIBUTION = {
  'A': 18,
  'B': 15,
  'C': 3,
  'D': 1,
  'E': 1,
  'F': 1,
};

// Price range distribution for testing
export const PRICE_RANGE_DISTRIBUTION = {
  'budget': 12,      // Under $25
  'mid-range': 20,   // $25-$50
  'premium': 10,     // Over $50
};
