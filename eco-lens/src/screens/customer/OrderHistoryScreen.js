/**
 * OrderHistoryScreen Component
 * Display user's order history with status and details
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../styles/theme';
import { useAuth } from '../../hooks/useAuthLogin';
import { API_BASE_URL } from '../../config/api';

const OrderHistoryScreen = ({ navigation }) => {
  const { auth: token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);
      } else {
        setError(data.error || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Unable to load orders. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, []);

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#FFA726';
      case 'processing':
        return '#42A5F5';
      case 'processed':
        return '#29B6F6'; // Light blue for processed
      case 'shipped':
        return '#AB47BC';
      case 'delivered':
        return '#66BB6A';
      case 'cancelled':
        return '#EF5350';
      default:
        return theme.colors.textSecondary;
    }
  };

  // Get payment status color
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return '#66BB6A';
      case 'pending':
        return '#FFA726';
      case 'failed':
        return '#EF5350';
      case 'refunded':
        return '#42A5F5';
      default:
        return theme.colors.textSecondary;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Render order item
  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderDetails', { orderId: item._id })}
      activeOpacity={0.7}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderNumberContainer}>
          <Text style={styles.orderNumber}>{item.orderNumber}</Text>
          <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.orderStatus) }]}>
          <Text style={styles.statusText}>
            {item.orderStatus.charAt(0).toUpperCase() + item.orderStatus.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.orderContent}>
        {/* Display first product image */}
        {item.items && item.items.length > 0 && (
          <View style={styles.productPreview}>
            <Image
              source={{ uri: item.items[0].productImage }}
              style={styles.productImage}
            />
            {item.items.length > 1 && (
              <View style={styles.moreItemsBadge}>
                <Text style={styles.moreItemsText}>+{item.items.length - 1}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.orderInfo}>
          <Text style={styles.itemsCount}>
            {item.totalItems} {item.totalItems === 1 ? 'item' : 'items'}
          </Text>
          <Text style={styles.orderTotal}>${item.totalAmount.toFixed(2)}</Text>
          <View style={[styles.paymentStatus, { backgroundColor: getPaymentStatusColor(item.paymentStatus) }]}>
            <Text style={styles.paymentStatusText}>
              {item.paymentStatus === 'paid' ? '✓ Paid' : item.paymentStatus.charAt(0).toUpperCase() + item.paymentStatus.slice(1)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.orderFooter}>
        <TouchableOpacity
          style={styles.viewDetailsButton}
          onPress={() => navigation.navigate('OrderDetails', { orderId: item._id })}
        >
          <Text style={styles.viewDetailsText}>View Details</Text>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📦</Text>
      <Text style={styles.emptyTitle}>No Orders Yet</Text>
      <Text style={styles.emptySubtitle}>
        Start shopping for eco-friendly products and your orders will appear here!
      </Text>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => navigation.navigate('ProductDashboard')}
      >
        <Text style={styles.shopButtonText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  // Render error state
  const renderErrorState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>⚠️</Text>
      <Text style={styles.emptyTitle}>Unable to Load Orders</Text>
      <Text style={styles.emptySubtitle}>{error}</Text>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={fetchOrders}
      >
        <Text style={styles.shopButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Order History</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Order History</Text>
        <View style={{ width: 40 }} />
      </View>

      {error ? (
        renderErrorState()
      ) : orders.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}
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
    paddingTop: Platform.OS === 'android' ? theme.spacing.xl : theme.spacing.m,
    paddingBottom: theme.spacing.m,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.small,
  },
  
  backButton: {
    padding: theme.spacing.s,
  },
  
  title: {
    fontSize: theme.typography.fontSize.h4,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingText: {
    marginTop: theme.spacing.m,
    fontSize: theme.typography.fontSize.body1,
    color: theme.colors.textSecondary,
  },
  
  listContent: {
    padding: theme.spacing.m,
    paddingBottom: Platform.OS === 'ios' ? 120 : 100,
  },
  
  orderCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    ...theme.shadows.card,
  },
  
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.m,
  },
  
  orderNumberContainer: {
    flex: 1,
  },
  
  orderNumber: {
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  
  orderDate: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textSecondary,
  },
  
  statusBadge: {
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.s,
  },
  
  statusText: {
    fontSize: theme.typography.fontSize.caption,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.textOnPrimary,
  },
  
  orderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  
  productPreview: {
    position: 'relative',
    marginRight: theme.spacing.m,
  },
  
  productImage: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.s,
  },
  
  moreItemsBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  
  moreItemsText: {
    fontSize: 10,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textOnPrimary,
  },
  
  orderInfo: {
    flex: 1,
  },
  
  itemsCount: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  
  orderTotal: {
    fontSize: theme.typography.fontSize.h5,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  
  paymentStatus: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.s,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.s,
  },
  
  paymentStatusText: {
    fontSize: theme.typography.fontSize.caption,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.textOnPrimary,
  },
  
  orderFooter: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.m,
  },
  
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  viewDetailsText: {
    fontSize: theme.typography.fontSize.body2,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.primary,
    marginRight: 4,
  },
  
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  
  emptyIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.l,
  },
  
  emptyTitle: {
    fontSize: theme.typography.fontSize.h3,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.m,
    textAlign: 'center',
  },
  
  emptySubtitle: {
    fontSize: theme.typography.fontSize.body1,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  },
  
  shopButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    ...theme.shadows.medium,
  },
  
  shopButtonText: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.bold,
  },
});

export default OrderHistoryScreen;
