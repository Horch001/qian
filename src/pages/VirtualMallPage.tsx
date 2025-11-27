import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Star, Zap, Shield, Award, DollarSign, TrendingUp, Heart } from 'lucide-react';
import { Language, Translations } from '../types';
import { SimpleSearchBar } from '../components/SimpleSearchBar';

export const VirtualMallPage: React.FC = () => {
  const { language, translations } = useOutletContext<{ language: Language; translations: Translations }>();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const navigate = useNavigate();

  const goToDetail = (item: any) => {
    navigate('/detail', { state: { item: { ...item, title: item.name, icon: item.emoji }, pageType: 'product' } });
  };

  const items = [
    {
      id: '1',
      name: { zh: '游戏点卡充值', en: 'Game Card Recharge', ko: '게임 카드 충전', vi: 'Nạp thẻ game' },
      emoji: '🎮',
      price: 50,
      rating: 4.9,
      stock: 9999,
      sales: 12580,
      favorites: 3456,
      shop: { zh: '游戏充值中心', en: 'Game Recharge Center', ko: '게임 충전 센터', vi: 'Trung tâm nạp game' },
      tag: { zh: '热销', en: 'Hot', ko: '인기', vi: 'Bán chạy' },
      discount: null,
    },
    {
      id: '2',
      name: { zh: '会员订阅服务', en: 'Membership Subscription', ko: '멤버십 구독', vi: 'Dịch vụ đăng ký thành viên' },
      emoji: '👑',
      price: 30,
      rating: 4.8,
      stock: 9999,
      sales: 8956,
      favorites: 2345,
      shop: { zh: 'VIP会员中心', en: 'VIP Member Center', ko: 'VIP 회원 센터', vi: 'Trung tâm VIP' },
      tag: { zh: '推荐', en: 'Featured', ko: '추천', vi: 'Đề xuất' },
      discount: 15,
    },
    {
      id: '3',
      name: { zh: '教学课程资料', en: 'Course Materials', ko: '과정 자료', vi: 'Tài liệu khóa học' },
      emoji: '📚',
      price: 99,
      rating: 4.7,
      stock: 9999,
      sales: 4523,
      favorites: 1567,
      shop: { zh: '在线教育平台', en: 'Online Education', ko: '온라인 교육', vi: 'Giáo dục trực tuyến' },
      tag: null,
      discount: null,
    },
  ];

  const features = [
    { icon: Zap, text: { zh: '自动发货', en: 'Auto Delivery', ko: '자동 배송', vi: 'Giao hàng tự động' } },
    { icon: Shield, text: { zh: '平台防诈', en: 'Anti-Fraud', ko: '사기 방지', vi: 'Chống lừa đảo' } },
    { icon: Award, text: { zh: '优质商家', en: 'Quality Sellers', ko: '우수 판매자', vi: 'Người bán chất lượng' } },
    { icon: DollarSign, text: { zh: '资金有保障', en: 'Secure Funds', ko: '안전한 자금', vi: 'Bảo vệ tiền' } },
  ];

  return (
    <div className="space-y-1">
      {/* 搜索框 */}
      <SimpleSearchBar language={language} translations={translations} />
      
      {/* 特色功能 */}
      <div className="grid grid-cols-4 gap-1.5">
        {features.map((feature, idx) => (
          <div key={idx} className="flex flex-col items-center gap-0.5 py-1">
            <feature.icon className="w-4 h-4 text-purple-600" strokeWidth={2.5} />
            <span className="text-[9px] text-gray-700 font-bold text-center leading-tight">{feature.text[language]}</span>
          </div>
        ))}
      </div>

      {/* 商品列表 */}
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => goToDetail(item)}
            className={`group relative overflow-hidden rounded-xl p-2 transition-all duration-300 cursor-pointer
                       ${selectedProduct === item.id 
                         ? 'bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-400 shadow-lg' 
                         : 'bg-white border border-purple-100 shadow-sm hover:shadow-lg hover:border-purple-300'}`}
          >
            {/* 标签 */}
            {item.tag && (
              <div className="absolute top-0 left-0 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-br-lg rounded-tl-lg z-10">
                {item.tag[language]}
              </div>
            )}
            {item.discount && (
              <div className="absolute top-0 right-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg rounded-tr-lg z-10">
                -{item.discount}%
              </div>
            )}
            
            <div className="flex gap-2 relative pt-6">
              <div className="w-14 h-14 flex items-center justify-center text-3xl flex-shrink-0 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg shadow-inner">
                {item.emoji}
              </div>
              <div className="flex-1 min-w-0 flex flex-col pr-16">
                <h3 className="font-bold text-gray-800 text-sm mb-0.5 line-clamp-1">
                  {item.name[language]}
                </h3>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-red-600 font-bold text-base leading-none">{item.price}π</span>
                    {item.discount && (
                      <span className="text-gray-400 text-[10px] line-through">{Math.round(item.price / (1 - item.discount / 100))}π</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] text-gray-600 leading-none">{language === 'zh' ? '库存' : 'Stock'}</span>
                      <span className="text-[10px] text-gray-900 font-bold leading-none mt-0.5">{item.stock}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] text-gray-600 leading-none">{language === 'zh' ? '评分' : 'Rating'}</span>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-[10px] text-gray-900 font-bold leading-none">{item.rating}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] text-gray-600 leading-none">{language === 'zh' ? '已售' : 'Sold'}</span>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        <TrendingUp className="w-2.5 h-2.5 text-green-600" />
                        <span className="text-[10px] text-gray-900 font-bold leading-none">{item.sales}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] text-gray-600 leading-none">{language === 'zh' ? '收藏' : 'Favs'}</span>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        <Heart className="w-2.5 h-2.5 fill-red-400 text-red-400" />
                        <span className="text-[10px] text-gray-900 font-bold leading-none">{item.favorites}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">{item.shop[language]}</div>
              </div>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); goToDetail(item); }}
              className="absolute bottom-1 right-1 px-3 py-1 bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold rounded-lg hover:from-red-700 hover:to-red-600 active:scale-95 transition-all shadow-md">
              {language === 'zh' ? '购买' : language === 'en' ? 'Buy' : language === 'ko' ? '구매' : 'Mua'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
