import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingCart, Store } from 'lucide-react';
import { Language, Translations } from '../types';
import { userApi } from '../services/api';
import eventsSocketService from '../services/eventsSocket';

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  spec?: string;
  selected: boolean;
  product: {
    id: string;
    title: string;
    titleEn?: string;
    icon?: string;
    images: string[];
    price: string;
    merchant: {
      id: string;
      shopName: string;
    };
  };
}

interface CartPageProps {
  language: Language;
  translations: Translations;
}

export const CartPage: React.FC<CartPageProps> = ({ language }) => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 从后端加载购物车数据（先显示缓存，后台更新）
  useEffect(() => {
    const loadCartItems = async () => {
      try {
        // 1. 先从缓存加载（立即显示，即使过期）
        const cached = localStorage.getItem('cachedCart');
        if (cached) {
          try {
            const { data } = JSON.parse(cached);
            setCartItems(data);
            setIsLoading(false); // 立即显示缓存数据
          } catch (e) {
            console.warn('缓存解析失败:', e);
          }
        }
        
        // 2. 后台请求最新数据
        const items = await userApi.getCartItems();
        const formattedItems = items.map((item: any) => ({
          ...item,
          selected: false,
        }));
        
        // 3. 更新页面显示
        setCartItems(formattedItems);
        
        // 4. 更新缓存
        try {
          localStorage.setItem('cachedCart', JSON.stringify({
            data: formattedItems,
            timestamp: Date.now(),
          }));
        } catch (e) {
          console.warn('缓存购物车失败:', e);
        }
      } catch (error) {
        console.error('加载购物车失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadCartItems();

    // 🔥 监听购物车更新（WebSocket 实时推送）
    const handleCartUpdate = (cart: any) => {
      console.log('[CartPage] 收到购物车更新:', cart);
      // 重新加载购物车
      loadCartItems();
    };

    eventsSocketService.on('cart:updated', handleCartUpdate);

    return () => {
      eventsSocketService.off('cart:updated', handleCartUpdate);
    };
  }, []);

  const updateQuantity = async (id: string, delta: number) => {
    const item = cartItems.find(i => i.id === id);
    if (!item) return;
    
    const newQuantity = Math.max(1, item.quantity + delta);
    try {
      await userApi.updateCartItem(id, newQuantity);
      setCartItems(items => items.map(i => 
        i.id === id ? { ...i, quantity: newQuantity } : i
      ));
    } catch (error) {
      console.error('更新数量失败:', error);
    }
  };

  const toggleSelect = (id: string) => {
    setCartItems(items => items.map(item => 
      item.id === id ? { ...item, selected: !item.selected } : item
    ));
  };

  const removeItem = async (id: string) => {
    try {
      await userApi.removeFromCart(id);
      setCartItems(items => items.filter(item => item.id !== id));
    } catch (error) {
      console.error('移除商品失败:', error);
    }
  };

  const selectedItems = cartItems.filter(item => item.selected);
  const totalPrice = selectedItems.reduce((sum, item) => sum + parseFloat(item.product.price) * item.quantity, 0);

  const getText = (obj: { [key: string]: string }) => obj[language] || obj.zh;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-300 flex flex-col">
      <header className="bg-white/90 backdrop-blur-sm sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-sm font-bold text-purple-600">
            {language === 'zh' ? '购物车' : language === 'en' ? 'Cart' : language === 'ko' ? '장바구니' : 'Giỏ hàng'}
            <span className="text-gray-400 font-normal ml-1">({cartItems.length})</span>
          </h1>
          <div className="w-9"></div>
        </div>
      </header>

      <main className="flex-1 max-w-md w-full mx-auto overflow-auto pb-24">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {/* 骨架屏 - 显示3个商品卡片 */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="flex items-center justify-between">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <ShoppingCart className="w-12 h-12 mb-3 text-gray-300" />
            <p>{getText({ zh: '购物车是空的', en: 'Cart is empty', ko: '장바구니가 비어 있습니다', vi: 'Giỏ hàng trống' })}</p>
            <button 
              onClick={() => navigate('/')}
              className="mt-4 px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg"
            >
              {getText({ zh: '去逛逛', en: 'Go Shopping', ko: '쇼핑하러 가기', vi: 'Đi mua sắm' })}
            </button>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                  <Store className="w-3 h-3" />
                  <span>{item.product.merchant?.shopName || getText({ zh: '未知店铺', en: 'Unknown Store', ko: '알 수 없는 상점', vi: 'Cửa hàng không xác định' })}</span>
                </div>
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    checked={item.selected}
                    onChange={() => toggleSelect(item.id)}
                    className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <div className="w-14 h-14 bg-purple-50 rounded-lg flex items-center justify-center text-3xl overflow-hidden">
                    {item.product.images?.[0] ? (
                      <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      item.product.icon || '📦'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-sm truncate">
                      {language === 'en' && item.product.titleEn ? item.product.titleEn : item.product.title}
                    </h3>
                    {item.spec && (
                      <p className="text-xs text-gray-400 mt-0.5">{item.spec}</p>
                    )}
                    <p className="text-red-600 font-bold text-base">{item.product.price}π</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button onClick={() => removeItem(item.id)} className="p-1 text-gray-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg">
                      <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 hover:bg-gray-200 rounded-l-lg">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 hover:bg-gray-200 rounded-r-lg">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
          <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-500">{getText({ zh: '合计：', en: 'Total: ', ko: '합계: ', vi: 'Tổng: ' })}</span>
              <span className="text-xl font-bold text-red-600">{totalPrice.toFixed(2)}π</span>
            </div>
            <button 
              onClick={() => {
                if (selectedItems.length === 0) {
                  alert(getText({ zh: '请选择商品', en: 'Please select items', ko: '상품을 선택하세요', vi: 'Vui lòng chọn sản phẩm' }));
                  return;
                }
                // 跳转到结算页面，传递选中的商品
                navigate('/checkout', { state: { items: selectedItems } });
              }}
              className="px-8 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white text-sm font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all"
            >
              {getText({ zh: `结算(${selectedItems.length})`, en: `Checkout(${selectedItems.length})`, ko: `결제(${selectedItems.length})`, vi: `Thanh toán(${selectedItems.length})` })}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
