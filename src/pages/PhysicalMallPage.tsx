import React, { useState, useMemo, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { ShoppingBag, Star, Package, Truck, Shield, ChevronDown, Loader2 } from 'lucide-react';
import { Language, Translations } from '../types';
import { SimpleSearchBar } from '../components/SimpleSearchBar';
import { productApi, Product } from '../services/api';

export const PhysicalMallPage: React.FC = () => {
  const { language, translations } = useOutletContext<{ language: Language; translations: Translations }>();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('default');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // 从后端获取商品数据（带本地缓存）
  useEffect(() => {
    const cacheKey = `products:PHYSICAL:${sortBy}`;
    
    // 1. 先从本地缓存加载（立即显示）
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setProducts(parsed);
        setLoading(false); // 有缓存时立即停止加载状态
      } catch (e) {
        // 忽略解析错误
      }
    }

    // 2. 异步从后端获取最新数据
    const fetchProducts = async () => {
      try {
        if (!cached) {
          setLoading(true); // 只有没有缓存时才显示加载状态
        }
        setError(null);
        const response = await productApi.getProducts({ 
          categoryType: 'PHYSICAL',
          sortBy: sortBy === 'default' ? undefined : sortBy,
        });
        setProducts(response.items);
        // 缓存到本地
        localStorage.setItem(cacheKey, JSON.stringify(response.items));
      } catch (err: any) {
        console.error('获取商品失败:', err);
        // 只有没有缓存数据时才显示错误
        if (!cached) {
          setError(err.message || '获取商品失败');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [sortBy]);

  const goToDetail = (product: Product) => {
    navigate('/detail', { 
      state: { 
        item: { 
          ...product, 
          title: { 
            zh: product.title, 
            en: product.titleEn || product.title,
            ko: product.title,
            vi: product.title,
          },
          name: { 
            zh: product.title, 
            en: product.titleEn || product.title,
            ko: product.title,
            vi: product.title,
          },
          images: product.images || [],
          detailImages: product.detailImages || [], // 传递详情图
          description: product.description, // 传递商品描述
          shop: {
            zh: product.merchant?.shopName || '官方店铺',
            en: product.merchant?.shopName || 'Official Store',
            ko: product.merchant?.shopName || '공식 스토어',
            vi: product.merchant?.shopName || 'Cửa hàng chính thức',
          },
        }, 
        pageType: 'product' 
      } 
    });
  };

  const features = [
    { icon: Shield, text: { zh: '正品保证', en: 'Genuine', ko: '정품 보증', vi: 'Chính hãng' } },
    { icon: Truck, text: { zh: '24h发货', en: '24h Ship', ko: '24시간 발송', vi: 'Giao 24h' } },
    { icon: Package, text: { zh: '7天无理由', en: '7-Day Return', ko: '7일 반품', vi: 'Trả 7 ngày' } },
    { icon: ShoppingBag, text: { zh: '全国包邮', en: 'Free Ship', ko: '무료 배송', vi: 'Miễn phí ship' } },
  ];

  const sortOptions = [
    { value: 'default', label: { zh: '默认排序', en: 'Default', ko: '기본', vi: 'Mặc định' } },
    { value: 'price_high', label: { zh: '价格从高到低', en: 'Price: High to Low', ko: '가격: 높은순', vi: 'Giá: Cao đến thấp' } },
    { value: 'price_low', label: { zh: '价格从低到高', en: 'Price: Low to High', ko: '가격: 낮은순', vi: 'Giá: Thấp đến cao' } },
    { value: 'sales', label: { zh: '销量优先', en: 'Best Selling', ko: '판매량순', vi: 'Bán chạy nhất' } },
    { value: 'deposit', label: { zh: '已缴纳保证金', en: 'Deposit Paid', ko: '보증금 납부', vi: 'Đã đặt cọc' } },
  ];

  // 错误状态（只在非加载状态且有错误时显示）
  if (!loading && error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-red-500 text-sm">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm"
        >
          {language === 'zh' ? '重试' : 'Retry'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* 搜索框 - 限定在实体商城板块搜索 */}
      <SimpleSearchBar language={language} translations={translations} categoryType="PHYSICAL" />
      
      {/* 特色功能 */}
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

      {/* 商品列表 */}
      {loading ? (
        <div className="space-y-2">
          {/* 骨架屏 - 显示5个商品卡片 */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-xl p-2 animate-pulse">
              <div className="flex gap-2">
                <div className="w-14 h-14 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="flex items-center justify-between">
                    <div className="h-5 bg-gray-200 rounded w-16"></div>
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-200 rounded w-8"></div>
                      <div className="h-6 bg-gray-200 rounded w-8"></div>
                      <div className="h-6 bg-gray-200 rounded w-8"></div>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          {error || (language === 'zh' ? '暂无商品' : 'No products')}
        </div>
      ) : (
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
              {product.originalPrice && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg rounded-tr-lg shadow-md">
                  {language === 'zh' ? '特价' : 'Sale'}
                </div>
              )}
              
              <div className="flex gap-2 relative">
                <div className="w-14 h-14 flex-shrink-0 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg shadow-inner overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">
                      {product.icon || '📦'}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col pr-16">
                  <h3 className="font-bold text-gray-800 text-sm mb-0.5 line-clamp-1">
                    {language === 'en' && product.titleEn ? product.titleEn : product.title}
                  </h3>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-red-600 font-bold text-base leading-none">{product.price}π</span>
                    <div className="flex gap-2">
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] text-gray-600 leading-none">{language === 'zh' ? '库存' : 'Stock'}</span>
                        <span className="text-[10px] text-gray-900 font-bold leading-none mt-0.5">{product.stock}</span>
                      </div>
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
                    <span>{product.merchant?.shopName || '官方店铺'}</span>
                    <span className="flex items-center gap-0.5 text-yellow-600">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold">{product.merchant?.rating || 5.0}</span>
                    </span>
                  </div>
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
      )}
    </div>
  );
};
