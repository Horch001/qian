import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Clock, CheckCheck, Pin } from 'lucide-react';
import { Language, Translations } from '../types';
import { userApi, chatApi } from '../services/api';

interface MessagesPageProps {
  language: Language;
  translations: Translations;
}

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  isOfficial: boolean;
  isPinned?: boolean;
  type: 'notification' | 'chat';
}

export const MessagesPage: React.FC<MessagesPageProps> = ({ language }) => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getText = (obj: { [key: string]: string }) => obj[language] || obj.zh;

  // 从后端加载消息数据
  useEffect(() => {
    const loadMessages = async () => {
      try {
        // 并行加载通知和聊天室
        const [notifications, chatRooms] = await Promise.all([
          userApi.getNotifications().catch(() => []),
          chatApi.getRooms().catch(() => []),
        ]);

        const convs: Conversation[] = [];

        // 添加系统通知（按类型分组）
        const notificationGroups: { [key: string]: any[] } = {};
        notifications.forEach((n: any) => {
          const type = n.type || 'SYSTEM';
          if (!notificationGroups[type]) {
            notificationGroups[type] = [];
          }
          notificationGroups[type].push(n);
        });

        // 系统通知
        if (notificationGroups['SYSTEM']?.length > 0) {
          const latest = notificationGroups['SYSTEM'][0];
          const unreadCount = notificationGroups['SYSTEM'].filter((n: any) => !n.isRead).length;
          convs.push({
            id: 'system',
            name: getText({ zh: '系统通知', en: 'System', ko: '시스템', vi: 'Hệ thống' }),
            avatar: '🔔',
            lastMessage: latest.content || '',
            time: formatTime(latest.createdAt, language),
            unread: unreadCount,
            isOfficial: true,
            type: 'notification',
          });
        }

        // 订单通知
        if (notificationGroups['ORDER']?.length > 0) {
          const latest = notificationGroups['ORDER'][0];
          const unreadCount = notificationGroups['ORDER'].filter((n: any) => !n.isRead).length;
          convs.push({
            id: 'order',
            name: getText({ zh: '订单助手', en: 'Order Assistant', ko: '주문 도우미', vi: 'Trợ lý đơn hàng' }),
            avatar: '📦',
            lastMessage: latest.content || '',
            time: formatTime(latest.createdAt, language),
            unread: unreadCount,
            isOfficial: true,
            type: 'notification',
          });
        }

        // 支付通知
        if (notificationGroups['PAYMENT']?.length > 0) {
          const latest = notificationGroups['PAYMENT'][0];
          const unreadCount = notificationGroups['PAYMENT'].filter((n: any) => !n.isRead).length;
          convs.push({
            id: 'payment',
            name: getText({ zh: '支付通知', en: 'Payment', ko: '결제', vi: 'Thanh toán' }),
            avatar: '💰',
            lastMessage: latest.content || '',
            time: formatTime(latest.createdAt, language),
            unread: unreadCount,
            isOfficial: true,
            type: 'notification',
          });
        }

        // 促销通知
        if (notificationGroups['PROMOTION']?.length > 0) {
          const latest = notificationGroups['PROMOTION'][0];
          const unreadCount = notificationGroups['PROMOTION'].filter((n: any) => !n.isRead).length;
          convs.push({
            id: 'promotion',
            name: getText({ zh: '优惠活动', en: 'Promotions', ko: '프로모션', vi: 'Khuyến mãi' }),
            avatar: '🎁',
            lastMessage: latest.content || '',
            time: formatTime(latest.createdAt, language),
            unread: unreadCount,
            isOfficial: true,
            type: 'notification',
          });
        }

        // 添加官方客服入口（始终显示）
        convs.unshift({
          id: 'support',
          name: getText({ zh: '官方客服', en: 'Support', ko: '고객지원', vi: 'Hỗ trợ' }),
          avatar: '🎧',
          lastMessage: getText({ zh: '有问题随时联系我们', en: 'Contact us anytime', ko: '언제든지 연락하세요', vi: 'Liên hệ bất cứ lúc nào' }),
          time: '',
          unread: 0,
          isOfficial: true,
          isPinned: true,
          type: 'chat',
        });

        // 添加商家聊天室
        chatRooms.forEach((room: any) => {
          const merchantInfo = room.merchantUser?.merchant;
          convs.push({
            id: room.id,
            name: merchantInfo?.shopName || room.merchantUser?.username || getText({ zh: '商家', en: 'Merchant', ko: '판매자', vi: 'Người bán' }),
            avatar: merchantInfo?.logo || '🏪',
            lastMessage: room.lastMessage || '',
            time: room.lastMessageAt ? formatTime(room.lastMessageAt, language) : '',
            unread: 0, // TODO: 从后端获取未读数
            isOfficial: false,
            type: 'chat',
          });
        });

        setConversations(convs);
      } catch (error) {
        console.error('加载消息失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [language]);

  const handleMarkAllRead = async () => {
    try {
      await userApi.markAllNotificationsAsRead();
      setConversations(prev => prev.map(c => ({ ...c, unread: 0 })));
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  };

  const handleTogglePin = (id: string) => {
    setConversations(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, isPinned: !c.isPinned } : c);
      // 置顶的排在前面
      return updated.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
    });
  };

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);

  // 格式化时间
  function formatTime(dateStr: string, lang: Language): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return getText({ zh: '昨天', en: 'Yesterday', ko: '어제', vi: 'Hôm qua' });
    } else if (diffDays < 7) {
      return getText({ zh: `${diffDays}天前`, en: `${diffDays} days ago`, ko: `${diffDays}일 전`, vi: `${diffDays} ngày trước` });
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return getText({ zh: `${weeks}周前`, en: `${weeks} week${weeks > 1 ? 's' : ''} ago`, ko: `${weeks}주 전`, vi: `${weeks} tuần trước` });
    } else {
      return date.toLocaleDateString();
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-300 flex flex-col">
      <header className="bg-white/90 backdrop-blur-sm sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-sm font-bold text-purple-600">
            {language === 'zh' ? '消息' : language === 'en' ? 'Messages' : language === 'ko' ? '메시지' : 'Tin nhắn'}
            {totalUnread > 0 && <span className="ml-1 text-red-500">({totalUnread})</span>}
          </h1>
          {totalUnread > 0 && (
            <button 
              onClick={handleMarkAllRead}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
            >
              <CheckCheck className="w-4 h-4 text-purple-600" />
              <span className="text-[10px] text-purple-600 font-bold">{language === 'zh' ? '全部已读' : 'Read All'}</span>
            </button>
          )}
          {totalUnread === 0 && <div className="w-9"></div>}
        </div>
      </header>

      <main className="flex-1 max-w-md w-full mx-auto overflow-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-3"></div>
            <p>{getText({ zh: '加载中...', en: 'Loading...', ko: '로딩 중...', vi: 'Đang tải...' })}</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <MessageCircle className="w-12 h-12 mb-3 text-gray-300" />
            <p>{getText({ zh: '暂无消息', en: 'No messages', ko: '메시지 없음', vi: 'Không có tin nhắn' })}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {conversations.map((conv) => (
              <div 
                key={conv.id}
                onClick={() => {
                  if (conv.id === 'support') {
                    navigate('/customer-service');
                  } else if (conv.type === 'chat') {
                    navigate(`/chat/${conv.id}`);
                  } else if (conv.type === 'notification') {
                    // 跳转到通知详情页
                    navigate('/notification-detail', { state: { type: conv.id, name: conv.name } });
                  }
                }}
                className={`flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors cursor-pointer ${conv.isPinned ? 'bg-purple-50' : 'bg-white'}`}
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl overflow-hidden">
                    {conv.avatar.startsWith('http') ? (
                      <img src={conv.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      conv.avatar
                    )}
                  </div>
                  {conv.isOfficial && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-[10px]">✓</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-gray-800 text-sm truncate">{conv.name}</h3>
                    {conv.time && (
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {conv.time}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  {conv.unread > 0 && (
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold">{conv.unread}</span>
                    </div>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleTogglePin(conv.id); }}
                    className={`p-1 rounded hover:bg-gray-200 transition-colors ${conv.isPinned ? 'text-purple-600' : 'text-gray-400'}`}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
