import React, { useState, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Star, UserCheck, ShieldCheck, BadgeCheck, MapPin, ChevronDown } from 'lucide-react';
import { Language, Translations } from '../types';
import { SearchBar } from '../components/SearchBar';

export const OfflinePlaYPage: React.FC = () => {
  const { language, translations } = useOutletContext<{ language: Language; translations: Translations }>();
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('default');
  const navigate = useNavigate();

  const goToDetail = (activity: any) => {
    navigate('/detail', { state: { item: { ...activity, title: activity.name }, pageType: 'service' } });
  };

  const activities = [
    {
      id: '1',
      name: { zh: '电竞陪玩', en: 'Gaming Companion', ko: '게임 동료', vi: 'Bạn chơi game' },
      icon: '🎮',
      price: 50,
      rating: 4.8,
      sales: 6789,
      favorites: 2345,
      shop: { zh: '电竞陪玩工作室', en: 'Gaming Studio', ko: '게임 스튜디오', vi: 'Studio game' },
      badge: { zh: '热门', en: 'Hot', ko: '인기', vi: 'Phổ biến' },
    },
    {
      id: '2',
      name: { zh: '体育陪练', en: 'Sports Training', ko: '스포츠 훈련', vi: 'Đào tạo thể thao' },
      icon: '⚽',
      price: 60,
      rating: 4.7,
      sales: 3456,
      favorites: 1234,
      shop: { zh: '运动健身中心', en: 'Sports Center', ko: '스포츠 센터', vi: 'Trung tâm thể thao' },
      badge: { zh: '专业', en: 'Pro', ko: '전문', vi: 'Chuyên nghiệp' },
    },
    {
      id: '3',
      name: { zh: '娱乐陪玩', en: 'Entertainment Buddy', ko: '엔터테인먼트 친구', vi: 'Bạn giải trí' },
      icon: '🎭',
      price: 40,
      rating: 4.6,
      sales: 5123,
      favorites: 1890,
      shop: { zh: '娱乐陪伴服务', en: 'Entertainment Service', ko: '엔터테인먼트 서비스', vi: 'Dịch vụ giải trí' },
      badge: { zh: '推荐', en: 'Featured', ko: '추천', vi: 'Đề xuất' },
    },
  ];

  const sortOptions = [
    { value: 'default', label: { zh: '默认排序', en: 'Default', ko: '기본', vi: 'Mặc định' } },
    { value: 'price_high', label: { zh: '价格从高到低', en: 'Price: High to Low', ko: '가격: 높은순', vi: 'Giá: Cao đến thấp' } },
    { value: 'price_low', label: { zh: '价格从低到高', en: 'Price: Low to High', ko: '가격: 낮은순', vi: 'Giá: Thấp đến cao' } },
    { value: 'sales', label: { zh: '销量优先', en: 'Best Selling', ko: '판매량순', vi: 'Bán chạy nhất' } },
    { value: 'deposit', label: { zh: '已缴纳保证金', en: 'Deposit Paid', ko: '보증금 납부', vi: 'Đã đặt cọc' } },
  ];

  const sortedActivities = useMemo(() => {
    const sorted = [...activities];
    switch (sortBy) {
      case 'price_high': return sorted.sort((a, b) => b.price - a.price);
      case 'price_low': return sorted.sort((a, b) => a.price - b.price);
      case 'sales': return sorted.sort((a, b) => b.sales - a.sales);
      default: return sorted;
    }
  }, [sortBy]);

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
        {sortedActivities.map((activity) => (
          <div
            key={activity.id}
            onClick={() => goToDetail(activity)}
            className={`group relative overflow-hidden rounded-xl p-2 transition-all duration-300 cursor-pointer
                       ${selectedActivity === activity.id 
                         ? 'bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-400 shadow-lg' 
                         : 'bg-white border border-purple-100 shadow-sm hover:shadow-lg hover:border-cyan-300'}`}
          >
            <div className="absolute top-0 right-0 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg rounded-tr-lg shadow-md">
              {activity.badge[language]}
            </div>
            
            <div className="flex gap-2 relative">
              <div className="w-14 h-14 flex items-center justify-center text-3xl flex-shrink-0 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-lg shadow-inner">
                {activity.icon}
              </div>
              <div className="flex-1 min-w-0 flex flex-col pr-16">
                <h3 className="font-bold text-gray-800 text-sm mb-0.5 line-clamp-1">
                  {activity.name[language]}
                </h3>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-red-600 font-bold text-base leading-none">{activity.price}π/h</span>
                  <div className="flex gap-2">
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] text-gray-600 leading-none">{language === 'zh' ? '评分' : 'Rating'}</span>
                      <span className="text-[10px] text-gray-900 font-bold leading-none mt-0.5">{activity.rating}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] text-gray-600 leading-none">{language === 'zh' ? '已售' : 'Sold'}</span>
                      <span className="text-[10px] text-gray-900 font-bold leading-none mt-0.5">{activity.sales}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] text-gray-600 leading-none">{language === 'zh' ? '收藏' : 'Favs'}</span>
                      <span className="text-[10px] text-gray-900 font-bold leading-none mt-0.5">{activity.favorites}</span>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">{activity.shop[language]}</div>
              </div>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); goToDetail(activity); }}
              className="absolute bottom-1 right-1 px-3 py-1 bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold rounded-lg hover:from-red-700 hover:to-red-600 active:scale-95 transition-all shadow-md">
              {language === 'zh' ? '预约' : language === 'en' ? 'Book' : language === 'ko' ? '예약' : 'Đặt'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
