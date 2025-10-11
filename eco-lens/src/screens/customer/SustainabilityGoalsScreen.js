/**
 * SustainabilityGoalsScreen Component
 * Displays and manages user's sustainability goals
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Alert,
  Dimensions,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuthLogin';
import SustainabilityGoalService from '../../api/sustainabilityGoalService';
import theme from '../../styles/theme';

const { width: screenWidth } = Dimensions.get('window');

const SustainabilityGoalsScreen = ({ navigation }) => {
  const { auth, user } = useAuth();
  
  // State management
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [goalStats, setGoalStats] = useState(null);
  
  // Animation for empty state
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Load goals on component mount
  useEffect(() => {
    loadGoals();
    loadGoalStats();
  }, []);

  // Animate empty state
  useEffect(() => {
    if (!loading && goals.length === 0) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [loading, goals.length]);

  // Load goals from API
  const loadGoals = async () => {
    if (!auth) return;
    
    try {
      setError(null);
      const response = await SustainabilityGoalService.getUserGoals(auth);
      
      if (response.success) {
        setGoals(response.goals || []);
      } else {
        setError(response.error || 'Failed to load goals');
      }
    } catch (error) {
      console.error('Error loading goals:', error);
      setError('Failed to load sustainability goals');
    } finally {
      setLoading(false);
    }
  };

  // Load goal statistics
  const loadGoalStats = async () => {
    if (!auth) return;
    
    try {
      const response = await SustainabilityGoalService.getGoalStats(auth);
      if (response.success) {
        setGoalStats(response.stats);
      }
    } catch (error) {
      console.error('Error loading goal stats:', error);
    }
  };

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadGoals(), loadGoalStats()]);
    setRefreshing(false);
  }, [auth]);

  // Handle goal deletion
  const handleDeleteGoal = (goal) => {
    Alert.alert(
      'Delete Goal',
      `Are you sure you want to delete "${goal.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => performDeleteGoal(goal._id)
        },
      ]
    );
  };

  // Perform goal deletion
  const performDeleteGoal = async (goalId) => {
    try {
      const response = await SustainabilityGoalService.deleteGoal(goalId, auth);
      
      if (response.success) {
        setGoals(goals.filter(goal => goal._id !== goalId));
        loadGoalStats(); // Refresh stats
        Alert.alert('Success', 'Goal deleted successfully!');
      } else {
        Alert.alert('Error', response.error || 'Failed to delete goal');
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
      Alert.alert('Error', 'Failed to delete goal. Please try again.');
    }
  };

  // Handle goal toggle (activate/deactivate)
  const handleToggleGoal = async (goal) => {
    try {
      const response = await SustainabilityGoalService.updateGoal(
        goal._id, 
        { isActive: !goal.isActive }, 
        auth
      );
      
      if (response.success) {
        setGoals(goals.map(g => 
          g._id === goal._id ? { ...g, isActive: !g.isActive } : g
        ));
        loadGoalStats(); // Refresh stats
      } else {
        Alert.alert('Error', response.error || 'Failed to update goal');
      }
    } catch (error) {
      console.error('Error toggling goal:', error);
      Alert.alert('Error', 'Failed to update goal. Please try again.');
    }
  };

  // Navigate to goal setup screen
  const handleCreateGoal = () => {
    navigation.navigate('GoalSetup', {
      mode: 'create',
      onGoalCreated: (newGoal) => {
        setGoals([newGoal, ...goals]);
        loadGoalStats();
      }
    });
  };

  // Navigate to goal edit screen
  const handleEditGoal = (goal) => {
    navigation.navigate('GoalSetup', {
      mode: 'edit',
      goal: goal,
      onGoalUpdated: (updatedGoal) => {
        setGoals(goals.map(g => g._id === updatedGoal._id ? updatedGoal : g));
        loadGoalStats();
      }
    });
  };

  // Navigate to goal progress detail
  const handleViewProgress = (goal) => {
    navigation.navigate('GoalProgress', { goal });
  };

  // Render goal card
  const renderGoalCard = ({ item: goal }) => {
    const progressColor = SustainabilityGoalService.getGoalProgressColor(
      goal.progress.currentPercentage, 
      goal.goalConfig.percentage
    );
    const progressStatus = SustainabilityGoalService.getGoalProgressStatus(
      goal.progress.currentPercentage, 
      goal.goalConfig.percentage
    );

    return (
      <TouchableOpacity 
        style={[styles.goalCard, !goal.isActive && styles.inactiveGoalCard]}
        onPress={() => handleViewProgress(goal)}
        activeOpacity={0.7}
      >
        {/* Goal Header */}
        <View style={styles.goalHeader}>
          <View style={styles.goalTitleContainer}>
            <Text style={styles.goalTitle} numberOfLines={2}>
              {goal.title}
            </Text>
            <View style={[styles.goalTypeBadge, getGoalTypeBadgeStyle(goal.goalType)]}>
              <Text style={styles.goalTypeBadgeText}>
                {getGoalTypeLabel(goal.goalType)}
              </Text>
            </View>
          </View>
          
          <View style={styles.goalActions}>
            <TouchableOpacity 
              onPress={() => handleToggleGoal(goal)}
              style={styles.actionButton}
            >
              <Ionicons 
                name={goal.isActive ? "pause-circle" : "play-circle"} 
                size={24} 
                color={goal.isActive ? theme.colors.warning : theme.colors.success} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => handleEditGoal(goal)}
              style={styles.actionButton}
            >
              <Ionicons name="pencil" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => handleDeleteGoal(goal)}
              style={styles.actionButton}
            >
              <Ionicons name="trash" size={20} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              {goal.progress.currentPercentage}% of {goal.goalConfig.percentage}% target
            </Text>
            <Text style={[styles.progressStatus, { color: progressColor }]}>
              {progressStatus}
            </Text>
          </View>
          
          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { 
                    width: `${Math.min(goal.progress.currentPercentage / goal.goalConfig.percentage * 100, 100)}%`,
                    backgroundColor: progressColor 
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressPercentage}>
              {Math.round(goal.progress.currentPercentage / goal.goalConfig.percentage * 100)}%
            </Text>
          </View>
        </View>

        {/* Goal Details */}
        <View style={styles.goalDetails}>
          <Text style={styles.goalDescription} numberOfLines={2}>
            {goal.description || SustainabilityGoalService.generateGoalDescription(goal.goalType, goal.goalConfig)}
          </Text>
          <Text style={styles.goalStats}>
            {goal.progress.goalMetPurchases} of {goal.progress.totalPurchases} purchases meet goal
          </Text>
        </View>

        {/* Achievement Badge */}
        {goal.progress.currentPercentage >= goal.goalConfig.percentage && (
          <View style={styles.achievementBadge}>
            <Ionicons name="trophy" size={16} color={theme.colors.accent} />
            <Text style={styles.achievementText}>Goal Achieved!</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Get goal type badge style
  const getGoalTypeBadgeStyle = (goalType) => {
    const styles = {
      'grade-based': { backgroundColor: theme.colors.primary },
      'score-based': { backgroundColor: theme.colors.info },
      'category-based': { backgroundColor: theme.colors.secondary },
    };
    return styles[goalType] || { backgroundColor: theme.colors.textSecondary };
  };

  // Get goal type label
  const getGoalTypeLabel = (goalType) => {
    const labels = {
      'grade-based': 'Grade',
      'score-based': 'Score',
      'category-based': 'Category',
    };
    return labels[goalType] || 'Custom';
  };

  // Render stats header
  const renderStatsHeader = () => {
    if (!goalStats) return null;

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Your Goal Statistics</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{goalStats.activeGoals}</Text>
            <Text style={styles.statLabel}>Active Goals</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{goalStats.achievedGoals}</Text>
            <Text style={styles.statLabel}>Achieved</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{goalStats.averageProgress}%</Text>
            <Text style={styles.statLabel}>Avg Progress</Text>
          </View>
        </View>
      </View>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <Animated.View style={[styles.emptyState, { opacity: fadeAnim }]}>
      <Ionicons name="leaf-outline" size={80} color={theme.colors.textLight} />
      <Text style={styles.emptyTitle}>No Sustainability Goals Yet</Text>
      <Text style={styles.emptyDescription}>
        Create your first goal to start tracking your sustainable shopping journey!
      </Text>
      <TouchableOpacity style={styles.createFirstGoalButton} onPress={handleCreateGoal}>
        <Ionicons name="add-circle" size={24} color={theme.colors.textOnPrimary} />
        <Text style={styles.createFirstGoalButtonText}>Create Your First Goal</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  // Render error state
  const renderErrorState = () => (
    <View style={styles.errorState}>
      <Ionicons name="alert-circle-outline" size={64} color={theme.colors.error} />
      <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
      <Text style={styles.errorDescription}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={loadGoals}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  // Show loading spinner
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading your sustainability goals...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.headerTitle}>Sustainability Goals</Text>
          <Text style={styles.headerSubtitle}>Track your eco-friendly progress</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleCreateGoal}
        >
          <Ionicons name="add" size={28} color={theme.colors.textOnPrimary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {error ? renderErrorState() : (
        <FlatList
          data={goals}
          renderItem={renderGoalCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={[
            styles.listContainer,
            goals.length === 0 && styles.emptyListContainer
          ]}
          ListHeaderComponent={renderStatsHeader}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
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
  addButton: {
    backgroundColor: theme.colors.primary,
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.small,
  },

  // Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  loadingText: {
    marginTop: theme.spacing.m,
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },

  // List Styles
  listContainer: {
    padding: theme.spacing.m,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  // Stats Header Styles
  statsContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    ...theme.shadows.card,
  },
  statsTitle: {
    fontSize: theme.typography.fontSize.h6,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: theme.typography.fontSize.h3,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },

  // Goal Card Styles
  goalCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    ...theme.shadows.card,
  },
  inactiveGoalCard: {
    opacity: 0.7,
    backgroundColor: theme.colors.surfaceVariant,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.s,
  },
  goalTitleContainer: {
    flex: 1,
    marginRight: theme.spacing.s,
  },
  goalTitle: {
    fontSize: theme.typography.fontSize.h6,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  goalTypeBadge: {
    paddingHorizontal: theme.spacing.s,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.m,
    alignSelf: 'flex-start',
  },
  goalTypeBadgeText: {
    fontSize: theme.typography.fontSize.caption,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textOnPrimary,
  },
  goalActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },

  // Progress Styles
  progressSection: {
    marginBottom: theme.spacing.s,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  progressText: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.text,
  },
  progressStatus: {
    fontSize: theme.typography.fontSize.body2,
    fontWeight: theme.typography.fontWeight.medium,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.s,
    overflow: 'hidden',
    marginRight: theme.spacing.s,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: theme.borderRadius.s,
  },
  progressPercentage: {
    fontSize: theme.typography.fontSize.caption,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSecondary,
    minWidth: 35,
    textAlign: 'right',
  },

  // Goal Details Styles
  goalDetails: {
    marginBottom: theme.spacing.s,
  },
  goalDescription: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.body2,
    marginBottom: theme.spacing.xs,
  },
  goalStats: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textLight,
  },

  // Achievement Badge Styles
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.accent + '20',
    paddingHorizontal: theme.spacing.s,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.m,
    alignSelf: 'flex-start',
  },
  achievementText: {
    fontSize: theme.typography.fontSize.caption,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.accent,
    marginLeft: theme.spacing.xs,
  },

  // Empty State Styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.h4,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.m,
    marginBottom: theme.spacing.s,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.body2,
    marginBottom: theme.spacing.l,
  },
  createFirstGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.l,
    ...theme.shadows.medium,
  },
  createFirstGoalButtonText: {
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textOnPrimary,
    marginLeft: theme.spacing.s,
  },

  // Error State Styles
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  errorTitle: {
    fontSize: theme.typography.fontSize.h4,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.m,
    marginBottom: theme.spacing.s,
    textAlign: 'center',
  },
  errorDescription: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.body2,
    marginBottom: theme.spacing.l,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.l,
  },
  retryButtonText: {
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textOnPrimary,
  },
});

export default SustainabilityGoalsScreen;
