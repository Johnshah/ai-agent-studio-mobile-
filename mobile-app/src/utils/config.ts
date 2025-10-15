import Constants from 'expo-constants';

// API Configuration
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:8000'  // Development
  : 'https://your-huggingface-space-url.hf.space'; // Production Hugging Face Space

// Hugging Face Configuration
export const HUGGINGFACE_CONFIG = {
  baseUrl: 'https://api-inference.huggingface.co',
  modelsUrl: 'https://huggingface.co',
  spacesUrl: 'https://huggingface.co/spaces'
};

// Social Media API Configurations
export const SOCIAL_MEDIA_CONFIG = {
  youtube: {
    apiUrl: 'https://www.googleapis.com/youtube/v3',
    uploadUrl: 'https://www.googleapis.com/upload/youtube/v3/videos',
    scopes: [
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube'
    ]
  },
  tiktok: {
    apiUrl: 'https://open-api.tiktok.com/platform/v1',
    uploadUrl: 'https://open-api.tiktok.com/platform/v1/post/publish'
  },
  instagram: {
    apiUrl: 'https://graph.instagram.com',
    mediaUrl: 'https://graph.instagram.com/v18.0'
  },
  twitter: {
    apiUrl: 'https://api.twitter.com/2',
    uploadUrl: 'https://upload.twitter.com/1.1/media/upload.json'
  }
};

// File and Storage Configuration
export const STORAGE_CONFIG = {
  maxFileSize: 500 * 1024 * 1024, // 500MB
  maxVideoSize: 2 * 1024 * 1024 * 1024, // 2GB for high-quality videos
  supportedVideoFormats: ['.mp4', '.mov', '.avi', '.mkv'],
  supportedAudioFormats: ['.mp3', '.wav', '.m4a', '.aac'],
  supportedImageFormats: ['.jpg', '.jpeg', '.png', '.webp'],
  cacheDuration: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

// Device Optimization Settings
export const DEVICE_CONFIG = {
  // Optimized for Poco X6 Pro and similar devices
  pocoX6Pro: {
    ram: 12,
    storage: 512,
    recommendedSettings: {
      videoResolution: '1080p',
      videoFps: 30,
      maxDuration: 120,
      concurrentGenerations: 2
    }
  },
  lowEndDevice: {
    ram: 8,
    recommendedSettings: {
      videoResolution: '720p',
      videoFps: 24,
      maxDuration: 60,
      concurrentGenerations: 1
    }
  },
  highEndDevice: {
    ram: 16,
    recommendedSettings: {
      videoResolution: '4K',
      videoFps: 60,
      maxDuration: 300,
      concurrentGenerations: 3
    }
  }
};

// AI Model Configurations
export const AI_MODEL_CONFIG = {
  video: {
    wan22: {
      name: 'Wan2.2',
      maxDuration: 300,
      recommendedResolution: '1080p',
      githubUrl: 'https://github.com/modelscope/modelscope',
      huggingFaceModel: 'ali-vilab/text-to-video-ms-1.7b'
    },
    stableVideo: {
      name: 'Stable Video Diffusion',
      maxDuration: 120,
      recommendedResolution: '720p',
      githubUrl: 'https://github.com/Stability-AI/generative-models',
      huggingFaceModel: 'stabilityai/stable-video-diffusion-img2vid-xt'
    },
    deforum: {
      name: 'Deforum Stable Diffusion',
      maxDuration: 60,
      recommendedResolution: '720p',
      githubUrl: 'https://github.com/deforum-art/deforum-stable-diffusion'
    }
  },
  audio: {
    musicgen: {
      name: 'MusicGen',
      maxDuration: 300,
      githubUrl: 'https://github.com/facebookresearch/audiocraft',
      huggingFaceModel: 'facebook/musicgen-small'
    },
    bark: {
      name: 'Bark',
      maxDuration: 60,
      githubUrl: 'https://github.com/suno-ai/bark',
      huggingFaceModel: 'suno/bark'
    },
    jukebox: {
      name: 'Jukebox',
      maxDuration: 180,
      githubUrl: 'https://github.com/openai/jukebox'
    }
  },
  code: {
    codeLlama: {
      name: 'Code Llama 3',
      githubUrl: 'https://github.com/facebookresearch/codellama',
      huggingFaceModel: 'codellama/CodeLlama-7b-Instruct-hf'
    },
    deepseekCoder: {
      name: 'DeepSeek-Coder',
      githubUrl: 'https://github.com/deepseek-ai/DeepSeek-Coder',
      huggingFaceModel: 'deepseek-ai/deepseek-coder-6.7b-instruct'
    },
    starcoder2: {
      name: 'StarCoder 2',
      githubUrl: 'https://github.com/bigcode-project/starcoder2',
      huggingFaceModel: 'bigcode/starcoder2-7b'
    }
  },
  image: {
    stableDiffusion: {
      name: 'Stable Diffusion XL',
      githubUrl: 'https://github.com/Stability-AI/generative-models',
      huggingFaceModel: 'stabilityai/stable-diffusion-xl-base-1.0'
    },
    gfpgan: {
      name: 'GFPGAN',
      githubUrl: 'https://github.com/TencentARC/GFPGAN'
    }
  }
};

// App Configuration
export const APP_CONFIG = {
  name: 'AI Agent Studio',
  version: '1.0.0',
  description: 'Complete AI-Powered Creative Suite',
  supportEmail: 'support@ai-agent-studio.com',
  githubRepo: 'https://github.com/Johnshah/ai-agent-studio-mobile-',
  documentationUrl: 'https://ai-agent-studio.gitbook.io/',
  
  features: {
    videoGeneration: true,
    audioGeneration: true,
    codeGeneration: true,
    imageGeneration: true,
    socialMediaIntegration: true,
    realTimePreview: true,
    collaborativeEditing: false, // Future feature
    voiceControl: false // Future feature
  },
  
  limits: {
    freeUser: {
      videosPerDay: 10,
      maxVideoLength: 120,
      maxFileSize: 100 * 1024 * 1024, // 100MB
      concurrentJobs: 1
    },
    premiumUser: {
      videosPerDay: 100,
      maxVideoLength: 600,
      maxFileSize: 1024 * 1024 * 1024, // 1GB
      concurrentJobs: 3
    }
  }
};

// Environment-specific configurations
export const getEnvironmentConfig = () => {
  const env = Constants.expoConfig?.extra?.environment || 'development';
  
  const configs = {
    development: {
      apiUrl: 'http://localhost:8000',
      debug: true,
      crashReporting: false
    },
    staging: {
      apiUrl: 'https://staging-ai-agent-studio.hf.space',
      debug: false,
      crashReporting: true
    },
    production: {
      apiUrl: 'https://ai-agent-studio.hf.space',
      debug: false,
      crashReporting: true
    }
  };
  
  return configs[env as keyof typeof configs] || configs.development;
};

// Utility functions
export const getOptimalSettings = (deviceRAM: number) => {
  if (deviceRAM >= 16) {
    return DEVICE_CONFIG.highEndDevice.recommendedSettings;
  } else if (deviceRAM >= 12) {
    return DEVICE_CONFIG.pocoX6Pro.recommendedSettings;
  } else {
    return DEVICE_CONFIG.lowEndDevice.recommendedSettings;
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const isValidFileType = (filename: string, type: 'video' | 'audio' | 'image'): boolean => {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  
  switch (type) {
    case 'video':
      return STORAGE_CONFIG.supportedVideoFormats.includes(extension);
    case 'audio':
      return STORAGE_CONFIG.supportedAudioFormats.includes(extension);
    case 'image':
      return STORAGE_CONFIG.supportedImageFormats.includes(extension);
    default:
      return false;
  }
};

// Export default configuration
export default {
  API_BASE_URL,
  HUGGINGFACE_CONFIG,
  SOCIAL_MEDIA_CONFIG,
  STORAGE_CONFIG,
  DEVICE_CONFIG,
  AI_MODEL_CONFIG,
  APP_CONFIG,
  getEnvironmentConfig,
  getOptimalSettings,
  formatFileSize,
  isValidFileType
};