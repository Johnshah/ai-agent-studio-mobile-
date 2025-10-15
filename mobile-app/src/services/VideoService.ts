import axios from 'axios';
import { API_BASE_URL } from '../utils/config';

export interface VideoGenerationRequest {
  prompt: string;
  model_name: string;
  duration: number;
  fps: number;
  resolution: string;
  style: string;
  seed?: number;
  additional_params?: any;
}

export interface VideoGenerationResponse {
  success: boolean;
  video_path?: string;
  video_url?: string;
  duration?: number;
  resolution?: string;
  file_size?: number;
  model_used?: string;
  prompt?: string;
  created_at?: string;
  error?: string;
  message?: string;
}

export interface VideoModel {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  max_duration: number;
  supported_resolutions: string[];
  github_url: string;
}

export class VideoService {
  private static baseURL = `${API_BASE_URL}/api/v1/video`;

  static async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/generate`, request);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Video generation failed');
    }
  }

  static async generateVideoFromImage(
    prompt: string,
    imageUri: string,
    modelName: string = 'stable_video',
    duration: number = 10
  ): Promise<VideoGenerationResponse> {
    try {
      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('model_name', modelName);
      formData.append('duration', duration.toString());
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'input_image.jpg',
      } as any);

      const response = await axios.post(
        `${this.baseURL}/generate-from-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Image-to-video generation failed');
    }
  }

  static async getAvailableModels(): Promise<{ models: VideoModel[] }> {
    try {
      const response = await axios.get(`${this.baseURL}/models`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch models');
    }
  }

  static async getSupportedStyles(): Promise<{ styles: string[] }> {
    try {
      const response = await axios.get(`${this.baseURL}/styles`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch styles');
    }
  }

  static async getSupportedResolutions(): Promise<{ resolutions: string[] }> {
    try {
      const response = await axios.get(`${this.baseURL}/resolutions`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch resolutions');
    }
  }

  static async enhancePrompt(
    prompt: string,
    style: string = 'cinematic',
    mood: string = 'dramatic',
    lighting: string = 'natural'
  ): Promise<{
    original_prompt: string;
    enhanced_prompt: string;
    style: string;
    mood: string;
    lighting: string;
  }> {
    try {
      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('style', style);
      formData.append('mood', mood);
      formData.append('lighting', lighting);

      const response = await axios.post(`${this.baseURL}/enhance`, formData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to enhance prompt');
    }
  }

  static async getPresets(): Promise<{
    presets: Array<{
      name: string;
      description: string;
      settings: {
        resolution: string;
        fps: number;
        duration: number;
        model: string;
        style: string;
      };
    }>;
  }> {
    try {
      const response = await axios.get(`${this.baseURL}/presets`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch presets');
    }
  }

  static async batchGenerate(
    prompts: string[],
    modelName: string = 'wan22',
    duration: number = 30,
    resolution: string = '720p',
    style: string = 'cinematic'
  ): Promise<{
    success: boolean;
    total_videos: number;
    results: VideoGenerationResponse[];
  }> {
    try {
      const response = await axios.post(`${this.baseURL}/batch-generate`, {
        prompts,
        model_name: modelName,
        duration,
        resolution,
        style,
      });
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Batch generation failed');
    }
  }

  static async getGenerationQueue(): Promise<{
    queue_length: number;
    estimated_wait_time: string;
    active_generations: number;
  }> {
    try {
      const response = await axios.get(`${this.baseURL}/queue`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch queue status');
    }
  }

  static async cancelGeneration(taskId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await axios.delete(`${this.baseURL}/cancel/${taskId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to cancel generation');
    }
  }

  static async checkHealth(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/health`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Health check failed');
    }
  }
}