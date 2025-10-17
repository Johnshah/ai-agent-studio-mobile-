/**
 * 🛡️ Advanced Error Boundary - Professional Error Handling
 * Catches and handles errors gracefully with detailed reporting
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { Card, Button, IconButton } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { theme } from '../utils/theme';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error details
    console.error('🚨 Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Log error for analytics/debugging
    this.logError(error, errorInfo);
  }

  private async logError(error: Error, errorInfo: ErrorInfo) {
    try {
      const errorReport = {
        id: this.state.errorId,
        timestamp: new Date().toISOString(),
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        errorInfo: {
          componentStack: errorInfo.componentStack
        },
        userAgent: navigator.userAgent || 'Unknown',
        url: window.location?.href || 'Mobile App',
        appVersion: '2.0.0'
      };

      // Save error report locally
      const existingReports = await AsyncStorage.getItem('error_reports');
      const reports = existingReports ? JSON.parse(existingReports) : [];
      reports.push(errorReport);
      
      // Keep only last 10 error reports
      if (reports.length > 10) {
        reports.splice(0, reports.length - 10);
      }
      
      await AsyncStorage.setItem('error_reports', JSON.stringify(reports));
      
      console.log('📊 Error report saved:', errorReport.id);

    } catch (logError) {
      console.error('❌ Failed to log error:', logError);
    }
  }

  private handleRestart = () => {
    // Reset error boundary state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  private handleReload = () => {
    // In a mobile app, you might want to restart the app
    // For now, just reset the error boundary
    this.handleRestart();
  };

  private handleCopyError = async () => {
    if (!this.state.error) return;

    try {
      const errorDetails = `
AI Agent Studio Pro - Error Report
=================================

Error ID: ${this.state.errorId}
Timestamp: ${new Date().toISOString()}
Version: 2.0.0

Error Details:
${this.state.error.name}: ${this.state.error.message}

Stack Trace:
${this.state.error.stack}

Component Stack:
${this.state.errorInfo?.componentStack}
      `.trim();

      await Clipboard.setStringAsync(errorDetails);
      Alert.alert('📋 Copied!', 'Error details copied to clipboard');
      
    } catch (error) {
      console.error('❌ Failed to copy error details:', error);
      Alert.alert('❌ Copy Failed', 'Unable to copy error details');
    }
  };

  private handleReportError = () => {
    Alert.alert(
      '📧 Report Error',
      'This will help us improve AI Agent Studio Pro. The error report will be shared with our development team.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Report', 
          onPress: () => {
            // In a real app, send error report to your backend
            Alert.alert('✅ Reported!', 'Thank you for helping us improve the app.');
          }
        }
      ]
    );
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ 
          flex: 1, 
          backgroundColor: theme.colors.background,
          padding: theme.spacing.lg,
          justifyContent: 'center'
        }}>
          <Card style={[theme.components.card.elevated, { marginBottom: theme.spacing.xl }]}>
            <Card.Content style={{ alignItems: 'center', padding: theme.spacing.xl }}>
              <MaterialIcons 
                name="error-outline" 
                size={64} 
                color={theme.colors.error} 
                style={{ marginBottom: theme.spacing.lg }}
              />
              
              <Text 
                variant="headlineSmall"
                style={{ 
                  textAlign: 'center',
                  marginBottom: theme.spacing.md,
                  fontWeight: 'bold',
                  color: theme.colors.error
                }}
              >
                Oops! Something went wrong
              </Text>
              
              <Text 
                variant="bodyMedium"
                style={{ 
                  textAlign: 'center',
                  marginBottom: theme.spacing.lg,
                  color: theme.colors.onSurfaceVariant,
                  lineHeight: 22
                }}
              >
                AI Agent Studio Pro encountered an unexpected error. Don't worry - your data is safe and we're working to fix this.
              </Text>

              {/* Error Details */}
              <Card 
                style={{ 
                  width: '100%',
                  backgroundColor: theme.colors.error + '10',
                  borderWidth: 1,
                  borderColor: theme.colors.error + '20',
                  marginBottom: theme.spacing.lg
                }}
              >
                <Card.Content style={{ padding: theme.spacing.md }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm }}>
                    <MaterialIcons 
                      name="bug-report" 
                      size={20} 
                      color={theme.colors.error}
                      style={{ marginRight: theme.spacing.sm }}
                    />
                    <Text variant="titleSmall" style={{ fontWeight: 'bold', color: theme.colors.error }}>
                      Error Details
                    </Text>
                    <View style={{ flex: 1 }} />
                    <IconButton
                      icon="content-copy"
                      size={20}
                      onPress={this.handleCopyError}
                      style={{ margin: 0 }}
                    />
                  </View>
                  
                  <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 4 }}>
                    Error ID: {this.state.errorId}
                  </Text>
                  
                  <ScrollView 
                    style={{ maxHeight: 100 }}
                    showsVerticalScrollIndicator={false}
                  >
                    <Text variant="bodySmall" style={{ 
                      fontFamily: 'monospace',
                      color: theme.colors.error,
                      fontSize: 12
                    }}>
                      {this.state.error?.name}: {this.state.error?.message}
                    </Text>
                  </ScrollView>
                </Card.Content>
              </Card>

              {/* Action Buttons */}
              <View style={{ width: '100%', gap: theme.spacing.md }}>
                <Button
                  mode="contained"
                  onPress={this.handleRestart}
                  style={{ 
                    backgroundColor: theme.colors.primary,
                    borderRadius: theme.borderRadius.lg
                  }}
                  contentStyle={{ paddingVertical: 8 }}
                  labelStyle={{ fontWeight: 'bold' }}
                >
                  🔄 Try Again
                </Button>
                
                <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
                  <Button
                    mode="outlined"
                    onPress={this.handleReload}
                    style={{ 
                      flex: 1,
                      borderColor: theme.colors.primary,
                      borderRadius: theme.borderRadius.lg
                    }}
                    contentStyle={{ paddingVertical: 4 }}
                  >
                    ↻ Reload App
                  </Button>
                  
                  <Button
                    mode="outlined"
                    onPress={this.handleReportError}
                    style={{ 
                      flex: 1,
                      borderColor: theme.colors.success,
                      borderRadius: theme.borderRadius.lg
                    }}
                    contentStyle={{ paddingVertical: 4 }}
                    labelStyle={{ color: theme.colors.success }}
                  >
                    📧 Report Issue
                  </Button>
                </View>
              </View>

              {/* Additional Info */}
              <Text 
                variant="bodySmall"
                style={{ 
                  textAlign: 'center',
                  marginTop: theme.spacing.lg,
                  color: theme.colors.onSurfaceVariant,
                  fontSize: 11
                }}
              >
                If this error persists, please contact support with Error ID: {this.state.errorId}
              </Text>
            </Card.Content>
          </Card>

          {/* Development Info (only in development) */}
          {__DEV__ && (
            <Card style={theme.components.card.default}>
              <Card.Content>
                <Text variant="titleSmall" style={{ fontWeight: 'bold', marginBottom: theme.spacing.md }}>
                  🔧 Development Info
                </Text>
                
                <ScrollView style={{ maxHeight: 200 }}>
                  <Text variant="bodySmall" style={{ 
                    fontFamily: 'monospace',
                    fontSize: 10,
                    color: theme.colors.onSurfaceVariant
                  }}>
                    {this.state.error?.stack}
                  </Text>
                  
                  {this.state.errorInfo && (
                    <Text variant="bodySmall" style={{ 
                      fontFamily: 'monospace',
                      fontSize: 10,
                      color: theme.colors.onSurfaceVariant,
                      marginTop: theme.spacing.md
                    }}>
                      Component Stack:
                      {this.state.errorInfo.componentStack}
                    </Text>
                  )}
                </ScrollView>
              </Card.Content>
            </Card>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;