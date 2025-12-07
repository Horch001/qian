import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Star, Upload, X } from 'lucide-react';
import { Language, Translations } from '../types';
import { compressImage, COMPRESS_PRESETS } from '../utils/imageCompressor';

interface ReviewPageProps {
  language: Language;
  translations: Translations;
}

export const ReviewPage: React.FC<ReviewPageProps> = ({ language, translations }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { order, item, merchantId, merchantName } = location.state || {};
  
  // 商品评价
  const [productRating, setProductRating] = useState(5);
  const [productContent, setProductContent] = useState('');
  
  // 商家评价
  const [merchantRating, setMerchantRating] = useState(5);
  const [merchantContent, setMerchantContent] = useState('');
  
  // 物流评价
  const [logisticsRating, setLogisticsRating] = useState(5);
  const [logisticsContent, setLogisticsContent] = useState('');
  
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true); // 控制展开/收起

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
      const compressedImages: string[] = [];
      
      // 使用和商品上传相同的压缩逻辑
      for (const file of Array.from(files)) {
        console.log('开始压缩图片:', file.name, file.size);
        const compressed = await compressImage(file, COMPRESS_PRESETS.main);
        compressedImages.push(compressed);
        console.log('图片压缩完成');
      }

      // 直接使用压缩后的Base64图片（和商品上传一样）
      setImages(prev => [...prev, ...compressedImages]);
      console.log('所有图片处理完成，共', compressedImages.length, '张');
    } catch (error: any) {
      console.error('图片处理失败:', error);
      alert(getText({ zh: `图片处理失败: ${error.message}`, en: 'Image processing failed', ko: '이미지 처리 실패', vi: 'Xử lý ảnh thất bại' }));
    } finally {
      setUploading(false);
      // 清空input，允许重新选择相同文件
      e.target.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!productContent.trim()) {
      alert(getText({ zh: '请填写评价内容', en: 'Please write a review', ko: '리뷰를 작성해주세요', vi: 'Vui lòng viết đánh giá' }));
      return;
    }

    setSubmitting(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const token = localStorage.getItem('authToken');

      // 提交商品评价
      const productId = item?.product?.id || order?.items?.[0]?.product?.id;
      if (!productId) {
        throw new Error(getText({ zh: '无法获取商品信息', en: 'Cannot get product info', ko: '상품 정보를 가져올 수 없습니다', vi: 'Không thể lấy thông tin sản phẩm' }));
      }

      const reviewResponse = await fetch(`${API_URL}/api/v1/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: productId,
          orderId: order.id,
          rating: productRating,
          content: productContent,
          images,
        }),
      });

      if (!reviewResponse.ok) {
        const errorData = await reviewResponse.json();
        throw new Error(errorData.message || getText({ zh: '评价提交失败', en: 'Review failed', ko: '리뷰 실패', vi: 'Đánh giá thất bại' }));
      }

      // 提交商家评价
      if (merchantId) {
        const merchantReviewResponse = await fetch(`${API_URL}/api/v1/merchants/${merchantId}/reviews`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            orderId: order.id,
            rating: merchantRating,
            content: productContent, // 使用综合评价内容
          }),
        });

        if (!merchantReviewResponse.ok) {
          console.error('商家评价提交失败');
        }
      }

      alert(getText({ zh: '评价成功！', en: 'Review submitted!', ko: '리뷰 제출 완료!', vi: 'Đánh giá thành công!' }));
      navigate('/profile');
    } catch (error: any) {
      console.error('提交评价失败:', error);
      alert(error.message || getText({ zh: '提交失败', en: 'Submit failed', ko: '제출 실패', vi: 'Gửi thất bại' }));
    } finally {
      setSubmitting(false);
    }
  };

  if (!order || !item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#7c3aed] via-[#a855f7] to-[#c084fc] flex items-center justify-center">
        <p className="text-white">{getText({ zh: '订单信息不存在', en: 'Order not found', ko: '주문 정보 없음', vi: 'Không tìm thấy đơn hàng' })}</p>
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
            {getText({ zh: '评价订单', en: 'Review Order', ko: '주문 리뷰', vi: 'Đánh giá đơn hàng' })}
          </h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="flex-1 max-w-md w-full mx-auto overflow-auto pb-20 p-4">
        {/* 商品信息卡片 - 完全复制个人中心样式 */}
        <div className="bg-white/10 rounded-lg overflow-hidden mb-4">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full p-2 flex items-center gap-2 hover:bg-white/5 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
              {item?.product?.images?.[0] ? (
                <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl">{item?.product?.icon || '📦'}</div>
              )}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-white text-xs font-medium truncate">
                {item?.product?.title || item?.product?.name || item?.name || '商品'}
              </p>
              <p className="text-white/60 text-[10px]">{item?.spec || '标准版'} × {item?.quantity || 1}</p>
            </div>
            <span className="text-yellow-400 font-bold text-sm">{item?.totalPrice || item?.price || 0}π</span>
            <svg className={`w-4 h-4 text-white/60 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {/* 展开的订单详情 */}
          {isExpanded && (
            <div className="px-3 pb-3 pt-1 border-t border-white/10 space-y-1.5">
              <div className="space-y-1.5 text-[10px]">
                <div>
                  <span className="text-white/50">{getText({ zh: '订单编号:', en: 'Order ID:', ko: '주문 번호:', vi: 'Mã đơn:' })} </span>
                  <span className="text-white font-mono">{order.id}</span>
                </div>
                <div>
                  <span className="text-white/50">{getText({ zh: '下单时间:', en: 'Order Time:', ko: '주문 시간:', vi: 'Thời gian:' })} </span>
                  <span className="text-white">{new Date(order.createdAt).toLocaleString()}</span>
                </div>
                {order.completedAt && (
                  <div>
                    <span className="text-white/50">{getText({ zh: '收货时间:', en: 'Received:', ko: '수령 시간:', vi: 'Nhận hàng:' })} </span>
                    <span className="text-white">{new Date(order.completedAt).toLocaleString()}</span>
                  </div>
                )}
                <div>
                  <span className="text-white/50">{getText({ zh: '支付方式:', en: 'Payment:', ko: '결제 방법:', vi: 'Thanh toán:' })} </span>
                  <span className="text-white">{order.paymentMethod === 'pi' ? 'Pi钱包' : getText({ zh: '余额支付', en: 'Balance', ko: '잔액', vi: 'Số dư' })}</span>
                </div>
                <div>
                  <span className="text-white/50">{getText({ zh: '订单状态:', en: 'Status:', ko: '상태:', vi: 'Trạng thái:' })} </span>
                  <span className="text-green-400">
                    {order.status === 'completed' ? getText({ zh: '已完成', en: 'Completed', ko: '완료', vi: 'Hoàn thành' }) : order.status}
                  </span>
                </div>
                {merchantName && (
                  <div>
                    <span className="text-white/50">{getText({ zh: '商家:', en: 'Merchant:', ko: '판매자:', vi: 'Người bán:' })} </span>
                    <span className="text-white">{merchantName}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 评价输入区域 - 独立卡片 */}
        <div className="bg-white rounded-lg p-3 mb-4">
          {/* 商品评价 */}
          <div className="mb-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-800">{getText({ zh: '商品评价', en: 'Product', ko: '상품', vi: 'Sản phẩm' })}</h4>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setProductRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-7 h-7 ${star <= productRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 商家评价 */}
          <div className="mb-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-800">{getText({ zh: '商家评价', en: 'Merchant', ko: '판매자', vi: 'Người bán' })}</h4>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setMerchantRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-7 h-7 ${star <= merchantRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 物流评价 */}
          <div className="mb-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-800">{getText({ zh: '物流评价', en: 'Logistics', ko: '배送', vi: 'Vận chuyển' })}</h4>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setLogisticsRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-7 h-7 ${star <= logisticsRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 综合评价 - 统一输入框 */}
          <div className="mb-3">
            <h4 className="text-sm font-bold text-gray-800 mb-2">{getText({ zh: '综合评价', en: 'Review', ko: '종합 평가', vi: 'Đánh giá tổng hợp' })}</h4>
            <textarea
              value={productContent}
              onChange={(e) => setProductContent(e.target.value)}
              placeholder={getText({ 
                zh: '分享您的购物体验...', 
                en: 'Share your shopping experience...', 
                ko: '쇼핑 경험을 공유해주세요...', 
                vi: 'Chia sẻ trải nghiệm mua sắm của bạn...' 
              })}
              className="w-full h-24 p-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-purple-500 text-xs"
              maxLength={500}
            />
            <p className="text-[10px] text-gray-400 text-right mt-1">{productContent.length}/500</p>
          </div>

          {/* 上传图片 */}
          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-2">
              {getText({ zh: '上传图片', en: 'Upload Images', ko: '이미지 업로드', vi: 'Tải ảnh lên' })}
              <span className="text-[10px] text-gray-400 ml-2">({images.length}/5)</span>
            </h4>
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
                  <Upload className="w-5 h-5 text-gray-400" />
                  <span className="text-[10px] text-gray-400 mt-1">{uploading ? getText({ zh: '上传中', en: 'Uploading', ko: '업로드 중', vi: 'Đang tải' }) : getText({ zh: '上传', en: 'Upload', ko: '업로드', vi: 'Tải lên' })}</span>
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
        </div>
      </main>

      {/* 提交按钮 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="max-w-md mx-auto px-4 py-3">
          <button
            onClick={handleSubmit}
            disabled={submitting || !productContent.trim()}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            {submitting ? getText({ zh: '提交中...', en: 'Submitting...', ko: '제출 중...', vi: 'Đang gửi...' }) : getText({ zh: '提交评价', en: 'Submit Review', ko: '리뷰 제출', vi: 'Gửi đánh giá' })}
          </button>
        </div>
      </div>
    </div>
  );
};
