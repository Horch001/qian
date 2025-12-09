import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { ShoppingBag, Package, Truck, Shield, ChevronDown } from 'lucide-react';
import { Language, Translations } from '../types';
import { SimpleSearchBar } from '../components/SimpleSearchBar';
import { productApi, Product } from '../services/api';
import { 
  preloadProductImages, 
  preloadProductListImages, 
  preloadImages,
  getCachedProducts,
  updateCachedProducts,
  areAllImagesLoaded,
  isImageLoaded
} from '../services/imagePreloader';

export const PhysicalMallPage: React.FC = () => {
  const { language, translations } = useOutletContext<{ language: Language; translations: Translations }>();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('default');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [imagesReady, setImagesReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // 获取商品数据：先显示缓存，后台更新
  useEffect(() => {
    const cacheKey = `products_PHYSICAL_${sortBy}`;
    
    // 1. 先从缓存加载（立即显示）
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // 缓存10分钟内有效，直接显示
        if (Date.now() - timestamp < 10 * 60 * 1000 && data.length > 0) {
          setProducts(data);
          setLoading(false);
        }
      }
    } catch (e) {
      // 忽略缓存错误
    }
    
    // 2. 后台请求最新数据
    const fetchProducts = async () => {
      try {
        const response = await productApi.getProducts({ 
          categoryType: 'PHYSICAL',
          sortBy: sortBy === 'default' ? undefined : sortBy,
          limit: 20,
        });
        const productList = response.items || [];
        
        setProducts(productList);
        setLoading(false);
        setError(null);
        
        // 更新缓存
        try {
          localStorage.setItem(cacheKey, JSON.stringify({
            data: productList,
            timestamp: Date.now(),
          }));
        } catch (e) {
          // 忽略缓存错误
        }
        
        // 🔥 立即预加载所有商品的主图和副图（为进入详情页做准备）
        const allMainAndSubImages: string[] = [];
        productList.forEach(product => {
          if (product.images && Array.isArray(product.images)) {
            allMainAndSubImages.push(...product.images);
          }
        });
        
        if (allMainAndSubImages.length > 0) {
          preloadImages(allMainAndSubImages, 8000).then(() => {
            console.log(`[PhysicalMall] 主图副图预加载完成: ${allMainAndSubImages.length}张`);
          });
        }
        
        // 后台预加载详情图（不急）
        setTimeout(() => {
          productList.forEach(product => {
            if (product.detailImages && product.detailImages.length > 0) {
              preloadImages(product.detailImages, 10000);
            }
          });
        }, 2000);
        
      } catch (err: any) {
        console.error('获取商品失败:', err);
        // 只有在没有缓存数据时才显示错误
        if (products.length === 0) {
          setError(err.message || '获取商品失败');
        }
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
          if (!exists && updatedProduct.category?.type === 'PHYSICAL') {
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
  }, [sortBy]);

  // 点击进入详情页（主图副图已在列表页预加载）
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
          detailImages: product.detailImages || [],
          description: product.description,
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
    { icon: Truck, text: { zh: '24h内发货', en: '24h Ship', ko: '24시간 내 발송', vi: 'Giao trong 24h' } },
    { icon: Package, text: { zh: '7天无理由', en: '7-Day Return', ko: '7일 반품', vi: 'Trả 7 ngày' } },
    { icon: ShoppingBag, text: { zh: '全国包邮', en: 'Free Ship', ko: '무료 배송', vi: 'Miễn phí ship' } },
  ];

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
              
              <div className="flex gap-2 h-14">
                <div className="w-14 h-14 flex-shrink-0 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg shadow-inner overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.title} 
                      className="w-full h-full object-contain bg-white"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">
                      {product.icon || '📦'}
                    </div>
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
                  <div className="text-[10px] text-gray-400 leading-none">
                    {product.merchant?.shopName || '官方店铺'}
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); goToDetail(product); }}
                  className="absolute bottom-1 right-1 px-3 py-1 bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold rounded-lg hover:from-red-700 hover:to-red-600 active:scale-95 transition-all shadow-md">
                  {language === 'zh' ? '购买' : language === 'en' ? 'Buy' : language === 'ko' ? '구매' : 'Mua'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
