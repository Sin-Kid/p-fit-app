/**
 * App.js - P-Fit "Vital Pulse" Android Mobile Application
 * 
 * Embeds https://p-fit.netlify.app with full native hardware integration,
 * Android back-button handling, pull-to-refresh, and loading states.
 */
import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
  Platform,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';

const APP_URL = 'https://p-fit.netlify.app';

export default function App() {
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Handle Android hardware back button
  useEffect(() => {
    if (Platform.OS === 'android') {
      const onBackPress = () => {
        if (canGoBack && webViewRef.current) {
          webViewRef.current.goBack();
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }
  }, [canGoBack]);

  const handleRetry = useCallback(() => {
    setHasError(false);
    setIsLoading(true);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />

      {/* Main WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: APP_URL }}
        style={styles.webView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        pullToRefreshEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        bounces={true}
        onNavigationStateChange={(navState) => {
          setCanGoBack(navState.canGoBack);
        }}
        onLoadStart={() => {
          setIsLoading(true);
          setHasError(false);
        }}
        onLoadEnd={() => {
          setIsLoading(false);
        }}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          if (nativeEvent.statusCode >= 400) {
            console.log('[WebView] HTTP error status:', nativeEvent.statusCode);
          }
        }}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0F172A" />
            <Text style={styles.loadingText}>Loading P-Fit Vital Pulse...</Text>
          </View>
        )}
      />

      {/* Error Fallback View */}
      {hasError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>📡</Text>
          <Text style={styles.errorTitle}>Connection Failed</Text>
          <Text style={styles.errorDesc}>
            Could not connect to P-Fit. Please check your internet connection and try again.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry} activeOpacity={0.85}>
            <Text style={styles.retryButtonText}>Retry Connection</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  webView: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 14,
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 8,
  },
  errorDesc: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
