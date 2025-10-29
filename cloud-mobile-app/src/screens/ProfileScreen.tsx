/**
 * Profile Screen - User profile and quota management
 * Optimized for Poco X6 Pro
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Progress from 'react-native-progress';
import { RootStackParamList } from '../../App';
import { CloudAPIService, UserProfile } from '../services/CloudAPIService';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'> & {
  onLogout: () => void;
};

const ProfileScreen: React.FC<Props> = ({ navigation, onLogout }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    const response = await CloudAPIService.getUserProfile();
    
    if (response.success && response.data) {
      setProfile(response.data);
    } else {
      Alert.alert('Error', 'Failed to load profile');
    }
    
    setIsLoading(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await CloudAPIService.logout();
            onLogout();
          },
        },
      ]
    );
  };

  const renderQuotaBar = (label: string, used: number, limit: number, color: string) => {
    const percentage = limit === -1 ? 0 : (used / limit);
    const displayLimit = limit === -1 ? '∞' : limit;
    
    return (
      <View style={styles.quotaItem}>
        <View style={styles.quotaHeader}>
          <Text style={styles.quotaLabel}>{label}</Text>
          <Text style={styles.quotaValue}>
            {used} / {displayLimit}
          </Text>
        </View>
        <Progress.Bar
          progress={limit === -1 ? 0 : percentage}
          width={null}
          height={8}
          color={color}
          unfilledColor="#E0E0E0"
          borderWidth={0}
          borderRadius={4}
        />
      </View>
    );
  };

  if (isLoading || !profile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#007AFF', '#0051D5']}
        style={styles.header}
      >
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={80} color="white" />
        </View>
        <Text style={styles.username}>{profile.username}</Text>
        <Text style={styles.email}>{profile.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{profile.role.toUpperCase()}</Text>
        </View>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="calendar" size={32} color="#007AFF" />
          <Text style={styles.statValue}>
            {new Date(profile.created_at).toLocaleDateString()}
          </Text>
          <Text style={styles.statLabel}>Member Since</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="time" size={32} color="#4CAF50" />
          <Text style={styles.statValue}>
            {profile.last_login 
              ? new Date(profile.last_login).toLocaleDateString()
              : 'N/A'
            }
          </Text>
          <Text style={styles.statLabel}>Last Login</Text>
        </View>
      </View>

      {/* Quota Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Usage Quotas</Text>
        
        <View style={styles.quotaContainer}>
          {renderQuotaBar(
            'Daily Tasks',
            profile.quota_used.daily_tasks || 0,
            profile.quota_limits.daily_tasks,
            '#007AFF'
          )}
          
          {renderQuotaBar(
            'Video Generation',
            profile.quota_used.video_generation || 0,
            profile.quota_limits.video_generation,
            '#FF6B6B'
          )}
          
          {renderQuotaBar(
            'Audio Generation',
            profile.quota_used.audio_generation || 0,
            profile.quota_limits.audio_generation,
            '#4ECDC4'
          )}
          
          {renderQuotaBar(
            'Image Generation',
            profile.quota_used.image_generation || 0,
            profile.quota_limits.image_generation,
            '#A8E6CF'
          )}
          
          {renderQuotaBar(
            'Code Generation',
            profile.quota_used.code_generation || 0,
            profile.quota_limits.code_generation,
            '#FFD93D'
          )}
        </View>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <TouchableOpacity style={styles.settingItem}>
          <Ionicons name="notifications" size={24} color="#666" />
          <Text style={styles.settingText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <Ionicons name="cloud" size={24} color="#666" />
          <Text style={styles.settingText}>Cloud Storage</Text>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <Ionicons name="settings" size={24} color="#666" />
          <Text style={styles.settingText}>Preferences</Text>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <Ionicons name="help-circle" size={24} color="#666" />
          <Text style={styles.settingText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out" size={24} color="#F44336" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>AI Agent Studio Cloud v1.0.0</Text>
        <Text style={styles.footerText}>Optimized for Poco X6 Pro</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  username: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 15,
  },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  roleText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    flex: 1,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginHorizontal: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  quotaContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quotaItem: {
    marginBottom: 20,
  },
  quotaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  quotaLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  quotaValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#F44336',
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 16,
    color: '#F44336',
    fontWeight: '600',
    marginLeft: 10,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
});

export default ProfileScreen;