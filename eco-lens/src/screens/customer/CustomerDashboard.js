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
import ProductCard from '../../components/product/ProductCard';
import ProductDetailModal from '../../components/product/ProductDetailModal';
import CartToast from '../../components/CartToast';
import { MOCK_PRODUCTS, CATEGORIES, FILTER_PRESETS, SORT_OPTIONS } from '../../constants/mockData';
import ProductService from '../../api/productService';
import SurveyService from '../../api/surveyService';
import CartService from '../../api/cartService';
import { useAuth } from '../../hooks/useAuthLogin';
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
  const [showCartToast, setShowCartToast] = useState(false);
  const [cartToastMessage, setCartToastMessage] = useState('');

  // Handle product press
  const handleProductPress = useCallback((product) => {
    setSelectedProduct(product);
    setIsModalVisible(true);
  }, []);

  // Handle add to cart with optimistic update
  const handleAddToCart = useCallback(async (product, quantity) => {
    // Optimistic UI update - show toast immediately
    setCartToastMessage(`${quantity} × ${product.name} added to cart!`);
    setShowCartToast(true);
    setIsModalVisible(false);

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
  }, []);

  // Debug: Track showPersonalized changes
  useEffect(() => {
    console.log('showPersonalized changed to:', showPersonalized);
    console.log('Current products count:', products.length);
    console.log('Current personalized products count:', personalizedProducts.length);
  }, [showPersonalized, products.length, personalizedProducts.length]);

  // Load personalized recommendations
  const loadPersonalizedRecommendations = async () => {
    if (!user || !auth) return;
    
    try {
      // First check if survey is completed
      const statusResponse = await SurveyService.checkSurveyStatus(user.id, auth);
      setSurveyCompleted(statusResponse.completed);
      
      if (statusResponse.completed) {
        const response = await SurveyService.getRecommendations(user.id, auth);
        if (response.recommendations && response.recommendations.length > 0) {
          setPersonalizedProducts(response.recommendations);
          setUserPreferences(response.preferences);
          console.log(`✅ Loaded ${response.recommendations.length} personalized recommendations`);
        }
      }
    } catch (error) {
      console.error('Error loading personalized recommendations:', error);
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

  // Reload products when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadProducts(false); // Reload with new filters, but don't show loading spinner
    }, 300); // Debounce API calls

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory, selectedSort]);

  // Get products to display based on current view
  const getDisplayProducts = () => {
    console.log('getDisplayProducts called:');
    console.log('- showPersonalized:', showPersonalized);
    console.log('- surveyCompleted:', surveyCompleted);
    console.log('- personalizedProducts.length:', personalizedProducts.length);
    console.log('- products.length:', products.length);
    
    if (showPersonalized && surveyCompleted && personalizedProducts.length > 0) {
      console.log('Returning personalized products');
      return personalizedProducts;
    }
    console.log('Returning all products');
    return products;
  };

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadProducts(false);
    loadPersonalizedRecommendations();
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

        {/* Personalized Recommendations Header */}
        {surveyCompleted && personalizedProducts.length > 0 ? (
          <View style={styles.personalizedHeader}>
            <View style={styles.personalizedTitleContainer}>
              <Text style={styles.personalizedTitle}>🌟 Recommended for You</Text>
              <Text style={styles.personalizedSubtitle}>
                Based on your preferences
              </Text>
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
                {showPersonalized ? 'Show All ' : 'Show Personalized'}
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
            </View>
            <TouchableOpacity
              style={styles.completeSurveyButton}
              onPress={() => navigation.navigate('OnboardingSurvey')}
            >
              <Text style={styles.completeSurveyButtonText}>Take Survey</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            key="search-input"
            style={styles.searchInput}
            placeholder="Search eco-friendly products..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
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
        ListHeaderComponent={renderFiltersHeader}
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
    paddingTop: theme.spacing.xxxl,
    paddingBottom: theme.spacing.l,
    paddingHorizontal: theme.spacing.m,
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
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },

  title: {
    fontSize: theme.typography.fontSize.h2,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },

  profileIcon: {
    padding: 5,
  },

  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  profileText: {
    fontSize: 20,
  },

  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  
  subtitle: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  
  personalizedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    marginHorizontal: theme.spacing.m,
    marginBottom: theme.spacing.s,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.borderRadius.round,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  personalizedTitleContainer: {
    flex: 1,
  },
  personalizedTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 2,
  },
  personalizedSubtitle: {
    fontSize: 12,
    color: '#6C757D',
  },
  toggleButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  toggleButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
  },
  
  surveyPromptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    marginHorizontal: theme.spacing.m,
    marginBottom: theme.spacing.s,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.borderRadius.round,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  surveyPromptContent: {
    flex: 1,
  },
  surveyPromptTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 2,
  },
  surveyPromptSubtitle: {
    fontSize: 11,
    color: '#856404',
  },
  completeSurveyButton: {
    backgroundColor: '#FFC107',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  completeSurveyButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
  },
  
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    marginHorizontal: 0,
    marginBottom: 0,
    paddingHorizontal: theme.spacing.m,
    borderRadius: theme.borderRadius.round,
    height: 48,
  },
  
  searchIcon: {
    fontSize: 20,
    marginRight: theme.spacing.s,
  },
  
  searchInput: {
    flex: 1,
    fontSize: theme.typography.fontSize.body1,
    color: theme.colors.text,
  },
  
  clearIcon: {
    fontSize: 20,
    color: theme.colors.textSecondary,
    paddingLeft: theme.spacing.s,
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
});

export default CustomerDashboard;