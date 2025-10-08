/**
 * PaymentDetailsScreen Component
 * Custom payment interface for entering card details
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
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../styles/theme';

const PaymentDetailsScreen = ({ route, navigation }) => {
  const { shippingAddress, cartItems, totalAmount } = route.params;
  
  const [selectedCardType, setSelectedCardType] = useState('visa'); // 'visa' or 'mastercard'
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  // Format card number with spaces
  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g);
    return formatted ? formatted.join(' ') : cleaned;
  };

  // Format expiry date (MM/YY)
  const formatExpiryDate = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  // Validate card details
  const validateCardDetails = () => {
    const cleanedCardNumber = cardNumber.replace(/\s/g, '');
    
    if (!cardHolder.trim()) {
      Alert.alert('Error', 'Please enter the cardholder name');
      return false;
    }
    
    if (cleanedCardNumber.length !== 16) {
      Alert.alert('Error', 'Please enter a valid 16-digit card number');
      return false;
    }
    
    if (!expiryDate || expiryDate.length !== 5) {
      Alert.alert('Error', 'Please enter a valid expiry date (MM/YY)');
      return false;
    }
    
    const [month, year] = expiryDate.split('/');
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    
    if (parseInt(month) < 1 || parseInt(month) > 12) {
      Alert.alert('Error', 'Invalid expiry month');
      return false;
    }
    
    if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
      Alert.alert('Error', 'Card has expired');
      return false;
    }
    
    if (cvv.length !== 3) {
      Alert.alert('Error', 'Please enter a valid 3-digit CVV');
      return false;
    }
    
    return true;
  };

  // Proceed to review
  const handleProceedToReview = () => {
    if (!validateCardDetails()) {
      return;
    }

    // Navigate to payment review screen
    navigation.navigate('PaymentReview', {
      shippingAddress,
      cartItems,
      totalAmount,
      paymentDetails: {
        cardType: selectedCardType,
        cardNumber,
        cardHolder,
        expiryDate,
        cvv,
      },
    });
  };

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
        <Text style={styles.title}>Payment Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Items:</Text>
            <Text style={styles.summaryValue}>
              {cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalValue}>${totalAmount?.toFixed(2) || '0.00'}</Text>
          </View>
        </View>

        {/* Card Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Card Type</Text>
          <View style={styles.cardTypeContainer}>
            <TouchableOpacity
              style={[
                styles.cardTypeButton,
                selectedCardType === 'visa' && styles.cardTypeButtonActive
              ]}
              onPress={() => setSelectedCardType('visa')}
            >
              <View style={styles.cardTypeContent}>
                <Ionicons 
                  name="card" 
                  size={24} 
                  color={selectedCardType === 'visa' ? theme.colors.primary : theme.colors.textSecondary} 
                />
                <Text style={[
                  styles.cardTypeText,
                  selectedCardType === 'visa' && styles.cardTypeTextActive
                ]}>
                  Visa
                </Text>
              </View>
              {selectedCardType === 'visa' && (
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.cardTypeButton,
                selectedCardType === 'mastercard' && styles.cardTypeButtonActive
              ]}
              onPress={() => setSelectedCardType('mastercard')}
            >
              <View style={styles.cardTypeContent}>
                <Ionicons 
                  name="card" 
                  size={24} 
                  color={selectedCardType === 'mastercard' ? theme.colors.primary : theme.colors.textSecondary} 
                />
                <Text style={[
                  styles.cardTypeText,
                  selectedCardType === 'mastercard' && styles.cardTypeTextActive
                ]}>
                  Mastercard
                </Text>
              </View>
              {selectedCardType === 'mastercard' && (
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Card Details Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Card Details</Text>
          
          <Text style={styles.inputLabel}>Cardholder Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            value={cardHolder}
            onChangeText={setCardHolder}
            autoCapitalize="words"
          />

          <Text style={styles.inputLabel}>Card Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            onChangeText={(text) => {
              const cleaned = text.replace(/\s/g, '');
              if (cleaned.length <= 16 && /^\d*$/.test(cleaned)) {
                setCardNumber(formatCardNumber(cleaned));
              }
            }}
            keyboardType="numeric"
            maxLength={19} // 16 digits + 3 spaces
          />

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Expiry Date *</Text>
              <TextInput
                style={styles.input}
                placeholder="MM/YY"
                value={expiryDate}
                onChangeText={(text) => {
                  const formatted = formatExpiryDate(text);
                  if (formatted.length <= 5) {
                    setExpiryDate(formatted);
                  }
                }}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>

            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>CVV *</Text>
              <TextInput
                style={styles.input}
                placeholder="123"
                value={cvv}
                onChangeText={(text) => {
                  if (text.length <= 3 && /^\d*$/.test(text)) {
                    setCvv(text);
                  }
                }}
                keyboardType="numeric"
                maxLength={3}
                secureTextEntry
              />
            </View>
          </View>
        </View>

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <Ionicons name="shield-checkmark" size={20} color={theme.colors.primary} />
          <Text style={styles.securityText}>
            Your payment information is encrypted and secure
          </Text>
        </View>
      </ScrollView>

      {/* Pay Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.payButton}
          onPress={handleProceedToReview}
        >
          <Text style={styles.payButtonText}>Review Payment</Text>
          <Ionicons name="arrow-forward" size={20} color={theme.colors.textOnPrimary} />
        </TouchableOpacity>
      </View>
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

  content: {
    flex: 1,
    padding: theme.spacing.m,
  },

  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.l,
    marginBottom: theme.spacing.l,
    ...theme.shadows.card,
  },

  summaryTitle: {
    fontSize: theme.typography.fontSize.h5,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.m,
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

  section: {
    marginBottom: theme.spacing.l,
  },

  sectionTitle: {
    fontSize: theme.typography.fontSize.h5,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.m,
  },

  cardTypeContainer: {
    flexDirection: 'row',
    gap: theme.spacing.m,
  },

  cardTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
  },

  cardTypeButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight + '20',
  },

  cardTypeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s,
  },

  cardTypeText: {
    fontSize: theme.typography.fontSize.body1,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.semiBold,
  },

  cardTypeTextActive: {
    color: theme.colors.primary,
  },

  inputLabel: {
    fontSize: theme.typography.fontSize.body2,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.m,
  },

  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    fontSize: theme.typography.fontSize.body1,
    color: theme.colors.text,
  },

  row: {
    flexDirection: 'row',
    gap: theme.spacing.m,
  },

  halfInput: {
    flex: 1,
  },

  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight + '20',
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    gap: theme.spacing.s,
    marginBottom: theme.spacing.xl,
  },

  securityText: {
    flex: 1,
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semiBold,
  },

  footer: {
    padding: theme.spacing.m,
    paddingBottom: Platform.OS === 'ios' ? 30 : theme.spacing.m,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.medium,
  },

  payButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    gap: theme.spacing.s,
    ...theme.shadows.medium,
  },

  payButtonText: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.typography.fontSize.h5,
    fontWeight: theme.typography.fontWeight.bold,
  },
});

export default PaymentDetailsScreen;
