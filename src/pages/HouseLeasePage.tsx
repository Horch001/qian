import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Star, Home, ShieldCheck, FileCheck, MapPin, TrendingUp, Heart } from 'lucide-react';
import { Language, Translations } from '../types';
import { SimpleSearchBar } from '../components/SimpleSearchBar';

export const HouseLeasePage: React.FC = () => {
  const { language, translations } = useOutletContext<{ language: Language; translations: Translations }>();
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);

  const properties = [
    {
      id: '1',
      type: { zh: '整租', en: 'Full rent', ko: '전체 임대', vi: 'Cho thuê toàn bộ' },
      icon: '🏠',
      price: 1500,
      rating: 4.8,
      sales: 2345,
      favorites: 890,
      shop: { zh: '优质房源中心', en: 'Quality Housing', ko: '품질 주택', vi: 'Nhà chất lượng' },
      badge: { zh: '精选', en: 'Featured', ko: '추천', vi: 'Nổi bật' },
    },
    {
      id: '2',
      type: { zh: '合租', en: 'Co-rent', ko: '공동 임대', vi: 'Cho thuê chung' },
      icon: '👥',
      price: 500,
      rating: 4.7,
      sales: 4567,
      favorites: 1234,
      shop: { zh: '合租之家', en: 'Co-rent Home', ko: '공동 임대 홈', vi: 'Nhà cho thuê chung' },
      badge: { zh: '实惠', en: 'Affordable', ko: '저렴', vi: 'Giá tốt' },
    },
    {
      id: '3',
      type: { zh: '民宿短租', en: 'Short-term', ko: '단기 임대', vi: 'Cho thuê ngắn hạn' },
      icon: '🏨',
      price: 100,
      rating: 4.6,
      sales: 3456,
      favorites: 987,
      shop: { zh: '民宿管家', en: 'Homestay Manager', ko: '홈스테이 관리자', vi: 'Quản lý homestay' },
      badge: { zh: '灵活', en: 'Flexible', ko: '유연', vi: 'Linh hoạt' },
    },
  ];

  const features = [
    { icon: Home, text: { zh: '真实房源', en: 'Real Listings', ko: '실제 매물', vi: 'Nhà thật' } },
    { icon: ShieldCheck, text: { zh: '安全可靠', en: 'Safe & Reliable', ko: '안전 신뢰', vi: 'An toàn tin cậy' } },
    { icon: FileCheck, text: { zh: '合同保障', en: 'Contract Protected', ko: '계약 보호', vi: 'Hợp đồng bảo vệ' } },
    { icon: MapPin, text: { zh: '覆盖全国', en: 'Nationwide', ko: '전국 커버', vi: 'Toàn quốc' } },
  ];

  return (
    <div className="space-y-2">
      <SimpleSearchBar language={language} translations={translations} />
      
      <div className="grid grid-cols-4 gap-1.5">
        {features.map((feature, idx) => (
          <div key={idx} className="flex flex-col items-center gap-0.5 py-1">
            <feature.icon className="w-4 h-4 text-purple-600" strokeWidth={2.5} />
            <span className="text-[9px] text-gray-700 font-bold text-center leading-tight">{feature.text[language]}</span>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {properties.map((property) => (
          <div
            key={property.id}
            onClick={() => setSelectedProperty(property.id)}
            className={`group relative overflow-hidden rounded-xl p-2 transition-all duration-300 cursor-pointer
                       ${selectedProperty === property.id 
                         ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-400 shadow-lg' 
                         : 'bg-white border border-purple-100 shadow-sm hover:shadow-lg hover:border-amber-300'}`}
          >
            <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg rounded-tr-lg shadow-md">
              {property.badge[language]}
            </div>
            
            <div className="flex gap-2 relative">
              <div className="w-14 h-14 flex items-center justify-center text-3xl flex-shrink-0 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg shadow-inner">
                {property.icon}
              </div>
              <div className="flex-1 min-w-0 flex flex-col pr-16">
                <h3 className="font-bold text-gray-800 text-sm mb-0.5 line-clamp-1">
                  {property.type[language]}
                </h3>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-red-600 font-bold text-base leading-none">{property.price}π/月</span>
                  <div className="flex gap-2">
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] text-gray-600 leading-none">{language === 'zh' ? '评分' : 'Rating'}</span>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-[10px] text-gray-900 font-bold leading-none">{property.rating}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] text-gray-600 leading-none">{language === 'zh' ? '已租' : 'Rented'}</span>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        <TrendingUp className="w-2.5 h-2.5 text-green-600" />
                        <span className="text-[10px] text-gray-900 font-bold leading-none">{property.sales}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] text-gray-600 leading-none">{language === 'zh' ? '收藏' : 'Favs'}</span>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        <Heart className="w-2.5 h-2.5 fill-red-400 text-red-400" />
                        <span className="text-[10px] text-gray-900 font-bold leading-none">{property.favorites}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">{property.shop[language]}</div>
              </div>
            </div>
            <button className="absolute bottom-1 right-1 px-3 py-1 bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold rounded-lg hover:from-red-700 hover:to-red-600 active:scale-95 transition-all shadow-md">
              {language === 'zh' ? '看房' : language === 'en' ? 'View' : language === 'ko' ? '보기' : 'Xem'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
