import React, { useState, useRef, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Star, Home, ShieldCheck, FileCheck, MapPin, Search, ChevronDown, Check, Loader2 } from 'lucide-react';
import { Language, Translations } from '../types';
import { productApi, Product } from '../services/api';

export const HouseLeasePage: React.FC = () => {
  const { language, translations } = useOutletContext<{ language: Language; translations: Translations }>();
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState('');
  const [searchText, setSearchText] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const cacheKey = `products:HOUSE_LEASE:${sortBy}:${searchText}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        setProducts(JSON.parse(cached));
        setLoading(false);
      } catch (e) {}
    }

    const fetchProducts = async () => {
      try {
        if (!cached) setLoading(true);
        setError(null);
        const response = await productApi.getProducts({ 
          categoryType: 'HOUSE_LEASE',
          keyword: searchText || undefined,
          sortBy: sortBy === 'default' ? undefined : sortBy,
        });
        setProducts(response.items);
        localStorage.setItem(cacheKey, JSON.stringify(response.items));
      } catch (err: any) {
        console.error('获取房源失败:', err);
        if (!cached) setError(err.message || '获取房源失败');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [sortBy, searchText]);

  const cities = [
    { value: '', label: { zh: '全国', en: 'Nationwide', ko: '전국', vi: 'Toàn quốc' } },
    { value: 'beijing', label: { zh: '北京', en: 'Beijing', ko: '베이징', vi: 'Bắc Kinh' } },
    { value: 'shanghai', label: { zh: '上海', en: 'Shanghai', ko: '상하이', vi: 'Thượng Hải' } },
    { value: 'guangzhou', label: { zh: '广州', en: 'Guangzhou', ko: '광저우', vi: 'Quảng Châu' } },
    { value: 'shenzhen', label: { zh: '深圳', en: 'Shenzhen', ko: '선전', vi: 'Thâm Quyến' } },
  ];

  const getCurrentCityLabel = () => {
    const city = cities.find(c => c.value === selectedCity);
    return city ? city.label[language] : cities[0].label[language];
  };

  const goToDetail = (product: Product) => {
    navigate('/detail', { 
      state: { 
        item: { 
          ...product, 
          title: { zh: product.title, en: product.titleEn || product.title, ko: product.title, vi: product.title },
          type: { zh: product.title, en: product.titleEn || product.title, ko: product.title, vi: product.title },
          images: product.images || [],
          shop: { zh: product.merchant?.shopName || '房源中心', en: product.merchant?.shopName || 'Housing Center', ko: product.merchant?.shopName || '주택 센터', vi: product.merchant?.shopName || 'Trung tâm nhà' },
        }, 
        pageType: 'house' 
      } 
    });
  };

  const sortOptions = [
    { value: 'default', label: { zh: '默认排序', en: 'Default', ko: '기본', vi: 'Mặc định' } },
    { value: 'price_high', label: { zh: '价格从高到低', en: 'Price: High to Low', ko: '가격: 높은순', vi: 'Giá: Cao đến thấp' } },
    { value: 'price_low', label: { zh: '价格从低到高', en: 'Price: Low to High', ko: '가격: 낮은순', vi: 'Giá: Thấp đến cao' } },
  ];

  const features = [
    { icon: Home, text: { zh: '真实房源', en: 'Real Listings', ko: '실제 매물', vi: 'Nhà thật' } },
    { icon: ShieldCheck, text: { zh: '安全可靠', en: 'Safe & Reliable', ko: '안전 신뢰', vi: 'An toàn tin cậy' } },
    { icon: FileCheck, text: { zh: '合同保障', en: 'Contract Protected', ko: '계약 보호', vi: 'Hợp đồng bảo vệ' } },
    { icon: MapPin, text: { zh: '覆盖全国', en: 'Nationwide', ko: '전국 커버', vi: 'Toàn quốc' } },
  ];

  if (!loading && error && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-red-500 text-sm">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm">
          {language === 'zh' ? '重试' : 'Retry'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="relative w-full" ref={dropdownRef}>
        <div className="relative flex items-center w-full rounded-lg border border-gray-400 bg-white shadow-sm transition-colors focus-within:border-purple-500">
          <button onClick={() => setShowCityDropdown(!showCityDropdown)}
            className="flex items-center gap-1 pl-3 pr-2 h-9 cursor-pointer group hover:bg-gray-50 rounded-l-lg transition-colors shrink-0">
            <MapPin size={14} className="text-purple-600" strokeWidth={2.5} />
            <span className="text-[13px] font-bold text-gray-700 truncate max-w-[4.5rem]">{getCurrentCityLabel()}</span>
            <ChevronDown size={12} className={`text-gray-400 transition-transform duration-200 ${showCityDropdown ? 'rotate-180' : ''}`} strokeWidth={2.5} />
          </button>
          <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>
          <input type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)}
            placeholder={language === 'zh' ? '搜索房源...' : 'Search listings...'}
            className="flex-1 py-1.5 pr-10 outline-none text-sm text-gray-700 bg-transparent placeholder-gray-400 h-full min-w-0" />
          <div className="absolute right-3 text-gray-500 pointer-events-none"><Search size={18} strokeWidth={2.5} /></div>
        </div>
        {showCityDropdown && (
          <div className="absolute top-full left-0 mt-1.5 w-48 bg-white/95 backdrop-blur-xl rounded-lg border border-white/50 shadow-xl overflow-hidden max-h-[60vh] flex flex-col z-50">
            <div className="px-3 py-2 border-b border-gray-100 bg-purple-50/50 flex-none">
              <span className="text-[11px] font-bold text-purple-900">{language === 'zh' ? '选择城市' : 'Select City'}</span>
            </div>
            <div className="overflow-y-auto p-1">
              {cities.map((city) => (
                <button key={city.value} onClick={() => { setSelectedCity(city.value); setShowCityDropdown(false); }}
                  className="w-full text-left px-3 py-2 text-[12px] font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded flex items-center justify-between">
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

      <div className="relative">
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 appearance-none cursor-pointer focus:outline-none focus:border-purple-400">
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label[language]}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-xl p-2 animate-pulse">
              <div className="flex gap-2">
                <div className="w-14 h-14 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-10 text-gray-500">{language === 'zh' ? '暂无房源' : 'No listings'}</div>
      ) : (
        <div className="space-y-2">
          {products.map((product) => (
            <div key={product.id} onClick={() => goToDetail(product)}
              className={`group relative overflow-hidden rounded-xl p-2 transition-all duration-300 cursor-pointer
                         ${selectedProperty === product.id 
                           ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-400 shadow-lg' 
                           : 'bg-white border border-purple-100 shadow-sm hover:shadow-lg hover:border-amber-300'}`}>
              <div className="flex gap-2 relative">
                <div className="w-14 h-14 flex-shrink-0 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg shadow-inner overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">{product.icon || '🏠'}</div>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col pr-16">
                  <h3 className="font-bold text-gray-800 text-sm mb-0.5 line-clamp-1">
                    {language === 'en' && product.titleEn ? product.titleEn : product.title}
                  </h3>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-red-600 font-bold text-base leading-none">{product.price}π/月</span>
                    <div className="flex gap-2">
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] text-gray-600 leading-none">{language === 'zh' ? '已售' : 'Sold'}</span>
                        <span className="text-[10px] text-gray-900 font-bold leading-none mt-0.5">{product.sales}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] text-gray-600 leading-none">{language === 'zh' ? '收藏' : 'Favs'}</span>
                        <span className="text-[10px] text-gray-900 font-bold leading-none mt-0.5">{product.favorites || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <span>{product.merchant?.shopName || '房源中心'}</span>
                    <span className="flex items-center gap-0.5 text-yellow-600">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold">{product.merchant?.rating || 5.0}</span>
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); goToDetail(product); }}
                className="absolute bottom-1 right-1 px-3 py-1 bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold rounded-lg hover:from-red-700 hover:to-red-600 active:scale-95 transition-all shadow-md">
                {language === 'zh' ? '看房' : language === 'en' ? 'View' : language === 'ko' ? '보기' : 'Xem'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
