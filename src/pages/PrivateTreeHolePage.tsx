import React, { useState, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, ChevronDown, ChevronUp, Lock, UserX, Shield, MessageSquare, Clock, Bookmark } from 'lucide-react';
import { Language, Translations } from '../types';

export const PrivateTreeHolePage: React.FC = () => {
  const { language } = useOutletContext<{ language: Language; translations: Translations }>();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('latest');
  const [confessions] = useState([
    { id: '1', content: { zh: '工作压力太大了...', en: 'Too much work stress...', ko: '일 스트레스가 너무 크다...', vi: 'Áp lực công việc quá lớn...' }, fullContent: { zh: '工作压力太大了，每天加班到很晚，感觉身体和精神都快撑不住了。有时候真的很想放弃，但是又不知道该怎么办...', en: 'Too much work stress, working overtime every day until late, feeling like my body and mind can barely hold on. Sometimes I really want to give up, but I don\'t know what to do...', ko: '일 스트레스가 너무 크다, 매일 야근하고...', vi: 'Áp lực công việc quá lớn, làm thêm giờ mỗi ngày...' }, time: '2小时前', likes: 234, comments: 12, mood: 'sad' },
    { id: '2', content: { zh: '最近心情不太好', en: 'Not feeling great lately', ko: '요즘 기분이 좋지 않다', vi: 'Tâm trạng gần đây không tốt' }, fullContent: { zh: '最近心情不太好，也说不上来是什么原因，就是感觉很低落，什么都不想做。希望这种状态能快点过去...', en: 'Not feeling great lately, can\'t really say why, just feeling down and don\'t want to do anything. Hope this state passes soon...', ko: '요즘 기분이 좋지 않다...', vi: 'Tâm trạng gần đây không tốt...' }, time: '5小时前', likes: 456, comments: 23, mood: 'neutral' },
    { id: '3', content: { zh: '今天遇到了一件很开心的事', en: 'Something happy happened today', ko: '오늘 행복한 일이 있었다', vi: 'Hôm nay có chuyện vui' }, fullContent: { zh: '今天遇到了一件很开心的事！在路上遇到了多年不见的老朋友，我们聊了很久，感觉时光仿佛回到了从前。生活中还是有很多美好的事情值得期待的！', en: 'Something happy happened today! Met an old friend I haven\'t seen in years on the street, we talked for a long time, felt like time went back to the old days. There are still many beautiful things in life worth looking forward to!', ko: '오늘 행복한 일이 있었다...', vi: 'Hôm nay có chuyện vui...' }, time: '8小时前', likes: 789, comments: 45, favorites: 156, mood: 'happy' },
  ]);

  const sortOptions = [
    { value: 'latest', label: { zh: '最新', en: 'Latest', ko: '최신', vi: 'Mới nhất' } },
    { value: 'hot', label: { zh: '最热', en: 'Hottest', ko: '인기', vi: 'Nóng nhất' } },
    { value: 'comments', label: { zh: '评论最多', en: 'Most Comments', ko: '댓글 많은순', vi: 'Nhiều bình luận' } },
    { value: 'likes', label: { zh: '点赞最多', en: 'Most Likes', ko: '좋아요 많은순', vi: 'Nhiều thích' } },
    { value: 'favorites', label: { zh: '收藏最多', en: 'Most Saved', ko: '저장 많은순', vi: 'Nhiều lưu' } },
  ];

  const sortedConfessions = useMemo(() => {
    const sorted = [...confessions];
    switch (sortBy) {
      case 'hot': return sorted.sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments));
      case 'comments': return sorted.sort((a, b) => b.comments - a.comments);
      case 'likes': return sorted.sort((a, b) => b.likes - a.likes);
      case 'favorites': return sorted.sort((a, b) => (b.favorites || 0) - (a.favorites || 0));
      default: return sorted;
    }
  }, [sortBy, confessions]);

  const goToDetail = (confession: any) => {
    navigate('/tree-hole-detail', { state: { item: confession } });
  };
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
    <div className="space-y-1">
      {/* 特色功能 */}
      <div className="grid grid-cols-4 gap-1.5">
        {features.map((feature, idx) => (
          <div key={idx} className="flex flex-col items-center gap-0.5 py-1">
            <feature.icon className="w-4 h-4 text-purple-600" strokeWidth={2.5} />
            <span className="text-[9px] text-gray-700 font-bold text-center leading-tight">{feature.text[language]}</span>
          </div>
        ))}
      </div>

      {/* 筛选下拉框 */}
      <div className="relative">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 appearance-none cursor-pointer focus:outline-none focus:border-purple-400"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label[language]}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      {/* 帖子列表 */}
      <div className="space-y-2">
        {sortedConfessions.map((confession) => (
          <div 
            key={confession.id} 
            onClick={() => goToDetail(confession)}
            className={`bg-gradient-to-br ${getMoodGradient(confession.mood)} rounded-xl p-3 border shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer`}
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
                <button className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/50 transition-all group">
                  <Bookmark className="w-3.5 h-3.5 text-gray-500 group-hover:text-yellow-500 group-hover:fill-yellow-500 transition-all" />
                  <span className="text-gray-600 font-bold text-[10px]">{language === 'zh' ? '收藏' : 'Save'}</span>
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
