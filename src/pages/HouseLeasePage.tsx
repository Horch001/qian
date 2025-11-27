import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Star, Home, ShieldCheck, FileCheck, MapPin, Search, ChevronDown, Check } from 'lucide-react';
import { Language, Translations } from '../types';

export const HouseLeasePage: React.FC = () => {
  const { language, translations } = useOutletContext<{ language: Language; translations: Translations }>();
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState('');
  const [searchText, setSearchText] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 城市列表
  const cities = [
    { value: '', label: { zh: '全国', en: 'Nationwide', ko: '전국', vi: 'Toàn quốc' } },
    { value: 'beijing', label: { zh: '北京', en: 'Beijing', ko: '베이징', vi: 'Bắc Kinh' } },
    { value: 'shanghai', label: { zh: '上海', en: 'Shanghai', ko: '상하이', vi: 'Thượng Hải' } },
    { value: 'guangzhou', label: { zh: '广州', en: 'Guangzhou', ko: '광저우', vi: 'Quảng Châu' } },
    { value: 'shenzhen', label: { zh: '深圳', en: 'Shenzhen', ko: '선전', vi: 'Thâm Quyến' } },
    { value: 'hangzhou', label: { zh: '杭州', en: 'Hangzhou', ko: '항저우', vi: 'Hàng Châu' } },
    { value: 'chengdu', label: { zh: '成都', en: 'Chengdu', ko: '청두', vi: 'Thành Đô' } },
    { value: 'wuhan', label: { zh: '武汉', en: 'Wuhan', ko: '우한', vi: 'Vũ Hán' } },
    { value: 'xian', label: { zh: '西安', en: "Xi'an", ko: '시안', vi: 'Tây An' } },
    { value: 'nanjing', label: { zh: '南京', en: 'Nanjing', ko: '난징', vi: 'Nam Kinh' } },
    { value: 'chongqing', label: { zh: '重庆', en: 'Chongqing', ko: '충칭', vi: 'Trùng Khánh' } },
  ];

  const getCurrentCityLabel = () => {
    const city = cities.find(c => c.value === selectedCity);
    return city ? city.label[language] : cities[0].label[language];
  };

  const goToDetail = (property: any) => {
    navigate('/detail', { state: { item: { ...property, title: property.type }, pageType: 'house' } });
  };

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
      area: 120,
      hasSubway: true,
      hasElevator: true,
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
      area: 60,
      hasSubway: false,
      hasElevator: true,
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
      area: 80,
      hasSubway: true,
      hasElevator: true,
    },
  ];

  const sortOptions = [
    { value: 'default', label: { zh: '默认排序', en: 'Default', ko: '기본', vi: 'Mặc định' } },
    { value: 'price_high', label: { zh: '价格从高到低', en: 'Price: High to Low', ko: '가격: 높은순', vi: 'Giá: Cao đến thấp' } },
    { value: 'price_low', label: { zh: '价格从低到高', en: 'Price: Low to High', ko: '가격: 낮은순', vi: 'Giá: Thấp đến cao' } },
    { value: 'area_large', label: { zh: '面积从大到小', en: 'Area: Large to Small', ko: '면적: 큰순', vi: 'Diện tích: Lớn đến nhỏ' } },
    { value: 'area_small', label: { zh: '面积从小到大', en: 'Area: Small to Large', ko: '면적: 작은순', vi: 'Diện tích: Nhỏ đến lớn' } },
    { value: 'subway', label: { zh: '近地铁', en: 'Near Subway', ko: '지하철 근처', vi: 'Gần tàu điện' } },
    { value: 'elevator', label: { zh: '有电梯', en: 'Has Elevator', ko: '엘리베이터', vi: 'Có thang máy' } },
  ];

  const sortedProperties = useMemo(() => {
    let sorted = [...properties];
    switch (sortBy) {
      case 'price_high': return sorted.sort((a, b) => b.price - a.price);
      case 'price_low': return sorted.sort((a, b) => a.price - b.price);
      case 'area_large': return sorted.sort((a, b) => (b.area || 0) - (a.area || 0));
      case 'area_small': return sorted.sort((a, b) => (a.area || 0) - (b.area || 0));
      case 'subway': return sorted.filter(p => p.hasSubway);
      case 'elevator': return sorted.filter(p => p.hasElevator);
      default: return sorted;
    }
  }, [sortBy]);

  const features = [
    { icon: Home, text: { zh: '真实房源', en: 'Real Listings', ko: '실제 매물', vi: 'Nhà thật' } },
    { icon: ShieldCheck, text: { zh: '安全可靠', en: 'Safe & Reliable', ko: '안전 신뢰', vi: 'An toàn tin cậy' } },
    { icon: FileCheck, text: { zh: '合同保障', en: 'Contract Protected', ko: '계약 보호', vi: 'Hợp đồng bảo vệ' } },
    { icon: MapPin, text: { zh: '覆盖全国', en: 'Nationwide', ko: '전국 커버', vi: 'Toàn quốc' } },
  ];

  return (
    <div className="space-y-1">
      {/* 带城市下拉框的搜索栏 - 与首页样式一致 */}
      <div className="relative w-full" ref={dropdownRef}>
        <div className="relative flex items-center w-full rounded-lg border border-gray-400 bg-white shadow-sm transition-colors focus-within:border-purple-500">
          {/* 城市选择按钮 */}
          <button 
            onClick={() => setShowCityDropdown(!showCityDropdown)}
            className="flex items-center gap-1 pl-3 pr-2 h-9 cursor-pointer group hover:bg-gray-50 rounded-l-lg transition-colors shrink-0"
          >
            <MapPin size={14} className="text-purple-600" strokeWidth={2.5} />
            <span className="text-[13px] font-bold text-gray-700 truncate max-w-[4.5rem]">
              {getCurrentCityLabel()}
            </span>
            <ChevronDown 
              size={12} 
              className={`text-gray-400 transition-transform duration-200 ${showCityDropdown ? 'rotate-180' : ''}`} 
              strokeWidth={2.5}
            />
          </button>

          <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>

          {/* 搜索框 */}
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={language === 'zh' ? '搜索房源...' : language === 'en' ? 'Search listings...' : language === 'ko' ? '매물 검색...' : 'Tìm kiếm...'}
            className="flex-1 py-1.5 pr-10 outline-none text-sm text-gray-700 bg-transparent placeholder-gray-400 h-full min-w-0"
          />

          <div className="absolute right-3 text-gray-500 pointer-events-none">
            <Search size={18} strokeWidth={2.5} />
          </div>
        </div>

        {/* 城市下拉菜单 */}
        {showCityDropdown && (
          <div className="absolute top-full left-0 mt-1.5 w-48 bg-white/95 backdrop-blur-xl rounded-lg border border-white/50 shadow-xl overflow-hidden max-h-[60vh] flex flex-col z-50">
            <div className="px-3 py-2 border-b border-gray-100 bg-purple-50/50 flex-none">
              <span className="text-[11px] font-bold text-purple-900">
                {language === 'zh' ? '选择城市' : language === 'en' ? 'Select City' : language === 'ko' ? '도시 선택' : 'Chọn thành phố'}
              </span>
            </div>
            <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-purple-200 p-1">
              {cities.map((city) => (
                <button
                  key={city.value}
                  onClick={() => {
                    setSelectedCity(city.value);
                    setShowCityDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-[12px] font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded flex items-center justify-between"
                >
                  <span>{city.value === '' ? '🌍 ' : ''}{city.label[language]}</span>
                  {selectedCity === city.value && <Check size={12} className="text-purple-600" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
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
        {sortedProperties.map((property) => (
          <div
            key={property.id}
            onClick={() => goToDetail(property)}
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
                  <div className="flex items-center gap-2">
                    <span className="text-red-600 font-bold text-base leading-none">{property.price}π/月</span>
                    {property.hasSubway && (
                      <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">
                        🚇 {language === 'zh' ? '近地铁' : 'Subway'}
                      </span>
                    )}
                    {property.hasElevator && (
                      <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                        🛗 {language === 'zh' ? '有电梯' : 'Elevator'}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] text-gray-600 leading-none">{language === 'zh' ? '面积' : 'Area'}</span>
                      <span className="text-[10px] text-gray-900 font-bold leading-none mt-0.5">{property.area}㎡</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] text-gray-600 leading-none">{language === 'zh' ? '收藏' : 'Favs'}</span>
                      <span className="text-[10px] text-gray-900 font-bold leading-none mt-0.5">{property.favorites}</span>
                    </div>
                  </div>
                </div>
                {/* 商家名称和评分 */}
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <span>{property.shop[language]}</span>
                  <span className="flex items-center gap-0.5 text-yellow-600">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold">{property.rating}</span>
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); goToDetail(property); }}
              className="absolute bottom-1 right-1 px-3 py-1 bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold rounded-lg hover:from-red-700 hover:to-red-600 active:scale-95 transition-all shadow-md">
              {language === 'zh' ? '看房' : language === 'en' ? 'View' : language === 'ko' ? '보기' : 'Xem'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
