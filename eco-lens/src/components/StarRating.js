import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../styles/theme';

const StarRating = ({ 
  rating = 0, 
  maxRating = 5, 
  size = 16, 
  showText = true, 
  showCount = false,
  totalRatings = 0,
  interactive = false,
  onRatingChange,
  style,
  textStyle
}) => {
  const handleStarPress = (starValue) => {
    if (interactive && onRatingChange) {
      onRatingChange(starValue);
    }
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= maxRating; i++) {
      let starIcon = 'star-outline';
      let starColor = '#E0E0E0';

      if (i <= fullStars) {
        starIcon = 'star';
        starColor = '#FFD700';
      } else if (i === fullStars + 1 && hasHalfStar) {
        starIcon = 'star-half';
        starColor = '#FFD700';
      }

      const StarComponent = interactive ? TouchableOpacity : View;

      stars.push(
        <StarComponent
          key={i}
          onPress={interactive ? () => handleStarPress(i) : undefined}
          style={interactive ? styles.interactiveStar : styles.star}
          activeOpacity={interactive ? 0.7 : 1}
        >
          <Ionicons
            name={starIcon}
            size={size}
            color={starColor}
          />
        </StarComponent>
      );
    }

    return stars;
  };

  const getRatingText = () => {
    if (totalRatings === 0) {
      return 'No ratings';
    }

    const roundedRating = Math.round(rating * 10) / 10;
    const countText = showCount ? ` (${totalRatings})` : '';
    return `${roundedRating}${countText}`;
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.starsContainer}>
        {renderStars()}
      </View>
      {showText && (
        <Text style={[styles.ratingText, textStyle]}>
          {getRatingText()}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 2,
  },
  interactiveStar: {
    marginRight: 2,
    padding: 2,
  },
  ratingText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});

export default StarRating;
