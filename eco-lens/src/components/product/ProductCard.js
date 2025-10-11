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
import { GoalCriteriaChipList } from '../goals/GoalCriteriaChip';
import SustainabilityGoalService from '../../api/sustainabilityGoalService';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../styles/theme';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = (screenWidth - theme.spacing.m * 3) / 2;

const ProductCard = memo(({ 
  product, 
  onPress, 
  isListView = false,
  activeGoals = [],
  onGoalPress,
  showGoalChips = true,
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

  // Calculate goal alignment for visual indicators
  const goalAlignment = activeGoals.length > 0 
    ? SustainabilityGoalService.checkProductMeetsGoals(product, activeGoals)
    : { meetsAnyGoal: false, matchingGoals: [], alignmentPercentage: 0 };

  // Get goal indicator styling
  const getGoalIndicatorStyle = () => {
    if (!activeGoals.length) return null;
    
    const { meetsAnyGoal, alignmentPercentage } = goalAlignment;
    
    if (alignmentPercentage === 100) {
      return {
        borderColor: theme.colors.success,
        borderWidth: 2,
        backgroundColor: theme.colors.success + '08',
        indicator: 'perfect-match'
      };
    } else if (meetsAnyGoal) {
      return {
        borderColor: theme.colors.success,
        borderWidth: 1,
        backgroundColor: theme.colors.success + '05',
        indicator: 'partial-match'
      };
    } else {
      return {
        borderColor: theme.colors.border,
        borderWidth: 1,
        backgroundColor: theme.colors.background,
        indicator: 'no-match'
      };
    }
  };

  // Get goal alignment icon
  const getGoalAlignmentIcon = () => {
    if (!activeGoals.length) return null;
    
    const { alignmentPercentage } = goalAlignment;
    
    if (alignmentPercentage === 100) {
      return { name: 'checkmark-circle', color: theme.colors.success, size: 16 };
    } else if (alignmentPercentage > 0) {
      return { name: 'checkmark-circle-outline', color: theme.colors.success, size: 16 };
    } else {
      return { name: 'close-circle-outline', color: theme.colors.textSecondary, size: 16 };
    }
  };

  const goalIndicatorStyle = getGoalIndicatorStyle();
  const goalAlignmentIcon = getGoalAlignmentIcon();

  const renderGridView = () => (
    <TouchableOpacity
      style={[
        styles.gridCard, 
        goalIndicatorStyle ? {
          borderColor: goalIndicatorStyle.borderColor,
          borderWidth: goalIndicatorStyle.borderWidth,
          backgroundColor: goalIndicatorStyle.backgroundColor,
        } : {},
        style
      ]}
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
        {/* Goal Alignment Indicator */}
        {goalAlignmentIcon && (
          <View style={styles.goalAlignmentBadge}>
            <Ionicons 
              name={goalAlignmentIcon.name} 
              size={goalAlignmentIcon.size} 
              color={goalAlignmentIcon.color} 
            />
          </View>
        )}
        {/* Eco-friendly indicator positioned on image */}
        {isEcoFriendly && (
          <View style={styles.ecoIndicator}>
            <Text style={styles.ecoIndicatorText}>ECO</Text>
          </View>
        )}
        {/* Perfect Goal Match Badge */}
        {goalIndicatorStyle?.indicator === 'perfect-match' && (
          <View style={styles.perfectMatchBadge}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.perfectMatchText}>Goals</Text>
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
          <Text style={styles.rating}>⭐ {rating}</Text>
          <Text style={styles.reviewCount}>({reviewCount})</Text>
        </View>
        
        {/* Price and Score */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>${price.toFixed(2)}</Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Eco</Text>
            <Text style={styles.scoreValue}>{sustainabilityScore}%</Text>
          </View>
        </View>

        {/* Goal Criteria Chips */}
        {showGoalChips && activeGoals.length > 0 && (
          <View style={styles.goalChipsContainer}>
            <GoalCriteriaChipList
              goals={activeGoals}
              product={product}
              maxVisible={2}
              size="small"
              onGoalPress={onGoalPress}
              style={styles.goalChipsList}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderListView = () => (
    <TouchableOpacity
      style={[
        styles.listCard, 
        goalIndicatorStyle ? {
          borderColor: goalIndicatorStyle.borderColor,
          borderWidth: goalIndicatorStyle.borderWidth,
          backgroundColor: goalIndicatorStyle.backgroundColor,
        } : {},
        style
      ]}
      onPress={() => onPress(product)}
      activeOpacity={0.7}
    >
      {/* Product Image */}
      <View style={styles.listImageContainer}>
        <Image 
          source={{ uri: image }} 
          style={styles.listImage}
          resizeMode="cover"
        />
        {/* Goal Alignment Corner Badge */}
        {goalAlignmentIcon && (
          <View style={styles.listGoalAlignmentBadge}>
            <Ionicons 
              name={goalAlignmentIcon.name} 
              size={goalAlignmentIcon.size} 
              color={goalAlignmentIcon.color} 
            />
          </View>
        )}
        {/* Perfect Goal Match Corner Badge */}
        {goalIndicatorStyle?.indicator === 'perfect-match' && (
          <View style={styles.listPerfectMatchBadge}>
            <Ionicons name="star" size={10} color="#FFD700" />
          </View>
        )}
      </View>
      
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
          <Text style={styles.rating}>⭐ {rating}</Text>
          <Text style={styles.reviewCount}>({reviewCount} reviews)</Text>
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

        {/* Goal Criteria Chips */}
        {showGoalChips && activeGoals.length > 0 && (
          <View style={styles.goalChipsContainer}>
            <GoalCriteriaChipList
              goals={activeGoals}
              product={product}
              maxVisible={3}
              size="small"
              onGoalPress={onGoalPress}
              style={styles.goalChipsList}
            />
          </View>
        )}
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

  // Goal Chips Styles
  goalChipsContainer: {
    marginTop: theme.spacing.xs,
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border + '50',
  },

  goalChipsList: {
    flexWrap: 'wrap',
  },

  // Goal Indicator Styles
  goalAlignmentBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.small,
  },

  perfectMatchBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: '#FFD700',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.small,
  },

  perfectMatchText: {
    fontSize: 8,
    fontWeight: theme.typography.fontWeight.bold,
    color: '#333',
    marginLeft: 2,
  },

  // List view goal indicator styles
  listImageContainer: {
    position: 'relative',
  },

  listGoalAlignmentBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: theme.colors.background,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.small,
  },

  listPerfectMatchBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#FFD700',
    borderRadius: 6,
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.small,
  },
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;