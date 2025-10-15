/**
 * ProductReviewsScreen Component
 * Displays individual user reviews for a specific product
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../styles/theme';
import globalStyles from '../../styles/globalStyles';
import StarRating from '../../components/StarRating';
import { useAuth } from '../../hooks/useAuthLogin';
import { API_BASE_URL } from '../../config/api';

const ProductReviewsScreen = ({ route, navigation }) => {
  const { product } = route.params;
  const { auth: token } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch product reviews
  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ratings/product/${product.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setReviews(data.ratings || []);
      } else {
        console.error('Error fetching reviews:', data.error);
        Alert.alert('Error', 'Failed to load reviews. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      Alert.alert('Error', 'Failed to load reviews. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReviews();
  };

  const renderReviewItem = ({ item }) => (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <View style={styles.userInfo}>
          <Image 
            source={{ 
              uri: item.user?.profilePicture || 'https://via.placeholder.com/40x40/cccccc/666666?text=U' 
            }} 
            style={styles.userAvatar} 
          />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>
              {item.user?.firstName && item.user?.lastName 
                ? `${item.user.firstName} ${item.user.lastName}`
                : 'Anonymous User'
              }
            </Text>
            <Text style={styles.reviewDate}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <StarRating
          rating={item.rating}
          size={16}
          showText={false}
        />
      </View>
      
      {item.review && (
        <Text style={styles.reviewText}>{item.review}</Text>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="star-outline" size={64} color={theme.colors.textSecondary} />
      <Text style={styles.emptyTitle}>No Reviews Yet</Text>
      <Text style={styles.emptyMessage}>
        Be the first to review this product!
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Reviews</Text>
      <View style={{ width: 40 }} />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading reviews...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      {renderHeader()}

      {/* Product Info */}
      <View style={styles.productInfo}>
        <Image source={{ uri: product.image }} style={styles.productImage} />
        <View style={styles.productDetails}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          <StarRating
            rating={product.ratingStats?.averageRating || product.rating || 0}
            totalRatings={product.ratingStats?.totalRatings || product.reviewCount || 0}
            size={16}
            showText={true}
            showCount={true}
          />
        </View>
      </View>

      {/* Reviews List */}
      <FlatList
        data={reviews}
        renderItem={renderReviewItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
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
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.m,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  
  backButton: {
    padding: theme.spacing.s,
  },
  
  headerTitle: {
    fontSize: theme.typography.fontSize.h5,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
  },
  
  productInfo: {
    flexDirection: 'row',
    padding: theme.spacing.m,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: theme.spacing.m,
  },
  
  productDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  
  productName: {
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  
  listContainer: {
    padding: theme.spacing.m,
  },
  
  reviewItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.s,
  },
  
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.s,
  },
  
  userInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: theme.spacing.s,
  },
  
  userDetails: {
    flex: 1,
  },
  
  userName: {
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
  },
  
  reviewDate: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  
  reviewText: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.text,
    lineHeight: 20,
  },
  
  separator: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.s,
  },
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  
  emptyTitle: {
    fontSize: theme.typography.fontSize.h4,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    marginTop: theme.spacing.m,
    marginBottom: theme.spacing.s,
  },
  
  emptyMessage: {
    fontSize: theme.typography.fontSize.body1,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.l,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingText: {
    fontSize: theme.typography.fontSize.body1,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.m,
  },
});

export default ProductReviewsScreen;
