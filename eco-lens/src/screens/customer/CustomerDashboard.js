/**
 * Customer Dashboard Screen
 * Main screen for browsing eco-friendly products
 */

import React, { useState, useMemo, useCallback } from 'react';
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
} from 'react-native';
import ProductCard from '../../components/product/ProductCard';
import { MOCK_PRODUCTS, CATEGORIES, FILTER_PRESETS, SORT_OPTIONS } from '../../constants/mockData';
import theme from '../../styles/theme';
import globalStyles from '../../styles/globalStyles';

const { width: screenWidth } = Dimensions.get('window');

const CustomerDashboard = () => {
  // State management
  const [products] = useState(MOCK_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSort, setSelectedSort] = useState('eco-high');
  const [isListView, setIsListView] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handle product press
  const handleProductPress = useCallback((product) => {
    // TODO: Navigate to product detail screen
    console.log('Product pressed:', product.name);
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Apply preset filter
    if (selectedFilter) {
      filtered = FILTER_PRESETS[selectedFilter].filter(filtered);
    }

    // Apply sorting
    switch (selectedSort) {
      case 'eco-high':
        filtered.sort((a, b) => b.sustainabilityScore - a.sustainabilityScore);
        break;
      case 'eco-low':
        filtered.sort((a, b) => a.sustainabilityScore - b.sustainabilityScore);
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
        filtered.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      default:
        break;
    }

    return filtered;
  }, [products, searchQuery, selectedCategory, selectedSort, selectedFilter]);

  // Render header component
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* App Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>🌿 Eco-Lens</Text>
        <Text style={styles.subtitle}>Shop Sustainably, Live Responsibly</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search eco-friendly products..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

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
  );

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
        ListHeaderComponent={renderHeader}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  headerContainer: {
    backgroundColor: theme.colors.surface,
    paddingTop: theme.spacing.m,
    marginBottom: theme.spacing.m,
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
    ...theme.shadows.medium,
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