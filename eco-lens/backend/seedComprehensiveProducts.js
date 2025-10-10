/**
 * Comprehensive Product Seeding Script
 * Adds 100 unique eco-friendly products to Eco-Lens database
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import the Product model and comprehensive products
const Product = require('./models/Product');
const COMPREHENSIVE_PRODUCTS = require('./comprehensiveProducts');

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

// Function to add comprehensive products to database
async function addComprehensiveProducts() {
  try {
    console.log('🚀 Starting to add comprehensive products to database...');
    
    // Check existing products
    const existingProducts = await Product.find({});
    console.log(`📊 Found ${existingProducts.length} existing products in database`);

    // Filter out products that might already exist (by name)
    const productsToAdd = [];
    const existingNames = existingProducts.map(p => p.name.toLowerCase());
    
    for (const product of COMPREHENSIVE_PRODUCTS) {
      const exists = existingNames.includes(product.name.toLowerCase());
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

    // Add products in batches to avoid overwhelming the database
    const batchSize = 15;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < productsToAdd.length; i += batchSize) {
      const batch = productsToAdd.slice(i, i + batchSize);
      const batchNumber = Math.floor(i/batchSize) + 1;
      const totalBatches = Math.ceil(productsToAdd.length/batchSize);
      
      console.log(`📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} products)...`);

      try {
        const createdProducts = await Product.insertMany(batch, { ordered: false });
        successCount += createdProducts.length;
        console.log(`✅ Batch ${batchNumber} successful: ${createdProducts.length} products added`);
        
        // Show some examples from this batch
        if (createdProducts.length > 0) {
          console.log(`   Examples: ${createdProducts.slice(0, 3).map(p => p.name).join(', ')}`);
        }
      } catch (error) {
        console.error(`❌ Batch ${batchNumber} failed:`, error.message);
        errorCount += batch.length;
      }

      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 800));
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

// Function to verify products and show statistics
async function verifyProductsAndStats() {
  try {
    console.log('🔍 Verifying products and generating statistics...');
    
    const allProducts = await Product.find({});
    console.log(`📊 Total products in database: ${allProducts.length}`);
    
    // Count by category
    const categoryCount = {};
    const gradeCount = {};
    const priceRanges = { budget: 0, midRange: 0, premium: 0 };
    
    allProducts.forEach(product => {
      categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
      gradeCount[product.sustainabilityGrade] = (gradeCount[product.sustainabilityGrade] || 0) + 1;
      
      if (product.price < 25) priceRanges.budget++;
      else if (product.price <= 50) priceRanges.midRange++;
      else priceRanges.premium++;
    });

    console.log('\n📈 Products by Category:');
    Object.entries(categoryCount).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} products`);
    });

    console.log('\n🌱 Products by Sustainability Grade:');
    Object.entries(gradeCount).forEach(([grade, count]) => {
      console.log(`  Grade ${grade}: ${count} products`);
    });

    console.log('\n💰 Products by Price Range:');
    console.log(`  Budget (<$25): ${priceRanges.budget} products`);
    console.log(`  Mid-range ($25-$50): ${priceRanges.midRange} products`);
    console.log(`  Premium (>$50): ${priceRanges.premium} products`);

    // Show some sample products
    console.log('\n🎯 Sample Products:');
    const sampleProducts = allProducts.slice(0, 5);
    sampleProducts.forEach(product => {
      console.log(`  • ${product.name} - $${product.price} (Grade ${product.sustainabilityGrade})`);
    });

    return allProducts;
  } catch (error) {
    console.error('💥 Error verifying products:', error);
    return [];
  }
}

// Function to test recommendation system capabilities
async function testRecommendationCapabilities() {
  try {
    console.log('\n🧪 Testing recommendation system capabilities...');
    
    // Test different filtering scenarios
    const scenarios = [
      { name: 'Eco-Friendly Products (A-B Grade)', filter: { sustainabilityGrade: { $in: ['A', 'B'] } } },
      { name: 'Budget Products (<$25)', filter: { price: { $lt: 25 } } },
      { name: 'Electronics Category', filter: { category: 'Electronics' } },
      { name: 'Fashion Category', filter: { category: 'Fashion' } },
      { name: 'Home & Garden Category', filter: { category: 'Home & Garden' } },
      { name: 'Premium Products (>$50)', filter: { price: { $gt: 50 } } },
    ];

    for (const scenario of scenarios) {
      try {
        const products = await Product.find(scenario.filter).limit(5);
        console.log(`✅ ${scenario.name}: ${products.length} products found`);
        if (products.length > 0) {
          console.log(`   Examples: ${products.slice(0, 2).map(p => p.name).join(', ')}`);
        }
      } catch (error) {
        console.log(`❌ ${scenario.name}: Error - ${error.message}`);
      }
    }

  } catch (error) {
    console.error('💥 Error testing recommendation capabilities:', error);
  }
}

// Main function
async function main() {
  try {
    console.log('🎯 Starting Comprehensive Product Seeding Process...\n');
    
    // Step 1: Connect to database
    const connected = await connectToDatabase();
    if (!connected) {
      console.log('❌ Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Step 2: Add comprehensive products
    console.log('\nStep 1: Adding comprehensive products to database');
    const addResult = await addComprehensiveProducts();
    
    if (addResult && addResult.success > 0) {
      // Step 3: Verify products and show statistics
      console.log('\nStep 2: Verifying products and generating statistics');
      await verifyProductsAndStats();
      
      // Step 4: Test recommendation capabilities
      console.log('\nStep 3: Testing recommendation system capabilities');
      await testRecommendationCapabilities();
      
      console.log('\n🎉 Comprehensive product seeding completed successfully!');
      console.log(`📊 Added ${addResult.success} new products to test the recommendation system`);
      console.log(`🎯 Your app now has a robust dataset for testing personalized recommendations!`);
    } else {
      console.log('ℹ️  No new products were added (they may already exist)');
      await verifyProductsAndStats();
    }

  } catch (error) {
    console.error('💥 Comprehensive product seeding failed:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  addComprehensiveProducts,
  verifyProductsAndStats,
  testRecommendationCapabilities,
  COMPREHENSIVE_PRODUCTS
};
