/**
 * Progress Screen - Real-time generation progress with WebSocket updates
 * Instant cloud result delivery optimized for Poco X6 Pro
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Progress from 'react-native-progress';
import { RootStackParamList } from '../../App';
import { CloudAPIService, TaskStatus } from '../services/CloudAPIService';
import { WebSocketService } from '../services/WebSocketService';

type Props = NativeStackScreenProps<RootStackParamList, 'Progress'>;

const { width } = Dimensions.get('window');

const ProgressScreen: React.FC<Props> = ({ route, navigation }) => {
  const { taskId, type } = route.params;
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('pending');
  const [message, setMessage] = useState('Initializing...');
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Subscribe to WebSocket updates
    const unsubscribeTask = WebSocketService.subscribeToTask(taskId, handleWebSocketUpdate);
    const unsubscribeCompletion = WebSocketService.subscribeToCompletion(handleCompletion);
    const unsubscribeFailure = WebSocketService.subscribeToFailure(handleFailure);

    // Start polling as backup
    const pollInterval = setInterval(pollTaskStatus, 3000);

    // Initial status check
    pollTaskStatus();

    return () => {
      unsubscribeTask();
      unsubscribeCompletion();
      unsubscribeFailure();
      clearInterval(pollInterval);
    };
  }, [taskId]);

  const handleWebSocketUpdate = (message: any) => {
    console.log('WebSocket update:', message);
    
    if (message.progress !== undefined) {
      setProgress(message.progress / 100);
      setMessage(getProgressMessage(message.progress));
    }
    
    if (message.status) {
      setStatus(message.status);
    }
  };

  const handleCompletion = (data: any) => {
    if (data.taskId === taskId) {
      setProgress(1);
      setStatus('completed');
      setMessage('Complete! Loading results...');
      
      // Navigate to results after short delay
      setTimeout(() => {
        navigation.replace('Results', { taskId });
      }, 1500);
    }
  };

  const handleFailure = (data: any) => {
    if (data.taskId === taskId) {
      setStatus('failed');
      setMessage(`Failed: ${data.error || 'Unknown error'}`);
    }
  };

  const pollTaskStatus = async () => {
    const response = await CloudAPIService.getTaskStatus(taskId);
    
    if (response.success && response.data) {
      const taskStatus: TaskStatus = response.data;
      
      setProgress(taskStatus.progress / 100);
      setStatus(taskStatus.status);
      
      if (taskStatus.status === 'completed') {
        setMessage('Complete! Loading results...');
        setTimeout(() => {
          navigation.replace('Results', { taskId });
        }, 1500);
      } else if (taskStatus.status === 'failed') {
        setMessage(`Failed: ${taskStatus.error || 'Unknown error'}`);
      } else {
        setMessage(getProgressMessage(taskStatus.progress));
      }
    }
  };

  const getProgressMessage = (prog: number): string => {
    if (prog < 10) return 'Initializing cloud servers...';
    if (prog < 25) return 'Loading AI models...';
    if (prog < 50) return 'Processing your request...';
    if (prog < 75) return 'Generating content...';
    if (prog < 95) return 'Finalizing and optimizing...';
    return 'Almost ready!';
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'video': return 'videocam';
      case 'audio': return 'musical-notes';
      case 'image': return 'image';
      case 'code': return 'code-slash';
      default: return 'sparkles';
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'video': return '#FF6B6B';
      case 'audio': return '#4ECDC4';
      case 'image': return '#A8E6CF';
      case 'code': return '#FFD93D';
      default: return '#007AFF';
    }
  };

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: getTypeColor() }]}>
          <Ionicons name={getTypeIcon() as any} size={64} color="white" />
        </View>

        {/* Progress Circle */}
        <View style={styles.progressContainer}>
          <Progress.Circle
            size={200}
            progress={progress}
            thickness={8}
            color={getTypeColor()}
            unfilledColor="rgba(255,255,255,0.1)"
            borderWidth={0}
            showsText
            formatText={() => `${Math.round(progress * 100)}%`}
            textStyle={styles.progressText}
          />
        </View>

        {/* Status Message */}
        <Text style={styles.statusMessage}>{message}</Text>

        {/* Status Indicator */}
        <View style={styles.statusContainer}>
          {status === 'failed' ? (
            <Ionicons name="close-circle" size={24} color="#F44336" />
          ) : (
            <ActivityIndicator size="large" color={getTypeColor()} />
          )}
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Ionicons name="cloud" size={20} color="#ccc" />
            <Text style={styles.infoText}>Processing on cloud servers</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="flash" size={20} color="#ccc" />
            <Text style={styles.infoText}>Powered by Hugging Face AI</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle" size={20} color="#ccc" />
            <Text style={styles.infoText}>Real-time updates via WebSocket</Text>
          </View>
        </View>

        {/* Task ID */}
        <Text style={styles.taskId}>Task ID: {taskId.substring(0, 8)}...</Text>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  progressContainer: {
    marginBottom: 40,
  },
  progressText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  statusMessage: {
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '600',
  },
  statusContainer: {
    marginBottom: 40,
  },
  infoContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    color: '#ccc',
    fontSize: 14,
    marginLeft: 10,
  },
  taskId: {
    color: '#666',
    fontSize: 12,
  },
});

export default ProgressScreen;