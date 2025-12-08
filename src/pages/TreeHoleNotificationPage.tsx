import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, MessageCircle, Reply as ReplyIcon } from 'lucide-react';
import { Language, Translations } from '../types';
import { treeHoleApi } from '../services/api';

interface Notification {
  id: string;
  type: 'COMMENT' | 'REPLY';
  title: string;
  titleEn?: string;
  titleKo?: string;
  titleVi?: string;
  content: string;
  contentEn?: string;
  contentKo?: string;
  contentVi?: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

interface Props {
  language: Language;
  translations: Translations;
}

export const TreeHoleNotificationPage: React.FC<Props> = ({ language, translations }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await treeHoleApi.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('加载通知失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // 标记为已读
    if (!notification.isRead) {
      try {
        await treeHoleApi.markNotificationAsRead(notification.id);
        setNotifications(prev => prev.map(n => 
          n.id === notification.id ? { ...n, isRead: true } : n
        ));
      } catch (error) {
        console.error('标记已读失败:', error);
      }
    }

    // 跳转到对应页面
    if (notification.link) {
      navigate(notification.link);
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

  const getText = (obj: { [key: string]: string }) => obj[language] || obj.zh;

  const getTitle = (notification: Notification) => {
    switch (language) {
      case 'en': return notification.titleEn || notification.title;
      case 'ko': return notification.titleKo || notification.title;
      case 'vi': return notification.titleVi || notification.title;
      default: return notification.title;
    }
  };

  const getContent = (notification: Notification) => {
    switch (language) {
      case 'en': return notification.contentEn || notification.content;
      case 'ko': return notification.contentKo || notification.content;
      case 'vi': return notification.contentVi || notification.content;
      default: return notification.content;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* 顶部导航栏 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-600" />
            <h1 className="text-lg font-bold text-gray-800">
              {getText({ zh: '通知中心', en: 'Notifications', ko: '알림', vi: 'Thông báo' })}
            </h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="w-9"></div>
        </div>
      </div>

      {/* 通知列表 */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {getText({ zh: '暂无通知', en: 'No notifications', ko: '알림 없음', vi: 'Không có thông báo' })}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`bg-white rounded-lg p-4 border cursor-pointer transition-all hover:shadow-md ${
                  notification.isRead ? 'border-gray-200' : 'border-purple-300 bg-purple-50/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    notification.type === 'COMMENT' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    {notification.type === 'COMMENT' ? (
                      <MessageCircle className={`w-5 h-5 ${
                        notification.type === 'COMMENT' ? 'text-blue-600' : 'text-green-600'
                      }`} />
                    ) : (
                      <ReplyIcon className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`text-sm font-bold ${
                        notification.isRead ? 'text-gray-700' : 'text-purple-700'
                      }`}>
                        {getTitle(notification)}
                      </h3>
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {getContent(notification)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
