/**
 * CheckoutScreen Component
 * Shipping information form and payment processing
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import theme from '../../styles/theme';
import globalStyles from '../../styles/globalStyles';
import { useAuth } from '../../hooks/useAuthLogin';
import CartService from '../../api/cartService';
import OrderService from '../../api/orderService';

const CheckoutScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
    address: user?.address || '',
    city: '',
    state: '',
    zipCode: '',
    country: user?.country || '',
  });

  // Load cart data on component mount
  useEffect(() => {
    loadCart();
  }, [user]);

  // Function to load cart from API
  const loadCart = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const cartData = await CartService.getCart(user.id);
      setCartItems(cartData.items || []);
    } catch (error) {
      console.error('Error loading cart:', error);
      Alert.alert('Error', 'Failed to load cart. Please try again.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // Calculate total price
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.productId.price * item.quantity), 0);
  };

  // Handle shipping info change
  const handleShippingChange = (field, value) => {
    setShippingInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Validate shipping info
  const validateShippingInfo = () => {
    const { name, address, city, state, zipCode, country } = shippingInfo;
    if (!name.trim() || !address.trim() || !city.trim() || !state.trim() || !zipCode.trim() || !country.trim()) {
      Alert.alert('Missing Information', 'Please fill in all shipping fields.');
      return false;
    }
    return true;
  };

  // Handle checkout
  const handleCheckout = async () => {
    if (!validateShippingInfo()) return;

    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty.');
      return;
    }

    try {
      setProcessing(true);

      // Create checkout session
      const response = await OrderService.createCheckout(shippingInfo);

      // Open Stripe checkout URL in browser
      if (response.url) {
        await Linking.openURL(response.url);
      } else {
        Alert.alert('Error', 'Failed to create checkout session.');
      }

    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Error', 'Failed to process checkout. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Render cart summary
  const renderCartSummary = () => (
    <View style={styles.cartSummary}>
      <Text style={styles.sectionTitle}>Order Summary</Text>

      {cartItems.map((item) => (
        <View key={item.productId._id} style={styles.cartItem}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName} numberOfLines={2}>
              {item.productId.name}
            </Text>
            <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
          </View>
          <Text style={styles.itemPrice}>
            ${(item.productId.price * item.quantity).toFixed(2)}
          </Text>
        </View>
      ))}

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalValue}>${calculateTotal().toFixed(2)}</Text>
      </View>
    </View>
  );

  // Render shipping form
  const renderShippingForm = () => (
    <View style={styles.shippingForm}>
      <Text style={styles.sectionTitle}>Shipping Information</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={shippingInfo.name}
          onChangeText={(value) => handleShippingChange('name', value)}
          placeholder="Enter your full name"
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Address</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={shippingInfo.address}
          onChangeText={(value) => handleShippingChange('address', value)}
          placeholder="Enter your address"
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          numberOfLines={2}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, styles.halfWidth]}>
          <Text style={styles.inputLabel}>City</Text>
          <TextInput
            style={styles.input}
            value={shippingInfo.city}
            onChangeText={(value) => handleShippingChange('city', value)}
            placeholder="City"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        <View style={[styles.inputGroup, styles.halfWidth]}>
          <Text style={styles.inputLabel}>State</Text>
          <TextInput
            style={styles.input}
            value={shippingInfo.state}
            onChangeText={(value) => handleShippingChange('state', value)}
            placeholder="State"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, styles.halfWidth]}>
          <Text style={styles.inputLabel}>ZIP Code</Text>
          <TextInput
            style={styles.input}
            value={shippingInfo.zipCode}
            onChangeText={(value) => handleShippingChange('zipCode', value)}
            placeholder="ZIP Code"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="numeric"
          />
        </View>

        <View style={[styles.inputGroup, styles.halfWidth]}>
          <Text style={styles.inputLabel}>Country</Text>
          <TextInput
            style={styles.input}
            value={shippingInfo.country}
            onChangeText={(value) => handleShippingChange('country', value)}
            placeholder="Country"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[globalStyles.container, globalStyles.center]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading checkout...</Text>
      </View>
    );
  }

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Add some items to your cart before checkout
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('ProductDashboard')}
          >
            <Text style={styles.browseButtonText}>Browse Products</Text>
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
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.headerSpace} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderCartSummary()}
        {renderShippingForm()}
      </ScrollView>

      {/* Checkout Button */}
      <View style={styles.checkoutContainer}>
        <TouchableOpacity
          style={[styles.checkoutButton, processing && styles.disabledButton]}
          onPress={handleCheckout}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator color={theme.colors.textOnPrimary} />
          ) : (
            <Text style={styles.checkoutButtonText}>
              Pay ${calculateTotal().toFixed(2)}
            </Text>
          )}
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
    paddingBottom: 120,
  },

  cartSummary: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.l,
    ...theme.shadows.card,
  },

  sectionTitle: {
    fontSize: theme.typography.fontSize.h5,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.m,
  },

  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },

  itemInfo: {
    flex: 1,
    marginRight: theme.spacing.m,
  },

  itemName: {
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },

  itemQuantity: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textSecondary,
  },

  itemPrice: {
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.primary,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.m,
    marginTop: theme.spacing.m,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
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

  shippingForm: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    ...theme.shadows.card,
  },

  inputGroup: {
    marginBottom: theme.spacing.m,
  },

  inputLabel: {
    fontSize: theme.typography.fontSize.body2,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },

  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.s,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    fontSize: theme.typography.fontSize.body1,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
  },

  multilineInput: {
    height: 60,
    textAlignVertical: 'top',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  halfWidth: {
    width: '48%',
  },

  checkoutContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    ...theme.shadows.medium,
  },

  checkoutButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
    ...theme.shadows.medium,
  },

  checkoutButtonText: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.typography.fontSize.h5,
    fontWeight: theme.typography.fontWeight.bold,
  },

  disabledButton: {
    opacity: 0.5,
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

  browseButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    ...theme.shadows.medium,
  },

  browseButtonText: {
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

export default CheckoutScreen;