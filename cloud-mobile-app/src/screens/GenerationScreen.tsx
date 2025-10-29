/**
 * Generation Screen - Create AI content with cloud backend
 * Optimized for Poco X6 Pro with real-time cloud processing
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../App';
import { CloudAPIService } from '../services/CloudAPIService';

type Props = NativeStackScreenProps<RootStackParamList, 'Generation'>;

const GenerationScreen: React.FC<Props> = ({ route, navigation }) => {
  const { type } = route.params;
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const getTypeInfo = () => {
    switch (type) {
      case 'video':
        return {
          title: 'Generate Video',
          icon: 'videocam',
          color: '#FF6B6B',
          placeholder: 'Describe the video you want to create...\nExample: A beautiful sunset over the ocean with waves',
        };
      case 'audio':
        return {
          title: 'Generate Audio',
          icon: 'musical-notes',
          color: '#4ECDC4',
          placeholder: 'Describe the audio you want to create...\nExample: Calm ambient music with piano and strings',
        };
      case 'image':
        return {
          title: 'Generate Image',
          icon: 'image',
          color: '#A8E6CF',
          placeholder: 'Describe the image you want to create...\nExample: A futuristic cityscape at night with neon lights',
        };
      case 'code':
        return {
          title: 'Generate Code',
          icon: 'code-slash',
          color: '#FFD93D',
          placeholder: 'Describe the code you want to generate...\nExample: Create a React Native login screen with email and password',
        };
    }
  };

  const typeInfo = getTypeInfo();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      Alert.alert('Error', 'Please enter a prompt');
      return;
    }

    setIsGenerating(true);

    try {
      let response;

      switch (type) {
        case 'video':
          response = await CloudAPIService.generateVideo({ prompt });
          break;
        case 'audio':
          response = await CloudAPIService.generateAudio({ prompt });
          break;
        case 'image':
          response = await CloudAPIService.generateImage({ prompt });
          break;
        case 'code':
          response = await CloudAPIService.generateCode({ prompt });
          break;
      }

      if (response?.success && response.data) {
        // Navigate to progress screen
        navigation.replace('Progress', {
          taskId: response.data.task_id,
          type: type,
        });
      } else {
        Alert.alert('Error', response?.error || 'Generation failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={[typeInfo.color, typeInfo.color + '88']}
            style={styles.iconContainer}
          >
            <Ionicons name={typeInfo.icon as any} size={48} color="white" />
          </LinearGradient>
          <Text style={styles.title}>{typeInfo.title}</Text>
          <Text style={styles.subtitle}>Powered by Cloud AI Models</Text>
        </View>

        {/* Prompt Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Your Prompt</Text>
          <TextInput
            style={styles.promptInput}
            placeholder={typeInfo.placeholder}
            placeholderTextColor="#999"
            value={prompt}
            onChangeText={setPrompt}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
          />
          <Text style={styles.characterCount}>{prompt.length} characters</Text>
        </View>

        {/* Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Tips for better results:</Text>
          <Text style={styles.tipText}>• Be specific and descriptive</Text>
          <Text style={styles.tipText}>• Include details about style, mood, or atmosphere</Text>
          <Text style={styles.tipText}>• Mention colors, lighting, or specific elements</Text>
          <Text style={styles.tipText}>• Keep it clear and concise</Text>
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          style={[styles.generateButton, isGenerating && styles.disabledButton]}
          onPress={handleGenerate}
          disabled={isGenerating}
        >
          <LinearGradient
            colors={[typeInfo.color, typeInfo.color + 'CC']}
            style={styles.buttonGradient}
          >
            {isGenerating ? (
              <>
                <Ionicons name="hourglass" size={24} color="white" />
                <Text style={styles.buttonText}>Processing...</Text>
              </>
            ) : (
              <>
                <Ionicons name="sparkles" size={24} color="white" />
                <Text style={styles.buttonText}>Generate with AI</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Info */}
        <Text style={styles.infoText}>
          Your content will be generated on our cloud servers with Hugging Face AI models.
          You'll receive real-time updates on the progress.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  inputSection: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  promptInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#333',
    minHeight: 150,
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 5,
  },
  tipsSection: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    lineHeight: 20,
  },
  generateButton: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default GenerationScreen;