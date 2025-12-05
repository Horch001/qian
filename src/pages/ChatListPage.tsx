import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { chatApi, ChatRoom } from '../services/api';
import { ArrowLeft } from 'lucide-react';

export default function ChatListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  // 从详情页跳转过来时，直接打开与目标用户的聊天
  const targetUser = location.state?.targetUser;
  const targetName = location.state?.targetName;

  useEffect(() => {
    if (targetUser || targetName) {
      // 如果有目标用户或目标名称，直接打开聊天室
      openChatWithUser();
    } else {
      loadRooms();
    }
  }, [targetUser, targetName]);

  const openChatWithUser = async () => {
    // 直接使用模拟聊天室（因为后端可能没有登录状态）
    const mockId = targetUser || `mock-${Date.now()}`;
    navigate(`/chat/${mockId}`, { replace: true, state: { targetName: targetName || '客服', isMock: true } });
  };

  const loadRooms = async () => {
    try {
      const data = await chatApi.getRooms();
      setRooms(data);
    } catch (error) {
      console.error('Failed to load chat rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    return date.toLocaleDateString();
  };

  const getCurrentUserId = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).id : null;
  };

  const getOtherUser = (room: ChatRoom) => {
    const currentUserId = getCurrentUserId();
    if (room.userId === currentUserId) {
      const merchantInfo = room.merchantUser.merchants?.[0];
      return {
        name: merchantInfo?.shopName || room.merchantUser.username || '商家',
        avatar: merchantInfo?.logo || room.merchantUser.avatar,
      };
    }
    return {
      name: room.user.username || '用户',
      avatar: room.user.avatar,
    };
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold flex-1 text-center pr-6">消息</h1>
      </div>

      {/* 聊天列表 */}
      <div className="divide-y divide-gray-100">
        {rooms.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-2">💬</div>
            <p>暂无聊天记录</p>
            <p className="text-sm mt-1">去商品详情页联系商家吧</p>
          </div>
        ) : (
          rooms.map((room) => {
            const otherUser = getOtherUser(room);
            return (
              <div
                key={room.id}
                className="bg-white p-4 flex items-center gap-3 active:bg-gray-50"
                onClick={() => navigate(`/chat/${room.id}`)}
              >
                {/* 头像 */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-lg overflow-hidden">
                  {otherUser.avatar ? (
                    <img src={otherUser.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    otherUser.name.charAt(0)
                  )}
                </div>

                {/* 内容 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{otherUser.name}</span>
                    <span className="text-xs text-gray-400">{formatTime(room.lastMessageAt)}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate mt-1">
                    {room.lastMessage || '暂无消息'}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
