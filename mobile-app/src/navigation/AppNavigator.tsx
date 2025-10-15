import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Enhanced Screens
import EnhancedHomeScreen from '../screens/EnhancedHomeScreen';
import EnhancedVideoGenerationScreen from '../screens/EnhancedVideoGenerationScreen';
import AppGenerationScreen from '../screens/AppGenerationScreen';
import AudioGenerationScreen from '../screens/AudioGenerationScreen';

// Original Screens (fallback)
import HomeScreen from '../screens/HomeScreen';
import VideoGenerationScreen from '../screens/VideoGenerationScreen';
import ImageGenerationScreen from '../screens/ImageGenerationScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProjectsScreen from '../screens/ProjectsScreen';
import SocialMediaScreen from '../screens/SocialMediaScreen';
import CodeEditorScreen from '../screens/CodeEditorScreen';
import PreviewScreen from '../screens/PreviewScreen';

// New Screens
import ModelManagerScreen from '../screens/ModelManagerScreen';
import ImageGenerationEnhancedScreen from '../screens/ImageGenerationEnhancedScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Video') {
            iconName = focused ? 'videocam' : 'videocam-outline';
          } else if (route.name === 'Apps') {
            iconName = focused ? 'phone-portrait' : 'phone-portrait-outline';
          } else if (route.name === 'Audio') {
            iconName = focused ? 'musical-notes' : 'musical-notes-outline';
          } else if (route.name === 'Images') {
            iconName = focused ? 'image' : 'image-outline';
          } else {
            iconName = 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: '#6366f1',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={EnhancedHomeScreen} 
        options={{ title: 'AI Studio' }}
      />
      <Tab.Screen 
        name="Video" 
        component={EnhancedVideoGenerationScreen}
        options={{ title: 'Video AI' }}
      />
      <Tab.Screen 
        name="Apps" 
        component={AppGenerationScreen}
        options={{ title: 'App Builder' }}
      />
      <Tab.Screen 
        name="Audio" 
        component={AudioGenerationScreen}
        options={{ title: 'Audio AI' }}
      />
      <Tab.Screen 
        name="Images" 
        component={ImageGenerationScreen}
        options={{ title: 'Image AI' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#6366f1',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen 
        name="Projects" 
        component={ProjectsScreen}
        options={{ title: 'My Projects' }}
      />
      <Stack.Screen 
        name="SocialMedia" 
        component={SocialMediaScreen}
        options={{ title: 'Social Media' }}
      />
      <Stack.Screen 
        name="CodeEditor" 
        component={CodeEditorScreen}
        options={{ title: 'Code Editor' }}
      />
      <Stack.Screen 
        name="Preview" 
        component={PreviewScreen}
        options={{ title: 'Preview' }}
      />
      <Stack.Screen 
        name="EnhancedVideoGeneration" 
        component={EnhancedVideoGenerationScreen}
        options={{ title: 'Video Generation' }}
      />
      <Stack.Screen 
        name="AppGeneration" 
        component={AppGenerationScreen}
        options={{ title: 'App Generation' }}
      />
      <Stack.Screen 
        name="AudioGeneration" 
        component={AudioGenerationScreen}
        options={{ title: 'Audio Generation' }}
      />
      <Stack.Screen 
        name="ModelManager" 
        component={ModelManagerScreen}
        options={{ title: 'AI Models' }}
      />
      <Stack.Screen 
        name="ImageGeneration" 
        component={ImageGenerationEnhancedScreen}
        options={{ title: 'Image Generation' }}
      />
    </Stack.Navigator>
  );
}