/**
 * 🤖 Advanced AI Model Service - Real-time AI Processing with Extreme Performance
 * Integrates all AI models with advanced caching, optimization, and real-time capabilities
 * Optimized for Poco X6 Pro and high-performance mobile devices
 */

import axios, { AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Alert, Platform } from 'react-native';
import { AIPerformanceManager } from './AIPerformanceManager';
import { AdvancedSecurityManager } from './AdvancedSecurityManager';
import { OfflineAIManager } from './OfflineAIManager';
import { DeviceOptimizationService } from './DeviceOptimizationService';

interface AIModel {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'image' | 'text' | 'code';
  description: string;
  provider: string;
  apiUrl: string;
  githubUrl?: string;
  huggingfaceUrl?: string;
  capabilities: string[];
  requirements: {
    minRam: number;
    minStorage: number;
    gpuRequired: boolean;
  };
  pricing: 'free' | 'freemium' | 'paid';
  isOnline: boolean;
  isOfflineCapable: boolean;
  isEnabled: boolean;
  performanceRating: number; // 1-10
}

interface GenerationRequest {
  modelId: string;
  type: 'video' | 'audio' | 'image' | 'text' | 'code';
  prompt: string;
  parameters?: any;
  priority?: 'low' | 'normal' | 'high' | 'realtime';
  useOffline?: boolean;
  enableCache?: boolean;
}

interface GenerationResult {
  success: boolean;
  output?: any;
  error?: string;
  processingTime: number;
  modelUsed: string;
  cached: boolean;
  quality: 'draft' | 'standard' | 'high' | 'ultra';
  metadata?: any;
}

interface RealTimeSession {
  id: string;
  modelId: string;
  type: string;
  isActive: boolean;
  startTime: Date;
  lastActivity: Date;
}

export class AdvancedAIModelService {
  private models: Map<string, AIModel> = new Map();
  private performanceManager: AIPerformanceManager;
  private securityManager: AdvancedSecurityManager;
  private offlineManager: OfflineAIManager;
  private optimizationService: DeviceOptimizationService;
  private cache: Map<string, any> = new Map();
  private realTimeSessions: Map<string, RealTimeSession> = new Map();
  private processingQueue: GenerationRequest[] = [];
  private isProcessing = false;

  constructor(
    performanceManager: AIPerformanceManager,
    securityManager: AdvancedSecurityManager,
    offlineManager: OfflineAIManager,
    optimizationService: DeviceOptimizationService
  ) {
    this.performanceManager = performanceManager;
    this.securityManager = securityManager;
    this.offlineManager = offlineManager;
    this.optimizationService = optimizationService;
    
    this.initializeModels();
    this.startProcessingQueue();
  }

  private initializeModels(): void {
    const models: AIModel[] = [
      // Video Generation Models
      {
        id: 'wan2.2-pro',
        name: 'Wan2.2 Pro',
        type: 'video',
        description: 'Ultra-high quality video generation with cinematic quality',
        provider: 'ModelScope',
        apiUrl: 'https://api.modelscope.cn/v1/models/damo/text-to-video-synthesis',
        githubUrl: 'https://github.com/modelscope/modelscope',
        huggingfaceUrl: 'https://huggingface.co/spaces/modelscope/text-to-video-synthesis',
        capabilities: ['text-to-video', '4k-generation', 'cinematic', 'realtime-preview'],
        requirements: { minRam: 8 * 1024 * 1024 * 1024, minStorage: 2048, gpuRequired: true },
        pricing: 'free',
        isOnline: true,
        isOfflineCapable: false,
        isEnabled: true,
        performanceRating: 9
      },
      
      {
        id: 'stable-video-diffusion-xl',
        name: 'Stable Video Diffusion XL',
        type: 'video',
        description: 'State-of-the-art video generation with incredible detail',
        provider: 'Stability AI',
        apiUrl: 'https://api.stability.ai/v2alpha/generation/video',
        githubUrl: 'https://github.com/Stability-AI/generative-models',
        capabilities: ['text-to-video', 'image-to-video', 'long-form', '8k-capable'],
        requirements: { minRam: 12 * 1024 * 1024 * 1024, minStorage: 4096, gpuRequired: true },
        pricing: 'freemium',
        isOnline: true,
        isOfflineCapable: false,
        isEnabled: true,
        performanceRating: 10
      },

      // Audio Generation Models
      {
        id: 'musicgen-xl',
        name: 'MusicGen XL',
        type: 'audio',
        description: 'Professional-grade music generation with real-time capabilities',
        provider: 'Meta',
        apiUrl: 'https://api.replicate.com/v1/predictions',
        githubUrl: 'https://github.com/facebookresearch/audiocraft',
        huggingfaceUrl: 'https://huggingface.co/spaces/facebook/MusicGen',
        capabilities: ['music-generation', 'real-time', 'genre-control', 'stem-separation'],
        requirements: { minRam: 6 * 1024 * 1024 * 1024, minStorage: 1024, gpuRequired: true },
        pricing: 'free',
        isOnline: true,
        isOfflineCapable: true,
        isEnabled: true,
        performanceRating: 9
      },

      {
        id: 'bark-ultra',
        name: 'Bark Ultra TTS',
        type: 'audio',
        description: 'Ultra-realistic voice synthesis with emotion control',
        provider: 'Suno AI',
        apiUrl: 'https://api.bark.suno.ai/v1/generate',
        githubUrl: 'https://github.com/suno-ai/bark',
        huggingfaceUrl: 'https://huggingface.co/spaces/suno/bark',
        capabilities: ['text-to-speech', 'voice-cloning', 'emotion-control', 'real-time'],
        requirements: { minRam: 4 * 1024 * 1024 * 1024, minStorage: 512, gpuRequired: false },
        pricing: 'free',
        isOnline: true,
        isOfflineCapable: true,
        isEnabled: true,
        performanceRating: 9
      },

      // Code Generation Models
      {
        id: 'code-llama-34b-instruct',
        name: 'Code Llama 34B Instruct',
        type: 'code',
        description: 'Most advanced code generation with real-time completion',
        provider: 'Meta',
        apiUrl: 'https://api.together.ai/v1/completions',
        githubUrl: 'https://github.com/facebookresearch/codellama',
        huggingfaceUrl: 'https://huggingface.co/codellama/CodeLlama-34b-Instruct-hf',
        capabilities: ['code-generation', 'completion', 'debugging', 'real-time'],
        requirements: { minRam: 8 * 1024 * 1024 * 1024, minStorage: 2048, gpuRequired: true },
        pricing: 'free',
        isOnline: true,
        isOfflineCapable: false,
        isEnabled: true,
        performanceRating: 10
      },

      {
        id: 'deepseek-coder-v2',
        name: 'DeepSeek Coder V2',
        type: 'code',
        description: 'Specialized coding AI with mobile app focus',
        provider: 'DeepSeek',
        apiUrl: 'https://api.deepseek.com/v1/completions',
        githubUrl: 'https://github.com/deepseek-ai/DeepSeek-Coder',
        capabilities: ['code-generation', 'mobile-dev', 'debugging', 'optimization'],
        requirements: { minRam: 6 * 1024 * 1024 * 1024, minStorage: 1536, gpuRequired: false },
        pricing: 'freemium',
        isOnline: true,
        isOfflineCapable: false,
        isEnabled: true,
        performanceRating: 9
      },

      // Image Generation Models
      {
        id: 'sdxl-turbo',
        name: 'SDXL Turbo',
        type: 'image',
        description: 'Ultra-fast high-quality image generation',
        provider: 'Stability AI',
        apiUrl: 'https://api.stability.ai/v2alpha/generation/image-to-image',
        githubUrl: 'https://github.com/Stability-AI/generative-models',
        capabilities: ['text-to-image', 'real-time', 'ultra-fast', 'high-res'],
        requirements: { minRam: 4 * 1024 * 1024 * 1024, minStorage: 1024, gpuRequired: true },
        pricing: 'freemium',
        isOnline: true,
        isOfflineCapable: true,
        isEnabled: true,
        performanceRating: 10
      },

      {
        id: 'dalle-3-hd',
        name: 'DALL-E 3 HD',
        type: 'image',
        description: 'Most advanced image generation with perfect prompt adherence',
        provider: 'OpenAI',
        apiUrl: 'https://api.openai.com/v1/images/generations',
        capabilities: ['text-to-image', 'ultra-hd', 'style-control', 'aspect-ratios'],
        requirements: { minRam: 6 * 1024 * 1024 * 1024, minStorage: 1536, gpuRequired: true },
        pricing: 'paid',
        isOnline: true,
        isOfflineCapable: false,
        isEnabled: true,
        performanceRating: 10
      }
    ];

    // Add models to Map
    models.forEach(model => this.models.set(model.id, model));
    console.log(`🤖 Initialized ${models.length} advanced AI models`);
  }

  private startProcessingQueue(): void {
    setInterval(async () => {
      if (!this.isProcessing && this.processingQueue.length > 0) {
        await this.processNextRequest();
      }
    }, 100); // Check every 100ms for real-time responsiveness
  }

  private async processNextRequest(): Promise<void> {
    if (this.processingQueue.length === 0) return;

    this.isProcessing = true;
    
    // Sort queue by priority
    this.processingQueue.sort((a, b) => {
      const priorityOrder = { 'realtime': 4, 'high': 3, 'normal': 2, 'low': 1 };
      return priorityOrder[b.priority || 'normal'] - priorityOrder[a.priority || 'normal'];
    });

    const request = this.processingQueue.shift();
    if (request) {
      try {
        await this.processRequest(request);
      } catch (error) {
        console.error('❌ Request processing failed:', error);
      }
    }

    this.isProcessing = false;
  }

  private async processRequest(request: GenerationRequest): Promise<GenerationResult> {
    const startTime = Date.now();
    const model = this.models.get(request.modelId);
    
    if (!model) {
      return {
        success: false,
        error: `Model ${request.modelId} not found`,
        processingTime: Date.now() - startTime,
        modelUsed: request.modelId,
        cached: false,
        quality: 'draft'
      };
    }

    // Check cache first
    if (request.enableCache) {
      const cacheKey = this.generateCacheKey(request);
      const cached = this.cache.get(cacheKey);
      if (cached) {
        console.log(`⚡ Cache hit for ${model.name}`);
        return {
          success: true,
          output: cached.output,
          processingTime: Date.now() - startTime,
          modelUsed: model.name,
          cached: true,
          quality: cached.quality
        };
      }
    }

    // Choose processing method based on availability and preference
    let result: GenerationResult;
    
    if (request.useOffline && model.isOfflineCapable) {
      result = await this.processOffline(request, model);
    } else if (await this.isOnlineCapable()) {
      result = await this.processOnline(request, model);
    } else if (model.isOfflineCapable) {
      result = await this.processOffline(request, model);
    } else {
      result = {
        success: false,
        error: 'No processing method available - check internet connection',
        processingTime: Date.now() - startTime,
        modelUsed: model.name,
        cached: false,
        quality: 'draft'
      };
    }

    // Cache successful results
    if (result.success && request.enableCache) {
      const cacheKey = this.generateCacheKey(request);
      this.cache.set(cacheKey, {
        output: result.output,
        quality: result.quality,
        timestamp: Date.now()
      });
    }

    return result;
  }

  private async processOnline(request: GenerationRequest, model: AIModel): Promise<GenerationResult> {
    const startTime = Date.now();
    
    try {
      console.log(`🌐 Processing online with ${model.name}...`);

      // Secure the request
      const securedParams = await this.securityManager.secureGeneratedContent({
        ...request.parameters,
        prompt: request.prompt
      });

      // Optimize parameters based on device capabilities
      const optimizedParams = this.optimizeRequestForDevice(request, model);

      // Make API request (mock implementation)
      const response = await this.makeAPIRequest(model, {
        ...securedParams,
        ...optimizedParams
      });

      if (response.success) {
        const quality = this.determineOutputQuality(optimizedParams);
        
        return {
          success: true,
          output: response.data,
          processingTime: Date.now() - startTime,
          modelUsed: model.name,
          cached: false,
          quality,
          metadata: {
            provider: model.provider,
            modelVersion: '2.0',
            processingLocation: 'cloud'
          }
        };
      } else {
        throw new Error(response.error || 'API request failed');
      }
      
    } catch (error) {
      console.error(`❌ Online processing failed for ${model.name}:`, error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Online processing failed',
        processingTime: Date.now() - startTime,
        modelUsed: model.name,
        cached: false,
        quality: 'draft'
      };
    }
  }

  private async processOffline(request: GenerationRequest, model: AIModel): Promise<GenerationResult> {
    const startTime = Date.now();
    
    try {
      console.log(`📱 Processing offline with ${model.name}...`);

      const result = await this.offlineManager.processWithOfflineModel({
        modelId: model.id,
        input: {
          prompt: request.prompt,
          ...request.parameters
        },
        priority: request.priority
      });

      if (result.success) {
        return {
          success: true,
          output: result.output,
          processingTime: result.processingTime,
          modelUsed: model.name,
          cached: false,
          quality: 'standard',
          metadata: {
            provider: 'offline',
            modelVersion: 'mobile',
            processingLocation: 'device'
          }
        };
      } else {
        throw new Error(result.error || 'Offline processing failed');
      }
      
    } catch (error) {
      console.error(`❌ Offline processing failed for ${model.name}:`, error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Offline processing failed',
        processingTime: Date.now() - startTime,
        modelUsed: model.name,
        cached: false,
        quality: 'draft'
      };
    }
  }

  private optimizeRequestForDevice(request: GenerationRequest, model: AIModel): any {
    const deviceCapabilities = this.optimizationService.getDeviceCapabilities();
    const currentProfile = this.optimizationService.getCurrentProfile();
    
    if (!deviceCapabilities || !currentProfile) return request.parameters || {};

    const optimized: any = { ...request.parameters };

    // Video optimization
    if (request.type === 'video') {
      optimized.resolution = this.optimizationService.getPreferredVideoResolution();
      optimized.fps = deviceCapabilities.isPocoX6Pro ? 60 : 30;
      optimized.quality = currentProfile.profileName.includes('Ultra') ? 'ultra' : 'high';
    }

    // Image optimization
    if (request.type === 'image') {
      optimized.resolution = this.optimizationService.getPreferredImageResolution();
      optimized.batch_size = this.performanceManager.getOptimalBatchSize();
    }

    // Audio optimization
    if (request.type === 'audio') {
      optimized.sample_rate = deviceCapabilities.isPocoX6Pro ? 48000 : 44100;
      optimized.quality = 'high';
    }

    // Code optimization
    if (request.type === 'code') {
      optimized.max_tokens = deviceCapabilities.isHighEndDevice ? 8192 : 4096;
      optimized.temperature = 0.1; // More deterministic for code
    }

    console.log(`⚙️ Optimized request for ${currentProfile.profileName}`);
    return optimized;
  }

  private async makeAPIRequest(model: AIModel, parameters: any): Promise<{ success: boolean; data?: any; error?: string }> {
    // Mock API request - in real app, make actual HTTP requests
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            [model.type]: `Generated ${model.type} using ${model.name}`,
            url: `https://generated-content.example.com/${Date.now()}.${model.type}`,
            metadata: parameters
          }
        });
      }, 1000 + Math.random() * 2000); // Simulate 1-3 second processing
    });
  }

  private generateCacheKey(request: GenerationRequest): string {
    return `${request.modelId}_${request.type}_${request.prompt}_${JSON.stringify(request.parameters)}`;
  }

  private determineOutputQuality(params: any): 'draft' | 'standard' | 'high' | 'ultra' {
    const qualityFactors = [
      params.resolution?.includes('4K') || params.resolution?.includes('4096'),
      params.quality === 'ultra',
      params.fps >= 60,
      params.sample_rate >= 48000
    ];

    const qualityScore = qualityFactors.filter(Boolean).length;
    
    if (qualityScore >= 3) return 'ultra';
    if (qualityScore >= 2) return 'high';
    if (qualityScore >= 1) return 'standard';
    return 'draft';
  }

  private async isOnlineCapable(): Promise<boolean> {
    const networkState = await NetInfo.fetch();
    return networkState.isConnected && networkState.isInternetReachable !== false;
  }

  // Public methods

  public async generateVideo(params: {
    prompt: string;
    style?: string;
    duration?: number;
    resolution?: string;
    modelId?: string;
    priority?: 'low' | 'normal' | 'high' | 'realtime';
    useOffline?: boolean;
  }): Promise<GenerationResult> {
    const modelId = params.modelId || 'wan2.2-pro';
    
    const request: GenerationRequest = {
      modelId,
      type: 'video',
      prompt: params.prompt,
      parameters: {
        style: params.style || 'cinematic',
        duration: params.duration || 30,
        resolution: params.resolution || this.optimizationService.getPreferredVideoResolution()
      },
      priority: params.priority || 'normal',
      useOffline: params.useOffline || false,
      enableCache: true
    };

    return await this.processRequest(request);
  }

  public async generateAudio(params: {
    prompt: string;
    type?: 'music' | 'voice' | 'effects';
    voice?: string;
    duration?: number;
    modelId?: string;
    priority?: 'low' | 'normal' | 'high' | 'realtime';
    useOffline?: boolean;
  }): Promise<GenerationResult> {
    const modelId = params.modelId || (params.type === 'music' ? 'musicgen-xl' : 'bark-ultra');
    
    const request: GenerationRequest = {
      modelId,
      type: 'audio',
      prompt: params.prompt,
      parameters: {
        type: params.type || 'music',
        voice: params.voice,
        duration: params.duration || 30
      },
      priority: params.priority || 'normal',
      useOffline: params.useOffline || false,
      enableCache: true
    };

    return await this.processRequest(request);
  }

  public async generateImage(params: {
    prompt: string;
    style?: string;
    size?: string;
    modelId?: string;
    priority?: 'low' | 'normal' | 'high' | 'realtime';
    useOffline?: boolean;
  }): Promise<GenerationResult> {
    const modelId = params.modelId || 'sdxl-turbo';
    
    const request: GenerationRequest = {
      modelId,
      type: 'image',
      prompt: params.prompt,
      parameters: {
        style: params.style || 'photorealistic',
        size: params.size || this.optimizationService.getPreferredImageResolution()
      },
      priority: params.priority || 'normal',
      useOffline: params.useOffline || false,
      enableCache: true
    };

    return await this.processRequest(request);
  }

  public async generateCode(params: {
    prompt: string;
    language?: string;
    framework?: string;
    modelId?: string;
    priority?: 'low' | 'normal' | 'high' | 'realtime';
  }): Promise<GenerationResult> {
    const modelId = params.modelId || 'code-llama-34b-instruct';
    
    const request: GenerationRequest = {
      modelId,
      type: 'code',
      prompt: params.prompt,
      parameters: {
        language: params.language || 'javascript',
        framework: params.framework || 'react-native'
      },
      priority: params.priority || 'normal',
      useOffline: false, // Code models are typically online-only
      enableCache: true
    };

    return await this.processRequest(request);
  }

  public async startRealTimeSession(modelId: string, type: string): Promise<string> {
    const sessionId = `rt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: RealTimeSession = {
      id: sessionId,
      modelId,
      type,
      isActive: true,
      startTime: new Date(),
      lastActivity: new Date()
    };

    this.realTimeSessions.set(sessionId, session);
    console.log(`🚀 Started real-time session: ${sessionId} for ${modelId}`);
    
    return sessionId;
  }

  public async processRealTime(sessionId: string, input: any): Promise<GenerationResult> {
    const session = this.realTimeSessions.get(sessionId);
    if (!session || !session.isActive) {
      return {
        success: false,
        error: 'Real-time session not found or inactive',
        processingTime: 0,
        modelUsed: 'unknown',
        cached: false,
        quality: 'draft'
      };
    }

    session.lastActivity = new Date();

    const request: GenerationRequest = {
      modelId: session.modelId,
      type: session.type as any,
      prompt: input.prompt || '',
      parameters: input.parameters,
      priority: 'realtime',
      useOffline: true, // Prefer offline for real-time
      enableCache: false // Don't cache real-time results
    };

    return await this.processRequest(request);
  }

  public stopRealTimeSession(sessionId: string): void {
    const session = this.realTimeSessions.get(sessionId);
    if (session) {
      session.isActive = false;
      this.realTimeSessions.delete(sessionId);
      console.log(`🛑 Stopped real-time session: ${sessionId}`);
    }
  }

  public getAvailableModels(): AIModel[] {
    return Array.from(this.models.values()).filter(model => model.isEnabled);
  }

  public getModelsByType(type: string): AIModel[] {
    return this.getAvailableModels().filter(model => model.type === type);
  }

  public getQueueLength(): number {
    return this.processingQueue.length;
  }

  public clearCache(): void {
    this.cache.clear();
    console.log('🧹 AI model cache cleared');
  }

  public getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0.85 // Mock hit rate
    };
  }

  public cleanup(): void {
    this.cache.clear();
    this.realTimeSessions.clear();
    this.processingQueue = [];
    console.log('🧹 Advanced AI Model Service cleaned up');
  }
}