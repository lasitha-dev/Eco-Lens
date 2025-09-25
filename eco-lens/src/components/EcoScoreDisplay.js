/**
 * EcoScoreDisplay Component
 * Real-time visualization of sustainability scores with circular progress and breakdown
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import theme, { colors } from '../constants/theme';
import { 
  getGradeColor, 
  getGradeDescription, 
  getScoreBreakdown 
} from '../utils/SustainabilityCalculator';

const EcoScoreDisplay = ({ 
  score = 0, 
  grade = 'F', 
  ecoMetrics = {}, 
  showBreakdown = true,
  size = 'large' 
}) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;
  const breakdown = getScoreBreakdown(ecoMetrics);

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: score,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [score]);

  const circularProgressSize = size === 'large' ? 120 : 80;
  const strokeWidth = size === 'large' ? 8 : 6;
  const radius = (circularProgressSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const renderCircularProgress = () => (
    <View style={[styles.circularContainer, { width: circularProgressSize, height: circularProgressSize }]}>
      {/* Background circle */}
      <View 
        style={[
          styles.circularBackground,
          {
            width: circularProgressSize,
            height: circularProgressSize,
            borderRadius: circularProgressSize / 2,
            borderWidth: strokeWidth,
            borderColor: colors.border,
          }
        ]}
      />
      {/* Progress circle - using a simple approximation with border */}
      <View 
        style={[
          styles.circularProgress,
          {
            width: circularProgressSize,
            height: circularProgressSize,
            borderRadius: circularProgressSize / 2,
            borderWidth: strokeWidth,
            borderColor: 'transparent',
            borderTopColor: getGradeColor(grade),
            borderRightColor: score > 25 ? getGradeColor(grade) : 'transparent',
            borderBottomColor: score > 50 ? getGradeColor(grade) : 'transparent',
            borderLeftColor: score > 75 ? getGradeColor(grade) : 'transparent',
            transform: [{ rotate: '-90deg' }],
          }
        ]}
      />
      <View style={styles.scoreContainer}>
        <Text style={[styles.scoreText, size === 'large' ? styles.scoreTextLarge : styles.scoreTextSmall]}>
          {Math.round(score)}
        </Text>
        <Text style={[styles.scoreLabel, size === 'large' ? styles.scoreLabelLarge : styles.scoreLabelSmall]}>
          ECO SCORE
        </Text>
      </View>
    </View>
  );

  const renderGradeBadge = () => (
    <View style={[styles.gradeBadge, { backgroundColor: getGradeColor(grade) }]}>
      <Text style={styles.gradeText}>{grade}</Text>
    </View>
  );

  const renderMetricBar = (label, value, maxValue = 100, unit = '%', color = colors.primary) => (
    <View style={styles.metricItem}>
      <View style={styles.metricHeader}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricValue}>{value}{unit}</Text>
      </View>
      <View style={styles.metricBarContainer}>
        <View 
          style={[
            styles.metricBar,
            { 
              width: `${Math.min(100, (value / maxValue) * 100)}%`,
              backgroundColor: color
            }
          ]}
        />
      </View>
    </View>
  );

  const renderBreakdown = () => {
    if (!showBreakdown || !breakdown || Object.keys(breakdown).length === 0) {
      return null;
    }

    return (
      <View style={styles.breakdownContainer}>
        <Text style={styles.breakdownTitle}>Score Breakdown</Text>
        
        {/* Materials Score */}
        {breakdown.materials && renderMetricBar(
          `Materials (${breakdown.materials.weight}%)`,
          breakdown.materials.percentage,
          100,
          '%',
          getGradeColor(grade)
        )}

        {/* Carbon Footprint */}
        {breakdown.carbon && (
          <View style={styles.metricItem}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>Carbon Footprint ({breakdown.carbon.weight}%)</Text>
              <Text style={styles.metricValue}>{breakdown.carbon.value} kg CO₂</Text>
            </View>
            <View style={styles.metricBarContainer}>
              <View 
                style={[
                  styles.metricBar,
                  { 
                    width: `${breakdown.carbon.normalizedScore}%`,
                    backgroundColor: colors.warning
                  }
                ]}
              />
            </View>
          </View>
        )}

        {/* Packaging */}
        {breakdown.packaging && (
          <View style={styles.metricItem}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>Packaging ({breakdown.packaging.weight}%)</Text>
              <Text style={styles.metricValue}>{breakdown.packaging.type}</Text>
            </View>
            <View style={styles.metricBarContainer}>
              <View 
                style={[
                  styles.metricBar,
                  { 
                    width: `${breakdown.packaging.baseScore}%`,
                    backgroundColor: colors.secondary
                  }
                ]}
              />
            </View>
          </View>
        )}

        {/* Manufacturing */}
        {breakdown.manufacturing && (
          <View style={styles.metricItem}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>Manufacturing ({breakdown.manufacturing.weight}%)</Text>
              <Text style={styles.metricValue}>{breakdown.manufacturing.process}</Text>
            </View>
            <View style={styles.metricBarContainer}>
              <View 
                style={[
                  styles.metricBar,
                  { 
                    width: `${breakdown.manufacturing.baseScore}%`,
                    backgroundColor: colors.info
                  }
                ]}
              />
            </View>
          </View>
        )}

        {/* Product Lifespan */}
        {breakdown.lifespan && (
          <View style={styles.metricItem}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>Lifespan ({breakdown.lifespan.weight}%)</Text>
              <Text style={styles.metricValue}>{breakdown.lifespan.months} months</Text>
            </View>
            <View style={styles.metricBarContainer}>
              <View 
                style={[
                  styles.metricBar,
                  { 
                    width: `${breakdown.lifespan.normalizedScore}%`,
                    backgroundColor: colors.success
                  }
                ]}
              />
            </View>
          </View>
        )}

        {/* Recyclable */}
        {breakdown.recyclable && renderMetricBar(
          `Recyclable (${breakdown.recyclable.weight}%)`,
          breakdown.recyclable.percentage,
          100,
          '%',
          colors.primary
        )}

        {/* Biodegradable */}
        {breakdown.biodegradable && renderMetricBar(
          `Biodegradable (${breakdown.biodegradable.weight}%)`,
          breakdown.biodegradable.percentage,
          100,
          '%',
          '#8BC34A'
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Main Score Display */}
      <View style={styles.scoreSection}>
        {renderCircularProgress()}
        <View style={styles.gradeSection}>
          {renderGradeBadge()}
          <Text style={styles.gradeDescription}>
            {getGradeDescription(grade)}
          </Text>
        </View>
      </View>

      {/* Score Breakdown */}
      {renderBreakdown()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.m,
    marginVertical: theme.spacing.s,
    ...theme.shadows.small,
  },
  
  scoreSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.m,
  },
  
  circularContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  circularBackground: {
    position: 'absolute',
  },
  
  circularProgress: {
    position: 'absolute',
  },
  
  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  scoreText: {
    fontWeight: 'bold',
    color: colors.text,
  },
  
  scoreTextLarge: {
    fontSize: theme.typography.fontSize['3xl'],
  },
  
  scoreTextSmall: {
    fontSize: theme.typography.fontSize.xl,
  },
  
  scoreLabel: {
    color: colors.textSecondary,
    letterSpacing: 1,
    marginTop: 2,
  },
  
  scoreLabelLarge: {
    fontSize: 10,
  },
  
  scoreLabelSmall: {
    fontSize: 8,
  },
  
  gradeSection: {
    alignItems: 'center',
    flex: 1,
    marginLeft: 16,
  },
  
  gradeBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  
  gradeText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  
  gradeDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  
  breakdownContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  
  metricItem: {
    marginBottom: 12,
  },
  
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  
  metricLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
  
  metricValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  
  metricBarContainer: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  
  metricBar: {
    height: '100%',
    borderRadius: 3,
  },
});

export default EcoScoreDisplay;
