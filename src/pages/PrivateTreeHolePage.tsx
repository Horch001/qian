import React, { useState, useMemo, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, ChevronDown, ChevronUp, Lock, UserX, Shield, MessageSquare, Clock, Bookmark } from 'lucide-react';
import { Language, Translations } from '../types';
import { treeHoleApi } from '../services/api';

interface TreeHoleItem {
  id: string;
  content: string;
  likes: number;
  comments: number;
  createdAt: string;
  isAnonymous: boolean;
}

export const PrivateTreeHolePage: React.FC = () => {
  const { language } = useOutletContext<{ language: Language; translations: Translations }>();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('latest');
  const [confessions, setConfessions] = useState<TreeHoleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 从后端加载树洞数据
  useEffect(() => {
    const loadTreeHoles = async () => {
      try {
        const data = await treeHoleApi.getTreeHoles(1, 50);
        setConfessions(data.items.map((item: any) => ({
          id: item.id,
          content: item.content,
          likes: item.likes,
          comments: item._count?.comments || 0,
          createdAt: item.createdAt,
          isAnonymous: item.isAnonymous,
        })));
      } catch (error) {
        console.error('加载树洞失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTreeHoles();
  }, []);

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
      default: return sorted;
    }
  }, [sortBy, confessions]);

  // 格式化时间
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

  const goToDetail = (confession: any) => {
    navigate('/tree-hole-detail', { state: { item: confession } });
  };
  const [isPostExpanded, setIsPostExpanded] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [selectedMood, setSelectedMood] = useState('neutral');

  const handlePost = async () => {
    if (!postContent.trim()) {
      alert(language === 'zh' ? '请输入内容' : 'Please enter content');
      return;
    }
    
    try {
      const newTreeHole = await treeHoleApi.createTreeHole({
        content: postContent,
        isAnonymous: true,
      });
      
      setConfessions([{
        id: newTreeHole.id,
        content: newTreeHole.content,
        likes: 0,
        comments: 0,
        createdAt: newTreeHole.createdAt,
        isAnonymous: true,
      }, ...confessions]);
      
      setPostContent('');
      setIsPostExpanded(false);
      setSelectedMood('neutral');
    } catch (error: any) {
      alert(error.message || getText({ zh: '发布失败', en: 'Post failed', ko: '게시 실패', vi: 'Đăng thất bại' }));
    }
  };

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
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : sortedConfessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {getText({ zh: '暂无内容，快来发布第一条吧！', en: 'No posts yet, be the first!', ko: '아직 게시물이 없습니다!', vi: 'Chưa có bài đăng nào!' })}
          </div>
        ) : sortedConfessions.map((confession) => (
          <div 
            key={confession.id} 
            onClick={() => goToDetail(confession)}
            className={`bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 rounded-xl p-3 border shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer`}
          >
            <div className="flex items-start gap-2 mb-2">
              <span className="text-2xl">💭</span>
              <p className="text-gray-700 text-sm flex-1 leading-relaxed">{confession.content}</p>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{formatTime(confession.createdAt)}</span>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      await treeHoleApi.likeTreeHole(confession.id);
                      setConfessions(prev => prev.map(c => 
                        c.id === confession.id ? { ...c, likes: c.likes + 1 } : c
                      ));
                    } catch (error) {
                      console.error('点赞失败:', error);
                    }
                  }}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/50 transition-all group"
                >
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
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-gray-600">{getText({ zh: '心情', en: 'Mood', ko: '기분', vi: 'Tâm trạng' })}:</span>
              <div className="flex gap-2">
                {[
                  { value: 'happy', emoji: '😊' },
                  { value: 'neutral', emoji: '😐' },
                  { value: 'sad', emoji: '😔' },
                ].map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => setSelectedMood(mood.value)}
                    className={`text-2xl p-1 rounded-lg transition-all ${selectedMood === mood.value ? 'bg-purple-200 scale-110' : 'hover:bg-gray-100'}`}
                  >
                    {mood.emoji}
                  </button>
                ))}
              </div>
            </div>
            <button 
              onClick={handlePost}
              className="mt-3 w-full px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:from-red-700 hover:to-red-600 font-bold text-sm shadow-md hover:shadow-lg active:scale-95 transition-all"
            >
              {getText({ zh: '发布', en: 'Post', ko: '게시', vi: 'Đăng' })}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
