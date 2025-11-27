import React, { useState, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Star, Users, Clock, MapPin, ChevronDown } from 'lucide-react';
import { Language, Translations } from '../types';
import { SimpleSearchBar } from '../components/SimpleSearchBar';

export const PrivateDetectivePage: React.FC = () => {
  const { language, translations } = useOutletContext<{ language: Language; translations: Translations }>();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('default');
  const navigate = useNavigate();

  const goToDetail = (service: any) => {
    navigate('/detail', { state: { item: { ...service, title: service.name }, pageType: 'detective' } });
  };

  const services = [
    {
      id: '1',
      name: { zh: '线索收集', en: 'Evidence Collection', ko: '증거 수집', vi: 'Thu thập bằng chứng' },
      icon: '🔍',
      price: 2000,
      rating: 4.9,
      sales: 1234,
      favorites: 456,
      shop: { zh: '专业调查事务所', en: 'Pro Investigation', ko: '전문 조사', vi: 'Điều tra chuyên nghiệp' },
      badge: { zh: '专业', en: 'Professional', ko: '전문가', vi: 'Chuyên nghiệp' },
    },
    {
      id: '2',
      name: { zh: '背景调查', en: 'Background Check', ko: '배경 조사', vi: 'Kiểm tra nền tảng' },
      icon: '📋',
      price: 3000,
      rating: 4.8,
      sales: 987,
      favorites: 345,
      shop: { zh: '背景调查中心', en: 'Background Check Center', ko: '배경 조사 센터', vi: 'Trung tâm kiểm tra' },
      badge: { zh: '保密', en: 'Confidential', ko: '기밀', vi: 'Bảo mật' },
    },
    {
      id: '3',
      name: { zh: '取证调查', en: 'Evidence Investigation', ko: '증거 조사', vi: 'Điều tra lấy bằng chứng' },
      icon: '⚖️',
      price: 5000,
      rating: 4.7,
      sales: 567,
      favorites: 234,
      shop: { zh: '法律取证服务', en: 'Legal Evidence Service', ko: '법적 증거 서비스', vi: 'Dịch vụ bằng chứng pháp lý' },
      badge: { zh: '权威', en: 'Authoritative', ko: '권위', vi: 'Uy tín' },
    },
  ];

  const sortOptions = [
    { value: 'default', label: { zh: '默认排序', en: 'Default', ko: '기본', vi: 'Mặc định' } },
    { value: 'price_high', label: { zh: '价格从高到低', en: 'Price: High to Low', ko: '가격: 높은순', vi: 'Giá: Cao đến thấp' } },
    { value: 'price_low', label: { zh: '价格从低到高', en: 'Price: Low to High', ko: '가격: 낮은순', vi: 'Giá: Thấp đến cao' } },
    { value: 'sales', label: { zh: '销量优先', en: 'Best Selling', ko: '판매량순', vi: 'Bán chạy nhất' } },
    { value: 'deposit', label: { zh: '已缴纳保证金', en: 'Deposit Paid', ko: '보증금 납부', vi: 'Đã đặt cọc' } },
  ];

  const sortedServices = useMemo(() => {
    const sorted = [...services];
    switch (sortBy) {
      case 'price_high': return sorted.sort((a, b) => b.price - a.price);
      case 'price_low': return sorted.sort((a, b) => a.price - b.price);
      case 'sales': return sorted.sort((a, b) => b.sales - a.sales);
      default: return sorted;
    }
  }, [sortBy]);

  const features = [
    { icon: Users, text: { zh: '专业团队', en: 'Pro Team', ko: '전문 팀', vi: 'Đội chuyên nghiệp' } },
    { icon: Clock, text: { zh: '24H在线', en: '24H Online', ko: '24시간 온라인', vi: '24H trực tuyến' } },
    { icon: MapPin, text: { zh: '覆盖全国', en: 'Nationwide', ko: '전국 커버', vi: 'Toàn quốc' } },
    { icon: Star, text: { zh: '专业服务', en: 'Pro Service', ko: '전문 서비스', vi: 'Dịch vụ chuyên nghiệp' } },
  ];

  return (
    <div className="space-y-1">
      <SimpleSearchBar language={language} translations={translations} />
      
      <div className="grid grid-cols-4 gap-1.5">
        {features.map((feature, idx) => (
          <div key={idx} className="flex flex-col items-center gap-0.5 py-1">
            <feature.icon className="w-4 h-4 text-purple-600" strokeWidth={2.5} />
            <span className="text-[9px] text-gray-700 font-bold text-center leading-tight">{feature.text[language]}</span>
          </div>
        ))}
      </div>

      {/* 筛选下拉框 */}
      <div className="relative">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 appearance-none cursor-pointer focus:outline-none focus:border-purple-400"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label[language]}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      <div className="space-y-2">
        {sortedServices.map((service) => (
          <div
            key={service.id}
            onClick={() => goToDetail(service)}
            className={`group relative overflow-hidden rounded-xl p-2 transition-all duration-300 cursor-pointer
                       ${selectedService === service.id 
                         ? 'bg-gradient-to-br from-slate-50 to-gray-50 border-2 border-slate-400 shadow-lg' 
                         : 'bg-white border border-purple-100 shadow-sm hover:shadow-lg hover:border-slate-300'}`}
          >
            <div className="absolute top-0 right-0 bg-gradient-to-r from-slate-600 to-gray-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg rounded-tr-lg shadow-md">
              {service.badge[language]}
            </div>
            
            <div className="flex gap-2 relative">
              <div className="w-14 h-14 flex items-center justify-center text-3xl flex-shrink-0 bg-gradient-to-br from-slate-100 to-gray-100 rounded-lg shadow-inner">
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
                      <span className="text-[10px] text-gray-900 font-bold leading-none mt-0.5">{service.rating}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] text-gray-600 leading-none">{language === 'zh' ? '已售' : 'Sold'}</span>
                      <span className="text-[10px] text-gray-900 font-bold leading-none mt-0.5">{service.sales}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] text-gray-600 leading-none">{language === 'zh' ? '收藏' : 'Favs'}</span>
                      <span className="text-[10px] text-gray-900 font-bold leading-none mt-0.5">{service.favorites}</span>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">{service.shop[language]}</div>
              </div>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); goToDetail(service); }}
              className="absolute bottom-1 right-1 px-3 py-1 bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold rounded-lg hover:from-red-700 hover:to-red-600 active:scale-95 transition-all shadow-md">
              {language === 'zh' ? '咨询' : language === 'en' ? 'Consult' : language === 'ko' ? '상담' : 'Tư vấn'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
