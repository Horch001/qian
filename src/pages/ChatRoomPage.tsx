import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { chatApi, ChatMessage } from '../services/api';
import socketService from '../services/socket';
import { ArrowLeft, Send, Image, Video, ShoppingBag, Plus, X } from 'lucide-react';

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
  const [targetAvatar, setTargetAvatar] = useState<string>('');
  const [currentUserName, setCurrentUserName] = useState('我');
  const [showMoreOptions, setShowMoreOptions] = useState(false);
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
        scrollToBottom();
      });

      socketService.onUserTyping(() => {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      });
    }

    loadRoomInfo();
    loadMessages();

    return () => {
      if (roomId && !isMock) {
        socketService.leaveRoom(roomId);
        socketService.offNewMessage();
        socketService.offUserTyping();
      }
    };
  }, [roomId, isMock]);

  const loadRoomInfo = async () => {
    if (!roomId || isMock) return;
    try {
      const room = await chatApi.getRoomById(roomId);
      // 判断当前用户是普通用户还是商家
      if (room.userId === currentUserId) {
        // 当前用户是普通用户，显示商家店铺名和logo
        const merchantInfo = room.merchantUser?.merchants?.[0];
        setTargetName(merchantInfo?.shopName || room.merchantUser?.username || '商家');
        setTargetAvatar(merchantInfo?.logo || room.merchantUser?.avatar || '');
      } else {
        // 当前用户是商家，显示普通用户名和头像
        setTargetName(room.user?.username || '用户');
        setTargetAvatar(room.user?.avatar || '');
      }
    } catch (error) {
      console.error('Failed to load room info:', error);
    }
  };

  const loadMessages = async () => {
    if (!roomId || isMock) {
      setLoading(false);
      return;
    }
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
    <div className="fixed inset-0 bg-gray-100 flex justify-center">
      <div className="w-full max-w-md flex flex-col bg-gray-100">
        {/* 头部 */}
        <div className="flex-shrink-0 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-3 py-2 flex items-center justify-center gap-2 rounded-b-2xl relative">
        <button onClick={() => navigate(-1)} className="absolute left-3 p-1 hover:bg-white/20 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          {targetAvatar ? (
            <img 
              src={targetAvatar} 
              alt={targetName} 
              className="w-10 h-10 rounded-full object-cover border-2 border-white/30"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg">
              👤
            </div>
          )}
          <h1 className="font-bold text-base">{targetName || '聊天'}</h1>
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
                  className={`rounded-lg px-3 py-2 ${
                    isMe
                      ? 'bg-[#95EC69] text-gray-800'
                      : 'bg-white text-gray-800'
                  }`}
                  style={{
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}
                >
                  <p className="break-words text-sm leading-relaxed">{msg.content}</p>
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
                className={`rounded-lg px-3 py-2 ${
                  msg.isMe
                    ? 'bg-[#95EC69] text-gray-800'
                    : 'bg-white text-gray-800'
                }`}
                style={{
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}
              >
                <p className="break-words text-sm leading-relaxed">{msg.content}</p>
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


        {/* 更多选项面板 */}
        {showMoreOptions && (
          <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4">
            <div className="grid grid-cols-4 gap-4">
              <button className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Image className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-xs text-gray-600">图片</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Video className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-xs text-gray-600">视频</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-pink-600" />
                </div>
                <span className="text-xs text-gray-600">订单</span>
              </button>
            </div>
          </div>
        )}

        {/* 输入框 - 固定在底部 */}
        <div className="flex-shrink-0 bg-white border-t border-gray-200 p-3 flex items-center gap-2">
          <button
            onClick={() => setShowMoreOptions(!showMoreOptions)}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            {showMoreOptions ? <X className="w-5 h-5 text-gray-600" /> : <Plus className="w-5 h-5 text-gray-600" />}
          </button>
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
    </div>
  );
}
