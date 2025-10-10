/**
 * Test Dynamic Recommendation System
 * Simple test to verify the system is working
 */

import DynamicRecommendationService from '../api/dynamicRecommendationService';

export const testDynamicRecommendationSystem = async () => {
  try {
    console.log('🧪 Testing Dynamic Recommendation System...');
    
    // Test 1: Get real-time recommendations
    console.log('Test 1: Getting real-time recommendations...');
    const recommendations = await DynamicRecommendationService.getRealTimeRecommendations(5);
    console.log('✅ Real-time recommendations:', recommendations.recommendations?.length || 0, 'products');
    
    // Test 2: Track a search
    console.log('Test 2: Tracking search...');
    await DynamicRecommendationService.trackSearch({
      searchQuery: 'test search',
      category: 'Electronics',
      resultsCount: 5
    });
    console.log('✅ Search tracked successfully');
    
    // Test 3: Get behavior insights
    console.log('Test 3: Getting behavior insights...');
    const insights = await DynamicRecommendationService.getBehaviorInsights();
    console.log('✅ Behavior insights:', insights.insights?.engagementScore || 0, 'engagement score');
    
    console.log('🎉 All tests passed! Dynamic Recommendation System is working.');
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
};

export default testDynamicRecommendationSystem;
