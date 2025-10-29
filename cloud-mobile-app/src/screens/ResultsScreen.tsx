/**
 * Results Screen - Display generated content from cloud
 * Instant result delivery optimized for Poco X6 Pro
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Share,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../App';
import { CloudAPIService, TaskStatus } from '../services/CloudAPIService';

type Props = NativeStackScreenProps<RootStackParamList, 'Results'>;

const ResultsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { taskId } = route.params;
  const [taskData, setTaskData] = useState<TaskStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, [taskId]);

  const loadResults = async () => {
    setIsLoading(true);
    const response = await CloudAPIService.getTaskStatus(taskId);
    
    if (response.success && response.data) {
      setTaskData(response.data);
    } else {
      Alert.alert('Error', 'Failed to load results');
    }
    
    setIsLoading(false);
  };

  const handleShare = async () => {
    if (!taskData?.result) return;
    
    try {
      await Share.share({
        message: `Check out my AI-generated content! Prompt: ${taskData.prompt}`,
        url: taskData.result.image_url || taskData.result.video_url || taskData.result.audio_url,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const renderResult = () => {
    if (!taskData?.result) {
      return (
        <Text style={styles.emptyText}>No result available</Text>
      );
    }

    const result = taskData.result;

    switch (taskData.type) {
      case 'image_generation':
        return (
          <View style={styles.resultContainer}>
            {result.image_url && (
              <Image
                source={{ uri: result.image_url }}
                style={styles.resultImage}
                resizeMode="contain"
              />
            )}
            <Text style={styles.resultInfo}>
              {result.width} × {result.height} • {result.format?.toUpperCase()}
            </Text>
          </View>
        );

      case 'video_generation':
        return (
          <View style={styles.resultContainer}>
            <View style={styles.videoPlaceholder}>
              <Ionicons name="videocam" size={64} color="#666" />
              <Text style={styles.placeholderText}>Video Ready</Text>
            </View>
            <Text style={styles.resultInfo}>
              Duration: {result.duration}s • {result.format?.toUpperCase()}
            </Text>
            {result.video_url && (
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="play-circle" size={24} color="white" />
                <Text style={styles.actionButtonText}>Play Video</Text>
              </TouchableOpacity>
            )}
          </View>
        );

      case 'audio_generation':
        return (
          <View style={styles.resultContainer}>
            <View style={styles.audioPlaceholder}>
              <Ionicons name="musical-notes" size={64} color="#666" />
              <Text style={styles.placeholderText}>Audio Ready</Text>
            </View>
            <Text style={styles.resultInfo}>
              Duration: {result.duration}s • {result.format?.toUpperCase()}
            </Text>
            {result.audio_url && (
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="play" size={24} color="white" />
                <Text style={styles.actionButtonText}>Play Audio</Text>
              </TouchableOpacity>
            )}
          </View>
        );

      case 'code_generation':
        return (
          <View style={styles.resultContainer}>
            <View style={styles.codeContainer}>
              <Text style={styles.codeText} numberOfLines={15}>
                {result.code || 'Code generated successfully'}
              </Text>
            </View>
            {result.explanation && (
              <View style={styles.explanationContainer}>
                <Text style={styles.explanationTitle}>Explanation:</Text>
                <Text style={styles.explanationText}>{result.explanation}</Text>
              </View>
            )}
          </View>
        );

      default:
        return (
          <Text style={styles.emptyText}>Result type not supported</Text>
        );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading results...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.statusBadge}>
          <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          <Text style={styles.statusText}>Completed</Text>
        </View>
        
        <Text style={styles.taskType}>
          {taskData?.type.replace('_', ' ').toUpperCase()}
        </Text>
      </View>

      {/* Prompt */}
      <View style={styles.promptContainer}>
        <Text style={styles.promptLabel}>Your Prompt:</Text>
        <Text style={styles.promptText}>{taskData?.prompt}</Text>
      </View>

      {/* Result */}
      {renderResult()}

      {/* Metadata */}
      {taskData && (
        <View style={styles.metadataContainer}>
          <Text style={styles.metadataTitle}>Generation Details</Text>
          
          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Model:</Text>
            <Text style={styles.metadataValue}>{taskData.result?.model_used || 'N/A'}</Text>
          </View>
          
          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Generation Time:</Text>
            <Text style={styles.metadataValue}>
              {taskData.result?.generation_time ? `${taskData.result.generation_time}s` : 'N/A'}
            </Text>
          </View>
          
          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Created:</Text>
            <Text style={styles.metadataValue}>
              {new Date(taskData.created_at).toLocaleString()}
            </Text>
          </View>
          
          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Task ID:</Text>
            <Text style={styles.metadataValue}>{taskData.task_id.substring(0, 16)}...</Text>
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Ionicons name="share-social" size={24} color="white" />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() => navigation.navigate('Home')}
        >
          <Ionicons name="home" size={24} color="#007AFF" />
          <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
            Back to Home
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 10,
  },
  statusText: {
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 5,
  },
  taskType: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  promptContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 10,
  },
  promptLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  promptText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  resultContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 10,
  },
  resultImage: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 10,
  },
  resultInfo: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  videoPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  audioPlaceholder: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  codeContainer: {
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#d4d4d4',
    lineHeight: 18,
  },
  explanationContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  explanationText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  metadataContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 10,
  },
  metadataTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  metadataLabel: {
    fontSize: 14,
    color: '#666',
  },
  metadataValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  actionsContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default ResultsScreen;