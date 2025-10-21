/**
 * Sample test and demonstration of GoalProgressCalculator
 * This can be used to verify the calculator is working correctly
 */

import GoalProgressCalculator, { 
  GradeBasedCalculator, 
  ScoreBasedCalculator, 
  CategoryBasedCalculator,
  ProgressUtils 
} from './GoalProgressCalculator';

// Sample test data
const sampleGoal = {
  _id: 'goal1',
  goalType: 'grade_based',
  title: 'Buy A/B Grade Products',
  goalConfig: {
    targetGrades: ['A', 'B'],
    percentage: 80
  }
};

const samplePurchaseHistory = [
  {
    _id: 'order1',
    createdAt: new Date('2024-01-15'),
    items: [
      {
        product: {
          name: 'Eco Water Bottle',
          sustainabilityGrade: 'A',
          sustainabilityScore: 95,
          category: 'Home & Kitchen'
        },
        quantity: 1,
        price: 25.99
      },
      {
        product: {
          name: 'Regular Plastic Bottle',
          sustainabilityGrade: 'D',
          sustainabilityScore: 45,
          category: 'Home & Kitchen'
        },
        quantity: 2,
        price: 5.99
      }
    ]
  },
  {
    _id: 'order2',
    createdAt: new Date('2024-01-20'),
    items: [
      {
        product: {
          name: 'Organic Cotton Shirt',
          sustainabilityGrade: 'B',
          sustainabilityScore: 85,
          category: 'Clothing'
        },
        quantity: 1,
        price: 45.99
      }
    ]
  }
];

/**
 * Test the GoalProgressCalculator functionality
 */
export function testGoalProgressCalculator() {
  console.log('🧮 Testing GoalProgressCalculator...\n');

  try {
    // Test 1: Basic progress calculation
    console.log('📊 Test 1: Basic Progress Calculation');
    const progress = GoalProgressCalculator.calculateGoalProgress(
      sampleGoal, 
      samplePurchaseHistory
    );
    
    console.log('Progress Results:', {
      totalItems: progress.totalItems,
      goalMetItems: progress.goalMetItems,
      currentPercentage: progress.currentPercentage.toFixed(1) + '%',
      targetPercentage: progress.targetPercentage + '%',
      isAchieved: progress.isAchieved,
      progressStatus: progress.progressStatus
    });
    console.log('Insights:', progress.insights.map(i => i.message));
    console.log('');

    // Test 2: Product alignment checking
    console.log('🎯 Test 2: Product Alignment Checking');
    const testProduct = {
      name: 'Test Product',
      sustainabilityGrade: 'A',
      sustainabilityScore: 90,
      category: 'Electronics'
    };
    
    const alignment = GoalProgressCalculator.checkProductAlignment(testProduct, sampleGoal);
    console.log(`Product "${testProduct.name}" meets goal:`, alignment);
    console.log('');

    // Test 3: Specialized calculator (Grade-based)
    console.log('🏅 Test 3: Grade-based Specialized Calculator');
    const gradeProgress = GradeBasedCalculator.calculateProgress(
      sampleGoal, 
      samplePurchaseHistory
    );
    
    console.log('Grade-specific insights:', gradeProgress.gradeSpecificInsights);
    console.log('');

    // Test 4: Progress utilities
    console.log('🔧 Test 4: Progress Utilities');
    const color = ProgressUtils.getProgressColor(progress.currentPercentage, progress.targetPercentage);
    const difficulty = ProgressUtils.calculateDifficulty(sampleGoal);
    
    console.log('Progress color:', color);
    console.log('Goal difficulty (1-5):', difficulty);
    console.log('Formatted percentage:', ProgressUtils.formatPercentage(progress.currentPercentage));
    console.log('');

    // Test 5: Batch calculation
    console.log('📦 Test 5: Batch Progress Calculation');
    const multipleGoals = [
      sampleGoal,
      {
        _id: 'goal2',
        goalType: 'score_based',
        title: 'Buy 80+ Score Products',
        goalConfig: {
          minimumScore: 80,
          percentage: 70
        }
      }
    ];
    
    const batchResults = GoalProgressCalculator.batchCalculateProgress(
      multipleGoals, 
      samplePurchaseHistory
    );
    
    console.log('Batch results for', batchResults.size, 'goals:');
    batchResults.forEach((progress, goalId) => {
      console.log(`- Goal ${goalId}: ${progress.currentPercentage.toFixed(1)}% progress`);
    });
    console.log('');

    console.log('✅ All tests completed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

/**
 * Performance benchmark for the calculator
 */
export function benchmarkCalculator() {
  console.log('⏱️ Benchmarking GoalProgressCalculator performance...\n');

  // Generate larger test data
  const largeGoals = Array.from({ length: 10 }, (_, i) => ({
    _id: `goal${i + 1}`,
    goalType: ['grade_based', 'score_based', 'category_based'][i % 3],
    title: `Test Goal ${i + 1}`,
    goalConfig: {
      targetGrades: ['A', 'B'],
      minimumScore: 70 + (i * 2),
      targetCategories: ['Electronics', 'Clothing'],
      percentage: 60 + (i * 3)
    }
  }));

  const largePurchaseHistory = Array.from({ length: 100 }, (_, i) => ({
    _id: `order${i + 1}`,
    createdAt: new Date(2024, 0, i + 1),
    items: Array.from({ length: Math.ceil(Math.random() * 5) }, (_, j) => ({
      product: {
        name: `Product ${i}-${j}`,
        sustainabilityGrade: ['A', 'B', 'C', 'D', 'F'][Math.floor(Math.random() * 5)],
        sustainabilityScore: Math.floor(Math.random() * 100),
        category: ['Electronics', 'Clothing', 'Home & Kitchen'][Math.floor(Math.random() * 3)]
      },
      quantity: Math.ceil(Math.random() * 3),
      price: Math.random() * 100
    }))
  }));

  // Benchmark batch calculation
  const startTime = performance.now();
  const results = GoalProgressCalculator.batchCalculateProgress(largeGoals, largePurchaseHistory);
  const endTime = performance.now();

  console.log(`📈 Processed ${largeGoals.length} goals with ${largePurchaseHistory.length} orders`);
  console.log(`⚡ Execution time: ${(endTime - startTime).toFixed(2)}ms`);
  console.log(`🎯 Average time per goal: ${((endTime - startTime) / largeGoals.length).toFixed(2)}ms`);
  console.log(`📊 Results generated: ${results.size} goal progress calculations`);

  return {
    totalTime: endTime - startTime,
    avgTimePerGoal: (endTime - startTime) / largeGoals.length,
    goalsProcessed: largeGoals.length,
    ordersProcessed: largePurchaseHistory.length
  };
}

// Export for manual testing
export { sampleGoal, samplePurchaseHistory };
