/**
 * FavoritesScreen Component
 * Displays user's favorite sustainable products
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Alert,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../../hooks/useFavorites';
import { useAuth } from '../../hooks/useAuthLogin';
import CartService from '../../api/cartService';
import ProductCard from '../../components/product/ProductCard';
import ProductDetailModal from '../../components/product/ProductDetailModal';
import CartToast from '../../components/CartToast';
import theme from '../../styles/theme';

const { width: screenWidth } = Dimensions.get('window');

const FavoritesScreen = ({ navigation }) => {
  const { 
    favorites, 
    loading, 
    error, 
    favoritesCount, 
    refreshFavorites,
    clearError 
  } = useFavorites();
  const { auth } = useAuth();
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isListView, setIsListView] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCartToast, setShowCartToast] = useState(false);
  const [cartToastMessage, setCartToastMessage] = useState('');
  
  // Animation for empty state
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Handle refresh
  const onRefresh = useCallback(async () => {
    if (!auth) return;
    
    setRefreshing(true);
    try {
      await refreshFavorites();
    } catch (error) {
      console.error('Error refreshing favorites:', error);
    } finally {
      setRefreshing(false);
    }
  }, [auth, refreshFavorites]);

  // Handle product press
  const handleProductPress = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  // Handle add to cart with optimistic update
  const handleAddToCart = useCallback(async (product, quantity) => {
    // Optimistic UI update - show toast immediately
    setCartToastMessage(`${quantity} × ${product.name} added to cart!`);
    setShowCartToast(true);
    handleModalClose();

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

  // Clear error effect
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  // Animate empty state
  useEffect(() => {
    if (!loading && favorites.length === 0) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [loading, favorites.length]);

  // Render header
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.titleContainer}>
          <Ionicons name="star" size={28} color={theme.colors.warning} />
          <Text style={styles.headerTitle}>My Favorites</Text>
        </View>
        
        <View style={styles.headerActions}>
          {favorites.length > 0 && (
            <TouchableOpacity 
              style={styles.viewToggle}
              onPress={() => setIsListView(!isListView)}
            >
              <Ionicons 
                name={isListView ? 'grid' : 'list'} 
                size={24} 
                color={theme.colors.text} 
              />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={onRefresh}
            disabled={refreshing}
          >
            <Ionicons 
              name="refresh" 
              size={24} 
              color={theme.colors.primary} 
            />
          </TouchableOpacity>
        </View>
      </View>
      
      {favoritesCount > 0 && (
        <Text style={styles.subtitle}>
          {favoritesCount} favorite product{favoritesCount !== 1 ? 's' : ''}
        </Text>
      )}
    </View>
  );

  // Render product item
  const renderProductItem = ({ item, index }) => (
    <ProductCard 
      product={item}
      onPress={handleProductPress}
      isListView={isListView}
      style={[
        isListView ? styles.listItem : styles.gridItem,
        index % 2 !== 0 && !isListView && { marginLeft: theme.spacing.m }
      ]}
    />
  );

  // Render empty state
  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons 
            name="star-outline" 
            size={80} 
            color={theme.colors.borderLight} 
          />
          <Text style={styles.emptyTitle}>Loading favorites...</Text>
        </View>
      );
    }

    if (!auth) {
      return (
        <Animated.View style={[styles.centerContainer, { opacity: fadeAnim }]}>
          <Ionicons 
            name="person-outline" 
            size={80} 
            color={theme.colors.borderLight} 
          />
          <Text style={styles.emptyTitle}>Please login to view favorites</Text>
          <Text style={styles.emptySubtitle}>
            Sign in to save and manage your favorite sustainable products
          </Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </Animated.View>
      );
    }

    return (
      <Animated.View style={[styles.centerContainer, { opacity: fadeAnim }]}>
        <Ionicons 
          name="star-outline" 
          size={80} 
          color={theme.colors.borderLight} 
        />
        <Text style={styles.emptyTitle}>No favorites yet</Text>
        <Text style={styles.emptySubtitle}>
          Start exploring sustainable products and tap the star icon to add them to your favorites
        </Text>
        <TouchableOpacity 
          style={styles.exploreButton}
          onPress={() => navigation.navigate('ProductDashboard')}
        >
          <Ionicons name="leaf" size={20} color={theme.colors.textOnPrimary} />
          <Text style={styles.exploreButtonText}>Explore Products</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Render error message
  const renderError = () => {
    if (!error) return null;
    
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={onRefresh}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      {renderHeader()}
      {renderError()}
      
      <FlatList
        data={favorites}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id || item._id}
        numColumns={isListView ? 1 : 2}
        key={isListView ? 'list' : 'grid'} // Force re-render on layout change
        contentContainerStyle={[
          styles.listContainer,
          favorites.length === 0 && styles.emptyListContainer
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => 
          isListView ? <View style={styles.separator} /> : null
        }
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        visible={showModal}
        product={selectedProduct}
        onClose={handleModalClose}
        onAddToCart={handleAddToCart}
        navigation={navigation}
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
  
  header: {
    backgroundColor: theme.colors.surface,
    paddingTop: Platform.OS === 'android' ? theme.spacing.xl : theme.spacing.xxxl,
    paddingBottom: theme.spacing.m,
    paddingHorizontal: theme.spacing.l,
    marginBottom: theme.spacing.s,
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
    ...theme.shadows.small,
  },
  
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s,
  },
  
  headerTitle: {
    fontSize: 24,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  
  subtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  
  viewToggle: {
    padding: theme.spacing.s,
  },
  
  refreshButton: {
    padding: theme.spacing.s,
  },
  
  errorContainer: {
    backgroundColor: theme.colors.error,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  errorText: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.typography.fontSize.body2,
    flex: 1,
  },
  
  retryButton: {
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.borderRadius.s,
  },
  
  retryButtonText: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.typography.fontSize.caption,
    fontWeight: theme.typography.fontWeight.medium,
  },
  
  listContainer: {
    padding: theme.spacing.m,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80, // Extra padding for tab bar
  },
  
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  
  gridItem: {
    flex: 1,
    maxWidth: (screenWidth - theme.spacing.m * 3) / 2,
  },
  
  listItem: {
    marginBottom: theme.spacing.m,
  },
  
  separator: {
    height: theme.spacing.m,
  },
  
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  
  emptyTitle: {
    fontSize: theme.typography.fontSize.h5,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: theme.spacing.l,
    marginBottom: theme.spacing.s,
  },
  
  emptySubtitle: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.fontSize.body2 * theme.typography.lineHeight.relaxed,
    marginBottom: theme.spacing.xl,
  },
  
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
  },
  
  exploreButtonText: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.semiBold,
    marginLeft: theme.spacing.s,
  },
  
  loginButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
  },
  
  loginButtonText: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
});

export default FavoritesScreen;
