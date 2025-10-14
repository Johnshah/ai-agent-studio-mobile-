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
  Slider,
  Switch,
  TextArea,
  ScrollView,
  Heading,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Modal,
  FormControl,
  Badge,
  Divider,
  IconButton,
  ActionSheet,
  useDisclose
} from 'native-base';
import { Platform, Alert as RNAlert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Video } from 'expo-av';

import { aiModelService, VideoGenerationParams, AIModel } from '../services/AIModelService';

const { width } = Dimensions.get('window');

interface VideoStyle {
  id: string;
  name: string;
  description: string;
  preview?: string;
}

const VIDEO_STYLES: VideoStyle[] = [
  { id: 'cinematic', name: 'Cinematic', description: 'Movie-like quality with dramatic lighting' },
  { id: 'anime', name: 'Anime', description: 'Japanese animation style' },
  { id: 'realistic', name: 'Realistic', description: 'Photorealistic rendering' },
  { id: 'cartoon', name: 'Cartoon', description: 'Animated cartoon style' },
  { id: 'artistic', name: 'Artistic', description: 'Abstract and creative styles' },
  { id: 'sci-fi', name: 'Sci-Fi', description: 'Futuristic and technology themes' },
  { id: 'fantasy', name: 'Fantasy', description: 'Magical and mythical themes' },
  { id: 'horror', name: 'Horror', description: 'Dark and scary atmosphere' },
  { id: 'documentary', name: 'Documentary', description: 'Real-world educational style' },
  { id: 'music-video', name: 'Music Video', description: 'Dynamic and rhythmic visuals' }
];

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ar', name: 'Arabic' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'it', name: 'Italian' }
];

const SOCIAL_PLATFORMS = [
  { id: 'youtube', name: 'YouTube', icon: 'logo-youtube', color: 'red.500' },
  { id: 'tiktok', name: 'TikTok', icon: 'musical-notes', color: 'black' },
  { id: 'instagram', name: 'Instagram', icon: 'logo-instagram', color: 'purple.500' },
  { id: 'twitter', name: 'Twitter', icon: 'logo-twitter', color: 'blue.400' },
  { id: 'facebook', name: 'Facebook', icon: 'logo-facebook', color: 'blue.600' },
  { id: 'linkedin', name: 'LinkedIn', icon: 'logo-linkedin', color: 'blue.700' }
];

export default function EnhancedVideoGenerationScreen() {
  const toast = useToast();
  const { isOpen: isModelSelectionOpen, onOpen: openModelSelection, onClose: closeModelSelection } = useDisclose();
  const { isOpen: isSocialModalOpen, onOpen: openSocialModal, onClose: closeSocialModal } = useDisclose();

  // Form State
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('cinematic');
  const [duration, setDuration] = useState(30); // seconds
  const [resolution, setResolution] = useState('1080p');
  const [fps, setFps] = useState(30);
  const [language, setLanguage] = useState('en');
  const [selectedModel, setSelectedModel] = useState('wan2.2');
  const [customModelUrl, setCustomModelUrl] = useState('');
  
  // Advanced Settings
  const [enableVoiceover, setEnableVoiceover] = useState(false);
  const [voiceoverText, setVoiceoverText] = useState('');
  const [backgroundMusic, setBackgroundMusic] = useState(false);
  const [musicGenre, setMusicGenre] = useState('ambient');
  const [enableSubtitles, setEnableSubtitles] = useState(false);
  const [customAspectRatio, setCustomAspectRatio] = useState('16:9');
  
  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState('');
  const [generationTime, setGenerationTime] = useState(0);
  
  // Models and Options
  const [videoModels, setVideoModels] = useState<AIModel[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  useEffect(() => {
    loadVideoModels();
  }, []);

  const loadVideoModels = async () => {
    try {
      const models = await aiModelService.getAvailableModels('video');
      setVideoModels(models);
    } catch (error) {
      console.error('Error loading video models:', error);
      toast.show({
        title: "Error",
        description: "Failed to load video models",
        status: "error",
      });
    }
  };

  const handleGenerateVideo = async () => {
    if (!prompt.trim()) {
      toast.show({
        title: "Missing Prompt",
        description: "Please enter a video description",
        status: "warning",
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    const startTime = Date.now();

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 2000);

      const params: VideoGenerationParams = {
        prompt,
        style: selectedStyle as any,
        duration,
        resolution: resolution as any,
        fps: fps as any,
        language,
        model: selectedModel
      };

      const response = await aiModelService.generateVideo(params);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (response.data.success) {
        setGeneratedVideoUrl(response.data.videoUrl);
        setGenerationTime((Date.now() - startTime) / 1000);
        
        toast.show({
          title: "Success!",
          description: `Video generated in ${Math.round(generationTime)}s`,
          status: "success",
        });
      } else {
        throw new Error(response.data.error || 'Generation failed');
      }
    } catch (error) {
      console.error('Video generation error:', error);
      toast.show({
        title: "Generation Failed",
        description: error.message || "Something went wrong",
        status: "error",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadVideo = async () => {
    if (!generatedVideoUrl) return;

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        toast.show({
          title: "Permission Denied",
          description: "Please grant media library permissions",
          status: "error",
        });
        return;
      }

      const downloadUri = FileSystem.documentDirectory + `generated_video_${Date.now()}.mp4`;
      const { uri } = await FileSystem.downloadAsync(generatedVideoUrl, downloadUri);
      
      await MediaLibrary.saveToLibraryAsync(uri);
      
      toast.show({
        title: "Downloaded!",
        description: "Video saved to gallery",
        status: "success",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast.show({
        title: "Download Failed",
        description: "Could not save video",
        status: "error",
      });
    }
  };

  const handleShareVideo = async () => {
    if (!generatedVideoUrl) return;

    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(generatedVideoUrl, {
          mimeType: 'video/mp4',
          dialogTitle: 'Share Generated Video'
        });
      } else {
        toast.show({
          title: "Sharing Not Available",
          description: "Sharing is not available on this device",
          status: "error",
        });
      }
    } catch (error) {
      console.error('Share error:', error);
      toast.show({
        title: "Share Failed",
        description: "Could not share video",
        status: "error",
      });
    }
  };

  const handleUploadToSocial = async () => {
    if (!generatedVideoUrl || selectedPlatforms.length === 0) {
      toast.show({
        title: "Missing Selection",
        description: "Please select platforms and ensure video is generated",
        status: "warning",
      });
      return;
    }

    try {
      const metadata = {
        title: `AI Generated: ${prompt.substring(0, 50)}...`,
        description: `Created with AI Agent Studio using ${selectedModel}`,
        tags: ['AI', 'generated', 'video', selectedStyle],
        duration,
        resolution
      };

      await aiModelService.uploadToSocialMedia(selectedPlatforms, generatedVideoUrl, metadata);
      
      toast.show({
        title: "Upload Started",
        description: `Uploading to ${selectedPlatforms.length} platform(s)`,
        status: "info",
      });
    } catch (error) {
      console.error('Social upload error:', error);
      toast.show({
        title: "Upload Failed",
        description: "Could not upload to social media",
        status: "error",
      });
    }
  };

  const addCustomModel = async () => {
    if (!customModelUrl.trim()) {
      toast.show({
        title: "Missing URL",
        description: "Please enter a GitHub URL",
        status: "warning",
      });
      return;
    }

    try {
      await aiModelService.addCustomModel({
        name: `Custom Model ${Date.now()}`,
        type: 'video',
        githubUrl: customModelUrl,
        description: 'Custom video generation model'
      });
      
      await loadVideoModels();
      setCustomModelUrl('');
      
      toast.show({
        title: "Model Added",
        description: "Custom model added successfully",
        status: "success",
      });
    } catch (error) {
      console.error('Add model error:', error);
      toast.show({
        title: "Add Failed",
        description: "Could not add custom model",
        status: "error",
      });
    }
  };

  return (
    <ScrollView flex={1} bg="white" p={4}>
      <VStack space={6}>
        {/* Header */}
        <HStack justifyContent="space-between" alignItems="center">
          <Heading size="lg">🎬 AI Video Studio</Heading>
          <HStack space={2}>
            <IconButton
              icon={<Ionicons name="settings-outline" size={24} color="gray" />}
              onPress={openModelSelection}
            />
            <IconButton
              icon={<Ionicons name="share-social-outline" size={24} color="gray" />}
              onPress={openSocialModal}
            />
          </HStack>
        </HStack>

        {/* Video Prompt */}
        <FormControl>
          <FormControl.Label>Video Description</FormControl.Label>
          <TextArea
            placeholder="Describe the video you want to create... (e.g., 'A majestic dragon flying over a medieval castle at sunset')"
            value={prompt}
            onChangeText={setPrompt}
            h={20}
            fontSize="md"
          />
        </FormControl>

        {/* Video Style */}
        <FormControl>
          <FormControl.Label>Visual Style</FormControl.Label>
          <Select
            selectedValue={selectedStyle}
            onValueChange={setSelectedStyle}
            placeholder="Choose a style"
            _selectedItem={{
              bg: "cyan.600",
              endIcon: <CheckIcon size="5" />
            }}
          >
            {VIDEO_STYLES.map(style => (
              <Select.Item
                key={style.id}
                label={style.name}
                value={style.id}
                rightIcon={<Text fontSize="xs" color="gray.500">{style.description}</Text>}
              />
            ))}
          </Select>
        </FormControl>

        {/* AI Model Selection */}
        <FormControl>
          <FormControl.Label>AI Model</FormControl.Label>
          <Select
            selectedValue={selectedModel}
            onValueChange={setSelectedModel}
            placeholder="Choose AI model"
            _selectedItem={{
              bg: "purple.600",
              endIcon: <CheckIcon size="5" />
            }}
          >
            {videoModels.map(model => (
              <Select.Item
                key={model.id}
                label={model.name}
                value={model.id}
                rightIcon={
                  <VStack>
                    <Text fontSize="xs" color="gray.500">{model.description}</Text>
                    <Badge colorScheme="green" size="xs">
                      RAM: {model.requirements.minRam}GB
                    </Badge>
                  </VStack>
                }
              />
            ))}
          </Select>
        </FormControl>

        {/* Duration and Quality */}
        <HStack space={4}>
          <VStack flex={1}>
            <FormControl.Label>Duration (seconds)</FormControl.Label>
            <HStack alignItems="center" space={2}>
              <Text>5</Text>
              <Slider
                flex={1}
                value={duration}
                onChange={setDuration}
                minValue={5}
                maxValue={600}
                step={5}
              >
                <Slider.Track>
                  <Slider.FilledTrack />
                </Slider.Track>
                <Slider.Thumb />
              </Slider>
              <Text>600</Text>
            </HStack>
            <Text fontSize="sm" color="gray.600" textAlign="center">
              {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
            </Text>
          </VStack>
        </HStack>

        {/* Resolution and FPS */}
        <HStack space={4}>
          <FormControl flex={1}>
            <FormControl.Label>Resolution</FormControl.Label>
            <Select
              selectedValue={resolution}
              onValueChange={setResolution}
              _selectedItem={{ endIcon: <CheckIcon size="5" /> }}
            >
              <Select.Item label="480p (SD)" value="480p" />
              <Select.Item label="720p (HD)" value="720p" />
              <Select.Item label="1080p (FHD)" value="1080p" />
              <Select.Item label="4K (UHD)" value="4k" />
            </Select>
          </FormControl>

          <FormControl flex={1}>
            <FormControl.Label>FPS</FormControl.Label>
            <Select
              selectedValue={fps.toString()}
              onValueChange={(value) => setFps(parseInt(value))}
              _selectedItem={{ endIcon: <CheckIcon size="5" /> }}
            >
              <Select.Item label="24 FPS (Cinema)" value="24" />
              <Select.Item label="30 FPS (Standard)" value="30" />
              <Select.Item label="60 FPS (Smooth)" value="60" />
            </Select>
          </FormControl>
        </HStack>

        {/* Language */}
        <FormControl>
          <FormControl.Label>Language</FormControl.Label>
          <Select
            selectedValue={language}
            onValueChange={setLanguage}
            placeholder="Choose language"
            _selectedItem={{
              bg: "blue.600",
              endIcon: <CheckIcon size="5" />
            }}
          >
            {LANGUAGES.map(lang => (
              <Select.Item
                key={lang.code}
                label={lang.name}
                value={lang.code}
              />
            ))}
          </Select>
        </FormControl>

        {/* Advanced Settings */}
        <Box bg="gray.50" p={4} rounded="lg">
          <Heading size="md" mb={3}>Advanced Settings</Heading>
          
          {/* Voiceover */}
          <HStack justifyContent="space-between" alignItems="center" mb={3}>
            <Text>Add AI Voiceover</Text>
            <Switch
              isChecked={enableVoiceover}
              onToggle={setEnableVoiceover}
            />
          </HStack>
          
          {enableVoiceover && (
            <TextArea
              placeholder="Voiceover script..."
              value={voiceoverText}
              onChangeText={setVoiceoverText}
              mb={3}
            />
          )}

          {/* Background Music */}
          <HStack justifyContent="space-between" alignItems="center" mb={3}>
            <Text>Add Background Music</Text>
            <Switch
              isChecked={backgroundMusic}
              onToggle={setBackgroundMusic}
            />
          </HStack>

          {backgroundMusic && (
            <Select
              selectedValue={musicGenre}
              onValueChange={setMusicGenre}
              placeholder="Music genre"
              mb={3}
            >
              <Select.Item label="Ambient" value="ambient" />
              <Select.Item label="Cinematic" value="cinematic" />
              <Select.Item label="Electronic" value="electronic" />
              <Select.Item label="Classical" value="classical" />
              <Select.Item label="Rock" value="rock" />
              <Select.Item label="Jazz" value="jazz" />
            </Select>
          )}

          {/* Subtitles */}
          <HStack justifyContent="space-between" alignItems="center">
            <Text>Generate Subtitles</Text>
            <Switch
              isChecked={enableSubtitles}
              onToggle={setEnableSubtitles}
            />
          </HStack>
        </Box>

        {/* Generation Progress */}
        {isGenerating && (
          <Box>
            <HStack justifyContent="space-between" mb={2}>
              <Text>Generating Video...</Text>
              <Text>{Math.round(progress)}%</Text>
            </HStack>
            <Progress value={progress} colorScheme="purple" />
            <Text fontSize="sm" color="gray.600" mt={1}>
              Using {videoModels.find(m => m.id === selectedModel)?.name || 'AI Model'}
            </Text>
          </Box>
        )}

        {/* Generated Video Preview */}
        {generatedVideoUrl && (
          <Box>
            <Heading size="md" mb={3}>Generated Video</Heading>
            <Box bg="black" rounded="lg" overflow="hidden" mb={3}>
              <Video
                source={{ uri: generatedVideoUrl }}
                style={{ width: width - 32, height: (width - 32) * 9 / 16 }}
                useNativeControls
                resizeMode="contain"
                isLooping
              />
            </Box>
            
            <HStack justifyContent="space-between">
              <Button
                variant="outline"
                leftIcon={<Ionicons name="download-outline" size={16} />}
                onPress={handleDownloadVideo}
              >
                Download
              </Button>
              <Button
                variant="outline"
                leftIcon={<Ionicons name="share-outline" size={16} />}
                onPress={handleShareVideo}
              >
                Share
              </Button>
              <Button
                colorScheme="blue"
                leftIcon={<Ionicons name="cloud-upload-outline" size={16} />}
                onPress={handleUploadToSocial}
              >
                Upload
              </Button>
            </HStack>
            
            {generationTime > 0 && (
              <Text fontSize="sm" color="gray.600" textAlign="center" mt={2}>
                Generated in {generationTime.toFixed(1)}s
              </Text>
            )}
          </Box>
        )}

        {/* Generate Button */}
        <Button
          size="lg"
          colorScheme="purple"
          leftIcon={<Ionicons name="play-circle-outline" size={20} />}
          onPress={handleGenerateVideo}
          isLoading={isGenerating}
          loadingText="Generating..."
        >
          Generate Video
        </Button>
      </VStack>

      {/* Model Selection Modal */}
      <Modal isOpen={isModelSelectionOpen} onClose={closeModelSelection}>
        <Modal.Content maxWidth="90%">
          <Modal.CloseButton />
          <Modal.Header>AI Models & Settings</Modal.Header>
          <Modal.Body>
            <VStack space={4}>
              <Text fontWeight="bold">Available Models:</Text>
              {videoModels.map(model => (
                <HStack key={model.id} justifyContent="space-between" alignItems="center">
                  <VStack flex={1}>
                    <Text fontWeight="medium">{model.name}</Text>
                    <Text fontSize="sm" color="gray.600">{model.description}</Text>
                  </VStack>
                  <Switch
                    isChecked={model.isEnabled}
                    onToggle={(value) => aiModelService.updateModelStatus(model.id, value)}
                  />
                </HStack>
              ))}
              
              <Divider />
              
              <Text fontWeight="bold">Add Custom Model:</Text>
              <Input
                placeholder="GitHub URL or API endpoint"
                value={customModelUrl}
                onChangeText={setCustomModelUrl}
              />
              <Button size="sm" onPress={addCustomModel}>
                Add Model
              </Button>
            </VStack>
          </Modal.Body>
        </Modal.Content>
      </Modal>

      {/* Social Media Modal */}
      <Modal isOpen={isSocialModalOpen} onClose={closeSocialModal}>
        <Modal.Content maxWidth="90%">
          <Modal.CloseButton />
          <Modal.Header>Social Media Upload</Modal.Header>
          <Modal.Body>
            <VStack space={4}>
              <Text fontWeight="bold">Select Platforms:</Text>
              {SOCIAL_PLATFORMS.map(platform => (
                <HStack key={platform.id} space={3} alignItems="center">
                  <IconButton
                    icon={<Ionicons name={platform.icon} size={24} color={platform.color} />}
                    variant="ghost"
                  />
                  <Text flex={1}>{platform.name}</Text>
                  <Switch
                    isChecked={selectedPlatforms.includes(platform.id)}
                    onToggle={(value) => {
                      if (value) {
                        setSelectedPlatforms([...selectedPlatforms, platform.id]);
                      } else {
                        setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform.id));
                      }
                    }}
                  />
                </HStack>
              ))}
              
              <Button
                onPress={() => {
                  handleUploadToSocial();
                  closeSocialModal();
                }}
                isDisabled={selectedPlatforms.length === 0 || !generatedVideoUrl}
              >
                Upload to Selected Platforms
              </Button>
            </VStack>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </ScrollView>
  );
}