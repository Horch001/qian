import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingCart, Store } from 'lucide-react';
import { Language, Translations } from '../types';

interface CartPageProps {
  language: Language;
  translations: Translations;
}

export const CartPage: React.FC<CartPageProps> = ({ language }) => {
  const navigate = useNavigate();
  
  // 模拟购物车数据
  const [cartItems, setCartItems] = useState([
    { id: '1', name: { zh: '日用百货套装', en: 'Daily Essentials', ko: '일상용품', vi: 'Hàng tiêu dùng' }, icon: '🛍️', price: 99, quantity: 2, shop: { zh: '品质生活馆', en: 'Quality Store', ko: '품질 상점', vi: 'Cửa hàng chất lượng' }, selected: true, spec: { zh: '标准版', en: 'Standard', ko: '표준', vi: 'Tiêu chuẩn' } },
    { id: '2', name: { zh: '数码配件包', en: 'Digital Accessories', ko: '디지털 액세서리', vi: 'Phụ kiện số' }, icon: '💻', price: 299, quantity: 1, shop: { zh: '科技数码店', en: 'Tech Store', ko: '기술 상점', vi: 'Cửa hàng công nghệ' }, selected: true, spec: { zh: '黑色/Type-C', en: 'Black/Type-C', ko: '블랙/Type-C', vi: 'Đen/Type-C' } },
    { id: '3', name: { zh: '居家好物精选', en: 'Home Collection', ko: '홈 컬렉션', vi: 'Bộ sưu tập nhà' }, icon: '🏠', price: 199, quantity: 1, shop: { zh: '温馨家居店', en: 'Cozy Home', ko: '아늑한 홈', vi: 'Nhà ấm cúng' }, selected: false, spec: { zh: '简约白', en: 'Simple White', ko: '심플 화이트', vi: 'Trắng đơn giản' } },
    { id: '4', name: { zh: '有机绿茶礼盒', en: 'Organic Green Tea Gift Box', ko: '유기농 녹차 선물 세트', vi: 'Hộp quà trà xanh hữu cơ' }, icon: '🍵', price: 158, quantity: 1, shop: { zh: '茶香世家', en: 'Tea House', ko: '차 하우스', vi: 'Nhà trà' }, selected: false, spec: { zh: '250g/盒', en: '250g/box', ko: '250g/박스', vi: '250g/hộp' } },
    { id: '5', name: { zh: '运动蓝牙耳机', en: 'Sports Bluetooth Earbuds', ko: '스포츠 블루투스 이어폰', vi: 'Tai nghe Bluetooth thể thao' }, icon: '🎧', price: 189, quantity: 1, shop: { zh: '科技数码店', en: 'Tech Store', ko: '기술 상점', vi: 'Cửa hàng công nghệ' }, selected: true, spec: { zh: '星空黑', en: 'Space Black', ko: '스페이스 블랙', vi: 'Đen không gian' } },
    { id: '6', name: { zh: '纯棉四件套', en: 'Cotton Bedding Set', ko: '면 침구 세트', vi: 'Bộ chăn ga gối cotton' }, icon: '🛏️', price: 399, quantity: 1, shop: { zh: '温馨家居店', en: 'Cozy Home', ko: '아늑한 홈', vi: 'Nhà ấm cúng' }, selected: false, spec: { zh: '1.8m床/浅灰', en: '1.8m/Light Gray', ko: '1.8m/라이트 그레이', vi: '1.8m/Xám nhạt' } },
  ]);

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(items => items.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const toggleSelect = (id: string) => {
    setCartItems(items => items.map(item => 
      item.id === id ? { ...item, selected: !item.selected } : item
    ));
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const selectedItems = cartItems.filter(item => item.selected);
  const totalPrice = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <ShoppingCart className="w-12 h-12 mb-3 text-gray-300" />
            <p>{language === 'zh' ? '购物车是空的' : 'Cart is empty'}</p>
            <button 
              onClick={() => navigate('/')}
              className="mt-4 px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg"
            >
              {language === 'zh' ? '去逛逛' : 'Go Shopping'}
            </button>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                  <Store className="w-3 h-3" />
                  <span>{item.shop[language]}</span>
                </div>
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    checked={item.selected}
                    onChange={() => toggleSelect(item.id)}
                    className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <div className="w-14 h-14 bg-purple-50 rounded-lg flex items-center justify-center text-3xl">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-sm truncate">{item.name[language]}</h3>
                    {item.spec && (
                      <p className="text-xs text-gray-400 mt-0.5">{item.spec[language]}</p>
                    )}
                    <p className="text-red-600 font-bold text-base">{item.price}π</p>
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
              <span className="text-sm text-gray-500">{language === 'zh' ? '合计：' : 'Total: '}</span>
              <span className="text-xl font-bold text-red-600">{totalPrice}π</span>
            </div>
            <button className="px-8 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white text-sm font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all">
              {language === 'zh' ? `结算(${selectedItems.length})` : `Checkout(${selectedItems.length})`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
