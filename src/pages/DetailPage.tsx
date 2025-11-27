import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Star, Heart, Share2, ShoppingCart, MessageCircle, Clock, Shield, Award, Store } from 'lucide-react';
import { Language, Translations } from '../types';

interface DetailPageProps {
  language: Language;
  translations: Translations;
}

export const DetailPage: React.FC<DetailPageProps> = ({ language, translations }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  
  // 从路由状态获取商品信息
  const item = location.state?.item || {
    id: '1',
    title: { zh: '商品详情', en: 'Product Detail', ko: '상품 상세', vi: 'Chi tiết sản phẩm' },
    price: 99,
    rating: 4.8,
    sales: 1000,
    favorites: 500,
    shop: { zh: '优质商家', en: 'Quality Shop', ko: '품질 상점', vi: 'Cửa hàng chất lượng' },
    icon: '📦',
    description: { zh: '暂无描述', en: 'No description', ko: '설명 없음', vi: 'Không có mô tả' },
  };
  
  const pageType = location.state?.pageType || 'product';

  const getActionButton = () => {
    switch (pageType) {
      case 'course':
        return { text: { zh: '立即报名', en: 'Enroll Now', ko: '지금 등록', vi: 'Đăng ký ngay' }, color: 'from-red-600 to-red-500' };
      case 'service':
        return { text: { zh: '立即预约', en: 'Book Now', ko: '지금 예약', vi: 'Đặt ngay' }, color: 'from-green-600 to-emerald-500' };
      case 'house':
        return { text: { zh: '预约看房', en: 'Schedule Visit', ko: '방문 예약', vi: 'Đặt lịch xem' }, color: 'from-amber-600 to-orange-500' };
      case 'detective':
        return { text: { zh: '立即咨询', en: 'Consult Now', ko: '지금 상담', vi: 'Tư vấn ngay' }, color: 'from-slate-600 to-gray-500' };
      case 'resource':
        return { text: { zh: '我要同求', en: 'Join Request', ko: '참여하기', vi: 'Tham gia' }, color: 'from-orange-600 to-red-500' };
      case 'invest':
        return { text: { zh: '立即投资', en: 'Invest Now', ko: '지금 투자', vi: 'Đầu tư ngay' }, color: 'from-purple-600 to-indigo-500' };
      default:
        return { text: { zh: '立即购买', en: 'Buy Now', ko: '지금 구매', vi: 'Mua ngay' }, color: 'from-red-600 to-red-500' };
    }
  };

  const actionButton = getActionButton();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-300 flex flex-col">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-sm font-bold text-gray-800">
            {language === 'zh' ? '商品详情' : language === 'en' ? 'Details' : language === 'ko' ? '상세 정보' : 'Chi tiết'}
          </h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsFavorite(!isFavorite)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Share2 className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-md w-full mx-auto overflow-auto pb-20">
        {/* 商品图片区域 */}
        <div className="bg-gradient-to-br from-purple-100 to-pink-100 h-48 flex items-center justify-center">
          <span className="text-7xl">{item.icon}</span>
        </div>

        {/* 商品信息 */}
        <div className="bg-white p-4 space-y-3">
          <div className="flex items-start justify-between">
            <h2 className="text-lg font-bold text-gray-800 flex-1">{item.title?.[language] || item.name?.[language] || item.resource?.[language] || '商品'}</h2>
            <span className="text-xl font-bold text-red-600">{item.price}π</span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-bold">{item.rating || 4.8}</span>
            </div>
            <span>|</span>
            <span>{language === 'zh' ? '已售' : 'Sold'} {item.sales || 0}</span>
            <span>|</span>
            <span>{language === 'zh' ? '收藏' : 'Favs'} {item.favorites || 0}</span>
          </div>
        </div>

        {/* 店铺信息 */}
        <div className="bg-white mt-2 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Store className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">{item.shop?.[language] || '商家'}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Award className="w-3 h-3 text-purple-600" />
                  <span>{language === 'zh' ? '认证商家' : 'Verified'}</span>
                </div>
              </div>
            </div>
            <button className="px-3 py-1.5 border border-purple-600 text-purple-600 text-xs font-bold rounded-lg hover:bg-purple-50 transition-colors">
              {language === 'zh' ? '进店' : 'Visit'}
            </button>
          </div>
        </div>

        {/* 服务保障 */}
        <div className="bg-white mt-2 p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-3">{language === 'zh' ? '服务保障' : 'Guarantees'}</h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Shield className="w-3.5 h-3.5 text-green-600" />
              <span>{language === 'zh' ? '平台担保' : 'Secured'}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>{language === 'zh' ? '极速响应' : 'Fast'}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Award className="w-3.5 h-3.5 text-purple-600" />
              <span>{language === 'zh' ? '品质保证' : 'Quality'}</span>
            </div>
          </div>
        </div>

        {/* 商品详情 */}
        <div className="bg-white mt-2 p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-3">{language === 'zh' ? '详情介绍' : 'Description'}</h3>
          <div className="text-sm text-gray-600 leading-relaxed">
            <p>{item.description?.[language] || (language === 'zh' ? '商家暂未上传详细介绍，请联系商家了解更多信息。' : 'No detailed description available. Please contact the seller for more information.')}</p>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                {language === 'zh' ? '更多详情内容由商家后台上传' : 'More details will be uploaded by the merchant'}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <button className="flex flex-col items-center gap-0.5 px-3">
            <MessageCircle className="w-5 h-5 text-gray-500" />
            <span className="text-[10px] text-gray-500">{language === 'zh' ? '客服' : 'Chat'}</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 px-3">
            <ShoppingCart className="w-5 h-5 text-gray-500" />
            <span className="text-[10px] text-gray-500">{language === 'zh' ? '购物车' : 'Cart'}</span>
          </button>
          <div className="flex-1 flex gap-2">
            <button className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all">
              {language === 'zh' ? '加入购物车' : 'Add to Cart'}
            </button>
            <button className={`flex-1 py-2.5 bg-gradient-to-r ${actionButton.color} text-white text-sm font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all`}>
              {actionButton.text[language]}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
