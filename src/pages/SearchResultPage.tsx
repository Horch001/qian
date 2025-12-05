import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, Star, Loader2, Package } from 'lucide-react';
import { Language, Translations } from '../types';
import { productApi, Product } from '../services/api';

interface SearchResultPageProps {
  language: Language;
  translations: Translations;
}

export const SearchResultPage: React.FC<SearchResultPageProps> = ({ language, translations }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const categoryType = searchParams.get('categoryType') || '';
  const city = searchParams.get('city') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState(keyword);

  const getText = (obj: { [key: string]: string }) => obj[language] || obj.zh;

  // 板块名称映射
  const categoryNames: { [key: string]: { zh: string; en: string; ko: string; vi: string } } = {
    PHYSICAL: { zh: '实体商城', en: 'Physical Mall', ko: '실물 쇼핑몰', vi: 'Trung tâm mua sắm' },
    VIRTUAL: { zh: '虚拟商城', en: 'Virtual Mall', ko: '가상 쇼핑몰', vi: 'Trung tâm ảo' },
    SERVICE: { zh: '上门服务', en: 'Home Service', ko: '방문 서비스', vi: 'Dịch vụ tận nhà' },
    OFFLINE_PLAY: { zh: '线下陪玩', en: 'Offline Play', ko: '오프라인 플레이', vi: 'Chơi offline' },
    COURSE: { zh: '知识付费', en: 'Paid Courses', ko: '유료 강좌', vi: 'Khóa học trả phí' },
    DETECTIVE: { zh: '商业调查', en: 'Business Investigation', ko: '비즈니스 조사', vi: 'Điều tra kinh doanh' },
    HOUSE_LEASE: { zh: '房屋租赁', en: 'House Lease', ko: '주택 임대', vi: 'Cho thuê nhà' },
  };

  useEffect(() => {
    const fetchProducts = async () => {
      if (!keyword) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const response = await productApi.getProducts({
          keyword,
          categoryType: categoryType || undefined,
        });
        setProducts(response.items);
      } catch (err: any) {
        console.error('搜索失败:', err);
        setError(err.message || '搜索失败');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [keyword, categoryType]);

  const handleSearch = () => {
    const trimmed = searchKeyword.trim();
    if (trimmed) {
      const params = new URLSearchParams({ keyword: trimmed });
      if (categoryType) params.append('categoryType', categoryType);
      if (city) params.append('city', city);
      navigate(`/search?${params.toString()}`);
    }
  };

  const goToDetail = (product: Product) => {
    navigate('/detail', {
      state: {
        item: {
          ...product,
          title: { zh: product.title, en: product.titleEn || product.title, ko: product.title, vi: product.title },
          name: { zh: product.title, en: product.titleEn || product.title, ko: product.title, vi: product.title },
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
        pageType: 'product',
      },
    });
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 to-pink-500 flex justify-center">
      <div className="w-full max-w-md flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white/10 backdrop-blur-sm p-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-white">
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={translations.searchPlaceholder[language]}
              className="w-full px-4 py-2 pr-10 rounded-lg bg-white/90 text-gray-800 text-sm outline-none"
            />
            <button onClick={handleSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              <Search size={18} />
            </button>
          </div>
        </header>

        {/* 搜索范围提示 */}
        <div className="px-4 py-2">
        <div className="bg-white/20 rounded-lg px-3 py-2 text-white text-sm">
          {categoryType ? (
            <span>
              {getText({ zh: '搜索范围：', en: 'Scope: ', ko: '검색 범위: ', vi: 'Phạm vi: ' })}
              <span className="font-bold">{getText(categoryNames[categoryType] || { zh: categoryType, en: categoryType, ko: categoryType, vi: categoryType })}</span>
            </span>
          ) : (
            <span>{getText({ zh: '全局搜索', en: 'Global Search', ko: '전체 검색', vi: 'Tìm kiếm toàn cầu' })}</span>
          )}
          {keyword && (
            <span className="ml-2">
              "{keyword}" - {products.length} {getText({ zh: '个结果', en: 'results', ko: '개 결과', vi: 'kết quả' })}
            </span>
          )}
        </div>
      </div>

      {/* 内容区域 */}
      <main className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="space-y-3">
            {/* 骨架屏 - 显示5个商品卡片 */}
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white rounded-xl p-3 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-5 bg-gray-200 rounded w-20"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-white text-sm">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-2 px-4 py-2 bg-white text-purple-600 rounded-lg text-sm font-bold">
              {getText({ zh: '重试', en: 'Retry', ko: '다시 시도', vi: 'Thử lại' })}
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Package className="w-16 h-16 text-white/50 mb-4" />
            <p className="text-white text-sm">{getText({ zh: '未找到相关商品', en: 'No products found', ko: '상품을 찾을 수 없습니다', vi: 'Không tìm thấy sản phẩm' })}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => goToDetail(product)}
                className="bg-white rounded-xl p-3 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
              >
                <div className="flex gap-3">
                  <div className="w-20 h-20 flex-shrink-0 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">{product.icon || '📦'}</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-2">
                      {language === 'en' && product.titleEn ? product.titleEn : product.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-red-600 font-bold text-lg">{product.price}π</span>
                      {product.originalPrice && (
                        <span className="text-gray-400 text-xs line-through">{product.originalPrice}π</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{product.merchant?.shopName || '官方店铺'}</span>
                      <span className="flex items-center gap-0.5 text-yellow-600">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold">{product.rating || 5.0}</span>
                      </span>
                      <span>{getText({ zh: '已售', en: 'Sold', ko: '판매', vi: 'Đã bán' })} {product.sales}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </main>
      </div>
    </div>
  );
};
