import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Bell, Package, CreditCard, Gift, CheckCircle } from 'lucide-react';
import { Language, Translations } from '../types';
import { userApi } from '../services/api';

interface NotificationDetailPageProps {
  language: Language;
  translations: Translations;
}

interface Notification {
  id: string;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export const NotificationDetailPage: React.FC<NotificationDetailPageProps> = ({ language }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const notificationType = location.state?.type || 'system';
  const notificationName = location.state?.name || '通知';

  const getText = (obj: { [key: string]: string }) => obj[language] || obj.zh;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'order': return <Package className="w-5 h-5 text-blue-500" />;
      case 'payment': return <CreditCard className="w-5 h-5 text-green-500" />;
      case 'promotion': return <Gift className="w-5 h-5 text-orange-500" />;
      default: return <Bell className="w-5 h-5 text-purple-500" />;
    }
  };

  const getTypeFilter = (type: string) => {
    switch (type) {
      case 'order': return 'ORDER';
      case 'payment': return 'PAYMENT';
      case 'promotion': return 'PROMOTION';
      default: return 'SYSTEM';
    }
  };

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const allNotifications = await userApi.getNotifications();
        const typeFilter = getTypeFilter(notificationType);
        const filtered = allNotifications.filter((n: any) => n.type === typeFilter);
        setNotifications(filtered);
      } catch (error) {
        console.error('加载通知失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadNotifications();
  }, [notificationType]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await userApi.markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return getText({ zh: '刚刚', en: 'Just now', ko: '방금', vi: 'Vừa xong' });
    if (diffMins < 60) return getText({ zh: `${diffMins}分钟前`, en: `${diffMins}m ago`, ko: `${diffMins}분 전`, vi: `${diffMins} phút trước` });
    if (diffHours < 24) return getText({ zh: `${diffHours}小时前`, en: `${diffHours}h ago`, ko: `${diffHours}시간 전`, vi: `${diffHours} giờ trước` });
    if (diffDays < 7) return getText({ zh: `${diffDays}天前`, en: `${diffDays}d ago`, ko: `${diffDays}일 전`, vi: `${diffDays} ngày trước` });
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-300 flex flex-col">
      <header className="bg-white/90 backdrop-blur-sm sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-sm font-bold text-purple-600">{notificationName}</h1>
          <div className="w-9"></div>
        </div>
      </header>

      <main className="flex-1 max-w-md w-full mx-auto overflow-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-3"></div>
            <p>{getText({ zh: '加载中...', en: 'Loading...', ko: '로딩 중...', vi: 'Đang tải...' })}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Bell className="w-12 h-12 mb-3 text-gray-300" />
            <p>{getText({ zh: '暂无通知', en: 'No notifications', ko: '알림 없음', vi: 'Không có thông báo' })}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => {
                  if (!notification.isRead) {
                    handleMarkAsRead(notification.id);
                  }
                  if (notification.link) {
                    navigate(notification.link);
                  }
                }}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${notification.isRead ? 'bg-white' : 'bg-purple-50'}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {getTypeIcon(notificationType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`text-sm ${notification.isRead ? 'text-gray-700' : 'text-gray-900 font-bold'}`}>
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">{notification.content}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{formatTime(notification.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
