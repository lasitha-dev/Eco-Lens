/**
 * Script to add extended products to Eco-Lens database
 * This script will add 27 new products to test the recommendation system
 */

import { EXTENDED_MOCK_PRODUCTS } from './extendedMockData.js';

// API configuration
const API_BASE_URL = 'https://eco-lens-8bn1.onrender.com/api';

// Function to add products to database
export const addExtendedProductsToDatabase = async (authToken) => {
  try {
    console.log('🚀 Starting to add extended products to database...');
    
    const headers = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    };

    // Add products in batches to avoid overwhelming the server
    const batchSize = 5;
    const batches = [];
    
    for (let i = 0; i < EXTENDED_MOCK_PRODUCTS.length; i += batchSize) {
      batches.push(EXTENDED_MOCK_PRODUCTS.slice(i, i + batchSize));
    }

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`📦 Processing batch ${i + 1}/${batches.length} (${batch.length} products)...`);

      try {
        const response = await fetch(`${API_BASE_URL}/products/bulk`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ products: batch }),
        });

        if (response.ok) {
          const result = await response.json();
          successCount += result.count;
          console.log(`✅ Batch ${i + 1} successful: ${result.count} products added`);
        } else {
          const errorData = await response.json();
          console.error(`❌ Batch ${i + 1} failed:`, errorData.error);
          errorCount += batch.length;
        }
      } catch (error) {
        console.error(`❌ Batch ${i + 1} error:`, error.message);
        errorCount += batch.length;
      }

      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\n📊 Summary:`);
    console.log(`✅ Successfully added: ${successCount} products`);
    console.log(`❌ Failed: ${errorCount} products`);
    console.log(`📈 Total processed: ${EXTENDED_MOCK_PRODUCTS.length} products`);

    return {
      success: successCount,
      failed: errorCount,
      total: EXTENDED_MOCK_PRODUCTS.length
    };

  } catch (error) {
    console.error('💥 Error adding products:', error);
    throw error;
  }
};

// Function to add products individually (alternative method)
export const addProductsIndividually = async (authToken) => {
  try {
    console.log('🚀 Adding products individually...');
    
    const headers = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    };

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < EXTENDED_MOCK_PRODUCTS.length; i++) {
      const product = EXTENDED_MOCK_PRODUCTS[i];
      
      try {
        console.log(`📦 Adding product ${i + 1}/${EXTENDED_MOCK_PRODUCTS.length}: ${product.name}`);
        
        const response = await fetch(`${API_BASE_URL}/products`, {
          method: 'POST',
          headers,
          body: JSON.stringify(product),
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`✅ Added: ${result.product.name}`);
          successCount++;
        } else {
          const errorData = await response.json();
          console.error(`❌ Failed to add ${product.name}:`, errorData.error);
          errorCount++;
        }
      } catch (error) {
        console.error(`❌ Error adding ${product.name}:`, error.message);
        errorCount++;
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`\n📊 Summary:`);
    console.log(`✅ Successfully added: ${successCount} products`);
    console.log(`❌ Failed: ${errorCount} products`);

    return {
      success: successCount,
      failed: errorCount,
      total: EXTENDED_MOCK_PRODUCTS.length
    };

  } catch (error) {
    console.error('💥 Error adding products:', error);
    throw error;
  }
};

// Function to verify products were added
export const verifyProductsAdded = async (authToken) => {
  try {
    console.log('🔍 Verifying products in database...');
    
    const headers = {
      'Authorization': `Bearer ${authToken}`,
    };

    const response = await fetch(`${API_BASE_URL}/products?limit=100`, {
      method: 'GET',
      headers,
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`📊 Total products in database: ${result.products.length}`);
      
      // Count by category
      const categoryCount = {};
      const gradeCount = {};
      
      result.products.forEach(product => {
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

      return result.products;
    } else {
      console.error('❌ Failed to verify products');
      return [];
    }

  } catch (error) {
    console.error('💥 Error verifying products:', error);
    return [];
  }
};

// Function to test recommendation system with new products
export const testRecommendationSystem = async (userId, authToken) => {
  try {
    console.log('🧪 Testing recommendation system with new products...');
    
    const headers = {
      'Authorization': `Bearer ${authToken}`,
    };

    // Test different recommendation scenarios
    const testScenarios = [
      { name: 'General Recommendations', endpoint: '/products?limit=10' },
      { name: 'Eco-Friendly Only', endpoint: '/products?grade=A,B&limit=10' },
      { name: 'Electronics Category', endpoint: '/products?category=Electronics&limit=10' },
      { name: 'Budget Products', endpoint: '/products?maxPrice=25&limit=10' },
      { name: 'Premium Products', endpoint: '/products?minPrice=50&limit=10' },
    ];

    for (const scenario of testScenarios) {
      try {
        console.log(`\n🔍 Testing: ${scenario.name}`);
        
        const response = await fetch(`${API_BASE_URL}${scenario.endpoint}`, {
          method: 'GET',
          headers,
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`✅ Found ${result.products.length} products`);
          
          // Show sample products
          result.products.slice(0, 3).forEach(product => {
            console.log(`  - ${product.name} (${product.category}, Grade ${product.sustainabilityGrade}, $${product.price})`);
          });
        } else {
          console.log(`❌ Failed: ${scenario.name}`);
        }
      } catch (error) {
        console.log(`❌ Error testing ${scenario.name}:`, error.message);
      }
    }

  } catch (error) {
    console.error('💥 Error testing recommendation system:', error);
  }
};

// Main function to run the complete process
export const runProductAdditionProcess = async (authToken) => {
  try {
    console.log('🎯 Starting complete product addition process...\n');
    
    // Step 1: Add products
    console.log('Step 1: Adding products to database');
    const addResult = await addExtendedProductsToDatabase(authToken);
    
    if (addResult.success > 0) {
      // Step 2: Verify products
      console.log('\nStep 2: Verifying products');
      await verifyProductsAdded(authToken);
      
      // Step 3: Test recommendation system
      console.log('\nStep 3: Testing recommendation system');
      await testRecommendationSystem(null, authToken);
      
      console.log('\n🎉 Product addition process completed successfully!');
      console.log(`📊 Added ${addResult.success} new products to test the recommendation system`);
    } else {
      console.log('❌ No products were added. Please check your authentication and try again.');
    }

  } catch (error) {
    console.error('💥 Product addition process failed:', error);
  }
};

export default {
  addExtendedProductsToDatabase,
  addProductsIndividually,
  verifyProductsAdded,
  testRecommendationSystem,
  runProductAdditionProcess
};
