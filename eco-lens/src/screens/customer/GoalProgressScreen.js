/**
 * GoalProgressScreen Component
 * Display detailed progress tracking and analytics for a specific sustainability goal
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../styles/theme';
import { useAuth } from '../../hooks/useAuthLogin';
import { useRealtimeGoals } from '../../contexts/RealtimeGoalContext';
import SustainabilityGoalService from '../../api/sustainabilityGoalService';
import AnimatedProgressBar from '../../components/goals/AnimatedProgressBar';

const { width: screenWidth } = Dimensions.get('window');

const GoalProgressScreen = ({ route, navigation }) => {
  const { goal: initialGoal } = route.params;
  const { auth } = useAuth();
  const { triggerCustomAchievement } = useRealtimeGoals();
  
  // State management
  const [goal, setGoal] = useState(initialGoal);
  const [detailedProgress, setDetailedProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [previousProgress, setPreviousProgress] = useState(initialGoal?.progress?.currentPercentage || 0);
  
  // Animation values
  const progressAnimation = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchGoalProgress();
  }, []);

  // Animate progress when data loads
  useEffect(() => {
    if (detailedProgress) {
      const targetProgress = Math.min(
        detailedProgress.currentPercentage / goal.goalConfig.percentage, 
        1
      );
      
      Animated.spring(progressAnimation, {
        toValue: targetProgress,
        useNativeDriver: false,
        tension: 50,
        friction: 8,
      }).start();
    }
  }, [detailedProgress]);

  // Fetch detailed goal progress
  // Handle milestone detection when progress updates
  const handleMilestoneReached = (milestone) => {
    console.log(`🎯 Milestone reached: ${milestone}% for goal "${goal.title}"`);
    
    // Trigger custom milestone achievement animation
    if (triggerCustomAchievement) {
      triggerCustomAchievement('milestone', goal, `You've reached ${milestone}% progress!`);
    }
  };

  // Detect if progress has improved and trigger appropriate animations
  const detectProgressImprovement = (newProgress) => {
    const currentPercentage = newProgress?.currentPercentage || 0;
    
    if (currentPercentage > previousProgress) {
      const improvement = currentPercentage - previousProgress;
      
      // Check for significant improvements (>= 10%)
      if (improvement >= 10) {
        setTimeout(() => {
          triggerCustomAchievement && triggerCustomAchievement(
            'milestone', 
            goal, 
            `Wow! You improved by ${improvement.toFixed(1)}% on this goal!`
          );
        }, 1000);
      }
      
      // Update previous progress
      setPreviousProgress(currentPercentage);
    }
  };

  const fetchGoalProgress = async () => {
    try {
      const response = await SustainabilityGoalService.getGoalProgress(goal._id, auth);
      
      if (response.success) {
        setGoal(response.goal);
        setDetailedProgress(response.detailedProgress);
        
        // Detect progress improvement and trigger animations
        detectProgressImprovement(response.detailedProgress);
      } else {
        Alert.alert('Error', response.error || 'Failed to fetch goal progress');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error fetching goal progress:', error);
      Alert.alert('Error', 'Failed to load goal progress');
      navigation.goBack();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchGoalProgress();
  };

  // Navigate to edit goal
  const handleEditGoal = () => {
    navigation.navigate('GoalSetup', {
      mode: 'edit',
      goal: goal,
      onGoalUpdated: (updatedGoal) => {
        setGoal(updatedGoal);
        fetchGoalProgress(); // Refresh progress data
      }
    });
  };

  // Get progress color based on achievement
  const getProgressColor = () => {
    return SustainabilityGoalService.getGoalProgressColor(
      detailedProgress?.currentPercentage || 0,
      goal.goalConfig.percentage
    );
  };

  // Get progress status text
  const getProgressStatus = () => {
    return SustainabilityGoalService.getGoalProgressStatus(
      detailedProgress?.currentPercentage || 0,
      goal.goalConfig.percentage
    );
  };

  // Get goal type icon
  const getGoalTypeIcon = () => {
    const icons = {
      'grade-based': 'ribbon',
      'score-based': 'speedometer',
      'category-based': 'grid',
    };
    return icons[goal.goalType] || 'target';
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Render goal header
  const renderGoalHeader = () => (
    <View style={styles.goalHeader}>
      <View style={styles.goalTitleSection}>
        <View style={styles.goalTitleRow}>
          <View style={[styles.goalTypeIcon, { backgroundColor: getProgressColor() }]}>
            <Ionicons name={getGoalTypeIcon()} size={24} color={theme.colors.textOnPrimary} />
          </View>
          <View style={styles.goalTitleContent}>
            <Text style={styles.goalTitle}>{goal.title}</Text>
            <Text style={styles.goalType}>
              {goal.goalType.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')} Goal
            </Text>
          </View>
        </View>
        
        <Text style={styles.goalDescription}>
          {goal.description || SustainabilityGoalService.generateGoalDescription(goal.goalType, goal.goalConfig)}
        </Text>
      </View>
      
      <TouchableOpacity style={styles.editButton} onPress={handleEditGoal}>
        <Ionicons name="pencil" size={20} color={theme.colors.primary} />
      </TouchableOpacity>
    </View>
  );

  // Render progress section with animated progress bar
  const renderProgressCircle = () => {
    if (!detailedProgress) return null;

    const currentProgress = detailedProgress.currentPercentage || 0;
    const targetProgress = goal.goalConfig.percentage || 100;
    const progressPercentage = Math.min((currentProgress / targetProgress) * 100, 100);

    return (
      <View style={styles.progressSection}>
        <Text style={styles.sectionTitle}>Progress Overview</Text>
        
        <View style={styles.progressContainer}>
          {/* Animated Progress Bar with Milestones */}
          <AnimatedProgressBar
            progress={currentProgress}
            targetProgress={targetProgress}
            height={12}
            showMilestones={true}
            showPercentage={true}
            color={getProgressColor()}
            animationDuration={1500}
            onMilestoneReached={handleMilestoneReached}
            style={styles.animatedProgressBar}
          />
          
          {/* Progress Stats */}
          <View style={styles.progressStats}>
            <View style={styles.progressStat}>
              <Text style={styles.progressStatNumber}>
                {detailedProgress.goalMetPurchases}
              </Text>
              <Text style={styles.progressStatLabel}>Goal Met</Text>
            </View>
            
            <View style={styles.progressStat}>
              <Text style={styles.progressStatNumber}>
                {detailedProgress.totalPurchases}
              </Text>
              <Text style={styles.progressStatLabel}>Total Purchases</Text>
            </View>
            
            <View style={styles.progressStat}>
              <Text style={[styles.progressStatNumber, { color: getProgressColor() }]}>
                {goal.goalConfig.percentage}%
              </Text>
              <Text style={styles.progressStatLabel}>Target</Text>
            </View>
          </View>
        </View>
        
        {/* Progress Status Card */}
        <View style={styles.progressStatusCard}>
          <View style={styles.progressStatusHeader}>
            <Ionicons 
              name={detailedProgress.isAchieved ? "trophy" : "flag"} 
              size={20} 
              color={getProgressColor()} 
            />
            <Text style={[styles.progressStatusText, { color: getProgressColor() }]}>
              {getProgressStatus()}
            </Text>
          </View>
          <Text style={styles.progressStatusDescription}>
            {detailedProgress.isAchieved 
              ? "Congratulations! You've achieved your sustainability goal! 🎉"
              : `You need ${Math.max(0, Math.ceil((goal.goalConfig.percentage - detailedProgress.currentPercentage) / 100 * detailedProgress.totalPurchases))} more goal-meeting purchases to achieve your target.`
            }
          </Text>
        </View>
      </View>
    );
  };

  // Render goal configuration details
  const renderGoalConfiguration = () => (
    <View style={styles.configSection}>
      <Text style={styles.sectionTitle}>Goal Configuration</Text>
      
      <View style={styles.configCard}>
        {goal.goalType === 'grade-based' && (
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>Target Grades</Text>
            <View style={styles.gradeList}>
              {goal.goalConfig.targetGrades.map((grade) => {
                const gradeStyle = theme.getEcoGradeStyles(grade);
                return (
                  <View
                    key={grade}
                    style={[
                      styles.gradeBadge,
                      { backgroundColor: gradeStyle.backgroundColor }
                    ]}
                  >
                    <Text style={[styles.gradeBadgeText, { color: gradeStyle.color }]}>
                      {grade}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
        
        {goal.goalType === 'score-based' && (
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>Minimum Score</Text>
            <Text style={styles.configValue}>
              {goal.goalConfig.minimumScore}+ sustainability score
            </Text>
          </View>
        )}
        
        {goal.goalType === 'category-based' && (
          <>
            <View style={styles.configItem}>
              <Text style={styles.configLabel}>Categories</Text>
              <View style={styles.categoryList}>
                {goal.goalConfig.categories.map((category) => (
                  <View key={category} style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{category}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.configItem}>
              <Text style={styles.configLabel}>Target Grades</Text>
              <View style={styles.gradeList}>
                {goal.goalConfig.targetGrades.map((grade) => {
                  const gradeStyle = theme.getEcoGradeStyles(grade);
                  return (
                    <View
                      key={grade}
                      style={[
                        styles.gradeBadge,
                        { backgroundColor: gradeStyle.backgroundColor }
                      ]}
                    >
                      <Text style={[styles.gradeBadgeText, { color: gradeStyle.color }]}>
                        {grade}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </>
        )}
        
        <View style={styles.configItem}>
          <Text style={styles.configLabel}>Target Percentage</Text>
          <Text style={styles.configValue}>
            {goal.goalConfig.percentage}% of purchases should meet goal
          </Text>
        </View>
      </View>
    </View>
  );

  // Render recent activity
  const renderRecentActivity = () => {
    if (!detailedProgress?.recentActivity || detailedProgress.recentActivity.length === 0) {
      return (
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.emptyActivity}>
            <Ionicons name="bag-outline" size={48} color={theme.colors.textLight} />
            <Text style={styles.emptyActivityText}>No recent purchases</Text>
            <Text style={styles.emptyActivityDescription}>
              Start shopping sustainably to see your progress here!
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.activitySection}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <Text style={styles.sectionDescription}>
          Your last {detailedProgress.recentActivity.length} purchases
        </Text>
        
        {detailedProgress.recentActivity.map((activity, index) => {
          const gradeStyle = theme.getEcoGradeStyles(activity.productGrade);
          
          return (
            <View key={index} style={styles.activityItem}>
              <View style={styles.activityItemHeader}>
                <View style={styles.activityItemInfo}>
                  <Text style={styles.activityItemName} numberOfLines={1}>
                    {activity.productName}
                  </Text>
                  <Text style={styles.activityItemCategory}>
                    {activity.category} • {formatDate(activity.purchaseDate)}
                  </Text>
                </View>
                
                <View style={styles.activityItemBadges}>
                  <View style={[
                    styles.activityGradeBadge,
                    { backgroundColor: gradeStyle.backgroundColor }
                  ]}>
                    <Text style={[styles.activityGradeBadgeText, { color: gradeStyle.color }]}>
                      {activity.productGrade}
                    </Text>
                  </View>
                  
                  <View style={[
                    styles.activityStatusBadge,
                    { backgroundColor: activity.meetsGoal ? theme.colors.success + '20' : theme.colors.error + '20' }
                  ]}>
                    <Ionicons 
                      name={activity.meetsGoal ? "checkmark" : "close"} 
                      size={12} 
                      color={activity.meetsGoal ? theme.colors.success : theme.colors.error} 
                    />
                  </View>
                </View>
              </View>
              
              <View style={styles.activityItemDetails}>
                <Text style={styles.activityItemScore}>
                  Score: {activity.productScore}/100
                </Text>
                <Text style={[
                  styles.activityItemStatus,
                  { color: activity.meetsGoal ? theme.colors.success : theme.colors.error }
                ]}>
                  {activity.meetsGoal ? 'Meets Goal' : 'Does Not Meet Goal'}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading goal progress...</Text>
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
          <Text style={styles.headerTitle}>Goal Progress</Text>
          <Text style={styles.headerSubtitle}>Track your sustainability journey</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Ionicons name="refresh" size={24} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderGoalHeader()}
        {renderProgressCircle()}
        {renderGoalConfiguration()}
        {renderRecentActivity()}
        
        <View style={styles.bottomSpacer} />
      </ScrollView>
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
  refreshButton: {
    padding: theme.spacing.s,
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

  // Scroll Styles
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

  // Goal Header Styles
  goalHeader: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...theme.shadows.card,
  },
  goalTitleSection: {
    flex: 1,
  },
  goalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  goalTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.l,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.m,
  },
  goalTitleContent: {
    flex: 1,
  },
  goalTitle: {
    fontSize: theme.typography.fontSize.h5,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  goalType: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  goalDescription: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.body2,
  },
  editButton: {
    padding: theme.spacing.s,
    marginTop: theme.spacing.xs,
  },

  // Section Styles
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
  },

  // Progress Section Styles
  progressSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.l,
    ...theme.shadows.card,
  },
  progressContainer: {
    marginVertical: theme.spacing.m,
  },
  animatedProgressBar: {
    marginBottom: theme.spacing.l,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: theme.spacing.m,
  },
  progressStat: {
    alignItems: 'center',
  },
  progressStatNumber: {
    fontSize: theme.typography.fontSize.h4,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  progressStatLabel: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  progressStatusCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.m,
    ...theme.shadows.small,
  },
  progressStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  progressStatusText: {
    fontSize: theme.typography.fontSize.h6,
    fontWeight: theme.typography.fontWeight.semiBold,
    marginLeft: theme.spacing.s,
  },
  progressStatusDescription: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.body2,
  },

  // Configuration Section Styles
  configSection: {
    marginBottom: theme.spacing.l,
  },
  configCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.m,
    ...theme.shadows.card,
  },
  configItem: {
    marginBottom: theme.spacing.m,
  },
  configLabel: {
    fontSize: theme.typography.fontSize.body2,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  configValue: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.textSecondary,
  },
  gradeList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gradeBadge: {
    paddingHorizontal: theme.spacing.s,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.m,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  gradeBadgeText: {
    fontSize: theme.typography.fontSize.body2,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  categoryList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryBadge: {
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: theme.spacing.s,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.m,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  categoryBadgeText: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },

  // Activity Section Styles
  activitySection: {
    marginBottom: theme.spacing.l,
  },
  emptyActivity: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.xl,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  emptyActivityText: {
    fontSize: theme.typography.fontSize.h6,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
    marginTop: theme.spacing.m,
    marginBottom: theme.spacing.s,
  },
  emptyActivityDescription: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  activityItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.s,
    ...theme.shadows.small,
  },
  activityItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.s,
  },
  activityItemInfo: {
    flex: 1,
    marginRight: theme.spacing.s,
  },
  activityItemName: {
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: 2,
  },
  activityItemCategory: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textSecondary,
  },
  activityItemBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityGradeBadge: {
    paddingHorizontal: theme.spacing.s,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.m,
    marginRight: theme.spacing.xs,
  },
  activityGradeBadgeText: {
    fontSize: theme.typography.fontSize.caption,
    fontWeight: theme.typography.fontWeight.bold,
  },
  activityStatusBadge: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityItemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityItemScore: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.textSecondary,
  },
  activityItemStatus: {
    fontSize: theme.typography.fontSize.body2,
    fontWeight: theme.typography.fontWeight.medium,
  },
});

export default GoalProgressScreen;
