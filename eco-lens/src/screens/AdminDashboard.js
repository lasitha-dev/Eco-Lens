/**
 * AdminDashboard Component
 * Main dashboard for product management with real-time sustainability scoring
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
  FlatList,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import theme, { colors } from '../constants/theme';
import ProductForm from '../components/ProductForm';
import EcoScoreDisplay from '../components/EcoScoreDisplay';
import { getGradeColor } from '../utils/SustainabilityCalculator';
import ProductService from '../api/productService';
import { MOCK_PRODUCTS } from '../constants/mockData';
import { useAuth } from '../hooks/useAuthLogin';

const AdminDashboard = ({ navigation }) => {
  const { 
    auth, 
    user, 
    isAdmin, 
    isLoading: authLoading, 
    checkAdminAccess, 
    logout,
    getUserName 
  } = useAuth();
  
  const [products, setProducts] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState('All');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    averageSustainabilityScore: 0,
    gradeDistribution: {},
    topGradeProducts: 0
  });

  // Admin access check and redirect
  useEffect(() => {
    if (!authLoading) {
      if (!auth || !user) {
        Alert.alert(
          'Authentication Required',
          'Please log in to access the admin dashboard.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
        return;
      }
      
      if (!isAdmin) {
        Alert.alert(
          'Access Denied',
          'You do not have permission to access the admin dashboard.',
          [{ text: 'OK', onPress: () => navigation.navigate('Dashboard') }]
        );
        return;
      }
      
      // User is authenticated and is admin, load data
      console.log('✅ Admin access verified for:', getUserName());
      loadProducts();
      loadStats();
    }
  }, [auth, user, isAdmin, authLoading, navigation]);

  // Load products from API
  const loadProducts = async (showLoader = true) => {
    try {
      if (showLoader) setIsLoading(true);
      
      const response = await ProductService.getProducts({
        search: searchQuery || undefined,
        grade: filterGrade !== 'All' ? filterGrade : undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      
      setProducts(response.products || []);
      console.log(`✅ Loaded ${response.products?.length || 0} products from API`);
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert(
        'Load Error', 
        `Failed to load products: ${error.message}\n\nWould you like to seed some sample data?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Seed Data', 
            onPress: seedMockData
          }
        ]
      );
    } finally {
      if (showLoader) setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load statistics from API
  const loadStats = async () => {
    try {
      const response = await ProductService.getProductStats();
      setStats({
        totalProducts: response.totalProducts || 0,
        averageSustainabilityScore: response.averageSustainabilityScore || 0,
        gradeDistribution: response.gradeDistribution || {},
        topGradeProducts: response.topGradeProducts || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      // Don't show error for stats, just use defaults
    }
  };

  // Seed mock data to backend (for development/testing)
  const seedMockData = async () => {
    try {
      setIsLoading(true);
      await ProductService.seedMockData(MOCK_PRODUCTS);
      Alert.alert('Success', 'Sample products have been added to the database!');
      await loadProducts(false);
      await loadStats();
    } catch (error) {
      console.error('Error seeding data:', error);
      Alert.alert('Error', `Failed to seed data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh products and stats
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([loadProducts(false), loadStats()]);
  };

  const handleAddProduct = async (productData) => {
    try {
      setIsLoading(true);
      const response = await ProductService.createProduct(productData);
      
      // Add the new product to local state
      setProducts(prev => [response.product, ...prev]);
      setShowProductForm(false);
      
      // Refresh stats
      await loadStats();
      
      Alert.alert('Success', 'Product added successfully!');
      console.log(`✅ Product added: ${response.product.name}`);
    } catch (error) {
      console.error('Error adding product:', error);
      Alert.alert('Error', `Failed to add product: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProduct = async (productData) => {
    try {
      setIsLoading(true);
      const response = await ProductService.updateProduct(productData.id, productData);
      
      // Update the product in local state
      setProducts(prev => 
        prev.map(product => 
          product.id === productData.id ? response.product : product
        )
      );
      
      setEditingProduct(null);
      setShowProductForm(false);
      
      // Refresh stats
      await loadStats();
      
      Alert.alert('Success', 'Product updated successfully!');
      console.log(`✅ Product updated: ${response.product.name}`);
    } catch (error) {
      console.error('Error updating product:', error);
      Alert.alert('Error', `Failed to update product: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = (productId) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await ProductService.deleteProduct(productId);
              
              // Remove product from local state
              setProducts(prev => prev.filter(product => product.id !== productId));
              
              // Refresh stats
              await loadStats();
              
              Alert.alert('Success', 'Product deleted successfully!');
              console.log(`✅ Product deleted: ${productId}`);
            } catch (error) {
              console.error('Error deleting product:', error);
              Alert.alert('Error', `Failed to delete product: ${error.message}`);
            } finally {
              setIsLoading(false);
            }
          }
        },
      ]
    );
  };

  const openEditForm = (product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const openAddForm = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const closeProductForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
  };

  // Filter products locally (for immediate UI feedback)
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterGrade === 'All' || product.sustainabilityGrade === filterGrade;
    
    return matchesSearch && matchesFilter;
  });

  // Apply search filter when search query or filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadProducts(false); // Reload with new filters, but don't show loading spinner
    }, 500); // Debounce API calls

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filterGrade]);

  // Calculate dashboard statistics from current stats
  const totalProducts = stats.totalProducts;
  const averageScore = stats.averageSustainabilityScore;
  const gradeDistribution = stats.gradeDistribution;
  const topGradeProducts = stats.topGradeProducts;

  const renderDashboardStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{totalProducts}</Text>
        <Text style={styles.statLabel}>Total Products</Text>
      </View>
      
      <View style={styles.statCard}>
        <Text style={[styles.statNumber, { color: colors.primary }]}>{averageScore}%</Text>
        <Text style={styles.statLabel}>Avg Eco Score</Text>
      </View>
      
      <View style={styles.statCard}>
        <Text style={[styles.statNumber, { color: colors.success }]}>{topGradeProducts}</Text>
        <Text style={styles.statLabel}>A-B Grade</Text>
      </View>
      
      <View style={styles.statCard}>
        <View style={styles.gradeDistribution}>
          {['A', 'B', 'C', 'D', 'E', 'F'].map(grade => (
            <View key={grade} style={styles.gradeItem}>
              <View 
                style={[
                  styles.gradeDot, 
                  { backgroundColor: getGradeColor(grade) }
                ]} 
              />
              <Text style={styles.gradeCount}>{gradeDistribution[grade] || 0}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.statLabel}>Grade Distribution</Text>
      </View>
    </View>
  );

  const renderSearchAndFilter = () => (
    <View style={styles.searchFilterContainer}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <TouchableOpacity 
        style={styles.filterButton}
        onPress={() => setShowFilterModal(true)}
      >
        <Text style={styles.filterButtonText}>
          {filterGrade === 'All' ? 'Filter' : `Grade ${filterGrade}`}
        </Text>
        <Text style={styles.filterArrow}>▼</Text>
      </TouchableOpacity>
    </View>
  );

  const renderProductItem = ({ item: product }) => (
    <View style={styles.productCard}>
      <View style={styles.productHeader}>
        <Image source={{ uri: product.image }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productCategory}>{product.category}</Text>
          <Text style={styles.productPrice}>${product.price}</Text>
          <Text style={styles.productStock}>Stock: {product.stock}</Text>
        </View>
        <View style={styles.productScore}>
          <View 
            style={[
              styles.gradeBadge, 
              { backgroundColor: getGradeColor(product.sustainabilityGrade) }
            ]}
          >
            <Text style={styles.gradeText}>{product.sustainabilityGrade}</Text>
          </View>
          <Text style={styles.scoreText}>{product.sustainabilityScore}%</Text>
        </View>
      </View>
      
      <Text style={styles.productDescription} numberOfLines={2}>
        {product.description}
      </Text>
      
      <View style={styles.productActions}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => openEditForm(product)}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteProduct(product.id)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowFilterModal(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        onPress={() => setShowFilterModal(false)}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filter by Grade</Text>
          {['All', 'A', 'B', 'C', 'D', 'E', 'F'].map((grade) => (
            <TouchableOpacity
              key={grade}
              style={[
                styles.modalOption,
                filterGrade === grade && styles.modalOptionSelected
              ]}
              onPress={() => {
                setFilterGrade(grade);
                setShowFilterModal(false);
              }}
            >
              <Text style={[
                styles.modalOptionText,
                filterGrade === grade && styles.modalOptionTextSelected
              ]}>
                {grade === 'All' ? 'All Grades' : `Grade ${grade}`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.adminName}>{getUserName() || 'Admin'}</Text>
          <Text style={styles.roleText}>Administrator</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => navigation.navigate('AdminSettings')}
          >
            <Text style={styles.settingsButtonText}>⚙️</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={openAddForm}
          >
            <Text style={styles.addButtonText}>+ Add Product</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={logout}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Dashboard Stats */}
      {renderDashboardStats()}

      {/* Search and Filter */}
      {renderSearchAndFilter()}

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      )}

      {/* Products List */}
      {!isLoading && (
        <View style={styles.productsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Products ({filteredProducts.length})
            </Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={handleRefresh}
              disabled={isRefreshing}
            >
              <Text style={styles.refreshButtonText}>
                {isRefreshing ? 'Refreshing...' : '↻ Refresh'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {filteredProducts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {products.length === 0 
                  ? 'No products in database. Tap "Add Product" to get started, or use "Seed Data" to add sample products!'
                  : 'No products match your search criteria.'
                }
              </Text>
              {products.length === 0 && (
                <TouchableOpacity 
                  style={styles.seedButton}
                  onPress={seedMockData}
                >
                  <Text style={styles.seedButtonText}>Seed Sample Data</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <FlatList
              data={filteredProducts}
              renderItem={renderProductItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.productsList}
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          )}
        </View>
      )}

      {/* Product Form Modal */}
      <Modal
        visible={showProductForm}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeProductForm}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </Text>
            <View style={styles.modalHeaderSpace} />
          </View>
          
          <ProductForm
            onSubmit={editingProduct ? handleEditProduct : handleAddProduct}
            onCancel={closeProductForm}
            initialData={editingProduct}
            isEditing={!!editingProduct}
          />
        </SafeAreaView>
      </Modal>

      {/* Filter Modal */}
      {renderFilterModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.m,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...theme.shadows.small,
  },
  
  welcomeText: {
    fontSize: theme.typography.fontSize.base,
    color: colors.textSecondary,
  },
  
  adminName: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: colors.text,
  },
  
  roleText: {
    fontSize: theme.typography.fontSize.sm,
    color: colors.secondary,
    fontStyle: 'italic',
  },
  
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  settingsButtonText: {
    fontSize: 20,
  },
  
  logoutButton: {
    backgroundColor: colors.error,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  
  logoutButtonText: {
    color: colors.textLight,
    fontSize: 12,
    fontWeight: '600',
  },
  
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.error,
    marginBottom: 8,
  },
  
  errorSubtext: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  
  addButton: {
    ...theme.componentStyles.button.primary,
  },
  
  addButtonText: {
    color: colors.textLight,
    fontWeight: '600',
  },
  
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.surface,
  },
  
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  
  gradeDistribution: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  
  gradeItem: {
    alignItems: 'center',
    marginHorizontal: 2,
  },
  
  gradeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 2,
  },
  
  gradeCount: {
    fontSize: 10,
    color: colors.text,
  },
  
  searchFilterContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  
  searchContainer: {
    flex: 1,
    marginRight: 12,
  },
  
  searchInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  
  filterButtonText: {
    fontSize: 14,
    color: colors.text,
    marginRight: 4,
  },
  
  filterArrow: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  
  productsSection: {
    flex: 1,
    padding: 16,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  
  refreshButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  
  refreshButtonText: {
    color: colors.textLight,
    fontSize: 12,
    fontWeight: '600',
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
  
  seedButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  
  seedButtonText: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: '600',
  },
  
  productsList: {
    paddingBottom: 16,
  },
  
  productCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  productHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  
  productInfo: {
    flex: 1,
  },
  
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  
  productCategory: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 2,
  },
  
  productStock: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  
  productScore: {
    alignItems: 'center',
  },
  
  gradeBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  
  gradeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  scoreText: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  
  productDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  
  productActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  
  editButton: {
    backgroundColor: colors.info,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  
  editButtonText: {
    color: colors.textLight,
    fontSize: 12,
    fontWeight: '600',
  },
  
  deleteButton: {
    backgroundColor: colors.error,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  
  deleteButtonText: {
    color: colors.textLight,
    fontSize: 12,
    fontWeight: '600',
  },
  
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  
  modalCloseText: {
    fontSize: 24,
    color: colors.text,
  },
  
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  
  modalHeaderSpace: {
    width: 24,
  },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    width: '80%',
    maxHeight: '70%',
  },
  
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  
  modalOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    borderRadius: 6,
    marginBottom: 4,
  },
  
  modalOptionSelected: {
    backgroundColor: colors.primary,
  },
  
  modalOptionText: {
    fontSize: 16,
    color: colors.text,
  },
  
  modalOptionTextSelected: {
    color: colors.textLight,
    fontWeight: '600',
  },
});

export default AdminDashboard;
