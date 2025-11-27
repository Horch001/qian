import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chatApi, ChatMessage, ChatRoom } from '../services/api';
import socketService from '../services/socket';

export default function ChatRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getCurrentUserId = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).id : null;
  };

  const currentUserId = getCurrentUserId();

  useEffect(() => {
    if (!roomId) return;

    const token = localStorage.getItem('authToken');
    if (token) {
      socketService.connect(token);
      socketService.joinRoom(roomId);

      socketService.onNewMessage((message: ChatMessage) => {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      });

      socketService.onUserTyping(() => {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      });
    }

    loadMessages();

    return () => {
      if (roomId) {
        socketService.leaveRoom(roomId);
        socketService.offNewMessage();
        socketService.offUserTyping();
      }
    };
  }, [roomId]);

  const loadMessages = async () => {
    if (!roomId) return;
    try {
      const data = await chatApi.getMessages(roomId);
      setMessages(data);
      await chatApi.markAsRead(roomId);
      scrollToBottom();
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };


  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSend = async () => {
    if (!inputText.trim() || !roomId) return;

    const content = inputText.trim();
    setInputText('');

    await socketService.sendMessage(roomId, content, 'TEXT');
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (roomId) {
      socketService.sendTyping(roomId);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-xl">←</button>
        <div className="flex-1">
          <h1 className="font-bold">聊天</h1>
          {isTyping && <span className="text-xs opacity-75">对方正在输入...</span>}
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] ${isMe ? 'order-2' : 'order-1'}`}>
                {!isMe && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-sm mb-1">
                    {msg.sender.avatar ? (
                      <img src={msg.sender.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      (msg.sender.username || '?').charAt(0)
                    )}
                  </div>
                )}
                <div
                  className={`rounded-2xl px-4 py-2 ${
                    isMe
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-tr-sm'
                      : 'bg-white text-gray-800 rounded-tl-sm'
                  }`}
                >
                  <p className="break-words">{msg.content}</p>
                </div>
                <div className={`text-xs text-gray-400 mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                  {formatTime(msg.createdAt)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>


      {/* 输入框 */}
      <div className="bg-white border-t p-3 flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="输入消息..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-purple-300"
        />
        <button
          onClick={handleSend}
          disabled={!inputText.trim()}
          className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
}
