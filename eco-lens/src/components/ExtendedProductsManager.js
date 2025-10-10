/**
 * Extended Products Management Component
 * Allows adding extended product dataset to test recommendation system
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useAuth } from '../hooks/useAuthLogin';
import ProductService from '../api/productService';
import { EXTENDED_MOCK_PRODUCTS } from '../constants/extendedMockData';
import theme from '../styles/theme';

const ExtendedProductsManager = ({ onProductsAdded }) => {
  const { auth, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentAction, setCurrentAction] = useState('');

  // Add products in batches
  const addExtendedProducts = async () => {
    if (!auth || !user) {
      Alert.alert('Error', 'Authentication required to add products');
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setCurrentAction('Adding products...');

    try {
      const batchSize = 5;
      const batches = [];
      
      // Split products into batches
      for (let i = 0; i < EXTENDED_MOCK_PRODUCTS.length; i += batchSize) {
        batches.push(EXTENDED_MOCK_PRODUCTS.slice(i, i + batchSize));
      }

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        setCurrentAction(`Adding batch ${i + 1}/${batches.length}...`);
        
        try {
          const response = await ProductService.createBulkProducts(batch);
          successCount += batch.length;
          console.log(`✅ Batch ${i + 1} successful: ${batch.length} products added`);
        } catch (error) {
          console.error(`❌ Batch ${i + 1} failed:`, error.message);
          errorCount += batch.length;
        }

        // Update progress
        setProgress(((i + 1) / batches.length) * 100);
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setCurrentAction('Complete!');
      
      Alert.alert(
        'Success!', 
        `Added ${successCount} products successfully!\n${errorCount > 0 ? `${errorCount} products failed.` : ''}`,
        [
          {
            text: 'OK',
            onPress: () => {
              if (onProductsAdded) {
                onProductsAdded();
              }
            }
          }
        ]
      );

    } catch (error) {
      console.error('Error adding products:', error);
      Alert.alert('Error', `Failed to add products: ${error.message}`);
    } finally {
      setIsLoading(false);
      setProgress(0);
      setCurrentAction('');
    }
  };

  // Add products individually (fallback method)
  const addProductsIndividually = async () => {
    if (!auth || !user) {
      Alert.alert('Error', 'Authentication required to add products');
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setCurrentAction('Adding products individually...');

    try {
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < EXTENDED_MOCK_PRODUCTS.length; i++) {
        const product = EXTENDED_MOCK_PRODUCTS[i];
        setCurrentAction(`Adding product ${i + 1}/${EXTENDED_MOCK_PRODUCTS.length}: ${product.name}`);
        
        try {
          await ProductService.createProduct(product);
          successCount++;
          console.log(`✅ Added: ${product.name}`);
        } catch (error) {
          console.error(`❌ Failed to add ${product.name}:`, error.message);
          errorCount++;
        }

        // Update progress
        setProgress(((i + 1) / EXTENDED_MOCK_PRODUCTS.length) * 100);
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      setCurrentAction('Complete!');
      
      Alert.alert(
        'Success!', 
        `Added ${successCount} products successfully!\n${errorCount > 0 ? `${errorCount} products failed.` : ''}`,
        [
          {
            text: 'OK',
            onPress: () => {
              if (onProductsAdded) {
                onProductsAdded();
              }
            }
          }
        ]
      );

    } catch (error) {
      console.error('Error adding products:', error);
      Alert.alert('Error', `Failed to add products: ${error.message}`);
    } finally {
      setIsLoading(false);
      setProgress(0);
      setCurrentAction('');
    }
  };

  // Show product statistics
  const showProductStats = () => {
    const categoryCount = {};
    const gradeCount = {};
    const priceRanges = { budget: 0, midRange: 0, premium: 0 };

    EXTENDED_MOCK_PRODUCTS.forEach(product => {
      categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
      gradeCount[product.sustainabilityGrade] = (gradeCount[product.sustainabilityGrade] || 0) + 1;
      
      if (product.price < 25) priceRanges.budget++;
      else if (product.price <= 50) priceRanges.midRange++;
      else priceRanges.premium++;
    });

    const statsText = `
📊 Extended Products Dataset Statistics:

📦 Total Products: ${EXTENDED_MOCK_PRODUCTS.length}

🏷️ By Category:
${Object.entries(categoryCount).map(([cat, count]) => `  • ${cat}: ${count}`).join('\n')}

🌱 By Sustainability Grade:
${Object.entries(gradeCount).map(([grade, count]) => `  • Grade ${grade}: ${count}`).join('\n')}

💰 By Price Range:
  • Budget (<$25): ${priceRanges.budget}
  • Mid-range ($25-$50): ${priceRanges.midRange}
  • Premium (>$50): ${priceRanges.premium}

🎯 Perfect for testing:
  • Personalized recommendations
  • Category-based filtering
  • Sustainability preferences
  • Price range preferences
  • Search behavior tracking
    `;

    Alert.alert('Product Dataset Statistics', statsText);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Extended Products Manager</Text>
        <Text style={styles.subtitle}>
          Add {EXTENDED_MOCK_PRODUCTS.length} diverse products to test the recommendation system
        </Text>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>Dataset Overview</Text>
        <Text style={styles.statText}>• {EXTENDED_MOCK_PRODUCTS.length} new products</Text>
        <Text style={styles.statText}>• 8 categories covered</Text>
        <Text style={styles.statText}>• All sustainability grades (A-F)</Text>
        <Text style={styles.statText}>• Budget to premium price ranges</Text>
        <Text style={styles.statText}>• Perfect for testing recommendations</Text>
      </View>

      {isLoading && (
        <View style={styles.progressCard}>
          <Text style={styles.progressText}>{currentAction}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={addExtendedProducts}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Adding Products...' : 'Add All Products (Bulk)'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={addProductsIndividually}
          disabled={isLoading}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            Add Products Individually
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.infoButton]}
          onPress={showProductStats}
          disabled={isLoading}
        >
          <Text style={[styles.buttonText, styles.infoButtonText]}>
            View Product Statistics
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Why Add These Products?</Text>
        <Text style={styles.infoText}>
          These products are specifically designed to test your personalized recommendation system:
        </Text>
        <Text style={styles.infoBullet}>• Diverse categories for better filtering</Text>
        <Text style={styles.infoBullet}>• Various sustainability grades for eco-preference testing</Text>
        <Text style={styles.infoBullet}>• Different price ranges for budget preference testing</Text>
        <Text style={styles.infoBullet}>• Realistic product data with proper eco-metrics</Text>
        <Text style={styles.infoBullet}>• Balanced distribution for accurate recommendations</Text>
      </View>

      <View style={styles.warningCard}>
        <Text style={styles.warningTitle}>⚠️ Important Notes</Text>
        <Text style={styles.warningText}>
          • Make sure you're logged in as an admin user
        </Text>
        <Text style={styles.warningText}>
          • The backend server must be running
        </Text>
        <Text style={styles.warningText}>
          • Products will be added to your database
        </Text>
        <Text style={styles.warningText}>
          • This process may take a few minutes
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.m,
  },
  
  header: {
    marginBottom: theme.spacing.l,
  },
  
  title: {
    fontSize: theme.typography.fontSize.h2,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
  },
  
  subtitle: {
    fontSize: theme.typography.fontSize.body1,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  
  statsCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.l,
    marginBottom: theme.spacing.m,
    ...theme.shadows.medium,
  },
  
  cardTitle: {
    fontSize: theme.typography.fontSize.h4,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
  },
  
  statText: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  
  progressCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.l,
    marginBottom: theme.spacing.m,
    ...theme.shadows.medium,
  },
  
  progressText: {
    fontSize: theme.typography.fontSize.body1,
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
    textAlign: 'center',
  },
  
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.background,
    borderRadius: 4,
    marginBottom: theme.spacing.s,
  },
  
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  
  progressPercent: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.primary,
    textAlign: 'center',
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  
  buttonContainer: {
    marginBottom: theme.spacing.l,
  },
  
  button: {
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.l,
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.s,
    alignItems: 'center',
  },
  
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  
  secondaryButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  
  infoButton: {
    backgroundColor: theme.colors.secondary,
  },
  
  buttonText: {
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.textOnPrimary,
  },
  
  secondaryButtonText: {
    color: theme.colors.primary,
  },
  
  infoButtonText: {
    color: theme.colors.textOnPrimary,
  },
  
  infoCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.l,
    marginBottom: theme.spacing.m,
    ...theme.shadows.medium,
  },
  
  infoTitle: {
    fontSize: theme.typography.fontSize.h4,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
  },
  
  infoText: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
    lineHeight: 20,
  },
  
  infoBullet: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    marginLeft: theme.spacing.s,
  },
  
  warningCard: {
    backgroundColor: '#FFF3CD',
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.l,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  
  warningTitle: {
    fontSize: theme.typography.fontSize.h4,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: '#856404',
    marginBottom: theme.spacing.s,
  },
  
  warningText: {
    fontSize: theme.typography.fontSize.body2,
    color: '#856404',
    marginBottom: theme.spacing.xs,
  },
});

export default ExtendedProductsManager;
