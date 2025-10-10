/**
 * OrderDetailsScreen Component
 * Display detailed information about a specific order
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../styles/theme';
import { useAuth } from '../../hooks/useAuthLogin';
import { API_BASE_URL } from '../../config/api';
import EcoGradeBadge from '../../components/product/EcoGradeBadge';

const OrderDetailsScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const { auth: token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/order/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setOrder(data.order);
      } else {
        Alert.alert('Error', data.error || 'Failed to fetch order details');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      Alert.alert('Error', 'Failed to load order details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return null;
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
        <Text style={styles.title}>Order Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderNumber}>{order.orderNumber}</Text>
              <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.orderStatus) }]}>
              <Text style={styles.statusText}>
                {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment Status:</Text>
            <Text style={[styles.infoValue, { color: order.paymentStatus === 'paid' ? '#66BB6A' : '#FFA726' }]}>
              {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Amount:</Text>
            <Text style={styles.totalAmount}>${order.totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Shipping Address Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <Text style={styles.addressText}>{order.shippingAddress.fullName}</Text>
          <Text style={styles.addressText}>{order.shippingAddress.addressLine1}</Text>
          {order.shippingAddress.addressLine2 && (
            <Text style={styles.addressText}>{order.shippingAddress.addressLine2}</Text>
          )}
          <Text style={styles.addressText}>
            {order.shippingAddress.city}
            {order.shippingAddress.state && `, ${order.shippingAddress.state}`} {order.shippingAddress.postalCode}
          </Text>
          <Text style={styles.addressText}>{order.shippingAddress.country}</Text>
          {order.shippingAddress.phone && (
            <Text style={styles.addressText}>Phone: {order.shippingAddress.phone}</Text>
          )}
        </View>

        {/* Order Items */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {order.items.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <Image source={{ uri: item.productImage }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.productName}</Text>
                <View style={styles.itemMeta}>
                  <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                  <EcoGradeBadge grade={item.sustainabilityGrade} size="small" />
                </View>
                <Text style={styles.itemPrice}>${item.price.toFixed(2)} each</Text>
              </View>
              <Text style={styles.itemTotal}>
                ${(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Order Status Info */}
        <View style={styles.statusInfoCard}>
          <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
          <Text style={styles.statusInfoText}>
            {order.orderStatus === 'processing' 
              ? 'Your order is being processed. You will be notified when it ships.'
              : order.orderStatus === 'processed'
              ? 'Your order has been processed and is ready for shipment.'
              : order.orderStatus === 'shipped'
              ? 'Your order is on its way! Track your delivery above.'
              : order.orderStatus === 'delivered'
              ? 'Your order has been successfully delivered. Thank you for shopping!'
              : 'Your order is being prepared.'}
          </Text>
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
    paddingHorizontal: theme.spacing.l,
    paddingTop: Platform.OS === 'android' ? theme.spacing.xl : theme.spacing.xxxl,
    paddingBottom: theme.spacing.m,
    marginBottom: theme.spacing.s,
    backgroundColor: theme.colors.surface,
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
    ...theme.shadows.small,
  },

  backButton: {
    padding: theme.spacing.xs,
  },

  title: {
    fontSize: 24,
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

  content: {
    flex: 1,
    padding: theme.spacing.m,
  },

  infoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.l,
    marginBottom: theme.spacing.m,
    ...theme.shadows.card,
  },

  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.l,
    paddingBottom: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  orderNumber: {
    fontSize: theme.typography.fontSize.h5,
    fontWeight: theme.typography.fontWeight.bold,
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

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },

  infoLabel: {
    fontSize: theme.typography.fontSize.body1,
    color: theme.colors.textSecondary,
  },

  infoValue: {
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.semiBold,
  },

  totalAmount: {
    fontSize: theme.typography.fontSize.h4,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },

  sectionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.l,
    marginBottom: theme.spacing.m,
    ...theme.shadows.card,
  },

  sectionTitle: {
    fontSize: theme.typography.fontSize.h5,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.m,
  },

  addressText: {
    fontSize: theme.typography.fontSize.body1,
    color: theme.colors.text,
    marginBottom: 4,
    lineHeight: 20,
  },

  orderItem: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  itemImage: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.s,
    marginRight: theme.spacing.m,
  },

  itemDetails: {
    flex: 1,
  },

  itemName: {
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    marginBottom: 4,
  },

  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s,
    marginBottom: 4,
  },

  itemQuantity: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textSecondary,
  },

  itemPrice: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textSecondary,
  },

  itemTotal: {
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.primary,
    marginLeft: theme.spacing.s,
  },

  statusInfoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.primaryLight + '20',
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.l,
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.m,
  },

  statusInfoText: {
    flex: 1,
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.text,
    lineHeight: 20,
  },
});

export default OrderDetailsScreen;
