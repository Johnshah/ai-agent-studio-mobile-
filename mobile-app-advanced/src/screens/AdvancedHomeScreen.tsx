/**
 * 🏠 Advanced Home Screen - AI Agent Studio Pro
 * Ultimate dashboard with real-time AI capabilities and professional design
 * Optimized for Poco X6 Pro and high-performance devices
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  Dimensions,
  StatusBar,
  RefreshControl,
  Alert,
  Platform,
  Animated,
  PanGestureHandler,
  State
} from 'react-native';
import {
  Card,
  Text,
  Button,
  FAB,
  ProgressBar,
  Chip,
  Avatar,
  IconButton,
  Banner,
  Snackbar
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { MaterialIcons } from '@expo/vector-icons';
import Animated as RNAnimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS
} from 'react-native-reanimated';

// Services and utilities
import { AdvancedAIModelService } from '../services/AdvancedAIModelService';
import { AIPerformanceManager } from '../services/AIPerformanceManager';
import { AdvancedSecurityManager } from '../services/AdvancedSecurityManager';
import { OfflineAIManager } from '../services/OfflineAIManager';
import { DeviceOptimizationService } from '../services/DeviceOptimizationService';
import { theme, gradients, themeUtils } from '../utils/theme';

const { width, height } = Dimensions.get('window');

interface HomeScreenProps {
  navigation: any;
  route?: any;
}

interface SystemStats {
  aiModelsLoaded: number;
  totalModels: number;
  processingQueue: number;
  cacheHitRate: number;
  deviceOptimization: string;
  securityLevel: string;
  offlineCapability: number;
}

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  gradient: string[];
  action: () => void;
  badge?: number;
  enabled: boolean;
}

interface RecentGeneration {
  id: string;
  type: 'video' | 'audio' | 'image' | 'code';
  title: string;
  thumbnail: string;
  timestamp: Date;
  quality: string;
  size: string;
}

export default function AdvancedHomeScreen({ navigation }: HomeScreenProps) {
  // State management
  const [systemStats, setSystemStats] = useState<SystemStats>({
    aiModelsLoaded: 0,
    totalModels: 0,
    processingQueue: 0,
    cacheHitRate: 0,
    deviceOptimization: 'Unknown',
    securityLevel: 'Basic',
    offlineCapability: 0
  });
  
  const [recentGenerations, setRecentGenerations] = useState<RecentGeneration[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [realTimeMode, setRealTimeMode] = useState(false);
  
  // Animations
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(-50);
  const pulseAnim = useSharedValue(1);
  const statsCardScale = useSharedValue(1);

  // Services (would be injected via dependency injection in real app)
  const aiService = useMemo(() => {
    // Mock initialization - in real app, get from context/provider
    const perfManager = new AIPerformanceManager();
    const securityManager = new AdvancedSecurityManager();
    const offlineManager = new OfflineAIManager();
    const optimizationService = new DeviceOptimizationService();
    
    return new AdvancedAIModelService(
      perfManager,
      securityManager,
      offlineManager,
      optimizationService
    );
  }, []);

  // Quick Actions Configuration
  const quickActions: QuickAction[] = useMemo(() => [
    {
      id: 'video',
      title: '🎬 AI Video',
      subtitle: 'Create stunning videos',
      icon: 'videocam',
      gradient: gradients.neural,
      action: () => navigateToAIGeneration('video'),
      enabled: true
    },
    {
      id: 'audio',
      title: '🎵 AI Audio',
      subtitle: 'Generate music & voice',
      icon: 'audiotrack',
      gradient: gradients.sunset,
      action: () => navigateToAIGeneration('audio'),
      enabled: true
    },
    {
      id: 'image',
      title: '🎨 AI Images',
      subtitle: 'Create amazing visuals',
      icon: 'image',
      gradient: gradients.ocean,
      action: () => navigateToAIGeneration('image'),
      enabled: true
    },
    {
      id: 'code',
      title: '💻 AI Code',
      subtitle: 'Build apps with AI',
      icon: 'code',
      gradient: gradients.forest,
      action: () => navigateToAIGeneration('code'),
      badge: systemStats.processingQueue,
      enabled: true
    },
    {
      id: 'realtime',
      title: '⚡ Real-time AI',
      subtitle: 'Live AI processing',
      icon: 'flash-on',
      gradient: gradients.cosmic,
      action: () => toggleRealTimeMode(),
      enabled: true
    },
    {
      id: 'offline',
      title: '📱 Offline Mode',
      subtitle: 'Use AI without internet',
      icon: 'offline-bolt',
      gradient: gradients.aiNeutral,
      action: () => navigation.navigate('OfflineAI'),
      enabled: systemStats.offlineCapability > 0
    }
  ], [systemStats, navigation, realTimeMode]);

  // Initialize component
  useEffect(() => {
    initializeHomeScreen();
    startAnimations();
    
    // Update stats every 5 seconds
    const statsInterval = setInterval(updateSystemStats, 5000);
    
    return () => {
      clearInterval(statsInterval);
    };
  }, []);

  const initializeHomeScreen = useCallback(async () => {
    try {
      await updateSystemStats();
      await loadRecentGenerations();
      
      // Show welcome message for first-time users
      const isFirstTime = await checkIfFirstTime();
      if (isFirstTime) {
        showWelcomeMessage();
      }
      
    } catch (error) {
      console.error('Home screen initialization failed:', error);
      setSnackbarMessage('Failed to initialize AI systems');
      setSnackbarVisible(true);
    }
  }, []);

  const updateSystemStats = useCallback(async () => {
    try {
      // Get stats from AI service
      const models = aiService.getAvailableModels();
      const queueLength = aiService.getQueueLength();
      const cacheStats = aiService.getCacheStats();
      
      // Mock additional stats (in real app, get from actual services)
      const newStats: SystemStats = {
        aiModelsLoaded: models.filter(m => m.isEnabled).length,
        totalModels: models.length,
        processingQueue: queueLength,
        cacheHitRate: cacheStats.hitRate,
        deviceOptimization: 'Poco X6 Pro Optimized',
        securityLevel: 'Maximum Security',
        offlineCapability: Math.round(models.filter(m => m.isOfflineCapable).length / models.length * 100)
      };
      
      setSystemStats(newStats);
      
    } catch (error) {
      console.warn('Stats update failed:', error);
    }
  }, [aiService]);

  const loadRecentGenerations = useCallback(async () => {
    try {
      // Mock recent generations (in real app, load from storage/API)
      const mockGenerations: RecentGeneration[] = [
        {
          id: '1',
          type: 'video',
          title: 'Cinematic Landscape',
          thumbnail: 'https://via.placeholder.com/150',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
          quality: 'Ultra 4K',
          size: '2.3 GB'
        },
        {
          id: '2',
          type: 'audio',
          title: 'Epic Orchestra',
          thumbnail: 'https://via.placeholder.com/150',
          timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
          quality: 'High 48kHz',
          size: '45 MB'
        },
        {
          id: '3',
          type: 'image',
          title: 'Futuristic City',
          thumbnail: 'https://via.placeholder.com/150',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          quality: 'Ultra HD',
          size: '12 MB'
        }
      ];
      
      setRecentGenerations(mockGenerations);
      
    } catch (error) {
      console.warn('Failed to load recent generations:', error);
    }
  }, []);

  const startAnimations = useCallback(() => {
    // Entrance animations
    fadeAnim.value = withTiming(1, { duration: 800 });
    slideAnim.value = withSpring(0, { damping: 15, stiffness: 150 });
    
    // Pulse animation for real-time indicator
    const pulsePulse = () => {
      pulseAnim.value = withTiming(1.1, { duration: 1000 }, () => {
        pulseAnim.value = withTiming(1, { duration: 1000 }, () => {
          if (realTimeMode) {
            runOnJS(pulsePulse)();
          }
        });
      });
    };
    
    if (realTimeMode) {
      pulsePulse();
    }
  }, [fadeAnim, slideAnim, pulseAnim, realTimeMode]);

  const navigateToAIGeneration = useCallback((type: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const screens = {
      video: 'VideoGeneration',
      audio: 'AudioGeneration', 
      image: 'ImageGeneration',
      code: 'CodeGeneration'
    };
    
    navigation.navigate(screens[type as keyof typeof screens] || 'VideoGeneration');
  }, [navigation]);

  const toggleRealTimeMode = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    const newRealTimeMode = !realTimeMode;
    setRealTimeMode(newRealTimeMode);
    
    if (newRealTimeMode) {
      try {
        await aiService.startRealTimeSession('sdxl-turbo', 'image');
        setSnackbarMessage('⚡ Real-time AI mode activated!');
      } catch (error) {
        setSnackbarMessage('Failed to start real-time mode');
        setRealTimeMode(false);
      }
    } else {
      setSnackbarMessage('Real-time AI mode deactivated');
    }
    
    setSnackbarVisible(true);
  }, [realTimeMode, aiService]);

  const checkIfFirstTime = async (): Promise<boolean> => {
    // Mock first-time check
    return Math.random() > 0.8; // 20% chance to show welcome
  };

  const showWelcomeMessage = () => {
    Alert.alert(
      '🚀 Welcome to AI Agent Studio Pro!',
      'Your ultimate AI creative companion is ready. Optimized for maximum performance on your device.',
      [
        { text: 'Take Tour', onPress: () => navigation.navigate('Tutorial') },
        { text: 'Start Creating', style: 'default' }
      ]
    );
  };

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      await Promise.all([
        updateSystemStats(),
        loadRecentGenerations()
      ]);
      
      setSnackbarMessage('✅ Data refreshed successfully');
      setSnackbarVisible(true);
      
    } catch (error) {
      setSnackbarMessage('❌ Refresh failed');
      setSnackbarVisible(true);
    } finally {
      setIsRefreshing(false);
    }
  }, [updateSystemStats, loadRecentGenerations]);

  // Animated styles
  const fadeStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideAnim.value }]
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }]
  }));

  const statsCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: statsCardScale.value }]
  }));

  // Render methods
  const renderSystemStats = () => (
    <RNAnimated.View style={[statsCardStyle]}>
      <Card style={[theme.components.card.neural, { marginBottom: theme.spacing.lg }]}>
        <Card.Content>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md }}>
            <Text variant="titleLarge" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
              🤖 AI System Status
            </Text>
            {realTimeMode && (
              <RNAnimated.View style={pulseStyle}>
                <Chip 
                  icon="flash-on" 
                  mode="flat"
                  style={{ backgroundColor: theme.colors.success + '20' }}
                  textStyle={{ color: theme.colors.success, fontSize: 12, fontWeight: 'bold' }}
                >
                  REAL-TIME
                </Chip>
              </RNAnimated.View>
            )}
          </View>
          
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
            <View style={{ flex: 1, minWidth: '45%' }}>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 4 }}>
                AI Models Loaded
              </Text>
              <Text variant="headlineSmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                {systemStats.aiModelsLoaded}/{systemStats.totalModels}
              </Text>
              <ProgressBar 
                progress={systemStats.aiModelsLoaded / systemStats.totalModels} 
                color={theme.colors.primary}
                style={{ marginTop: 4, height: 6, borderRadius: 3 }}
              />
            </View>
            
            <View style={{ flex: 1, minWidth: '45%' }}>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 4 }}>
                Cache Hit Rate
              </Text>
              <Text variant="headlineSmall" style={{ color: theme.colors.success, fontWeight: 'bold' }}>
                {Math.round(systemStats.cacheHitRate * 100)}%
              </Text>
              <ProgressBar 
                progress={systemStats.cacheHitRate} 
                color={theme.colors.success}
                style={{ marginTop: 4, height: 6, borderRadius: 3 }}
              />
            </View>
          </View>
          
          <View style={{ flexDirection: 'row', marginTop: theme.spacing.md, gap: theme.spacing.sm }}>
            <Chip 
              icon="settings" 
              mode="outlined"
              compact
              style={{ borderColor: theme.colors.primary }}
              textStyle={{ color: theme.colors.primary, fontSize: 11 }}
            >
              {systemStats.deviceOptimization}
            </Chip>
            <Chip 
              icon="security" 
              mode="outlined"
              compact
              style={{ borderColor: theme.colors.success }}
              textStyle={{ color: theme.colors.success, fontSize: 11 }}
            >
              {systemStats.securityLevel}
            </Chip>
          </View>
          
          {systemStats.processingQueue > 0 && (
            <View style={{ marginTop: theme.spacing.md, padding: theme.spacing.sm, backgroundColor: theme.colors.warning + '10', borderRadius: theme.borderRadius.md }}>
              <Text variant="bodySmall" style={{ color: theme.colors.warning, textAlign: 'center' }}>
                ⏳ {systemStats.processingQueue} AI operations in queue
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </RNAnimated.View>
  );

  const renderQuickActions = () => (
    <View style={{ marginBottom: theme.spacing.xl }}>
      <Text variant="titleLarge" style={{ marginBottom: theme.spacing.lg, fontWeight: 'bold' }}>
        🚀 Quick Actions
      </Text>
      
      <View style={{ 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        gap: theme.spacing.md,
        justifyContent: 'space-between'
      }}>
        {quickActions.map((action, index) => (
          <RNAnimated.View 
            key={action.id}
            style={[
              fadeStyle,
              { 
                width: '47%',
                minWidth: 150
              }
            ]}
          >
            <Card 
              style={[
                theme.components.card.elevated,
                { 
                  opacity: action.enabled ? 1 : 0.6,
                  overflow: 'hidden'
                }
              ]}
              onPress={action.enabled ? action.action : undefined}
            >
              <LinearGradient
                colors={action.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 60,
                  opacity: 0.1
                }}
              />
              
              <Card.Content style={{ padding: theme.spacing.lg }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm }}>
                  <MaterialIcons 
                    name={action.icon as any} 
                    size={24} 
                    color={action.gradient[0]} 
                  />
                  {action.badge && action.badge > 0 && (
                    <View style={{
                      backgroundColor: theme.colors.error,
                      borderRadius: 10,
                      minWidth: 20,
                      height: 20,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginLeft: theme.spacing.sm
                    }}>
                      <Text variant="labelSmall" style={{ color: 'white', fontWeight: 'bold' }}>
                        {action.badge}
                      </Text>
                    </View>
                  )}
                </View>
                
                <Text 
                  variant="titleMedium" 
                  style={{ 
                    fontWeight: 'bold',
                    marginBottom: 4
                  }}
                >
                  {action.title}
                </Text>
                
                <Text 
                  variant="bodySmall" 
                  style={{ 
                    color: theme.colors.onSurfaceVariant,
                    lineHeight: 16
                  }}
                >
                  {action.subtitle}
                </Text>
              </Card.Content>
            </Card>
          </RNAnimated.View>
        ))}
      </View>
    </View>
  );

  const renderRecentGenerations = () => (
    <View style={{ marginBottom: theme.spacing.xl }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg }}>
        <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>
          📂 Recent Creations
        </Text>
        <Button
          mode="text"
          compact
          onPress={() => navigation.navigate('History')}
        >
          View All
        </Button>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {recentGenerations.map((item) => (
          <Card
            key={item.id}
            style={[
              theme.components.card.default,
              { 
                width: 200,
                marginRight: theme.spacing.md
              }
            ]}
            onPress={() => navigation.navigate('GenerationDetail', { id: item.id })}
          >
            <Card.Cover 
              source={{ uri: item.thumbnail }}
              style={{ height: 120 }}
            />
            <Card.Content style={{ padding: theme.spacing.md }}>
              <Text variant="titleSmall" numberOfLines={1} style={{ fontWeight: 'bold', marginBottom: 4 }}>
                {item.title}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
                {item.quality} • {item.size}
              </Text>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {item.timestamp.toLocaleDateString()}
              </Text>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar backgroundColor={theme.colors.surface} barStyle="dark-content" />
      
      {/* Banner for device optimization status */}
      {showBanner && (
        <Banner
          visible={showBanner}
          actions={[
            {
              label: 'Optimize Now',
              onPress: () => navigation.navigate('Optimization')
            },
            {
              label: 'Dismiss',
              onPress: () => setShowBanner(false)
            }
          ]}
          icon="rocket-launch"
          style={{ backgroundColor: theme.colors.primary + '10' }}
        >
          🚀 Your Poco X6 Pro is ready for maximum AI performance!
        </Banner>
      )}
      
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ 
          padding: theme.spacing.lg,
          paddingBottom: theme.spacing['8xl'] // Extra space for FAB
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Header */}
        <RNAnimated.View style={fadeStyle}>
          <View style={{ marginBottom: theme.spacing.xl }}>
            <Text variant="headlineLarge" style={{ fontWeight: 'bold', marginBottom: 8 }}>
              Welcome back! 👋
            </Text>
            <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Ready to create something amazing with AI?
            </Text>
          </View>
        </RNAnimated.View>

        {/* System Stats */}
        {renderSystemStats()}

        {/* Quick Actions */}
        {renderQuickActions()}

        {/* Recent Generations */}
        {renderRecentGenerations()}
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        label="Create"
        style={{
          position: 'absolute',
          margin: theme.spacing.lg,
          right: 0,
          bottom: 0,
          backgroundColor: theme.colors.primary
        }}
        onPress={() => navigation.navigate('CreateNew')}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{ backgroundColor: theme.colors.surface }}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
}