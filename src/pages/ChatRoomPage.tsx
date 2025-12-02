import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { chatApi, ChatMessage } from '../services/api';
import socketService from '../services/socket';
import { ArrowLeft, Send } from 'lucide-react';

interface MockMessage {
  id: string;
  content: string;
  isMe: boolean;
  time: string;
}

export default function ChatRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [mockMessages, setMockMessages] = useState<MockMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // 从跳转传递的目标名称和模拟标志
  const [targetName, setTargetName] = useState(location.state?.targetName || '客服');
  const [currentUserName, setCurrentUserName] = useState('我');
  const isMock = location.state?.isMock || roomId?.startsWith('mock-');

  const getCurrentUserId = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).id : 'current-user';
  };

  const currentUserId = getCurrentUserId();

  // 获取当前用户的用户名
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setCurrentUserName(userData.username || '我');
      } catch (e) {
        console.error('解析用户数据失败:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (isMock) {
      // 模拟模式，直接显示界面
      setLoading(false);
      return;
    }

    if (!roomId) return;

    const token = localStorage.getItem('authToken');
    if (token) {
      socketService.connect(token);
      socketService.joinRoom(roomId);

      socketService.onNewMessage((message: ChatMessage) => {
        setMessages((prev) => [...prev, message]);
        // 更新对方用户名
        if (message.senderId !== currentUserId && message.sender?.username) {
          setTargetName(message.sender.username);
        }
        scrollToBottom();
      });

      socketService.onUserTyping(() => {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      });
    }

    loadMessages();

    return () => {
      if (roomId && !isMock) {
        socketService.leaveRoom(roomId);
        socketService.offNewMessage();
        socketService.offUserTyping();
      }
    };
  }, [roomId, isMock]);

  const loadMessages = async () => {
    if (!roomId || isMock) {
      setLoading(false);
      return;
    }
    try {
      const data = await chatApi.getMessages(roomId);
      setMessages(data);
      // 从消息中获取对方的用户名
      if (data.length > 0) {
        const otherUserMessage = data.find((msg: ChatMessage) => msg.senderId !== currentUserId);
        if (otherUserMessage && otherUserMessage.sender?.username) {
          setTargetName(otherUserMessage.sender.username);
        }
      }
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

  const formatNow = () => {
    const now = new Date();
    return now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const content = inputText.trim();
    setInputText('');

    if (isMock) {
      // 模拟发送消息
      const newMsg: MockMessage = {
        id: Date.now().toString(),
        content,
        isMe: true,
        time: formatNow(),
      };
      setMockMessages((prev) => [...prev, newMsg]);
      scrollToBottom();

      // 模拟对方回复
      setTimeout(() => {
        setIsTyping(true);
      }, 500);
      
      setTimeout(() => {
        setIsTyping(false);
        const replyMsg: MockMessage = {
          id: (Date.now() + 1).toString(),
          content: '您好！感谢您的咨询，我们会尽快回复您。',
          isMe: false,
          time: formatNow(),
        };
        setMockMessages((prev) => [...prev, replyMsg]);
        scrollToBottom();
      }, 2000);
    } else if (roomId) {
      await socketService.sendMessage(roomId, content, 'TEXT');
    }
    
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
    if (roomId && !isMock) {
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
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* 头部 */}
      <div className="flex-shrink-0 bg-gradient-to-r from-purple-600 to-pink-500 text-white p-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-bold">{targetName || '聊天'}</h1>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 欢迎消息 */}
        {(isMock ? mockMessages.length === 0 : messages.length === 0) && (
          <div className="text-center text-gray-400 text-sm py-4">
            欢迎咨询，请输入您的问题
          </div>
        )}
        
        {/* 真实消息 */}
        {!isMock && messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] ${isMe ? 'order-2' : 'order-1'}`}>
                {!isMe && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-sm mb-1">
                    {msg.sender?.avatar ? (
                      <img src={msg.sender.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      (msg.sender?.username || '?').charAt(0)
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
        
        {/* 模拟消息 */}
        {isMock && mockMessages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%]`}>
              {!msg.isMe && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-sm mb-1">
                  {(targetName || '客').charAt(0)}
                </div>
              )}
              <div
                className={`rounded-2xl px-4 py-2 ${
                  msg.isMe
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-tr-sm'
                    : 'bg-white text-gray-800 rounded-tl-sm'
                }`}
              >
                <p className="break-words">{msg.content}</p>
              </div>
              <div className={`text-xs text-gray-400 mt-1 ${msg.isMe ? 'text-right' : 'text-left'}`}>
                {msg.time}
              </div>
            </div>
          </div>
        ))}
        
        {/* 正在输入提示 */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl px-4 py-2 text-gray-500 text-sm">
              对方正在输入...
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>


      {/* 输入框 - 固定在底部 */}
      <div className="flex-shrink-0 bg-white border-t p-3 flex items-center gap-2 safe-area-inset-bottom">
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="输入消息..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-purple-300 text-gray-800"
        />
        <button
          onClick={handleSend}
          disabled={!inputText.trim()}
          className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center disabled:opacity-50 active:scale-95 transition-transform"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
