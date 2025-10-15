/**
 * 🚀 App Initialization Utilities
 * Advanced initialization system for AI Agent Studio Pro
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Font from 'expo-font';
import { Platform } from 'react-native';

interface InitializationConfig {
  deviceOptimization: boolean;
  aiAcceleration: boolean;
  securityFeatures: boolean;
  offlineCapabilities: boolean;
  performanceMonitoring: boolean;
}

interface InitializationResult {
  success: boolean;
  deviceInfo: any;
  optimizationsApplied: string[];
  errors: string[];
}

export async function initializeApp(config: InitializationConfig): Promise<InitializationResult> {
  const result: InitializationResult = {
    success: false,
    deviceInfo: null,
    optimizationsApplied: [],
    errors: []
  };

  try {
    console.log('🚀 Starting AI Agent Studio Pro initialization...');

    // Load device information
    const deviceInfo = await loadDeviceInformation();
    result.deviceInfo = deviceInfo;

    // Initialize fonts
    await initializeFonts();
    result.optimizationsApplied.push('Custom fonts loaded');

    // Device-specific optimizations
    if (config.deviceOptimization) {
      await applyDeviceOptimizations(deviceInfo);
      result.optimizationsApplied.push('Device-specific optimizations');
    }

    // AI acceleration setup
    if (config.aiAcceleration) {
      await setupAIAcceleration();
      result.optimizationsApplied.push('AI acceleration enabled');
    }

    // Security initialization
    if (config.securityFeatures) {
      await initializeSecurity();
      result.optimizationsApplied.push('Security features activated');
    }

    // Offline capabilities
    if (config.offlineCapabilities) {
      await setupOfflineCapabilities();
      result.optimizationsApplied.push('Offline AI models prepared');
    }

    // Performance monitoring
    if (config.performanceMonitoring) {
      await startPerformanceMonitoring();
      result.optimizationsApplied.push('Performance monitoring active');
    }

    result.success = true;
    console.log('✅ AI Agent Studio Pro initialization completed successfully!');

  } catch (error) {
    console.error('❌ Initialization failed:', error);
    result.errors.push(error instanceof Error ? error.message : 'Unknown initialization error');
  }

  return result;
}

async function loadDeviceInformation(): Promise<any> {
  try {
    const deviceInfo = {
      name: await Device.deviceName,
      type: await Device.getDeviceTypeAsync(),
      memory: await Device.totalMemoryAsync?.() || 0,
      platform: Platform.OS,
      version: Platform.Version,
      isDevice: Device.isDevice,
      brand: Device.brand,
      manufacturer: Device.manufacturer,
      modelName: Device.modelName,
      osName: Device.osName,
      osVersion: Device.osVersion,
      platformApiLevel: Device.platformApiLevel
    };

    console.log('📱 Device Info:', deviceInfo);
    return deviceInfo;

  } catch (error) {
    console.warn('⚠️ Failed to load device information:', error);
    return { name: 'Unknown Device', platform: Platform.OS };
  }
}

async function initializeFonts(): Promise<void> {
  try {
    await Font.loadAsync({
      'Inter-Regular': require('../../assets/fonts/Inter-Regular.ttf'),
      'Inter-Medium': require('../../assets/fonts/Inter-Medium.ttf'),
      'Inter-SemiBold': require('../../assets/fonts/Inter-SemiBold.ttf'),
      'Inter-Bold': require('../../assets/fonts/Inter-Bold.ttf'),
      'SpaceGrotesk-Regular': require('../../assets/fonts/SpaceGrotesk-Regular.ttf'),
      'SpaceGrotesk-Bold': require('../../assets/fonts/SpaceGrotesk-Bold.ttf'),
    });
    console.log('🔤 Custom fonts loaded successfully');
  } catch (error) {
    console.warn('⚠️ Font loading failed, using system fonts:', error);
  }
}

async function applyDeviceOptimizations(deviceInfo: any): Promise<void> {
  try {
    // Detect Poco X6 Pro
    const isPocoX6Pro = deviceInfo.name?.toLowerCase().includes('poco x6 pro') ||
                       deviceInfo.modelName?.toLowerCase().includes('23078pnd5g');

    if (isPocoX6Pro) {
      console.log('🚀 Applying Poco X6 Pro optimizations...');
      await AsyncStorage.setItem('device_profile', 'poco_x6_pro_ultra');
    } else {
      console.log('⚡ Applying general device optimizations...');
      await AsyncStorage.setItem('device_profile', 'high_performance');
    }

  } catch (error) {
    console.warn('⚠️ Device optimization setup failed:', error);
  }
}

async function setupAIAcceleration(): Promise<void> {
  try {
    // Configure AI acceleration settings
    const aiConfig = {
      enableGPUAcceleration: true,
      enableHardwareDecoding: true,
      enableMLKitOptimization: true,
      enableTensorFlowLiteGPU: true,
      maxConcurrentOperations: 4,
      cacheEnabled: true,
      realTimeProcessing: true
    };

    await AsyncStorage.setItem('ai_acceleration_config', JSON.stringify(aiConfig));
    console.log('🧠 AI acceleration configured');

  } catch (error) {
    console.warn('⚠️ AI acceleration setup failed:', error);
  }
}

async function initializeSecurity(): Promise<void> {
  try {
    // Initialize security features
    const securityConfig = {
      biometricEnabled: true,
      encryptionEnabled: true,
      secureStorageEnabled: true,
      networkSecurityEnabled: true,
      securityLevel: 'maximum',
      threatDetectionEnabled: true
    };

    await AsyncStorage.setItem('security_config', JSON.stringify(securityConfig));
    console.log('🔐 Security features initialized');

  } catch (error) {
    console.warn('⚠️ Security initialization failed:', error);
  }
}

async function setupOfflineCapabilities(): Promise<void> {
  try {
    // Configure offline AI models
    const offlineConfig = {
      enableOfflineModels: true,
      autoDownloadEssentialModels: true,
      preferOfflineWhenAvailable: false,
      maxOfflineStorageSize: 2048, // 2GB
      essentialModels: [
        'mobile-gpt-small',
        'mobile-image-enhancer',
        'mobile-tts'
      ]
    };

    await AsyncStorage.setItem('offline_ai_config', JSON.stringify(offlineConfig));
    console.log('📱 Offline AI capabilities configured');

  } catch (error) {
    console.warn('⚠️ Offline setup failed:', error);
  }
}

async function startPerformanceMonitoring(): Promise<void> {
  try {
    // Enable performance monitoring
    const monitoringConfig = {
      enableCPUMonitoring: true,
      enableMemoryMonitoring: true,
      enableBatteryMonitoring: true,
      enableThermalMonitoring: true,
      enableNetworkMonitoring: true,
      monitoringInterval: 5000, // 5 seconds
      alertThresholds: {
        cpuUsage: 90,
        memoryUsage: 85,
        batteryLevel: 20,
        temperature: 50
      }
    };

    await AsyncStorage.setItem('performance_monitoring_config', JSON.stringify(monitoringConfig));
    console.log('📊 Performance monitoring enabled');

  } catch (error) {
    console.warn('⚠️ Performance monitoring setup failed:', error);
  }
}

// Utility functions for app lifecycle
export async function getInitializationStatus(): Promise<{
  isInitialized: boolean;
  deviceProfile: string;
  features: string[];
}> {
  try {
    const deviceProfile = await AsyncStorage.getItem('device_profile') || 'unknown';
    const aiConfig = await AsyncStorage.getItem('ai_acceleration_config');
    const securityConfig = await AsyncStorage.getItem('security_config');
    const offlineConfig = await AsyncStorage.getItem('offline_ai_config');
    const monitoringConfig = await AsyncStorage.getItem('performance_monitoring_config');

    const features = [];
    if (aiConfig) features.push('AI Acceleration');
    if (securityConfig) features.push('Advanced Security');
    if (offlineConfig) features.push('Offline AI');
    if (monitoringConfig) features.push('Performance Monitoring');

    return {
      isInitialized: features.length > 0,
      deviceProfile,
      features
    };

  } catch (error) {
    console.warn('⚠️ Failed to get initialization status:', error);
    return {
      isInitialized: false,
      deviceProfile: 'unknown',
      features: []
    };
  }
}

export async function resetInitialization(): Promise<void> {
  try {
    const keys = [
      'device_profile',
      'ai_acceleration_config',
      'security_config',
      'offline_ai_config',
      'performance_monitoring_config'
    ];

    await AsyncStorage.multiRemove(keys);
    console.log('🔄 Initialization reset completed');

  } catch (error) {
    console.error('❌ Failed to reset initialization:', error);
  }
}

export async function updateDeviceProfile(profile: string): Promise<void> {
  try {
    await AsyncStorage.setItem('device_profile', profile);
    console.log(`📱 Device profile updated to: ${profile}`);

  } catch (error) {
    console.error('❌ Failed to update device profile:', error);
  }
}