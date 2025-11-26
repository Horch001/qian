import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Heart, MessageCircle, ChevronDown, ChevronUp, Lock, UserX, Shield, MessageSquare, Clock } from 'lucide-react';
import { Language, Translations } from '../types';

export const PrivateTreeHolePage: React.FC = () => {
  const { language } = useOutletContext<{ language: Language; translations: Translations }>();
  const [confessions] = useState([
    { id: '1', content: { zh: '工作压力太大了...', en: 'Too much work stress...', ko: '일 스트레스가 너무 크다...', vi: 'Áp lực công việc quá lớn...' }, time: '2小时前', likes: 234, comments: 12, mood: 'sad' },
    { id: '2', content: { zh: '最近心情不太好', en: 'Not feeling great lately', ko: '요즘 기분이 좋지 않다', vi: 'Tâm trạng gần đây không tốt' }, time: '5小时前', likes: 456, comments: 23, mood: 'neutral' },
    { id: '3', content: { zh: '今天遇到了一件很开心的事', en: 'Something happy happened today', ko: '오늘 행복한 일이 있었다', vi: 'Hôm nay có chuyện vui' }, time: '8小时前', likes: 789, comments: 45, mood: 'happy' },
  ]);
  const [isPostExpanded, setIsPostExpanded] = useState(false);
  const [postContent, setPostContent] = useState('');

  const getText = (obj: { [key: string]: string }) => obj[language] || obj.zh;

  const features = [
    { icon: UserX, text: { zh: '完全匿名', en: 'Anonymous', ko: '완전 익명', vi: 'Hoàn toàn ẩn danh' } },
    { icon: Lock, text: { zh: '隐私保护', en: 'Privacy Protected', ko: '개인정보 보호', vi: 'Bảo vệ riêng tư' } },
    { icon: Shield, text: { zh: '安全可靠', en: 'Safe & Secure', ko: '안전 신뢰', vi: 'An toàn tin cậy' } },
    { icon: MessageSquare, text: { zh: '自由表达', en: 'Free Expression', ko: '자유 표현', vi: 'Tự do bày tỏ' } },
  ];

  const getMoodGradient = (mood: string) => {
    switch (mood) {
      case 'happy': return 'from-green-50 to-emerald-50 border-green-200';
      case 'sad': return 'from-blue-50 to-indigo-50 border-blue-200';
      default: return 'from-purple-50 to-pink-50 border-purple-200';
    }
  };

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case 'happy': return '😊';
      case 'sad': return '😔';
      default: return '😐';
    }
  };

  return (
    <div className="space-y-2">
      {/* 特色功能 */}
      <div className="grid grid-cols-4 gap-1.5">
        {features.map((feature, idx) => (
          <div key={idx} className="flex flex-col items-center gap-0.5 py-1">
            <feature.icon className="w-4 h-4 text-purple-600" strokeWidth={2.5} />
            <span className="text-[9px] text-gray-700 font-bold text-center leading-tight">{feature.text[language]}</span>
          </div>
        ))}
      </div>

      {/* 帖子列表 */}
      <div className="space-y-2">
        {confessions.map((confession) => (
          <div 
            key={confession.id} 
            className={`bg-gradient-to-br ${getMoodGradient(confession.mood)} rounded-xl p-3 border shadow-sm hover:shadow-md transition-all duration-300`}
          >
            <div className="flex items-start gap-2 mb-2">
              <span className="text-2xl">{getMoodEmoji(confession.mood)}</span>
              <p className="text-gray-700 text-sm flex-1 leading-relaxed">{getText(confession.content)}</p>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{confession.time}</span>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/50 transition-all group">
                  <Heart className="w-3.5 h-3.5 text-gray-500 group-hover:text-red-500 group-hover:fill-red-500 transition-all" />
                  <span className="text-gray-600 font-bold">{confession.likes}</span>
                </button>
                <button className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/50 transition-all group">
                  <MessageCircle className="w-3.5 h-3.5 text-gray-500 group-hover:text-purple-500 transition-all" />
                  <span className="text-gray-600 font-bold">{confession.comments}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 发布区域 */}
      <div className="bg-white rounded-xl border-2 border-purple-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
        {!isPostExpanded ? (
          <button
            onClick={() => setIsPostExpanded(true)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all group"
          >
            <span className="font-bold text-purple-600 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              {getText({ zh: '我要发布', en: 'Post', ko: '게시', vi: 'Đăng' })}
            </span>
            <ChevronDown className="w-5 h-5 text-purple-600 group-hover:translate-y-0.5 transition-transform" />
          </button>
        ) : (
          <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-600" />
                {getText({ zh: '发布内容', en: 'Post Content', ko: '콘텐츠 게시', vi: 'Đăng nội dung' })}
              </h3>
              <button
                onClick={() => setIsPostExpanded(false)}
                className="text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-lg p-1 transition-all"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
            </div>
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder={getText({ 
                zh: '分享你的想法...（禁止发布政治相关内容）', 
                en: 'Share your thoughts... (No political content)', 
                ko: '생각을 공유하세요... (정치 관련 콘텐츠 금지)', 
                vi: 'Chia sẻ suy nghĩ... (Không có nội dung chính trị)' 
              })}
              rows={4}
              className="w-full px-3 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none text-sm bg-white shadow-inner"
            />
            <button className="mt-3 w-full px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:from-red-700 hover:to-red-600 font-bold text-sm shadow-md hover:shadow-lg active:scale-95 transition-all">
              {getText({ zh: '发布', en: 'Post', ko: '게시', vi: 'Đăng' })}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
