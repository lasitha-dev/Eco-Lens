/**
 * PaymentSuccessScreen Component
 * Confirmation screen after successful payment
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import theme from '../../styles/theme';
import globalStyles from '../../styles/globalStyles';
import { useAuth } from '../../hooks/useAuthLogin';
import OrderService from '../../api/orderService';

const PaymentSuccessScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get session_id from route params
  const sessionId = route?.params?.session_id;

  useEffect(() => {
    if (sessionId) {
      loadOrderDetails();
    } else {
      // If no session_id, redirect to home
      navigation.navigate('ProductDashboard');
    }
  }, [sessionId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      // In a real app, you might want to fetch order details by session_id
      // For now, we'll just show a success message
      // You could implement an endpoint to get order by session_id
    } catch (error) {
      console.error('Error loading order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueShopping = () => {
    navigation.navigate('ProductDashboard');
  };

  const handleViewOrders = () => {
    navigation.navigate('OrderHistory');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon */}
        <View style={styles.successIcon}>
          <Text style={styles.checkmark}>✓</Text>
        </View>

        {/* Success Message */}
        <View style={styles.messageContainer}>
          <Text style={styles.title}>Payment Successful!</Text>
          <Text style={styles.subtitle}>
            Thank you for your purchase. Your order has been confirmed and is being processed.
          </Text>
        </View>

        {/* Order Info (if available) */}
        {orderDetails && (
          <View style={styles.orderInfo}>
            <Text style={styles.orderInfoTitle}>Order Details</Text>
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Order ID:</Text>
              <Text style={styles.orderValue}>{orderDetails.id}</Text>
            </View>
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Total:</Text>
              <Text style={styles.orderValue}>${orderDetails.totalAmount?.toFixed(2)}</Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleContinueShopping}
          >
            <Text style={styles.primaryButtonText}>Continue Shopping</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleViewOrders}
          >
            <Text style={styles.secondaryButtonText}>View Order History</Text>
          </TouchableOpacity>
        </View>

        {/* Additional Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>What happens next?</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>
              You will receive an email confirmation with your order details
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>
              Your order will be processed and shipped within 2-3 business days
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>
              Track your order status in the Order History section
            </Text>
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

  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },

  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.success || '#28a745',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
    ...theme.shadows.medium,
  },

  checkmark: {
    fontSize: 60,
    color: theme.colors.textOnPrimary,
    fontWeight: 'bold',
  },

  messageContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.m,
  },

  title: {
    fontSize: theme.typography.fontSize.h2,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.success || '#28a745',
    marginBottom: theme.spacing.m,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: theme.typography.fontSize.body1,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },

  orderInfo: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.xl,
    width: '100%',
    ...theme.shadows.card,
  },

  orderInfoTitle: {
    fontSize: theme.typography.fontSize.h5,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.m,
  },

  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },

  orderLabel: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.textSecondary,
  },

  orderValue: {
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
  },

  actionsContainer: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },

  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
    marginBottom: theme.spacing.m,
    ...theme.shadows.medium,
  },

  primaryButtonText: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.typography.fontSize.h5,
    fontWeight: theme.typography.fontWeight.bold,
  },

  secondaryButton: {
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    ...theme.shadows.card,
  },

  secondaryButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.h5,
    fontWeight: theme.typography.fontWeight.semiBold,
  },

  infoContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    width: '100%',
    ...theme.shadows.card,
  },

  infoTitle: {
    fontSize: theme.typography.fontSize.h5,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.m,
  },

  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.s,
  },

  infoBullet: {
    fontSize: theme.typography.fontSize.body1,
    color: theme.colors.primary,
    marginRight: theme.spacing.s,
    marginTop: theme.spacing.xs,
  },

  infoText: {
    flex: 1,
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
});

export default PaymentSuccessScreen;