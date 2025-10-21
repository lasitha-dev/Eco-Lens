/**
 * Performance Monitor Component
 * Provides real-time performance monitoring and debugging tools
 * for the optimized goal sync and caching system
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRealtimeGoals } from '../contexts/RealtimeGoalContext';
import memoizedGoalService from '../api/memoizedSustainabilityGoalService';
import GoalStorageManager from '../utils/GoalStorageManager';
import goalSyncService from '../utils/GoalSyncService';
import theme from '../styles/theme';

const { width: screenWidth } = Dimensions.get('window');

const PerformanceMonitor = ({ visible, onClose, style }) => {
  const {
    syncStatus,
    offlineChanges,
    isOnline,
    isSyncing,
    getSyncDebugInfo,
  } = useRealtimeGoals();

  const [performanceData, setPerformanceData] = useState({
    cacheStats: {},
    storageInfo: {},
    syncInfo: {},
    renderMetrics: { rerenders: 0, lastUpdate: Date.now() },
  });

  const [refreshInterval, setRefreshInterval] = useState(null);
  const [isExpanded, setIsExpanded] = useState({
    cache: true,
    storage: false,
    sync: false,
    performance: false,
  });

  // Refresh performance data periodically
  const refreshPerformanceData = useCallback(async () => {
    try {
      const [cacheStats, storageInfo, syncInfo] = await Promise.all([
        memoizedGoalService.getCacheStats(),
        GoalStorageManager.getDebugInfo(),
        getSyncDebugInfo(),
      ]);

      setPerformanceData(prev => ({
        ...prev,
        cacheStats,
        storageInfo,
        syncInfo,
        renderMetrics: {
          ...prev.renderMetrics,
          lastUpdate: Date.now(),
          rerenders: prev.renderMetrics.rerenders + 1,
        },
      }));
    } catch (error) {
      console.error('Error refreshing performance data:', error);
    }
  }, [getSyncDebugInfo]);

  // Start/stop monitoring
  useEffect(() => {
    if (visible) {
      refreshPerformanceData();
      const interval = setInterval(refreshPerformanceData, 2000); // Every 2 seconds
      setRefreshInterval(interval);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }
  }, [visible, refreshPerformanceData]);

  // Memoized performance calculations
  const performanceMetrics = useMemo(() => {
    const { cacheStats, storageInfo, syncInfo } = performanceData;
    
    return {
      cacheEfficiency: {
        hitRate: cacheStats.hitRate || '0%',
        totalRequests: cacheStats.total || 0,
        cacheSize: cacheStats.cacheSize || 0,
        pendingRequests: cacheStats.pendingRequests || 0,
      },
      storageEfficiency: {
        totalSize: storageInfo.cacheInfo?.totalSizeKB || 0,
        keysCount: Object.keys(storageInfo.cacheInfo || {}).length,
        lastSync: storageInfo.lastSync?.timestamp 
          ? new Date(storageInfo.lastSync.timestamp).toLocaleTimeString()
          : 'Never',
      },
      syncEfficiency: {
        isOnline,
        isSyncing,
        offlineChangesCount: offlineChanges.length,
        lastSyncAge: syncInfo?.storage?.lastSync?.timestamp 
          ? Date.now() - syncInfo.storage.lastSync.timestamp
          : null,
      },
    };
  }, [performanceData, isOnline, isSyncing, offlineChanges]);

  // Action handlers
  const handleClearCache = useCallback(() => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached API responses. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            memoizedGoalService.clearCache();
            refreshPerformanceData();
          }
        }
      ]
    );
  }, [refreshPerformanceData]);

  const handleClearStorage = useCallback(() => {
    Alert.alert(
      'Clear Local Storage',
      'This will clear all locally stored goal data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: async () => {
            await GoalStorageManager.clearCache();
            refreshPerformanceData();
          }
        }
      ]
    );
  }, [refreshPerformanceData]);

  const handleForceSync = useCallback(async () => {
    try {
      await goalSyncService.forcSync();
      Alert.alert('Sync Complete', 'Goals have been synchronized successfully.');
      refreshPerformanceData();
    } catch (error) {
      Alert.alert('Sync Error', error.message);
    }
  }, [refreshPerformanceData]);

  const handleWarmupCache = useCallback(async () => {
    try {
      // Get token from context or auth - simplified for now
      await memoizedGoalService.warmupCache('dummy_token');
      Alert.alert('Cache Warmed', 'Frequently accessed data has been pre-loaded.');
      refreshPerformanceData();
    } catch (error) {
      Alert.alert('Warmup Error', error.message);
    }
  }, [refreshPerformanceData]);

  const toggleSection = useCallback((section) => {
    setIsExpanded(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  const formatBytes = useCallback((bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const formatDuration = useCallback((ms) => {
    if (!ms || ms < 0) return 'N/A';
    
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m ago`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s ago`;
    return `${seconds}s ago`;
  }, []);

  if (!visible) return null;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>Performance Monitor</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Cache Performance Section */}
        <TouchableOpacity 
          style={styles.section} 
          onPress={() => toggleSection('cache')}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="archive" size={20} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>Cache Performance</Text>
              <View style={[
                styles.statusDot, 
                { backgroundColor: performanceMetrics.cacheEfficiency.hitRate > '50%' 
                  ? theme.colors.success : theme.colors.warning }
              ]} />
            </View>
            <Ionicons 
              name={isExpanded.cache ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={theme.colors.textSecondary} 
            />
          </View>
          
          {isExpanded.cache && (
            <View style={styles.sectionContent}>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Hit Rate:</Text>
                <Text style={[
                  styles.metricValue,
                  { color: performanceMetrics.cacheEfficiency.hitRate > '70%' 
                    ? theme.colors.success : theme.colors.warning }
                ]}>
                  {performanceMetrics.cacheEfficiency.hitRate}
                </Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Total Requests:</Text>
                <Text style={styles.metricValue}>
                  {performanceMetrics.cacheEfficiency.totalRequests}
                </Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Cached Items:</Text>
                <Text style={styles.metricValue}>
                  {performanceMetrics.cacheEfficiency.cacheSize}
                </Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Pending:</Text>
                <Text style={styles.metricValue}>
                  {performanceMetrics.cacheEfficiency.pendingRequests}
                </Text>
              </View>
              
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionButton} onPress={handleClearCache}>
                  <Text style={styles.actionButtonText}>Clear Cache</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={handleWarmupCache}>
                  <Text style={styles.actionButtonText}>Warm Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* Storage Performance Section */}
        <TouchableOpacity 
          style={styles.section} 
          onPress={() => toggleSection('storage')}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="folder" size={20} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>Local Storage</Text>
              <View style={[
                styles.statusDot, 
                { backgroundColor: performanceMetrics.storageEfficiency.totalSize < 1000 
                  ? theme.colors.success : theme.colors.warning }
              ]} />
            </View>
            <Ionicons 
              name={isExpanded.storage ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={theme.colors.textSecondary} 
            />
          </View>
          
          {isExpanded.storage && (
            <View style={styles.sectionContent}>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Storage Used:</Text>
                <Text style={styles.metricValue}>
                  {formatBytes(performanceMetrics.storageEfficiency.totalSize * 1024)}
                </Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Cache Keys:</Text>
                <Text style={styles.metricValue}>
                  {performanceMetrics.storageEfficiency.keysCount}
                </Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Last Sync:</Text>
                <Text style={styles.metricValue}>
                  {performanceMetrics.storageEfficiency.lastSync}
                </Text>
              </View>
              
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionButton} onPress={handleClearStorage}>
                  <Text style={styles.actionButtonText}>Clear Storage</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* Sync Performance Section */}
        <TouchableOpacity 
          style={styles.section} 
          onPress={() => toggleSection('sync')}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="sync" size={20} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>Sync Status</Text>
              <View style={[
                styles.statusDot, 
                { backgroundColor: isOnline ? theme.colors.success : theme.colors.error }
              ]} />
            </View>
            <Ionicons 
              name={isExpanded.sync ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={theme.colors.textSecondary} 
            />
          </View>
          
          {isExpanded.sync && (
            <View style={styles.sectionContent}>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Online:</Text>
                <Text style={[
                  styles.metricValue,
                  { color: isOnline ? theme.colors.success : theme.colors.error }
                ]}>
                  {isOnline ? 'Yes' : 'No'}
                </Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Syncing:</Text>
                <Text style={[
                  styles.metricValue,
                  { color: isSyncing ? theme.colors.warning : theme.colors.textSecondary }
                ]}>
                  {isSyncing ? 'Yes' : 'No'}
                </Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Offline Changes:</Text>
                <Text style={[
                  styles.metricValue,
                  { color: performanceMetrics.syncEfficiency.offlineChangesCount > 0 
                    ? theme.colors.warning : theme.colors.success }
                ]}>
                  {performanceMetrics.syncEfficiency.offlineChangesCount}
                </Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Last Sync:</Text>
                <Text style={styles.metricValue}>
                  {performanceMetrics.syncEfficiency.lastSyncAge 
                    ? formatDuration(performanceMetrics.syncEfficiency.lastSyncAge)
                    : 'Never'
                  }
                </Text>
              </View>
              
              <View style={styles.actionRow}>
                <TouchableOpacity 
                  style={[styles.actionButton, isSyncing && styles.disabledButton]} 
                  onPress={handleForceSync}
                  disabled={isSyncing}
                >
                  <Text style={styles.actionButtonText}>
                    {isSyncing ? 'Syncing...' : 'Force Sync'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* Performance Metrics Section */}
        <TouchableOpacity 
          style={styles.section} 
          onPress={() => toggleSection('performance')}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="speedometer" size={20} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>Performance</Text>
              <View style={[styles.statusDot, { backgroundColor: theme.colors.success }]} />
            </View>
            <Ionicons 
              name={isExpanded.performance ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={theme.colors.textSecondary} 
            />
          </View>
          
          {isExpanded.performance && (
            <View style={styles.sectionContent}>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Re-renders:</Text>
                <Text style={styles.metricValue}>
                  {performanceData.renderMetrics.rerenders}
                </Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Last Update:</Text>
                <Text style={styles.metricValue}>
                  {new Date(performanceData.renderMetrics.lastUpdate).toLocaleTimeString()}
                </Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Memory Usage:</Text>
                <Text style={styles.metricValue}>
                  {(global.performance && global.performance.memory?.usedJSHeapSize)
                    ? formatBytes(global.performance.memory.usedJSHeapSize)
                    : 'N/A'
                  }
                </Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    bottom: 100,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    ...theme.shadows.large,
    zIndex: 1000,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  
  title: {
    fontSize: theme.typography.fontSize.h4,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  
  closeButton: {
    padding: theme.spacing.s,
  },
  
  scrollView: {
    flex: 1,
    padding: theme.spacing.m,
  },
  
  section: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.m,
    overflow: 'hidden',
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.m,
  },
  
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  sectionTitle: {
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    marginLeft: theme.spacing.s,
  },
  
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: theme.spacing.s,
  },
  
  sectionContent: {
    padding: theme.spacing.m,
    paddingTop: 0,
  },
  
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  
  metricLabel: {
    fontSize: theme.typography.fontSize.body2,
    color: theme.colors.textSecondary,
  },
  
  metricValue: {
    fontSize: theme.typography.fontSize.body2,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
  },
  
  actionRow: {
    flexDirection: 'row',
    marginTop: theme.spacing.m,
    gap: theme.spacing.s,
  },
  
  actionButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.s,
    paddingHorizontal: theme.spacing.m,
    borderRadius: theme.borderRadius.s,
    alignItems: 'center',
  },
  
  disabledButton: {
    backgroundColor: theme.colors.textSecondary,
  },
  
  actionButtonText: {
    fontSize: theme.typography.fontSize.caption,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.textOnPrimary,
  },
});

export default React.memo(PerformanceMonitor);
