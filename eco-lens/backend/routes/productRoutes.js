const express = require('express');
const Product = require('../models/Product');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const router = express.Router();

// Helper function to handle async route errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// GET /api/products - Get all products with filtering and sorting (public access)
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  try {
    const {
      category,
      grade,
      minPrice,
      maxPrice,
      minScore,
      maxScore,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 50
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (grade && grade !== 'All') {
      filter.sustainabilityGrade = grade;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (minScore || maxScore) {
      filter.sustainabilityScore = {};
      if (minScore) filter.sustainabilityScore.$gte = parseInt(minScore);
      if (maxScore) filter.sustainabilityScore.$lte = parseInt(maxScore);
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { 'seller.name': { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    const validSortFields = [
      'name', 'price', 'sustainabilityScore', 'sustainabilityGrade', 
      'rating', 'reviewCount', 'createdAt', 'updatedAt'
    ];
    
    if (validSortFields.includes(sortBy)) {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sort.createdAt = -1; // Default sort
    }

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Execute queries
    const [products, totalCount] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(filter)
    ]);

    // Transform products to match frontend format
    const transformedProducts = products.map(product => ({
      ...product,
      id: product._id.toString()
    }));

    res.json({
      products: transformedProducts,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalProducts: totalCount,
        hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
        hasPreviousPage: pageNum > 1
      },
      filters: {
        category,
        grade,
        minPrice,
        maxPrice,
        minScore,
        maxScore,
        search
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      error: 'Failed to fetch products',
      message: error.message 
    });
  }
}));

// GET /api/products/:id - Get single product by ID (public access)
router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).lean();

    if (!product || !product.isActive) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Transform to match frontend format
    const transformedProduct = {
      ...product,
      id: product._id.toString()
    };

    res.json(transformedProduct);

  } catch (error) {
    console.error('Error fetching product:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid product ID format' });
    }
    res.status(500).json({ 
      error: 'Failed to fetch product',
      message: error.message 
    });
  }
}));

// POST /api/products - Create new product (admin only)
router.post('/', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      stock,
      image,
      ecoMetrics,
      sustainabilityScore,
      sustainabilityGrade,
      seller,
      rating = 0,
      reviewCount = 0
    } = req.body;

    // Validation
    if (!name || !description || !price || !category || !image || !ecoMetrics || !seller) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['name', 'description', 'price', 'category', 'image', 'ecoMetrics', 'seller']
      });
    }

    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({ error: 'Price must be a positive number' });
    }

    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({ error: 'Stock must be a non-negative number' });
    }

    // Create new product
    const newProduct = new Product({
      name: name.trim(),
      description: description.trim(),
      price,
      category,
      stock: stock || 0,
      image: image.trim(),
      ecoMetrics,
      sustainabilityScore,
      sustainabilityGrade,
      seller: {
        name: seller.name.trim(),
        certifications: seller.certifications || []
      },
      rating: rating || 0,
      reviewCount: reviewCount || 0
    });

    const savedProduct = await newProduct.save();

    // Transform to match frontend format
    const transformedProduct = {
      ...savedProduct.toJSON(),
      id: savedProduct._id.toString()
    };

    console.log(`✅ New product created: ${name} (ID: ${savedProduct._id})`);
    
    res.status(201).json({
      message: 'Product created successfully',
      product: transformedProduct
    });

  } catch (error) {
    console.error('Error creating product:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to create product',
      message: error.message 
    });
  }
}));

// PUT /api/products/:id - Update product (admin only)
router.put('/:id', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.__v;
    delete updateData.createdAt;

    // Trim string fields
    if (updateData.name) updateData.name = updateData.name.trim();
    if (updateData.description) updateData.description = updateData.description.trim();
    if (updateData.image) updateData.image = updateData.image.trim();
    if (updateData.seller?.name) updateData.seller.name = updateData.seller.name.trim();

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { 
        new: true, 
        runValidators: true,
        lean: true
      }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Transform to match frontend format
    const transformedProduct = {
      ...updatedProduct,
      id: updatedProduct._id.toString()
    };

    console.log(`✅ Product updated: ${updatedProduct.name} (ID: ${id})`);
    
    res.json({
      message: 'Product updated successfully',
      product: transformedProduct
    });

  } catch (error) {
    console.error('Error updating product:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid product ID format' });
    }
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to update product',
      message: error.message 
    });
  }
}));

// DELETE /api/products/:id - Delete product (admin only)
router.delete('/:id', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete by setting isActive to false
    const deletedProduct = await Product.findByIdAndUpdate(
      id,
      { 
        isActive: false,
        updatedAt: new Date()
      },
      { new: true, lean: true }
    );

    if (!deletedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    console.log(`✅ Product soft deleted: ${deletedProduct.name} (ID: ${id})`);
    
    res.json({
      message: 'Product deleted successfully',
      productId: id
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid product ID format' });
    }
    
    res.status(500).json({ 
      error: 'Failed to delete product',
      message: error.message 
    });
  }
}));

// POST /api/products/bulk - Bulk create products (admin only)
router.post('/bulk', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Products array is required' });
    }

    if (products.length > 100) {
      return res.status(400).json({ error: 'Cannot create more than 100 products at once' });
    }

    // Create products
    const createdProducts = await Product.insertMany(products, { 
      ordered: false // Continue inserting even if some fail
    });

    console.log(`✅ Bulk created ${createdProducts.length} products`);
    
    res.status(201).json({
      message: `Successfully created ${createdProducts.length} products`,
      count: createdProducts.length,
      products: createdProducts.map(p => ({
        ...p.toJSON(),
        id: p._id.toString()
      }))
    });

  } catch (error) {
    console.error('Error bulk creating products:', error);
    
    if (error.name === 'ValidationError' || error.writeErrors) {
      return res.status(400).json({ 
        error: 'Some products failed validation',
        details: error.writeErrors || error.message
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to create products',
      message: error.message 
    });
  }
}));

// GET /api/products/stats/summary - Get product statistics (admin only)
router.get('/stats/summary', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const [
      totalProducts,
      gradeDistribution,
      categoryDistribution,
      avgSustainabilityScore
    ] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      Product.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$sustainabilityGrade', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Product.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Product.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, avgScore: { $avg: '$sustainabilityScore' } } }
      ])
    ]);

    const stats = {
      totalProducts,
      averageSustainabilityScore: Math.round(avgSustainabilityScore[0]?.avgScore || 0),
      gradeDistribution: gradeDistribution.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      categoryDistribution: categoryDistribution.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      topGradeProducts: gradeDistribution
        .filter(item => ['A', 'B'].includes(item._id))
        .reduce((sum, item) => sum + item.count, 0)
    };

    res.json(stats);

  } catch (error) {
    console.error('Error fetching product stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch product statistics',
      message: error.message 
    });
  }
}));

module.exports = router;