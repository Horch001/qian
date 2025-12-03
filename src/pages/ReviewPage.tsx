import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Star, Upload, X } from 'lucide-react';
import { Language, Translations } from '../types';

interface ReviewPageProps {
  language: Language;
  translations: Translations;
}

export const ReviewPage: React.FC<ReviewPageProps> = ({ language, translations }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { order, item } = location.state || {};
  
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const getText = (texts: { zh: string; en: string; ko: string; vi: string }) => texts[language];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 5) {
      alert(getText({ zh: '最多上传5张图片', en: 'Max 5 images', ko: '최대 5장', vi: 'Tối đa 5 ảnh' }));
      return;
    }

    setUploading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const token = localStorage.getItem('authToken');
      
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_URL}/api/v1/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          uploadedUrls.push(data.url);
        }
      }

      setImages(prev => [...prev, ...uploadedUrls]);
    } catch (error) {
      console.error('上传失败:', error);
      alert(getText({ zh: '上传失败', en: 'Upload failed', ko: '업로드 실패', vi: 'Tải lên thất bại' }));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      alert(getText({ zh: '请填写评价内容', en: 'Please write review', ko: '리뷰를 작성해주세요', vi: 'Vui lòng viết đánh giá' }));
      return;
    }

    setSubmitting(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const token = localStorage.getItem('authToken');

      const response = await fetch(`${API_URL}/api/v1/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: item.productId,
          orderId: order.id,
          rating,
          content,
          images,
        }),
      });

      if (response.ok) {
        alert(getText({ zh: '评价成功！', en: 'Review submitted!', ko: '리뷰 제출 완료!', vi: 'Đánh giá thành công!' }));
        navigate('/profile');
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error: any) {
      console.error('提交评价失败:', error);
      alert(error.message || getText({ zh: '提交失败', en: 'Submit failed', ko: '제출 실패', vi: 'Gửi thất bại' }));
    } finally {
      setSubmitting(false);
    }
  };

  if (!order || !item) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-300 flex items-center justify-center">
        <p className="text-gray-600">{getText({ zh: '订单信息不存在', en: 'Order not found', ko: '주문 정보 없음', vi: 'Không tìm thấy đơn hàng' })}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-300 flex flex-col">
      <header className="bg-white/90 backdrop-blur-sm sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-sm font-bold text-gray-800">
            {getText({ zh: '评价商品', en: 'Review Product', ko: '상품 리뷰', vi: 'Đánh giá sản phẩm' })}
          </h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="flex-1 max-w-md w-full mx-auto overflow-auto pb-20 p-4">
        {/* 商品信息 */}
        <div className="bg-white rounded-lg p-4 mb-4">
          <div className="flex gap-3">
            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              {item.image ? (
                <img src={item.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 text-sm mb-1">{item.name}</h3>
              <p className="text-xs text-gray-500">{item.spec}</p>
              <p className="text-xs text-gray-500">{getText({ zh: '数量', en: 'Qty', ko: '수량', vi: 'SL' })}: {item.quantity}</p>
            </div>
          </div>
        </div>

        {/* 评分 */}
        <div className="bg-white rounded-lg p-4 mb-4">
          <h3 className="font-bold text-gray-800 mb-3">{getText({ zh: '商品评分', en: 'Rating', ko: '평점', vi: 'Đánh giá' })}</h3>
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-10 h-10 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                />
              </button>
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 mt-2">
            {rating === 5 ? getText({ zh: '非常满意', en: 'Excellent', ko: '매우 만족', vi: 'Rất hài lòng' })
              : rating === 4 ? getText({ zh: '满意', en: 'Good', ko: '만족', vi: 'Hài lòng' })
              : rating === 3 ? getText({ zh: '一般', en: 'Average', ko: '보통', vi: 'Trung bình' })
              : rating === 2 ? getText({ zh: '不满意', en: 'Poor', ko: '불만족', vi: 'Không hài lòng' })
              : getText({ zh: '非常不满意', en: 'Very Poor', ko: '매우 불만족', vi: 'Rất không hài lòng' })}
          </p>
        </div>

        {/* 评价内容 */}
        <div className="bg-white rounded-lg p-4 mb-4">
          <h3 className="font-bold text-gray-800 mb-3">{getText({ zh: '评价内容', en: 'Review', ko: '리뷰 내용', vi: 'Nội dung' })}</h3>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={getText({ 
              zh: '分享您的使用体验，帮助其他买家了解商品...', 
              en: 'Share your experience...', 
              ko: '사용 경험을 공유해주세요...', 
              vi: 'Chia sẻ trải nghiệm của bạn...' 
            })}
            className="w-full h-32 p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-purple-500"
            maxLength={500}
          />
          <p className="text-xs text-gray-400 text-right mt-1">{content.length}/500</p>
        </div>

        {/* 上传图片 */}
        <div className="bg-white rounded-lg p-4">
          <h3 className="font-bold text-gray-800 mb-3">
            {getText({ zh: '上传图片', en: 'Upload Images', ko: '이미지 업로드', vi: 'Tải ảnh lên' })}
            <span className="text-xs text-gray-400 ml-2">({images.length}/5)</span>
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {images.map((img, idx) => (
              <div key={idx} className="relative aspect-square">
                <img src={img} alt="" className="w-full h-full object-cover rounded-lg" />
                <button
                  onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 transition-colors">
                <Upload className="w-6 h-6 text-gray-400" />
                <span className="text-xs text-gray-400 mt-1">{uploading ? getText({ zh: '上传中', en: 'Uploading', ko: '업로드 중', vi: 'Đang tải' }) : getText({ zh: '上传', en: 'Upload', ko: '업로드', vi: 'Tải lên' })}</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            )}
          </div>
        </div>
      </main>

      {/* 提交按钮 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="max-w-md mx-auto px-4 py-3">
          <button
            onClick={handleSubmit}
            disabled={submitting || !content.trim()}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            {submitting ? getText({ zh: '提交中...', en: 'Submitting...', ko: '제출 중...', vi: 'Đang gửi...' }) : getText({ zh: '提交评价', en: 'Submit Review', ko: '리뷰 제출', vi: 'Gửi đánh giá' })}
          </button>
        </div>
      </div>
    </div>
  );
};
