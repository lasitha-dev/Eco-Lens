/**
 * GoalSetupScreen Component
 * Create or edit sustainability goals
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  TextInput,
  Alert,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuthLogin';
import SustainabilityGoalService from '../../api/sustainabilityGoalService';
import theme from '../../styles/theme';

const { width } = Dimensions.get('window');

// Available goal types
const GOAL_TYPES = [
  { value: 'grade-based', label: 'Grade-Based', description: 'Buy products with specific sustainability grades (A, B, C, etc.)' },
  { value: 'score-based', label: 'Score-Based', description: 'Buy products with minimum sustainability score' },
  { value: 'category-based', label: 'Category-Based', description: 'Buy sustainable products in specific categories' },
];

// Available grades for selection
const SUSTAINABILITY_GRADES = ['A', 'B', 'C', 'D', 'E', 'F'];

// Available categories
const PRODUCT_CATEGORIES = [
  'Electronics',
  'Fashion',
  'Home & Garden',
  'Food & Beverages',
  'Personal Care',
  'Sports & Outdoors',
  'Books & Stationery',
  'Toys & Games'
];

const GoalSetupScreen = ({ navigation, route }) => {
  const { auth } = useAuth();
  const { mode = 'create', goal = null, onGoalCreated, onGoalUpdated } = route.params || {};
  
  // Form state
  const [formData, setFormData] = useState({
    goalType: 'grade-based',
    title: '',
    description: '',
    goalConfig: {
      targetGrades: ['A', 'B'],
      minimumScore: 80,
      categories: [],
      percentage: 80
    }
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Load existing goal data if editing
  useEffect(() => {
    if (mode === 'edit' && goal) {
      setFormData({
        goalType: goal.goalType,
        title: goal.title,
        description: goal.description || '',
        goalConfig: {
          targetGrades: goal.goalConfig.targetGrades || ['A', 'B'],
          minimumScore: goal.goalConfig.minimumScore || 80,
          categories: goal.goalConfig.categories || [],
          percentage: goal.goalConfig.percentage || 80
        }
      });
    }
  }, [mode, goal]);

  // Update form data
  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Update goal config
  const updateGoalConfig = (field, value) => {
    setFormData(prev => ({
      ...prev,
      goalConfig: {
        ...prev.goalConfig,
        [field]: value
      }
    }));
  };

  // Toggle grade selection
  const toggleGrade = (grade) => {
    const currentGrades = formData.goalConfig.targetGrades;
    const newGrades = currentGrades.includes(grade)
      ? currentGrades.filter(g => g !== grade)
      : [...currentGrades, grade].sort();
    
    updateGoalConfig('targetGrades', newGrades);
  };

  // Toggle category selection
  const toggleCategory = (category) => {
    const currentCategories = formData.goalConfig.categories;
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    
    updateGoalConfig('categories', newCategories);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Goal title is required';
    }

    if (formData.goalConfig.percentage < 1 || formData.goalConfig.percentage > 100) {
      newErrors.percentage = 'Percentage must be between 1 and 100';
    }

    // Type-specific validation
    switch (formData.goalType) {
      case 'grade-based':
        if (formData.goalConfig.targetGrades.length === 0) {
          newErrors.targetGrades = 'Please select at least one sustainability grade';
        }
        break;
      
      case 'score-based':
        if (formData.goalConfig.minimumScore < 0 || formData.goalConfig.minimumScore > 100) {
          newErrors.minimumScore = 'Score must be between 0 and 100';
        }
        break;
      
      case 'category-based':
        if (formData.goalConfig.categories.length === 0) {
          newErrors.categories = 'Please select at least one category';
        }
        if (formData.goalConfig.targetGrades.length === 0) {
          newErrors.targetGrades = 'Please select at least one sustainability grade';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors and try again');
      return;
    }

    setLoading(true);
    
    try {
      const goalData = {
        goalType: formData.goalType,
        title: formData.title.trim(),
        description: formData.description.trim(),
        goalConfig: formData.goalConfig,
        isActive: true // Ensure newly created goals are active by default
      };

      if (mode === 'create') {
        const response = await SustainabilityGoalService.createGoal(goalData, auth);
        
        if (response.success) {
          Alert.alert('Success', 'Sustainability goal created successfully!', [
            {
              text: 'OK',
              onPress: () => {
                if (onGoalCreated) onGoalCreated(response.goal);
                navigation.goBack();
              }
            }
          ]);
        } else {
          Alert.alert('Error', response.error || 'Failed to create goal');
        }
      } else {
        const response = await SustainabilityGoalService.updateGoal(goal._id, goalData, auth);
        
        if (response.success) {
          Alert.alert('Success', 'Sustainability goal updated successfully!', [
            {
              text: 'OK',
              onPress: () => {
                if (onGoalUpdated) onGoalUpdated(response.goal);
                navigation.goBack();
              }
            }
          ]);
        } else {
          Alert.alert('Error', response.error || 'Failed to update goal');
        }
      }
    } catch (error) {
      console.error('Error saving goal:', error);
      Alert.alert('Error', 'Failed to save goal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render goal type selector
  const renderGoalTypeSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Goal Type</Text>
      <Text style={styles.sectionDescription}>Choose how you want to track your sustainability</Text>
      
      {GOAL_TYPES.map((type) => (
        <TouchableOpacity
          key={type.value}
          style={[
            styles.goalTypeCard,
            formData.goalType === type.value && styles.selectedGoalTypeCard
          ]}
          onPress={() => updateFormData('goalType', type.value)}
        >
          <View style={styles.goalTypeHeader}>
            <View style={styles.goalTypeInfo}>
              <Text style={[
                styles.goalTypeTitle,
                formData.goalType === type.value && styles.selectedGoalTypeTitle
              ]}>
                {type.label}
              </Text>
              <Text style={[
                styles.goalTypeDescription,
                formData.goalType === type.value && styles.selectedGoalTypeDescription
              ]}>
                {type.description}
              </Text>
            </View>
            <View style={[
              styles.goalTypeRadio,
              formData.goalType === type.value && styles.selectedGoalTypeRadio
            ]}>
              {formData.goalType === type.value && (
                <Ionicons name="checkmark" size={16} color={theme.colors.textOnPrimary} />
              )}
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Render goal configuration based on type
  const renderGoalConfiguration = () => {
    switch (formData.goalType) {
      case 'grade-based':
        return renderGradeBasedConfig();
      case 'score-based':
        return renderScoreBasedConfig();
      case 'category-based':
        return renderCategoryBasedConfig();
      default:
        return null;
    }
  };

  // Render grade-based configuration
  const renderGradeBasedConfig = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Target Sustainability Grades</Text>
      <Text style={styles.sectionDescription}>Select which grades you want to buy</Text>
      
      <View style={styles.gradeGrid}>
        {SUSTAINABILITY_GRADES.map((grade) => {
          const isSelected = formData.goalConfig.targetGrades.includes(grade);
          const gradeStyle = theme.getEcoGradeStyles(grade);
          
          return (
            <TouchableOpacity
              key={grade}
              style={[
                styles.gradeButton,
                { backgroundColor: gradeStyle.backgroundColor },
                isSelected && styles.selectedGradeButton
              ]}
              onPress={() => toggleGrade(grade)}
            >
              <Text style={[styles.gradeButtonText, { color: gradeStyle.color }]}>
                {grade}
              </Text>
              {isSelected && (
                <View style={styles.gradeCheckmark}>
                  <Ionicons name="checkmark" size={12} color={theme.colors.textOnPrimary} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      
      {errors.targetGrades && <Text style={styles.errorText}>{errors.targetGrades}</Text>}
    </View>
  );

  // Render score-based configuration
  const renderScoreBasedConfig = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Minimum Sustainability Score</Text>
      <Text style={styles.sectionDescription}>Set the minimum score (0-100) for products</Text>
      
      <View style={styles.scoreInputContainer}>
        <TextInput
          style={[styles.scoreInput, errors.minimumScore && styles.errorInput]}
          value={formData.goalConfig.minimumScore.toString()}
          onChangeText={(text) => {
            const score = parseInt(text) || 0;
            updateGoalConfig('minimumScore', Math.min(Math.max(score, 0), 100));
          }}
          keyboardType="numeric"
          placeholder="80"
          maxLength={3}
        />
        <Text style={styles.scoreUnit}>/ 100</Text>
      </View>
      
      <View style={styles.scoreSliderContainer}>
        <View style={styles.scoreSlider}>
          <View 
            style={[
              styles.scoreSliderFill,
              { width: `${formData.goalConfig.minimumScore}%` }
            ]} 
          />
        </View>
        <Text style={styles.scoreSliderText}>
          {formData.goalConfig.minimumScore}% minimum score
        </Text>
      </View>
      
      {errors.minimumScore && <Text style={styles.errorText}>{errors.minimumScore}</Text>}
    </View>
  );

  // Render category-based configuration
  const renderCategoryBasedConfig = () => (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Product Categories</Text>
        <Text style={styles.sectionDescription}>Select categories for your sustainable shopping</Text>
        
        <View style={styles.categoryGrid}>
          {PRODUCT_CATEGORIES.map((category) => {
            const isSelected = formData.goalConfig.categories.includes(category);
            
            return (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  isSelected && styles.selectedCategoryButton
                ]}
                onPress={() => toggleCategory(category)}
              >
                <Text style={[
                  styles.categoryButtonText,
                  isSelected && styles.selectedCategoryButtonText
                ]}>
                  {category}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark" size={16} color={theme.colors.textOnPrimary} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        
        {errors.categories && <Text style={styles.errorText}>{errors.categories}</Text>}
      </View>
      
      {renderGradeBasedConfig()}
    </>
  );

  // Render percentage setting
  const renderPercentageSetting = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Goal Target</Text>
      <Text style={styles.sectionDescription}>What percentage of your purchases should meet this goal?</Text>
      
      <View style={styles.percentageContainer}>
        <TextInput
          style={[styles.percentageInput, errors.percentage && styles.errorInput]}
          value={formData.goalConfig.percentage.toString()}
          onChangeText={(text) => {
            const percentage = parseInt(text) || 0;
            updateGoalConfig('percentage', Math.min(Math.max(percentage, 1), 100));
          }}
          keyboardType="numeric"
          placeholder="80"
          maxLength={3}
        />
        <Text style={styles.percentageUnit}>%</Text>
      </View>
      
      <View style={styles.percentageSliderContainer}>
        <View style={styles.percentageSlider}>
          <View 
            style={[
              styles.percentageSliderFill,
              { width: `${formData.goalConfig.percentage}%` }
            ]} 
          />
        </View>
        <Text style={styles.percentageSliderText}>
          {formData.goalConfig.percentage}% of your purchases
        </Text>
      </View>
      
      {errors.percentage && <Text style={styles.errorText}>{errors.percentage}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            {mode === 'create' ? 'Create Goal' : 'Edit Goal'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {mode === 'create' ? 'Set your sustainability target' : 'Update your goal settings'}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={theme.colors.textOnPrimary} />
          ) : (
            <Ionicons name="checkmark" size={24} color={theme.colors.textOnPrimary} />
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Goal Type Selection */}
          {renderGoalTypeSelector()}
          
          {/* Goal Configuration */}
          {renderGoalConfiguration()}
          
          {/* Percentage Setting */}
          {renderPercentageSetting()}
          
          {/* Goal Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Goal Details</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Goal Title *</Text>
              <TextInput
                style={[styles.textInput, errors.title && styles.errorInput]}
                value={formData.title}
                onChangeText={(text) => updateFormData('title', text)}
                placeholder="e.g., Only buy A/B rated products"
                maxLength={100}
              />
              {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => updateFormData('description', text)}
                placeholder="Add more details about your goal..."
                multiline
                numberOfLines={3}
                maxLength={300}
              />
            </View>
          </View>
          
          {/* Preview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Goal Preview</Text>
            <View style={styles.previewCard}>
              <Text style={styles.previewTitle}>
                {formData.title || 'Your Goal Title'}
              </Text>
              <Text style={styles.previewDescription}>
                {SustainabilityGoalService.generateGoalDescription(formData.goalType, formData.goalConfig)}
              </Text>
            </View>
          </View>
          
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    ...theme.shadows.small,
  },
  backButton: {
    padding: theme.spacing.s,
    marginRight: theme.spacing.s,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.h4,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.small,
  },
  disabledButton: {
    opacity: 0.6,
  },

  // Keyboard and Scroll Styles
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.m,
    paddingTop: theme.spacing.m,
  },
  bottomSpacer: {
    height: theme.spacing.xl,
  },

  // Section Styles
  section: {
    marginBottom: theme.spacing.l,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.h6,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  sectionDescription: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.m,
    lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.body2,
  },

  // Goal Type Selection Styles
  goalTypeCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.s,
    borderWidth: 2,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.small,
  },
  selectedGoalTypeCard: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  goalTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalTypeInfo: {
    flex: 1,
  },
  goalTypeTitle: {
    fontSize: theme.typography.fontSize.h6,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  selectedGoalTypeTitle: {
    color: theme.colors.primary,
  },
  goalTypeDescription: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.body2,
  },
  selectedGoalTypeDescription: {
    color: theme.colors.text,
  },
  goalTypeRadio: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.round,
    borderWidth: 2,
    borderColor: theme.colors.borderDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedGoalTypeRadio: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },

  // Grade Selection Styles
  gradeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.s,
  },
  gradeButton: {
    width: (width - theme.spacing.m * 2 - theme.spacing.s * 5) / 6,
    height: 48,
    borderRadius: theme.borderRadius.m,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.s,
    marginBottom: theme.spacing.s,
    position: 'relative',
    ...theme.shadows.small,
  },
  selectedGradeButton: {
    borderWidth: 2,
    borderColor: theme.colors.textOnPrimary,
  },
  gradeButtonText: {
    fontSize: theme.typography.fontSize.h6,
    fontWeight: theme.typography.fontWeight.bold,
  },
  gradeCheckmark: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: theme.colors.success,
    width: 16,
    height: 16,
    borderRadius: theme.borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Score Input Styles
  scoreInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  scoreInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    fontSize: theme.typography.fontSize.h4,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    minWidth: 80,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  scoreUnit: {
    fontSize: theme.typography.fontSize.h6,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.s,
  },
  scoreSliderContainer: {
    marginBottom: theme.spacing.s,
  },
  scoreSlider: {
    height: 8,
    backgroundColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.s,
    overflow: 'hidden',
    marginBottom: theme.spacing.xs,
  },
  scoreSliderFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.s,
  },
  scoreSliderText: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },

  // Category Selection Styles
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.s,
  },
  categoryButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    marginRight: theme.spacing.s,
    marginBottom: theme.spacing.s,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.small,
  },
  selectedCategoryButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryButtonText: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.text,
    marginRight: theme.spacing.xs,
  },
  selectedCategoryButtonText: {
    color: theme.colors.textOnPrimary,
  },

  // Percentage Input Styles
  percentageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  percentageInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    fontSize: theme.typography.fontSize.h4,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    minWidth: 80,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  percentageUnit: {
    fontSize: theme.typography.fontSize.h6,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.s,
  },
  percentageSliderContainer: {
    marginBottom: theme.spacing.s,
  },
  percentageSlider: {
    height: 8,
    backgroundColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.s,
    overflow: 'hidden',
    marginBottom: theme.spacing.xs,
  },
  percentageSliderFill: {
    height: '100%',
    backgroundColor: theme.colors.success,
    borderRadius: theme.borderRadius.s,
  },
  percentageSliderText: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },

  // Input Styles
  inputContainer: {
    marginBottom: theme.spacing.m,
  },
  inputLabel: {
    fontSize: theme.typography.fontSize.body2,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  textInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    fontSize: theme.typography.fontSize.body1,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  errorInput: {
    borderColor: theme.colors.error,
  },
  errorText: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },

  // Preview Styles
  previewCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.small,
  },
  previewTitle: {
    fontSize: theme.typography.fontSize.h6,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  previewDescription: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.body2,
  },
});

export default GoalSetupScreen;
