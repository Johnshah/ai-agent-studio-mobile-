/**
 * Home Screen - Main dashboard for AI Agent Studio Cloud
 * Optimized for Poco X6 Pro with smooth animations and cloud connectivity
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../App';
import { CloudAPIService, TaskStatus, UserProfile } from '../services/CloudAPIService';
import { WebSocketService } from '../services/WebSocketService';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'> & {
  onLogout: () => void;
};

const { width } = Dimensions.get('window');

const HomeScreen: React.FC<Props> = ({ navigation, onLogout }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [recentTasks, setRecentTasks] = useState<TaskStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('CONNECTING');

  useEffect(() => {
    loadDashboardData();
    setupWebSocketListeners();
    
    return () => {
      // Cleanup WebSocket listeners
    };
  }, []);

  const setupWebSocketListeners = () => {
    // Monitor WebSocket connection status
    const unsubscribeConnection = WebSocketService.subscribeToConnection(
      () => setConnectionStatus('CONNECTED'),
      () => setConnectionStatus('DISCONNECTED')
    );

    // Listen for task updates
    const unsubscribeProgress = WebSocketService.subscribeToProgress((data) => {
      console.log('Task progress update:', data);
      // Update recent tasks with progress
      setRecentTasks(prev => 
        prev.map(task => 
          task.task_id === data.taskId 
            ? { ...task, progress: data.progress, status: data.status as any }
            : task
        )
      );
    });

    const unsubscribeCompletion = WebSocketService.subscribeToCompletion((data) => {
      console.log('Task completed:', data);
      // Refresh recent tasks
      loadRecentTasks();
    });

    return () => {
      unsubscribeConnection();
      unsubscribeProgress();
      unsubscribeCompletion();
    };
  };

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadUserProfile(),
        loadRecentTasks(),
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserProfile = async () => {
    const response = await CloudAPIService.getUserProfile();
    if (response.success && response.data) {
      setUserProfile(response.data);
    } else {
      console.error('Failed to load user profile:', response.error);
    }
  };

  const loadRecentTasks = async () => {
    const response = await CloudAPIService.getUserTasks(10);
    if (response.success && response.data) {
      setRecentTasks(response.data.tasks);
    } else {
      console.error('Failed to load recent tasks:', response.error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  };

  const navigateToGeneration = (type: 'video' | 'audio' | 'image' | 'code') => {
    navigation.navigate('Generation', { type });
  };

  const navigateToTaskDetails = (taskId: string) => {
    navigation.navigate('Results', { taskId });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'failed':
        return 'close-circle';
      case 'processing':
        return 'hourglass';
      default:
        return 'time';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'failed':
        return '#F44336';
      case 'processing':
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  };

  const renderGenerationCard = (
    type: 'video' | 'audio' | 'image' | 'code',
    title: string,
    icon: string,
    gradient: string[],
    description: string
  ) => (
    <TouchableOpacity
      style={styles.generationCard}
      onPress={() => navigateToGeneration(type)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={gradient}
        style={styles.cardGradient}
      >
        <Ionicons name={icon as any} size={32} color="white" />
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>
            Welcome back{userProfile ? `, ${userProfile.username}` : ''}!
          </Text>
          <Text style={styles.subtitleText}>Create amazing AI content instantly</Text>
          
          <View style={styles.statusRow}>
            <View style={styles.connectionStatus}>
              <View style={[
                styles.statusDot,
                { backgroundColor: connectionStatus === 'CONNECTED' ? '#4CAF50' : '#F44336' }
              ]} />
              <Text style={styles.statusText}>
                {connectionStatus === 'CONNECTED' ? 'Cloud Connected' : 'Connecting...'}
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <Ionicons name="person-circle" size={28} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Generation Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Create New Content</Text>
        
        <View style={styles.cardsContainer}>
          {renderGenerationCard(
            'video',
            'Video',
            'videocam',
            ['#FF6B6B', '#FF8E53'],
            'Create AI videos with Wan2.2 & Stable Video'
          )}
          
          {renderGenerationCard(
            'audio',
            'Audio',
            'musical-notes',
            ['#4ECDC4', '#44A08D'],
            'Generate music & sounds with MusicGen'
          )}
          
          {renderGenerationCard(
            'image',
            'Images',
            'image',
            ['#A8E6CF', '#7FCDCD'],
            'Create stunning images with SDXL & DALL-E'
          )}
          
          {renderGenerationCard(
            'code',
            'Code',
            'code-slash',
            ['#FFD93D', '#6BCF7F'],
            'Generate apps with Code Llama & DeepSeek'
          )}
        </View>
      </View>

      {/* User Stats */}
      {userProfile && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Usage Stats</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {userProfile.quota_used.daily_tasks || 0}
              </Text>
              <Text style={styles.statLabel}>Tasks Today</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {userProfile.quota_used.video_generation || 0}
              </Text>
              <Text style={styles.statLabel}>Videos</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {userProfile.quota_used.image_generation || 0}
              </Text>
              <Text style={styles.statLabel}>Images</Text>
            </View>
          </View>
        </View>
      )}

      {/* Recent Tasks */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        
        {recentTasks.length > 0 ? (
          recentTasks.map((task) => (
            <TouchableOpacity
              key={task.task_id}
              style={styles.taskCard}
              onPress={() => navigateToTaskDetails(task.task_id)}
            >
              <View style={styles.taskHeader}>
                <Ionicons 
                  name={getStatusIcon(task.status)}
                  size={20} 
                  color={getStatusColor(task.status)}
                />
                <Text style={styles.taskType}>{task.type.replace('_', ' ')}</Text>
                <Text style={styles.taskTime}>
                  {new Date(task.created_at).toLocaleDateString()}
                </Text>
              </View>
              
              <Text style={styles.taskPrompt} numberOfLines={2}>
                {task.prompt}
              </Text>
              
              {task.status === 'processing' && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${task.progress || 0}%` }
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>{task.progress || 0}%</Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>No recent activity</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#000000',
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'flex-start',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitleText: {
    fontSize: 16,
    color: '#cccccc',
    marginBottom: 15,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
  },
  profileButton: {
    padding: 5,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  generationCard: {
    width: (width - 60) / 2,
    height: 120,
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardGradient: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  cardDescription: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  taskCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flex: 1,
    textTransform: 'capitalize',
  },
  taskTime: {
    fontSize: 12,
    color: '#666',
  },
  taskPrompt: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginRight: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    minWidth: 35,
    textAlign: 'right',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginTop: 20,
  },
});

export default HomeScreen;