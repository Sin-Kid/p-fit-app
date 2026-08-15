import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Linking,
  Platform,
} from 'react-native';
import { useStepCounter } from '../hooks/useStepCounter';

const DAILY_STEP_GOAL = 10000;

export default function StepCounterScreen() {
  const {
    steps,
    persistedTotal,
    liveDelta,
    isAvailable,
    permissionGranted,
    error,
    isTracking,
    refresh,
    requestPermission,
    requestBackgroundExemption,
  } = useStepCounter();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Calculations
  const progressPct = Math.min(100, Math.round((steps / DAILY_STEP_GOAL) * 100));
  const distanceKm = (steps * 0.00078).toFixed(2);
  const caloriesKcal = Math.round(steps * 0.042);
  const activeMinutes = Math.round(steps / 115);

  // ----------------------------------------------------
  // STATE 1: Hardware Sensor Unavailable
  // ----------------------------------------------------
  if (isAvailable === false) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.stateCenterContainer}>
          <View style={[styles.iconBadge, styles.iconBadgeWarn]}>
            <Text style={styles.iconText}>⚠️</Text>
          </View>
          <Text style={styles.stateTitle}>Sensor Unavailable</Text>
          <Text style={styles.stateDescription}>
            Your device does not have a hardware step counter sensor (or you are running on an Android emulator which does not simulate hardware pedometers).
          </Text>
          <Text style={styles.stateHelpText}>
            Please test this on a physical Android or iOS device using an EAS development build.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ----------------------------------------------------
  // STATE 2: Permission Denied / Pending
  // ----------------------------------------------------
  if (permissionGranted === false) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.stateCenterContainer}>
          <View style={[styles.iconBadge, styles.iconBadgeDanger]}>
            <Text style={styles.iconText}>🔒</Text>
          </View>
          <Text style={styles.stateTitle}>Permission Required</Text>
          <Text style={styles.stateDescription}>
            Physical Activity permission is required to count your steps in foreground and background.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={requestPermission}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>Grant Activity Permission</Text>
          </TouchableOpacity>

          {Platform.OS === 'android' && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => Linking.openSettings()}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>Open App Settings</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // ----------------------------------------------------
  // STATE 3: Normal Step Display
  // ----------------------------------------------------
  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Bar */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.screenSubtitle}>DAILY ACTIVITY</Text>
            <Text style={styles.screenTitle}>Step Tracker</Text>
          </View>
          
          <View style={styles.statusPill}>
            <View style={[styles.statusDot, isTracking ? styles.statusDotActive : styles.statusDotIdle]} />
            <Text style={styles.statusPillText}>
              {isTracking ? 'Active & Counting' : 'Ready'}
            </Text>
          </View>
        </View>

        {/* Error Banner if any */}
        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        {/* Main Step Display Card */}
        <View style={styles.mainCard}>
          <Text style={styles.stepCountText}>{steps.toLocaleString()}</Text>
          <Text style={styles.stepGoalText}>
            Goal: {DAILY_STEP_GOAL.toLocaleString()} steps ({progressPct}%)
          </Text>

          {/* Progress Bar */}
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progressPct}%` }]} />
          </View>

          {/* Foreground / Background Telemetry Breakdown */}
          <View style={styles.telemetryRow}>
            <View style={styles.telemetryItem}>
              <Text style={styles.telemetryLabel}>Hardware Base</Text>
              <Text style={styles.telemetryValue}>{persistedTotal.toLocaleString()}</Text>
            </View>
            <View style={styles.telemetryDivider} />
            <View style={styles.telemetryItem}>
              <Text style={styles.telemetryLabel}>Live Session</Text>
              <Text style={styles.telemetryValue}>+{liveDelta.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricEmoji}>📍</Text>
            <Text style={styles.metricLabel}>DISTANCE</Text>
            <Text style={styles.metricValue}>{distanceKm} km</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricEmoji}>🔥</Text>
            <Text style={styles.metricLabel}>CALORIES</Text>
            <Text style={styles.metricValue}>{caloriesKcal} kcal</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricEmoji}>⏱️</Text>
            <Text style={styles.metricLabel}>ACTIVE TIME</Text>
            <Text style={styles.metricValue}>{activeMinutes} min</Text>
          </View>
        </View>

        {/* Manual Refresh & Reconciliation Button */}
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleManualRefresh}
          disabled={isRefreshing}
          activeOpacity={0.8}
        >
          {isRefreshing ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.refreshButtonText}>🔄 Sync & Reconcile Gap Steps</Text>
          )}
        </TouchableOpacity>

        {/* Background Status & Optimization Button */}
        <View style={styles.infoBanner}>
          <View style={styles.infoBannerHeader}>
            <Text style={styles.infoTitle}>⚡ Background Tracking Active</Text>
          </View>
          <Text style={styles.infoText}>
            On Android, disable battery optimizations so the OS does not freeze step tracking when your phone is locked in your pocket.
          </Text>

          {Platform.OS === 'android' && (
            <TouchableOpacity
              style={styles.optimizeButton}
              onPress={requestBackgroundExemption}
              activeOpacity={0.85}
            >
              <Text style={styles.optimizeButtonText}>🔋 Allow Unrestricted Background Battery</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  screenSubtitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F7ED',
    borderColor: '#CDEED5',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusDotActive: {
    backgroundColor: '#16A34A',
  },
  statusDotIdle: {
    backgroundColor: '#94A3B8',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  errorCard: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#991B1B',
    fontSize: 12,
    fontWeight: '600',
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 16,
  },
  stepCountText: {
    fontSize: 54,
    fontWeight: '900',
    color: '#0F172A',
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
  stepGoalText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
    marginBottom: 16,
  },
  progressBarBackground: {
    width: '100%',
    height: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 5,
  },
  telemetryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  telemetryItem: {
    alignItems: 'center',
    flex: 1,
  },
  telemetryDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 12,
  },
  telemetryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  telemetryValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    alignItems: 'center',
    borderColor: '#E2E8F0',
    borderWidth: 1,
  },
  metricEmoji: {
    fontSize: 18,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  refreshButton: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  infoBanner: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  infoBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  infoText: {
    fontSize: 11,
    color: '#3B82F6',
    lineHeight: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  optimizeButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  optimizeButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  stateCenterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBadgeWarn: {
    backgroundColor: '#FEF3C7',
  },
  iconBadgeDanger: {
    backgroundColor: '#FEE2E2',
  },
  iconText: {
    fontSize: 28,
  },
  stateTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  stateDescription: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  stateHelpText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 28,
    width: '100%',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryButton: {
    marginTop: 12,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
