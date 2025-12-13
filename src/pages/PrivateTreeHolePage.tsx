import React, { useState, useMemo, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, ChevronDown, ChevronUp, Lock, UserX, Shield, MessageSquare, Clock, Bookmark, Trash2, Reply, Bell, CheckCircle, XCircle } from 'lucide-react';
import { Language, Translations } from '../types';
import { treeHoleApi } from '../services/api';

interface TreeHoleItem {
  id: string;
  content: string;
  likes: number;
  comments: number;
  favorites: number;
  createdAt: string;
  isAnonymous: boolean;
  isLiked?: boolean;
  isFavorited?: boolean;
}

export const PrivateTreeHolePage: React.FC = () => {
  const { language } = useOutletContext<{ language: Language; translations: Translations }>();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('latest');
  const [confessions, setConfessions] = useState<TreeHoleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [isPostExpanded, setIsPostExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'post' | 'notifications' | 'reviewerCenter' | 'myPosts' | 'myFavorites' | 'myComments'>('post');
  const [postContent, setPostContent] = useState('');
  const [selectedMood, setSelectedMood] = useState('neutral');
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [treeHoleComments, setTreeHoleComments] = useState<{ [key: string]: any[] }>({});
  const [myPosts, setMyPosts] = useState<TreeHoleItem[]>([]);
  const [myFavorites, setMyFavorites] = useState<TreeHoleItem[]>([]);
  const [myComments, setMyComments] = useState<any[]>([]);
  const [isLoadingMy, setIsLoadingMy] = useState(false);
  const [expandedMyCards, setExpandedMyCards] = useState<Set<string>>(new Set());
  const [replyTarget, setReplyTarget] = useState<{ treeHoleId: string; commentId: string; commentContent: string } | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [reviewerInfo, setReviewerInfo] = useState<any>(null);
  const [reviewTasks, setReviewTasks] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 获取当前用户ID
  const getCurrentUserId = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).id : null;
  };

  // 加载通知列表
  const loadNotifications = async () => {
    setIsLoadingMy(true);
    try {
      const data = await treeHoleApi.getNotifications();
      setNotifications(data);
      // 同时更新未读数量
      const unread = data.filter((n: any) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('加载通知失败:', error);
    } finally {
      setIsLoadingMy(false);
    }
  };

  // 标记通知为已读
  const markAsRead = async (notificationId: string) => {
    try {
      await treeHoleApi.markNotificationAsRead(notificationId);
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  };

  // 加载验证员信息
  const loadReviewerInfo = async () => {
    try {
      const data = await treeHoleApi.getReviewerInfo();
      setReviewerInfo(data);
    } catch (error) {
      console.error('加载验证员信息失败:', error);
    }
  };

  // 加载审核任务
  const loadReviewTasks = async () => {
    setIsLoadingMy(true);
    try {
      const data = await treeHoleApi.getReviewTasks();
      setReviewTasks(data);
    } catch (error) {
      console.error('加载审核任务失败:', error);
    } finally {
      setIsLoadingMy(false);
    }
  };

  // 申请成为验证员
  const handleApplyReviewer = async () => {
    if (!confirm(getText({ zh: '成为验证员需要冻结100π保证金，确定要申请吗？', en: 'Becoming a reviewer requires a 100π deposit. Continue?', ko: '검토자가 되려면 100π 보증금이 필요합니다. 계속하시겠습니까?', vi: 'Trở thành người đánh giá cần đặt cọc 100π. Tiếp tục?' }))) {
      return;
    }
    try {
      await treeHoleApi.applyReviewer();
      alert(getText({ zh: '申请成功！', en: 'Application successful!', ko: '신청 성공!', vi: 'Đăng ký thành công!' }));
      loadReviewerInfo();
    } catch (error: any) {
      alert(error.message || getText({ zh: '申请失败', en: 'Application failed', ko: '신청 실패', vi: 'Đăng ký thất bại' }));
    }
  };

  // 退出验证员
  const handleQuitReviewer = async () => {
    if (!confirm(getText({ zh: '确定要退出验证员吗？保证金将解冻退回。', en: 'Quit reviewer? Deposit will be refunded.', ko: '검토자를 그만두시겠습니까? 보증금이 환불됩니다.', vi: 'Thoát người đánh giá? Tiền đặt cọc sẽ được hoàn lại.' }))) {
      return;
    }
    try {
      await treeHoleApi.quitReviewer();
      alert(getText({ zh: '已退出验证员', en: 'Quit successfully', ko: '성공적으로 종료', vi: 'Thoát thành công' }));
      setReviewerInfo(null);
    } catch (error: any) {
      alert(error.message || getText({ zh: '退出失败', en: 'Quit failed', ko: '종료 실패', vi: 'Thoát thất bại' }));
    }
  };

  // 提交审核投票
  const handleSubmitVote = async (voteId: string, vote: 'APPROVE' | 'REJECT', rejectReason?: string) => {
    try {
      await treeHoleApi.submitVote(voteId, { vote, rejectReason });
      alert(getText({ zh: '投票已提交', en: 'Vote submitted', ko: '투표 제출됨', vi: 'Đã gửi phiếu bầu' }));
      loadReviewTasks();
    } catch (error: any) {
      alert(error.message || getText({ zh: '投票失败', en: 'Vote failed', ko: '투표 실패', vi: 'Bỏ phiếu thất bại' }));
    }
  };

  // 删除评论
  const handleDeleteComment = async (commentId: string, treeHoleId: string) => {
    if (!confirm(getText({ zh: '确定要删除这条评论吗？', en: 'Delete this comment?', ko: '이 댓글을 삭제하시겠습니까?', vi: 'Xóa bình luận này?' }))) {
      return;
    }
    
    try {
      await treeHoleApi.deleteComment(commentId);
      // 从评论列表中移除
      setTreeHoleComments(prev => ({
        ...prev,
        [treeHoleId]: (prev[treeHoleId] || []).filter(c => c.id !== commentId)
      }));
      // 更新评论数
      setConfessions(prev => prev.map(c =>
        c.id === treeHoleId ? { ...c, comments: c.comments - 1 } : c
      ));
      setMyPosts(prev => prev.map(p =>
        p.id === treeHoleId ? { ...p, comments: p.comments - 1 } : p
      ));
      setMyFavorites(prev => prev.map(p =>
        p.id === treeHoleId ? { ...p, comments: p.comments - 1 } : p
      ));
    } catch (error: any) {
      alert(error.message || getText({ zh: '删除失败', en: 'Delete failed', ko: '삭제 실패', vi: 'Xóa thất bại' }));
    }
  };

  // 从后端加载树洞数据
  useEffect(() => {
    const loadTreeHoles = async () => {
      try {
        const data = await treeHoleApi.getTreeHoles(1, 50);
        // 从 localStorage 读取点赞和收藏状态
        const likedPosts = JSON.parse(localStorage.getItem('likedTreeHoles') || '{}');
        const favoritedPosts = JSON.parse(localStorage.getItem('favoritedTreeHoles') || '{}');
        
        setConfessions(data.items.map((item: any) => ({
          id: item.id,
          content: item.content,
          likes: item.likes,
          comments: item._count?.comments || 0,
          favorites: item.Favorite || 0,
          createdAt: item.createdAt,
          isAnonymous: item.isAnonymous,
          isLiked: likedPosts[item.id] || false,
          isFavorited: favoritedPosts[item.id] || false,
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

  // 加载评论
  const loadComments = async (treeHoleId: string) => {
    try {
      const data = await treeHoleApi.getTreeHole(treeHoleId);
      setTreeHoleComments(prev => ({
        ...prev,
        [treeHoleId]: data.comments || []
      }));
    } catch (error) {
      console.error('加载评论失败:', error);
    }
  };

  // 发送评论
  const handleComment = async (treeHoleId: string) => {
    const content = commentInputs[treeHoleId]?.trim();
    if (!content) {
      alert(getText({ zh: '请输入评论内容', en: 'Please enter comment', ko: '댓글을 입력하세요', vi: 'Vui lòng nhập bình luận' }));
      return;
    }

    try {
      const parentId = replyTarget && replyTarget.treeHoleId === treeHoleId ? replyTarget.commentId : undefined;
      
      const newComment = await treeHoleApi.commentTreeHole(treeHoleId, {
        content,
        isAnonymous: true,
        parentId
      });

      // 重新加载评论
      await loadComments(treeHoleId);

      // 更新评论数
      setConfessions(prev => prev.map(c =>
        c.id === treeHoleId ? { ...c, comments: c.comments + 1 } : c
      ));

      // 清空输入框和回复目标
      setCommentInputs(prev => ({ ...prev, [treeHoleId]: '' }));
      setReplyTarget(null);
    } catch (error: any) {
      alert(error.message || getText({ zh: '评论失败', en: 'Comment failed', ko: '댓글 실패', vi: 'Bình luận thất bại' }));
    }
  };

  const handlePost = async () => {
    if (!postContent.trim()) {
      alert(getText({ zh: '请输入内容', en: 'Please enter content', ko: '내용을 입력하세요', vi: 'Vui lòng nhập nội dung' }));
      return;
    }

    if (!confirm(getText({ zh: '发布帖子需要支付1π并等待审核，确定要发布吗？', en: 'Posting requires 1π and review. Continue?', ko: '게시하려면 1π가 필요하고 검토가 필요합니다. 계속하시겠습니까?', vi: 'Đăng bài cần 1π và đánh giá. Tiếp tục?' }))) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await treeHoleApi.submitForReview({
        content: postContent,
        isAnonymous: true,
      });
      
      alert(getText({ zh: '帖子已提交审核，审核通过后将自动发布', en: 'Post submitted for review', ko: '게시물이 검토를 위해 제출되었습니다', vi: 'Bài đăng đã được gửi để đánh giá' }));
      
      setPostContent('');
      setIsPostExpanded(false);
    } catch (error: any) {
      alert(error.message || getText({ zh: '提交失败', en: 'Submit failed', ko: '제출 실패', vi: 'Gửi thất bại' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getText = (obj: { [key: string]: string }) => obj[language] || obj.zh;

  // 加载我的帖子
  const loadMyPosts = async () => {
    setIsLoadingMy(true);
    try {
      const data = await treeHoleApi.getMyPosts();
      const likedPosts = JSON.parse(localStorage.getItem('likedTreeHoles') || '{}');
      const favoritedPosts = JSON.parse(localStorage.getItem('favoritedTreeHoles') || '{}');
      setMyPosts(data.map((item: any) => ({
        id: item.id,
        content: item.content,
        likes: item.likes,
        comments: item._count?.comments || 0,
        favorites: item.Favorite || 0,
        createdAt: item.createdAt,
        isAnonymous: item.isAnonymous,
        isLiked: likedPosts[item.id] || false,
        isFavorited: favoritedPosts[item.id] || false,
      })));
    } catch (error) {
      console.error('加载我的帖子失败:', error);
    } finally {
      setIsLoadingMy(false);
    }
  };

  // 加载我的收藏
  const loadMyFavorites = async () => {
    setIsLoadingMy(true);
    try {
      const data = await treeHoleApi.getMyFavorites();
      const likedPosts = JSON.parse(localStorage.getItem('likedTreeHoles') || '{}');
      const favoritedPosts = JSON.parse(localStorage.getItem('favoritedTreeHoles') || '{}');
      setMyFavorites(data.map((item: any) => ({
        id: item.id,
        content: item.content,
        likes: item.likes,
        comments: item._count?.comments || 0,
        favorites: item.Favorite || 0,
        createdAt: item.createdAt,
        isAnonymous: item.isAnonymous,
        isLiked: likedPosts[item.id] || false,
        isFavorited: favoritedPosts[item.id] || false,
      })));
    } catch (error) {
      console.error('加载我的收藏失败:', error);
    } finally {
      setIsLoadingMy(false);
    }
  };

  // 加载我的评论
  const loadMyComments = async () => {
    setIsLoadingMy(true);
    try {
      const data = await treeHoleApi.getMyComments();
      setMyComments(data);
    } catch (error) {
      console.error('加载我的评论失败:', error);
    } finally {
      setIsLoadingMy(false);
    }
  };

  const features = [
    { icon: UserX, text: { zh: '完全匿名', en: 'Anonymous', ko: '완전 익명', vi: 'Hoàn toàn ẩn danh' } },
    { icon: Lock, text: { zh: '隐私保护', en: 'Privacy Protected', ko: '개인정보 보호', vi: 'Bảo vệ riêng tư' } },
    { icon: Shield, text: { zh: '安全可靠', en: 'Safe & Secure', ko: '안전 신뢰', vi: 'An toàn tin cậy' } },
    { icon: MessageSquare, text: { zh: '自由表达', en: 'Free Expression', ko: '자유 표현', vi: 'Tự do bày tỏ' } },
  ];

  return (
    <div className="pb-20">
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
          ) : sortedConfessions.map((confession) => {
            const isExpanded = expandedCards.has(confession.id);
            return (
              <div 
                key={confession.id} 
                className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 rounded-xl p-3 border shadow-sm hover:shadow-md transition-all duration-300 relative"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const isCurrentlyExpanded = expandedCards.has(confession.id);
                    setExpandedCards(prev => {
                      const newSet = new Set(prev);
                      if (isCurrentlyExpanded) {
                        newSet.delete(confession.id);
                      } else {
                        newSet.add(confession.id);
                      }
                      return newSet;
                    });
                    // 同时控制评论区
                    setExpandedComments(prev => {
                      const newSet = new Set(prev);
                      if (isCurrentlyExpanded) {
                        newSet.delete(confession.id);
                      } else {
                        newSet.add(confession.id);
                        // 展开时加载评论
                        if (!treeHoleComments[confession.id]) {
                          loadComments(confession.id);
                        }
                      }
                      return newSet;
                    });
                  }}
                  className="absolute top-2 right-2 p-1 hover:bg-white/50 rounded-lg transition-all z-10"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-purple-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-purple-600" />
                  )}
                </button>
                <div>
                  <div>
                    <div className="mb-2 pr-8">
                      <p className={`text-gray-700 text-sm leading-relaxed break-all indent-8 ${!isExpanded ? 'line-clamp-2' : ''}`}>
                        {confession.content}
                      </p>
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
                              const result: any = await treeHoleApi.likeTreeHole(confession.id);
                              setConfessions(prev => prev.map(c => {
                                if (c.id === confession.id) {
                                  const newLikedState = result.liked;
                                  
                                  // 保存到 localStorage
                                  const likedPosts = JSON.parse(localStorage.getItem('likedTreeHoles') || '{}');
                                  if (newLikedState) {
                                    likedPosts[confession.id] = true;
                                  } else {
                                    delete likedPosts[confession.id];
                                  }
                                  localStorage.setItem('likedTreeHoles', JSON.stringify(likedPosts));
                                  
                                  return {
                                    ...c,
                                    likes: newLikedState ? c.likes + 1 : c.likes - 1,
                                    isLiked: newLikedState
                                  };
                                }
                                return c;
                              }));
                            } catch (error) {
                              console.error('点赞失败:', error);
                            }
                          }}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/50 transition-all group"
                        >
                          <Heart className={`w-3.5 h-3.5 transition-all ${confession.isLiked ? 'text-red-500 fill-red-500' : 'text-gray-500 group-hover:text-red-500 group-hover:fill-red-500'}`} />
                          <span className="text-gray-600 font-bold">{confession.likes}</span>
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            const isCommentExpanded = expandedComments.has(confession.id);
                            setExpandedComments(prev => {
                              const newSet = new Set(prev);
                              if (isCommentExpanded) {
                                newSet.delete(confession.id);
                              } else {
                                newSet.add(confession.id);
                                // 展开时加载评论
                                if (!treeHoleComments[confession.id]) {
                                  loadComments(confession.id);
                                }
                              }
                              return newSet;
                            });
                          }}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/50 transition-all group"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-gray-500 group-hover:text-purple-500 transition-all" />
                          <span className="text-gray-600 font-bold">{confession.comments}</span>
                        </button>
                        <button 
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              const result: any = await treeHoleApi.favoriteTreeHole(confession.id);
                              setConfessions(prev => prev.map(c => {
                                if (c.id === confession.id) {
                                  const newFavoritedState = result.favorited;
                                  
                                  // 保存到 localStorage
                                  const favoritedPosts = JSON.parse(localStorage.getItem('favoritedTreeHoles') || '{}');
                                  if (newFavoritedState) {
                                    favoritedPosts[confession.id] = true;
                                  } else {
                                    delete favoritedPosts[confession.id];
                                  }
                                  localStorage.setItem('favoritedTreeHoles', JSON.stringify(favoritedPosts));
                                  
                                  return {
                                    ...c,
                                    favorites: newFavoritedState ? c.favorites + 1 : c.favorites - 1,
                                    isFavorited: newFavoritedState
                                  };
                                }
                                return c;
                              }));
                            } catch (error) {
                              console.error('收藏失败:', error);
                            }
                          }}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/50 transition-all group"
                        >
                          <Bookmark className={`w-3.5 h-3.5 transition-all ${confession.isFavorited ? 'text-yellow-500 fill-yellow-500' : 'text-gray-500 group-hover:text-yellow-500'}`} />
                          <span className="text-gray-600 font-bold">{confession.favorites}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* 展开时显示评论区 */}
                  {expandedComments.has(confession.id) && (
                    <div className="mt-3 pt-3 border-t border-purple-200" onClick={(e) => e.stopPropagation()}>
                      <div className="text-xs text-gray-600 mb-2 font-bold">
                        {getText({ zh: '评论区', en: 'Comments', ko: '댓글', vi: 'Bình luận' })} ({confession.comments})
                      </div>
                      
                      {/* 评论列表 */}
                      <div className="space-y-2 mb-3 max-h-60 overflow-y-auto">
                        {treeHoleComments[confession.id]?.length > 0 ? (
                          treeHoleComments[confession.id].map((comment: any, idx: number) => {
                            const currentUserId = getCurrentUserId();
                            const canDelete = currentUserId && (comment.userId === currentUserId);
                            return (
                              <div key={idx} className="bg-white/50 rounded-lg p-2 relative group">
                                <div className="flex items-center gap-1 flex-wrap">
                                  <div className="text-xs text-gray-700 break-all pr-6">{comment.content}</div>
                                  {comment.isAuthor && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-purple-100 text-purple-600 font-bold">
                                      {getText({ zh: '作者', en: 'Author', ko: '작성자', vi: 'Tác giả' })}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                                  <span>{formatTime(comment.createdAt)}</span>
                                  <button
                                    onClick={() => {
                                      setReplyTarget({ treeHoleId: confession.id, commentId: comment.id, commentContent: comment.content });
                                      const input = document.querySelector(`input[placeholder*="${getText({ zh: '写评论', en: 'Write a comment', ko: '댓글 作성', vi: 'Viết bình luận' })}"]`) as HTMLInputElement;
                                      if (input) {
                                        input.focus();
                                        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                      }
                                    }}
                                    className="flex items-center gap-0.5 text-purple-500 hover:text-purple-600 transition-all"
                                  >
                                    <Reply className="w-3 h-3" />
                                    <span>{getText({ zh: '回复', en: 'Reply', ko: '답글', vi: 'Trả lời' })}</span>
                                  </button>
                                  {comment.replies && comment.replies.length > 0 && (
                                    <button
                                      onClick={() => {
                                        setExpandedReplies(prev => {
                                          const newSet = new Set(prev);
                                          if (newSet.has(comment.id)) {
                                            newSet.delete(comment.id);
                                          } else {
                                            newSet.add(comment.id);
                                          }
                                          return newSet;
                                        });
                                      }}
                                      className="text-purple-500 hover:text-purple-600"
                                    >
                                      {expandedReplies.has(comment.id) 
                                        ? getText({ zh: '收起回复', en: 'Hide replies', ko: '답글 숨기기', vi: 'Ẩn trả lời' })
                                        : `${getText({ zh: '展开', en: 'Show', ko: '펼치기', vi: 'Hiện' })} ${comment.replies.length} ${getText({ zh: '条回复', en: 'replies', ko: '개 답글', vi: 'trả lời' })}`
                                      }
                                    </button>
                                  )}
                                </div>
                                {/* 显示回复 */}
                                {comment.replies && comment.replies.length > 0 && expandedReplies.has(comment.id) && (
                                  <div className="mt-2 ml-4 space-y-2 border-l-2 border-purple-200 pl-2">
                                    {comment.replies.map((reply: any) => (
                                      <div key={reply.id} className="bg-white/30 rounded p-2">
                                        <div className="flex items-center gap-1 flex-wrap">
                                          <div className="text-xs text-gray-700 break-all">{reply.content}</div>
                                          {reply.isAuthor && (
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-purple-100 text-purple-600 font-bold">
                                              {getText({ zh: '作者', en: 'Author', ko: '작성자', vi: 'Tác giả' })}
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                                          <span>{formatTime(reply.createdAt)}</span>
                                          <button
                                            onClick={() => {
                                              setReplyTarget({ treeHoleId: confession.id, commentId: comment.id, commentContent: reply.content });
                                              const input = document.querySelector(`input[placeholder*="${getText({ zh: '写评论', en: 'Write a comment', ko: '댓글 작성', vi: 'Viết bình luận' })}"]`) as HTMLInputElement;
                                              if (input) {
                                                input.focus();
                                                input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                              }
                                            }}
                                            className="flex items-center gap-0.5 text-purple-500 hover:text-purple-600 transition-all"
                                          >
                                            <Reply className="w-3 h-3" />
                                            <span>{getText({ zh: '回复', en: 'Reply', ko: '답글', vi: 'Trả lời' })}</span>
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {canDelete && (
                                  <button
                                    onClick={() => handleDeleteComment(comment.id, confession.id)}
                                    className="absolute top-2 right-2 p-1 hover:bg-red-100 rounded transition-all"
                                  >
                                    <Trash2 className="w-3 h-3 text-red-500" />
                                  </button>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-xs text-gray-400 text-center py-2">
                            {getText({ zh: '暂无评论', en: 'No comments', ko: '댓글 없음', vi: 'Chưa có bình luận' })}
                          </div>
                        )}
                      </div>

                      {/* 评论输入框 */}
                      <div>
                        {replyTarget && replyTarget.treeHoleId === confession.id && (
                          <div className="flex items-center gap-2 mb-2 text-xs bg-purple-50 p-2 rounded">
                            <span className="text-gray-600">{getText({ zh: '回复:', en: 'Reply to:', ko: '답글:', vi: 'Trả lời:' })}</span>
                            <span className="text-gray-700 flex-1 truncate">{replyTarget.commentContent}</span>
                            <button
                              onClick={() => setReplyTarget(null)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={commentInputs[confession.id] || ''}
                            onChange={(e) => setCommentInputs(prev => ({ ...prev, [confession.id]: e.target.value }))}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleComment(confession.id);
                              }
                            }}
                            placeholder={getText({ zh: '写评论...', en: 'Write a comment...', ko: '댓글 작성...', vi: 'Viết bình luận...' })}
                            className="flex-1 px-2 py-1.5 text-xs border border-purple-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400"
                          />
                          <button
                            onClick={() => handleComment(confession.id)}
                            className="px-3 py-1.5 bg-purple-500 text-white text-xs rounded-lg hover:bg-purple-600 transition-all"
                          >
                            {getText({ zh: '发送', en: 'Send', ko: '전송', vi: 'Gửi' })}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 底部固定按钮 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4">
        <div className="w-full max-w-md">
          {!isPostExpanded ? (
            <button
              onClick={async () => {
                setIsPostExpanded(true);
                setActiveTab('post');
                // 加载未读通知数量
                try {
                  const data = await treeHoleApi.getUnreadNotificationCount();
                  setUnreadCount(data.count);
                } catch (error) {
                  console.error('加载未读通知数量失败:', error);
                }
              }}
              className="w-full px-4 py-3 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 transition-all relative rounded-t-xl shadow-lg"
            >
              <MessageSquare className="w-5 h-5 text-white" />
              <span className="font-bold text-white text-base">
                {getText({ zh: '我的树洞', en: 'My Tree Hole', ko: '내 트리 홀', vi: 'Lỗ cây của tôi' })}
              </span>
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          ) : (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 h-[70vh] flex flex-col rounded-t-xl shadow-lg border-t border-x border-purple-200">
              {/* 标题栏 */}
              <div className="flex items-center justify-between p-4 pb-2">
                <h3 className="font-bold text-gray-800">
                  {getText({ zh: '我的树洞', en: 'My Tree Hole', ko: '내 트리 홀', vi: 'Lỗ cây của tôi' })}
                </h3>
                <button
                  onClick={() => setIsPostExpanded(false)}
                  className="text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-lg p-1 transition-all"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>

              {/* 选项卡 */}
              <div className="flex border-b border-purple-200 px-1 overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => setActiveTab('post')}
                  className={`flex-shrink-0 px-2 py-2 text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'post' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
                >
                  {getText({ zh: '发布', en: 'Post', ko: '게시', vi: 'Đăng' })}
                </button>
                <button
                  onClick={() => {
                    setActiveTab('notifications');
                    loadNotifications();
                  }}
                  className={`relative flex-shrink-0 px-2 py-2 text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'notifications' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
                >
                  {getText({ zh: '通知', en: 'Notify', ko: '알림', vi: 'Thông báo' })}
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-0.5 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => {
                    setActiveTab('reviewerCenter');
                    loadReviewerInfo();
                    loadReviewTasks();
                  }}
                  className={`flex-shrink-0 px-2 py-2 text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'reviewerCenter' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
                >
                  {getText({ zh: '验证员', en: 'Reviewer', ko: '검토자', vi: 'Đánh giá viên' })}
                </button>
                <button
                  onClick={() => {
                    setActiveTab('myPosts');
                    loadMyPosts();
                  }}
                  className={`flex-shrink-0 px-2 py-2 text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'myPosts' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
                >
                  {getText({ zh: '我的帖子', en: 'Posts', ko: '게시물', vi: 'Bài viết' })}
                </button>
                <button
                  onClick={() => {
                    setActiveTab('myFavorites');
                    loadMyFavorites();
                  }}
                  className={`flex-shrink-0 px-2 py-2 text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'myFavorites' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
                >
                  {getText({ zh: '我的收藏', en: 'Saved', ko: '저장', vi: 'Đã lưu' })}
                </button>
                <button
                  onClick={() => {
                    setActiveTab('myComments');
                    loadMyComments();
                  }}
                  className={`flex-shrink-0 px-2 py-2 text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'myComments' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
                >
                  {getText({ zh: '我的评论', en: 'Comments', ko: '댓글', vi: 'Bình luận' })}
                </button>
              </div>

              {/* 内容区域 */}
              <div className="p-4 flex-1 flex flex-col overflow-y-auto">
                {activeTab === 'post' && (
                  <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder={getText({ 
                      zh: '分享你的想法...（禁止发布政治相关内容）', 
                      en: 'Share your thoughts... (No political content)', 
                      ko: '생각을 공유하세요... (정치 관련 콘텐츠 금지)', 
                      vi: 'Chia sẻ suy nghĩ... (Không có nội dung chính trị)' 
                    })}
                    className="w-full h-full px-3 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none text-sm bg-white shadow-inner"
                  />
                )}

                {activeTab === 'notifications' && (
                  <div className="space-y-2">
                    {isLoadingMy ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        {getText({ zh: '暂无通知', en: 'No notifications', ko: '알림 없음', vi: 'Không có thông báo' })}
                      </div>
                    ) : (
                      notifications.map((notification: any) => {
                        const getTitle = () => {
                          switch (language) {
                            case 'en': return notification.titleEn || notification.title;
                            case 'ko': return notification.titleKo || notification.title;
                            case 'vi': return notification.titleVi || notification.title;
                            default: return notification.title;
                          }
                        };
                        const getContent = () => {
                          switch (language) {
                            case 'en': return notification.contentEn || notification.content;
                            case 'ko': return notification.contentKo || notification.content;
                            case 'vi': return notification.contentVi || notification.content;
                            default: return notification.content;
                          }
                        };
                        return (
                          <div
                            key={notification.id}
                            onClick={() => {
                              markAsRead(notification.id);
                              setIsPostExpanded(false);
                              // 可以在这里添加跳转逻辑
                            }}
                            className={`bg-white rounded-lg p-3 border cursor-pointer transition-all hover:shadow-md ${
                              notification.isRead ? 'border-gray-200' : 'border-purple-300 bg-purple-50/50'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                                notification.type === 'COMMENT' ? 'bg-blue-100' : 
                                notification.type === 'REPLY' ? 'bg-green-100' : 
                                notification.type === 'TREEHOLE_APPROVED' ? 'bg-green-100' : 'bg-orange-100'
                              }`}>
                                {notification.type === 'COMMENT' ? (
                                  <MessageCircle className="w-4 h-4 text-blue-600" />
                                ) : notification.type === 'REPLY' ? (
                                  <Reply className="w-4 h-4 text-green-600" />
                                ) : notification.type === 'TREEHOLE_APPROVED' ? (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-orange-600" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h3 className={`text-xs font-bold ${
                                    notification.isRead ? 'text-gray-700' : 'text-purple-700'
                                  }`}>
                                    {getTitle()}
                                  </h3>
                                  {!notification.isRead && (
                                    <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 mb-1">
                                  {getContent()}
                                </p>
                                <p className="text-[10px] text-gray-400">
                                  {formatTime(notification.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {activeTab === 'reviewerCenter' && (
                  <div className="space-y-3">
                    {reviewerInfo ? (
                      <>
                        {/* 验证员信息卡片 */}
                        <div className="bg-white rounded-lg p-4 border border-purple-200">
                          <h3 className="text-sm font-bold text-gray-800 mb-3">
                            {getText({ zh: '验证员信息', en: 'Reviewer Info', ko: '검토자 정보', vi: 'Thông tin người đánh giá' })}
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">{getText({ zh: '保证金', en: 'Deposit', ko: '보증금', vi: 'Tiền đặt cọc' })}:</span>
                              <span className="font-bold text-purple-600">{reviewerInfo.depositAmount}π</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">{getText({ zh: '总审核数', en: 'Total Reviews', ko: '총 검토 수', vi: 'Tổng số đánh giá' })}:</span>
                              <span className="font-bold">{reviewerInfo.totalReviews}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">{getText({ zh: '通过数', en: 'Approved', ko: '승인 수', vi: 'Đã phê duyệt' })}:</span>
                              <span className="font-bold text-green-600">{reviewerInfo.approvedCount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">{getText({ zh: '拒绝数', en: 'Rejected', ko: '거부 수', vi: 'Đã từ chối' })}:</span>
                              <span className="font-bold text-red-600">{reviewerInfo.rejectedCount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">{getText({ zh: '准确率', en: 'Accuracy', ko: '정확도', vi: 'Độ chính xác' })}:</span>
                              <span className="font-bold text-blue-600">{reviewerInfo.accuracyRate.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">{getText({ zh: '状态', en: 'Status', ko: '상태', vi: 'Trạng thái' })}:</span>
                              <span className={`font-bold ${reviewerInfo.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-600'}`}>
                                {reviewerInfo.status === 'ACTIVE' ? getText({ zh: '活跃', en: 'Active', ko: '활성', vi: 'Hoạt động' }) : getText({ zh: '暂停', en: 'Paused', ko: '일시 중지', vi: 'Tạm dừng' })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 审核任务列表 */}
                        <div className="bg-white rounded-lg p-4 border border-purple-200">
                          <h3 className="text-sm font-bold text-gray-800 mb-3">
                            {getText({ zh: '待审核任务', en: 'Pending Tasks', ko: '대기 중인 작업', vi: 'Nhiệm vụ đang chờ' })} ({reviewTasks.length})
                          </h3>
                          {isLoadingMy ? (
                            <div className="text-center py-4">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
                            </div>
                          ) : reviewTasks.length === 0 ? (
                            <div className="text-center py-4 text-gray-500 text-xs">
                              {getText({ zh: '暂无审核任务', en: 'No tasks', ko: '작업 없음', vi: 'Không có nhiệm vụ' })}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {reviewTasks.map((task: any) => (
                                <div key={task.voteId} className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                                  <div className="mb-2">
                                    <p className="text-xs text-gray-700 break-all mb-2">{task.content}</p>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                      <Clock className="w-3 h-3" />
                                      <span>{getText({ zh: '提交', en: 'Submitted', ko: '제출', vi: 'Gửi' })}: {formatTime(task.createdAt)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-orange-600 mt-1">
                                      <Clock className="w-3 h-3" />
                                      <span>{getText({ zh: '超时', en: 'Expires', ko: '만료', vi: 'Hết hạn' })}: {formatTime(task.expiresAt)}</span>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                        if (confirm(getText({ zh: '确定通过这篇帖子吗？', en: 'Approve this post?', ko: '이 게시물을 승인하시겠습니까?', vi: 'Phê duyệt bài đăng này?' }))) {
                                          handleSubmitVote(task.voteId, 'APPROVE');
                                        }
                                      }}
                                      className="flex-1 px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 transition-all"
                                    >
                                      {getText({ zh: '✓ 通过', en: '✓ Approve', ko: '✓ 승인', vi: '✓ Duyệt' })}
                                    </button>
                                    <button
                                      onClick={() => {
                                        const reason = prompt(getText({ zh: '请输入拒绝原因：', en: 'Reject reason:', ko: '거부 이유:', vi: 'Lý do từ chối:' }));
                                        if (reason) {
                                          handleSubmitVote(task.voteId, 'REJECT', reason);
                                        }
                                      }}
                                      className="flex-1 px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-all"
                                    >
                                      {getText({ zh: '✗ 拒绝', en: '✗ Reject', ko: '✗ 거부', vi: '✗ Từ chối' })}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={handleQuitReviewer}
                          className="w-full px-4 py-2 bg-gray-500 text-white text-sm font-bold rounded-lg hover:bg-gray-600 transition-all"
                        >
                          {getText({ zh: '退出验证员', en: 'Quit Reviewer', ko: '검토자 종료', vi: 'Thoát người đánh giá' })}
                        </button>
                      </>
                    ) : (
                      <div className="bg-white rounded-lg p-4 border border-purple-200">
                        <h3 className="text-sm font-bold text-gray-800 mb-2">
                          {getText({ zh: '成为验证员', en: 'Become a Reviewer', ko: '검토자 되기', vi: 'Trở thành người đánh giá' })}
                        </h3>
                        <div className="space-y-2 text-xs text-gray-600 mb-4">
                          <p>• {getText({ zh: '需要冻结100π作为保证金', en: 'Requires 100π deposit', ko: '100π 보증금 필요', vi: 'Cần đặt cọc 100π' })}</p>
                          <p>• {getText({ zh: '审核通过的帖子可获得1π奖励', en: 'Earn 1π per approved post', ko: '승인된 게시물당 1π 획득', vi: 'Kiếm 1π mỗi bài được phê duyệt' })}</p>
                          <p>• {getText({ zh: '随机分配1个验证员审核', en: '1 random reviewer assigned', ko: '무작위로 1명 배정', vi: 'Ngẫu nhiên 1 người đánh giá' })}</p>
                          <p>• {getText({ zh: '可以审核自己的帖子', en: 'Can review own posts', ko: '자신의 게시물 검토 가능', vi: 'Có thể đánh giá bài của mình' })}</p>
                          <p>• {getText({ zh: '拒绝则审核失败并退款', en: 'Rejection refunds payment', ko: '거부 시 환불', vi: 'Từ chối sẽ hoàn tiền' })}</p>
                          <p>• {getText({ zh: '退出时保证金将解冻', en: 'Deposit refunded when quitting', ko: '종료 시 보증금 환불', vi: 'Hoàn tiền khi thoát' })}</p>
                        </div>
                        <button
                          onClick={handleApplyReviewer}
                          className="w-full px-4 py-2 bg-purple-500 text-white text-sm font-bold rounded-lg hover:bg-purple-600 transition-all"
                        >
                          {getText({ zh: '申请成为验证员', en: 'Apply as Reviewer', ko: '검토자 신청', vi: 'Đăng ký làm người đánh giá' })}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'myPosts' && (
                  <div className="space-y-2">
                    {isLoadingMy ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                      </div>
                    ) : myPosts.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        {getText({ zh: '还没有发布帖子', en: 'No posts yet', ko: '게시물 없음', vi: 'Chưa có bài đăng' })}
                      </div>
                    ) : (
                      myPosts.map(post => {
                        const isExpanded = expandedMyCards.has(post.id);
                        return (
                          <div key={post.id} className="bg-white rounded-lg p-3 border border-purple-200 relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedMyCards(prev => {
                                  const newSet = new Set(prev);
                                  if (newSet.has(post.id)) {
                                    newSet.delete(post.id);
                                  } else {
                                    newSet.add(post.id);
                                    // 展开时加载评论
                                    if (!treeHoleComments[post.id]) {
                                      loadComments(post.id);
                                    }
                                  }
                                  return newSet;
                                });
                              }}
                              className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-lg transition-all"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-purple-600" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-purple-600" />
                              )}
                            </button>
                            <p className={`text-sm text-gray-700 break-all pr-8 mb-2 ${!isExpanded ? 'line-clamp-2' : ''}`}>{post.content}</p>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">{formatTime(post.createdAt)}</span>
                              <div className="flex gap-2">
                                <span className="flex items-center gap-1">
                                  <Heart className={`w-3.5 h-3.5 ${post.isLiked ? 'text-red-500 fill-red-500' : 'text-gray-500'}`} />
                                  <span className="text-gray-600 font-bold">{post.likes}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="w-3.5 h-3.5 text-gray-500" />
                                  <span className="text-gray-600 font-bold">{post.comments}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <Bookmark className={`w-3.5 h-3.5 ${post.isFavorited ? 'text-yellow-500 fill-yellow-500' : 'text-gray-500'}`} />
                                  <span className="text-gray-600 font-bold">{post.favorites}</span>
                                </span>
                              </div>
                            </div>
                            
                            {/* 展开时显示评论区 */}
                            {isExpanded && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="text-xs text-gray-600 mb-2 font-bold">
                                  {getText({ zh: '评论区', en: 'Comments', ko: '댓글', vi: 'Bình luận' })} ({post.comments})
                                </div>
                                <div className="space-y-2 mb-3">
                                  {treeHoleComments[post.id]?.length > 0 ? (
                                    treeHoleComments[post.id].map((comment: any, idx: number) => (
                                      <div key={idx} className="bg-gray-50 rounded-lg p-2 relative group">
                                        <div className="flex items-center gap-1 flex-wrap">
                                          <div className="text-xs text-gray-700 break-all pr-6">{comment.content}</div>
                                          {comment.isAuthor && (
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-purple-100 text-purple-600 font-bold">
                                              {getText({ zh: '作者', en: 'Author', ko: '작성자', vi: 'Tác giả' })}
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                                          <span>{formatTime(comment.createdAt)}</span>
                                          <button
                                            onClick={() => {
                                              setReplyTarget({ treeHoleId: post.id, commentId: comment.id, commentContent: comment.content });
                                              const input = document.querySelector(`input[placeholder*="${getText({ zh: '写评论', en: 'Write a comment', ko: '댓글 작성', vi: 'Viết bình luận' })}"]`) as HTMLInputElement;
                                              if (input) {
                                                input.focus();
                                                input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                              }
                                            }}
                                            className="flex items-center gap-0.5 text-purple-500 hover:text-purple-600 transition-all"
                                          >
                                            <Reply className="w-3 h-3" />
                                            <span>{getText({ zh: '回复', en: 'Reply', ko: '답글', vi: 'Trả lời' })}</span>
                                          </button>
                                          {comment.replies && comment.replies.length > 0 && (
                                            <button
                                              onClick={() => {
                                                setExpandedReplies(prev => {
                                                  const newSet = new Set(prev);
                                                  if (newSet.has(comment.id)) {
                                                    newSet.delete(comment.id);
                                                  } else {
                                                    newSet.add(comment.id);
                                                  }
                                                  return newSet;
                                                });
                                              }}
                                              className="text-purple-500 hover:text-purple-600"
                                            >
                                              {expandedReplies.has(comment.id) 
                                                ? getText({ zh: '收起回复', en: 'Hide replies', ko: '답글 숨기기', vi: 'Ẩn trả lời' })
                                                : `${getText({ zh: '展开', en: 'Show', ko: '펼치기', vi: 'Hiện' })} ${comment.replies.length} ${getText({ zh: '条回复', en: 'replies', ko: '개 답글', vi: 'trả lời' })}`
                                              }
                                            </button>
                                          )}
                                        </div>
                                        {comment.replies && comment.replies.length > 0 && expandedReplies.has(comment.id) && (
                                          <div className="mt-2 ml-4 space-y-2 border-l-2 border-purple-200 pl-2">
                                            {comment.replies.map((reply: any) => (
                                              <div key={reply.id} className="bg-white/30 rounded p-2">
                                                <div className="flex items-center gap-1 flex-wrap">
                                                  <div className="text-xs text-gray-700 break-all">{reply.content}</div>
                                                  {reply.isAuthor && (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-purple-100 text-purple-600 font-bold">
                                                      {getText({ zh: '作者', en: 'Author', ko: '작성자', vi: 'Tác giả' })}
                                                    </span>
                                                  )}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                                                  <span>{formatTime(reply.createdAt)}</span>
                                                  <button
                                                    onClick={() => {
                                                      setReplyTarget({ treeHoleId: post.id, commentId: comment.id, commentContent: reply.content });
                                                      const input = document.querySelector(`input[placeholder*="${getText({ zh: '写评论', en: 'Write a comment', ko: '댓글 작성', vi: 'Viết bình luận' })}"]`) as HTMLInputElement;
                                                      if (input) {
                                                        input.focus();
                                                        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                      }
                                                    }}
                                                    className="flex items-center gap-0.5 text-purple-500 hover:text-purple-600 transition-all"
                                                  >
                                                    <Reply className="w-3 h-3" />
                                                    <span>{getText({ zh: '回复', en: 'Reply', ko: '답글', vi: 'Trả lời' })}</span>
                                                  </button>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                        <button
                                          onClick={() => handleDeleteComment(comment.id, post.id)}
                                          className="absolute top-2 right-2 p-1 hover:bg-red-100 rounded transition-all"
                                        >
                                          <Trash2 className="w-3 h-3 text-red-500" />
                                        </button>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-xs text-gray-400 text-center py-2">
                                      {getText({ zh: '暂无评论', en: 'No comments', ko: '댓글 없음', vi: 'Chưa có bình luận' })}
                                    </div>
                                  )}
                                </div>
                                
                                {/* 评论输入框 */}
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={commentInputs[post.id] || ''}
                                    onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        handleComment(post.id);
                                      }
                                    }}
                                    placeholder={getText({ zh: '写评论...', en: 'Write a comment...', ko: '댓글 작성...', vi: 'Viết bình luận...' })}
                                    className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400"
                                  />
                                  <button
                                    onClick={() => handleComment(post.id)}
                                    className="px-3 py-1.5 bg-purple-500 text-white text-xs rounded-lg hover:bg-purple-600 transition-all"
                                  >
                                    {getText({ zh: '发送', en: 'Send', ko: '전送', vi: 'Gửi' })}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {activeTab === 'myFavorites' && (
                  <div className="space-y-2">
                    {isLoadingMy ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                      </div>
                    ) : myFavorites.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        {getText({ zh: '还没有收藏帖子', en: 'No favorites yet', ko: '즐겨찾기 없음', vi: 'Chưa có yêu thích' })}
                      </div>
                    ) : (
                      myFavorites.map(post => {
                        const isExpanded = expandedMyCards.has(post.id);
                        return (
                          <div key={post.id} className="bg-white rounded-lg p-3 border border-purple-200 relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedMyCards(prev => {
                                  const newSet = new Set(prev);
                                  if (newSet.has(post.id)) {
                                    newSet.delete(post.id);
                                  } else {
                                    newSet.add(post.id);
                                    // 展开时加载评论
                                    if (!treeHoleComments[post.id]) {
                                      loadComments(post.id);
                                    }
                                  }
                                  return newSet;
                                });
                              }}
                              className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-lg transition-all"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-purple-600" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-purple-600" />
                              )}
                            </button>
                            <p className={`text-sm text-gray-700 break-all pr-8 mb-2 ${!isExpanded ? 'line-clamp-2' : ''}`}>{post.content}</p>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">{formatTime(post.createdAt)}</span>
                              <div className="flex gap-2">
                                <span className="flex items-center gap-1">
                                  <Heart className={`w-3.5 h-3.5 ${post.isLiked ? 'text-red-500 fill-red-500' : 'text-gray-500'}`} />
                                  <span className="text-gray-600 font-bold">{post.likes}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="w-3.5 h-3.5 text-gray-500" />
                                  <span className="text-gray-600 font-bold">{post.comments}</span>
                                </span>
                                <button 
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      await treeHoleApi.favoriteTreeHole(post.id);
                                      const favoritedPosts = JSON.parse(localStorage.getItem('favoritedTreeHoles') || '{}');
                                      delete favoritedPosts[post.id];
                                      localStorage.setItem('favoritedTreeHoles', JSON.stringify(favoritedPosts));
                                      setMyFavorites(prev => prev.filter(p => p.id !== post.id));
                                    } catch (error) {
                                      console.error('取消收藏失败:', error);
                                    }
                                  }}
                                  className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 transition-all group"
                                >
                                  <Bookmark className={`w-3.5 h-3.5 ${post.isFavorited ? 'text-yellow-500 fill-yellow-500' : 'text-gray-500'}`} />
                                  <span className="text-gray-600 font-bold">{post.favorites}</span>
                                </button>
                              </div>
                            </div>
                            
                            {/* 展开时显示评论区 */}
                            {isExpanded && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="text-xs text-gray-600 mb-2 font-bold">
                                  {getText({ zh: '评论区', en: 'Comments', ko: '댓글', vi: 'Bình luận' })} ({post.comments})
                                </div>
                                <div className="space-y-2 mb-3">
                                  {treeHoleComments[post.id]?.length > 0 ? (
                                    treeHoleComments[post.id].map((comment: any, idx: number) => {
                                      const currentUserId = getCurrentUserId();
                                      const canDelete = currentUserId && (comment.userId === currentUserId);
                                      return (
                                        <div key={idx} className="bg-gray-50 rounded-lg p-2 relative group">
                                          <div className="flex items-center gap-1 flex-wrap">
                                            <div className="text-xs text-gray-700 break-all pr-6">{comment.content}</div>
                                            {comment.isAuthor && (
                                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-purple-100 text-purple-600 font-bold">
                                                {getText({ zh: '作者', en: 'Author', ko: '작성자', vi: 'Tác giả' })}
                                              </span>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                                            <span>{formatTime(comment.createdAt)}</span>
                                            <button
                                              onClick={() => {
                                                setReplyTarget({ treeHoleId: post.id, commentId: comment.id, commentContent: comment.content });
                                                const input = document.querySelector(`input[placeholder*="${getText({ zh: '写评论', en: 'Write a comment', ko: '댓글 작성', vi: 'Viết bình luận' })}"]`) as HTMLInputElement;
                                                if (input) {
                                                  input.focus();
                                                  input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                }
                                              }}
                                              className="flex items-center gap-0.5 text-purple-500 hover:text-purple-600 transition-all"
                                            >
                                              <Reply className="w-3 h-3" />
                                              <span>{getText({ zh: '回复', en: 'Reply', ko: '답글', vi: 'Trả lời' })}</span>
                                            </button>
                                            {comment.replies && comment.replies.length > 0 && (
                                              <button
                                                onClick={() => {
                                                  setExpandedReplies(prev => {
                                                    const newSet = new Set(prev);
                                                    if (newSet.has(comment.id)) {
                                                      newSet.delete(comment.id);
                                                    } else {
                                                      newSet.add(comment.id);
                                                    }
                                                    return newSet;
                                                  });
                                                }}
                                                className="text-purple-500 hover:text-purple-600"
                                              >
                                                {expandedReplies.has(comment.id) 
                                                  ? getText({ zh: '收起回复', en: 'Hide replies', ko: '답글 숨기기', vi: 'Ẩn trả lời' })
                                                  : `${getText({ zh: '展开', en: 'Show', ko: '펼치기', vi: 'Hiện' })} ${comment.replies.length} ${getText({ zh: '条回复', en: 'replies', ko: '개 답글', vi: 'trả lời' })}`
                                                }
                                              </button>
                                            )}
                                          </div>
                                          {comment.replies && comment.replies.length > 0 && expandedReplies.has(comment.id) && (
                                            <div className="mt-2 ml-4 space-y-2 border-l-2 border-purple-200 pl-2">
                                              {comment.replies.map((reply: any) => (
                                                <div key={reply.id} className="bg-white/30 rounded p-2">
                                                  <div className="flex items-center gap-1 flex-wrap">
                                                    <div className="text-xs text-gray-700 break-all">{reply.content}</div>
                                                    {reply.isAuthor && (
                                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-purple-100 text-purple-600 font-bold">
                                                        {getText({ zh: '作者', en: 'Author', ko: '작성자', vi: 'Tác giả' })}
                                                      </span>
                                                    )}
                                                  </div>
                                                  <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                                                    <span>{formatTime(reply.createdAt)}</span>
                                                    <button
                                                      onClick={() => {
                                                        setReplyTarget({ treeHoleId: post.id, commentId: comment.id, commentContent: reply.content });
                                                        const input = document.querySelector(`input[placeholder*="${getText({ zh: '写评论', en: 'Write a comment', ko: '댓글 작성', vi: 'Viết bình luận' })}"]`) as HTMLInputElement;
                                                        if (input) {
                                                          input.focus();
                                                          input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                        }
                                                      }}
                                                      className="flex items-center gap-0.5 text-purple-500 hover:text-purple-600 transition-all"
                                                    >
                                                      <Reply className="w-3 h-3" />
                                                      <span>{getText({ zh: '回复', en: 'Reply', ko: '답글', vi: 'Trả lời' })}</span>
                                                    </button>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                          {canDelete && (
                                            <button
                                              onClick={() => handleDeleteComment(comment.id, post.id)}
                                              className="absolute top-2 right-2 p-1 hover:bg-red-100 rounded transition-all"
                                            >
                                              <Trash2 className="w-3 h-3 text-red-500" />
                                            </button>
                                          )}
                                        </div>
                                      );
                                    })
                                  ) : (
                                    <div className="text-xs text-gray-400 text-center py-2">
                                      {getText({ zh: '暂无评论', en: 'No comments', ko: '댓글 없음', vi: 'Chưa có bình luận' })}
                                    </div>
                                  )}
                                </div>
                                
                                {/* 评论输入框 */}
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={commentInputs[post.id] || ''}
                                    onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        handleComment(post.id);
                                      }
                                    }}
                                    placeholder={getText({ zh: '写评论...', en: 'Write a comment...', ko: '댓글 작성...', vi: 'Viết bình luận...' })}
                                    className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400"
                                  />
                                  <button
                                    onClick={() => handleComment(post.id)}
                                    className="px-3 py-1.5 bg-purple-500 text-white text-xs rounded-lg hover:bg-purple-600 transition-all"
                                  >
                                    {getText({ zh: '发送', en: 'Send', ko: '전송', vi: 'Gửi' })}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {activeTab === 'myComments' && (
                  <div className="space-y-2">
                    {isLoadingMy ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                      </div>
                    ) : myComments.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        {getText({ zh: '还没有发表评论', en: 'No comments yet', ko: '댓글 없음', vi: 'Chưa có bình luận' })}
                      </div>
                    ) : (
                      (() => {
                        // 按帖子ID分组评论
                        const groupedComments: { [key: string]: any[] } = {};
                        myComments.forEach(comment => {
                          const treeHoleId = comment.treeHole?.id;
                          if (treeHoleId) {
                            if (!groupedComments[treeHoleId]) {
                              groupedComments[treeHoleId] = [];
                            }
                            groupedComments[treeHoleId].push(comment);
                          }
                        });
                        
                        return Object.entries(groupedComments).map(([treeHoleId, comments]) => {
                          const treeHole = comments[0].treeHole;
                          if (!treeHole) return null;
                          
                          const isExpanded = expandedMyCards.has(treeHoleId);
                          const likedPosts = JSON.parse(localStorage.getItem('likedTreeHoles') || '{}');
                          const favoritedPosts = JSON.parse(localStorage.getItem('favoritedTreeHoles') || '{}');
                          const isLiked = likedPosts[treeHole.id] || false;
                          const isFavorited = favoritedPosts[treeHole.id] || false;
                          
                          return (
                            <div key={treeHoleId} className="bg-white rounded-lg p-3 border border-purple-200 relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedMyCards(prev => {
                                    const newSet = new Set(prev);
                                    if (newSet.has(treeHoleId)) {
                                      newSet.delete(treeHoleId);
                                    } else {
                                      newSet.add(treeHoleId);
                                      if (!treeHoleComments[treeHole.id]) {
                                        loadComments(treeHole.id);
                                      }
                                    }
                                    return newSet;
                                  });
                                }}
                                className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-lg transition-all z-10"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-purple-600" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-purple-600" />
                                )}
                              </button>
                              
                              {!isExpanded ? (
                                <>
                                  <div className="bg-purple-50 rounded-lg p-2 mb-2 pr-8">
                                    <p className="text-xs text-gray-600 break-all line-clamp-2">{treeHole.content}</p>
                                  </div>
                                  <div className="space-y-2">
                                    {comments.map((comment, idx) => (
                                      <div key={comment.id} className="pl-2 border-l-2 border-purple-300">
                                        <p className="text-sm text-gray-700 break-all">{comment.content}</p>
                                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                                          <span>{formatTime(comment.createdAt)}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="pr-8">
                                    <p className="text-sm text-gray-700 break-all mb-2">{treeHole.content}</p>
                                    <div className="flex items-center justify-between text-xs mb-3">
                                      <div className="flex items-center gap-1 text-gray-500">
                                        <Clock className="w-3 h-3" />
                                        <span>{formatTime(treeHole.createdAt)}</span>
                                      </div>
                                      <div className="flex gap-3">
                                        <button 
                                          onClick={async (e) => {
                                            e.stopPropagation();
                                            try {
                                              const result: any = await treeHoleApi.likeTreeHole(treeHole.id);
                                              const likedPosts = JSON.parse(localStorage.getItem('likedTreeHoles') || '{}');
                                              if (result.liked) {
                                                likedPosts[treeHole.id] = true;
                                              } else {
                                                delete likedPosts[treeHole.id];
                                              }
                                              localStorage.setItem('likedTreeHoles', JSON.stringify(likedPosts));
                                              loadMyComments();
                                            } catch (error) {
                                              console.error('点赞失败:', error);
                                            }
                                          }}
                                          className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 transition-all group"
                                        >
                                          <Heart className={`w-3.5 h-3.5 transition-all ${isLiked ? 'text-red-500 fill-red-500' : 'text-gray-500 group-hover:text-red-500'}`} />
                                          <span className="text-gray-600 font-bold">{treeHole.likes}</span>
                                        </button>
                                        <button className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 transition-all group">
                                          <MessageCircle className="w-3.5 h-3.5 text-gray-500 group-hover:text-purple-500 transition-all" />
                                          <span className="text-gray-600 font-bold">{treeHole._count?.comments || 0}</span>
                                        </button>
                                        <button 
                                          onClick={async (e) => {
                                            e.stopPropagation();
                                            try {
                                              const result: any = await treeHoleApi.favoriteTreeHole(treeHole.id);
                                              const favoritedPosts = JSON.parse(localStorage.getItem('favoritedTreeHoles') || '{}');
                                              if (result.favorited) {
                                                favoritedPosts[treeHole.id] = true;
                                              } else {
                                                delete favoritedPosts[treeHole.id];
                                              }
                                              localStorage.setItem('favoritedTreeHoles', JSON.stringify(favoritedPosts));
                                              loadMyComments();
                                            } catch (error) {
                                              console.error('收藏失败:', error);
                                            }
                                          }}
                                          className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 transition-all group"
                                        >
                                          <Bookmark className={`w-3.5 h-3.5 transition-all ${isFavorited ? 'text-yellow-500 fill-yellow-500' : 'text-gray-500 group-hover:text-yellow-500'}`} />
                                          <span className="text-gray-600 font-bold">{treeHole.favorites || 0}</span>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="mt-3 pt-3 border-t border-gray-200">
                                    <div className="text-xs text-gray-600 mb-2 font-bold">
                                      {getText({ zh: '评论区', en: 'Comments', ko: '댓글', vi: 'Bình luận' })} ({treeHole._count?.comments || 0})
                                    </div>
                                    <div className="space-y-2 mb-3">
                                      {treeHoleComments[treeHole.id]?.length > 0 ? (
                                        treeHoleComments[treeHole.id].map((c: any, idx: number) => {
                                          const currentUserId = getCurrentUserId();
                                          const canDelete = currentUserId && (c.userId === currentUserId);
                                          return (
                                            <div key={idx} className="bg-gray-50 rounded-lg p-2 relative group">
                                              <div className="flex items-center gap-1 flex-wrap">
                                                <div className="text-xs text-gray-700 break-all pr-6">{c.content}</div>
                                                {c.isAuthor && (
                                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-purple-100 text-purple-600 font-bold">
                                                    {getText({ zh: '作者', en: 'Author', ko: '작성자', vi: 'Tác giả' })}
                                                  </span>
                                                )}
                                              </div>
                                              <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                                                <span>{formatTime(c.createdAt)}</span>
                                                <button
                                                  onClick={() => {
                                                    setReplyTarget({ treeHoleId: treeHole.id, commentId: c.id, commentContent: c.content });
                                                    const input = document.querySelector(`input[placeholder*="${getText({ zh: '写评论', en: 'Write a comment', ko: '댓글 작성', vi: 'Viết bình luận' })}"]`) as HTMLInputElement;
                                                    if (input) {
                                                      input.focus();
                                                      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                    }
                                                  }}
                                                  className="flex items-center gap-0.5 text-purple-500 hover:text-purple-600 transition-all"
                                                >
                                                  <Reply className="w-3 h-3" />
                                                  <span>{getText({ zh: '回复', en: 'Reply', ko: '답글', vi: 'Trả lời' })}</span>
                                                </button>
                                                {c.replies && c.replies.length > 0 && (
                                                  <button
                                                    onClick={() => {
                                                      setExpandedReplies(prev => {
                                                        const newSet = new Set(prev);
                                                        if (newSet.has(c.id)) {
                                                          newSet.delete(c.id);
                                                        } else {
                                                          newSet.add(c.id);
                                                        }
                                                        return newSet;
                                                      });
                                                    }}
                                                    className="text-purple-500 hover:text-purple-600"
                                                  >
                                                    {expandedReplies.has(c.id) 
                                                      ? getText({ zh: '收起回复', en: 'Hide replies', ko: '답글 숨기기', vi: 'Ẩn trả lời' })
                                                      : `${getText({ zh: '展开', en: 'Show', ko: '펼치기', vi: 'Hiện' })} ${c.replies.length} ${getText({ zh: '条回复', en: 'replies', ko: '개 답글', vi: 'trả lời' })}`
                                                    }
                                                  </button>
                                                )}
                                              </div>
                                              {c.replies && c.replies.length > 0 && expandedReplies.has(c.id) && (
                                                <div className="mt-2 ml-4 space-y-2 border-l-2 border-purple-200 pl-2">
                                                  {c.replies.map((reply: any) => (
                                                    <div key={reply.id} className="bg-white/30 rounded p-2">
                                                      <div className="flex items-center gap-1 flex-wrap">
                                                        <div className="text-xs text-gray-700 break-all">{reply.content}</div>
                                                        {reply.isAuthor && (
                                                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-purple-100 text-purple-600 font-bold">
                                                            {getText({ zh: '作者', en: 'Author', ko: '作성자', vi: 'Tác giả' })}
                                                          </span>
                                                        )}
                                                      </div>
                                                      <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                                                        <span>{formatTime(reply.createdAt)}</span>
                                                        <button
                                                          onClick={() => {
                                                            setReplyTarget({ treeHoleId: treeHole.id, commentId: c.id, commentContent: reply.content });
                                                            const input = document.querySelector(`input[placeholder*="${getText({ zh: '写评论', en: 'Write a comment', ko: '댓글 작성', vi: 'Viết bình luận' })}"]`) as HTMLInputElement;
                                                            if (input) {
                                                              input.focus();
                                                              input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                            }
                                                          }}
                                                          className="flex items-center gap-0.5 text-purple-500 hover:text-purple-600 transition-all"
                                                        >
                                                          <Reply className="w-3 h-3" />
                                                          <span>{getText({ zh: '回复', en: 'Reply', ko: '답글', vi: 'Trả lời' })}</span>
                                                        </button>
                                                      </div>
                                                    </div>
                                                  ))}
                                                </div>
                                              )}
                                              {canDelete && (
                                                <button
                                                  onClick={() => handleDeleteComment(c.id, treeHole.id)}
                                                  className="absolute top-2 right-2 p-1 hover:bg-red-100 rounded transition-all"
                                                >
                                                  <Trash2 className="w-3 h-3 text-red-500" />
                                                </button>
                                              )}
                                            </div>
                                          );
                                        })
                                      ) : (
                                        <div className="text-xs text-gray-400 text-center py-2">
                                          {getText({ zh: '暂无评论', en: 'No comments', ko: '댓글 없음', vi: 'Chưa có bình luận' })}
                                        </div>
                                      )}
                                    </div>
                                    
                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        value={commentInputs[treeHole.id] || ''}
                                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [treeHole.id]: e.target.value }))}
                                        onKeyPress={(e) => {
                                          if (e.key === 'Enter') {
                                            handleComment(treeHole.id);
                                          }
                                        }}
                                        placeholder={getText({ zh: '写评论...', en: 'Write a comment...', ko: '댓글 작성...', vi: 'Viết bình luận...' })}
                                        className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400"
                                      />
                                      <button
                                        onClick={() => handleComment(treeHole.id)}
                                        className="px-3 py-1.5 bg-purple-500 text-white text-xs rounded-lg hover:bg-purple-600 transition-all"
                                      >
                                        {getText({ zh: '发送', en: 'Send', ko: '전송', vi: 'Gửi' })}
                                      </button>
                                    </div>
                                  </div>
                                  
                                  <div className="mt-3 pt-3 border-t border-purple-200">
                                    <div className="text-xs text-gray-600 mb-2 font-bold">
                                      {getText({ zh: '我的评论', en: 'My Comments', ko: '내 댓글', vi: 'Bình luận của tôi' })} ({comments.length})
                                    </div>
                                    <div className="space-y-2">
                                      {comments.map((comment) => (
                                        <div key={comment.id} className="pl-2 border-l-2 border-purple-300">
                                          <p className="text-sm text-gray-700 break-all">{comment.content}</p>
                                          <div className="text-xs text-gray-400 mt-1">{formatTime(comment.createdAt)}</div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        });
                      })()
                    )}
                  </div>
                )}
              </div>

              {/* 发布按钮固定在窗口底部 */}
              {activeTab === 'post' && (
                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50">
                  <div className="text-xs text-center text-gray-600 mb-2">
                    {getText({ zh: '💰 发布需支付1π并等待审核', en: '💰 Costs 1π + review required', ko: '💰 1π 필요 + 검토 필요', vi: '💰 Cần 1π + đánh giá' })}
                  </div>
                  <button 
                    onClick={handlePost}
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:from-red-700 hover:to-red-600 font-bold text-sm shadow-md hover:shadow-lg active:scale-95 transition-all ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting 
                      ? getText({ zh: '提交中...', en: 'Submitting...', ko: '제출 중...', vi: 'Đang gửi...' })
                      : getText({ zh: '发布（1π）', en: 'Post (1π)', ko: '게시 (1π)', vi: 'Đăng (1π)' })
                    }
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
