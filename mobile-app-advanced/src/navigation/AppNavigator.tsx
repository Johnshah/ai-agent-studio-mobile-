/**
 * 🧭 Advanced App Navigator - Professional Navigation System
 * Optimized for mobile AI workflows and user experience
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

// Screens
import AdvancedHomeScreen from '../screens/AdvancedHomeScreen';
// Import other screens (these would be implemented similarly to HomeScreen)

// Mock screen components for navigation structure
const VideoGenerationScreen = () => null;
const AudioGenerationScreen = () => null;
const ImageGenerationScreen = () => null;
const CodeGenerationScreen = () => null;
const OfflineAIScreen = () => null;
const SettingsScreen = () => null;
const ProfileScreen = () => null;
const HistoryScreen = () => null;
const SecurityScreen = () => null;
const PerformanceScreen = () => null;

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Tab Navigator for main features
function MainTabNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Create':
              iconName = 'add-circle';
              break;
            case 'History':
              iconName = 'history';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'help';
              break;
          }

          return <MaterialIcons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500'
        },
        headerShown: false
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={AdvancedHomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarBadge: undefined // Add badge for notifications
        }}
      />
      <Tab.Screen 
        name="Create" 
        component={CreateNavigator}
        options={{
          tabBarLabel: 'Create'
        }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen}
        options={{
          tabBarLabel: 'History'
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile'
        }}
      />
    </Tab.Navigator>
  );
}

// Create Stack Navigator for AI creation features
function CreateNavigator() {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18
        },
        headerShadowVisible: false
      }}
    >
      <Stack.Screen 
        name="CreateHome" 
        component={CreateHomeScreen}
        options={{
          title: '🚀 Create with AI',
          headerLargeTitle: true
        }}
      />
      <Stack.Screen 
        name="VideoGeneration" 
        component={VideoGenerationScreen}
        options={{
          title: '🎬 Video Generation',
          presentation: 'modal'
        }}
      />
      <Stack.Screen 
        name="AudioGeneration" 
        component={AudioGenerationScreen}
        options={{
          title: '🎵 Audio Generation',
          presentation: 'modal'
        }}
      />
      <Stack.Screen 
        name="ImageGeneration" 
        component={ImageGenerationScreen}
        options={{
          title: '🎨 Image Generation',
          presentation: 'modal'
        }}
      />
      <Stack.Screen 
        name="CodeGeneration" 
        component={CodeGenerationScreen}
        options={{
          title: '💻 Code Generation',
          presentation: 'modal'
        }}
      />
    </Stack.Navigator>
  );
}

// Create Home Screen for AI creation
function CreateHomeScreen({ navigation }: any) {
  const theme = useTheme();

  const creationOptions = [
    {
      title: '🎬 Video Generation',
      subtitle: 'Create stunning videos with AI',
      screen: 'VideoGeneration',
      color: theme.colors.primary
    },
    {
      title: '🎵 Audio Generation',
      subtitle: 'Generate music and voices',
      screen: 'AudioGeneration',
      color: theme.colors.secondary
    },
    {
      title: '🎨 Image Generation',
      subtitle: 'Create amazing visuals',
      screen: 'ImageGeneration',
      color: theme.colors.tertiary
    },
    {
      title: '💻 Code Generation',
      subtitle: 'Build apps with AI',
      screen: 'CodeGeneration',
      color: theme.colors.error
    }
  ];

  return (
    <Stack.Screen
      name="CreateOptions"
      options={{ title: 'Choose Creation Type' }}
    >
      {/* Create option selection UI here */}
    </Stack.Screen>
  );
}

// Drawer Navigator for advanced features
function DrawerNavigator() {
  const theme = useTheme();

  return (
    <Drawer.Navigator
      screenOptions={{
        drawerStyle: {
          backgroundColor: theme.colors.surface,
          width: 280
        },
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.onSurfaceVariant,
        drawerLabelStyle: {
          marginLeft: -20,
          fontSize: 16,
          fontWeight: '500'
        },
        headerShown: false
      }}
    >
      <Drawer.Screen 
        name="MainTabs" 
        component={MainTabNavigator}
        options={{
          drawerLabel: '🏠 Home',
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          )
        }}
      />
      <Drawer.Screen 
        name="OfflineAI" 
        component={OfflineAIScreen}
        options={{
          drawerLabel: '📱 Offline AI',
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="offline-bolt" size={size} color={color} />
          )
        }}
      />
      <Drawer.Screen 
        name="Security" 
        component={SecurityScreen}
        options={{
          drawerLabel: '🔐 Security',
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="security" size={size} color={color} />
          )
        }}
      />
      <Drawer.Screen 
        name="Performance" 
        component={PerformanceScreen}
        options={{
          drawerLabel: '⚡ Performance',
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="speed" size={size} color={color} />
          )
        }}
      />
      <Drawer.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          drawerLabel: '⚙️ Settings',
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="settings" size={size} color={color} />
          )
        }}
      />
    </Drawer.Navigator>
  );
}

// Root Stack Navigator
export default function AppNavigator({ initialState }: { initialState?: any }) {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: 'slide_from_right'
      }}
    >
      {/* Main app flow */}
      <Stack.Screen 
        name="MainApp" 
        component={DrawerNavigator}
        options={{
          gestureEnabled: false
        }}
      />
      
      {/* Modal screens */}
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen 
          name="CreateNew" 
          component={CreateNavigator}
          options={{
            title: 'Create New',
            headerShown: true,
            headerStyle: {
              backgroundColor: theme.colors.surface
            }
          }}
        />
      </Stack.Group>
      
      {/* Full screen modals */}
      <Stack.Group screenOptions={{ presentation: 'fullScreenModal' }}>
        <Stack.Screen 
          name="Tutorial" 
          component={TutorialScreen}
          options={{
            title: 'Welcome Tutorial'
          }}
        />
        <Stack.Screen 
          name="Optimization" 
          component={OptimizationScreen}
          options={{
            title: 'Device Optimization'
          }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
}

// Mock tutorial and optimization screens
const TutorialScreen = () => null;
const OptimizationScreen = () => null;