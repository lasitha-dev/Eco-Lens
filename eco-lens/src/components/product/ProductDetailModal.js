/**
 * Product Detail Modal Component
 * Displays detailed product information with eco-metrics
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import EcoGradeBadge from './EcoGradeBadge';
import FavoriteIcon from '../FavoriteIcon';
import StarRating from '../StarRating';
import theme from '../../styles/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ProductDetailModal = ({ 
  visible, 
  product, 
  onClose,
  onAddToCart,
  navigation 
}) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const {
    name,
    description,
    price,
    category,
    image,
    stock,
    ecoMetrics,
    sustainabilityGrade,
    sustainabilityScore,
    seller,
    rating,
    reviewCount,
  } = product;

  // Calculate eco-metrics percentages for visualization
  const getMetricColor = (value, reverse = false) => {
    const score = reverse ? 100 - value : value;
    if (score >= 80) return theme.colors.gradeA;
    if (score >= 60) return theme.colors.gradeB;
    if (score >= 40) return theme.colors.gradeC;
    if (score >= 20) return theme.colors.gradeD;
    return theme.colors.gradeF;
  };

  const renderEcoMetric = (label, value, unit = '%', reverse = false) => (
    <View style={styles.metricItem}>
      <Text style={styles.metricLabel}>{label}</Text>
      <View style={styles.metricBarContainer}>
        <View 
          style={[
            styles.metricBar,
            { 
              width: `${typeof value === 'number' ? Math.min(value, 100) : 0}%`,
              backgroundColor: getMetricColor(value, reverse)
            }
          ]}
        />
      </View>
      <Text style={styles.metricValue}>{value}{unit}</Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product Details</Text>
          <View style={styles.headerActions}>
            <FavoriteIcon product={product} size={28} />
          </View>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Product Images */}
          <View style={styles.imageSection}>
            <Image 
              source={{ uri: image }} 
              style={styles.mainImage}
              resizeMode="cover"
            />
            <View style={styles.imageBadge}>
              <EcoGradeBadge 
                grade={sustainabilityGrade} 
                size="large"
                showLabel={true}
              />
            </View>
          </View>

          {/* Product Info */}
          <View style={styles.infoSection}>
            <Text style={styles.category}>{category.toUpperCase()}</Text>
            <Text style={styles.productName}>{name}</Text>
            
            {/* Rating */}
            <TouchableOpacity 
              style={styles.ratingRow} 
              onPress={() => {
                if (navigation) {
                  navigation.navigate('ProductReviews', { product });
                }
              }}
            >
              <StarRating
                rating={product.ratingStats?.averageRating || rating || 0}
                totalRatings={product.ratingStats?.totalRatings || reviewCount || 0}
                size={18}
                showText={true}
                showCount={true}
              />
              <Text style={styles.viewReviewsText}>View Reviews →</Text>
            </TouchableOpacity>

            {/* Price */}
            <View style={styles.priceRow}>
              <Text style={styles.price}>${price.toFixed(2)}</Text>
              <Text style={styles.stockStatus}>
                {stock > 0 ? `${stock} in stock` : 'Out of stock'}
              </Text>
            </View>

            {/* Description */}
            <Text style={styles.sectionTitle}>About this product</Text>
            <Text style={styles.description}>{description}</Text>

            {/* Seller Info */}
            <View style={styles.sellerSection}>
              <Text style={styles.sectionTitle}>Sold by</Text>
              <Text style={styles.sellerName}>{seller.name}</Text>
              {seller.certifications && seller.certifications.length > 0 && (
                <View style={styles.certifications}>
                  {seller.certifications.map((cert, index) => (
                    <View key={index} style={styles.certBadge}>
                      <Text style={styles.certText}>✓ {cert}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Eco Score Section */}
            <View style={styles.ecoSection}>
              <Text style={styles.sectionTitle}>Sustainability Analysis</Text>
              
              {/* Overall Score */}
              <View style={styles.overallScore}>
                <Text style={styles.scoreTitle}>Eco Score</Text>
                <Text style={[
                  styles.scoreValue,
                  { color: theme.getEcoGradeStyles(sustainabilityGrade).backgroundColor }
                ]}>
                  {sustainabilityScore}%
                </Text>
              </View>

              {/* Detailed Metrics */}
              <View style={styles.metricsContainer}>
                {renderEcoMetric('Materials Score', ecoMetrics.materialsScore)}
                {renderEcoMetric('Recyclable', ecoMetrics.recyclablePercentage)}
                {renderEcoMetric('Biodegradable', ecoMetrics.biodegradablePercentage)}
                
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Carbon Footprint</Text>
                  <Text style={styles.carbonValue}>
                    {ecoMetrics.carbonFootprint} kg CO₂
                  </Text>
                </View>

                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Packaging</Text>
                  <View style={styles.packagingBadge}>
                    <Text style={styles.packagingText}>
                      {ecoMetrics.packagingType.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Manufacturing</Text>
                  <Text style={styles.manufacturingText}>
                    {ecoMetrics.manufacturingProcess.replace('-', ' ')}
                  </Text>
                </View>

                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Product Lifespan</Text>
                  <Text style={styles.lifespanText}>
                    {ecoMetrics.productLifespan} months
                  </Text>
                </View>
              </View>
            </View>

            {/* Quantity Selector */}
            <View style={styles.quantitySection}>
              <Text style={styles.sectionTitle}>Quantity</Text>
              <View style={styles.quantitySelector}>
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Text style={styles.quantityButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={() => setQuantity(Math.min(stock, quantity + 1))}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Action Bar */}
        <View style={styles.actionBar}>
          <TouchableOpacity 
            style={styles.addToCartButton}
            onPress={() => onAddToCart && onAddToCart(product, quantity)}
            disabled={stock === 0}
          >
            <Text style={styles.addToCartText}>
              {stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
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
  
  closeButton: {
    padding: theme.spacing.s,
  },
  
  closeText: {
    fontSize: 24,
    color: theme.colors.text,
  },
  
  headerTitle: {
    fontSize: theme.typography.fontSize.h5,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
  },
  
  headerActions: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  scrollContent: {
    paddingBottom: 100,
  },
  
  imageSection: {
    position: 'relative',
    backgroundColor: theme.colors.surface,
  },
  
  mainImage: {
    width: screenWidth,
    height: screenWidth,
  },
  
  imageBadge: {
    position: 'absolute',
    top: theme.spacing.m,
    right: theme.spacing.m,
  },
  
  infoSection: {
    padding: theme.spacing.m,
    backgroundColor: theme.colors.surface,
  },
  
  category: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textSecondary,
    letterSpacing: 1,
    marginBottom: theme.spacing.xs,
  },
  
  productName: {
    fontSize: theme.typography.fontSize.h3,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
  },
  
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.m,
  },
  
  rating: {
    fontSize: theme.typography.fontSize.body1,
    color: theme.colors.text,
    marginRight: theme.spacing.s,
  },
  
  reviewCount: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.textSecondary,
  },
  
  viewReviewsText: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.l,
  },
  
  price: {
    fontSize: theme.typography.fontSize.h2,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  
  stockStatus: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.textSecondary,
  },
  
  sectionTitle: {
    fontSize: theme.typography.fontSize.h5,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    marginTop: theme.spacing.l,
    marginBottom: theme.spacing.m,
  },
  
  description: {
    fontSize: theme.typography.fontSize.body1,
    color: theme.colors.text,
    lineHeight: theme.typography.fontSize.body1 * theme.typography.lineHeight.relaxed,
  },
  
  sellerSection: {
    marginTop: theme.spacing.l,
  },
  
  sellerName: {
    fontSize: theme.typography.fontSize.body1,
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
  },
  
  certifications: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.s,
  },
  
  certBadge: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.s,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.s,
    marginRight: theme.spacing.s,
    marginBottom: theme.spacing.s,
  },
  
  certText: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textOnPrimary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  
  ecoSection: {
    marginTop: theme.spacing.l,
    padding: theme.spacing.m,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.m,
  },
  
  overallScore: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.l,
    paddingBottom: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  
  scoreTitle: {
    fontSize: theme.typography.fontSize.h4,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
  },
  
  scoreValue: {
    fontSize: theme.typography.fontSize.h2,
    fontWeight: theme.typography.fontWeight.bold,
  },
  
  metricsContainer: {
    marginTop: theme.spacing.m,
  },
  
  metricItem: {
    marginBottom: theme.spacing.m,
  },
  
  metricLabel: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  
  metricBarContainer: {
    height: 8,
    backgroundColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.s,
    overflow: 'hidden',
    marginBottom: theme.spacing.xs,
  },
  
  metricBar: {
    height: '100%',
    borderRadius: theme.borderRadius.s,
  },
  
  metricValue: {
    fontSize: theme.typography.fontSize.caption,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
  },
  
  carbonValue: {
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.warning,
  },
  
  packagingBadge: {
    backgroundColor: theme.colors.secondaryLight,
    paddingHorizontal: theme.spacing.s,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.s,
    alignSelf: 'flex-start',
  },
  
  packagingText: {
    fontSize: theme.typography.fontSize.caption,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
  },
  
  manufacturingText: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.text,
    textTransform: 'capitalize',
  },
  
  lifespanText: {
    fontSize: theme.typography.fontSize.body2,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.primary,
  },
  
  quantitySection: {
    marginTop: theme.spacing.l,
  },
  
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  
  quantityButton: {
    width: 40,
    height: 40,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  
  quantityButtonText: {
    fontSize: 24,
    color: theme.colors.text,
  },
  
  quantityText: {
    fontSize: theme.typography.fontSize.h5,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    marginHorizontal: theme.spacing.l,
  },
  
  actionBar: {
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
  
  addToCartButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
  },
  
  addToCartText: {
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.textOnPrimary,
  },
});

export default ProductDetailModal;