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
  useToast,
  Modal,
  FormControl,
  Badge,
  Divider,
  IconButton,
  Image,
  useDisclose,
  Checkbox
} from 'native-base';
import { Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import * as ImagePicker from 'expo-image-picker';

import { aiModelService, ImageGenerationParams, AIModel } from '../services/AIModelService';

const { width } = Dimensions.get('window');

interface ImageStyle {
  id: string;
  name: string;
  description: string;
  example?: string;
}

const IMAGE_STYLES: ImageStyle[] = [
  { id: 'photorealistic', name: 'Photorealistic', description: 'High-quality realistic photos' },
  { id: 'artistic', name: 'Artistic', description: 'Painterly and creative styles' },
  { id: 'anime', name: 'Anime', description: 'Japanese animation style' },
  { id: 'cartoon', name: 'Cartoon', description: 'Western animation style' },
  { id: 'digital-art', name: 'Digital Art', description: 'Modern digital artwork' },
  { id: 'oil-painting', name: 'Oil Painting', description: 'Classical oil painting style' },
  { id: 'watercolor', name: 'Watercolor', description: 'Watercolor painting effect' },
  { id: 'sketch', name: 'Sketch', description: 'Pencil sketch style' },
  { id: 'cyberpunk', name: 'Cyberpunk', description: 'Futuristic neon aesthetic' },
  { id: 'fantasy', name: 'Fantasy', description: 'Magical and mythical themes' },
  { id: 'horror', name: 'Horror', description: 'Dark and scary atmosphere' },
  { id: 'minimalist', name: 'Minimalist', description: 'Clean and simple design' }
];

const IMAGE_SIZES = [
  { id: '512x512', name: 'Square (512x512)', aspect: '1:1' },
  { id: '768x512', name: 'Landscape (768x512)', aspect: '3:2' },
  { id: '512x768', name: 'Portrait (512x768)', aspect: '2:3' },
  { id: '1024x1024', name: 'Large Square (1024x1024)', aspect: '1:1' },
  { id: '1536x1024', name: 'Wide (1536x1024)', aspect: '3:2' },
  { id: '1024x1536', name: 'Tall (1024x1536)', aspect: '2:3' },
  { id: '1920x1080', name: 'HD (1920x1080)', aspect: '16:9' },
  { id: '1080x1920', name: 'Mobile (1080x1920)', aspect: '9:16' }
];

const IMAGE_TOOLS = [
  { id: 'upscale', name: 'Upscale', icon: 'resize-outline', description: 'Increase image resolution' },
  { id: 'enhance', name: 'Enhance', icon: 'color-wand-outline', description: 'Improve image quality' },
  { id: 'remove-bg', name: 'Remove BG', icon: 'cut-outline', description: 'Remove background' },
  { id: 'face-restore', name: 'Face Restore', icon: 'person-outline', description: 'Fix face details' },
  { id: 'inpaint', name: 'Inpaint', icon: 'brush-outline', description: 'Edit parts of image' },
  { id: 'outpaint', name: 'Outpaint', icon: 'expand-outline', description: 'Extend image borders' }
];

export default function ImageGenerationEnhancedScreen() {
  const toast = useToast();
  const { isOpen: isImageViewOpen, onOpen: openImageView, onClose: closeImageView } = useDisclose();
  const { isOpen: isToolsModalOpen, onOpen: openToolsModal, onClose: closeToolsModal } = useDisclose();

  // Form State
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('photorealistic');
  const [imageSize, setImageSize] = useState('1024x1024');
  const [selectedModel, setSelectedModel] = useState('stable-diffusion');
  const [numImages, setNumImages] = useState(4);
  
  // Advanced Settings
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [steps, setSteps] = useState(50);
  const [seed, setSeed] = useState(-1);
  const [useRandomSeed, setUseRandomSeed] = useState(true);
  
  // Image-to-Image
  const [sourceImage, setSourceImage] = useState<string>('');
  const [strength, setStrength] = useState(0.75);
  const [enableImg2Img, setEnableImg2Img] = useState(false);
  
  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Models and Options
  const [imageModels, setImageModels] = useState<AIModel[]>([]);
  const [imageHistory, setImageHistory] = useState<any[]>([]);

  useEffect(() => {
    loadImageModels();
    loadImageHistory();
  }, []);

  useEffect(() => {
    if (useRandomSeed) {
      setSeed(-1);
    }
  }, [useRandomSeed]);

  const loadImageModels = async () => {
    try {
      const models = await aiModelService.getAvailableModels('image');
      setImageModels(models);
    } catch (error) {
      console.error('Error loading image models:', error);
      toast.show({
        title: "Error",
        description: "Failed to load image models",
        status: "error",
      });
    }
  };

  const loadImageHistory = async () => {
    // Load from AsyncStorage or API
    // Implementation would fetch previous generations
  };

  const handleImagePicker = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        toast.show({
          title: "Permission Denied",
          description: "Please grant media library permissions",
          status: "error",
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setSourceImage(result.assets[0].uri);
        setEnableImg2Img(true);
        toast.show({
          title: "Image Selected",
          description: "Source image loaded for img2img generation",
          status: "success",
        });
      }
    } catch (error) {
      console.error('Image picker error:', error);
      toast.show({
        title: "Selection Failed",
        description: "Could not select image",
        status: "error",
      });
    }
  };

  const handleGenerateImages = async () => {
    if (!prompt.trim()) {
      toast.show({
        title: "Missing Prompt",
        description: "Please enter an image description",
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
          return prev + Math.random() * 10;
        });
      }, 1500);

      const params: ImageGenerationParams = {
        prompt: `${prompt}, ${selectedStyle}`,
        style: selectedStyle,
        size: imageSize as any,
        model: selectedModel
      };

      const response = await aiModelService.generateImage(params);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (response.data.success) {
        const images = Array.isArray(response.data.imageUrls) 
          ? response.data.imageUrls 
          : [response.data.imageUrl];
        setGeneratedImages(images);
        setSelectedImageIndex(0);
        
        // Add to history
        const newGeneration = {
          id: Date.now(),
          prompt,
          style: selectedStyle,
          size: imageSize,
          model: selectedModel,
          images,
          timestamp: new Date()
        };
        setImageHistory([newGeneration, ...imageHistory]);
        
        toast.show({
          title: "Success!",
          description: `Generated ${images.length} image(s)`,
          status: "success",
        });
      } else {
        throw new Error(response.data.error || 'Generation failed');
      }
    } catch (error) {
      console.error('Image generation error:', error);
      toast.show({
        title: "Generation Failed",
        description: error.message || "Something went wrong",
        status: "error",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadImage = async (imageUrl: string) => {
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

      const downloadUri = FileSystem.documentDirectory + `generated_image_${Date.now()}.png`;
      const { uri } = await FileSystem.downloadAsync(imageUrl, downloadUri);
      
      await MediaLibrary.saveToLibraryAsync(uri);
      
      toast.show({
        title: "Downloaded!",
        description: "Image saved to gallery",
        status: "success",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast.show({
        title: "Download Failed",
        description: "Could not save image",
        status: "error",
      });
    }
  };

  const handleImageTool = async (tool: string, imageUrl: string) => {
    try {
      // Implementation would call specific AI tools
      toast.show({
        title: `${tool} Started`,
        description: "Processing image...",
        status: "info",
      });
    } catch (error) {
      console.error('Image tool error:', error);
      toast.show({
        title: "Tool Failed",
        description: `Could not apply ${tool}`,
        status: "error",
      });
    }
  };

  return (
    <ScrollView flex={1} bg="white" p={4}>
      <VStack space={6}>
        {/* Header */}
        <HStack justifyContent="space-between" alignItems="center">
          <Heading size="lg">🎨 AI Image Studio</Heading>
          <HStack space={2}>
            <IconButton
              icon={<Ionicons name="image-outline" size={24} color="gray" />}
              onPress={handleImagePicker}
            />
            <IconButton
              icon={<Ionicons name="build-outline" size={24} color="gray" />}
              onPress={openToolsModal}
            />
          </HStack>
        </HStack>

        {/* Image Prompt */}
        <FormControl>
          <FormControl.Label>Image Description</FormControl.Label>
          <TextArea
            placeholder="Describe the image you want to create... (e.g., 'A majestic dragon in a mystical forest, detailed fantasy art')"
            value={prompt}
            onChangeText={setPrompt}
            h={20}
            fontSize="md"
          />
        </FormControl>

        {/* Negative Prompt */}
        <FormControl>
          <FormControl.Label>Negative Prompt (Optional)</FormControl.Label>
          <Input
            placeholder="Things to avoid... (e.g., 'blurry, low quality, distorted')"
            value={negativePrompt}
            onChangeText={setNegativePrompt}
          />
        </FormControl>

        {/* Style and Model */}
        <HStack space={4}>
          <FormControl flex={1}>
            <FormControl.Label>Style</FormControl.Label>
            <Select
              selectedValue={selectedStyle}
              onValueChange={setSelectedStyle}
              _selectedItem={{
                bg: "blue.600",
                endIcon: <CheckIcon size="5" />
              }}
            >
              {IMAGE_STYLES.map(style => (
                <Select.Item
                  key={style.id}
                  label={style.name}
                  value={style.id}
                />
              ))}
            </Select>
          </FormControl>

          <FormControl flex={1}>
            <FormControl.Label>AI Model</FormControl.Label>
            <Select
              selectedValue={selectedModel}
              onValueChange={setSelectedModel}
              _selectedItem={{
                bg: "purple.600",
                endIcon: <CheckIcon size="5" />
              }}
            >
              {imageModels.map(model => (
                <Select.Item
                  key={model.id}
                  label={model.name}
                  value={model.id}
                />
              ))}
            </Select>
          </FormControl>
        </HStack>

        {/* Image Size and Count */}
        <HStack space={4}>
          <FormControl flex={1}>
            <FormControl.Label>Image Size</FormControl.Label>
            <Select
              selectedValue={imageSize}
              onValueChange={setImageSize}
              _selectedItem={{ endIcon: <CheckIcon size="5" /> }}
            >
              {IMAGE_SIZES.map(size => (
                <Select.Item
                  key={size.id}
                  label={size.name}
                  value={size.id}
                />
              ))}
            </Select>
          </FormControl>

          <VStack flex={1}>
            <FormControl.Label>Number of Images</FormControl.Label>
            <HStack alignItems="center" space={2}>
              <Text>1</Text>
              <Slider
                flex={1}
                value={numImages}
                onChange={setNumImages}
                minValue={1}
                maxValue={8}
                step={1}
              >
                <Slider.Track>
                  <Slider.FilledTrack />
                </Slider.Track>
                <Slider.Thumb />
              </Slider>
              <Text>8</Text>
            </HStack>
            <Text fontSize="sm" color="gray.600" textAlign="center">{numImages}</Text>
          </VStack>
        </HStack>

        {/* Image-to-Image Section */}
        <Box bg="gray.50" p={4} rounded="lg">
          <HStack justifyContent="space-between" alignItems="center" mb={3}>
            <Heading size="md">Image-to-Image</Heading>
            <Switch
              isChecked={enableImg2Img}
              onToggle={setEnableImg2Img}
            />
          </HStack>
          
          {enableImg2Img && (
            <VStack space={3}>
              {sourceImage ? (
                <Box>
                  <Image
                    source={{ uri: sourceImage }}
                    alt="Source"
                    height="100"
                    width="100"
                    rounded="md"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    mt={2}
                    onPress={() => setSourceImage('')}
                  >
                    Remove
                  </Button>
                </Box>
              ) : (
                <Button
                  variant="outline"
                  leftIcon={<Ionicons name="image-outline" size={16} />}
                  onPress={handleImagePicker}
                >
                  Select Source Image
                </Button>
              )}
              
              <VStack>
                <FormControl.Label>Strength</FormControl.Label>
                <HStack alignItems="center" space={2}>
                  <Text>0.1</Text>
                  <Slider
                    flex={1}
                    value={strength}
                    onChange={setStrength}
                    minValue={0.1}
                    maxValue={1.0}
                    step={0.05}
                  >
                    <Slider.Track>
                      <Slider.FilledTrack />
                    </Slider.Track>
                    <Slider.Thumb />
                  </Slider>
                  <Text>1.0</Text>
                </HStack>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  {strength.toFixed(2)}
                </Text>
              </VStack>
            </VStack>
          )}
        </Box>

        {/* Advanced Settings */}
        <Box bg="gray.50" p={4} rounded="lg">
          <Heading size="md" mb={3}>Advanced Settings</Heading>
          
          <VStack space={3}>
            {/* Guidance Scale */}
            <VStack>
              <FormControl.Label>Guidance Scale</FormControl.Label>
              <HStack alignItems="center" space={2}>
                <Text>1</Text>
                <Slider
                  flex={1}
                  value={guidanceScale}
                  onChange={setGuidanceScale}
                  minValue={1}
                  maxValue={20}
                  step={0.5}
                >
                  <Slider.Track>
                    <Slider.FilledTrack />
                  </Slider.Track>
                  <Slider.Thumb />
                </Slider>
                <Text>20</Text>
              </HStack>
              <Text fontSize="sm" color="gray.600" textAlign="center">
                {guidanceScale.toFixed(1)} (Higher = More Prompt Following)
              </Text>
            </VStack>

            {/* Steps */}
            <VStack>
              <FormControl.Label>Steps</FormControl.Label>
              <HStack alignItems="center" space={2}>
                <Text>10</Text>
                <Slider
                  flex={1}
                  value={steps}
                  onChange={setSteps}
                  minValue={10}
                  maxValue={150}
                  step={5}
                >
                  <Slider.Track>
                    <Slider.FilledTrack />
                  </Slider.Track>
                  <Slider.Thumb />
                </Slider>
                <Text>150</Text>
              </HStack>
              <Text fontSize="sm" color="gray.600" textAlign="center">
                {steps} (Higher = Better Quality, Slower)
              </Text>
            </VStack>

            {/* Seed */}
            <HStack justifyContent="space-between" alignItems="center">
              <Text>Random Seed</Text>
              <Switch
                isChecked={useRandomSeed}
                onToggle={setUseRandomSeed}
              />
            </HStack>
            
            {!useRandomSeed && (
              <Input
                placeholder="Seed number"
                value={seed.toString()}
                onChangeText={(text) => setSeed(parseInt(text) || -1)}
                keyboardType="numeric"
              />
            )}
          </VStack>
        </Box>

        {/* Generation Progress */}
        {isGenerating && (
          <Box>
            <HStack justifyContent="space-between" mb={2}>
              <Text>Generating Images...</Text>
              <Text>{Math.round(progress)}%</Text>
            </HStack>
            <Progress value={progress} colorScheme="blue" />
            <Text fontSize="sm" color="gray.600" mt={1}>
              Using {imageModels.find(m => m.id === selectedModel)?.name || 'AI Model'}
            </Text>
          </Box>
        )}

        {/* Generated Images */}
        {generatedImages.length > 0 && (
          <Box>
            <Heading size="md" mb={3}>Generated Images</Heading>
            
            {/* Image Grid */}
            <VStack space={3}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <HStack space={2}>
                  {generatedImages.map((imageUrl, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        setSelectedImageIndex(index);
                        openImageView();
                      }}
                    >
                      <Box
                        borderWidth={selectedImageIndex === index ? 3 : 1}
                        borderColor={selectedImageIndex === index ? "blue.500" : "gray.200"}
                        rounded="md"
                        overflow="hidden"
                      >
                        <Image
                          source={{ uri: imageUrl }}
                          alt={`Generated ${index + 1}`}
                          width="120"
                          height="120"
                        />
                      </Box>
                    </TouchableOpacity>
                  ))}
                </HStack>
              </ScrollView>
              
              {/* Selected Image Actions */}
              <HStack justifyContent="space-between">
                <Button
                  variant="outline"
                  leftIcon={<Ionicons name="download-outline" size={16} />}
                  onPress={() => handleDownloadImage(generatedImages[selectedImageIndex])}
                >
                  Download
                </Button>
                <Button
                  variant="outline"
                  leftIcon={<Ionicons name="share-outline" size={16} />}
                  onPress={() => Sharing.shareAsync(generatedImages[selectedImageIndex])}
                >
                  Share
                </Button>
                <Button
                  variant="outline"
                  leftIcon={<Ionicons name="build-outline" size={16} />}
                  onPress={openToolsModal}
                >
                  Edit
                </Button>
              </HStack>
            </VStack>
          </Box>
        )}

        {/* Generate Button */}
        <Button
          size="lg"
          colorScheme="blue"
          leftIcon={<Ionicons name="image-outline" size={20} />}
          onPress={handleGenerateImages}
          isLoading={isGenerating}
          loadingText="Generating..."
        >
          Generate Images
        </Button>
      </VStack>

      {/* Image View Modal */}
      <Modal isOpen={isImageViewOpen} onClose={closeImageView} size="full">
        <Modal.Content>
          <Modal.CloseButton />
          <Modal.Header>Generated Image</Modal.Header>
          <Modal.Body>
            {generatedImages[selectedImageIndex] && (
              <VStack space={4} alignItems="center">
                <Image
                  source={{ uri: generatedImages[selectedImageIndex] }}
                  alt="Full Size"
                  width={width - 40}
                  height={width - 40}
                  resizeMode="contain"
                />
                
                <HStack space={2}>
                  <Button
                    size="sm"
                    leftIcon={<Ionicons name="download" size={16} />}
                    onPress={() => handleDownloadImage(generatedImages[selectedImageIndex])}
                  >
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Ionicons name="share" size={16} />}
                    onPress={() => Sharing.shareAsync(generatedImages[selectedImageIndex])}
                  >
                    Share
                  </Button>
                </HStack>
              </VStack>
            )}
          </Modal.Body>
        </Modal.Content>
      </Modal>

      {/* Image Tools Modal */}
      <Modal isOpen={isToolsModalOpen} onClose={closeToolsModal}>
        <Modal.Content maxWidth="90%">
          <Modal.CloseButton />
          <Modal.Header>Image Tools</Modal.Header>
          <Modal.Body>
            <VStack space={3}>
              <Text fontWeight="bold">Select a tool to enhance your image:</Text>
              {IMAGE_TOOLS.map(tool => (
                <Button
                  key={tool.id}
                  variant="outline"
                  leftIcon={<Ionicons name={tool.icon as any} size={16} />}
                  onPress={() => {
                    if (generatedImages[selectedImageIndex]) {
                      handleImageTool(tool.name, generatedImages[selectedImageIndex]);
                      closeToolsModal();
                    }
                  }}
                  isDisabled={generatedImages.length === 0}
                >
                  <VStack alignItems="flex-start">
                    <Text fontWeight="bold">{tool.name}</Text>
                    <Text fontSize="sm" color="gray.600">{tool.description}</Text>
                  </VStack>
                </Button>
              ))}
            </VStack>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </ScrollView>
  );
}