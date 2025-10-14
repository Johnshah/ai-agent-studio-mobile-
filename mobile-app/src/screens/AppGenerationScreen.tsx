import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Select,
  CheckIcon,
  Switch,
  TextArea,
  ScrollView,
  Heading,
  Progress,
  useToast,
  Modal,
  FormControl,
  Badge,
  Divider,
  IconButton,
  Checkbox,
  Image,
  useDisclose,
  ActionSheet
} from 'native-base';
import { Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { WebView } from 'react-native-webview';

import { aiModelService, AppGenerationParams, AIModel } from '../services/AIModelService';

const { width } = Dimensions.get('window');

interface AppTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  features: string[];
  preview?: string;
}

const APP_TEMPLATES: AppTemplate[] = [
  {
    id: 'social-media',
    name: 'Social Media App',
    description: 'Instagram/TikTok-like social platform',
    category: 'Social',
    features: ['user-auth', 'feed', 'stories', 'messaging', 'media-upload']
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce Store',
    description: 'Complete online shopping platform',
    category: 'Business',
    features: ['product-catalog', 'cart', 'payment', 'user-accounts', 'reviews']
  },
  {
    id: 'fitness',
    name: 'Fitness Tracker',
    description: 'Health and workout tracking app',
    category: 'Health',
    features: ['workout-tracking', 'nutrition', 'progress-charts', 'social-features']
  },
  {
    id: 'productivity',
    name: 'Task Manager',
    description: 'Project and task management tool',
    category: 'Productivity',
    features: ['task-lists', 'calendar', 'notifications', 'collaboration', 'reports']
  },
  {
    id: 'education',
    name: 'Learning Platform',
    description: 'Online course and education app',
    category: 'Education',
    features: ['courses', 'quizzes', 'progress-tracking', 'certificates', 'discussion']
  },
  {
    id: 'entertainment',
    name: 'Streaming App',
    description: 'Video/music streaming platform',
    category: 'Entertainment',
    features: ['media-player', 'playlists', 'recommendations', 'offline-mode']
  },
  {
    id: 'finance',
    name: 'Finance Manager',
    description: 'Personal finance and budgeting app',
    category: 'Finance',
    features: ['expense-tracking', 'budgets', 'reports', 'bank-sync', 'investments']
  },
  {
    id: 'travel',
    name: 'Travel Planner',
    description: 'Trip planning and booking app',
    category: 'Travel',
    features: ['trip-planning', 'bookings', 'maps', 'recommendations', 'expense-tracking']
  }
];

const APP_FRAMEWORKS = [
  { id: 'react-native', name: 'React Native', description: 'Cross-platform mobile apps' },
  { id: 'flutter', name: 'Flutter', description: 'Google\'s UI toolkit' },
  { id: 'next.js', name: 'Next.js', description: 'React web applications' },
  { id: 'electron', name: 'Electron', description: 'Desktop applications' },
  { id: 'ionic', name: 'Ionic', description: 'Hybrid mobile apps' },
  { id: 'native-android', name: 'Native Android', description: 'Java/Kotlin Android apps' },
  { id: 'native-ios', name: 'Native iOS', description: 'Swift/Objective-C iOS apps' },
  { id: 'pwa', name: 'Progressive Web App', description: 'Web-based mobile experience' }
];

const DESIGN_STYLES = [
  { id: 'modern', name: 'Modern', description: 'Clean, contemporary design' },
  { id: 'minimal', name: 'Minimal', description: 'Simple, focused interface' },
  { id: 'colorful', name: 'Colorful', description: 'Vibrant, energetic design' },
  { id: 'professional', name: 'Professional', description: 'Business-oriented interface' },
  { id: 'playful', name: 'Playful', description: 'Fun, casual design' },
  { id: 'elegant', name: 'Elegant', description: 'Sophisticated, refined look' }
];

const APP_FEATURES = [
  'User Authentication',
  'Push Notifications',
  'Camera Integration',
  'Location Services',
  'Payment Processing',
  'Social Login',
  'File Upload/Download',
  'Real-time Chat',
  'Database Integration',
  'API Integration',
  'Offline Support',
  'Search Functionality',
  'Analytics Tracking',
  'Security Features',
  'Multi-language Support',
  'Dark/Light Theme',
  'Accessibility Features',
  'Performance Optimization'
];

export default function AppGenerationScreen() {
  const toast = useToast();
  const { isOpen: isCodeViewOpen, onOpen: openCodeView, onClose: closeCodeView } = useDisclose();
  const { isOpen: isTemplateModalOpen, onOpen: openTemplateModal, onClose: closeTemplateModal } = useDisclose();

  // Form State
  const [appDescription, setAppDescription] = useState('');
  const [appName, setAppName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [appType, setAppType] = useState<'android' | 'ios' | 'web' | 'desktop'>('android');
  const [framework, setFramework] = useState('react-native');
  const [designStyle, setDesignStyle] = useState('modern');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState('code-llama-3');
  
  // File Upload
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  
  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedCode, setGeneratedCode] = useState('');
  const [generatedAppUrl, setGeneratedAppUrl] = useState('');
  const [appPreviewUrl, setAppPreviewUrl] = useState('');
  
  // Models and Options
  const [codeModels, setCodeModels] = useState<AIModel[]>([]);
  const [generationHistory, setGenerationHistory] = useState<any[]>([]);

  useEffect(() => {
    loadCodeModels();
    loadGenerationHistory();
  }, []);

  const loadCodeModels = async () => {
    try {
      const models = await aiModelService.getAvailableModels('code');
      setCodeModels(models);
    } catch (error) {
      console.error('Error loading code models:', error);
      toast.show({
        title: "Error",
        description: "Failed to load code models",
        status: "error",
      });
    }
  };

  const loadGenerationHistory = async () => {
    // Load from AsyncStorage or API
    // Implementation would fetch previous generations
  };

  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/*', 'image/*'],
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets) {
        setUploadedFiles([...uploadedFiles, ...result.assets]);
        toast.show({
          title: "Files Uploaded",
          description: `${result.assets.length} file(s) added`,
          status: "success",
        });
      }
    } catch (error) {
      console.error('File upload error:', error);
      toast.show({
        title: "Upload Failed",
        description: "Could not upload files",
        status: "error",
      });
    }
  };

  const handleTemplateSelect = (template: AppTemplate) => {
    setSelectedTemplate(template.id);
    setAppDescription(template.description);
    setSelectedFeatures(template.features);
    setAppName(template.name);
    closeTemplateModal();
    
    toast.show({
      title: "Template Selected",
      description: `Using ${template.name} template`,
      status: "info",
    });
  };

  const handleGenerateApp = async () => {
    if (!appDescription.trim() && !selectedTemplate) {
      toast.show({
        title: "Missing Information",
        description: "Please provide app description or select a template",
        status: "warning",
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 3000);

      const params: AppGenerationParams = {
        description: appDescription || `Create a ${selectedTemplate} app`,
        appType,
        framework: framework as any,
        features: selectedFeatures,
        designStyle: designStyle as any,
        model: selectedModel,
        uploadedFiles
      };

      const response = await aiModelService.generateApp(params);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (response.data.success) {
        setGeneratedCode(response.data.code);
        setGeneratedAppUrl(response.data.downloadUrl);
        setAppPreviewUrl(response.data.previewUrl);
        
        // Add to history
        const newGeneration = {
          id: Date.now(),
          name: appName || 'Generated App',
          timestamp: new Date(),
          framework,
          features: selectedFeatures,
          downloadUrl: response.data.downloadUrl
        };
        setGenerationHistory([newGeneration, ...generationHistory]);
        
        toast.show({
          title: "Success!",
          description: "App generated successfully",
          status: "success",
        });
      } else {
        throw new Error(response.data.error || 'Generation failed');
      }
    } catch (error) {
      console.error('App generation error:', error);
      toast.show({
        title: "Generation Failed",
        description: error.message || "Something went wrong",
        status: "error",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAPK = async () => {
    if (!generatedCode) {
      toast.show({
        title: "No Code Available",
        description: "Please generate an app first",
        status: "warning",
      });
      return;
    }

    try {
      const response = await aiModelService.generateAPK(generatedCode, appName || 'Generated App');
      
      if (response.data.success) {
        toast.show({
          title: "APK Generated",
          description: "Your app APK is ready for download",
          status: "success",
        });
        
        // Trigger download
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(response.data.apkUrl);
        }
      } else {
        throw new Error(response.data.error || 'APK generation failed');
      }
    } catch (error) {
      console.error('APK generation error:', error);
      toast.show({
        title: "APK Generation Failed",
        description: error.message || "Could not generate APK",
        status: "error",
      });
    }
  };

  const handleModifyCode = async (instruction: string) => {
    if (!generatedCode || !instruction.trim()) return;

    try {
      const response = await aiModelService.generateApp({
        description: `Modify the existing code: ${instruction}`,
        appType,
        framework: framework as any,
        features: selectedFeatures,
        designStyle: designStyle as any,
        model: selectedModel,
        // Include the existing code context
      });

      if (response.data.success) {
        setGeneratedCode(response.data.code);
        toast.show({
          title: "Code Updated",
          description: "Code modified successfully",
          status: "success",
        });
      }
    } catch (error) {
      console.error('Code modification error:', error);
      toast.show({
        title: "Modification Failed",
        description: "Could not modify code",
        status: "error",
      });
    }
  };

  return (
    <ScrollView flex={1} bg="white" p={4}>
      <VStack space={6}>
        {/* Header */}
        <HStack justifyContent="space-between" alignItems="center">
          <Heading size="lg">📱 AI App Builder</Heading>
          <HStack space={2}>
            <IconButton
              icon={<Ionicons name="apps-outline" size={24} color="gray" />}
              onPress={openTemplateModal}
            />
            <IconButton
              icon={<Ionicons name="code-outline" size={24} color="gray" />}
              onPress={openCodeView}
              isDisabled={!generatedCode}
            />
          </HStack>
        </HStack>

        {/* Quick Templates */}
        <Box>
          <Heading size="md" mb={3}>Quick Start Templates</Heading>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <HStack space={3}>
              {APP_TEMPLATES.slice(0, 4).map(template => (
                <Box
                  key={template.id}
                  bg={selectedTemplate === template.id ? "purple.100" : "gray.50"}
                  p={3}
                  rounded="lg"
                  width="200"
                  borderWidth={selectedTemplate === template.id ? 2 : 1}
                  borderColor={selectedTemplate === template.id ? "purple.500" : "gray.200"}
                  onTouchEnd={() => handleTemplateSelect(template)}
                >
                  <Text fontWeight="bold" fontSize="sm">{template.name}</Text>
                  <Text fontSize="xs" color="gray.600" mt={1}>{template.description}</Text>
                  <Badge mt={2} size="xs" colorScheme="blue">{template.category}</Badge>
                </Box>
              ))}
            </HStack>
          </ScrollView>
        </Box>

        {/* App Details */}
        <VStack space={4}>
          <FormControl>
            <FormControl.Label>App Name</FormControl.Label>
            <Input
              placeholder="My Awesome App"
              value={appName}
              onChangeText={setAppName}
            />
          </FormControl>

          <FormControl>
            <FormControl.Label>App Description</FormControl.Label>
            <TextArea
              placeholder="Describe your app idea in detail... (e.g., 'A social media app for photographers with AI-powered editing tools')"
              value={appDescription}
              onChangeText={setAppDescription}
              h={20}
            />
          </FormControl>
        </VStack>

        {/* File Upload */}
        <Box>
          <FormControl.Label>Upload Reference Files (Optional)</FormControl.Label>
          <Button
            variant="outline"
            leftIcon={<Ionicons name="cloud-upload-outline" size={16} />}
            onPress={handleFileUpload}
          >
            Upload PDFs, Codes, or Images
          </Button>
          {uploadedFiles.length > 0 && (
            <Box mt={2}>
              {uploadedFiles.map((file, index) => (
                <HStack key={index} justifyContent="space-between" alignItems="center" mt={1}>
                  <Text fontSize="sm" flex={1}>{file.name}</Text>
                  <IconButton
                    size="sm"
                    icon={<Ionicons name="close" size={16} />}
                    onPress={() => setUploadedFiles(files => files.filter((_, i) => i !== index))}
                  />
                </HStack>
              ))}
            </Box>
          )}
        </Box>

        {/* Platform and Framework */}
        <HStack space={4}>
          <FormControl flex={1}>
            <FormControl.Label>Platform</FormControl.Label>
            <Select
              selectedValue={appType}
              onValueChange={setAppType as any}
              _selectedItem={{ endIcon: <CheckIcon size="5" /> }}
            >
              <Select.Item label="Android App" value="android" />
              <Select.Item label="iOS App" value="ios" />
              <Select.Item label="Web App" value="web" />
              <Select.Item label="Desktop App" value="desktop" />
            </Select>
          </FormControl>

          <FormControl flex={1}>
            <FormControl.Label>Framework</FormControl.Label>
            <Select
              selectedValue={framework}
              onValueChange={setFramework}
              _selectedItem={{ endIcon: <CheckIcon size="5" /> }}
            >
              {APP_FRAMEWORKS.map(fw => (
                <Select.Item key={fw.id} label={fw.name} value={fw.id} />
              ))}
            </Select>
          </FormControl>
        </HStack>

        {/* AI Model Selection */}
        <FormControl>
          <FormControl.Label>AI Coding Model</FormControl.Label>
          <Select
            selectedValue={selectedModel}
            onValueChange={setSelectedModel}
            _selectedItem={{
              bg: "green.600",
              endIcon: <CheckIcon size="5" />
            }}
          >
            {codeModels.map(model => (
              <Select.Item
                key={model.id}
                label={model.name}
                value={model.id}
              />
            ))}
          </Select>
        </FormControl>

        {/* Design Style */}
        <FormControl>
          <FormControl.Label>Design Style</FormControl.Label>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <HStack space={2}>
              {DESIGN_STYLES.map(style => (
                <Button
                  key={style.id}
                  size="sm"
                  variant={designStyle === style.id ? "solid" : "outline"}
                  onPress={() => setDesignStyle(style.id)}
                >
                  {style.name}
                </Button>
              ))}
            </HStack>
          </ScrollView>
        </FormControl>

        {/* Features Selection */}
        <Box>
          <FormControl.Label>App Features</FormControl.Label>
          <Box bg="gray.50" p={3} rounded="lg">
            <VStack space={2}>
              {APP_FEATURES.map(feature => (
                <Checkbox
                  key={feature}
                  value={feature}
                  isChecked={selectedFeatures.includes(feature)}
                  onChange={(isChecked) => {
                    if (isChecked) {
                      setSelectedFeatures([...selectedFeatures, feature]);
                    } else {
                      setSelectedFeatures(selectedFeatures.filter(f => f !== feature));
                    }
                  }}
                >
                  {feature}
                </Checkbox>
              ))}
            </VStack>
          </Box>
          <Text fontSize="sm" color="gray.600" mt={1}>
            Selected: {selectedFeatures.length} features
          </Text>
        </Box>

        {/* Generation Progress */}
        {isGenerating && (
          <Box>
            <HStack justifyContent="space-between" mb={2}>
              <Text>Generating App...</Text>
              <Text>{Math.round(progress)}%</Text>
            </HStack>
            <Progress value={progress} colorScheme="green" />
            <Text fontSize="sm" color="gray.600" mt={1}>
              Using {codeModels.find(m => m.id === selectedModel)?.name || 'AI Model'}
            </Text>
          </Box>
        )}

        {/* Generated App Preview */}
        {appPreviewUrl && (
          <Box>
            <Heading size="md" mb={3}>App Preview</Heading>
            <Box bg="gray.100" rounded="lg" overflow="hidden" h="300">
              <WebView
                source={{ uri: appPreviewUrl }}
                style={{ flex: 1 }}
              />
            </Box>
          </Box>
        )}

        {/* Action Buttons */}
        {generatedCode ? (
          <VStack space={3}>
            <HStack justifyContent="space-between">
              <Button
                variant="outline"
                leftIcon={<Ionicons name="code-download-outline" size={16} />}
                onPress={() => {
                  if (generatedAppUrl) {
                    Sharing.shareAsync(generatedAppUrl);
                  }
                }}
              >
                Download Code
              </Button>
              <Button
                colorScheme="green"
                leftIcon={<Ionicons name="phone-portrait-outline" size={16} />}
                onPress={handleGenerateAPK}
              >
                Generate APK
              </Button>
            </HStack>
            
            <Button
              variant="outline"
              leftIcon={<Ionicons name="code-outline" size={16} />}
              onPress={openCodeView}
            >
              View & Edit Code
            </Button>
          </VStack>
        ) : (
          <Button
            size="lg"
            colorScheme="green"
            leftIcon={<Ionicons name="build-outline" size={20} />}
            onPress={handleGenerateApp}
            isLoading={isGenerating}
            loadingText="Generating..."
          >
            Generate App
          </Button>
        )}

        {/* Generation History */}
        {generationHistory.length > 0 && (
          <Box>
            <Heading size="md" mb={3}>Recent Generations</Heading>
            {generationHistory.slice(0, 3).map(item => (
              <HStack key={item.id} justifyContent="space-between" alignItems="center" p={2} bg="gray.50" rounded="md" mb={2}>
                <VStack flex={1}>
                  <Text fontWeight="medium">{item.name}</Text>
                  <Text fontSize="sm" color="gray.600">{item.framework}</Text>
                </VStack>
                <Button size="sm" variant="outline">
                  Open
                </Button>
              </HStack>
            ))}
          </Box>
        )}
      </VStack>

      {/* Code View Modal */}
      <Modal isOpen={isCodeViewOpen} onClose={closeCodeView} size="full">
        <Modal.Content>
          <Modal.CloseButton />
          <Modal.Header>Generated Code</Modal.Header>
          <Modal.Body>
            <VStack space={4} flex={1}>
              <HStack space={2}>
                <Input
                  flex={1}
                  placeholder="Describe modifications... (e.g., 'Add dark theme support')"
                  onSubmitEditing={(e) => handleModifyCode(e.nativeEvent.text)}
                />
                <Button size="sm">Modify</Button>
              </HStack>
              
              <ScrollView flex={1} bg="gray.900" p={3} rounded="md">
                <Text fontFamily="monospace" color="green.300" fontSize="sm">
                  {generatedCode}
                </Text>
              </ScrollView>
            </VStack>
          </Modal.Body>
        </Modal.Content>
      </Modal>

      {/* Template Selection Modal */}
      <Modal isOpen={isTemplateModalOpen} onClose={closeTemplateModal}>
        <Modal.Content maxWidth="90%">
          <Modal.CloseButton />
          <Modal.Header>App Templates</Modal.Header>
          <Modal.Body>
            <VStack space={3}>
              {APP_TEMPLATES.map(template => (
                <Box
                  key={template.id}
                  p={3}
                  bg="gray.50"
                  rounded="lg"
                  onTouchEnd={() => handleTemplateSelect(template)}
                >
                  <HStack justifyContent="space-between" alignItems="center">
                    <VStack flex={1}>
                      <Text fontWeight="bold">{template.name}</Text>
                      <Text fontSize="sm" color="gray.600">{template.description}</Text>
                      <HStack mt={1}>
                        <Badge size="sm" colorScheme="blue">{template.category}</Badge>
                        <Badge size="sm" colorScheme="gray" ml={1}>
                          {template.features.length} features
                        </Badge>
                      </HStack>
                    </VStack>
                    <IconButton
                      icon={<Ionicons name="chevron-forward" size={20} />}
                      variant="ghost"
                    />
                  </HStack>
                </Box>
              ))}
            </VStack>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </ScrollView>
  );
}