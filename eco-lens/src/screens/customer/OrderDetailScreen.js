/**
 * OrderDetailScreen Component
 * Detailed view of a specific order
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Linking,
} from 'react-native';
import theme from '../../styles/theme';
import globalStyles from '../../styles/globalStyles';
import { useAuth } from '../../hooks/useAuthLogin';
import OrderService from '../../api/orderService';

const OrderDetailScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const orderId = route?.params?.orderId;

  useEffect(() => {
    if (orderId) {
      loadOrderDetail();
    } else {
      navigation.goBack();
    }
  }, [orderId]);

  const loadOrderDetail = async () => {
    try {
      setLoading(true);
      const orderData = await OrderService.getOrderDetail(orderId);
      setOrder(orderData);
    } catch (error) {
      console.error('Error loading order detail:', error);
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
        return 'Payment Completed';
      case 'pending':
        return 'Payment Pending';
      case 'failed':
        return 'Payment Failed';
      default:
        return status;
    }
  };

  const handleViewReceipt = () => {
    if (order?.receiptUrl) {
      Linking.openURL(order.receiptUrl);
    }
  };

  const renderOrderItem = (item, index) => (
    <View key={index} style={styles.orderItem}>
      <Image
        source={{ uri: item.productId.image }}
        style={styles.itemImage}
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.productId.name}
        </Text>
        <Text style={styles.itemCategory}>{item.productId.category}</Text>
        <View style={styles.itemMeta}>
          <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
          <Text style={styles.itemPrice}>${item.price.toFixed(2)} each</Text>
        </View>
      </View>
      <View style={styles.itemTotal}>
        <Text style={styles.itemTotalText}>
          ${(item.price * item.quantity).toFixed(2)}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[globalStyles.container, globalStyles.center]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Order not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
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
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={styles.headerSpace} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Order Status */}
        <View style={styles.statusSection}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.paymentStatus) }]}>
            <Text style={styles.statusText}>{getStatusText(order.paymentStatus)}</Text>
          </View>
          <Text style={styles.orderId}>Order #{order._id}</Text>
          <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items Ordered</Text>
          {order.items.map((item, index) => renderOrderItem(item, index))}
        </View>

        {/* Order Total */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>${order.totalAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Shipping:</Text>
            <Text style={styles.totalValue}>Free</Text>
          </View>
          <View style={[styles.totalRow, styles.finalTotal]}>
            <Text style={styles.finalTotalLabel}>Total Paid:</Text>
            <Text style={styles.finalTotalValue}>${order.totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Shipping Information */}
        {order.shippingInfo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shipping Address</Text>
            <View style={styles.addressCard}>
              <Text style={styles.addressName}>{order.shippingInfo.name}</Text>
              <Text style={styles.addressLine}>{order.shippingInfo.address}</Text>
              <Text style={styles.addressLine}>
                {order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.zipCode}
              </Text>
              <Text style={styles.addressLine}>{order.shippingInfo.country}</Text>
            </View>
          </View>
        )}

        {/* Payment Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          <View style={styles.paymentCard}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Payment Method:</Text>
              <Text style={styles.paymentValue}>Credit Card</Text>
            </View>
            {order.stripePaymentIntentId && (
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Transaction ID:</Text>
                <Text style={styles.paymentValue}>{order.stripePaymentIntentId}</Text>
              </View>
            )}
            {order.receiptUrl && (
              <TouchableOpacity
                style={styles.receiptButton}
                onPress={handleViewReceipt}
              >
                <Text style={styles.receiptButtonText}>View Receipt</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
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

  scrollContent: {
    padding: theme.spacing.m,
    paddingBottom: 100,
  },

  statusSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.l,
  },

  statusBadge: {
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.m,
  },

  statusText: {
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.textOnPrimary,
  },

  orderId: {
    fontSize: theme.typography.fontSize.h5,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },

  orderDate: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.textSecondary,
  },

  section: {
    marginBottom: theme.spacing.l,
  },

  sectionTitle: {
    fontSize: theme.typography.fontSize.h5,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.m,
  },

  orderItem: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    ...theme.shadows.card,
  },

  itemImage: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.m,
  },

  itemDetails: {
    flex: 1,
    marginLeft: theme.spacing.m,
  },

  itemName: {
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },

  itemCategory: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.s,
  },

  itemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  itemQuantity: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textSecondary,
  },

  itemPrice: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.primary,
  },

  itemTotal: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  itemTotalText: {
    fontSize: theme.typography.fontSize.h5,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },

  totalSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    ...theme.shadows.card,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },

  totalLabel: {
    fontSize: theme.typography.fontSize.body1,
    color: theme.colors.textSecondary,
  },

  totalValue: {
    fontSize: theme.typography.fontSize.body1,
    color: theme.colors.text,
  },

  finalTotal: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.m,
    marginTop: theme.spacing.m,
  },

  finalTotalLabel: {
    fontSize: theme.typography.fontSize.h4,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },

  finalTotalValue: {
    fontSize: theme.typography.fontSize.h3,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },

  addressCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    ...theme.shadows.card,
  },

  addressName: {
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },

  addressLine: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },

  paymentCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    ...theme.shadows.card,
  },

  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },

  paymentLabel: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.textSecondary,
  },

  paymentValue: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.text,
  },

  receiptButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.borderRadius.s,
    alignSelf: 'flex-start',
    marginTop: theme.spacing.m,
  },

  receiptButtonText: {
    fontSize: theme.typography.fontSize.caption,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.textOnPrimary,
  },

  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },

  errorText: {
    fontSize: theme.typography.fontSize.h4,
    color: theme.colors.text,
    marginBottom: theme.spacing.l,
  },

  backButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
  },

  backButtonText: {
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

export default OrderDetailScreen;