import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  ScrollView,
  Card,
  Badge,
  Progress,
  Pressable,
  Center,
  Divider,
  useToast
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useAIAgent } from '../store/AIAgentStore';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { state } = useAIAgent();
  const toast = useToast();

  const quickActions = [
    {
      id: 'video',
      title: 'Generate Video',
      subtitle: 'Create AI videos with Wan2.2',
      icon: 'videocam',
      color: 'blue.500',
      screen: 'Video'
    },
    {
      id: 'app',
      title: 'Build App',
      subtitle: 'Create mobile/web apps',
      icon: 'phone-portrait',
      color: 'green.500',
      screen: 'Apps'
    },
    {
      id: 'music',
      title: 'Create Music',
      subtitle: 'Generate songs & audio',
      icon: 'musical-notes',
      color: 'purple.500',
      screen: 'Music'
    },
    {
      id: 'image',
      title: 'Generate Images',
      subtitle: 'Create AI artwork',
      icon: 'image',
      color: 'orange.500',
      screen: 'Images'
    }
  ];

  const recentProjects = state.projects.slice(0, 3);
  const activeModels = state.models.filter(m => m.isEnabled).length;

  return (
    <ScrollView bg="gray.50" flex={1}>
      <VStack space={6} p={4}>
        {/* Header */}
        <Box>
          <HStack justifyContent="space-between" alignItems="center" mb={2}>
            <VStack>
              <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                Welcome to AI Studio
              </Text>
              <Text fontSize="md" color="gray.600">
                Create anything with AI
              </Text>
            </VStack>
            <Pressable onPress={() => navigation.navigate('Settings' as never)}>
              <Ionicons name="settings-outline" size={24} color="#6366f1" />
            </Pressable>
          </HStack>
          
          {/* Status Cards */}
          <HStack space={3} mt={4}>
            <Card flex={1} p={3}>
              <VStack alignItems="center">
                <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                  {activeModels}
                </Text>
                <Text fontSize="xs" color="gray.600">AI Models</Text>
              </VStack>
            </Card>
            <Card flex={1} p={3}>
              <VStack alignItems="center">
                <Text fontSize="2xl" fontWeight="bold" color="green.500">
                  {state.projects.length}
                </Text>
                <Text fontSize="xs" color="gray.600">Projects</Text>
              </VStack>
            </Card>
            <Card flex={1} p={3}>
              <VStack alignItems="center">
                <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                  {state.projects.filter(p => p.status === 'completed').length}
                </Text>
                <Text fontSize="xs" color="gray.600">Completed</Text>
              </VStack>
            </Card>
          </HStack>
        </Box>

        {/* Quick Actions */}
        <Box>
          <Text fontSize="lg" fontWeight="bold" color="gray.800" mb={3}>
            Quick Actions
          </Text>
          <VStack space={3}>
            {quickActions.map((action) => (
              <Pressable
                key={action.id}
                onPress={() => navigation.navigate(action.screen as never)}
              >
                <Card>
                  <HStack p={4} alignItems="center" space={4}>
                    <Center
                      w={12}
                      h={12}
                      bg={action.color}
                      rounded="full"
                    >
                      <Ionicons 
                        name={action.icon as keyof typeof Ionicons.glyphMap} 
                        size={24} 
                        color="white" 
                      />
                    </Center>
                    <VStack flex={1}>
                      <Text fontSize="md" fontWeight="semibold" color="gray.800">
                        {action.title}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {action.subtitle}
                      </Text>
                    </VStack>
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                  </HStack>
                </Card>
              </Pressable>
            ))}
          </VStack>
        </Box>

        {/* Recent Projects */}
        <Box>
          <HStack justifyContent="space-between" alignItems="center" mb={3}>
            <Text fontSize="lg" fontWeight="bold" color="gray.800">
              Recent Projects
            </Text>
            <Pressable onPress={() => navigation.navigate('Projects' as never)}>
              <Text fontSize="sm" color="blue.500">View All</Text>
            </Pressable>
          </HStack>
          
          {recentProjects.length > 0 ? (
            <VStack space={3}>
              {recentProjects.map((project) => (
                <Card key={project.id}>
                  <VStack p={4} space={2}>
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontSize="md" fontWeight="semibold" color="gray.800">
                        {project.name}
                      </Text>
                      <Badge
                        variant="subtle"
                        colorScheme={
                          project.status === 'completed' ? 'green' :
                          project.status === 'generating' ? 'blue' :
                          project.status === 'error' ? 'red' : 'gray'
                        }
                      >
                        {project.status}
                      </Badge>
                    </HStack>
                    <Text fontSize="sm" color="gray.600" capitalize>
                      {project.type} Project
                    </Text>
                    {project.status === 'generating' && (
                      <Progress 
                        value={65} 
                        colorScheme="blue" 
                        size="sm" 
                        mt={2}
                      />
                    )}
                  </VStack>
                </Card>
              ))}
            </VStack>
          ) : (
            <Card>
              <Center p={8}>
                <VStack alignItems="center" space={2}>
                  <Ionicons name="folder-outline" size={48} color="#9CA3AF" />
                  <Text fontSize="md" color="gray.600">No projects yet</Text>
                  <Text fontSize="sm" color="gray.500" textAlign="center">
                    Start creating with AI to see your projects here
                  </Text>
                </VStack>
              </Center>
            </Card>
          )}
        </Box>

        {/* AI Models Status */}
        <Box>
          <Text fontSize="lg" fontWeight="bold" color="gray.800" mb={3}>
            AI Models Status
          </Text>
          <Card>
            <VStack p={4} space={3}>
              <HStack justifyContent="space-between">
                <Text fontSize="sm" color="gray.600">Video Generation</Text>
                <Badge colorScheme="green">Active</Badge>
              </HStack>
              <Divider />
              <HStack justifyContent="space-between">
                <Text fontSize="sm" color="gray.600">Music Generation</Text>
                <Badge colorScheme="green">Active</Badge>
              </HStack>
              <Divider />
              <HStack justifyContent="space-between">
                <Text fontSize="sm" color="gray.600">Code Generation</Text>
                <Badge colorScheme="green">Active</Badge>
              </HStack>
              <Divider />
              <HStack justifyContent="space-between">
                <Text fontSize="sm" color="gray.600">Image Generation</Text>
                <Badge colorScheme="green">Active</Badge>
              </HStack>
            </VStack>
          </Card>
        </Box>

        {/* Setup Warning */}
        {!state.settings.huggingFaceApiKey && (
          <Card bg="orange.50" borderColor="orange.200" borderWidth={1}>
            <HStack p={4} alignItems="center" space={3}>
              <Ionicons name="warning" size={24} color="#F59E0B" />
              <VStack flex={1}>
                <Text fontSize="sm" fontWeight="semibold" color="orange.800">
                  Setup Required
                </Text>
                <Text fontSize="xs" color="orange.700">
                  Add your Hugging Face API key to use AI models
                </Text>
              </VStack>
              <Button
                size="sm"
                variant="outline"
                colorScheme="orange"
                onPress={() => navigation.navigate('Settings' as never)}
              >
                Setup
              </Button>
            </HStack>
          </Card>
        )}
      </VStack>
    </ScrollView>
  );
}