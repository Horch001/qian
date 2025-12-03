import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Star, UserCheck, ShieldCheck, BadgeCheck, MapPin, ChevronDown, Loader2 } from 'lucide-react';
import { Language, Translations } from '../types';
import { SimpleSearchBar } from '../components/SimpleSearchBar';
import { productApi, Product } from '../services/api';

export const OfflinePlaYPage: React.FC = () => {
  const { language, translations } = useOutletContext<{ language: Language; translations: Translations }>();
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('default');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const cacheKey = `products:OFFLINE_PLAY:${sortBy}:${searchKeyword}`;
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
          categoryType: 'OFFLINE_PLAY',
          keyword: searchKeyword || undefined,
          sortBy: sortBy === 'default' ? undefined : sortBy,
        });
        setProducts(response.items);
        // 不再缓存商品列表到localStorage，避免存储空间超限
      } catch (err: any) {
        console.error('获取陪玩服务失败:', err);
        if (!cached) setError(err.message || '获取陪玩服务失败');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();

    // 监听商品状态更新（WebSocket）
    const handleProductUpdate = (updatedProduct: any) => {
      setProducts(prevProducts => {
        if (updatedProduct.status === 'SOLD_OUT' || updatedProduct.status === 'INACTIVE' || updatedProduct.status === 'DELETED') {
          return prevProducts.filter(p => p.id !== updatedProduct.id);
        }
        if (updatedProduct.status === 'ACTIVE') {
          const exists = prevProducts.some(p => p.id === updatedProduct.id);
          if (!exists && updatedProduct.category?.type === 'OFFLINE_PLAY') {
            return [updatedProduct, ...prevProducts];
          }
          return prevProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p);
        }
        return prevProducts;
      });
    };

    window.addEventListener('product:updated', ((e: CustomEvent) => {
      handleProductUpdate(e.detail);
    }) as EventListener);

    return () => {
      window.removeEventListener('product:updated', handleProductUpdate as any);
    };
  }, [sortBy, searchKeyword]);

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
  };

  const goToDetail = (product: Product) => {
    navigate('/detail', { 
      state: { 
        item: { 
          ...product, 
          title: { zh: product.title, en: product.titleEn || product.title, ko: product.title, vi: product.title },
          name: { zh: product.title, en: product.titleEn || product.title, ko: product.title, vi: product.title },
          images: product.images || [],
          shop: { zh: product.merchant?.shopName || '陪玩服务', en: product.merchant?.shopName || 'Play Service', ko: product.merchant?.shopName || '플레이 서비스', vi: product.merchant?.shopName || 'Dịch vụ chơi' },
        }, 
        pageType: 'service' 
      } 
    });
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
    { value: 'location', label: { zh: '按商家发货地从近到远', en: 'Nearest Location', ko: '가까운 위치순', vi: 'Vị trí gần nhất' } },
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
        <button onClick={() => window.location.reload()} className="mt-2 px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm">
          {language === 'zh' ? '重试' : 'Retry'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <SimpleSearchBar language={language} translations={translations} categoryType="OFFLINE_PLAY" onSearch={handleSearch} />
      
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
        <div className="text-center py-10 text-gray-500">{language === 'zh' ? '暂无陪玩服务' : 'No services'}</div>
      ) : (
        <div className="space-y-2">
          {products.map((product) => (
            <div key={product.id} onClick={() => goToDetail(product)}
              className={`group relative overflow-hidden rounded-xl p-2 transition-all duration-300 cursor-pointer
                         ${selectedActivity === product.id 
                           ? 'bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-400 shadow-lg' 
                           : 'bg-white border border-purple-100 shadow-sm hover:shadow-lg hover:border-cyan-300'}`}>
              <div className="flex gap-2 relative">
                <div className="w-14 h-14 flex-shrink-0 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-lg shadow-inner overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">{product.icon || '🎮'}</div>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col pr-16">
                  <h3 className="font-bold text-gray-800 text-sm mb-0.5 line-clamp-1">
                    {language === 'en' && product.titleEn ? product.titleEn : product.title}
                  </h3>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-red-600 font-bold text-base leading-none">{product.price}π/h</span>
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
                    <span>{product.merchant?.shopName || '陪玩服务'}</span>
                    <span className="flex items-center gap-0.5 text-yellow-600">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold">{product.merchant?.rating || 5.0}</span>
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); goToDetail(product); }}
                className="absolute bottom-1 right-1 px-3 py-1 bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold rounded-lg hover:from-red-700 hover:to-red-600 active:scale-95 transition-all shadow-md">
                {language === 'zh' ? '预约' : language === 'en' ? 'Book' : language === 'ko' ? '예약' : 'Đặt'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
