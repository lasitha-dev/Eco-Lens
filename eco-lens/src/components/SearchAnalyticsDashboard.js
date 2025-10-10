/**
 * Search Analytics Dashboard Component
 * Displays user search patterns, insights, and personalized tips
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import SearchAnalyticsService from '../api/searchAnalyticsService';
import EnhancedRecommendationService from '../api/enhancedRecommendationService';
import theme from '../styles/theme';

const { width: screenWidth } = Dimensions.get('window');

const SearchAnalyticsDashboard = ({ userId, authToken, onClose }) => {
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  useEffect(() => {
    loadSearchInsights();
  }, [selectedPeriod]);

  const loadSearchInsights = async () => {
    try {
      setIsLoading(true);
      const searchInsights = await EnhancedRecommendationService.getSearchBehaviorInsights(
        userId, 
        authToken, 
        selectedPeriod
      );
      setInsights(searchInsights);
    } catch (error) {
      console.error('Error loading search insights:', error);
      Alert.alert('Error', 'Failed to load search analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const renderBehaviorScore = () => {
    if (!insights?.behaviorScore) return null;

    const score = insights.behaviorScore;
    const getScoreColor = (score) => {
      if (score >= 80) return '#4CAF50';
      if (score >= 60) return '#8BC34A';
      if (score >= 40) return '#FFC107';
      return '#FF9800';
    };

    const getScoreLabel = (score) => {
      if (score >= 80) return 'Eco Expert';
      if (score >= 60) return 'Eco Enthusiast';
      if (score >= 40) return 'Eco Learner';
      return 'Getting Started';
    };

    return (
      <View style={styles.scoreCard}>
        <Text style={styles.scoreTitle}>Your Eco-Shopping Score</Text>
        <View style={styles.scoreContainer}>
          <View style={[styles.scoreCircle, { borderColor: getScoreColor(score) }]}>
            <Text style={[styles.scoreNumber, { color: getScoreColor(score) }]}>
              {score}
            </Text>
          </View>
          <View style={styles.scoreInfo}>
            <Text style={styles.scoreLabel}>{getScoreLabel(score)}</Text>
            <Text style={styles.scoreDescription}>
              Based on your search patterns and sustainability preferences
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderSearchPatterns = () => {
    if (!insights?.searchPatterns) return null;

    const { searchPatterns } = insights;
    const topCategories = Object.entries(searchPatterns.categoryFrequency || {})
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    return (
      <View style={styles.patternsCard}>
        <Text style={styles.cardTitle}>Your Search Patterns</Text>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Total Searches</Text>
          <Text style={styles.statValue}>{searchPatterns.totalSearches}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Categories Explored</Text>
          <Text style={styles.statValue}>{Object.keys(searchPatterns.categoryFrequency || {}).length}</Text>
        </View>

        {topCategories.length > 0 && (
          <View style={styles.categoriesSection}>
            <Text style={styles.sectionTitle}>Top Categories</Text>
            {topCategories.map(([category, count]) => (
              <View key={category} style={styles.categoryItem}>
                <Text style={styles.categoryName}>{category}</Text>
                <View style={styles.categoryBar}>
                  <View 
                    style={[
                      styles.categoryBarFill, 
                      { width: `${(count / topCategories[0][1]) * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.categoryCount}>{count}</Text>
              </View>
            ))}
          </View>
        )}

        {searchPatterns.topMaterials && searchPatterns.topMaterials.length > 0 && (
          <View style={styles.materialsSection}>
            <Text style={styles.sectionTitle}>Preferred Materials</Text>
            <View style={styles.materialsList}>
              {searchPatterns.topMaterials.slice(0, 3).map((material, index) => (
                <View key={index} style={styles.materialChip}>
                  <Text style={styles.materialText}>{material.material}</Text>
                  <Text style={styles.materialCount}>{material.count}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderPersonalizedTips = () => {
    if (!insights?.personalizedTips || insights.personalizedTips.length === 0) return null;

    return (
      <View style={styles.tipsCard}>
        <Text style={styles.cardTitle}>Personalized Tips</Text>
        {insights.personalizedTips.map((tip, index) => (
          <View key={index} style={styles.tipItem}>
            <Text style={styles.tipIcon}>{tip.icon}</Text>
            <Text style={styles.tipMessage}>{tip.message}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderRecentSearches = () => {
    if (!insights?.searchPatterns?.recentSearches || insights.searchPatterns.recentSearches.length === 0) return null;

    return (
      <View style={styles.recentSearchesCard}>
        <Text style={styles.cardTitle}>Recent Searches</Text>
        {insights.searchPatterns.recentSearches.slice(0, 5).map((search, index) => (
          <View key={index} style={styles.searchItem}>
            <Text style={styles.searchQuery}>{search.query}</Text>
            <Text style={styles.searchCategory}>{search.category || 'General'}</Text>
            <Text style={styles.searchTime}>
              {new Date(search.timestamp).toLocaleDateString()}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderTrendingSearches = () => {
    if (!insights?.trendingSearches || insights.trendingSearches.length === 0) return null;

    return (
      <View style={styles.trendingCard}>
        <Text style={styles.cardTitle}>Trending Searches</Text>
        {insights.trendingSearches.slice(0, 5).map((trend, index) => (
          <View key={index} style={styles.trendItem}>
            <Text style={styles.trendRank}>#{index + 1}</Text>
            <Text style={styles.trendQuery}>{trend.searchQuery}</Text>
            <Text style={styles.trendCount}>{trend.count} searches</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {[7, 30, 90].map((period) => (
        <TouchableOpacity
          key={period}
          style={[
            styles.periodButton,
            selectedPeriod === period && styles.periodButtonActive
          ]}
          onPress={() => setSelectedPeriod(period)}
        >
          <Text style={[
            styles.periodButtonText,
            selectedPeriod === period && styles.periodButtonTextActive
          ]}>
            {period} days
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading your search analytics...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Search Analytics</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      {renderPeriodSelector()}
      {renderBehaviorScore()}
      {renderSearchPatterns()}
      {renderPersonalizedTips()}
      {renderRecentSearches()}
      {renderTrendingSearches()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.m,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  
  title: {
    fontSize: theme.typography.fontSize.h3,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  
  closeButton: {
    padding: theme.spacing.s,
  },
  
  closeButtonText: {
    fontSize: 20,
    color: theme.colors.textSecondary,
  },
  
  periodSelector: {
    flexDirection: 'row',
    padding: theme.spacing.m,
    gap: theme.spacing.s,
  },
  
  periodButton: {
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.borderRadius.m,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  
  periodButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  
  periodButtonText: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.text,
  },
  
  periodButtonTextActive: {
    color: theme.colors.textOnPrimary,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xxxl,
  },
  
  loadingText: {
    marginTop: theme.spacing.m,
    fontSize: theme.typography.fontSize.body1,
    color: theme.colors.textSecondary,
  },
  
  // Score card styles
  scoreCard: {
    backgroundColor: theme.colors.surface,
    margin: theme.spacing.m,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.l,
    ...theme.shadows.medium,
  },
  
  scoreTitle: {
    fontSize: theme.typography.fontSize.h4,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.m,
  },
  
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.m,
  },
  
  scoreNumber: {
    fontSize: theme.typography.fontSize.h2,
    fontWeight: theme.typography.fontWeight.bold,
  },
  
  scoreInfo: {
    flex: 1,
  },
  
  scoreLabel: {
    fontSize: theme.typography.fontSize.h4,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  
  scoreDescription: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  
  // Card styles
  patternsCard: {
    backgroundColor: theme.colors.surface,
    margin: theme.spacing.m,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.l,
    ...theme.shadows.medium,
  },
  
  cardTitle: {
    fontSize: theme.typography.fontSize.h4,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.m,
  },
  
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  
  statLabel: {
    fontSize: theme.typography.fontSize.body1,
    color: theme.colors.text,
  },
  
  statValue: {
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.primary,
  },
  
  sectionTitle: {
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    marginTop: theme.spacing.m,
    marginBottom: theme.spacing.s,
  },
  
  categoriesSection: {
    marginTop: theme.spacing.m,
  },
  
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  
  categoryName: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.text,
    width: 100,
  },
  
  categoryBar: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.background,
    borderRadius: 4,
    marginHorizontal: theme.spacing.s,
  },
  
  categoryBarFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  
  categoryCount: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textSecondary,
    width: 30,
    textAlign: 'right',
  },
  
  materialsSection: {
    marginTop: theme.spacing.m,
  },
  
  materialsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.s,
  },
  
  materialChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.s,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  
  materialText: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.text,
    marginRight: theme.spacing.xs,
  },
  
  materialCount: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  
  // Tips card styles
  tipsCard: {
    backgroundColor: theme.colors.surface,
    margin: theme.spacing.m,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.l,
    ...theme.shadows.medium,
  },
  
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.s,
  },
  
  tipIcon: {
    fontSize: 20,
    marginRight: theme.spacing.s,
    marginTop: 2,
  },
  
  tipMessage: {
    flex: 1,
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.text,
    lineHeight: 20,
  },
  
  // Recent searches card styles
  recentSearchesCard: {
    backgroundColor: theme.colors.surface,
    margin: theme.spacing.m,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.l,
    ...theme.shadows.medium,
  },
  
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  
  searchQuery: {
    flex: 1,
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.text,
  },
  
  searchCategory: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textSecondary,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.s,
    marginRight: theme.spacing.s,
  },
  
  searchTime: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textSecondary,
  },
  
  // Trending card styles
  trendingCard: {
    backgroundColor: theme.colors.surface,
    margin: theme.spacing.m,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.l,
    ...theme.shadows.medium,
  },
  
  trendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  
  trendRank: {
    fontSize: theme.typography.fontSize.body2,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    width: 30,
  },
  
  trendQuery: {
    flex: 1,
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.text,
    marginLeft: theme.spacing.s,
  },
  
  trendCount: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textSecondary,
  },
});

export default SearchAnalyticsDashboard;
