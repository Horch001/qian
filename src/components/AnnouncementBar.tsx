import React, { useState, useEffect } from 'react';
import { Volume2, X } from 'lucide-react';
import { Language, Translations } from '../types';
import { announcementApi, Announcement } from '../services/api';
import eventsSocketService from '../services/eventsSocket';

interface AnnouncementBarProps {
  language: Language;
  translations: Translations;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ language, translations }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  
  // 从后端获取公告
  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const data = await announcementApi.getHomepageAnnouncement();
        setAnnouncement(data);
      } catch (error) {
        console.error('Failed to fetch announcement:', error);
      }
    };
    
    fetchAnnouncement();
    
    // 监听WebSocket公告更新 - 实时同步
    const handleAnnouncementUpdate = (data: Announcement) => {
      console.log('[AnnouncementBar] Received announcement update:', data);
      setAnnouncement(data);
    };
    
    eventsSocketService.on('announcement:updated', handleAnnouncementUpdate);
    
    // 每60秒刷新一次公告作为备选
    const interval = setInterval(fetchAnnouncement, 60000);
    
    return () => {
      clearInterval(interval);
      eventsSocketService.off('announcement:updated', handleAnnouncementUpdate);
    };
  }, []);
  
  // 根据语言获取公告文本（滚动条显示：标题 + 内容）
  const getAnnouncementText = () => {
    if (!announcement) {
      return translations.announcement[language];
    }
    
    let title = '';
    let content = '';
    
    switch (language) {
      case 'en':
        title = announcement.titleEn || announcement.title;
        content = announcement.contentEn || announcement.content || '';
        break;
      case 'ko':
        title = announcement.titleKo || announcement.title;
        content = announcement.contentKo || announcement.content || '';
        break;
      case 'vi':
        title = announcement.titleVi || announcement.title;
        content = announcement.contentVi || announcement.content || '';
        break;
      default:
        title = announcement.title;
        content = announcement.content || '';
    }
    
    // 如果有内容，显示"标题 内容"，否则只显示标题
    return content ? `${title} ${content}` : title;
  };
  
  // 根据语言获取公告内容
  const getAnnouncementContent = () => {
    if (!announcement) {
      return translations.announcement[language];
    }
    
    switch (language) {
      case 'en':
        return announcement.contentEn || announcement.content || announcement.titleEn || announcement.title;
      case 'ko':
        return announcement.contentKo || announcement.content || announcement.titleKo || announcement.title;
      case 'vi':
        return announcement.contentVi || announcement.content || announcement.titleVi || announcement.title;
      default:
        return announcement.content || announcement.title;
    }
  };
  
  const announcementText = getAnnouncementText();
  const announcementContent = getAnnouncementContent();

  return (
    <>
      <div 
        onClick={() => setIsModalOpen(true)}
        className="w-full bg-purple-900/5 backdrop-blur-sm border-b border-purple-900/5 h-7 flex items-center overflow-hidden px-3 cursor-pointer active:bg-purple-900/10 transition-colors"
      >
        <div className="flex items-center gap-1.5 text-yellow-300 z-10 bg-transparent pr-2 shrink-0">
          <Volume2 size={14} strokeWidth={2.5} className="fill-yellow-300/40" />
        </div>
        <div className="flex-1 relative h-full flex items-center overflow-hidden">
          <div className="whitespace-nowrap animate-marquee text-[11px] font-bold text-yellow-300 tracking-wide">
            {announcementText}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>
          
          <div className="relative w-full max-w-sm bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2 text-yellow-600">
                <Volume2 size={18} />
                <h3 className="font-bold text-lg text-gray-900">{translations.systemNotice[language]}</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {announcementContent}
            </div>

            <button 
              onClick={() => setIsModalOpen(false)}
              className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm transition-colors shadow-lg shadow-purple-500/30"
            >
              {translations.iKnow[language]}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
