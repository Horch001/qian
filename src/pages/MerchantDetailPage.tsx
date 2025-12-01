import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Store, Star, Package, MessageCircle } from 'lucide-react';
import { Language, Translations } from '../types';

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
        setMerchant(merchantData);
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData.items || []);
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
        <header className="bg-white/10 backdrop-blur-sm p-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-white">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-white">{getText({ zh: '店铺详情', en: 'Shop Details', ko: '상점 상세', vi: 'Chi tiết cửa hàng' })}</h1>
        </header>

        {/* 店铺信息 */}
        <div className="bg-white m-4 rounded-xl overflow-hidden">
          {merchant.banner && (
            <div className="h-32 bg-gradient-to-r from-purple-400 to-pink-400">
              <img src={merchant.banner} alt="Banner" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center overflow-hidden">
                {merchant.logo ? (
                  <img src={merchant.logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Store size={32} className="text-purple-400" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800">{merchant.shopName}</h2>
                <p className="text-sm text-gray-500">⭐ {merchant.rating?.toFixed(1) || '5.0'} · {getText({ zh: '销量', en: 'Sales', ko: '판매', vi: 'Đã bán' })} {merchant.totalSales || 0}</p>
              </div>
            </div>
            <p className="text-gray-600">{merchant.description || getText({ zh: '暂无简介', en: 'No description', ko: '설명 없음', vi: 'Chưa có mô tả' })}</p>
          </div>
        </div>

        {/* 商品列表 */}
        <div className="flex-1 p-4">
          <h3 className="text-white font-bold mb-3">{getText({ zh: '店铺商品', en: 'Products', ko: '상품', vi: 'Sản phẩm' })}</h3>
          {products.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              {getText({ zh: '暂无商品', en: 'No products', ko: '상품 없음', vi: 'Chưa có sản phẩm' })}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => navigate('/detail', { state: { item: product } })}
                  className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">{product.icon || '📦'}</span>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="font-bold text-gray-800 text-sm truncate">{product.title}</h4>
                    <p className="text-red-600 font-bold">{product.price}π</p>
                    <p className="text-xs text-gray-500">{getText({ zh: '已售', en: 'Sold', ko: '판매', vi: 'Đã bán' })} {product.sales || 0}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
