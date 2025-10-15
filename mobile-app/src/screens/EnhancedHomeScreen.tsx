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
  Image,
  Pressable,
  useToast,
  Progress,
  Divider,
  IconButton,
  Input,
  Modal,
  useDisclose,
  FormControl,
  Select,
  CheckIcon
} from 'native-base';
import { Dimensions, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { aiModelService, AIModel } from '../services/AIModelService';

const { width } = Dimensions.get('window');

interface QuickAction {
  id: string;
  title: string;
  icon: string;
  description: string;
  screen: string;
  color: string;
  category: 'creation' | 'tools' | 'sharing';
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'video-gen',
    title: 'Generate Video',
    icon: 'videocam',
    description: 'Create AI videos with multiple styles',
    screen: 'EnhancedVideoGeneration',
    color: 'purple.500',
    category: 'creation'
  },
  {
    id: 'app-gen',
    title: 'Build App',
    icon: 'phone-portrait',
    description: 'Generate mobile & web applications',
    screen: 'AppGeneration',
    color: 'green.500',
    category: 'creation'
  },
  {
    id: 'audio-gen',
    title: 'Create Audio',
    icon: 'musical-notes',
    description: 'Music, voice, and sound effects',
    screen: 'AudioGeneration',
    color: 'orange.500',
    category: 'creation'
  },
  {
    id: 'image-gen',
    title: 'Generate Images',
    icon: 'image',
    description: 'AI-powered image creation',
    screen: 'ImageGeneration',
    color: 'blue.500',
    category: 'creation'
  },
  {
    id: 'code-editor',
    title: 'Code Editor',
    icon: 'code-slash',
    description: 'View and edit generated code',
    screen: 'CodeEditor',
    color: 'gray.600',
    category: 'tools'
  },
  {
    id: 'model-manager',
    title: 'AI Models',
    icon: 'settings',
    description: 'Manage AI models and settings',
    screen: 'ModelManager',
    color: 'cyan.500',
    category: 'tools'
  }
];

interface RecentProject {
  id: string;
  type: 'video' | 'app' | 'audio' | 'image';
  title: string;
  thumbnail?: string;
  createdAt: Date;
  model: string;
  status: 'completed' | 'generating' | 'failed';
}

export default function EnhancedHomeScreen() {
  const navigation = useNavigation();
  const toast = useToast();
  const { isOpen: isAddModelOpen, onOpen: openAddModel, onClose: closeAddModel } = useDisclose();

  // State
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [systemStats, setSystemStats] = useState({
    totalGenerations: 0,
    modelsInstalled: 0,
    storageUsed: 0,
    ramUsage: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Add Model Form
  const [newModelUrl, setNewModelUrl] = useState('');
  const [newModelType, setNewModelType] = useState<'video' | 'audio' | 'image' | 'text' | 'code'>('video');
  const [newModelName, setNewModelName] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        loadAvailableModels(),
        loadRecentProjects(),
        loadSystemStats()
      ]);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailableModels = async () => {
    try {
      const models = await aiModelService.getAvailableModels();
      setAvailableModels(models);
    } catch (error) {
      console.error('Error loading models:', error);
    }
  };

  const loadRecentProjects = async () => {
    try {
      const projects = await AsyncStorage.getItem('recent_projects');
      if (projects) {
        setRecentProjects(JSON.parse(projects));
      }
    } catch (error) {
      console.error('Error loading recent projects:', error);
    }
  };

  const loadSystemStats = async () => {
    try {
      const stats = await AsyncStorage.getItem('system_stats');
      if (stats) {
        setSystemStats(JSON.parse(stats));
      } else {
        // Calculate stats from available data
        setSystemStats({
          totalGenerations: recentProjects.length,
          modelsInstalled: availableModels.length,
          storageUsed: Math.floor(Math.random() * 50), // Simulated
          ramUsage: Math.floor(Math.random() * 80) // Simulated
        });
      }
    } catch (error) {
      console.error('Error loading system stats:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleAddCustomModel = async () => {
    if (!newModelUrl.trim() || !newModelName.trim()) {
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
        description: 'Custom AI model added by user'
      });
      
      await loadAvailableModels();
      
      setNewModelUrl('');
      setNewModelName('');
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

  const getModelCountByType = (type: string) => {
    return availableModels.filter(model => model.type === type && model.isEnabled).length;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green.500';
      case 'generating': return 'orange.500';
      case 'failed': return 'red.500';
      default: return 'gray.500';
    }
  };

  const filteredActions = QUICK_ACTIONS.filter(action =>
    action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    action.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView
      flex={1}
      bg="white"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <VStack space={6} p={4}>
        {/* Header */}
        <HStack justifyContent="space-between" alignItems="center" mt={2}>
          <VStack>
            <Heading size="xl">🤖 AI Agent Studio</Heading>
            <Text color="gray.600">Create anything with AI</Text>
          </VStack>
          <IconButton
            icon={<Ionicons name="add-circle-outline" size={28} />}
            onPress={openAddModel}
          />
        </HStack>

        {/* Search Bar */}
        <Input
          placeholder="Search AI tools and features..."
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
          bg="gray.50"
        />

        {/* System Stats */}
        <Box bg="gradient.500" p={4} rounded="xl" shadow={3}>
          <HStack justifyContent="space-between" mb={4}>
            <Heading size="md" color="white">System Status</Heading>
            <Badge colorScheme="green">Online</Badge>
          </HStack>
          
          <HStack justifyContent="space-between">
            <VStack alignItems="center">
              <Text fontSize="2xl" fontWeight="bold" color="white">
                {systemStats.modelsInstalled}
              </Text>
              <Text fontSize="sm" color="white" opacity={0.8}>AI Models</Text>
            </VStack>
            
            <VStack alignItems="center">
              <Text fontSize="2xl" fontWeight="bold" color="white">
                {systemStats.totalGenerations}
              </Text>
              <Text fontSize="sm" color="white" opacity={0.8}>Generated</Text>
            </VStack>
            
            <VStack alignItems="center">
              <Text fontSize="2xl" fontWeight="bold" color="white">
                {systemStats.ramUsage}%
              </Text>
              <Text fontSize="sm" color="white" opacity={0.8}>RAM Usage</Text>
            </VStack>
          </HStack>
          
          {systemStats.ramUsage > 80 && (
            <Box mt={3}>
              <HStack justifyContent="space-between" alignItems="center" mb={1}>
                <Text fontSize="sm" color="white">Memory Usage</Text>
                <Text fontSize="sm" color="white">{systemStats.ramUsage}%</Text>
              </HStack>
              <Progress value={systemStats.ramUsage} colorScheme="warning" />
            </Box>
          )}
        </Box>

        {/* AI Model Overview */}
        <Box>
          <HStack justifyContent="space-between" alignItems="center" mb={3}>
            <Heading size="lg">AI Models</Heading>
            <Button size="sm" variant="outline" onPress={() => navigation.navigate('ModelManager' as never)}>
              Manage
            </Button>
          </HStack>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <HStack space={3}>
              {[
                { type: 'video', name: 'Video', icon: 'videocam', color: 'purple.500' },
                { type: 'audio', name: 'Audio', icon: 'musical-notes', color: 'orange.500' },
                { type: 'image', name: 'Image', icon: 'image', color: 'blue.500' },
                { type: 'code', name: 'Code', icon: 'code-slash', color: 'green.500' },
                { type: 'text', name: 'Text', icon: 'document-text', color: 'gray.600' }
              ].map(category => (
                <Box
                  key={category.type}
                  bg={`${category.color.split('.')[0]}.50`}
                  p={4}
                  rounded="lg"
                  alignItems="center"
                  minW="100"
                >
                  <Ionicons
                    name={category.icon as any}
                    size={24}
                    color={category.color}
                  />
                  <Text fontSize="sm" fontWeight="medium" mt={2}>
                    {category.name}
                  </Text>
                  <Badge size="sm" colorScheme={category.color.split('.')[0]}>
                    {getModelCountByType(category.type)} models
                  </Badge>
                </Box>
              ))}
            </HStack>
          </ScrollView>
        </Box>

        {/* Quick Actions */}
        <Box>
          <Heading size="lg" mb={4}>Create with AI</Heading>
          
          <VStack space={3}>
            {filteredActions.map(action => (
              <Pressable
                key={action.id}
                onPress={() => navigation.navigate(action.screen as never)}
              >
                <Box
                  bg="white"
                  p={4}
                  rounded="lg"
                  shadow={2}
                  borderWidth={1}
                  borderColor="gray.100"
                >
                  <HStack space={4} alignItems="center">
                    <Box
                      bg={`${action.color.split('.')[0]}.100`}
                      p={3}
                      rounded="full"
                    >
                      <Ionicons
                        name={action.icon as any}
                        size={24}
                        color={action.color}
                      />
                    </Box>
                    
                    <VStack flex={1}>
                      <Text fontSize="lg" fontWeight="bold">
                        {action.title}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {action.description}
                      </Text>
                    </VStack>
                    
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="gray.400"
                    />
                  </HStack>
                </Box>
              </Pressable>
            ))}
          </VStack>
        </Box>

        {/* Recent Projects */}
        {recentProjects.length > 0 && (
          <Box>
            <HStack justifyContent="space-between" alignItems="center" mb={3}>
              <Heading size="lg">Recent Projects</Heading>
              <Button size="sm" variant="ghost">View All</Button>
            </HStack>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <HStack space={3}>
                {recentProjects.slice(0, 5).map(project => (
                  <Box
                    key={project.id}
                    bg="white"
                    rounded="lg"
                    shadow={2}
                    width="200"
                    overflow="hidden"
                  >
                    {project.thumbnail ? (
                      <Image
                        source={{ uri: project.thumbnail }}
                        alt={project.title}
                        height="100"
                        width="200"
                      />
                    ) : (
                      <Box
                        bg="gray.200"
                        height="100"
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Ionicons
                          name={
                            project.type === 'video' ? 'videocam' :
                            project.type === 'audio' ? 'musical-notes' :
                            project.type === 'image' ? 'image' :
                            'phone-portrait'
                          }
                          size={32}
                          color="gray.500"
                        />
                      </Box>
                    )}
                    
                    <VStack p={3} space={2}>
                      <Text fontSize="sm" fontWeight="medium" numberOfLines={2}>
                        {project.title}
                      </Text>
                      
                      <HStack justifyContent="space-between" alignItems="center">
                        <Badge
                          colorScheme={
                            project.type === 'video' ? 'purple' :
                            project.type === 'audio' ? 'orange' :
                            project.type === 'image' ? 'blue' :
                            'green'
                          }
                          size="sm"
                        >
                          {project.type}
                        </Badge>
                        
                        <Badge
                          colorScheme={getStatusColor(project.status).split('.')[0] as any}
                          variant="outline"
                          size="sm"
                        >
                          {project.status}
                        </Badge>
                      </HStack>
                      
                      <Text fontSize="xs" color="gray.500">
                        {project.model}
                      </Text>
                    </VStack>
                  </Box>
                ))}
              </HStack>
            </ScrollView>
          </Box>
        )}

        {/* Device Performance Tips */}
        <Box bg="yellow.50" p={4} rounded="lg" borderWidth={1} borderColor="yellow.200">
          <HStack space={3} alignItems="center">
            <Ionicons name="bulb" size={24} color="#D69E2E" />
            <VStack flex={1}>
              <Text fontWeight="bold" color="yellow.800">
                Optimization Tip
              </Text>
              <Text fontSize="sm" color="yellow.700">
                {systemStats.ramUsage > 70
                  ? "Close other apps to improve AI generation speed"
                  : "Your device is optimized for AI generation"}
              </Text>
            </VStack>
          </HStack>
        </Box>
      </VStack>

      {/* Add Custom Model Modal */}
      <Modal isOpen={isAddModelOpen} onClose={closeAddModel}>
        <Modal.Content maxWidth="90%">
          <Modal.CloseButton />
          <Modal.Header>Add Custom AI Model</Modal.Header>
          <Modal.Body>
            <VStack space={4}>
              <FormControl>
                <FormControl.Label>Model Name</FormControl.Label>
                <Input
                  placeholder="My Custom Model"
                  value={newModelName}
                  onChangeText={setNewModelName}
                />
              </FormControl>
              
              <FormControl>
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
                <FormControl.Label>GitHub URL or API Endpoint</FormControl.Label>
                <Input
                  placeholder="https://github.com/user/repo or https://api.example.com"
                  value={newModelUrl}
                  onChangeText={setNewModelUrl}
                />
              </FormControl>
              
              <Button onPress={handleAddCustomModel}>
                Add Model
              </Button>
            </VStack>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </ScrollView>
  );
}