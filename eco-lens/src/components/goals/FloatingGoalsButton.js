/**
 * FloatingGoalsButton Component
 * Floating action button with popup showing recent sustainability goals
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Easing,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../styles/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const FloatingGoalsButton = ({ 
  goals = [], 
  goalStats = null,
  loading = false,
  onViewAllPress,
  onGoalPress,
  onAddGoalPress,
}) => {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const popupAnim = useRef(new Animated.Value(0)).current;

  // Get active goals only (limit to 3 for popup) - memoized
  const activeGoals = useMemo(() => {
    return Array.isArray(goals) ? goals.filter(goal => goal?.isActive).slice(0, 3) : [];
  }, [goals]);

  // Always compute stats from goals array for accuracy - memoized
  const displayStats = useMemo(() => {
    if (!Array.isArray(goals) || goals.length === 0) {
      return {
        activeGoals: 0,
        achievedGoals: 0,
        averageProgress: 0
      };
    }

    return {
      activeGoals: goals.filter(g => g?.isActive).length,
      achievedGoals: goals.filter(g => g?.isAchieved).length,
      averageProgress: Math.round(goals.reduce((sum, g) => sum + (g?.progress?.currentPercentage || 0), 0) / goals.length)
    };
  }, [goals]);

  const handlePress = () => {
    // Button press animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Open popup
    setIsPopupVisible(true);
    
    // Popup animation - scale from small to big
    Animated.spring(popupAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handleClose = () => {
    Animated.timing(popupAnim, {
      toValue: 0,
      duration: 200,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setIsPopupVisible(false);
    });
  };

  const getGoalIcon = (goalType) => {
    const icons = {
      'grade-based': 'ribbon',
      'score-based': 'speedometer',
      'category-based': 'grid',
    };
    return icons[goalType] || 'target';
  };

  const getProgressColor = (currentPercentage, targetPercentage) => {
    const ratio = currentPercentage / targetPercentage;
    if (ratio >= 1) return '#4CAF50';
    if (ratio >= 0.75) return '#FF9800';
    if (ratio >= 0.5) return '#2196F3';
    return '#9C27B0';
  };


  return (
    <>
      {/* Floating Button */}
      <Animated.View style={[styles.floatingButton, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="trophy" size={28} color="#FFF" />
            {activeGoals.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{activeGoals.length}</Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Popup Modal */}
      <Modal
        visible={isPopupVisible}
        transparent
        animationType="none"
        onRequestClose={handleClose}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={handleClose}
        >
          <Animated.View 
            style={[
              styles.popupContainer,
              {
                opacity: popupAnim,
                transform: [
                  { scale: popupAnim },
                ],
              },
            ]}
          >
            <TouchableOpacity activeOpacity={1}>
              {/* Header */}
              <View style={styles.popupHeader}>
                <View style={styles.headerLeft}>
                  <Ionicons name="trophy" size={24} color={theme.colors.primary} />
                  <Text style={styles.popupTitle}>Your Goals</Text>
                </View>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Stats */}
              <View style={styles.statsRow}>
                {loading ? (
                  <View style={{ flex: 1, alignItems: 'center', paddingVertical: 10 }}>
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                    <Text style={[styles.statLabel, { marginTop: 8 }]}>Loading stats...</Text>
                  </View>
                ) : (
                  <>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{displayStats.activeGoals || 0}</Text>
                      <Text style={styles.statLabel}>Active</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{displayStats.achievedGoals || 0}</Text>
                      <Text style={styles.statLabel}>Achieved</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{displayStats.averageProgress || 0}%</Text>
                      <Text style={styles.statLabel}>Avg Progress</Text>
                    </View>
                  </>
                )}
              </View>

              {/* Goals List */}
              <ScrollView style={styles.goalsListContainer} showsVerticalScrollIndicator={false}>
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading goals...</Text>
                  </View>
                ) : activeGoals.length > 0 ? (
                  activeGoals.map((goal, index) => {
                    const progress = goal.progress || { currentPercentage: 0 };
                    const targetPercentage = goal.goalConfig?.percentage || 100;
                    const progressColor = getProgressColor(progress.currentPercentage, targetPercentage);

                    return (
                      <TouchableOpacity
                        key={goal._id || index}
                        style={styles.goalItem}
                        onPress={() => {
                          handleClose();
                          onGoalPress && onGoalPress(goal);
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.goalIcon, { backgroundColor: progressColor + '20' }]}>
                          <Ionicons name={getGoalIcon(goal.goalType)} size={20} color={progressColor} />
                        </View>
                        <View style={styles.goalContent}>
                          <Text style={styles.goalTitle} numberOfLines={1}>{goal.title}</Text>
                          <View style={styles.progressBarContainer}>
                            <View style={styles.progressBarBackground}>
                              <View 
                                style={[
                                  styles.progressBarFill, 
                                  { 
                                    width: `${Math.min((progress.currentPercentage / targetPercentage) * 100, 100)}%`,
                                    backgroundColor: progressColor 
                                  }
                                ]} 
                              />
                            </View>
                            <Text style={styles.progressText}>
                              {progress.currentPercentage.toFixed(0)}%
                            </Text>
                          </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textLight} />
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="leaf-outline" size={48} color={theme.colors.textLight} />
                    <Text style={styles.emptyText}>No active goals yet</Text>
                    <Text style={styles.emptySubtext}>Create your first sustainability goal!</Text>
                  </View>
                )}
              </ScrollView>

              {/* Action Buttons */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.addButton]}
                  onPress={() => {
                    handleClose();
                    onAddGoalPress && onAddGoalPress();
                  }}
                >
                  <Ionicons name="add-circle" size={20} color="#FFF" />
                  <Text style={styles.addButtonText}>New Goal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.viewAllButton]}
                  onPress={() => {
                    handleClose();
                    onViewAllPress && onViewAllPress();
                  }}
                >
                  <Text style={styles.viewAllButtonText}>View All</Text>
                  <Ionicons name="arrow-forward" size={20} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    zIndex: 1000,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradientButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF5252',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    width: screenWidth * 0.9,
    maxHeight: screenHeight * 0.7,
    backgroundColor: '#FFF',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  popupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  popupTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginLeft: 10,
  },
  closeButton: {
    padding: 4,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.colors.primaryLight + '10',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: 8,
  },
  goalsListContainer: {
    maxHeight: 300,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  goalContent: {
    flex: 1,
    marginRight: 8,
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 6,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBackground: {
    flex: 1,
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
    minWidth: 35,
    textAlign: 'right',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  viewAllButton: {
    backgroundColor: theme.colors.primaryLight + '20',
  },
  viewAllButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default FloatingGoalsButton;
