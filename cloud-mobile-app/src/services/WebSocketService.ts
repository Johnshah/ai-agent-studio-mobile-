/**
 * WebSocket Service - Real-time communication with AI Agent Studio Cloud
 * Provides instant updates on generation progress and completion
 */

import { EventEmitter } from 'events';

// WebSocket URL - replace with your actual backend URL
const WS_BASE_URL = 'wss://your-cloud-backend.herokuapp.com/ws';
// For development: 'ws://localhost:7860/ws'
// For Hugging Face Spaces: 'wss://huggingface.co/spaces/your-username/ai-agent-studio/ws'

export interface WebSocketMessage {
  type: 'task_update' | 'task_completed' | 'task_failed' | 'progress';
  task_id: string;
  status: string;
  progress?: number;
  result?: any;
  error?: string;
  timestamp: string;
}

class WebSocketServiceClass extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private isConnecting = false;
  private userToken: string | null = null;
  private userId: string | null = null;

  constructor() {
    super();
    this.setMaxListeners(20); // Allow more listeners for multiple screens
  }

  connect(token: string): void {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.userToken = token;
    this.userId = this.extractUserIdFromToken(token);
    this.isConnecting = true;

    try {
      const wsUrl = `${WS_BASE_URL}/${this.userId}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);

      console.log(`Connecting to WebSocket: ${wsUrl}`);
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.isConnecting = false;
      this.handleReconnect();
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.reconnectAttempts = 0;
    this.isConnecting = false;
    this.userToken = null;
    this.userId = null;
    this.emit('disconnected');
  }

  private handleOpen(): void {
    console.log('WebSocket connected successfully');
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000;
    this.emit('connected');
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      console.log('WebSocket message received:', message);

      // Emit specific events based on message type
      this.emit('message', message);
      this.emit(message.type, message);
      
      // Emit task-specific events
      if (message.task_id) {
        this.emit(`task_${message.task_id}`, message);
      }

      // Handle different message types
      switch (message.type) {
        case 'progress':
          this.emit('progress_update', {
            taskId: message.task_id,
            progress: message.progress,
            status: message.status,
          });
          break;

        case 'task_completed':
          this.emit('task_completed', {
            taskId: message.task_id,
            result: message.result,
          });
          break;

        case 'task_failed':
          this.emit('task_failed', {
            taskId: message.task_id,
            error: message.error,
          });
          break;

        case 'task_update':
          this.emit('task_update', {
            taskId: message.task_id,
            status: message.status,
            progress: message.progress,
          });
          break;
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  private handleClose(event: CloseEvent): void {
    console.log('WebSocket connection closed:', event.code, event.reason);
    this.isConnecting = false;
    this.ws = null;
    this.emit('disconnected', { code: event.code, reason: event.reason });

    // Attempt to reconnect unless it was a clean close
    if (event.code !== 1000 && this.userToken) {
      this.handleReconnect();
    }
  }

  private handleError(error: Event): void {
    console.error('WebSocket error:', error);
    this.isConnecting = false;
    this.emit('error', error);
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('max_reconnect_attempts');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      if (this.userToken) {
        this.connect(this.userToken);
      }
    }, delay);
  }

  private extractUserIdFromToken(token: string): string {
    // Simplified user ID extraction - in production, properly decode JWT
    // For now, return a placeholder that the backend can handle
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.user_id || 'current-user';
    } catch {
      return 'current-user';
    }
  }

  // Public methods for managing subscriptions
  subscribeToTask(taskId: string, callback: (message: WebSocketMessage) => void): () => void {
    const eventName = `task_${taskId}`;
    this.on(eventName, callback);
    
    // Return unsubscribe function
    return () => {
      this.off(eventName, callback);
    };
  }

  subscribeToProgress(callback: (data: { taskId: string; progress: number; status: string }) => void): () => void {
    this.on('progress_update', callback);
    return () => this.off('progress_update', callback);
  }

  subscribeToCompletion(callback: (data: { taskId: string; result: any }) => void): () => void {
    this.on('task_completed', callback);
    return () => this.off('task_completed', callback);
  }

  subscribeToFailure(callback: (data: { taskId: string; error: string }) => void): () => void {
    this.on('task_failed', callback);
    return () => this.off('task_failed', callback);
  }

  subscribeToConnection(
    onConnect: () => void,
    onDisconnect: (data?: { code: number; reason: string }) => void
  ): () => void {
    this.on('connected', onConnect);
    this.on('disconnected', onDisconnect);

    return () => {
      this.off('connected', onConnect);
      this.off('disconnected', onDisconnect);
    };
  }

  // Send message to server (for future bidirectional communication)
  send(message: any): boolean {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
        return false;
      }
    }
    return false;
  }

  // Get connection status
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  get connectionState(): string {
    if (!this.ws) return 'CLOSED';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING';
      case WebSocket.OPEN:
        return 'OPEN';
      case WebSocket.CLOSING:
        return 'CLOSING';
      case WebSocket.CLOSED:
        return 'CLOSED';
      default:
        return 'UNKNOWN';
    }
  }

  // Ping server to keep connection alive
  ping(): void {
    this.send({ type: 'ping', timestamp: Date.now() });
  }

  // Start periodic ping to keep connection alive
  startKeepAlive(interval = 30000): () => void {
    const keepAliveInterval = setInterval(() => {
      if (this.isConnected) {
        this.ping();
      }
    }, interval);

    return () => clearInterval(keepAliveInterval);
  }
}

export const WebSocketService = new WebSocketServiceClass();