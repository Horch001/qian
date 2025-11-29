import { io, Socket } from 'socket.io-client';

const EVENTS_SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace('/api/v1', '') + '/events';

class EventsSocketService {
  private socket: Socket | null = null;
  private listeners = new Map<string, Set<Function>>();

  connect(token: string): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(EVENTS_SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('[Events] Connected');
    });

    this.socket.on('disconnect', () => {
      console.log('[Events] Disconnected');
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
