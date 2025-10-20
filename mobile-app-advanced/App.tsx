/**
 * 🚀 AI Agent Studio Pro - Advanced Mobile App
 * The Ultimate AI Creative Suite with Extreme Performance & Advanced Features
 * Optimized for Poco X6 Pro (12GB RAM, 512GB Storage) and high-end devices
 */

import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, AppState, LogBox, Alert } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as StoreProvider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import * as Notifications from 'expo-notifications';
import * as Updates from 'expo-updates';
import * as Device from 'expo-device';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Advanced imports
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
import { enableFreeze } from 'react-native-screens';

// Store and navigation
import { store } from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';

// Services and utilities
import { AIPerformanceManager } from './src/services/AIPerformanceManager';
import { AdvancedSecurityManager } from './src/services/AdvancedSecurityManager';
import { OfflineAIManager } from './src/services/OfflineAIManager';
import { DeviceOptimizationService } from './src/services/DeviceOptimizationService';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { theme, darkTheme } from './src/utils/theme';
import { initializeApp } from './src/utils/initialization';

// Performance optimizations
enableScreens(true);
enableFreeze(true);

// Ignore specific warnings for production
LogBox.ignoreLogs([
  'Warning: AsyncStorage',
  'Setting a timer',
  'VirtualizedLists should never be nested',
  'Require cycle'
]);

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

interface AppState {
  isLoading: boolean;
  isReady: boolean;
  isDarkMode: boolean;
  deviceInfo: any;
  networkState: any;
  aiInitialized: boolean;
  performanceOptimized: boolean;
  securityInitialized: boolean;
}

export default function App() {
  const [appState, setAppState] = useState<AppState>({
    isLoading: true,
    isReady: false,
    isDarkMode: false,
    deviceInfo: null,
    networkState: null,
    aiInitialized: false,
    performanceOptimized: false,
    securityInitialized: false
  });

  const initializeAdvancedFeatures = useCallback(async () => {
    try {
      console.log('🚀 Initializing AI Agent Studio Pro...');

      // 1. Load fonts with performance optimization (graceful fallback)
      try {
        await Font.loadAsync({
          // Try to load custom fonts, fallback to system fonts if not available
          'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
          'Inter-Medium': require('./assets/fonts/Inter-Medium.ttf'),
          'Inter-SemiBold': require('./assets/fonts/Inter-SemiBold.ttf'),
          'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
          'SpaceGrotesk-Regular': require('./assets/fonts/SpaceGrotesk-Regular.ttf'),
          'SpaceGrotesk-Bold': require('./assets/fonts/SpaceGrotesk-Bold.ttf'),
        });
        console.log('✅ Custom fonts loaded successfully');
      } catch (fontError) {
        console.warn('⚠️ Custom fonts not available, using system fonts:', fontError);
        // Continue without custom fonts - system fonts will be used
      }

      // 2. Initialize device information and optimizations
      const deviceInfo = await Device.getDeviceTypeAsync();
      const deviceName = await Device.deviceName;
      const deviceMemory = await Device.totalMemoryAsync?.() || 0;
      
      console.log(`📱 Device: ${deviceName}, Memory: ${Math.round(deviceMemory / 1024 / 1024 / 1024)}GB`);
      
      // 3. Optimize for Poco X6 Pro and similar high-end devices
      const optimization = new DeviceOptimizationService();
      await optimization.optimizeForDevice({
        name: deviceName || 'Unknown',
        memory: deviceMemory,
        type: deviceInfo
      });

      // 4. Initialize advanced security
      const security = new AdvancedSecurityManager();
      await security.initialize();
      
      // 5. Initialize AI Performance Manager
      const aiPerformance = new AIPerformanceManager();
      await aiPerformance.initialize({
        deviceMemory,
        deviceName: deviceName || 'Unknown',
        enableGPUAcceleration: true,
        enableMLKitOptimization: true,
        enableTensorFlowLiteGPU: true
      });

      // 6. Initialize Offline AI capabilities
      const offlineAI = new OfflineAIManager();
      await offlineAI.initializeLocalModels();

      // 7. Check for app updates
      if (!__DEV__) {
        try {
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            Alert.alert(
              'Update Available',
              'A new version with enhanced AI features is available. Update now?',
              [
                { text: 'Later', style: 'cancel' },
                { 
                  text: 'Update', 
                  onPress: async () => {
                    await Updates.fetchUpdateAsync();
                    Updates.reloadAsync();
                  }
                }
              ]
            );
          }
        } catch (error) {
          console.warn('Update check failed:', error);
        }
      }

      // 8. Get network state for optimization
      const networkState = await NetInfo.fetch();
      
      // 9. Load user preferences
      const preferences = await AsyncStorage.getItem('user_preferences');
      const isDarkMode = preferences ? JSON.parse(preferences).darkMode || false : false;

      // 10. Initialize app with advanced configuration
      await initializeApp({
        deviceOptimization: true,
        aiAcceleration: true,
        securityFeatures: true,
        offlineCapabilities: true,
        performanceMonitoring: true
      });

      setAppState({
        isLoading: false,
        isReady: true,
        isDarkMode,
        deviceInfo: {
          name: deviceName,
          memory: deviceMemory,
          type: deviceInfo
        },
        networkState,
        aiInitialized: true,
        performanceOptimized: true,
        securityInitialized: true
      });

      console.log('✅ AI Agent Studio Pro initialized successfully!');

    } catch (error) {
      console.error('❌ Initialization error:', error);
      
      // Fallback initialization
      setAppState(prev => ({
        ...prev,
        isLoading: false,
        isReady: true,
        aiInitialized: false,
        performanceOptimized: false,
        securityInitialized: false
      }));
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      if (mounted) {
        await initializeAdvancedFeatures();
        
        // Hide splash screen after everything is loaded
        setTimeout(async () => {
          if (mounted) {
            await SplashScreen.hideAsync();
          }
        }, 1000);
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, [initializeAdvancedFeatures]);

  // Handle app state changes for performance optimization
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        // Resume AI processing and optimization
        console.log('📱 App resumed - optimizing performance');
      } else if (nextAppState === 'background') {
        // Pause heavy AI operations to save battery
        console.log('📱 App backgrounded - reducing AI operations');
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  // Network monitoring for AI model optimization
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setAppState(prev => ({ ...prev, networkState: state }));
      
      // Optimize AI model loading based on network
      if (state.isConnected && state.details?.isConnectionExpensive === false) {
        console.log('🌐 High-speed connection - enabling full AI features');
      } else {
        console.log('🌐 Limited connection - using offline AI models');
      }
    });

    return unsubscribe;
  }, []);

  if (appState.isLoading || !appState.isReady) {
    // Keep splash screen visible
    return null;
  }

  const selectedTheme = appState.isDarkMode ? darkTheme : theme;
  const navigationTheme = appState.isDarkMode ? DarkTheme : DefaultTheme;

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StoreProvider store={store}>
            <PaperProvider theme={selectedTheme}>
              <NavigationContainer theme={navigationTheme}>
                <StatusBar 
                  style={appState.isDarkMode ? 'light' : 'dark'}
                  backgroundColor={selectedTheme.colors.surface}
                  translucent={false}
                />
                <AppNavigator 
                  initialState={{
                    deviceOptimized: appState.performanceOptimized,
                    aiReady: appState.aiInitialized,
                    secureMode: appState.securityInitialized,
                    deviceInfo: appState.deviceInfo,
                    networkState: appState.networkState
                  }}
                />
              </NavigationContainer>
            </PaperProvider>
          </StoreProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}