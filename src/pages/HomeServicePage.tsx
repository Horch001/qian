import React, { useState, useRef, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Star, UserCheck, ShieldCheck, BadgeCheck, MapPin, ChevronDown, Check, Search, Loader2 } from 'lucide-react';
import { Language, Translations } from '../types';
import { productApi, Product } from '../services/api';
import { preloadImages } from '../services/imagePreloader';
import { safeStorage } from '../utils/safeStorage';
import { LOCATION_DATA } from '../constants/locations';

export const HomeServicePage: React.FC = () => {
  const { language, translations } = useOutletContext<{ language: Language, translations: Translations }>();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [searchInput, setSearchInput] = useState(''); // 🔥 输入框的值
  const [searchText, setSearchText] = useState(''); // 🔥 实际搜索的关键词
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const cacheKey = `service_${selectedProvince}_${selectedCity}_${searchText}`;
        
        // 先从缓存读取
        try {
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < 30 * 60 * 1000) {
              setProducts(data);
              setLoading(false);
              return;
            }
          }
        } catch (e) {}
        
        setLoading(true);
        setError(null);
        const response = await productApi.getProducts({ 
          categoryType: 'SERVICE',
          keyword: searchText || undefined,
          promoted: !searchText,
          province: selectedProvince || undefined,
          city: selectedCity || undefined,
          limit: 20,
        });
        setProducts(response.items);
        
        // 保存到缓存
        try {
          localStorage.setItem(cacheKey, JSON.stringify({ data: response.items, timestamp: Date.now() }));
        } catch (e) {}
        
        // 只预加载前5个商品的主图
        const topProducts = response.items.slice(0, 5);
        const topImages: string[] = [];
        topProducts.forEach((product: Product) => {
          if (product.images && product.images.length > 0) {
            topImages.push(product.images[0]);
          }
        });
        if (topImages.length > 0) {
          preloadImages(topImages, 3000);
        }
      } catch (err: any) {
        console.error('获取服务失败:', err);
        setError(err.message || '获取服务失败');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();

    // 监听商品状态更新（WebSocket）
    const handleProductUpdate = (updatedProduct: any) => {
      setProducts(prevProducts => {
        // 如果商品已下架或删除，从列表中移除
        if (updatedProduct.status === 'SOLD_OUT' || updatedProduct.status === 'INACTIVE' || updatedProduct.status === 'DELETED') {
          return prevProducts.filter(p => p.id !== updatedProduct.id);
        }
        // 如果商品重新上架，添加到列表（如果不存在）
        if (updatedProduct.status === 'ACTIVE') {
          const exists = prevProducts.some(p => p.id === updatedProduct.id);
          if (!exists && updatedProduct.category?.type === 'SERVICE') {
            return [updatedProduct, ...prevProducts];
          }
          // 更新现有商品
          return prevProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p);
        }
        return prevProducts;
      });
    };

    // 监听全局商品更新事件
    window.addEventListener('product:updated', ((e: CustomEvent) => {
      handleProductUpdate(e.detail);
    }) as EventListener);

    return () => {
      window.removeEventListener('product:updated', handleProductUpdate as any);
    };
  }, [sortBy, searchText, selectedProvince, selectedCity]);

  const goToDetail = (product: Product) => {
    navigate('/detail', { 
      state: { 
        item: { 
          ...product, 
          title: { zh: product.title, en: product.titleEn || product.title, ko: product.title, vi: product.title },
          name: { zh: product.title, en: product.titleEn || product.title, ko: product.title, vi: product.title },
          images: product.images || [],
          shop: { zh: product.merchant?.shopName || '服务商', en: product.merchant?.shopName || 'Service Provider', ko: product.merchant?.shopName || '서비스 제공자', vi: product.merchant?.shopName || 'Nhà cung cấp' },
        }, 
        pageType: 'service' 
      } 
    });
  };

  // 获取省份列表
  const provinces = LOCATION_DATA[0]?.regions.map(r => r.name) || [];
  
  // 获取城市列表
  const cities = selectedProvince 
    ? LOCATION_DATA[0]?.regions.find(r => r.name === selectedProvince)?.cities || []
    : [];

  const getCurrentLocationLabel = () => {
    if (!selectedProvince) {
      return language === 'zh' ? '全国' : language === 'en' ? 'Nationwide' : language === 'ko' ? '전국' : 'Toàn quốc';
    }
    if (selectedCity) {
      return selectedCity;
    }
    return selectedProvince;
  };

  const sortOptions = [
    { value: 'default', label: { zh: '默认排序', en: 'Default', ko: '기본', vi: 'Mặc định' } },
    { value: 'sales_desc', label: { zh: '按销量从高到低', en: 'Sales: High to Low', ko: '판매량: 높은순', vi: 'Doanh số: Cao đến thấp' } },
    { value: 'price_desc', label: { zh: '按价格从高到低', en: 'Price: High to Low', ko: '가격: 높은순', vi: 'Giá: Cao đến thấp' } },
    { value: 'price_asc', label: { zh: '按价格从低到高', en: 'Price: Low to High', ko: '가격: 낮은순', vi: 'Giá: Thấp đến cao' } },
    { value: 'newest', label: { zh: '按上架时间从近到远', en: 'Newest First', ko: '최신순', vi: 'Mới nhất' } },
    { value: 'review_count', label: { zh: '按评价从多到少', en: 'Most Reviewed', ko: '리뷰 많은순', vi: 'Nhiều đánh giá nhất' } },
    { value: 'merchant_rating', label: { zh: '按商家评分从高到低', en: 'Merchant Rating', ko: '판매자 평점순', vi: 'Đánh giá người bán' } },
    { value: 'merchant_oldest', label: { zh: '按商家入驻时间从早到晚', en: 'Oldest Merchant', ko: '오래된 판매자순', vi: 'Người bán lâu năm' } },
  ];

  const features = [
    { icon: UserCheck, text: { zh: '实名认证', en: 'Real-Name Auth', ko: '실명 인증', vi: 'Xác thực tên thật' } },
    { icon: ShieldCheck, text: { zh: '安全有保障', en: 'Safe & Secure', ko: '안전 보장', vi: 'An toàn bảo đảm' } },
    { icon: BadgeCheck, text: { zh: '已缴纳保证金', en: 'Deposit Paid', ko: '보증금 납부', vi: 'Đã đặt cọc' } },
    { icon: MapPin, text: { zh: '覆盖全国', en: 'Nationwide', ko: '전국 커버', vi: 'Toàn quốc' } },
  ];

  if (!loading && error && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-red-500 text-sm">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm">
          {language === 'zh' ? '重试' : 'Retry'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="relative w-full" ref={dropdownRef}>
        <div className="relative flex items-center w-full rounded-lg border border-gray-400 bg-white shadow-sm transition-colors focus-within:border-purple-500">
          <button onClick={() => setShowLocationDropdown(!showLocationDropdown)}
            className="flex items-center gap-1 pl-3 pr-2 h-9 cursor-pointer group hover:bg-gray-50 rounded-l-lg transition-colors shrink-0">
            <MapPin size={14} className="text-purple-600" strokeWidth={2.5} />
            <span className="text-[13px] font-bold text-gray-700 truncate max-w-[4.5rem]">{getCurrentLocationLabel()}</span>
            <ChevronDown size={12} className={`text-gray-400 transition-transform duration-200 ${showLocationDropdown ? 'rotate-180' : ''}`} strokeWidth={2.5} />
          </button>
          <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>
          <input 
            type="text" 
            value={searchInput} 
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setSearchText(searchInput.trim());
              }
            }}
            placeholder={translations.searchPlaceholder[language]}
            className="flex-1 py-1.5 pr-10 outline-none text-sm text-gray-700 bg-transparent placeholder-gray-400 h-full min-w-0" 
          />
          <button 
            onClick={() => setSearchText(searchInput.trim())}
            className="absolute right-3 text-gray-500 hover:text-purple-600 transition-colors cursor-pointer"
          >
            <Search size={18} strokeWidth={2.5} />
          </button>
        </div>
        {showLocationDropdown && (
          <div className="absolute top-full left-0 mt-1.5 w-48 bg-white/95 backdrop-blur-xl rounded-lg border border-white/50 shadow-xl overflow-hidden max-h-[60vh] flex flex-col z-50">
            <div className="px-3 py-2 border-b border-gray-100 bg-purple-50/50 flex-none">
              <span className="text-[11px] font-bold text-purple-900">
                {!selectedProvince ? (language === 'zh' ? '选择省份' : 'Select Province') : (language === 'zh' ? '选择城市' : 'Select City')}
              </span>
              {selectedProvince && (
                <button onClick={() => { setSelectedProvince(''); setSelectedCity(''); }}
                  className="ml-2 text-[10px] text-purple-600 hover:text-purple-800">
                  {language === 'zh' ? '返回' : 'Back'}
                </button>
              )}
            </div>
            <div className="overflow-y-auto p-1">
              {!selectedProvince ? (
                <>
                  <button onClick={() => { setSelectedProvince(''); setSelectedCity(''); setShowLocationDropdown(false); }}
                    className="w-full text-left px-3 py-2 text-[12px] font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded flex items-center justify-between">
                    <span>🌍 {language === 'zh' ? '全国' : language === 'en' ? 'Nationwide' : language === 'ko' ? '전국' : 'Toàn quốc'}</span>
                    {!selectedProvince && <Check size={12} className="text-purple-600" strokeWidth={3} />}
                  </button>
                  {provinces.map((province) => (
                    <button key={province} onClick={() => setSelectedProvince(province)}
                      className="w-full text-left px-3 py-2 text-[12px] font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded">
                      {province}
                    </button>
                  ))}
                </>
              ) : (
                cities.map((city) => (
                  <button key={city} onClick={() => { setSelectedCity(city); setShowLocationDropdown(false); }}
                    className="w-full text-left px-3 py-2 text-[12px] font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded flex items-center justify-between">
                    <span>{city}</span>
                    {selectedCity === city && <Check size={12} className="text-purple-600" strokeWidth={3} />}
                  </button>
                ))
              )}
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

      {/* 排序筛选框 - 只在有搜索结果时显示 */}
      {!loading && searchText && products.length > 0 && (
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
      )}

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
        <div className="text-center py-10 text-gray-500">{language === 'zh' ? '暂无服务' : 'No services'}</div>
      ) : (
        <div className="space-y-2">
          {products.map((product) => (
            <div key={product.id} onClick={() => goToDetail(product)}
              className={`group relative overflow-hidden rounded-xl p-2 transition-all duration-300 cursor-pointer
                         ${selectedService === product.id 
                           ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400 shadow-lg' 
                           : 'bg-white border border-purple-100 shadow-sm hover:shadow-lg hover:border-green-300'}`}>
              <div className="flex gap-2 relative">
                <div className="w-14 h-14 flex-shrink-0 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg shadow-inner overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">{product.icon || '🧹'}</div>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between h-14 pr-20">
                  <h3 className="font-bold text-gray-800 text-sm line-clamp-1">
                    {language === 'en' && product.titleEn ? product.titleEn : product.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-red-600 font-bold text-base leading-none">{Number(product.price).toFixed(2)}π</span>
                    <div className="flex gap-2">
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] text-gray-600 leading-none">{language === 'zh' ? '已售' : 'Sold'}</span>
                        <span className="text-[10px] text-gray-900 font-bold leading-none mt-0.5">{product.sales}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] text-gray-600 leading-none">{language === 'zh' ? '收藏' : 'Favs'}</span>
                        <span className="text-[10px] text-gray-900 font-bold leading-none mt-0.5">{product.Favorite || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] text-gray-400 leading-none">
                    {product.merchant?.shopName || '服务商'}
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); goToDetail(product); }}
                  className="absolute bottom-1 right-1 px-3 py-1 bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold rounded-lg hover:from-red-700 hover:to-red-600 active:scale-95 transition-all shadow-md">
                  {language === 'zh' ? '预订' : language === 'en' ? 'Book' : language === 'ko' ? '예약' : 'Đặt'}
                </button>
              </div>
            </div>
          ))}
          {/* 底部提示 */}
          {!searchText && (
            <div className="text-center py-6 text-gray-500 text-sm">
              <p>{language === 'zh' ? '— 以上为推荐服务 —' : '— Recommended Services —'}</p>
              <p className="mt-1 text-purple-600 font-medium">
                {language === 'zh' ? '更多服务请使用搜索功能' : 'Search for more services'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
