/**
 * ProductForm Component
 * Comprehensive form for adding/editing products with real-time sustainability scoring
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import theme, { colors } from '../constants/theme';
import { 
  calculateSustainabilityScore, 
  calculateSustainabilityGrade,
  validateEcoMetrics 
} from '../utils/SustainabilityCalculator';
import EcoScoreDisplay from './EcoScoreDisplay';

// Categories from mock data
const CATEGORIES = [
  'Electronics',
  'Fashion',
  'Home & Garden',
  'Food & Beverages',
  'Personal Care',
  'Sports & Outdoors',
  'Books & Stationery',
  'Toys & Games',
];

const PACKAGING_TYPES = [
  { label: 'Minimal', value: 'minimal' },
  { label: 'Paper', value: 'paper' },
  { label: 'Biodegradable', value: 'biodegradable' },
  { label: 'Plastic', value: 'plastic' },
];

const MANUFACTURING_PROCESSES = [
  { label: 'Sustainable', value: 'sustainable' },
  { label: 'Renewable Energy', value: 'renewable-energy' },
  { label: 'Conventional', value: 'conventional' },
];

const ProductForm = ({ onSubmit, onCancel, initialData = null, isEditing = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: CATEGORIES[0],
    stock: '',
    image: '',
    seller: {
      name: '',
      certifications: [],
    },
    ecoMetrics: {
      materialsScore: 50,
      carbonFootprint: 1.0,
      packagingType: 'plastic',
      manufacturingProcess: 'conventional',
      productLifespan: 12,
      recyclablePercentage: 50,
      biodegradablePercentage: 0,
    },
  });

  const [errors, setErrors] = useState({});
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showPackagingModal, setShowPackagingModal] = useState(false);
  const [showManufacturingModal, setShowManufacturingModal] = useState(false);
  const [certificationInput, setCertificationInput] = useState('');
  const [sustainabilityScore, setSustainabilityScore] = useState(0);
  const [sustainabilityGrade, setSustainabilityGrade] = useState('F');

  // Initialize form with existing data if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        price: initialData.price?.toString() || '',
        stock: initialData.stock?.toString() || '',
      });
    }
  }, [initialData]);

  // Calculate sustainability score in real-time
  useEffect(() => {
    const score = calculateSustainabilityScore(formData.ecoMetrics);
    const grade = calculateSustainabilityGrade(score);
    setSustainabilityScore(score);
    setSustainabilityGrade(grade);
  }, [formData.ecoMetrics]);

  const updateFormData = (field, value, nested = null) => {
    if (nested) {
      setFormData(prev => ({
        ...prev,
        [nested]: {
          ...prev[nested],
          [field]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Basic validation
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    if (!formData.stock || isNaN(parseInt(formData.stock)) || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Valid stock quantity is required';
    }
    if (!formData.image.trim()) newErrors.image = 'Image URL is required';
    if (!formData.seller.name.trim()) newErrors.sellerName = 'Seller name is required';

    // Validate eco metrics
    const ecoValidation = validateEcoMetrics(formData.ecoMetrics);
    if (!ecoValidation.isValid) {
      newErrors.ecoMetrics = ecoValidation.errors.join(', ');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before submitting.');
      return;
    }

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      sustainabilityScore,
      sustainabilityGrade,
      rating: initialData?.rating || 0,
      reviewCount: initialData?.reviewCount || 0,
      id: initialData?.id || Date.now().toString(),
    };

    onSubmit(productData);
  };

  const handleClear = () => {
    Alert.alert(
      'Clear Form',
      'Are you sure you want to clear all form data?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            setFormData({
              name: '',
              description: '',
              price: '',
              category: CATEGORIES[0],
              stock: '',
              image: '',
              seller: {
                name: '',
                certifications: [],
              },
              ecoMetrics: {
                materialsScore: 50,
                carbonFootprint: 1.0,
                packagingType: 'plastic',
                manufacturingProcess: 'conventional',
                productLifespan: 12,
                recyclablePercentage: 50,
                biodegradablePercentage: 0,
              },
            });
            setErrors({});
          }
        },
      ]
    );
  };

  const addCertification = () => {
    if (certificationInput.trim()) {
      const certifications = [...formData.seller.certifications, certificationInput.trim()];
      updateFormData('certifications', certifications, 'seller');
      setCertificationInput('');
    }
  };

  const removeCertification = (index) => {
    const certifications = formData.seller.certifications.filter((_, i) => i !== index);
    updateFormData('certifications', certifications, 'seller');
  };

  const renderSlider = (label, value, onValueChange, min = 0, max = 100, step = 1) => (
    <View style={styles.sliderContainer}>
      <View style={styles.sliderHeader}>
        <Text style={styles.sliderLabel}>{label}</Text>
        <Text style={styles.sliderValue}>{value}{max === 100 ? '%' : ''}</Text>
      </View>
      <View style={styles.sliderTrack}>
        <View 
          style={[
            styles.sliderFill, 
            { width: `${((value - min) / (max - min)) * 100}%` }
          ]} 
        />
        <View 
          style={[
            styles.sliderThumb, 
            { left: `${((value - min) / (max - min)) * 100}%` }
          ]} 
        />
      </View>
      <View style={styles.sliderButtons}>
        <TouchableOpacity 
          style={styles.sliderButton}
          onPress={() => onValueChange(Math.max(min, value - step))}
        >
          <Text style={styles.sliderButtonText}>-</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.sliderButton}
          onPress={() => onValueChange(Math.min(max, value + step))}
        >
          <Text style={styles.sliderButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDropdown = (label, value, options, onSelect, showModal, setShowModal) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity 
        style={styles.dropdownButton}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.dropdownText}>{value}</Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>
      
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          onPress={() => setShowModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select {label}</Text>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.modalOption}
                onPress={() => {
                  onSelect(typeof option === 'string' ? option : option.value);
                  setShowModal(false);
                }}
              >
                <Text style={styles.modalOptionText}>
                  {typeof option === 'string' ? option : option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Basic Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Product Name *</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={formData.name}
            onChangeText={(value) => updateFormData('name', value)}
            placeholder="Enter product name"
            placeholderTextColor={colors.textSecondary}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea, errors.description && styles.inputError]}
            value={formData.description}
            onChangeText={(value) => updateFormData('description', value)}
            placeholder="Enter product description"
            placeholderTextColor={colors.textSecondary}
            multiline={true}
            numberOfLines={4}
          />
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
        </View>

        <View style={styles.row}>
          <View style={[styles.inputContainer, styles.halfWidth]}>
            <Text style={styles.label}>Price ($) *</Text>
            <TextInput
              style={[styles.input, errors.price && styles.inputError]}
              value={formData.price}
              onChangeText={(value) => updateFormData('price', value)}
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
            />
            {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
          </View>

          <View style={[styles.inputContainer, styles.halfWidth]}>
            <Text style={styles.label}>Stock *</Text>
            <TextInput
              style={[styles.input, errors.stock && styles.inputError]}
              value={formData.stock}
              onChangeText={(value) => updateFormData('stock', value)}
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
            />
            {errors.stock && <Text style={styles.errorText}>{errors.stock}</Text>}
          </View>
        </View>

        {renderDropdown(
          'Category',
          formData.category,
          CATEGORIES,
          (value) => updateFormData('category', value),
          showCategoryModal,
          setShowCategoryModal
        )}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Image URL *</Text>
          <TextInput
            style={[styles.input, errors.image && styles.inputError]}
            value={formData.image}
            onChangeText={(value) => updateFormData('image', value)}
            placeholder="https://example.com/image.jpg"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
          />
          {errors.image && <Text style={styles.errorText}>{errors.image}</Text>}
        </View>
      </View>

      {/* Seller Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Seller Information</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Seller Name *</Text>
          <TextInput
            style={[styles.input, errors.sellerName && styles.inputError]}
            value={formData.seller.name}
            onChangeText={(value) => updateFormData('name', value, 'seller')}
            placeholder="Enter seller name"
            placeholderTextColor={colors.textSecondary}
          />
          {errors.sellerName && <Text style={styles.errorText}>{errors.sellerName}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Certifications</Text>
          <View style={styles.certificationInput}>
            <TextInput
              style={[styles.input, styles.certificationTextInput]}
              value={certificationInput}
              onChangeText={setCertificationInput}
              placeholder="Add certification"
              placeholderTextColor={colors.textSecondary}
            />
            <TouchableOpacity style={styles.addButton} onPress={addCertification}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.certificationsList}>
            {formData.seller.certifications.map((cert, index) => (
              <View key={index} style={styles.certificationChip}>
                <Text style={styles.certificationText}>{cert}</Text>
                <TouchableOpacity onPress={() => removeCertification(index)}>
                  <Text style={styles.certificationRemove}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Sustainability Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sustainability Metrics</Text>
        
        {renderSlider(
          'Materials Score',
          formData.ecoMetrics.materialsScore,
          (value) => updateFormData('materialsScore', value, 'ecoMetrics')
        )}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Carbon Footprint (kg CO₂)</Text>
          <TextInput
            style={styles.input}
            value={formData.ecoMetrics.carbonFootprint.toString()}
            onChangeText={(value) => {
              const numValue = parseFloat(value) || 0;
              updateFormData('carbonFootprint', numValue, 'ecoMetrics');
            }}
            placeholder="0.0"
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
          />
        </View>

        {renderDropdown(
          'Packaging Type',
          formData.ecoMetrics.packagingType,
          PACKAGING_TYPES,
          (value) => updateFormData('packagingType', value, 'ecoMetrics'),
          showPackagingModal,
          setShowPackagingModal
        )}

        {renderDropdown(
          'Manufacturing Process',
          formData.ecoMetrics.manufacturingProcess,
          MANUFACTURING_PROCESSES,
          (value) => updateFormData('manufacturingProcess', value, 'ecoMetrics'),
          showManufacturingModal,
          setShowManufacturingModal
        )}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Product Lifespan (months)</Text>
          <TextInput
            style={styles.input}
            value={formData.ecoMetrics.productLifespan.toString()}
            onChangeText={(value) => {
              const numValue = parseInt(value) || 1;
              updateFormData('productLifespan', numValue, 'ecoMetrics');
            }}
            placeholder="12"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
          />
        </View>

        {renderSlider(
          'Recyclable Percentage',
          formData.ecoMetrics.recyclablePercentage,
          (value) => updateFormData('recyclablePercentage', value, 'ecoMetrics')
        )}

        {renderSlider(
          'Biodegradable Percentage',
          formData.ecoMetrics.biodegradablePercentage,
          (value) => updateFormData('biodegradablePercentage', value, 'ecoMetrics')
        )}

        {errors.ecoMetrics && (
          <Text style={styles.errorText}>{errors.ecoMetrics}</Text>
        )}
      </View>

      {/* Real-time Sustainability Score */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Real-time Sustainability Score</Text>
        <EcoScoreDisplay 
          score={sustainabilityScore}
          grade={sustainabilityGrade}
          ecoMetrics={formData.ecoMetrics}
          showBreakdown={true}
          size="large"
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
          <Text style={styles.clearButtonText}>Clear Form</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>
            {isEditing ? 'Update Product' : 'Add Product'}
          </Text>
        </TouchableOpacity>
      </View>

      {onCancel && (
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: theme.spacing.m,
  },
  
  section: {
    backgroundColor: colors.surface,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    ...theme.shadows.small,
  },
  
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: colors.text,
    marginBottom: theme.spacing.m,
  },
  
  inputContainer: {
    marginBottom: 16,
  },
  
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 6,
  },
  
  input: {
    ...theme.componentStyles.input.default,
  },
  
  inputError: {
    borderColor: colors.error,
  },
  
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  halfWidth: {
    width: '48%',
  },
  
  dropdownButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  
  dropdownText: {
    fontSize: 16,
    color: colors.text,
  },
  
  dropdownArrow: {
    fontSize: 12,
    color: colors.textSecondary,
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
  },
  
  modalOptionText: {
    fontSize: 16,
    color: colors.text,
  },
  
  certificationInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  certificationTextInput: {
    flex: 1,
    marginRight: 8,
    marginBottom: 0,
  },
  
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  
  addButtonText: {
    color: colors.textLight,
    fontWeight: '500',
  },
  
  certificationsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  
  certificationChip: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  
  certificationText: {
    color: colors.textLight,
    fontSize: 12,
    marginRight: 4,
  },
  
  certificationRemove: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  sliderContainer: {
    marginBottom: 16,
  },
  
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  sliderLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  
  sliderValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  
  sliderTrack: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    position: 'relative',
    marginBottom: 8,
  },
  
  sliderFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  
  sliderThumb: {
    position: 'absolute',
    top: -4,
    width: 14,
    height: 14,
    backgroundColor: colors.primary,
    borderRadius: 7,
    marginLeft: -7,
  },
  
  sliderButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  sliderButton: {
    backgroundColor: colors.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  sliderButtonText: {
    color: colors.textLight,
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  
  clearButton: {
    backgroundColor: colors.textSecondary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 0.45,
    alignItems: 'center',
  },
  
  clearButtonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
  
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 0.45,
    alignItems: 'center',
  },
  
  submitButtonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
  
  cancelButton: {
    backgroundColor: colors.error,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 32,
  },
  
  cancelButtonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
  
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
  },
});

export default ProductForm;
