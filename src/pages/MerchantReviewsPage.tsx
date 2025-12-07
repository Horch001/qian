import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Image as ImageIcon } from 'lucide-react';
import { Language, Translations } from '../types';

// 处理图片URL
const processMediaUrl = (mediaUrl: string | undefined | null): string => {
  if (!mediaUrl) return '';
  if (mediaUrl.startsWith('data:image/')) return mediaUrl;
  if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) return mediaUrl;
  if (mediaUrl.startsWith('/uploads/')) {
    const url = import.meta.env.VITE_API_URL || 
      (window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://h.toupiao.pro');
    return `${url}${mediaUrl}`;
  }
  return mediaUrl;
};

interface Review {
  id: string;
  rating: number;
  content: string;
  images: string[];
  createdAt: string;
  user: {
    username: string;
  };
  product: {
    title: string;
    images: string[];
  };
  order?: {
    id: string;
    orderNo: string;
    createdAt: string;
    completedAt?: string;
    items: Array<{
      price: string;
      quantity: number;
      spec?: string;
    }>;
  };
}

interface MerchantReviewsPageProps {
  language: Language;
  translations: Translations;
}

export const MerchantReviewsPage: React.FC<MerchantReviewsPageProps> = ({ language, translations }) => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());

  const getText = (texts: { zh: string; en: string; ko: string; vi: string }) => texts[language];

  const toggleExpand = (reviewId: string) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
    }
    setExpandedReviews(newExpanded);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const token = localStorage.getItem('authToken');

      // 获取商家所有店铺
      const merchantsResponse = await fetch(`${API_URL}/api/v1/merchants/my/all`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!merchantsResponse.ok) {
        throw new Error('获取店铺失败');
      }

      const merchants = await merchantsResponse.json();
      if (!merchants || merchants.length === 0) {
        setLoading(false);
        return;
      }

      // 获取所有店铺的评价
      const allReviews: Review[] = [];
      for (const merchant of merchants) {
        const reviewsResponse = await fetch(`${API_URL}/api/v1/merchants/${merchant.id}/product-reviews`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (reviewsResponse.ok) {
          const data = await reviewsResponse.json();
          allReviews.push(...(data.items || []));
        }
      }

      // 按时间排序
      allReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReviews(allReviews);
    } catch (error) {
      console.error('获取评价失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#7c3aed] via-[#a855f7] to-[#c084fc] flex items-center justify-center">
        <div className="text-white">{getText({ zh: '加载中...', en: 'Loading...', ko: '로딩 중...', vi: 'Đang tải...' })}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7c3aed] via-[#a855f7] to-[#c084fc] flex flex-col">
      <header className="bg-white/90 backdrop-blur-sm sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-sm font-bold text-gray-800">
            {getText({ zh: '评价管理', en: 'Reviews', ko: '리뷰 관리', vi: 'Quản lý đánh giá' })}
          </h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="flex-1 max-w-md w-full mx-auto overflow-auto p-4">
        {reviews.length === 0 ? (
          <div className="bg-white/10 rounded-lg p-8 text-center">
            <Star className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <p className="text-white">{getText({ zh: '暂无评价', en: 'No reviews', ko: '리뷰 없음', vi: 'Chưa có đánh giá' })}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {reviews.map((review) => {
              const isExpanded = expandedReviews.has(review.id);
              return (
                <div key={review.id} className="bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden">
                  {/* 卡片头部 - 可点击展开 */}
                  <div 
                    className="p-2 flex items-center gap-2 cursor-pointer hover:bg-white/5"
                    onClick={() => toggleExpand(review.id)}
                  >
                    {/* 商品小图 */}
                    {review.product?.images?.[0] && (
                      <img 
                        src={processMediaUrl(review.product.images[0])} 
                        alt="" 
                        className="w-10 h-10 object-cover rounded flex-shrink-0"
                      />
                    )}
                    {/* 商品名称和评分 */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium truncate">{review.product?.title || getText({ zh: '未知商品', en: 'Unknown', ko: '알 수 없음', vi: 'Không rõ' })}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-white/30'}`}
                          />
                        ))}
                      </div>
                    </div>
                    {/* 展开箭头 */}
                    <svg className={`w-4 h-4 text-white/60 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {/* 展开内容 */}
                  {isExpanded && (
                    <div className="px-3 pb-3 border-t border-white/10 pt-2 space-y-2">
                      {/* 订单和用户信息 */}
                      <div className="text-[10px] space-y-1">
                        <div>
                          <span className="text-white/50">{getText({ zh: '用户:', en: 'User:', ko: '사용자:', vi: 'Người dùng:' })} </span>
                          <span className="text-white">{review.user?.username || getText({ zh: '匿名', en: 'Anonymous', ko: '익명', vi: 'Ẩn danh' })}</span>
                        </div>
                        {review.order && (
                          <>
                            <div>
                              <span className="text-white/50">{getText({ zh: '订单号:', en: 'Order No:', ko: '주문 번호:', vi: 'Mã đơn:' })} </span>
                              <span className="text-white font-mono">{review.order.orderNo}</span>
                            </div>
                            {review.order.items && review.order.items.length > 0 && (
                              <div>
                                <span className="text-white/50">{getText({ zh: '商品价格:', en: 'Price:', ko: '가격:', vi: 'Giá:' })} </span>
                                <span className="text-white">π {review.order.items[0].price}</span>
                                {review.order.items[0].spec && (
                                  <span className="text-white/70"> ({review.order.items[0].spec})</span>
                                )}
                              </div>
                            )}
                            <div>
                              <span className="text-white/50">{getText({ zh: '下单时间:', en: 'Order Time:', ko: '주문 시간:', vi: 'Thời gian đặt:' })} </span>
                              <span className="text-white">{new Date(review.order.createdAt).toLocaleString()}</span>
                            </div>
                            {review.order.completedAt && (
                              <div>
                                <span className="text-white/50">{getText({ zh: '收货时间:', en: 'Received:', ko: '수령 시간:', vi: 'Đã nhận:' })} </span>
                                <span className="text-white">{new Date(review.order.completedAt).toLocaleString()}</span>
                              </div>
                            )}
                          </>
                        )}
                        <div>
                          <span className="text-white/50">{getText({ zh: '评价时间:', en: 'Review Time:', ko: '리뷰 시간:', vi: 'Thời gian đánh giá:' })} </span>
                          <span className="text-white">{new Date(review.createdAt).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* 评价内容 */}
                      {review.content && (
                        <p className="text-white text-xs leading-relaxed">{review.content}</p>
                      )}

                      {/* 评价图片 */}
                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-2">
                          {review.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={processMediaUrl(img)}
                              alt=""
                              className="w-14 h-14 object-cover rounded cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImage(processMediaUrl(img));
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 图片查看器 */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <img 
            src={selectedImage} 
            alt="" 
            className="max-w-[90%] max-h-[90%] object-contain"
          />
        </div>
      )}
    </div>
  );
};
