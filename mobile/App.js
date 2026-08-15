/**
 * App.js - P-Fit Fitness & Step Tracker
 * 
 * CRITICAL ARCHITECTURAL NOTE:
 * We import './tasks/stepBackgroundTask' immediately at the top of this file
 * to guarantee that TaskManager.defineTask(...) runs during early JS bundle evaluation
 * before React mounts the component tree.
 */
import './tasks/stepBackgroundTask';

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import StepCounterScreen from './screens/StepCounterScreen';
import { registerStepBackgroundTask } from './tasks/stepBackgroundTask';

export default function App() {
  useEffect(() => {
    // Register the background WorkManager / JobScheduler task on app launch
    registerStepBackgroundTask();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <StepCounterScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});
