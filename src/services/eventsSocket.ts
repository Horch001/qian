import { io, Socket } from 'socket.io-client';

const EVENTS_SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace('/api/v1', '') + '/events';

class EventsSocketService {
  private socket: Socket | null = null;
  private listeners = new Map<string, Set<Function>>();
  private token: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000; // 初始重连延迟1秒

  connect(token: string): Socket {
    this.token = token;
    
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(EVENTS_SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 10000, // 最大重连延迟10秒
    });

    this.socket.on('connect', () => {
      console.log('[Events] Connected');
      this.reconnectAttempts = 0; // 重置重连计数
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Events] Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[Events] Connection error:', error.message);
      this.reconnectAttempts++;
    });

    this.setupEventListeners();
    return this.socket;
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('order:updated', (order) => {
      this.emit('order:updated', order);
    });

    this.socket.on('cart:updated', (cart) => {
      this.emit('cart:updated', cart);
    });

    this.socket.on('favorite:updated', (data) => {
      this.emit('favorite:updated', data);
    });

    this.socket.on('balance:updated', (data) => {
      this.emit('balance:updated', data);
    });

    // 公告更新事件
    this.socket.on('announcement:updated', (announcement) => {
      this.emit('announcement:updated', announcement);
    });
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback?: Function) {
    if (!callback) {
      this.listeners.delete(event);
    } else {
      this.listeners.get(event)?.delete(callback);
    }
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }
}

export const eventsSocketService = new EventsSocketService();
export default eventsSocketService;
