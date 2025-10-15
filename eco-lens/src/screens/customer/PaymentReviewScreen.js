/**
 * PaymentReviewScreen Component
 * Review order and confirm payment before processing
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../styles/theme';
import { useAuth } from '../../hooks/useAuthLogin';
import { API_BASE_URL } from '../../config/api';
import EcoGradeBadge from '../../components/product/EcoGradeBadge';
import PostPurchaseRatingManager from '../../components/PostPurchaseRatingManager';

const PaymentReviewScreen = ({ route, navigation }) => {
  const { shippingAddress, cartItems, totalAmount, paymentDetails } = route.params;
  const { auth: token } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [showRatingFlow, setShowRatingFlow] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  // Mask card number (show last 4 digits)
  const maskCardNumber = (cardNumber) => {
    const cleaned = cardNumber.replace(/\s/g, '');
    return `•••• •••• •••• ${cleaned.slice(-4)}`;
  };

  // Process payment
  const handleConfirmPayment = async () => {
    setProcessing(true);

    try {
      const response = await fetch(`${API_BASE_URL}/orders/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shippingAddress,
          paymentDetails: {
            cardType: paymentDetails.cardType,
            cardNumber: paymentDetails.cardNumber.replace(/\s/g, ''),
            cardHolder: paymentDetails.cardHolder,
            expiryDate: paymentDetails.expiryDate,
            cvv: paymentDetails.cvv,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Payment successful - store order data and show rating flow
        setCompletedOrder(data.order);
        setShowRatingFlow(true);
      } else {
        Alert.alert('Payment Failed', data.error || 'Failed to process payment. Please try again.');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Handle rating flow completion
  const handleRatingFlowComplete = () => {
    setShowRatingFlow(false);
    Alert.alert(
      'Thank You! 🎉',
      `Your order ${completedOrder.orderNumber} has been placed successfully.`,
      [
        {
          text: 'View Order',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [
                { name: 'Dashboard' },
                { name: 'OrderDetails', params: { orderId: completedOrder._id } }
              ],
            });
          },
        },
        {
          text: 'Continue Shopping',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Dashboard' }],
            });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={processing}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Review & Confirm</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {cartItems?.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
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

        {/* Shipping Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <View style={styles.addressCard}>
            <Text style={styles.addressText}>{shippingAddress.fullName}</Text>
            <Text style={styles.addressText}>{shippingAddress.addressLine1}</Text>
            {shippingAddress.addressLine2 && (
              <Text style={styles.addressText}>{shippingAddress.addressLine2}</Text>
            )}
            <Text style={styles.addressText}>
              {shippingAddress.city}
              {shippingAddress.state && `, ${shippingAddress.state}`} {shippingAddress.postalCode}
            </Text>
            <Text style={styles.addressText}>{shippingAddress.country}</Text>
            {shippingAddress.phone && (
              <Text style={styles.addressText}>Phone: {shippingAddress.phone}</Text>
            )}
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentCard}>
            <View style={styles.paymentRow}>
              <Ionicons name="card" size={24} color={theme.colors.primary} />
              <View style={styles.paymentInfo}>
                <Text style={styles.cardType}>
                  {paymentDetails.cardType === 'visa' ? 'Visa' : 'Mastercard'}
                </Text>
                <Text style={styles.cardNumber}>{maskCardNumber(paymentDetails.cardNumber)}</Text>
                <Text style={styles.cardHolder}>{paymentDetails.cardHolder}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>${totalAmount?.toFixed(2) || '0.00'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping:</Text>
              <Text style={styles.summaryValue}>Free</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax:</Text>
              <Text style={styles.summaryValue}>$0.00</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>${totalAmount?.toFixed(2) || '0.00'}</Text>
            </View>
          </View>
        </View>

        {/* Terms Notice */}
        <View style={styles.termsNotice}>
          <Ionicons name="information-circle" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.termsText}>
            By confirming, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmButton, processing && styles.confirmButtonDisabled]}
          onPress={handleConfirmPayment}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator color={theme.colors.textOnPrimary} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color={theme.colors.textOnPrimary} />
              <Text style={styles.confirmButtonText}>Confirm Payment</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Post-Purchase Rating Flow */}
      <PostPurchaseRatingManager
        visible={showRatingFlow}
        onComplete={handleRatingFlowComplete}
        orderId={completedOrder?._id}
        orderItems={cartItems}
        authToken={token}
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

  content: {
    flex: 1,
    padding: theme.spacing.m,
  },

  section: {
    marginBottom: theme.spacing.l,
  },

  sectionTitle: {
    fontSize: theme.typography.fontSize.h5,
    fontWeight: theme.typography.fontWeight.bold,
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
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginLeft: theme.spacing.s,
  },

  addressCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.l,
    ...theme.shadows.card,
  },

  addressText: {
    fontSize: theme.typography.fontSize.body1,
    color: theme.colors.text,
    marginBottom: 4,
    lineHeight: 20,
  },

  paymentCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.l,
    ...theme.shadows.card,
  },

  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.m,
  },

  paymentInfo: {
    flex: 1,
  },

  cardType: {
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    marginBottom: 4,
  },

  cardNumber: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },

  cardHolder: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textSecondary,
  },

  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.l,
    ...theme.shadows.card,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },

  summaryLabel: {
    fontSize: theme.typography.fontSize.body1,
    color: theme.colors.textSecondary,
  },

  summaryValue: {
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
  },

  totalRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.m,
    marginTop: theme.spacing.s,
    marginBottom: 0,
  },

  totalLabel: {
    fontSize: theme.typography.fontSize.h5,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },

  totalValue: {
    fontSize: theme.typography.fontSize.h4,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },

  termsNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    gap: theme.spacing.s,
    marginBottom: theme.spacing.xl,
  },

  termsText: {
    flex: 1,
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },

  footer: {
    padding: theme.spacing.m,
    paddingBottom: Platform.OS === 'ios' ? 30 : theme.spacing.m,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.medium,
  },

  confirmButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    gap: theme.spacing.s,
    ...theme.shadows.medium,
  },

  confirmButtonDisabled: {
    opacity: 0.7,
  },

  confirmButtonText: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.typography.fontSize.h5,
    fontWeight: theme.typography.fontWeight.bold,
  },
});

export default PaymentReviewScreen;
