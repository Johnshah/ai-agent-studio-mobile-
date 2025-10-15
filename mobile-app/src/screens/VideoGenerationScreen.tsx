import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  TextArea,
  Select,
  Slider,
  Switch,
  FormControl,
  ScrollView,
  Alert,
  Progress,
  Badge,
  useToast,
  Card,
  Pressable,
  Center
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation } from 'react-query';

import { useAIAgent, aiAgentActions } from '../store/AIAgentStore';
import { VideoService } from '../services/VideoService';

export default function VideoGenerationScreen() {
  const navigation = useNavigation();
  const { state, dispatch } = useAIAgent();
  const toast = useToast();
  
  // Form state
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('wan22');
  const [duration, setDuration] = useState(30);
  const [resolution, setResolution] = useState('1080p');
  const [style, setStyle] = useState('cinematic');
  const [fps, setFps] = useState(24);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  // Available options
  const models = [
    { label: 'Wan2.2 (Recommended)', value: 'wan22' },
    { label: 'Stable Video Diffusion', value: 'stable_video' },
    { label: 'Deforum (Artistic)', value: 'deforum' }
  ];

  const styles = [
    'cinematic', 'anime', 'realistic', 'cartoon', 'artistic', 
    'fantasy', 'sci-fi', 'documentary', 'music-video'
  ];

  const resolutions = ['480p', '720p', '1080p', '4K'];

  // Video generation mutation
  const generateVideoMutation = useMutation(
    VideoService.generateVideo,
    {
      onSuccess: (data) => {
        setIsGenerating(false);
        setGenerationProgress(0);
        
        if (data.success) {
          // Add to projects
          const newProject = {
            id: Date.now().toString(),
            name: `Video: ${prompt.substring(0, 30)}...`,
            type: 'video' as const,
            status: 'completed' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            data: data,
            outputUrl: data.video_url
          };
          
          dispatch(aiAgentActions.addProject(newProject));
          
          toast.show({
            title: "Video Generated Successfully!",
            status: "success",
            description: `Duration: ${data.duration}s, Size: ${(data.file_size / 1024 / 1024).toFixed(1)}MB`
          });
          
          // Navigate to preview
          navigation.navigate('Preview' as never, { project: newProject } as never);
        } else {
          toast.show({
            title: "Generation Failed",
            status: "error",
            description: data.message || "Please try again"
          });
        }
      },
      onError: (error: any) => {
        setIsGenerating(false);
        setGenerationProgress(0);
        
        toast.show({
          title: "Error",
          status: "error",
          description: error.message || "Video generation failed"
        });
      }
    }
  );

  const handleGenerateVideo = async () => {
    if (!prompt.trim()) {
      toast.show({
        title: "Prompt Required",
        status: "warning",
        description: "Please enter a description for your video"
      });
      return;
    }

    if (!state.settings.huggingFaceApiKey) {
      toast.show({
        title: "Setup Required",
        status: "warning", 
        description: "Please add your Hugging Face API key in Settings"
      });
      navigation.navigate('Settings' as never);
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 10;
      });
    }, 1000);

    try {
      await generateVideoMutation.mutateAsync({
        prompt,
        model_name: selectedModel,
        duration,
        fps,
        resolution,
        style
      });
    } catch (error) {
      clearInterval(progressInterval);
    }
  };

  const presets = [
    {
      name: 'Mobile Optimized',
      settings: { resolution: '720p', fps: 24, duration: 30, style: 'cinematic' }
    },
    {
      name: 'Social Media',
      settings: { resolution: '720p', fps: 30, duration: 15, style: 'vibrant' }
    },
    {
      name: 'High Quality',
      settings: { resolution: '1080p', fps: 30, duration: 60, style: 'realistic' }
    },
    {
      name: 'Anime Style',
      settings: { resolution: '720p', fps: 24, duration: 30, style: 'anime' }
    }
  ];

  const applyPreset = (preset: any) => {
    setResolution(preset.settings.resolution);
    setFps(preset.settings.fps);
    setDuration(preset.settings.duration);
    setStyle(preset.settings.style);
    
    toast.show({
      title: "Preset Applied",
      status: "info",
      description: `${preset.name} settings applied`
    });
  };

  return (
    <ScrollView bg="gray.50" flex={1}>
      <VStack space={6} p={4}>
        {/* Header */}
        <HStack justifyContent="space-between" alignItems="center">
          <VStack>
            <Text fontSize="xl" fontWeight="bold" color="gray.800">
              AI Video Generation
            </Text>
            <Text fontSize="sm" color="gray.600">
              Create videos with Wan2.2 & AI models
            </Text>
          </VStack>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Ionicons name="settings-outline" size={16} />}
            onPress={() => navigation.navigate('Settings' as never)}
          >
            Setup
          </Button>
        </HStack>

        {/* Quick Presets */}
        <Box>
          <Text fontSize="md" fontWeight="semibold" color="gray.800" mb={3}>
            Quick Presets
          </Text>
          <HStack space={2} flexWrap="wrap">
            {presets.map((preset, index) => (
              <Pressable key={index} onPress={() => applyPreset(preset)}>
                <Badge
                  variant="subtle"
                  colorScheme="blue"
                  mb={2}
                  px={3}
                  py={1}
                >
                  {preset.name}
                </Badge>
              </Pressable>
            ))}
          </HStack>
        </Box>

        {/* Prompt Input */}
        <Card>
          <VStack p={4} space={4}>
            <FormControl>
              <FormControl.Label>
                <Text fontSize="sm" fontWeight="medium">Video Description</Text>
              </FormControl.Label>
              <TextArea
                placeholder="Describe the video you want to create... (e.g., 'A cat playing piano in a cozy living room, warm lighting')"
                value={prompt}
                onChangeText={setPrompt}
                numberOfLines={4}
                bg="white"
              />
              <FormControl.HelperText>
                Be descriptive for better results. Include style, mood, and visual details.
              </FormControl.HelperText>
            </FormControl>

            {/* AI Model Selection */}
            <FormControl>
              <FormControl.Label>
                <Text fontSize="sm" fontWeight="medium">AI Model</Text>
              </FormControl.Label>
              <Select
                selectedValue={selectedModel}
                onValueChange={setSelectedModel}
                bg="white"
                accessibilityLabel="Choose AI Model"
              >
                {models.map((model) => (
                  <Select.Item
                    key={model.value}
                    label={model.label}
                    value={model.value}
                  />
                ))}
              </Select>
            </FormControl>
          </VStack>
        </Card>

        {/* Video Settings */}
        <Card>
          <VStack p={4} space={4}>
            <Text fontSize="md" fontWeight="semibold" color="gray.800">
              Video Settings
            </Text>

            {/* Duration */}
            <FormControl>
              <FormControl.Label>
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" fontWeight="medium">Duration</Text>
                  <Text fontSize="sm" color="blue.500">{duration}s</Text>
                </HStack>
              </FormControl.Label>
              <Slider
                value={duration}
                onChange={setDuration}
                minValue={5}
                maxValue={300}
                step={5}
                colorScheme="blue"
              >
                <Slider.Track>
                  <Slider.FilledTrack />
                </Slider.Track>
                <Slider.Thumb />
              </Slider>
              <FormControl.HelperText>
                Longer videos take more time to generate
              </FormControl.HelperText>
            </FormControl>

            {/* Resolution & FPS */}
            <HStack space={4}>
              <FormControl flex={1}>
                <FormControl.Label>
                  <Text fontSize="sm" fontWeight="medium">Resolution</Text>
                </FormControl.Label>
                <Select
                  selectedValue={resolution}
                  onValueChange={setResolution}
                  bg="white"
                >
                  {resolutions.map((res) => (
                    <Select.Item key={res} label={res} value={res} />
                  ))}
                </Select>
              </FormControl>

              <FormControl flex={1}>
                <FormControl.Label>
                  <Text fontSize="sm" fontWeight="medium">FPS</Text>
                </FormControl.Label>
                <Select
                  selectedValue={fps.toString()}
                  onValueChange={(value) => setFps(parseInt(value))}
                  bg="white"
                >
                  <Select.Item label="24 FPS" value="24" />
                  <Select.Item label="30 FPS" value="30" />
                  <Select.Item label="60 FPS" value="60" />
                </Select>
              </FormControl>
            </HStack>

            {/* Style */}
            <FormControl>
              <FormControl.Label>
                <Text fontSize="sm" fontWeight="medium">Visual Style</Text>
              </FormControl.Label>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <HStack space={2} py={2}>
                  {styles.map((styleOption) => (
                    <Pressable
                      key={styleOption}
                      onPress={() => setStyle(styleOption)}
                    >
                      <Badge
                        variant={style === styleOption ? "solid" : "outline"}
                        colorScheme="purple"
                        px={3}
                        py={1}
                      >
                        {styleOption}
                      </Badge>
                    </Pressable>
                  ))}
                </HStack>
              </ScrollView>
            </FormControl>
          </VStack>
        </Card>

        {/* Generation Progress */}
        {isGenerating && (
          <Card>
            <VStack p={4} space={3}>
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="md" fontWeight="semibold">
                  Generating Video...
                </Text>
                <Text fontSize="sm" color="blue.500">
                  {Math.round(generationProgress)}%
                </Text>
              </HStack>
              <Progress value={generationProgress} colorScheme="blue" />
              <Text fontSize="xs" color="gray.600">
                Using {selectedModel} model • Estimated time: {Math.round(duration / 5)} minutes
              </Text>
            </VStack>
          </Card>
        )}

        {/* Generate Button */}
        <Button
          size="lg"
          colorScheme="blue"
          isLoading={isGenerating}
          loadingText="Generating..."
          onPress={handleGenerateVideo}
          leftIcon={<Ionicons name="videocam" size={20} />}
        >
          Generate Video
        </Button>

        {/* Recent Videos */}
        <Box>
          <HStack justifyContent="space-between" alignItems="center" mb={3}>
            <Text fontSize="md" fontWeight="semibold" color="gray.800">
              Recent Videos
            </Text>
            <Pressable onPress={() => navigation.navigate('Projects' as never)}>
              <Text fontSize="sm" color="blue.500">View All</Text>
            </Pressable>
          </HStack>

          {state.projects.filter(p => p.type === 'video').slice(0, 3).map((project) => (
            <Card key={project.id} mb={2}>
              <Pressable onPress={() => navigation.navigate('Preview' as never, { project } as never)}>
                <HStack p={3} alignItems="center" space={3}>
                  <Center w={12} h={12} bg="blue.100" rounded="md">
                    <Ionicons name="videocam" size={24} color="#3B82F6" />
                  </Center>
                  <VStack flex={1}>
                    <Text fontSize="sm" fontWeight="medium" color="gray.800">
                      {project.name}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </Text>
                  </VStack>
                  <Badge
                    variant="subtle"
                    colorScheme={project.status === 'completed' ? 'green' : 'blue'}
                  >
                    {project.status}
                  </Badge>
                </HStack>
              </Pressable>
            </Card>
          ))}

          {state.projects.filter(p => p.type === 'video').length === 0 && (
            <Card>
              <Center p={8}>
                <VStack alignItems="center" space={2}>
                  <Ionicons name="videocam-outline" size={48} color="#9CA3AF" />
                  <Text fontSize="md" color="gray.600">No videos generated yet</Text>
                  <Text fontSize="sm" color="gray.500" textAlign="center">
                    Create your first AI video to see it here
                  </Text>
                </VStack>
              </Center>
            </Card>
          )}
        </Box>

        {/* Tips */}
        <Alert status="info" variant="left-accent">
          <VStack space={1} flexShrink={1} w="100%">
            <Alert.Icon />
            <Text fontSize="sm" fontWeight="semibold" color="coolGray.800">
              Tips for Better Videos
            </Text>
            <Text fontSize="xs" color="coolGray.600">
              • Be specific and descriptive in your prompts
              • Use style keywords (cinematic, artistic, etc.)
              • Start with shorter durations for faster results
              • Try different AI models for various styles
            </Text>
          </VStack>
        </Alert>
      </VStack>
    </ScrollView>
  );
}