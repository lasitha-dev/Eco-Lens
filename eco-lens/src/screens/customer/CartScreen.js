/**
 * CartScreen Component
 * Shopping cart screen for customer purchases
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
  Alert,
  Dimensions,
  Platform,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import theme from '../../styles/theme';
import globalStyles from '../../styles/globalStyles';
import EcoGradeBadge from '../../components/product/EcoGradeBadge';
import SustainabilityGoalService from '../../api/sustainabilityGoalService';
import { useRealtimeGoals } from '../../contexts/RealtimeGoalContext';
import { useAuth } from '../../hooks/useAuthLogin';
import { API_BASE_URL } from '../../config/api';

const { width: screenWidth } = Dimensions.get('window');

const CartScreen = ({ navigation }) => {
  const { user, auth: token } = useAuth();
  
  // Use real-time goals context
  const { 
    activeGoals, 
    validateCartAgainstGoals,
    trackPurchaseProgress 
  } = useRealtimeGoals();
  // Cart state
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  
  // Real-time goal validation (computed from context)
  const goalValidation = validateCartAgainstGoals(cartItems);
  
  // Shipping address form - prepopulate with user data
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
    addressLine1: user?.address || '',
    addressLine2: '',
    city: user?.city || '',
    state: user?.state || '',
    postalCode: user?.postalCode || user?.zipCode || '',
    country: user?.country || '',
    phone: user?.phone || user?.phoneNumber || '',
  });

  // Fetch cart from API
  const fetchCart = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        // Transform cart items to match component structure
        const transformedItems = data.cart.items.map(item => {
          const productId = item.product._id || item.product.id || item.product;
          return {
            id: productId,
            productId: productId, // Explicitly store product ID for API calls
            product: item.product,
            name: item.product.name,
            price: item.price,
            quantity: item.quantity,
            image: item.product.image,
            category: item.product.category,
            sustainabilityScore: item.product.sustainabilityScore,
            sustainabilityGrade: item.product.sustainabilityGrade,
          };
        });
        console.log('Transformed cart items:', transformedItems);
        setCartItems(transformedItems);
      } else {
        console.error('Failed to fetch cart:', data.error);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      Alert.alert('Error', 'Failed to load cart. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load active sustainability goals
  const loadActiveGoals = async () => {
    if (!token) return;

    try {
      const response = await SustainabilityGoalService.getUserGoals(token);
      if (response.success) {
        const active = response.goals.filter(goal => goal.isActive);
        setActiveGoals(active);
        console.log('✅ Loaded active goals for cart validation:', active.length);
      }
    } catch (error) {
      console.error('Error loading goals for cart:', error);
    }
  };

  useEffect(() => {
    fetchCart();
    // Goals are now automatically loaded by the RealtimeGoalProvider
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCart();
    // Goals are automatically refreshed by the RealtimeGoalProvider
  }, []);

  // Function to update item quantity with optimistic updates
  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    console.log('Updating quantity:', { itemId, newQuantity });

    // Store previous state for rollback
    const previousCartItems = [...cartItems];

    // Optimistic update - update UI immediately
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );

    try {
      const response = await fetch(`${API_BASE_URL}/cart/update`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: itemId,
          quantity: newQuantity,
        }),
      });

      const data = await response.json();
      console.log('Update response:', data);

      if (!data.success) {
        // Rollback on failure
        console.error('Update failed:', data);
        setCartItems(previousCartItems);
        Alert.alert('Error', data.error || 'Failed to update quantity');
      }
      // Success - no need to refetch, UI already updated
    } catch (error) {
      // Rollback on error
      console.error('Error updating quantity:', error);
      setCartItems(previousCartItems);
      Alert.alert('Error', 'Failed to update cart. Please try again.');
    }
  };

  // Function to remove item from cart with optimistic updates
  const removeItem = async (itemId) => {
    console.log('Removing item:', itemId);
    
    // Store previous state for rollback
    const previousCartItems = [...cartItems];

    // Optimistic update - remove item immediately from UI
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));

    try {
      const response = await fetch(`${API_BASE_URL}/cart/remove/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('Remove response:', data);

      if (!data.success) {
        // Rollback on failure
        console.error('Remove failed:', data);
        setCartItems(previousCartItems);
        Alert.alert('Error', data.error || 'Failed to remove item');
      }
      // Success - no need to refetch, UI already updated
    } catch (error) {
      // Rollback on error
      console.error('Error removing item:', error);
      setCartItems(previousCartItems);
      Alert.alert('Error', 'Failed to remove item. Please try again.');
    }
  };

  // Calculate total price
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Calculate total eco score (weighted average)
  const calculateEcoScore = () => {
    if (cartItems.length === 0) return 0;
    
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const weightedScore = cartItems.reduce((sum, item) => 
      sum + (item.sustainabilityScore * item.quantity), 0
    );
    
    return Math.round(weightedScore / totalItems);
  };

  // Handle checkout
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Please add some items to your cart before checkout.');
      return;
    }
    
    setCheckoutModalVisible(true);
  };

  // Proceed to payment details
  const proceedToPayment = () => {
    if (!validateShippingAddress()) {
      return;
    }

    setCheckoutModalVisible(false);
    
    // Navigate to payment details screen
    navigation.navigate('PaymentDetails', {
      shippingAddress,
      cartItems,
      totalAmount: calculateTotal(),
    });
  };

  // Validate shipping address
  const validateShippingAddress = () => {
    if (!shippingAddress.fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }
    if (!shippingAddress.addressLine1.trim()) {
      Alert.alert('Error', 'Please enter your address');
      return false;
    }
    if (!shippingAddress.city.trim()) {
      Alert.alert('Error', 'Please enter your city');
      return false;
    }
    if (!shippingAddress.postalCode.trim()) {
      Alert.alert('Error', 'Please enter your postal code');
      return false;
    }
    if (!shippingAddress.country.trim()) {
      Alert.alert('Error', 'Please enter your country');
      return false;
    }
    return true;
  };


  // Render cart item
  const renderCartItem = ({ item }) => {
    const itemGoalValidation = goalValidation[item.id];
    
    return (
      <View style={styles.cartItem}>
        <Image source={{ uri: item.image }} style={styles.itemImage} />
        
        <View style={styles.itemDetails}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemName} numberOfLines={2}>
              {item.name}
            </Text>
            <View style={styles.itemBadges}>
              <EcoGradeBadge grade={item.sustainabilityGrade} size="small" />
              {itemGoalValidation && (
                <View style={[
                  styles.goalIndicator,
                  { backgroundColor: itemGoalValidation.meetsAnyGoal ? theme.colors.success + '20' : theme.colors.warning + '20' }
                ]}>
                  <Text style={[
                    styles.goalIndicatorText,
                    { color: itemGoalValidation.meetsAnyGoal ? theme.colors.success : theme.colors.warning }
                  ]}>
                    {itemGoalValidation.meetsAnyGoal ? '✓' : '!'}
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          <Text style={styles.itemCategory}>{item.category}</Text>
          <Text style={styles.itemPrice}>${item.price.toFixed(2)} each</Text>
          
          {/* Goal Validation Info */}
          {itemGoalValidation && activeGoals.length > 0 && (
            <View style={styles.goalValidationContainer}>
              {itemGoalValidation.meetsAnyGoal ? (
                <Text style={styles.goalValidationText}>
                  ✅ Meets {itemGoalValidation.matchingGoals.length} goal{itemGoalValidation.matchingGoals.length !== 1 ? 's' : ''}
                </Text>
              ) : (
                <Text style={styles.goalValidationTextWarning}>
                  ⚠️ Doesn't meet sustainability goals
                </Text>
              )}
            </View>
          )}
          
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => updateQuantity(item.id, item.quantity - 1)}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            
            <Text style={styles.quantityText}>{item.quantity}</Text>
            
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => updateQuantity(item.id, item.quantity + 1)}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeItem(item.id)}
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.itemTotal}>
          <Text style={styles.itemTotalText}>
            ${(item.price * item.quantity).toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

  // Render empty cart
  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🛒</Text>
      <Text style={styles.emptyTitle}>Your cart is empty</Text>
      <Text style={styles.emptySubtitle}>
        Browse our eco-friendly products and start building a sustainable cart!
      </Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => navigation.navigate('ProductDashboard')}
      >
        <Text style={styles.browseButtonText}>Browse Products</Text>
      </TouchableOpacity>
    </View>
  );

  const totalAmount = calculateTotal();
  const ecoScore = calculateEcoScore();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading cart...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={theme.colors.background}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>🛒 Shopping Cart</Text>
          <Text style={styles.subtitle}>Review your eco-friendly selections</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileIcon}
          onPress={() => navigation.navigate('Profile')}
        >
          <View style={styles.profileCircle}>
            {user?.profilePicture ? (
              <Image
                source={{ uri: user.profilePicture.startsWith('/9j/') || user.profilePicture.length > 100 
                  ? `data:image/jpeg;base64,${user.profilePicture}` 
                  : user.profilePicture }}
                style={styles.profileImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.profileText}>
                {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {cartItems.length === 0 ? (
        renderEmptyCart()
      ) : (
        <>
          {/* Cart Items */}
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => `${item.id}-${item.quantity}`}
            contentContainerStyle={styles.cartList}
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

          {/* Cart Summary */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Items in cart:</Text>
              <Text style={styles.summaryValue}>
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Eco Score:</Text>
              <View style={styles.ecoScoreContainer}>
                <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
                  {ecoScore}%
                </Text>
                <EcoGradeBadge 
                  grade={ecoScore >= 85 ? 'A' : ecoScore >= 70 ? 'B' : ecoScore >= 55 ? 'C' : ecoScore >= 40 ? 'D' : ecoScore >= 25 ? 'E' : 'F'} 
                  size="small" 
                />
              </View>
            </View>
            
            {/* Goal Compliance Summary */}
            {goalValidation._summary && activeGoals.length > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Goal Compliance:</Text>
                <View style={styles.goalComplianceContainer}>
                  <Text style={[
                    styles.summaryValue, 
                    { 
                      color: goalValidation._summary.overallCompliance >= 70 
                        ? theme.colors.success 
                        : goalValidation._summary.overallCompliance >= 40 
                          ? theme.colors.warning 
                          : theme.colors.error 
                    }
                  ]}>
                    {goalValidation._summary.itemsMeetingAnyGoal}/{goalValidation._summary.totalItems} items
                  </Text>
                  <Text style={styles.goalCompliancePercent}>
                    ({Math.round((goalValidation._summary.itemsMeetingAnyGoal / goalValidation._summary.totalItems) * 100)}%)
                  </Text>
                </View>
              </View>
            )}
            
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>${totalAmount.toFixed(2)}</Text>
            </View>
            
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}
            >
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Checkout Modal */}
      <Modal
        visible={checkoutModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCheckoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Shipping Address</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Full Name *"
                value={shippingAddress.fullName}
                onChangeText={(text) => setShippingAddress({ ...shippingAddress, fullName: text })}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Address Line 1 *"
                value={shippingAddress.addressLine1}
                onChangeText={(text) => setShippingAddress({ ...shippingAddress, addressLine1: text })}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Address Line 2 (Optional)"
                value={shippingAddress.addressLine2}
                onChangeText={(text) => setShippingAddress({ ...shippingAddress, addressLine2: text })}
              />
              
              <TextInput
                style={styles.input}
                placeholder="City *"
                value={shippingAddress.city}
                onChangeText={(text) => setShippingAddress({ ...shippingAddress, city: text })}
              />
              
              <TextInput
                style={styles.input}
                placeholder="State/Province"
                value={shippingAddress.state}
                onChangeText={(text) => setShippingAddress({ ...shippingAddress, state: text })}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Postal Code *"
                value={shippingAddress.postalCode}
                onChangeText={(text) => setShippingAddress({ ...shippingAddress, postalCode: text })}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Country *"
                value={shippingAddress.country}
                onChangeText={(text) => setShippingAddress({ ...shippingAddress, country: text })}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={shippingAddress.phone}
                onChangeText={(text) => setShippingAddress({ ...shippingAddress, phone: text })}
                keyboardType="phone-pad"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setCheckoutModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={proceedToPayment}
                >
                  <Text style={styles.confirmButtonText}>Continue to Payment</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  headerContent: {
    flex: 1,
    marginRight: theme.spacing.m,
  },

  profileIcon: {
    padding: theme.spacing.xs,
  },

  profileCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.small,
  },

  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },

  profileText: {
    fontSize: 20,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textOnPrimary,
  },
  
  title: {
    fontSize: 26,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: 2,
  },
  
  subtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  
  cartList: {
    paddingHorizontal: theme.spacing.m,
    paddingTop: theme.spacing.m,
    paddingBottom: Platform.OS === 'ios' ? 120 : 100,
  },
  
  cartItem: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    ...theme.shadows.card,
  },
  
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.m,
  },
  
  itemDetails: {
    flex: 1,
    marginLeft: theme.spacing.m,
  },
  
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  
  itemName: {
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.s,
  },
  
  itemCategory: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  
  itemPrice: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semiBold,
    marginBottom: theme.spacing.s,
  },
  
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  quantityButton: {
    backgroundColor: theme.colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  quantityButtonText: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.typography.fontSize.h5,
    fontWeight: theme.typography.fontWeight.bold,
  },
  
  quantityText: {
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    marginHorizontal: theme.spacing.m,
    minWidth: 30,
    textAlign: 'center',
  },
  
  removeButton: {
    backgroundColor: theme.colors.error,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.borderRadius.s,
    marginLeft: theme.spacing.m,
  },
  
  removeButtonText: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.typography.fontSize.caption,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  
  itemTotal: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: theme.spacing.s,
  },
  
  itemTotalText: {
    fontSize: theme.typography.fontSize.h5,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  
  summaryContainer: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.l,
    paddingBottom: Platform.OS === 'ios' ? 100 : 90, // Extra padding for tab bar
    ...theme.shadows.medium,
  },
  
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
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
  
  ecoScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s,
  },
  
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.m,
    marginBottom: theme.spacing.l,
  },
  
  totalLabel: {
    fontSize: theme.typography.fontSize.h4,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  
  totalValue: {
    fontSize: theme.typography.fontSize.h3,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
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

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.l,
    maxHeight: '85%',
  },

  modalTitle: {
    fontSize: theme.typography.fontSize.h4,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.l,
    textAlign: 'center',
  },

  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    fontSize: theme.typography.fontSize.body1,
    color: theme.colors.text,
  },

  modalButtons: {
    flexDirection: 'row',
    gap: theme.spacing.m,
    marginTop: theme.spacing.l,
  },

  modalButton: {
    flex: 1,
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButton: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  cancelButtonText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.semiBold,
  },

  confirmButton: {
    backgroundColor: theme.colors.primary,
    ...theme.shadows.medium,
  },

  confirmButtonText: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.bold,
  },

  // Goal Validation Styles
  itemBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.xs,
  },
  goalIndicatorText: {
    fontSize: theme.typography.fontSize.caption,
    fontWeight: theme.typography.fontWeight.bold,
  },
  goalValidationContainer: {
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  goalValidationText: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.success,
    fontWeight: theme.typography.fontWeight.medium,
  },
  goalValidationTextWarning: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.warning,
    fontWeight: theme.typography.fontWeight.medium,
  },
  goalComplianceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalCompliancePercent: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
});

export default CartScreen;
