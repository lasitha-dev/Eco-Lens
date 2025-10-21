/**
 * GoalIndicatorLegend Component
 * Explains the meaning of goal indicators to users
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../styles/theme';

const GoalIndicatorLegend = ({ visible, onClose }) => {
  const legendItems = [
    {
      icon: 'checkmark-circle',
      color: theme.colors.success,
      title: 'Perfect Goal Match',
      description: 'This product meets all your active sustainability goals',
      indicator: 'Gold star badge and green border'
    },
    {
      icon: 'checkmark-circle-outline',
      color: theme.colors.success,
      title: 'Partial Goal Match',
      description: 'This product meets some of your sustainability goals',
      indicator: 'Green border and checkmark'
    },
    {
      icon: 'close-circle-outline', 
      color: theme.colors.textSecondary,
      title: 'No Goal Match',
      description: 'This product doesn\'t meet your current sustainability goals',
      indicator: 'Regular border and gray icon'
    },
    {
      icon: 'star',
      color: '#FFD700',
      title: 'Star Badge',
      description: 'Indicates products that perfectly match all your goals',
      indicator: 'Golden star with "Goals" text'
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Goal Indicators Guide</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.subtitle}>
              When you have active sustainability goals, products will show visual indicators to help you make better choices:
            </Text>

            {legendItems.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={styles.iconContainer}>
                  <Ionicons 
                    name={item.icon} 
                    size={24} 
                    color={item.color} 
                  />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemDescription}>{item.description}</Text>
                  <Text style={styles.itemIndicator}>{item.indicator}</Text>
                </View>
              </View>
            ))}

            <View style={styles.tipsSection}>
              <Text style={styles.tipsTitle}>💡 Tips</Text>
              <Text style={styles.tip}>
                • Products with green borders are more likely to help you achieve your sustainability goals
              </Text>
              <Text style={styles.tip}>
                • Gold star badges indicate the best matches for your specific goals
              </Text>
              <Text style={styles.tip}>
                • Goal chips at the bottom show which specific goals the product meets
              </Text>
              <Text style={styles.tip}>
                • Set up your sustainability goals in the Profile section to see these indicators
              </Text>
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.gotItButton} onPress={onClose}>
            <Text style={styles.gotItButtonText}>Got it!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.m,
  },

  modalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.l,
    width: '100%',
    maxHeight: '80%',
    padding: theme.spacing.l,
    ...theme.shadows.large,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
    paddingBottom: theme.spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  title: {
    fontSize: theme.typography.fontSize.h4,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },

  closeButton: {
    padding: theme.spacing.xs,
  },

  content: {
    flex: 1,
  },

  subtitle: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.l,
    lineHeight: 22,
  },

  legendItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.l,
    alignItems: 'flex-start',
  },

  iconContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: theme.spacing.m,
    marginTop: 2,
  },

  textContainer: {
    flex: 1,
  },

  itemTitle: {
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },

  itemDescription: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    lineHeight: 20,
  },

  itemIndicator: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.primary,
    fontStyle: 'italic',
  },

  tipsSection: {
    marginTop: theme.spacing.l,
    padding: theme.spacing.m,
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.borderRadius.m,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },

  tipsTitle: {
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
  },

  tip: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    lineHeight: 20,
  },

  gotItButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.m,
    paddingVertical: theme.spacing.m,
    alignItems: 'center',
    marginTop: theme.spacing.m,
  },

  gotItButtonText: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});

export default GoalIndicatorLegend;
