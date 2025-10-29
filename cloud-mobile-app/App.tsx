/**
 * AI Agent Studio Cloud Mobile App
 * Lightweight cloud-connected AI generation app optimized for Poco X6 Pro
 * Features: Real-time progress, WebSocket updates, instant cloud results
 */

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import GenerationScreen from './src/screens/GenerationScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Services
import { CloudAPIService } from './src/services/CloudAPIService';
import { WebSocketService } from './src/services/WebSocketService';

// Types
export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Generation: {
    type: 'video' | 'audio' | 'image' | 'code';
  };
  Progress: {
    taskId: string;
    type: string;
  };
  Results: {
    taskId: string;
  };
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check if user has valid token
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        // Validate token with backend
        const isValid = await CloudAPIService.validateToken(token);
        if (isValid) {
          setUserToken(token);
          setIsAuthenticated(true);
          
          // Initialize WebSocket connection
          WebSocketService.connect(token);
        } else {
          // Invalid token, remove it
          await AsyncStorage.removeItem('auth_token');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
      await SplashScreen.hideAsync();
    }
  };

  const handleLogin = async (token: string) => {
    try {
      await AsyncStorage.setItem('auth_token', token);
      setUserToken(token);
      setIsAuthenticated(true);
      
      // Initialize WebSocket connection
      WebSocketService.connect(token);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('auth_token');
      setUserToken(null);
      setIsAuthenticated(false);
      
      // Disconnect WebSocket
      WebSocketService.disconnect();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return null; // Splash screen is still showing
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName={isAuthenticated ? "Home" : "Login"}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#000000',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {!isAuthenticated ? (
          // Auth stack
          <Stack.Screen
            name="Login"
            options={{ headerShown: false }}
          >
            {(props) => (
              <LoginScreen {...props} onLogin={handleLogin} />
            )}
          </Stack.Screen>
        ) : (
          // Main app stack
          <>
            <Stack.Screen
              name="Home"
              options={{ 
                title: 'AI Agent Studio Cloud',
                headerRight: () => null
              }}
            >
              {(props) => (
                <HomeScreen {...props} onLogout={handleLogout} />
              )}
            </Stack.Screen>
            
            <Stack.Screen
              name="Generation"
              component={GenerationScreen}
              options={{ title: 'Create' }}
            />
            
            <Stack.Screen
              name="Progress"
              component={ProgressScreen}
              options={{ title: 'Generating...' }}
            />
            
            <Stack.Screen
              name="Results"
              component={ResultsScreen}
              options={{ title: 'Results' }}
            />
            
            <Stack.Screen
              name="Profile"
              options={{ title: 'Profile' }}
            >
              {(props) => (
                <ProfileScreen {...props} onLogout={handleLogout} />
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}