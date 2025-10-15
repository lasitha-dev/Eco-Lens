/**
 * ProductCard Component
 * Displays product information in a card format with eco-grade
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import EcoGradeBadge from './EcoGradeBadge';
import FavoriteIcon from '../FavoriteIcon';
import StarRating from '../StarRating';
import theme from '../../styles/theme';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = (screenWidth - theme.spacing.m * 3) / 2;

const ProductCard = memo(({ 
  product, 
  onPress, 
  isListView = false,
  style 
}) => {
  const {
    name,
    image,
    price,
    sustainabilityGrade,
    sustainabilityScore,
    rating,
    reviewCount,
    category,
    seller,
  } = product;

  // Determine if it's an eco-friendly product (A or B grade)
  const isEcoFriendly = ['A', 'B'].includes(sustainabilityGrade);

  const renderGridView = () => (
    <TouchableOpacity
      style={[styles.gridCard, style]}
      onPress={() => onPress(product)}
      activeOpacity={0.7}
    >
      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: image }} 
          style={styles.gridImage}
          resizeMode="cover"
        />
        {/* Favorite Icon positioned on image */}
        <View style={styles.favoritePosition}>
          <FavoriteIcon product={product} size={20} />
        </View>
        {/* Eco Grade Badge positioned on image */}
        <View style={styles.badgePosition}>
          <EcoGradeBadge grade={sustainabilityGrade} size="small" />
        </View>
        {/* Eco-friendly indicator positioned on image */}
        {isEcoFriendly && (
          <View style={styles.ecoIndicator}>
            <Text style={styles.ecoIndicatorText}>ECO</Text>
          </View>
        )}
      </View>
      
      {/* Product Info */}
      <View style={styles.gridInfo}>
        <Text style={styles.category} numberOfLines={1}>
          {category}
        </Text>
        <Text style={styles.productName} numberOfLines={2}>
          {name}
        </Text>
        
        {/* Rating */}
        <View style={styles.ratingRow}>
          <StarRating 
            rating={rating} 
            totalRatings={reviewCount}
            size={14}
            showText={true}
            showCount={true}
          />
        </View>
        
        {/* Price and Score */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>${price.toFixed(2)}</Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Eco</Text>
            <Text style={styles.scoreValue}>{sustainabilityScore}%</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderListView = () => (
    <TouchableOpacity
      style={[styles.listCard, style]}
      onPress={() => onPress(product)}
      activeOpacity={0.7}
    >
      {/* Product Image */}
      <Image 
        source={{ uri: image }} 
        style={styles.listImage}
        resizeMode="cover"
      />
      
      {/* Product Info */}
      <View style={styles.listInfo}>
        <View style={styles.listHeader}>
          <View style={styles.listTitleRow}>
            <Text style={styles.productName} numberOfLines={2}>
              {name}
            </Text>
            <View style={styles.listBadges}>
              <FavoriteIcon product={product} size={20} style={styles.listFavoriteIcon} />
              <EcoGradeBadge grade={sustainabilityGrade} size="small" />
            </View>
          </View>
          <Text style={styles.category}>{category}</Text>
        </View>
        
        {/* Seller Info */}
        <Text style={styles.sellerName}>{seller.name}</Text>
        
        {/* Rating and Reviews */}
        <View style={styles.ratingRow}>
          <StarRating 
            rating={rating} 
            totalRatings={reviewCount}
            size={14}
            showText={true}
            showCount={true}
          />
        </View>
        
        {/* Price and Eco Score */}
        <View style={styles.listFooter}>
          <Text style={styles.price}>${price.toFixed(2)}</Text>
          <View style={styles.ecoScoreRow}>
            <Text style={styles.scoreLabel}>Eco Score:</Text>
            <Text style={[
              styles.scoreValue,
              { color: theme.getEcoGradeStyles(sustainabilityGrade).backgroundColor }
            ]}>
              {sustainabilityScore}%
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return isListView ? renderListView() : renderGridView();
});

const styles = StyleSheet.create({
  // Grid View Styles
  gridCard: {
    width: CARD_WIDTH,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.m,
    ...theme.shadows.card,
  },
  
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: CARD_WIDTH,
    borderTopLeftRadius: theme.borderRadius.m,
    borderTopRightRadius: theme.borderRadius.m,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  
  badgePosition: {
    position: 'absolute',
    top: theme.spacing.s,
    right: theme.spacing.s,
  },
  
  favoritePosition: {
    position: 'absolute',
    top: theme.spacing.s,
    left: theme.spacing.s,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: theme.spacing.xs,
  },
  
  ecoIndicator: {
    position: 'absolute',
    bottom: theme.spacing.s,
    left: theme.spacing.s,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.s,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.s,
    zIndex: 1,
  },
  
  ecoIndicatorText: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.typography.fontSize.tiny,
    fontWeight: theme.typography.fontWeight.bold,
  },
  
  gridInfo: {
    padding: theme.spacing.m,
  },
  
  // List View Styles
  listCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    marginHorizontal: theme.spacing.m,
    marginBottom: theme.spacing.m,
    padding: theme.spacing.m,
    ...theme.shadows.card,
  },
  
  listImage: {
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.m,
  },
  
  listInfo: {
    flex: 1,
    marginLeft: theme.spacing.m,
    justifyContent: 'space-between',
  },
  
  listHeader: {
    marginBottom: theme.spacing.xs,
  },
  
  listTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  
  listBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  listFavoriteIcon: {
    marginRight: theme.spacing.s,
  },
  
  listFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  
  // Common Styles
  category: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.xs,
  },
  
  productName: {
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    flex: 1,
  },
  
  sellerName: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  
  rating: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.text,
    marginRight: theme.spacing.xs,
  },
  
  reviewCount: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textSecondary,
  },
  
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  price: {
    fontSize: theme.typography.fontSize.h5,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  ecoScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  scoreLabel: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.xs,
  },
  
  scoreValue: {
    fontSize: theme.typography.fontSize.caption,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;