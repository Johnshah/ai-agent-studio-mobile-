/**
 * 🏪 Redux Store Configuration - Advanced State Management
 * Optimized for high-performance mobile AI operations
 */

import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { useSelector, TypedUseSelectorHook } from 'react-redux';

// AI Generation State
interface AIGenerationState {
  isGenerating: boolean;
  currentOperation: string | null;
  progress: number;
  queue: string[];
  history: any[];
  realtimeSession: string | null;
}

const aiGenerationSlice = createSlice({
  name: 'aiGeneration',
  initialState: {
    isGenerating: false,
    currentOperation: null,
    progress: 0,
    queue: [],
    history: [],
    realtimeSession: null
  } as AIGenerationState,
  reducers: {
    startGeneration: (state, action: PayloadAction<string>) => {
      state.isGenerating = true;
      state.currentOperation = action.payload;
      state.progress = 0;
    },
    updateProgress: (state, action: PayloadAction<number>) => {
      state.progress = action.payload;
    },
    completeGeneration: (state, action: PayloadAction<any>) => {
      state.isGenerating = false;
      state.currentOperation = null;
      state.progress = 100;
      state.history.unshift(action.payload);
    },
    addToQueue: (state, action: PayloadAction<string>) => {
      state.queue.push(action.payload);
    },
    removeFromQueue: (state, action: PayloadAction<string>) => {
      state.queue = state.queue.filter(id => id !== action.payload);
    },
    startRealtimeSession: (state, action: PayloadAction<string>) => {
      state.realtimeSession = action.payload;
    },
    endRealtimeSession: (state) => {
      state.realtimeSession = null;
    }
  }
});

// Device Performance State
interface DeviceState {
  profile: string;
  isOptimized: boolean;
  capabilities: any;
  performance: {
    cpuUsage: number;
    memoryUsage: number;
    temperature: number;
    batteryLevel: number;
  };
}

const deviceSlice = createSlice({
  name: 'device',
  initialState: {
    profile: 'unknown',
    isOptimized: false,
    capabilities: null,
    performance: {
      cpuUsage: 0,
      memoryUsage: 0,
      temperature: 0,
      batteryLevel: 100
    }
  } as DeviceState,
  reducers: {
    setDeviceProfile: (state, action: PayloadAction<string>) => {
      state.profile = action.payload;
    },
    setOptimizationStatus: (state, action: PayloadAction<boolean>) => {
      state.isOptimized = action.payload;
    },
    updatePerformance: (state, action: PayloadAction<Partial<DeviceState['performance']>>) => {
      state.performance = { ...state.performance, ...action.payload };
    },
    setCapabilities: (state, action: PayloadAction<any>) => {
      state.capabilities = action.payload;
    }
  }
});

// Security State
interface SecurityState {
  isAuthenticated: boolean;
  securityLevel: string;
  biometricEnabled: boolean;
  encryptionActive: boolean;
  lastAuthentication: string | null;
}

const securitySlice = createSlice({
  name: 'security',
  initialState: {
    isAuthenticated: false,
    securityLevel: 'basic',
    biometricEnabled: false,
    encryptionActive: false,
    lastAuthentication: null
  } as SecurityState,
  reducers: {
    authenticate: (state) => {
      state.isAuthenticated = true;
      state.lastAuthentication = new Date().toISOString();
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.lastAuthentication = null;
    },
    setSecurityLevel: (state, action: PayloadAction<string>) => {
      state.securityLevel = action.payload;
    },
    setBiometricStatus: (state, action: PayloadAction<boolean>) => {
      state.biometricEnabled = action.payload;
    },
    setEncryptionStatus: (state, action: PayloadAction<boolean>) => {
      state.encryptionActive = action.payload;
    }
  }
});

// UI State
interface UIState {
  theme: 'light' | 'dark';
  loading: boolean;
  notifications: any[];
  currentScreen: string;
}

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: 'dark',
    loading: false,
    notifications: [],
    currentScreen: 'Home'
  } as UIState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    addNotification: (state, action: PayloadAction<any>) => {
      state.notifications.unshift(action.payload);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    setCurrentScreen: (state, action: PayloadAction<string>) => {
      state.currentScreen = action.payload;
    }
  }
});

// Configure store
export const store = configureStore({
  reducer: {
    aiGeneration: aiGenerationSlice.reducer,
    device: deviceSlice.reducer,
    security: securitySlice.reducer,
    ui: uiSlice.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
      }
    })
});

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export actions
export const {
  startGeneration,
  updateProgress,
  completeGeneration,
  addToQueue,
  removeFromQueue,
  startRealtimeSession,
  endRealtimeSession
} = aiGenerationSlice.actions;

export const {
  setDeviceProfile,
  setOptimizationStatus,
  updatePerformance,
  setCapabilities
} = deviceSlice.actions;

export const {
  authenticate,
  logout,
  setSecurityLevel,
  setBiometricStatus,
  setEncryptionStatus
} = securitySlice.actions;

export const {
  setTheme,
  setLoading,
  addNotification,
  removeNotification,
  setCurrentScreen
} = uiSlice.actions;

// Typed selector hook
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;