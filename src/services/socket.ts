import { io, Socket } from 'socket.io-client';

// 根据环境自动选择 WebSocket 地址
const getSocketUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  // 移除末尾的斜杠
  const baseUrl = apiUrl.replace(/\/$/, '');
  return `${baseUrl}/chat`;
};

const SOCKET_URL = getSocketUrl();

class SocketService {
  private socket: Socket | null = null;

  connect(token: string): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    console.log('Connecting to WebSocket:', SOCKET_URL);

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  // 加入聊天室
  joinRoom(roomId: string) {
    this.socket?.emit('joinRoom', { roomId });
  }

  // 离开聊天室
  leaveRoom(roomId: string) {
    this.socket?.emit('leaveRoom', { roomId });
  }

  // 发送消息
  sendMessage(roomId: string, content: string, type: 'TEXT' | 'IMAGE' | 'PRODUCT' | 'ORDER' = 'TEXT') {
    return new Promise((resolve) => {
      this.socket?.emit('sendMessage', { roomId, content, type }, resolve);
    });
  }

  // 发送正在输入状态
  sendTyping(roomId: string) {
    this.socket?.emit('typing', { roomId });
  }

  // 监听新消息
  onNewMessage(callback: (message: any) => void) {
    this.socket?.on('newMessage', callback);
  }

  // 监听用户正在输入
  onUserTyping(callback: (data: { userId: string }) => void) {
    this.socket?.on('userTyping', callback);
  }

  // 移除监听
  offNewMessage() {
    this.socket?.off('newMessage');
  }

  offUserTyping() {
    this.socket?.off('userTyping');
  }
}

export const socketService = new SocketService();
export default socketService;
