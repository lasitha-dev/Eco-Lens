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
} from 'react-native';
import ProductCard from '../../components/product/ProductCard';
import ProductDetailModal from '../../components/product/ProductDetailModal';
import { MOCK_PRODUCTS, CATEGORIES, FILTER_PRESETS, SORT_OPTIONS } from '../../constants/mockData';
import ProductService from '../../api/productService';
import theme from '../../styles/theme';
import globalStyles from '../../styles/globalStyles';

const { width: screenWidth } = Dimensions.get('window');

const CustomerDashboard = () => {
  // State management
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSort, setSelectedSort] = useState('eco-high');
  const [isListView, setIsListView] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Handle product press
  const handleProductPress = useCallback((product) => {
    setSelectedProduct(product);
    setIsModalVisible(true);
  }, []);

  // Handle add to cart
  const handleAddToCart = useCallback((product, quantity) => {
    Alert.alert(
      'Added to Cart',
      `${quantity} × ${product.name} added to your cart!`,
      [{ text: 'OK' }]
    );
    setIsModalVisible(false);
  }, []);

  // Load products on component mount
  useEffect(() => {
    loadProducts();
  }, []);

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

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadProducts(false);
  }, []);

  // Filter products locally (API handles sorting)
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Apply preset filter (API doesn't handle these custom filters)
    if (selectedFilter) {
      filtered = FILTER_PRESETS[selectedFilter].filter(filtered);
    }

    return filtered;
  }, [products, selectedFilter]);

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
        {/* App Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>🌱 Eco-Lens</Text>
          <Text style={styles.subtitle}>Shop Sustainably, Live Responsibly</Text>
        </View>

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
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.m,
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
  
  title: {
    fontSize: theme.typography.fontSize.h2,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  
  subtitle: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    marginHorizontal: theme.spacing.m,
    marginBottom: theme.spacing.m,
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
    paddingBottom: theme.spacing.xl,
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