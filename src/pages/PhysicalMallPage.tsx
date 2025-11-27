import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { ShoppingBag, Star, Package, Truck, Shield, TrendingUp, Heart } from 'lucide-react';
import { Language, Translations } from '../types';
import { SimpleSearchBar } from '../components/SimpleSearchBar';

export const PhysicalMallPage: React.FC = () => {
  const { language, translations } = useOutletContext<{ language: Language; translations: Translations }>();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const navigate = useNavigate();

  const goToDetail = (product: any) => {
    navigate('/detail', { state: { item: { ...product, title: product.name }, pageType: 'product' } });
  };

  const products = [
    {
      id: '1',
      name: { zh: '日用百货套装', en: 'Daily Essentials Kit', ko: '일상용품 세트', vi: 'Bộ hàng tiêu dùng hàng ngày' },
      price: 99,
      image: '🛍️',
      rating: 4.8,
      reviews: 1250,
      stock: 156,
      sales: 3580,
      favorites: 856,
      shop: { zh: '品质生活馆', en: 'Quality Life Store', ko: '품질 생활관', vi: 'Cửa hàng chất lượng' },
      badge: { zh: '包邮', en: 'Free Ship', ko: '무료배송', vi: 'Miễn phí' },
    },
    {
      id: '2',
      name: { zh: '数码配件包', en: 'Digital Accessories', ko: '디지털 액세서리', vi: 'Phụ kiện kỹ thuật số' },
      price: 299,
      image: '💻',
      rating: 4.6,
      reviews: 856,
      stock: 89,
      sales: 2156,
      favorites: 432,
      shop: { zh: '科技数码店', en: 'Tech Digital Store', ko: '기술 디지털 스토어', vi: 'Cửa hàng kỹ thuật số' },
      badge: { zh: '新品', en: 'New', ko: '신상품', vi: 'Mới' },
    },
    {
      id: '3',
      name: { zh: '居家好物精选', en: 'Home Decor Collection', ko: '홈 데코 컬렉션', vi: 'Bộ sưu tập trang trí nhà cửa' },
      price: 199,
      image: '🏠',
      rating: 4.9,
      reviews: 2103,
      stock: 234,
      sales: 5234,
      favorites: 1234,
      shop: { zh: '温馨家居店', en: 'Cozy Home Store', ko: '아늑한 홈 스토어', vi: 'Cửa hàng gia đình ấm cúng' },
      badge: { zh: '爆款', en: 'Best Seller', ko: '베스트', vi: 'Bán chạy' },
    },
  ];

  const features = [
    { icon: Shield, text: { zh: '正品保证', en: 'Genuine', ko: '정품 보증', vi: 'Chính hãng' } },
    { icon: Truck, text: { zh: '24h发货', en: '24h Ship', ko: '24시간 발송', vi: 'Giao 24h' } },
    { icon: Package, text: { zh: '7天无理由', en: '7-Day Return', ko: '7일 반품', vi: 'Trả 7 ngày' } },
    { icon: ShoppingBag, text: { zh: '全国包邮', en: 'Free Ship', ko: '무료 배송', vi: 'Miễn phí ship' } },
  ];

  const getBadgeColor = (badge: string) => {
    if (badge.includes('包邮') || badge.includes('Free')) return 'from-green-500 to-emerald-500';
    if (badge.includes('新品') || badge.includes('New')) return 'from-blue-500 to-cyan-500';
    if (badge.includes('爆款') || badge.includes('Best')) return 'from-red-500 to-orange-500';
    return 'from-purple-500 to-pink-500';
  };

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
        {products.map((product) => (
          <div
            key={product.id}
            onClick={() => goToDetail(product)}
            className={`group relative overflow-hidden rounded-xl p-2 transition-all duration-300 cursor-pointer
                       ${selectedProduct === product.id 
                         ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-400 shadow-lg' 
                         : 'bg-white border border-purple-100 shadow-sm hover:shadow-lg hover:border-purple-300'}`}
          >
            {/* 徽章 */}
            <div className={`absolute top-0 right-0 bg-gradient-to-r ${getBadgeColor(product.badge[language])} text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg rounded-tr-lg shadow-md`}>
              {product.badge[language]}
            </div>
            
            <div className="flex gap-2 relative">
              <div className="w-14 h-14 flex items-center justify-center text-3xl flex-shrink-0 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg shadow-inner">
                {product.image}
              </div>
              <div className="flex-1 min-w-0 flex flex-col pr-16">
                <h3 className="font-bold text-gray-800 text-sm mb-0.5 line-clamp-1">
                  {product.name[language]}
                </h3>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-red-600 font-bold text-base leading-none">{product.price}π</span>
                  <div className="flex gap-2">
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] text-gray-600 leading-none">{language === 'zh' ? '库存' : 'Stock'}</span>
                      <span className="text-[10px] text-gray-900 font-bold leading-none mt-0.5">{product.stock}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] text-gray-600 leading-none">{language === 'zh' ? '评分' : 'Rating'}</span>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-[10px] text-gray-900 font-bold leading-none">{product.rating}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] text-gray-600 leading-none">{language === 'zh' ? '已售' : 'Sold'}</span>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        <TrendingUp className="w-2.5 h-2.5 text-green-600" />
                        <span className="text-[10px] text-gray-900 font-bold leading-none">{product.sales}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] text-gray-600 leading-none">{language === 'zh' ? '收藏' : 'Favs'}</span>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        <Heart className="w-2.5 h-2.5 fill-red-400 text-red-400" />
                        <span className="text-[10px] text-gray-900 font-bold leading-none">{product.favorites}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">{product.shop[language]}</div>
              </div>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); goToDetail(product); }}
              className="absolute bottom-1 right-1 px-3 py-1 bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold rounded-lg hover:from-red-700 hover:to-red-600 active:scale-95 transition-all shadow-md">
              {language === 'zh' ? '购买' : language === 'en' ? 'Buy' : language === 'ko' ? '구매' : 'Mua'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
