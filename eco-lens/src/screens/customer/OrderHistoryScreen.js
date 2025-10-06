/**
 * OrderHistoryScreen Component
 * Displays user's past orders
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import theme from '../../styles/theme';
import globalStyles from '../../styles/globalStyles';
import { useAuth } from '../../hooks/useAuthLogin';
import OrderService from '../../api/orderService';

const OrderHistoryScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const orderData = await OrderService.getOrderHistory(user.id);
      setOrders(orderData);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return theme.colors.success || '#28a745';
      case 'pending':
        return theme.colors.warning || '#ffc107';
      case 'failed':
        return theme.colors.error || '#dc3545';
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      default:
        return status;
    }
  };

  const handleOrderPress = (order) => {
    navigation.navigate('OrderDetail', { orderId: order._id });
  };

  const renderOrderItem = ({ item }) => {
    // Get first product image for display
    const firstItem = item.items[0];
    const productImage = firstItem?.productId?.image;
    const totalItems = item.items.reduce((sum, orderItem) => sum + orderItem.quantity, 0);

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => handleOrderPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderId}>Order #{item._id.slice(-8)}</Text>
            <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.paymentStatus) }]}>
            <Text style={styles.statusText}>{getStatusText(item.paymentStatus)}</Text>
          </View>
        </View>

        <View style={styles.orderContent}>
          <View style={styles.productPreview}>
            {productImage && (
              <Image source={{ uri: productImage }} style={styles.productImage} />
            )}
            <View style={styles.productInfo}>
              <Text style={styles.productCount}>
                {totalItems} item{totalItems !== 1 ? 's' : ''}
              </Text>
              <Text style={styles.productSummary} numberOfLines={1}>
                {firstItem?.productId?.name}
                {item.items.length > 1 && ` +${item.items.length - 1} more`}
              </Text>
            </View>
          </View>

          <View style={styles.orderTotal}>
            <Text style={styles.totalAmount}>${item.totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.viewDetailsButton}
          onPress={() => handleOrderPress(item)}
        >
          <Text style={styles.viewDetailsText}>View Details</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📦</Text>
      <Text style={styles.emptyTitle}>No orders yet</Text>
      <Text style={styles.emptySubtitle}>
        Your order history will appear here once you make your first purchase
      </Text>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => navigation.navigate('ProductDashboard')}
      >
        <Text style={styles.shopButtonText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[globalStyles.container, globalStyles.center]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
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
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order History</Text>
        <View style={styles.headerSpace} />
      </View>

      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        refreshing={loading}
        onRefresh={loadOrders}
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

  backText: {
    fontSize: 24,
    color: theme.colors.text,
  },

  headerTitle: {
    fontSize: theme.typography.fontSize.h5,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
  },

  headerSpace: {
    width: 40,
  },

  listContainer: {
    padding: theme.spacing.m,
    paddingBottom: 100,
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
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },

  orderInfo: {
    flex: 1,
  },

  orderId: {
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },

  orderDate: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textSecondary,
  },

  statusBadge: {
    paddingHorizontal: theme.spacing.s,
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
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  productImage: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.s,
    marginRight: theme.spacing.m,
  },

  productInfo: {
    flex: 1,
  },

  productCount: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },

  productSummary: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.text,
  },

  orderTotal: {
    alignItems: 'flex-end',
  },

  totalAmount: {
    fontSize: theme.typography.fontSize.h5,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },

  viewDetailsButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.borderRadius.s,
  },

  viewDetailsText: {
    fontSize: theme.typography.fontSize.caption,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.primary,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: 100,
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

  loadingText: {
    marginTop: theme.spacing.m,
    fontSize: theme.typography.fontSize.body1,
    color: theme.colors.textSecondary,
  },
});

export default OrderHistoryScreen;