/**
 * Cloud API Service - Connects mobile app to AI Agent Studio Cloud Backend
 * Handles all HTTP requests to the cloud server with Hugging Face integration
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration
const API_BASE_URL = 'https://your-cloud-backend.herokuapp.com/api/v1'; // Replace with your actual backend URL
// For development: 'http://localhost:7860/api/v1'
// For Hugging Face Spaces: 'https://huggingface.co/spaces/your-username/ai-agent-studio/api/v1'

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface GenerationRequest {
  prompt: string;
  model?: string;
  [key: string]: any;
}

export interface GenerationResponse {
  success: boolean;
  task_id: string;
  status: string;
  estimated_time: number;
  progress_url: string;
  websocket_url: string;
  config: any;
}

export interface TaskStatus {
  task_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  type: string;
  prompt: string;
  result?: any;
  error?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  estimated_duration?: number;
}

export interface UserProfile {
  user_id: string;
  username: string;
  email: string;
  role: string;
  quota_limits: Record<string, number>;
  quota_used: Record<string, number>;
  created_at: string;
  last_login?: string;
}

class CloudAPIServiceClass {
  private baseURL: string;
  private authToken: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.loadAuthToken();
  }

  private async loadAuthToken() {
    try {
      this.authToken = await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Failed to load auth token:', error);
    }
  }

  private getHeaders(includeAuth = true): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'AI-Agent-Studio-Mobile/1.0.0 (Android; Poco X6 Pro)',
    };

    if (includeAuth && this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Authentication
  async login(email: string, password: string): Promise<APIResponse<{user: UserProfile, token: string}>> {
    const response = await this.makeRequest<{user: UserProfile, token: string}>('/auth/login', {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data) {
      this.authToken = response.data.token;
      await AsyncStorage.setItem('auth_token', response.data.token);
    }

    return response;
  }

  async register(username: string, email: string, password: string): Promise<APIResponse<{user: UserProfile, token: string}>> {
    const response = await this.makeRequest<{user: UserProfile, token: string}>('/auth/register', {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify({ username, email, password }),
    });

    if (response.success && response.data) {
      this.authToken = response.data.token;
      await AsyncStorage.setItem('auth_token', response.data.token);
    }

    return response;
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/user/profile`, {
        headers: {
          ...this.getHeaders(false),
          'Authorization': `Bearer ${token}`,
        },
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  // User Profile
  async getUserProfile(): Promise<APIResponse<UserProfile>> {
    return this.makeRequest<UserProfile>('/user/profile');
  }

  // Generation APIs
  async generateVideo(request: GenerationRequest): Promise<APIResponse<GenerationResponse>> {
    const body = {
      prompt: request.prompt,
      model: request.model || 'wan22',
      duration: request.duration || 5,
      resolution: request.resolution || '1080p',
      style: request.style,
    };

    return this.makeRequest<GenerationResponse>('/generate/video', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async generateAudio(request: GenerationRequest): Promise<APIResponse<GenerationResponse>> {
    const body = {
      prompt: request.prompt,
      model: request.model || 'musicgen',
      duration: request.duration || 30,
      audio_type: request.audio_type || 'music',
    };

    return this.makeRequest<GenerationResponse>('/generate/audio', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async generateImage(request: GenerationRequest): Promise<APIResponse<GenerationResponse>> {
    const body = {
      prompt: request.prompt,
      model: request.model || 'stable-diffusion-xl',
      width: request.width || 1024,
      height: request.height || 1024,
      num_images: request.num_images || 1,
      style: request.style,
    };

    return this.makeRequest<GenerationResponse>('/generate/image', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async generateCode(request: GenerationRequest): Promise<APIResponse<GenerationResponse>> {
    const body = {
      prompt: request.prompt,
      model: request.model || 'code-llama',
      language: request.language || 'python',
      framework: request.framework || 'react-native',
    };

    return this.makeRequest<GenerationResponse>('/generate/code', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // Task Management
  async getTaskStatus(taskId: string): Promise<APIResponse<TaskStatus>> {
    return this.makeRequest<TaskStatus>(`/status/${taskId}`);
  }

  async getUserTasks(limit = 50): Promise<APIResponse<{tasks: TaskStatus[], total: number}>> {
    // Extract user_id from token (simplified - in production, decode JWT properly)
    const userIdPlaceholder = 'current-user'; // Backend will get user from token
    return this.makeRequest<{tasks: TaskStatus[], total: number}>(`/user/${userIdPlaceholder}/tasks?limit=${limit}`);
  }

  async deleteTask(taskId: string): Promise<APIResponse<{message: string}>> {
    return this.makeRequest<{message: string}>(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  // File Upload
  async uploadFile(fileUri: string, fileName: string): Promise<APIResponse<{file_id: string, public_url: string}>> {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        name: fileName,
        type: 'image/jpeg', // Adjust based on file type
      } as any);

      const response = await fetch(`${this.baseURL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || 'Upload failed',
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload error',
      };
    }
  }

  // Models
  async getAvailableModels(): Promise<APIResponse<Record<string, any>>> {
    return this.makeRequest<Record<string, any>>('/models');
  }

  // Health Check
  async healthCheck(): Promise<APIResponse<any>> {
    return this.makeRequest('/health');
  }

  // Logout
  async logout(): Promise<void> {
    this.authToken = null;
    await AsyncStorage.removeItem('auth_token');
  }

  // ADVANCED AI FEATURES

  // Image to Video Generation
  async generateImageToVideo(imageUri: string, options: any = {}): Promise<APIResponse<GenerationResponse>> {
    try {
      const formData = new FormData();
      formData.append('image_file', {
        uri: imageUri,
        name: 'image.jpg',
        type: 'image/jpeg',
      } as any);
      formData.append('model', options.model || 'stable-video-diffusion');
      formData.append('duration', options.duration || 3);
      formData.append('fps', options.fps || 24);

      const response = await fetch(`${this.baseURL}/advanced/generate/image-to-video`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();
      return { success: response.ok, data, error: !response.ok ? data.detail : undefined };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Request failed' };
    }
  }

  // Talking Avatar Generation
  async generateTalkingAvatar(imageUri: string, audioUri: string, model: string = 'sadtalker'): Promise<APIResponse<GenerationResponse>> {
    try {
      const formData = new FormData();
      formData.append('image_file', {
        uri: imageUri,
        name: 'image.jpg',
        type: 'image/jpeg',
      } as any);
      formData.append('audio_file', {
        uri: audioUri,
        name: 'audio.mp3',
        type: 'audio/mpeg',
      } as any);
      formData.append('model', model);

      const response = await fetch(`${this.baseURL}/advanced/generate/talking-avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();
      return { success: response.ok, data, error: !response.ok ? data.detail : undefined };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Request failed' };
    }
  }

  // Voice Cloning
  async cloneVoice(audioUri: string, text: string, model: string = 'coqui-tts'): Promise<APIResponse<GenerationResponse>> {
    try {
      const formData = new FormData();
      formData.append('reference_audio', {
        uri: audioUri,
        name: 'voice.mp3',
        type: 'audio/mpeg',
      } as any);
      formData.append('text', text);
      formData.append('model', model);

      const response = await fetch(`${this.baseURL}/advanced/generate/voice-clone`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();
      return { success: response.ok, data, error: !response.ok ? data.detail : undefined };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Request failed' };
    }
  }

  // 3D Model Generation
  async generate3DModel(prompt: string, model: string = 'shap-e'): Promise<APIResponse<GenerationResponse>> {
    return this.makeRequest<GenerationResponse>('/advanced/generate/3d-model', {
      method: 'POST',
      body: JSON.stringify({ prompt, model }),
    });
  }

  // Image Upscaling
  async upscaleImage(imageUri: string, scale: number = 4, model: string = 'real-esrgan'): Promise<APIResponse<GenerationResponse>> {
    try {
      const formData = new FormData();
      formData.append('image_file', {
        uri: imageUri,
        name: 'image.jpg',
        type: 'image/jpeg',
      } as any);
      formData.append('scale', scale.toString());
      formData.append('model', model);

      const response = await fetch(`${this.baseURL}/advanced/enhance/upscale`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();
      return { success: response.ok, data, error: !response.ok ? data.detail : undefined };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Request failed' };
    }
  }

  // Background Removal
  async removeBackground(imageUri: string): Promise<APIResponse<GenerationResponse>> {
    try {
      const formData = new FormData();
      formData.append('image_file', {
        uri: imageUri,
        name: 'image.jpg',
        type: 'image/jpeg',
      } as any);

      const response = await fetch(`${this.baseURL}/advanced/enhance/remove-background`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();
      return { success: response.ok, data, error: !response.ok ? data.detail : undefined };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Request failed' };
    }
  }

  // Get Advanced Models List
  async getAdvancedModels(feature?: string): Promise<APIResponse<any>> {
    const url = feature ? `/advanced/models/list?feature=${feature}` : '/advanced/models/list';
    return this.makeRequest<any>(url);
  }

  // Get Model Info
  async getModelInfo(modelId: string): Promise<APIResponse<any>> {
    return this.makeRequest<any>(`/advanced/models/${modelId}`);
  }

  // API KEY MANAGEMENT

  // Set API Key
  async setAPIKey(service: string, apiKey: string): Promise<APIResponse<{message: string}>> {
    return this.makeRequest<{message: string}>('/advanced/api-keys/set', {
      method: 'POST',
      body: JSON.stringify({ service, api_key: apiKey }),
    });
  }

  // Get User API Keys
  async getUserAPIKeys(): Promise<APIResponse<{configured_services: string[], supported_services: any[]}>> {
    return this.makeRequest<any>('/advanced/api-keys/list');
  }

  // Delete API Key
  async deleteAPIKey(service: string): Promise<APIResponse<{message: string}>> {
    return this.makeRequest<{message: string}>(`/advanced/api-keys/${service}`, {
      method: 'DELETE',
    });
  }

  // Get Supported Services
  async getSupportedServices(): Promise<APIResponse<{services: any[]}>> {
    return this.makeRequest<any>('/advanced/api-keys/services');
  }
}

export const CloudAPIService = new CloudAPIServiceClass();