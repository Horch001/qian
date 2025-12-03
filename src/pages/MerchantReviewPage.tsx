import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Star, Upload, X } from 'lucide-react';
import { Language, Translations } from '../types';

interface MerchantReviewPageProps {
  language: Language;
  translations: Translations;
}

export const MerchantReviewPage: React.FC<MerchantReviewPageProps> = ({ language, translations }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { order, merchantId, merchantName } = location.state || {};
  
  const [productQuality, setProductQuality] = useState(5);
  const [serviceAttitude, setServiceAttitude] = useState(5);
  const [logisticsSpeed, setLogisticsSpeed] = useState(5);
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const getText = (texts: { zh: string; en: string; ko: string; vi: string }) => texts[language];

  const overallRating = Math.round((productQuality + serviceAttitude + logisticsSpeed) / 3);

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

      const response = await fetch(`${API_URL}/api/v1/merchants/${merchantId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId: order.id,
          productQuality,
          serviceAttitude,
          logisticsSpeed,
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

  if (!order || !merchantId) {
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
            {getText({ zh: '评价商家', en: 'Review Merchant', ko: '판매자 리뷰', vi: 'Đánh giá người bán' })}
          </h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="flex-1 max-w-md w-full mx-auto overflow-auto pb-20 p-4">
        {/* 商家信息 */}
        <div className="bg-white rounded-lg p-4 mb-4">
          <h3 className="font-bold text-gray-800 text-sm mb-2">{getText({ zh: '评价商家', en: 'Merchant', ko: '판매자', vi: 'Người bán' })}</h3>
          <p className="text-gray-600">{merchantName || getText({ zh: '商家', en: 'Merchant', ko: '판매자', vi: 'Người bán' })}</p>
        </div>

        {/* 商品质量评分 */}
        <div className="bg-white rounded-lg p-4 mb-4">
          <h3 className="font-bold text-gray-800 mb-3">{getText({ zh: '商品质量', en: 'Product Quality', ko: '상품 품질', vi: 'Chất lượng sản phẩm' })}</h3>
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setProductQuality(star)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-10 h-10 ${star <= productQuality ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* 服务态度评分 */}
        <div className="bg-white rounded-lg p-4 mb-4">
          <h3 className="font-bold text-gray-800 mb-3">{getText({ zh: '服务态度', en: 'Service Attitude', ko: '서비스 태도', vi: 'Thái độ phục vụ' })}</h3>
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setServiceAttitude(star)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-10 h-10 ${star <= serviceAttitude ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* 物流速度评分 */}
        <div className="bg-white rounded-lg p-4 mb-4">
          <h3 className="font-bold text-gray-800 mb-3">{getText({ zh: '物流速度', en: 'Logistics Speed', ko: '배송 속도', vi: 'Tốc độ vận chuyển' })}</h3>
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setLogisticsSpeed(star)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-10 h-10 ${star <= logisticsSpeed ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* 综合评分 */}
        <div className="bg-white rounded-lg p-4 mb-4">
          <h3 className="font-bold text-gray-800 mb-3">{getText({ zh: '综合评分', en: 'Overall Rating', ko: '종합 평점', vi: 'Đánh giá tổng thể' })}</h3>
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-10 h-10 ${star <= overallRating ? 'fill-purple-400 text-purple-400' : 'text-gray-300'}`}
              />
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 mt-2">
            {getText({ zh: '（自动计算）', en: '(Auto calculated)', ko: '(자동 계산)', vi: '(Tự động tính)' })}
          </p>
        </div>

        {/* 评价内容 */}
        <div className="bg-white rounded-lg p-4 mb-4">
          <h3 className="font-bold text-gray-800 mb-3">{getText({ zh: '评价内容', en: 'Review', ko: '리뷰 내용', vi: 'Nội dung' })}</h3>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={getText({ 
              zh: '分享您的购物体验...', 
              en: 'Share your experience...', 
              ko: '쇼핑 경험을 공유해주세요...', 
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
