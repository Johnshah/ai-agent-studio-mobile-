import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  ScrollView,
  Heading,
  Badge,
  Switch,
  useToast,
  Modal,
  FormControl,
  Input,
  Select,
  CheckIcon,
  IconButton,
  Divider,
  Progress,
  Alert,
  AlertIcon,
  useDisclose
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { Linking } from 'react-native';

import { aiModelService, AIModel } from '../services/AIModelService';

export default function ModelManagerScreen() {
  const toast = useToast();
  const { isOpen: isAddModelOpen, onOpen: openAddModel, onClose: closeAddModel } = useDisclose();

  // State
  const [models, setModels] = useState<AIModel[]>([]);
  const [filteredModels, setFilteredModels] = useState<AIModel[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Add Model Form
  const [newModelName, setNewModelName] = useState('');
  const [newModelUrl, setNewModelUrl] = useState('');
  const [newModelType, setNewModelType] = useState<'video' | 'audio' | 'image' | 'text' | 'code'>('video');
  const [newModelDescription, setNewModelDescription] = useState('');

  useEffect(() => {
    loadModels();
  }, []);

  useEffect(() => {
    filterModels();
  }, [models, selectedType, searchQuery]);

  const loadModels = async () => {
    try {
      setIsLoading(true);
      const allModels = await aiModelService.getAvailableModels();
      setModels(allModels);
    } catch (error) {
      console.error('Error loading models:', error);
      toast.show({
        title: "Error",
        description: "Failed to load AI models",
        status: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterModels = () => {
    let filtered = models;
    
    if (selectedType !== 'all') {
      filtered = filtered.filter(model => model.type === selectedType);
    }
    
    if (searchQuery.trim()) {
      filtered = filtered.filter(model =>
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredModels(filtered);
  };

  const handleToggleModel = async (modelId: string, isEnabled: boolean) => {
    try {
      await aiModelService.updateModelStatus(modelId, isEnabled);
      setModels(prevModels =>
        prevModels.map(model =>
          model.id === modelId ? { ...model, isEnabled } : model
        )
      );
      
      toast.show({
        title: isEnabled ? "Model Enabled" : "Model Disabled",
        description: `${models.find(m => m.id === modelId)?.name} ${isEnabled ? 'enabled' : 'disabled'}`,
        status: "success",
      });
    } catch (error) {
      console.error('Error toggling model:', error);
      toast.show({
        title: "Error",
        description: "Failed to update model status",
        status: "error",
      });
    }
  };

  const handleAddModel = async () => {
    if (!newModelName.trim() || !newModelUrl.trim()) {
      toast.show({
        title: "Missing Information",
        description: "Please provide model name and URL",
        status: "warning",
      });
      return;
    }

    try {
      await aiModelService.addCustomModel({
        name: newModelName,
        type: newModelType,
        githubUrl: newModelUrl,
        description: newModelDescription || 'Custom AI model'
      });
      
      await loadModels();
      
      setNewModelName('');
      setNewModelUrl('');
      setNewModelDescription('');
      closeAddModel();
      
      toast.show({
        title: "Model Added",
        description: `${newModelName} added successfully`,
        status: "success",
      });
    } catch (error) {
      console.error('Error adding model:', error);
      toast.show({
        title: "Add Failed",
        description: "Could not add custom model",
        status: "error",
      });
    }
  };

  const openGitHub = (url: string) => {
    Linking.openURL(url);
  };

  const getModelTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'purple';
      case 'audio': return 'orange';
      case 'image': return 'blue';
      case 'code': return 'green';
      case 'text': return 'gray';
      default: return 'gray';
    }
  };

  const getModelTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return 'videocam';
      case 'audio': return 'musical-notes';
      case 'image': return 'image';
      case 'code': return 'code-slash';
      case 'text': return 'document-text';
      default: return 'cube';
    }
  };

  const modelTypes = [
    { value: 'all', label: 'All Models' },
    { value: 'video', label: 'Video' },
    { value: 'audio', label: 'Audio' },
    { value: 'image', label: 'Image' },
    { value: 'code', label: 'Code' },
    { value: 'text', label: 'Text' }
  ];

  return (
    <ScrollView flex={1} bg="white" p={4}>
      <VStack space={4}>
        {/* Header */}
        <HStack justifyContent="space-between" alignItems="center">
          <Heading size="lg">🤖 AI Models</Heading>
          <Button
            leftIcon={<Ionicons name="add" size={16} />}
            onPress={openAddModel}
            size="sm"
          >
            Add Model
          </Button>
        </HStack>

        {/* Search and Filter */}
        <VStack space={3}>
          <Input
            placeholder="Search models..."
            leftElement={
              <Ionicons
                name="search"
                size={20}
                color="gray"
                style={{ marginLeft: 10 }}
              />
            }
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          
          <Select
            selectedValue={selectedType}
            onValueChange={setSelectedType}
            placeholder="Filter by type"
            _selectedItem={{
              bg: "cyan.600",
              endIcon: <CheckIcon size="5" />
            }}
          >
            {modelTypes.map(type => (
              <Select.Item
                key={type.value}
                label={type.label}
                value={type.value}
              />
            ))}
          </Select>
        </VStack>

        {/* Statistics */}
        <HStack justifyContent="space-around" bg="gray.50" p={4} rounded="lg">
          <VStack alignItems="center">
            <Text fontSize="2xl" fontWeight="bold" color="green.600">
              {models.filter(m => m.isEnabled).length}
            </Text>
            <Text fontSize="sm" color="gray.600">Active</Text>
          </VStack>
          
          <VStack alignItems="center">
            <Text fontSize="2xl" fontWeight="bold" color="blue.600">
              {models.length}
            </Text>
            <Text fontSize="sm" color="gray.600">Total</Text>
          </VStack>
          
          <VStack alignItems="center">
            <Text fontSize="2xl" fontWeight="bold" color="purple.600">
              {new Set(models.map(m => m.type)).size}
            </Text>
            <Text fontSize="sm" color="gray.600">Types</Text>
          </VStack>
        </HStack>

        {/* Models List */}
        <VStack space={3}>
          <HStack justifyContent="space-between" alignItems="center">
            <Text fontSize="lg" fontWeight="bold">
              Available Models ({filteredModels.length})
            </Text>
          </HStack>
          
          {isLoading ? (
            <Box>
              <Progress colorScheme="blue" isIndeterminate />
              <Text textAlign="center" mt={2} color="gray.600">
                Loading models...
              </Text>
            </Box>
          ) : (
            <VStack space={2}>
              {filteredModels.map(model => (
                <Box
                  key={model.id}
                  bg="white"
                  p={4}
                  rounded="lg"
                  shadow={1}
                  borderWidth={1}
                  borderColor="gray.100"
                >
                  <HStack space={3} alignItems="center">
                    <Box
                      bg={`${getModelTypeColor(model.type)}.100`}
                      p={2}
                      rounded="md"
                    >
                      <Ionicons
                        name={getModelTypeIcon(model.type) as any}
                        size={20}
                        color={getModelTypeColor(model.type)}
                      />
                    </Box>
                    
                    <VStack flex={1} space={1}>
                      <HStack justifyContent="space-between" alignItems="center">
                        <Text fontSize="md" fontWeight="bold">
                          {model.name}
                        </Text>
                        <Switch
                          size="sm"
                          isChecked={model.isEnabled}
                          onToggle={(value) => handleToggleModel(model.id, value)}
                        />
                      </HStack>
                      
                      <Text fontSize="sm" color="gray.600" numberOfLines={2}>
                        {model.description}
                      </Text>
                      
                      <HStack space={2} alignItems="center" mt={1}>
                        <Badge
                          colorScheme={getModelTypeColor(model.type)}
                          size="sm"
                        >
                          {model.type}
                        </Badge>
                        
                        <Badge
                          colorScheme="gray"
                          variant="outline"
                          size="sm"
                        >
                          {model.requirements.minRam}GB RAM
                        </Badge>
                        
                        {model.huggingfaceUrl && (
                          <Badge colorScheme="orange" size="sm">
                            HuggingFace
                          </Badge>
                        )}
                      </HStack>
                      
                      <HStack space={2} mt={2}>
                        <Button
                          size="xs"
                          variant="outline"
                          leftIcon={<Ionicons name="logo-github" size={12} />}
                          onPress={() => openGitHub(model.githubUrl)}
                        >
                          GitHub
                        </Button>
                        
                        {model.huggingfaceUrl && (
                          <Button
                            size="xs"
                            variant="outline"
                            colorScheme="orange"
                            leftIcon={<Ionicons name="link" size={12} />}
                            onPress={() => openGitHub(model.huggingfaceUrl!)}
                          >
                            HF Space
                          </Button>
                        )}
                      </HStack>
                    </VStack>
                  </HStack>
                </Box>
              ))}
              
              {filteredModels.length === 0 && !isLoading && (
                <Box bg="gray.50" p={8} rounded="lg" alignItems="center">
                  <Ionicons name="cube-outline" size={48} color="gray.400" />
                  <Text fontSize="lg" color="gray.600" mt={2}>
                    No models found
                  </Text>
                  <Text fontSize="sm" color="gray.500" textAlign="center" mt={1}>
                    Try adjusting your search or filter criteria
                  </Text>
                </Box>
              )}
            </VStack>
          )}
        </VStack>

        {/* Performance Tips */}
        <Alert status="info" colorScheme="info">
          <VStack space={2} flexShrink={1} w="100%">
            <HStack flexShrink={1} space={2} alignItems="center">
              <Alert.Icon />
              <Text
                fontSize="md"
                fontWeight="medium"
                flexShrink={1}
                color="coolGray.800"
              >
                Performance Tips
              </Text>
            </HStack>
            <Box pl="6">
              <Text fontSize="sm">
                • Enable only models you frequently use to save RAM
              </Text>
              <Text fontSize="sm">
                • Models with lower RAM requirements work better on older devices
              </Text>
              <Text fontSize="sm">
                • HuggingFace models run in the cloud for better performance
              </Text>
            </Box>
          </VStack>
        </Alert>
      </VStack>

      {/* Add Model Modal */}
      <Modal isOpen={isAddModelOpen} onClose={closeAddModel}>
        <Modal.Content maxWidth="90%">
          <Modal.CloseButton />
          <Modal.Header>Add Custom AI Model</Modal.Header>
          <Modal.Body>
            <VStack space={4}>
              <FormControl isRequired>
                <FormControl.Label>Model Name</FormControl.Label>
                <Input
                  placeholder="My Custom Model"
                  value={newModelName}
                  onChangeText={setNewModelName}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormControl.Label>Model Type</FormControl.Label>
                <Select
                  selectedValue={newModelType}
                  onValueChange={setNewModelType as any}
                  _selectedItem={{ endIcon: <CheckIcon size="5" /> }}
                >
                  <Select.Item label="Video Generation" value="video" />
                  <Select.Item label="Audio Generation" value="audio" />
                  <Select.Item label="Image Generation" value="image" />
                  <Select.Item label="Code Generation" value="code" />
                  <Select.Item label="Text Generation" value="text" />
                </Select>
              </FormControl>
              
              <FormControl>
                <FormControl.Label>Description</FormControl.Label>
                <Input
                  placeholder="Brief description of the model..."
                  value={newModelDescription}
                  onChangeText={setNewModelDescription}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormControl.Label>GitHub URL or API Endpoint</FormControl.Label>
                <Input
                  placeholder="https://github.com/user/repo"
                  value={newModelUrl}
                  onChangeText={setNewModelUrl}
                />
                <FormControl.HelperText>
                  Provide the GitHub repository URL or API endpoint
                </FormControl.HelperText>
              </FormControl>
              
              <HStack space={2} justifyContent="flex-end">
                <Button variant="ghost" onPress={closeAddModel}>
                  Cancel
                </Button>
                <Button onPress={handleAddModel}>
                  Add Model
                </Button>
              </HStack>
            </VStack>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </ScrollView>
  );
}