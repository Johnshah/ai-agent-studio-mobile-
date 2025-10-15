import axios, { AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '../utils/config';

export interface AIModel {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'image' | 'text' | 'code';
  description: string;
  githubUrl: string;
  huggingfaceUrl?: string;
  apiKey?: string;
  capabilities: string[];
  requirements: {
    minRam: number;
    minStorage: number;
  };
  isEnabled: boolean;
}

export interface VideoGenerationParams {
  prompt: string;
  style: 'cinematic' | 'anime' | 'realistic' | 'cartoon' | 'artistic';
  duration: number; // in seconds
  resolution: '480p' | '720p' | '1080p' | '4k';
  fps: 24 | 30 | 60;
  language: string;
  model: string;
}

export interface AppGenerationParams {
  description: string;
  appType: 'android' | 'ios' | 'web' | 'desktop';
  framework: 'react-native' | 'flutter' | 'next.js' | 'electron';
  features: string[];
  designStyle: 'modern' | 'minimal' | 'colorful' | 'professional';
  model: string;
  uploadedFiles?: File[];
}

export interface AudioGenerationParams {
  type: 'music' | 'voice' | 'effects';
  prompt: string;
  genre?: string;
  voice?: string;
  duration: number;
  model: string;
}

export interface ImageGenerationParams {
  prompt: string;
  style: string;
  size: '512x512' | '1024x1024' | '1920x1080';
  model: string;
}

class AIModelService {
  private baseURL: string;
  private models: AIModel[] = [];

  constructor() {
    this.baseURL = config.API_BASE_URL;
    this.initializeModels();
  }

  private initializeModels() {
    this.models = [
      // Video Generation Models
      {
        id: 'wan2.2',
        name: 'Wan2.2',
        type: 'video',
        description: 'High-quality video generation model for cinematic content',
        githubUrl: 'https://github.com/modelscope/modelscope',
        huggingfaceUrl: 'https://huggingface.co/spaces/modelscope/text-to-video-synthesis',
        capabilities: ['text-to-video', 'high-quality', 'cinematic'],
        requirements: { minRam: 8, minStorage: 2 },
        isEnabled: true
      },
      {
        id: 'modelscope-text2video',
        name: 'ModelScope Text2Video',
        type: 'video',
        description: 'Advanced text to video synthesis',
        githubUrl: 'https://github.com/modelscope/modelscope',
        huggingfaceUrl: 'https://huggingface.co/spaces/modelscope/text-to-video-synthesis',
        capabilities: ['text-to-video', 'multiple-styles'],
        requirements: { minRam: 6, minStorage: 1.5 },
        isEnabled: true
      },
      {
        id: 'deforum-stable-diffusion',
        name: 'Deforum Stable Diffusion',
        type: 'video',
        description: 'Animation and video generation with stable diffusion',
        githubUrl: 'https://github.com/deforum-art/deforum-stable-diffusion',
        capabilities: ['animation', 'keyframe-interpolation', 'artistic'],
        requirements: { minRam: 8, minStorage: 3 },
        isEnabled: true
      },

      // Audio/Music Generation Models
      {
        id: 'musicgen',
        name: 'MusicGen',
        type: 'audio',
        description: 'High-quality music generation from text descriptions',
        githubUrl: 'https://github.com/facebookresearch/audiocraft',
        huggingfaceUrl: 'https://huggingface.co/spaces/facebook/MusicGen',
        capabilities: ['music-generation', 'text-to-music', 'multiple-genres'],
        requirements: { minRam: 6, minStorage: 2 },
        isEnabled: true
      },
      {
        id: 'jukebox',
        name: 'Jukebox',
        type: 'audio',
        description: 'Neural net that generates music with singing',
        githubUrl: 'https://github.com/openai/jukebox',
        capabilities: ['music-generation', 'singing', 'multiple-genres'],
        requirements: { minRam: 8, minStorage: 4 },
        isEnabled: true
      },
      {
        id: 'bark',
        name: 'Bark',
        type: 'audio',
        description: 'Text-to-speech model with realistic voices',
        githubUrl: 'https://github.com/suno-ai/bark',
        huggingfaceUrl: 'https://huggingface.co/spaces/suno/bark',
        capabilities: ['text-to-speech', 'multiple-voices', 'realistic'],
        requirements: { minRam: 4, minStorage: 1 },
        isEnabled: true
      },
      {
        id: 'coqui-tts',
        name: 'Coqui TTS',
        type: 'audio',
        description: 'Advanced text-to-speech synthesis',
        githubUrl: 'https://github.com/coqui-ai/TTS',
        capabilities: ['text-to-speech', 'voice-cloning', 'multilingual'],
        requirements: { minRam: 4, minStorage: 1.5 },
        isEnabled: true
      },
      {
        id: 'chatterbox',
        name: 'ChatterBox',
        type: 'audio',
        description: 'Voice cloning and conversation model',
        githubUrl: 'https://github.com/CorentinJ/Real-Time-Voice-Cloning',
        capabilities: ['voice-cloning', 'real-time', 'conversation'],
        requirements: { minRam: 6, minStorage: 2 },
        isEnabled: true
      },

      // Code Generation Models
      {
        id: 'code-llama-3',
        name: 'Code Llama 3',
        type: 'code',
        description: 'Advanced code generation and completion',
        githubUrl: 'https://github.com/facebookresearch/codellama',
        huggingfaceUrl: 'https://huggingface.co/codellama/CodeLlama-34b-Instruct-hf',
        capabilities: ['code-generation', 'code-completion', 'multiple-languages'],
        requirements: { minRam: 8, minStorage: 3 },
        isEnabled: true
      },
      {
        id: 'deepseek-coder',
        name: 'DeepSeek-Coder',
        type: 'code',
        description: 'Specialized code generation model',
        githubUrl: 'https://github.com/deepseek-ai/DeepSeek-Coder',
        huggingfaceUrl: 'https://huggingface.co/deepseek-ai/deepseek-coder-33b-instruct',
        capabilities: ['code-generation', 'debugging', 'refactoring'],
        requirements: { minRam: 8, minStorage: 3 },
        isEnabled: true
      },
      {
        id: 'starcoder-2',
        name: 'StarCoder 2',
        type: 'code',
        description: 'Next-generation code model',
        githubUrl: 'https://github.com/bigcode-project/starcoder2',
        huggingfaceUrl: 'https://huggingface.co/bigcode/starcoder2-15b',
        capabilities: ['code-generation', 'code-completion', 'multilingual'],
        requirements: { minRam: 6, minStorage: 2.5 },
        isEnabled: true
      },
      {
        id: 'wizardcoder',
        name: 'WizardCoder',
        type: 'code',
        description: 'Enhanced code generation with instructions',
        githubUrl: 'https://github.com/nlpxucan/WizardLM',
        huggingfaceUrl: 'https://huggingface.co/WizardLM/WizardCoder-Python-34B-V1.0',
        capabilities: ['code-generation', 'instruction-following', 'python-specialized'],
        requirements: { minRam: 8, minStorage: 3 },
        isEnabled: true
      },

      // Text Generation Models
      {
        id: 'llama-3',
        name: 'LLaMA 3',
        type: 'text',
        description: 'Large language model for text generation',
        githubUrl: 'https://github.com/facebookresearch/llama',
        huggingfaceUrl: 'https://huggingface.co/meta-llama/Llama-2-70b-chat-hf',
        capabilities: ['text-generation', 'conversation', 'instruction-following'],
        requirements: { minRam: 8, minStorage: 4 },
        isEnabled: true
      },
      {
        id: 'mistral-7b',
        name: 'Mistral 7B',
        type: 'text',
        description: 'Efficient and powerful language model',
        githubUrl: 'https://github.com/mistralai/mistral-src',
        huggingfaceUrl: 'https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2',
        capabilities: ['text-generation', 'efficient', 'multilingual'],
        requirements: { minRam: 6, minStorage: 2 },
        isEnabled: true
      },
      {
        id: 'deepseek',
        name: 'DeepSeek',
        type: 'text',
        description: 'Advanced reasoning and text generation',
        githubUrl: 'https://github.com/deepseek-ai/DeepSeek-LLM',
        huggingfaceUrl: 'https://huggingface.co/deepseek-ai/deepseek-llm-67b-chat',
        capabilities: ['reasoning', 'text-generation', 'problem-solving'],
        requirements: { minRam: 8, minStorage: 3 },
        isEnabled: true
      },
      {
        id: 'bloom',
        name: 'BLOOM',
        type: 'text',
        description: 'Multilingual large language model',
        githubUrl: 'https://github.com/huggingface/transformers-bloom-inference',
        huggingfaceUrl: 'https://huggingface.co/bigscience/bloom',
        capabilities: ['multilingual', 'text-generation', 'translation'],
        requirements: { minRam: 8, minStorage: 4 },
        isEnabled: true
      },

      // Image Generation Models
      {
        id: 'stable-diffusion',
        name: 'Stable Diffusion',
        type: 'image',
        description: 'High-quality text-to-image generation',
        githubUrl: 'https://github.com/Stability-AI/stablediffusion',
        huggingfaceUrl: 'https://huggingface.co/spaces/stabilityai/stable-diffusion',
        capabilities: ['text-to-image', 'inpainting', 'img2img'],
        requirements: { minRam: 6, minStorage: 2 },
        isEnabled: true
      },
      {
        id: 'automatic1111',
        name: 'Automatic1111',
        type: 'image',
        description: 'Web UI for Stable Diffusion with extensions',
        githubUrl: 'https://github.com/AUTOMATIC1111/stable-diffusion-webui',
        capabilities: ['web-ui', 'extensions', 'batch-processing'],
        requirements: { minRam: 8, minStorage: 3 },
        isEnabled: true
      },
      {
        id: 'comfyui',
        name: 'ComfyUI',
        type: 'image',
        description: 'Node-based GUI for Stable Diffusion',
        githubUrl: 'https://github.com/comfyanonymous/ComfyUI',
        capabilities: ['node-based', 'workflow', 'advanced-control'],
        requirements: { minRam: 6, minStorage: 2.5 },
        isEnabled: true
      },
      {
        id: 'gfpgan',
        name: 'GFPGAN',
        type: 'image',
        description: 'Face restoration and enhancement',
        githubUrl: 'https://github.com/TencentARC/GFPGAN',
        capabilities: ['face-restoration', 'upscaling', 'enhancement'],
        requirements: { minRam: 4, minStorage: 1 },
        isEnabled: true
      },
      {
        id: 'real-esrgan',
        name: 'Real-ESRGAN',
        type: 'image',
        description: 'Image super-resolution and enhancement',
        githubUrl: 'https://github.com/xinntao/Real-ESRGAN',
        capabilities: ['super-resolution', 'enhancement', 'anime-support'],
        requirements: { minRam: 4, minStorage: 1 },
        isEnabled: true
      },
      {
        id: 'rembg',
        name: 'RemBG',
        type: 'image',
        description: 'Background removal from images',
        githubUrl: 'https://github.com/danielgatis/rembg',
        capabilities: ['background-removal', 'fast', 'accurate'],
        requirements: { minRam: 2, minStorage: 0.5 },
        isEnabled: true
      }
    ];
  }

  async getAvailableModels(type?: string): Promise<AIModel[]> {
    if (type) {
      return this.models.filter(model => model.type === type && model.isEnabled);
    }
    return this.models.filter(model => model.isEnabled);
  }

  async generateVideo(params: VideoGenerationParams): Promise<AxiosResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/api/video/generate`, params, {
        headers: await this.getAuthHeaders(),
        timeout: 300000, // 5 minutes timeout for video generation
      });
      return response;
    } catch (error) {
      console.error('Video generation error:', error);
      throw error;
    }
  }

  async generateApp(params: AppGenerationParams): Promise<AxiosResponse> {
    try {
      const formData = new FormData();
      formData.append('description', params.description);
      formData.append('appType', params.appType);
      formData.append('framework', params.framework);
      formData.append('features', JSON.stringify(params.features));
      formData.append('designStyle', params.designStyle);
      formData.append('model', params.model);

      if (params.uploadedFiles) {
        params.uploadedFiles.forEach((file, index) => {
          formData.append(`files_${index}`, file);
        });
      }

      const response = await axios.post(`${this.baseURL}/api/app/generate`, formData, {
        headers: {
          ...await this.getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
        timeout: 600000, // 10 minutes timeout for app generation
      });
      return response;
    } catch (error) {
      console.error('App generation error:', error);
      throw error;
    }
  }

  async generateAudio(params: AudioGenerationParams): Promise<AxiosResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/api/audio/generate`, params, {
        headers: await this.getAuthHeaders(),
        timeout: 180000, // 3 minutes timeout for audio generation
      });
      return response;
    } catch (error) {
      console.error('Audio generation error:', error);
      throw error;
    }
  }

  async generateImage(params: ImageGenerationParams): Promise<AxiosResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/api/image/generate`, params, {
        headers: await this.getAuthHeaders(),
        timeout: 120000, // 2 minutes timeout for image generation
      });
      return response;
    } catch (error) {
      console.error('Image generation error:', error);
      throw error;
    }
  }

  async addCustomModel(model: Partial<AIModel>): Promise<void> {
    try {
      // Validate model
      if (!model.name || !model.githubUrl || !model.type) {
        throw new Error('Model name, GitHub URL, and type are required');
      }

      const newModel: AIModel = {
        id: model.id || `custom-${Date.now()}`,
        name: model.name,
        type: model.type,
        description: model.description || 'Custom AI model',
        githubUrl: model.githubUrl,
        huggingfaceUrl: model.huggingfaceUrl,
        apiKey: model.apiKey,
        capabilities: model.capabilities || [],
        requirements: model.requirements || { minRam: 4, minStorage: 1 },
        isEnabled: true
      };

      this.models.push(newModel);
      await this.saveModelsToStorage();
    } catch (error) {
      console.error('Error adding custom model:', error);
      throw error;
    }
  }

  async updateModelStatus(modelId: string, isEnabled: boolean): Promise<void> {
    const model = this.models.find(m => m.id === modelId);
    if (model) {
      model.isEnabled = isEnabled;
      await this.saveModelsToStorage();
    }
  }

  async uploadToSocialMedia(platforms: string[], fileUrl: string, metadata: any): Promise<AxiosResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/api/social/upload`, {
        platforms,
        fileUrl,
        metadata
      }, {
        headers: await this.getAuthHeaders(),
        timeout: 300000, // 5 minutes timeout for social media upload
      });
      return response;
    } catch (error) {
      console.error('Social media upload error:', error);
      throw error;
    }
  }

  async generateAPK(appCode: string, appName: string): Promise<AxiosResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/api/app/build-apk`, {
        appCode,
        appName
      }, {
        headers: await this.getAuthHeaders(),
        timeout: 900000, // 15 minutes timeout for APK generation
      });
      return response;
    } catch (error) {
      console.error('APK generation error:', error);
      throw error;
    }
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await AsyncStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  private async saveModelsToStorage(): Promise<void> {
    try {
      await AsyncStorage.setItem('ai_models', JSON.stringify(this.models));
    } catch (error) {
      console.error('Error saving models to storage:', error);
    }
  }

  private async loadModelsFromStorage(): Promise<void> {
    try {
      const savedModels = await AsyncStorage.getItem('ai_models');
      if (savedModels) {
        this.models = JSON.parse(savedModels);
      }
    } catch (error) {
      console.error('Error loading models from storage:', error);
    }
  }
}

export const aiModelService = new AIModelService();