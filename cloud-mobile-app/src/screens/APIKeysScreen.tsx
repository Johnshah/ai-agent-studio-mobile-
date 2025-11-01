/**
 * API Keys Management Screen
 * Allow users to configure their own API keys for various AI services
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CloudAPIService } from '../services/CloudAPIService';

interface APIService {
  id: string;
  name: string;
  description: string;
  configured: boolean;
}

export default function APIKeysScreen({ navigation }: any) {
  const [services, setServices] = useState<APIService[]>([]);
  const [configuredServices, setConfiguredServices] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<APIService | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      // Load configured services
      const configuredResponse = await CloudAPIService.getUserAPIKeys();
      if (configuredResponse.success && configuredResponse.data) {
        setConfiguredServices(configuredResponse.data.configured_services);
      }

      // Load supported services
      const servicesResponse = await CloudAPIService.getSupportedServices();
      if (servicesResponse.success && servicesResponse.data) {
        const servicesList = servicesResponse.data.services.map((s: any) => ({
          ...s,
          configured: configuredServices.includes(s.id),
        }));
        setServices(servicesList);
      }
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const handleAddKey = (service: APIService) => {
    setSelectedService(service);
    setApiKey('');
    setModalVisible(true);
  };

  const handleSaveKey = async () => {
    if (!selectedService || !apiKey.trim()) {
      Alert.alert('Error', 'Please enter a valid API key');
      return;
    }

    setIsLoading(true);

    try {
      const response = await CloudAPIService.setAPIKey(selectedService.id, apiKey);

      if (response.success) {
        Alert.alert('Success', `API key configured for ${selectedService.name}`);
        setModalVisible(false);
        setApiKey('');
        await loadServices();
      } else {
        Alert.alert('Error', response.error || 'Failed to save API key');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteKey = async (serviceId: string) => {
    Alert.alert(
      'Delete API Key',
      'Are you sure you want to delete this API key?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await CloudAPIService.deleteAPIKey(serviceId);
              if (response.success) {
                Alert.alert('Success', 'API key deleted');
                await loadServices();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete API key');
            }
          },
        },
      ]
    );
  };

  const renderServiceCard = (service: APIService) => (
    <View key={service.id} style={styles.serviceCard}>
      <View style={styles.serviceHeader}>
        <View style={styles.serviceInfo}>
          <View style={styles.serviceTitleRow}>
            <Text style={styles.serviceName}>{service.name}</Text>
            {service.configured && (
              <View style={styles.configuredBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.configuredText}>Configured</Text>
              </View>
            )}
          </View>
          <Text style={styles.serviceDescription}>{service.description}</Text>
        </View>
      </View>

      <View style={styles.serviceActions}>
        {service.configured ? (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.updateButton]}
              onPress={() => handleAddKey(service)}
            >
              <Ionicons name="create" size={20} color="#007AFF" />
              <Text style={styles.updateButtonText}>Update</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteKey(service.id)}
            >
              <Ionicons name="trash" size={20} color="#F44336" />
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, styles.addButton]}
            onPress={() => handleAddKey(service)}
          >
            <Ionicons name="add-circle" size={20} color="white" />
            <Text style={styles.addButtonText}>Add API Key</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#007AFF', '#0051D5']} style={styles.header}>
        <Text style={styles.headerTitle}>API Keys</Text>
        <Text style={styles.headerSubtitle}>
          Configure your own API keys for AI services
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#007AFF" />
          <Text style={styles.infoText}>
            Add your own API keys to unlock more AI models and features. Your keys are stored
            securely and encrypted.
          </Text>
        </View>

        {/* Services List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Services</Text>
          {services.map(renderServiceCard)}
        </View>

        {/* Help Section */}
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>🔑 How to get API keys:</Text>
          <Text style={styles.helpText}>
            • Hugging Face: Sign up at huggingface.co and create a token in Settings
          </Text>
          <Text style={styles.helpText}>
            • OpenAI: Visit platform.openai.com and generate an API key
          </Text>
          <Text style={styles.helpText}>
            • Other services: Check their official documentation
          </Text>
        </View>
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedService?.configured ? 'Update' : 'Add'} API Key
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedService && (
              <>
                <Text style={styles.modalServiceName}>{selectedService.name}</Text>
                <Text style={styles.modalDescription}>{selectedService.description}</Text>

                <Text style={styles.inputLabel}>API Key</Text>
                <TextInput
                  style={styles.apiKeyInput}
                  placeholder="Enter your API key..."
                  placeholderTextColor="#999"
                  value={apiKey}
                  onChangeText={setApiKey}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={handleSaveKey}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Text style={styles.saveButtonText}>Saving...</Text>
                    ) : (
                      <Text style={styles.saveButtonText}>Save</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  content: {
    flex: 1,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  serviceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  serviceHeader: {
    marginBottom: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  configuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  configuredText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: '600',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  serviceActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  addButton: {
    backgroundColor: '#007AFF',
    flex: 1,
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 5,
  },
  updateButton: {
    backgroundColor: '#E3F2FD',
  },
  updateButtonText: {
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 5,
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  deleteButtonText: {
    color: '#F44336',
    fontWeight: '600',
    marginLeft: 5,
  },
  helpSection: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  modalServiceName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 5,
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  apiKeyInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    fontFamily: 'monospace',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});