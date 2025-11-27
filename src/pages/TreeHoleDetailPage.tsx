import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, MessageCircle, Clock, Bookmark, Send, UserX } from 'lucide-react';
import { Language, Translations } from '../types';

interface TreeHoleDetailPageProps {
  language: Language;
  translations: Translations;
}

export const TreeHoleDetailPage: React.FC<TreeHoleDetailPageProps> = ({ language }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [commentText, setCommentText] = useState('');
  
  const item = location.state?.item || {
    id: '1',
    content: { zh: '这是一条树洞内容...', en: 'This is a tree hole content...', ko: '이것은 트리 홀 콘텐츠입니다...', vi: 'Đây là nội dung lỗ cây...' },
    fullContent: { zh: '这是完整的树洞内容，可以很长很长...', en: 'This is the full tree hole content, can be very long...', ko: '이것은 전체 트리 홀 콘텐츠입니다...', vi: 'Đây là nội dung đầy đủ của lỗ cây...' },
    time: '2小时前',
    likes: 234,
    comments: 12,
    mood: 'neutral',
  };

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case 'happy': return '😊';
      case 'sad': return '😔';
      default: return '😐';
    }
  };

  const getMoodGradient = (mood: string) => {
    switch (mood) {
      case 'happy': return 'from-green-100 to-emerald-100';
      case 'sad': return 'from-blue-100 to-indigo-100';
      default: return 'from-purple-100 to-pink-100';
    }
  };

  // 评论数据
  const [comments, setComments] = useState([
    { id: '1', content: { zh: '加油！一切都会好起来的', en: 'Cheer up! Everything will be fine', ko: '힘내세요! 다 잘 될 거예요', vi: 'Cố lên! Mọi thứ sẽ ổn thôi' }, time: '1小时前', likes: 23 },
    { id: '2', content: { zh: '我也有同样的感受', en: 'I feel the same way', ko: '저도 같은 느낌이에요', vi: 'Tôi cũng cảm thấy như vậy' }, time: '30分钟前', likes: 15 },
    { id: '3', content: { zh: '抱抱你~', en: 'Hugs~', ko: '안아줄게요~', vi: 'Ôm bạn~' }, time: '10分钟前', likes: 8 },
  ]);

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    
    const newComment = {
      id: Date.now().toString(),
      content: { zh: commentText, en: commentText, ko: commentText, vi: commentText },
      time: language === 'zh' ? '刚刚' : 'Just now',
      likes: 0,
    };
    setComments([...comments, newComment]);
    setCommentText('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 flex flex-col">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-sm font-bold text-purple-600">
            {language === 'zh' ? '树洞详情' : language === 'en' ? 'Tree Hole' : language === 'ko' ? '트리 홀' : 'Lỗ cây'}
          </h1>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Share2 className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-md w-full mx-auto overflow-auto pb-20">
        {/* 内容区域 */}
        <div className={`bg-gradient-to-br ${getMoodGradient(item.mood)} p-4`}>
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 bg-white/50 rounded-full flex items-center justify-center">
              <UserX className="w-6 h-6 text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-purple-600 font-bold mb-1">{language === 'zh' ? '匿名用户' : 'Anonymous'}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{item.time}</span>
              </div>
            </div>
            <span className="text-3xl">{getMoodEmoji(item.mood)}</span>
          </div>
          
          <div className="bg-white/70 rounded-xl p-4 mb-4">
            <p className="text-gray-800 leading-relaxed">
              {item.fullContent?.[language] || item.content?.[language] || '内容加载中...'}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <button 
                onClick={() => setIsLiked(!isLiked)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/50 rounded-full hover:bg-white/70 transition-all"
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
                <span className="text-sm font-bold text-gray-700">{item.likes + (isLiked ? 1 : 0)}</span>
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/50 rounded-full hover:bg-white/70 transition-all">
                <MessageCircle className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-bold text-gray-700">{item.comments}</span>
              </button>
            </div>
            <button 
              onClick={() => setIsSaved(!isSaved)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/50 rounded-full hover:bg-white/70 transition-all"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-yellow-500 text-yellow-500' : 'text-gray-500'}`} />
              <span className="text-sm font-bold text-gray-700">{language === 'zh' ? '收藏' : 'Save'}</span>
            </button>
          </div>
        </div>

        {/* 评论区 */}
        <div className="bg-white p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-purple-600" />
            {language === 'zh' ? '评论区' : 'Comments'} ({comments.length})
          </h3>
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <UserX className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-purple-600 font-bold">{language === 'zh' ? '匿名' : 'Anon'}</span>
                      <span className="text-[10px] text-gray-400">{comment.time}</span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content[language]}</p>
                    <button className="flex items-center gap-1 mt-1 text-xs text-gray-400 hover:text-red-500 transition-colors">
                      <Heart className="w-3 h-3" />
                      <span>{comment.likes}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom Comment Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={language === 'zh' ? '写下你的评论...' : 'Write a comment...'}
            className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button 
            onClick={handleSendComment}
            className="p-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full hover:opacity-90 active:scale-95 transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
