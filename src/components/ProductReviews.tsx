import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Language } from '../types';

interface Review {
  id: string;
  rating: number;
  content: string;
  images: string[];
  createdAt: string;
  user: {
    id: string;
    username: string;
    avatar?: string;
  };
}

interface ProductReviewsProps {
  productId: string;
  language: Language;
  onReviewCountChange?: (count: number) => void;
  isExpanded?: boolean;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, language, onReviewCountChange, isExpanded = false }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const getText = (texts: { zh: string; en: string; ko: string; vi: string }) => texts[language];

  // 始终获取评价数量
  useEffect(() => {
    const fetchReviewCount = async () => {
      if (!productId) return;
      
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${API_URL}/api/v1/reviews/product/${productId}?page=1&limit=1`);
        
        if (response.ok) {
          const data = await response.json();
          setTotal(data.total || 0);
          // 通知父组件评价数量
          if (onReviewCountChange) {
            onReviewCountChange(data.total || 0);
          }
        }
      } catch (error) {
        console.error('获取评价数量失败:', error);
      }
    };

    fetchReviewCount();
  }, [productId, onReviewCountChange]);

  // 只在展开时获取评价列表
  useEffect(() => {
    const fetchReviews = async () => {
      if (!productId || !isExpanded) return;
      
      setLoading(true);
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${API_URL}/api/v1/reviews/product/${productId}?page=1&limit=10`);
        
        if (response.ok) {
          const data = await response.json();
          setReviews(data.items || []);
        }
      } catch (error) {
        console.error('获取评价失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId, isExpanded]);

  // 如果未展开，不渲染任何内容
  if (!isExpanded) {
    return null;
  }

  if (loading) {
    return (
      <p className="text-center text-gray-400 text-sm py-4">
        {getText({ zh: '加载中...', en: 'Loading...', ko: '로딩 중...', vi: 'Đang tải...' })}
      </p>
    );
  }

  if (total === 0) {
    return (
      <p className="text-center text-gray-400 text-sm py-4">
        {getText({ zh: '暂无评价', en: 'No reviews yet', ko: '리뷰 없음', vi: 'Chưa có đánh giá' })}
      </p>
    );
  }

  return (
    <div>
      
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
            {/* 用户信息 */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center overflow-hidden">
                {review.user.avatar ? (
                  <img src={review.user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm text-purple-600">{review.user.username.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-800">{review.user.username}</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3 h-3 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-xs text-gray-400">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            {/* 评价内容 */}
            <p className="text-sm text-gray-600 leading-relaxed mb-2">{review.content}</p>
            
            {/* 评价图片 */}
            {review.images && review.images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto">
                {review.images.map((img, idx) => (
                  <div key={idx} className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
