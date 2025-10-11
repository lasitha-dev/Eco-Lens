/**
 * GlobalAnimationOverlay Component
 * Manages all global animations including achievements and milestone notifications
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRealtimeGoals } from '../contexts/RealtimeGoalContext';
import AchievementAnimation from '../components/goals/AchievementAnimation';
import MilestoneNotification from '../components/goals/MilestoneNotification';

const GlobalAnimationOverlay = () => {
  const {
    achievementAnimation,
    milestoneNotification,
    closeAchievementAnimation,
    closeMilestoneNotification,
  } = useRealtimeGoals();

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Achievement Animation */}
      <AchievementAnimation
        visible={achievementAnimation.visible}
        onClose={closeAchievementAnimation}
        goal={achievementAnimation.goal}
        type={achievementAnimation.type}
        customMessage={achievementAnimation.customMessage}
        autoClose={true}
        duration={4000}
      />

      {/* Milestone Notification */}
      <MilestoneNotification
        visible={milestoneNotification.visible}
        onClose={closeMilestoneNotification}
        milestone={milestoneNotification.milestone}
        goal={milestoneNotification.goal}
        autoClose={true}
        duration={3000}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
});

export default GlobalAnimationOverlay;
