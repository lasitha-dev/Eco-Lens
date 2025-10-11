/**
 * Customer Dashboard Screen
 * Main screen for browsing eco-friendly products
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  TextInput,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProductCard from '../../components/product/ProductCard';
import ProductDetailModal from '../../components/product/ProductDetailModal';
import CartToast from '../../components/CartToast';
import { MOCK_PRODUCTS, CATEGORIES, FILTER_PRESETS, SORT_OPTIONS } from '../../constants/mockData';
import ProductService from '../../api/productService';
import SurveyService from '../../api/surveyService';
import SearchAnalyticsService from '../../api/searchAnalyticsService';
import EnhancedRecommendationService from '../../api/enhancedRecommendationService';
import DynamicRecommendationService from '../../api/dynamicRecommendationService';
import CartService from '../../api/cartService';
import SustainabilityGoalService from '../../api/sustainabilityGoalService';
import { useAuth } from '../../hooks/useAuthLogin';
import { testAuthToken } from '../../utils/authTest';
import SimpleAuthDebugger from '../../components/SimpleAuthDebugger';
import theme from '../../styles/theme';
import globalStyles from '../../styles/globalStyles';

const { width: screenWidth } = Dimensions.get('window');

const CustomerDashboard = ({ navigation }) => {
  const { user, auth } = useAuth();

  // State management
  const [products, setProducts] = useState([]);
  const [personalizedProducts, setPersonalizedProducts] = useState([]);
  const [userPreferences, setUserPreferences] = useState(null);
  const [surveyCompleted, setSurveyCompleted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSort, setSelectedSort] = useState('eco-high');
  const [isListView, setIsListView] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showPersonalized, setShowPersonalized] = useState(true);
  
  // Search tracking state
  const [currentSearchId, setCurrentSearchId] = useState(null);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchInsights, setSearchInsights] = useState(null);
  const [recommendationInsights, setRecommendationInsights] = useState(null);
  const [showAuthDebugger, setShowAuthDebugger] = useState(false);
  
  // Cart toast state
  const [showCartToast, setShowCartToast] = useState(false);
  const [cartToastMessage, setCartToastMessage] = useState('');

  // Sustainability goals state
  const [activeGoals, setActiveGoals] = useState([]);
  const [goalStats, setGoalStats] = useState(null);
  const [goalsLoading, setGoalsLoading] = useState(false);

  // Handle product press with dynamic tracking
  const handleProductPress = useCallback(async (product) => {
    setSelectedProduct(product);
    setIsModalVisible(true);
    
    // Track product view with dynamic recommendations
    try {
      await DynamicRecommendationService.trackProductView(product.id, 0, 'search');
      console.log('✅ Product view tracked with dynamic updates');
      console.log(`🎯 Tracked product: ${product.name} (${product.category}) - Grade: ${product.sustainabilityGrade}`);
      
      // Refresh personalized recommendations after tracking
      await refreshPersonalizedRecommendations();
    } catch (error) {
      console.error('Error tracking product view with dynamic system:', error);
      // Don't fail the product view, just log the error
    }
    
    // Also track with legacy system for backward compatibility
    if (currentSearchId) {
      try {
        await SearchAnalyticsService.trackProductClick(currentSearchId, product.id, 0);
        console.log('✅ Product click tracked for search:', currentSearchId);
      } catch (error) {
        console.error('Error tracking product click:', error);
      }
    }
  }, [currentSearchId]);

  // Handle add to cart with dynamic tracking and optimistic UI
  const handleAddToCart = useCallback(async (product, quantity) => {
    // Optimistic UI update - show toast immediately
    setCartToastMessage(`${quantity} × ${product.name} added to cart!`);
    setShowCartToast(true);
    setIsModalVisible(false);

    // Track add to cart with dynamic recommendations
    try {
      await DynamicRecommendationService.trackAddToCart(product.id, quantity, 'search');
      console.log('✅ Add to cart tracked with dynamic updates');
      console.log(`🛒 Added to cart: ${quantity}x ${product.name} (${product.category}) - Grade: ${product.sustainabilityGrade}`);
      
      // Refresh personalized recommendations after tracking
      await refreshPersonalizedRecommendations();
    } catch (error) {
      console.error('Error tracking add to cart with dynamic system:', error);
      // Don't fail the add to cart, just log the error
    }

    try {
      // Make API call in background
      const response = await CartService.addToCart(product.id || product._id, quantity, auth);
      
      if (!response.success) {
        // If failed, show error and hide toast
        setShowCartToast(false);
        Alert.alert('Error', response.error || 'Failed to add item to cart');
      }
      // Success - toast already showing, no need to do anything
    } catch (error) {
      // If error, show error and hide toast
      console.error('Error adding to cart:', error);
      setShowCartToast(false);
      Alert.alert('Error', 'Failed to add item to cart. Please try again.');
    }
  }, [auth, navigation]);

  // Load products and personalized recommendations on component mount
  useEffect(() => {
    loadProducts();
    loadPersonalizedRecommendations();
    loadActiveGoals(); // Load sustainability goals
    
    // Test authentication for debugging
    testAuthToken().then(result => {
      console.log('🔍 Auth test result:', result);
    });
  }, []);

  // Debug: Track showPersonalized changes
  useEffect(() => {
    console.log('showPersonalized changed to:', showPersonalized);
    console.log('Current products count:', products.length);
    console.log('Current personalized products count:', personalizedProducts.length);
  }, [showPersonalized, products.length, personalizedProducts.length]);

  // Refresh personalized recommendations after user interactions
  const refreshPersonalizedRecommendations = useCallback(async () => {
    if (!user || !auth) {
      console.log('No user or auth token available for refreshing recommendations');
      return;
    }
    
    try {
      console.log('🔄 Refreshing personalized recommendations after user interaction...');
      
      // Get fresh dynamic recommendations
      const dynamicResponse = await DynamicRecommendationService.getRealTimeRecommendations(20);
      if (dynamicResponse.recommendations && dynamicResponse.recommendations.length > 0) {
        setPersonalizedProducts(dynamicResponse.recommendations);
        console.log(`✅ Refreshed ${dynamicResponse.recommendations.length} personalized recommendations`);
        console.log(`🔍 New sample recommendations:`, dynamicResponse.recommendations.slice(0, 3).map(p => ({ name: p.name, category: p.category, grade: p.sustainabilityGrade })));
      }
    } catch (error) {
      console.error('Error refreshing personalized recommendations:', error);
    }
  }, [user, auth]);

  // Load personalized recommendations with dynamic updates
  const loadPersonalizedRecommendations = async () => {
    if (!user || !auth) {
      console.log('No user or auth token available for personalized recommendations');
      return;
    }
    
    try {
      // First check survey completion status (this should always be done)
      const statusResponse = await SurveyService.checkSurveyStatus(user.id, auth);
      console.log('📊 Survey status from server:', statusResponse);
      
      // Also check AsyncStorage for local survey completion status
      try {
        const localSurveyCompleted = await AsyncStorage.getItem('@eco_lens_survey_completed');
        const localSurveySkipped = await AsyncStorage.getItem('@eco_lens_survey_skipped');
        console.log('📱 Local survey status - completed:', localSurveyCompleted, 'skipped:', localSurveySkipped);
        
        // Use server status as primary source, but fallback to local if server says not completed
        const finalSurveyStatus = statusResponse.completed || localSurveyCompleted === 'true';
        setSurveyCompleted(finalSurveyStatus);
        console.log('✅ Final survey completion status:', finalSurveyStatus);
      } catch (storageError) {
        console.error('Error checking local survey status:', storageError);
        setSurveyCompleted(statusResponse.completed);
      }

      // Then try to get dynamic real-time recommendations
      try {
        const dynamicResponse = await DynamicRecommendationService.getRealTimeRecommendations(20);
        if (dynamicResponse.recommendations && dynamicResponse.recommendations.length > 0) {
          setPersonalizedProducts(dynamicResponse.recommendations);
          console.log(`✅ Loaded ${dynamicResponse.recommendations.length} dynamic real-time recommendations`);
          console.log(`🎯 Recommendation source: ${dynamicResponse.source || 'dynamic'}`);
          console.log(`📊 Confidence score: ${dynamicResponse.confidenceScore || 'N/A'}%`);
          console.log(`🔍 Sample recommendations:`, dynamicResponse.recommendations.slice(0, 3).map(p => ({ name: p.name, category: p.category, grade: p.sustainabilityGrade })));
          
          // Also get behavior insights
          try {
            const insights = await DynamicRecommendationService.getBehaviorInsights();
            setSearchInsights(insights.insights);
            console.log('✅ Loaded dynamic behavior insights');
          } catch (insightError) {
            console.error('Error loading dynamic behavior insights:', insightError);
          }
          
          return; // Use dynamic recommendations if available
        }
      } catch (dynamicError) {
        console.error('Error loading dynamic recommendations:', dynamicError);
        // Don't fail completely, just fall back to enhanced recommendations
        if (dynamicError.message.includes('Authentication required')) {
          console.log('Authentication required for dynamic recommendations, using enhanced recommendations');
        } else if (dynamicError.message.includes('Failed to fetch')) {
          console.log('Network error with dynamic recommendations, using enhanced recommendations');
        } else {
          console.log('Dynamic recommendations not available, using enhanced recommendations');
        }
      }

      // Fallback to enhanced recommendations
      const response = await EnhancedRecommendationService.getEnhancedRecommendations(
        user.id, 
        auth, 
        { 
          limit: 20, 
          days: 30, 
          includeSearchHistory: true, 
          includeSurveyData: statusResponse.completed,
          prioritizeRecent: true 
        }
      );
      
      if (response.recommendations && response.recommendations.length > 0) {
        setPersonalizedProducts(response.recommendations);
        setUserPreferences(response.surveyPreferences);
        setRecommendationInsights(response.insights);
        console.log(`✅ Loaded ${response.recommendations.length} enhanced recommendations from ${response.source}`);
        console.log(`📊 Confidence score: ${response.confidenceScore}%`);
      }
      
      // Load search insights for user profile
      try {
        const searchInsights = await EnhancedRecommendationService.getSearchBehaviorInsights(user.id, auth, 30);
        setSearchInsights(searchInsights);
        console.log('✅ Loaded search behavior insights');
      } catch (insightError) {
        console.error('Error loading search insights:', insightError);
        if (insightError.message.includes('Access token required')) {
          console.log('Authentication required for search insights, skipping...');
        }
      }
      
    } catch (error) {
      console.error('Error loading personalized recommendations:', error);
      // If there's an auth error, try to load basic recommendations
      if (error.message.includes('Access token required')) {
        console.log('Authentication required, falling back to basic recommendations');
        try {
          const basicResponse = await SurveyService.getRecommendations(user.id, auth);
          if (basicResponse.recommendations && basicResponse.recommendations.length > 0) {
            setPersonalizedProducts(basicResponse.recommendations);
            setUserPreferences(basicResponse.preferences);
            console.log('✅ Loaded basic recommendations from survey data');
          }
        } catch (fallbackError) {
          console.error('Error loading basic recommendations:', fallbackError);
        }
      }
    }
  };

  // Load active sustainability goals
  const loadActiveGoals = async () => {
    if (!auth) {
      console.log('No auth token available for goals');
      return;
    }

    try {
      setGoalsLoading(true);
      
      // Load active goals
      const goalsResponse = await SustainabilityGoalService.getUserGoals(auth);
      if (goalsResponse.success) {
        // Filter only active goals and limit to top 3 for dashboard
        const active = goalsResponse.goals.filter(goal => goal.isActive).slice(0, 3);
        setActiveGoals(active);
        console.log('✅ Loaded active goals for dashboard:', active.length);
      }

      // Load goal statistics
      const statsResponse = await SustainabilityGoalService.getGoalStats(auth);
      if (statsResponse.success) {
        setGoalStats(statsResponse.stats);
        console.log('✅ Loaded goal statistics');
      }
    } catch (error) {
      console.error('Error loading sustainability goals:', error);
      // Don't show alert, just log the error
    } finally {
      setGoalsLoading(false);
    }
  };

  // Load products from API
  const loadProducts = async (showLoader = true) => {
    try {
      if (showLoader) setIsLoading(true);
      
      const response = await ProductService.getProducts({
        search: searchQuery || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        sortBy: getSortField(selectedSort),
        sortOrder: getSortOrder(selectedSort),
        limit: 100 // Get more products for better filtering
      });
      
      setProducts(response.products || []);
      console.log(`✅ Loaded ${response.products?.length || 0} products from API`);
    } catch (error) {
      console.error('Error loading products:', error);
      
      // Fallback to mock data if API fails
      console.log('⚠️  API failed, falling back to mock data');
      setProducts(MOCK_PRODUCTS);
      
      // Show user-friendly error for first load only
      if (showLoader) {
        Alert.alert(
          'Connection Issue', 
          'Unable to load latest products from server. Showing sample data instead.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      if (showLoader) setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Convert sort option to API field
  const getSortField = (sortOption) => {
    const sortMap = {
      'eco-high': 'sustainabilityScore',
      'eco-low': 'sustainabilityScore', 
      'price-low': 'price',
      'price-high': 'price',
      'rating': 'rating',
      'popular': 'reviewCount'
    };
    return sortMap[sortOption] || 'sustainabilityScore';
  };

  // Convert sort option to API order
  const getSortOrder = (sortOption) => {
    const orderMap = {
      'eco-high': 'desc',
      'eco-low': 'asc',
      'price-low': 'asc', 
      'price-high': 'desc',
      'rating': 'desc',
      'popular': 'desc'
    };
    return orderMap[sortOption] || 'desc';
  };

  // Handle search with dynamic tracking
  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query);
    setShowSuggestions(false);
    
    if (query.length >= 2) {
      try {
        // Track the search with dynamic recommendations
        await DynamicRecommendationService.trackSearch({
          searchQuery: query,
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          resultsCount: 0, // Will be updated after search
          sessionId: `session_${Date.now()}`,
          userAgent: 'mobile_app'
        });
        console.log('✅ Search tracked with dynamic updates:', query);
        console.log(`🔍 Search query: "${query}" - Category: ${selectedCategory !== 'All' ? selectedCategory : 'All'} - Filter: ${selectedFilter}`);
        
        // Refresh personalized recommendations after tracking
        await refreshPersonalizedRecommendations();
      } catch (error) {
        console.error('Error tracking search with dynamic system:', error);
        // Don't fail the search, just log the error
      }

      try {
        // Also track with legacy system for backward compatibility
        const searchData = await SearchAnalyticsService.searchWithTracking(query, {
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          sustainabilityGrade: selectedFilter === 'eco-friendly' ? 'A' : undefined
        });
        
        setCurrentSearchId(searchData.searchId);
        console.log('✅ Search tracked with legacy system:', query);
      } catch (error) {
        console.error('Error tracking search with legacy system:', error);
        // Don't fail the search if tracking fails
        if (error.message.includes('Access token required')) {
          console.log('Authentication required for search tracking, continuing without tracking...');
        }
        setCurrentSearchId(null);
      }
    } else {
      setCurrentSearchId(null);
    }
  }, [selectedCategory, selectedFilter]);

  // Handle search input changes with suggestions
  const handleSearchInputChange = useCallback(async (text) => {
    setSearchQuery(text);
    
    if (text.length >= 2) {
      try {
        const suggestions = await SearchAnalyticsService.getSearchSuggestions(text, 5);
        setSearchSuggestions(suggestions.suggestions || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error getting search suggestions:', error);
        // Don't show suggestions if there's an auth error
        if (error.message.includes('Access token required')) {
          console.log('Authentication required for search suggestions');
          setSearchSuggestions([]);
        } else {
          setSearchSuggestions([]);
        }
      }
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, []);

  // Reload products when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadProducts(false); // Reload with new filters, but don't show loading spinner
    }, 300); // Debounce API calls

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory, selectedSort]);

  // Render sustainability goals header component
  const renderGoalsHeader = useCallback(() => {
    if (activeGoals.length === 0 && !goalsLoading) return null;

    return (
      <View style={styles.goalsContainer}>
        <View style={styles.goalsHeaderRow}>
          <View style={styles.goalsHeaderLeft}>
            <Text style={styles.goalsTitle}>🎯 Your Sustainability Goals</Text>
            {goalStats && (
              <Text style={styles.goalsSubtitle}>
                {goalStats.activeGoals} active • {goalStats.achievedGoals} achieved
              </Text>
            )}
          </View>
          <TouchableOpacity 
            style={styles.goalsViewAllButton}
            onPress={() => navigation.navigate('SustainabilityGoals')}
          >
            <Text style={styles.goalsViewAllText}>View All</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {goalsLoading ? (
          <View style={styles.goalsLoadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.goalsLoadingText}>Loading goals...</Text>
          </View>
        ) : (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.goalsScrollView}
            contentContainerStyle={styles.goalsScrollContent}
          >
            {activeGoals.map((goal) => (
              <TouchableOpacity
                key={goal._id}
                style={styles.goalCard}
                onPress={() => navigation.navigate('GoalProgress', { goal })}
                activeOpacity={0.7}
              >
                <View style={styles.goalCardHeader}>
                  <Text style={styles.goalCardTitle} numberOfLines={2}>
                    {goal.title}
                  </Text>
                  <View style={[
                    styles.goalTypeIndicator,
                    { backgroundColor: getGoalTypeColor(goal.goalType) }
                  ]}>
                    <Text style={styles.goalTypeText}>
                      {getGoalTypeLabel(goal.goalType)}
                    </Text>
                  </View>
                </View>

                <View style={styles.goalProgressContainer}>
                  <View style={styles.goalProgressBarBackground}>
                    <View 
                      style={[
                        styles.goalProgressBarFill,
                        { 
                          width: `${Math.min(goal.progress.currentPercentage / goal.goalConfig.percentage * 100, 100)}%`,
                          backgroundColor: SustainabilityGoalService.getGoalProgressColor(
                            goal.progress.currentPercentage,
                            goal.goalConfig.percentage
                          )
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.goalProgressText}>
                    {goal.progress.currentPercentage}% of {goal.goalConfig.percentage}%
                  </Text>
                </View>

                <View style={styles.goalCardFooter}>
                  <Text style={styles.goalStatsText}>
                    {goal.progress.goalMetPurchases}/{goal.progress.totalPurchases} purchases
                  </Text>
                  <Text style={[
                    styles.goalStatusText,
                    { 
                      color: SustainabilityGoalService.getGoalProgressColor(
                        goal.progress.currentPercentage,
                        goal.goalConfig.percentage
                      )
                    }
                  ]}>
                    {SustainabilityGoalService.getGoalProgressStatus(
                      goal.progress.currentPercentage,
                      goal.goalConfig.percentage
                    )}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}

            {/* Add new goal card */}
            <TouchableOpacity
              style={[styles.goalCard, styles.addGoalCard]}
              onPress={() => navigation.navigate('GoalSetup', { mode: 'create' })}
              activeOpacity={0.7}
            >
              <View style={styles.addGoalContent}>
                <Ionicons name="add-circle" size={32} color={theme.colors.primary} />
                <Text style={styles.addGoalText}>Add New Goal</Text>
                <Text style={styles.addGoalSubtext}>Set a sustainability target</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    );
  }, [activeGoals, goalStats, goalsLoading, navigation]);

  // Helper functions for goal display
  const getGoalTypeColor = (goalType) => {
    const colors = {
      'grade-based': theme.colors.primary,
      'score-based': theme.colors.info,
      'category-based': theme.colors.secondary,
    };
    return colors[goalType] || theme.colors.textSecondary;
  };

  const getGoalTypeLabel = (goalType) => {
    const labels = {
      'grade-based': 'Grade',
      'score-based': 'Score', 
      'category-based': 'Category',
    };
    return labels[goalType] || 'Custom';
  };

  // Get products to display based on current view
  const getDisplayProducts = () => {
    console.log('getDisplayProducts called:');
    console.log('- showPersonalized:', showPersonalized);
    console.log('- surveyCompleted:', surveyCompleted);
    console.log('- personalizedProducts.length:', personalizedProducts.length);
    console.log('- products.length:', products.length);
    
    if (showPersonalized && surveyCompleted) {
      if (personalizedProducts.length > 0) {
        console.log('Returning personalized products');
        return personalizedProducts;
      } else {
        console.log('Survey completed but no personalized products yet, returning all products');
        return products;
      }
    }
    console.log('Returning all products');
    return products;
  };

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadProducts(false);
    loadPersonalizedRecommendations();
    loadActiveGoals(); // Refresh goals too
  }, []);

  // Filter products locally (API handles sorting)
  const filteredProducts = useMemo(() => {
    console.log('filteredProducts recalculating...');
    let filtered = [...getDisplayProducts()];
    console.log('Initial filtered count:', filtered.length);

    // Apply preset filter (API doesn't handle these custom filters)
    if (selectedFilter) {
      filtered = FILTER_PRESETS[selectedFilter].filter(filtered);
      console.log('After filter applied:', filtered.length);
    }

    console.log('Final filtered count:', filtered.length);
    return filtered;
  }, [products, selectedFilter, showPersonalized, surveyCompleted, personalizedProducts]);

  // Render filters header component (categories, filters, controls)
  const renderFiltersHeader = useCallback(() => (
    <View style={styles.filtersContainer}>
      {/* Categories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        <TouchableOpacity
          style={[
            styles.categoryChip,
            selectedCategory === 'All' && styles.categoryChipActive
          ]}
          onPress={() => setSelectedCategory('All')}
        >
          <Text style={[
            styles.categoryText,
            selectedCategory === 'All' && styles.categoryTextActive
          ]}>
            All
          </Text>
        </TouchableOpacity>
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipActive
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category && styles.categoryTextActive
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Filter Presets */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {Object.entries(FILTER_PRESETS).map(([key, preset]) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.filterChip,
              selectedFilter === key && styles.filterChipActive
            ]}
            onPress={() => setSelectedFilter(selectedFilter === key ? null : key)}
          >
            <Text style={[
              styles.filterText,
              selectedFilter === key && styles.filterTextActive
            ]}>
              {preset.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Controls Bar */}
      <View style={styles.controlsBar}>
        <View style={styles.resultCount}>
          <Text style={styles.resultText}>
            {filteredProducts.length} products
          </Text>
        </View>
        
        <View style={styles.controls}>
          {/* View Toggle */}
          <TouchableOpacity
            style={styles.viewToggle}
            onPress={() => setIsListView(!isListView)}
          >
            <Text style={styles.viewToggleText}>
              {isListView ? '▦' : '▤'}
            </Text>
          </TouchableOpacity>
          
          {/* Sort Dropdown (simplified) */}
          <TouchableOpacity style={styles.sortButton}>
            <Text style={styles.sortButtonText}>Sort ↓</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  ), [selectedCategory, selectedFilter, filteredProducts.length, isListView]);

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🌱</Text>
      <Text style={styles.emptyTitle}>No products found</Text>
      <Text style={styles.emptySubtitle}>
        Try adjusting your filters or search query
      </Text>
    </View>
  );

  // Render loading state
  if (isLoading) {
    return (
      <View style={[globalStyles.container, globalStyles.center]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading eco-friendly products...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={theme.colors.background}
      />
      
      {/* Fixed Header with Search - Outside of FlatList */}
      <View style={styles.fixedHeader}>
        {/* App Title with Profile Picture */}
        <View style={styles.titleRow}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>🌱 Eco-Lens</Text>
            <Text style={styles.subtitle}>Shop Sustainably, Live Responsibly</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.debugButton}
              onPress={() => setShowAuthDebugger(true)}
            >
              <Text style={styles.debugButtonText}>🔍</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.profileIcon}
              onPress={() => navigation.navigate('Profile')}
            >
              <View style={styles.profileCircle}>
                {user?.profilePicture ? (
                  <Image
                    source={{ uri: user.profilePicture.startsWith('/9j/') || user.profilePicture.length > 100 
                      ? `data:image/jpeg;base64,${user.profilePicture}` 
                      : user.profilePicture }}
                    style={styles.profileImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={styles.profileText}>
                    {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Personalized Recommendations Header */}
        {surveyCompleted ? (
          <View style={styles.personalizedHeader}>
            <View style={styles.personalizedTitleContainer}>
              <Text style={styles.personalizedTitle}>🌟 Recommended for You</Text>
              <Text style={styles.personalizedSubtitle}>
                {personalizedProducts.length > 0 ? (
                  recommendationInsights ? 
                    `Based on your ${recommendationInsights.totalRecommendations} searches and preferences` :
                    'Based on your preferences'
                ) : (
                  'Loading personalized recommendations...'
                )}
              </Text>
              {recommendationInsights && (
                <View style={styles.insightsRow}>
                  <Text style={styles.insightText}>
                    📊 {Math.round(recommendationInsights.ecoFriendlyPercentage)}% eco-friendly
                  </Text>
                  <Text style={styles.insightText}>
                    ⭐ {Math.round(recommendationInsights.averageScore)}% avg score
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => {
                console.log('Toggle pressed - Current showPersonalized:', showPersonalized);
                console.log('Personalized products count:', personalizedProducts.length);
                console.log('All products count:', products.length);
                setShowPersonalized(!showPersonalized);
              }}
            >
              <Text style={styles.toggleButtonText}>
                {showPersonalized ? 'Show All' : 'Show Personalized'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.surveyPromptHeader}>
            <View style={styles.surveyPromptContent}>
              <Text style={styles.surveyPromptTitle}>🎯 Personalize Your Experience</Text>
              <Text style={styles.surveyPromptSubtitle}>
                Complete a quick survey to see personalized product recommendations
              </Text>
              <Text style={styles.debugText}>DEBUG: surveyCompleted = {surveyCompleted.toString()}</Text>
            </View>
            <TouchableOpacity
              style={styles.completeSurveyButton}
              onPress={() => navigation.navigate('OnboardingSurvey')}
            >
              <Text style={styles.completeSurveyButtonText}>Take Survey</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Search Bar with Suggestions */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            key="search-input"
            style={styles.searchInput}
            placeholder="Search eco-friendly products..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={handleSearchInputChange}
            onEndEditing={() => handleSearch(searchQuery)}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => {
              setSearchQuery('');
              setShowSuggestions(false);
              setCurrentSearchId(null);
            }}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Search Suggestions */}
        {showSuggestions && searchSuggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            {searchSuggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => {
                  setSearchQuery(suggestion.query);
                  setShowSuggestions(false);
                  handleSearch(suggestion.query);
                }}
              >
                <Text style={styles.suggestionIcon}>
                  {suggestion.type === 'user_history' ? '🕒' : '🔥'}
                </Text>
                <Text style={styles.suggestionText}>{suggestion.query}</Text>
                {suggestion.category && (
                  <Text style={styles.suggestionCategory}>{suggestion.category}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      
      <FlatList
        data={filteredProducts}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={handleProductPress}
            isListView={isListView}
          />
        )}
        keyExtractor={(item) => item.id}
        numColumns={isListView ? 1 : 2}
        key={isListView ? 'list' : 'grid'}
        columnWrapperStyle={!isListView && styles.gridRow}
        contentContainerStyle={styles.productList}
        ListHeaderComponent={() => (
          <>
            {renderGoalsHeader()}
            {renderFiltersHeader()}
          </>
        )}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
      
      {/* Product Detail Modal */}
      <ProductDetailModal
        visible={isModalVisible}
        product={selectedProduct}
        onClose={() => setIsModalVisible(false)}
        onAddToCart={handleAddToCart}
      />
      
      {/* Auth Debugger */}
      <SimpleAuthDebugger
        visible={showAuthDebugger}
        onClose={() => setShowAuthDebugger(false)}
      />

      {/* Cart Toast Notification */}
      <CartToast
        visible={showCartToast}
        message={cartToastMessage}
        onPress={() => {
          setShowCartToast(false);
          navigation.navigate('Cart');
        }}
        onHide={() => setShowCartToast(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  fixedHeader: {
    backgroundColor: theme.colors.surface,
    paddingTop: Platform.OS === 'android' ? theme.spacing.xl : theme.spacing.xxxl,
    paddingBottom: theme.spacing.m,
    paddingHorizontal: theme.spacing.l,
    marginBottom: theme.spacing.s,
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
    ...theme.shadows.medium,
  },
  
  filtersContainer: {
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.m,
    marginBottom: theme.spacing.m,
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
    ...theme.shadows.small,
  },
  
  titleContainer: {
    flex: 1,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.m,
    paddingHorizontal: theme.spacing.xs,
  },
  
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  debugButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  debugButtonText: {
    fontSize: 16,
  },

  title: {
    fontSize: 26,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: 2,
  },

  profileIcon: {
    padding: theme.spacing.xs,
  },

  profileCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.small,
  },

  profileText: {
    fontSize: 20,
  },

  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  
  subtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  
  personalizedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    marginHorizontal: 0,
    marginBottom: theme.spacing.m,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  personalizedTitleContainer: {
    flex: 1,
  },
  personalizedTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: 3,
  },
  personalizedSubtitle: {
    fontSize: 13,
    color: '#6C757D',
  },
  toggleButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.borderRadius.s,
  },
  toggleButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  
  surveyPromptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    marginHorizontal: 0,
    marginBottom: theme.spacing.m,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  surveyPromptContent: {
    flex: 1,
  },
  surveyPromptTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 3,
  },
  surveyPromptSubtitle: {
    fontSize: 13,
    color: '#856404',
  },
  completeSurveyButton: {
    backgroundColor: '#FFC107',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.borderRadius.s,
  },
  completeSurveyButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    marginHorizontal: 0,
    marginTop: theme.spacing.xs,
    paddingHorizontal: theme.spacing.m,
    borderRadius: theme.borderRadius.l,
    height: 50,
  },
  
  searchIcon: {
    fontSize: 22,
    marginRight: theme.spacing.m,
  },
  
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.text,
  },
  
  clearIcon: {
    fontSize: 22,
    color: theme.colors.textSecondary,
    paddingLeft: theme.spacing.m,
  },
  
  categoriesContainer: {
    paddingHorizontal: theme.spacing.m,
    marginBottom: theme.spacing.s,
  },
  
  categoryChip: {
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    marginRight: theme.spacing.s,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  
  categoryChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  
  categoryText: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.text,
  },
  
  categoryTextActive: {
    color: theme.colors.textOnPrimary,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  
  filterContainer: {
    paddingHorizontal: theme.spacing.m,
    marginBottom: theme.spacing.m,
  },
  
  filterChip: {
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.xs,
    marginRight: theme.spacing.s,
    borderRadius: theme.borderRadius.s,
    backgroundColor: theme.colors.secondaryLight,
    opacity: 0.7,
  },
  
  filterChipActive: {
    backgroundColor: theme.colors.secondary,
    opacity: 1,
  },
  
  filterText: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.text,
  },
  
  filterTextActive: {
    color: theme.colors.textOnPrimary,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  
  controlsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.m,
    paddingBottom: theme.spacing.m,
  },
  
  resultCount: {
    flex: 1,
  },
  
  resultText: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.textSecondary,
  },
  
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  viewToggle: {
    padding: theme.spacing.s,
    marginRight: theme.spacing.s,
  },
  
  viewToggleText: {
    fontSize: 20,
    color: theme.colors.primary,
  },
  
  sortButton: {
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.s,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  
  sortButtonText: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.text,
  },
  
  productList: {
    paddingHorizontal: theme.spacing.m,
    paddingBottom: Platform.OS === 'ios' ? 120 : 100,
  },
  
  gridRow: {
    justifyContent: 'space-between',
  },
  
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxxl,
  },
  
  emptyIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.m,
  },
  
  emptyTitle: {
    fontSize: theme.typography.fontSize.h4,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
  },
  
  emptySubtitle: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  
  loadingText: {
    marginTop: theme.spacing.m,
    fontSize: theme.typography.fontSize.body1,
    color: theme.colors.textSecondary,
  },
  
  // Search suggestions styles
  suggestionsContainer: {
    position: 'absolute',
    top: 48,
    left: theme.spacing.m,
    right: theme.spacing.m,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
    zIndex: 1000,
    ...theme.shadows.medium,
  },
  
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  
  suggestionIcon: {
    fontSize: 16,
    marginRight: theme.spacing.s,
  },
  
  suggestionText: {
    flex: 1,
    fontSize: theme.typography.fontSize.body1,
    color: theme.colors.text,
  },
  
  suggestionCategory: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textSecondary,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.s,
  },
  
  // Insights styles
  insightsRow: {
    flexDirection: 'row',
    marginTop: theme.spacing.xs,
    gap: theme.spacing.s,
  },
  
  insightText: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textSecondary,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.s,
  },
  
  debugText: {
    fontSize: theme.typography.fontSize.caption,
    color: 'red',
    fontWeight: 'bold',
    marginTop: theme.spacing.xs,
  },

  // Sustainability Goals Styles
  goalsContainer: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.m,
    marginBottom: theme.spacing.m,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.m,
    ...theme.shadows.card,
  },
  goalsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  goalsHeaderLeft: {
    flex: 1,
  },
  goalsTitle: {
    fontSize: theme.typography.fontSize.h6,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  goalsSubtitle: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textSecondary,
  },
  goalsViewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.s,
    paddingVertical: theme.spacing.xs,
  },
  goalsViewAllText: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
    marginRight: 4,
  },
  goalsLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.l,
  },
  goalsLoadingText: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.s,
  },
  goalsScrollView: {
    marginHorizontal: -theme.spacing.xs,
  },
  goalsScrollContent: {
    paddingHorizontal: theme.spacing.xs,
  },
  goalCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.m,
    marginHorizontal: theme.spacing.xs,
    width: 200,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.small,
  },
  goalCardHeader: {
    marginBottom: theme.spacing.s,
  },
  goalCardTitle: {
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    minHeight: 40,
  },
  goalTypeIndicator: {
    paddingHorizontal: theme.spacing.s,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.m,
    alignSelf: 'flex-start',
  },
  goalTypeText: {
    fontSize: theme.typography.fontSize.caption,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textOnPrimary,
  },
  goalProgressContainer: {
    marginBottom: theme.spacing.s,
  },
  goalProgressBarBackground: {
    height: 6,
    backgroundColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.s,
    marginBottom: theme.spacing.xs,
    overflow: 'hidden',
  },
  goalProgressBarFill: {
    height: '100%',
    borderRadius: theme.borderRadius.s,
  },
  goalProgressText: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  goalCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalStatsText: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textLight,
  },
  goalStatusText: {
    fontSize: theme.typography.fontSize.caption,
    fontWeight: theme.typography.fontWeight.medium,
  },
  addGoalCard: {
    borderStyle: 'dashed',
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addGoalContent: {
    alignItems: 'center',
  },
  addGoalText: {
    fontSize: theme.typography.fontSize.body2,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.primary,
    marginTop: theme.spacing.s,
  },
  addGoalSubtext: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
});

export default CustomerDashboard;