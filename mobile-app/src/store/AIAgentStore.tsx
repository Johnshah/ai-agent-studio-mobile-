import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Types
export interface AIModel {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'image' | 'text' | 'code';
  provider: string;
  githubUrl?: string;
  apiKey?: string;
  isEnabled: boolean;
  description: string;
}

export interface Project {
  id: string;
  name: string;
  type: 'video' | 'app' | 'music' | 'image';
  status: 'draft' | 'generating' | 'completed' | 'error';
  createdAt: string;
  updatedAt: string;
  data: any;
  outputUrl?: string;
}

export interface UserSettings {
  huggingFaceApiKey: string;
  socialMediaCredentials: {
    youtube?: { apiKey: string; channelId: string };
    tiktok?: { accessToken: string };
    instagram?: { accessToken: string };
  };
  defaultVideoSettings: {
    duration: number;
    quality: '480p' | '720p' | '1080p' | '4K';
    style: string;
  };
  deviceOptimization: {
    ramUsage: 'low' | 'medium' | 'high';
    storageLocation: string;
  };
}

interface AIAgentState {
  models: AIModel[];
  projects: Project[];
  currentProject: Project | null;
  settings: UserSettings;
  isLoading: boolean;
  error: string | null;
}

type AIAgentAction =
  | { type: 'SET_MODELS'; payload: AIModel[] }
  | { type: 'ADD_MODEL'; payload: AIModel }
  | { type: 'UPDATE_MODEL'; payload: { id: string; updates: Partial<AIModel> } }
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: { id: string; updates: Partial<Project> } }
  | { type: 'SET_CURRENT_PROJECT'; payload: Project | null }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<UserSettings> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: AIAgentState = {
  models: [
    // Video Generation Models
    {
      id: 'wan22',
      name: 'Wan2.2',
      type: 'video',
      provider: 'HuggingFace',
      githubUrl: 'https://github.com/modelscope/modelscope',
      isEnabled: true,
      description: 'High-quality video generation model'
    },
    {
      id: 'stable-video-diffusion',
      name: 'Stable Video Diffusion',
      type: 'video',
      provider: 'HuggingFace',
      githubUrl: 'https://github.com/Stability-AI/generative-models',
      isEnabled: true,
      description: 'Advanced video generation with stable diffusion'
    },
    // Audio/Music Generation Models
    {
      id: 'musicgen',
      name: 'MusicGen',
      type: 'audio',
      provider: 'HuggingFace',
      githubUrl: 'https://github.com/facebookresearch/audiocraft',
      isEnabled: true,
      description: 'AI music generation model'
    },
    {
      id: 'bark',
      name: 'Bark',
      type: 'audio',
      provider: 'HuggingFace',
      githubUrl: 'https://github.com/suno-ai/bark',
      isEnabled: true,
      description: 'Text-to-speech and audio generation'
    },
    // Code Generation Models
    {
      id: 'code-llama',
      name: 'Code Llama 3',
      type: 'code',
      provider: 'HuggingFace',
      githubUrl: 'https://github.com/facebookresearch/codellama',
      isEnabled: true,
      description: 'Advanced code generation model'
    },
    {
      id: 'deepseek-coder',
      name: 'DeepSeek-Coder',
      type: 'code',
      provider: 'HuggingFace',
      githubUrl: 'https://github.com/deepseek-ai/DeepSeek-Coder',
      isEnabled: true,
      description: 'Specialized coding AI model'
    },
    // Image Generation Models
    {
      id: 'stable-diffusion',
      name: 'Stable Diffusion XL',
      type: 'image',
      provider: 'HuggingFace',
      githubUrl: 'https://github.com/Stability-AI/generative-models',
      isEnabled: true,
      description: 'High-quality image generation'
    }
  ],
  projects: [],
  currentProject: null,
  settings: {
    huggingFaceApiKey: '',
    socialMediaCredentials: {},
    defaultVideoSettings: {
      duration: 30,
      quality: '1080p',
      style: 'cinematic'
    },
    deviceOptimization: {
      ramUsage: 'medium',
      storageLocation: 'internal'
    }
  },
  isLoading: false,
  error: null
};

function aiAgentReducer(state: AIAgentState, action: AIAgentAction): AIAgentState {
  switch (action.type) {
    case 'SET_MODELS':
      return { ...state, models: action.payload };
    case 'ADD_MODEL':
      return { ...state, models: [...state.models, action.payload] };
    case 'UPDATE_MODEL':
      return {
        ...state,
        models: state.models.map(model =>
          model.id === action.payload.id
            ? { ...model, ...action.payload.updates }
            : model
        )
      };
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };
    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] };
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.id
            ? { ...project, ...action.payload.updates }
            : project
        )
      };
    case 'SET_CURRENT_PROJECT':
      return { ...state, currentProject: action.payload };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

const AIAgentContext = createContext<{
  state: AIAgentState;
  dispatch: React.Dispatch<AIAgentAction>;
} | null>(null);

export const AIAgentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(aiAgentReducer, initialState);

  return (
    <AIAgentContext.Provider value={{ state, dispatch }}>
      {children}
    </AIAgentContext.Provider>
  );
};

export const useAIAgent = () => {
  const context = useContext(AIAgentContext);
  if (!context) {
    throw new Error('useAIAgent must be used within AIAgentProvider');
  }
  return context;
};

// Helper functions
export const aiAgentActions = {
  addModel: (model: AIModel) => ({ type: 'ADD_MODEL' as const, payload: model }),
  updateModel: (id: string, updates: Partial<AIModel>) => ({ 
    type: 'UPDATE_MODEL' as const, 
    payload: { id, updates } 
  }),
  addProject: (project: Project) => ({ type: 'ADD_PROJECT' as const, payload: project }),
  updateProject: (id: string, updates: Partial<Project>) => ({ 
    type: 'UPDATE_PROJECT' as const, 
    payload: { id, updates } 
  }),
  setCurrentProject: (project: Project | null) => ({ 
    type: 'SET_CURRENT_PROJECT' as const, 
    payload: project 
  }),
  updateSettings: (settings: Partial<UserSettings>) => ({ 
    type: 'UPDATE_SETTINGS' as const, 
    payload: settings 
  }),
  setLoading: (loading: boolean) => ({ type: 'SET_LOADING' as const, payload: loading }),
  setError: (error: string | null) => ({ type: 'SET_ERROR' as const, payload: error })
};