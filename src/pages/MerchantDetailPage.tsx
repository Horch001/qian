import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Store, Star, Package, MessageCircle } from 'lucide-react';
import { Language, Translations } from '../types';

// 获取服务器基础URL（用于图片）
const getServerBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL || 
    (window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://h.toupiao.pro');
  return url.replace(/\/api\/v1$/, '').replace(/\/$/, '');
};

// 处理图片URL（兼容Base64和文件URL）
const processImageUrl = (imageUrl: string | undefined | null): string => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('data:image/')) return imageUrl;
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
  if (imageUrl.startsWith('/uploads/')) {
    const serverBaseUrl = getServerBaseUrl();
    return `${serverBaseUrl}${imageUrl}`;
  }
  return imageUrl;
};

interface MerchantDetailPageProps {
  language: Language;
  translations: Translations;
}

export const MerchantDetailPage: React.FC<MerchantDetailPageProps> = ({ language }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [merchant, setMerchant] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getText = (obj: { [key: string]: string }) => obj[language] || obj.zh;

  useEffect(() => {
    fetchMerchantData();
  }, [id]);

  const fetchMerchantData = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const [merchantRes, productsRes] = await Promise.all([
        fetch(`${API_URL}/api/v1/merchants/${id}`),
        fetch(`${API_URL}/api/v1/merchants/${id}/products`),
      ]);

      if (merchantRes.ok) {
        const merchantData = await merchantRes.json();
        // 处理商家logo
        setMerchant({
          ...merchantData,
          logo: processImageUrl(merchantData.logo),
        });
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        // 处理商品图片
        const processedProducts = (productsData.items || []).map((product: any) => ({
          ...product,
          images: product.images?.map((img: string) => processImageUrl(img)) || [],
          detailImages: product.detailImages?.map((img: string) => processImageUrl(img)) || [],
        }));
        setProducts(processedProducts);
      }
    } catch (error) {
      console.error('Failed to fetch merchant:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-600 to-pink-500 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-600 to-pink-500 flex justify-center">
        <div className="w-full max-w-md p-8 text-center text-white">
          <p>{getText({ zh: '店铺不存在', en: 'Shop not found', ko: '상점을 찾을 수 없습니다', vi: 'Không tìm thấy cửa hàng' })}</p>
          <button onClick={() => navigate(-1)} className="mt-4 px-6 py-2 bg-white text-purple-600 rounded-lg">
            {getText({ zh: '返回', en: 'Back', ko: '돌아가기', vi: 'Quay lại' })}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 to-pink-500 flex justify-center">
      <div className="w-full max-w-md flex flex-col min-h-screen">
        {/* Header */}
        <header className="p-4 flex items-center justify-center relative">
          <button onClick={() => navigate(-1)} className="text-white absolute left-4">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-white">{getText({ zh: '店铺详情', en: 'Shop Details', ko: '상점 상세', vi: 'Chi tiết cửa hàng' })}</h1>
        </header>

        {/* 店铺信息 */}
        <div className="bg-white mx-4 mt-2 mb-2 rounded-xl overflow-hidden">
          <div className="p-2">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                {merchant.logo ? (
                  <img src={merchant.logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Store size={24} className="text-purple-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-gray-800 truncate">{merchant.shopName}</h2>
                  {merchant.businessHours && (
                    <span className="text-xs text-gray-500 flex-shrink-0">🕐 {merchant.businessHours}</span>
                  )}
                </div>
                <p className="text-xs text-gray-500">⭐ {merchant.rating?.toFixed(1) || '5.0'} · {getText({ zh: '销量', en: 'Sales', ko: '판매', vi: 'Đã bán' })} {merchant.totalSales || 0}</p>
                {merchant.description && (
                  <p className="text-xs text-gray-600 line-clamp-1">{merchant.description}</p>
                )}
              </div>
            </div>
            
            {/* 店铺公告 */}
            {merchant.announcement && (
              <div className="bg-yellow-50 border-l-2 border-yellow-400 px-2 py-1.5 mt-1.5">
                <p className="text-xs text-yellow-800">📢 {merchant.announcement}</p>
              </div>
            )}
          </div>
        </div>

        {/* 商品列表 */}
        <div className="flex-1 px-4 pb-4">
          <h3 className="text-white font-bold mb-2">{getText({ zh: '店铺商品', en: 'Products', ko: '상품', vi: 'Sản phẩm' })}</h3>
          {products.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              {getText({ zh: '暂无商品', en: 'No products', ko: '상품 없음', vi: 'Chưa có sản phẩm' })}
            </div>
          ) : (
            <div className="space-y-2">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => navigate('/detail', { state: { item: product } })}
                  className="group relative overflow-hidden rounded-xl p-2 transition-all duration-300 cursor-pointer bg-white border border-purple-100 shadow-sm hover:shadow-lg hover:border-purple-300"
                >
                  {/* 标签 */}
                  {product.originalPrice && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg rounded-tr-lg z-10">
                      {getText({ zh: '特价', en: 'Sale', ko: '세일', vi: 'Giảm giá' })}
                    </div>
                  )}
                  
                  <div className="flex gap-2 relative">
                    <div className="w-14 h-14 flex-shrink-0 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg shadow-inner overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <img src={product.images[0]} alt={product.title} className="w-full h-full object-contain bg-white" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">
                          {product.icon || '📦'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col pr-16">
                      <h3 className="font-bold text-gray-800 text-sm mb-0.5 line-clamp-1">
                        {product.title}
                      </h3>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-red-600 font-bold text-base leading-none">{product.price}π</span>
                        <div className="flex gap-2">
                          <div className="flex flex-col items-center">
                            <span className="text-[9px] text-gray-600 leading-none">{getText({ zh: '库存', en: 'Stock', ko: '재고', vi: 'Kho' })}</span>
                            <span className="text-[10px] text-gray-900 font-bold leading-none mt-0.5">{product.stock || 0}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[9px] text-gray-600 leading-none">{getText({ zh: '已售', en: 'Sold', ko: '판매', vi: 'Đã bán' })}</span>
                            <span className="text-[10px] text-gray-900 font-bold leading-none mt-0.5">{product.sales || 0}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[9px] text-gray-600 leading-none">{getText({ zh: '收藏', en: 'Favs', ko: '즐겨찾기', vi: 'Yêu thích' })}</span>
                            <span className="text-[10px] text-gray-900 font-bold leading-none mt-0.5">{product.Favorite || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
