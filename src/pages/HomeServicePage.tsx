import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Star, UserCheck, ShieldCheck, BadgeCheck, MapPin, TrendingUp, Heart } from 'lucide-react';
import { Language, Translations } from '../types';
import { SearchBar } from '../components/SearchBar';

export const HomeServicePage: React.FC = () => {
  const { language, translations } = useOutletContext<{ language: Language, translations: Translations }>();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const navigate = useNavigate();

  const goToDetail = (service: any) => {
    navigate('/detail', { state: { item: { ...service, title: service.name }, pageType: 'service' } });
  };

  const services = [
    {
      id: '1',
      name: { zh: '家庭保洁', en: 'Home Cleaning', ko: '가정 청소', vi: 'Vệ sinh nhà cửa' },
      icon: '🧹',
      price: 99,
      rating: 4.9,
      sales: 8956,
      favorites: 2345,
      shop: { zh: '专业保洁服务', en: 'Pro Cleaning Service', ko: '전문 청소 서비스', vi: 'Dịch vụ vệ sinh chuyên nghiệp' },
      badge: { zh: '热门', en: 'Hot', ko: '인기', vi: 'Phổ biến' },
    },
    {
      id: '2',
      name: { zh: '家电维修', en: 'Appliance Repair', ko: '가전제품 수리', vi: 'Sửa chữa thiết bị' },
      icon: '🔧',
      price: 59,
      rating: 4.8,
      sales: 5234,
      favorites: 1567,
      shop: { zh: '家电维修中心', en: 'Appliance Repair Center', ko: '가전 수리 센터', vi: 'Trung tâm sửa chữa' },
      badge: { zh: '快速', en: 'Fast', ko: '빠른', vi: 'Nhanh' },
    },
    {
      id: '3',
      name: { zh: '搬家服务', en: 'Moving Service', ko: '이동 서비스', vi: 'Dịch vụ chuyển nhà' },
      icon: '📦',
      price: 299,
      rating: 4.7,
      sales: 3456,
      favorites: 987,
      shop: { zh: '快捷搬家公司', en: 'Quick Moving Co.', ko: '빠른 이사 회사', vi: 'Công ty chuyển nhà nhanh' },
      badge: { zh: '专业', en: 'Pro', ko: '전문', vi: 'Chuyên nghiệp' },
    },
    {
      id: '4',
      name: { zh: '跑腿代办', en: 'Errand Service', ko: '심부름 서비스', vi: 'Dịch vụ chạy việc' },
      icon: '🏃',
      price: 29,
      rating: 4.6,
      sales: 12580,
      favorites: 3456,
      shop: { zh: '同城跑腿服务', en: 'City Errand Service', ko: '도시 심부름 서비스', vi: 'Dịch vụ chạy việc thành phố' },
      badge: { zh: '便捷', en: 'Easy', ko: '편리', vi: 'Tiện lợi' },
    },
  ];

  const features = [
    { icon: UserCheck, text: { zh: '实名认证', en: 'Real-Name Auth', ko: '실명 인증', vi: 'Xác thực tên thật' } },
    { icon: ShieldCheck, text: { zh: '安全有保障', en: 'Safe & Secure', ko: '안전 보장', vi: 'An toàn bảo đảm' } },
    { icon: BadgeCheck, text: { zh: '已缴纳保证金', en: 'Deposit Paid', ko: '보증금 납부', vi: 'Đã đặt cọc' } },
    { icon: MapPin, text: { zh: '覆盖全国', en: 'Nationwide', ko: '전국 커버', vi: 'Toàn quốc' } },
  ];

  return (
    <div className="space-y-1">
      <SearchBar language={language} translations={translations} />
      
      <div className="grid grid-cols-4 gap-1.5">
        {features.map((feature, idx) => (
          <div key={idx} className="flex flex-col items-center gap-0.5 py-1">
            <feature.icon className="w-4 h-4 text-purple-600" strokeWidth={2.5} />
            <span className="text-[9px] text-gray-700 font-bold text-center leading-tight">{feature.text[language]}</span>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {services.map((service) => (
          <div
            key={service.id}
            onClick={() => goToDetail(service)}
            className={`group relative overflow-hidden rounded-xl p-2 transition-all duration-300 cursor-pointer
                       ${selectedService === service.id 
                         ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400 shadow-lg' 
                         : 'bg-white border border-purple-100 shadow-sm hover:shadow-lg hover:border-green-300'}`}
          >
            <div className="absolute top-0 right-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg rounded-tr-lg shadow-md">
              {service.badge[language]}
            </div>
            
            <div className="flex gap-2 relative">
              <div className="w-14 h-14 flex items-center justify-center text-3xl flex-shrink-0 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg shadow-inner">
                {service.icon}
              </div>
              <div className="flex-1 min-w-0 flex flex-col pr-16">
                <h3 className="font-bold text-gray-800 text-sm mb-0.5 line-clamp-1">
                  {service.name[language]}
                </h3>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-red-600 font-bold text-base leading-none">{service.price}π</span>
                  <div className="flex gap-2">
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] text-gray-600 leading-none">{language === 'zh' ? '评分' : 'Rating'}</span>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-[10px] text-gray-900 font-bold leading-none">{service.rating}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] text-gray-600 leading-none">{language === 'zh' ? '已售' : 'Sold'}</span>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        <TrendingUp className="w-2.5 h-2.5 text-green-600" />
                        <span className="text-[10px] text-gray-900 font-bold leading-none">{service.sales}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] text-gray-600 leading-none">{language === 'zh' ? '收藏' : 'Favs'}</span>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        <Heart className="w-2.5 h-2.5 fill-red-400 text-red-400" />
                        <span className="text-[10px] text-gray-900 font-bold leading-none">{service.favorites}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">{service.shop[language]}</div>
              </div>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); goToDetail(service); }}
              className="absolute bottom-1 right-1 px-3 py-1 bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold rounded-lg hover:from-red-700 hover:to-red-600 active:scale-95 transition-all shadow-md">
              {language === 'zh' ? '预订' : language === 'en' ? 'Book' : language === 'ko' ? '예약' : 'Đặt'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
