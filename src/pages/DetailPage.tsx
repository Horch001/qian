import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Star, Heart, Share2, ShoppingCart, MessageCircle, Clock, Shield, Award, Store, X, Plus, Minus, Send } from 'lucide-react';
import { Language, Translations } from '../types';
import { chatApi, ChatMessage } from '../services/api';
import socketService from '../services/socket';

interface DetailPageProps {
  language: Language;
  translations: Translations;
}

export const DetailPage: React.FC<DetailPageProps> = ({ language, translations }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showOrderSuccessModal, setShowOrderSuccessModal] = useState(false);
  const [showMerchantChat, setShowMerchantChat] = useState(false);
  const [selectedSpec, setSelectedSpec] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const item = location.state?.item || {
    id: '1',
    title: { zh: '商品详情', en: 'Product Detail', ko: '상품 상세', vi: 'Chi tiết sản phẩm' },
    price: 99,
    rating: 4.8,
    sales: 1000,
    favorites: 500,
    shop: { zh: '优质商家', en: 'Quality Shop', ko: '품질 상점', vi: 'Cửa hàng chất lượng' },
    icon: '📦',
    description: { zh: '暂无描述', en: 'No description', ko: '설명 없음', vi: 'Không có mô tả' },
  };
  
  const pageType = location.state?.pageType || 'product';

  const specs = [
    { zh: '标准版', en: 'Standard', ko: '표준', vi: 'Tiêu chuẩn' },
    { zh: '豪华版', en: 'Deluxe', ko: '디럭스', vi: 'Cao cấp' },
    { zh: '限量版', en: 'Limited', ko: '한정판', vi: 'Giới hạn' },
  ];

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const isFav = favorites.some((f: any) => f.id === item.id);
    setIsFavorite(isFav);
    setFavoriteCount(item.favorites || 0);
    if (!selectedSpec) setSelectedSpec(specs[0][language]);
  }, [item.id]);

  const handleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (isFavorite) {
      const newFavorites = favorites.filter((f: any) => f.id !== item.id);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      setFavoriteCount(prev => prev - 1);
    } else {
      favorites.push({ ...item, addedAt: new Date().toISOString() });
      localStorage.setItem('favorites', JSON.stringify(favorites));
      setFavoriteCount(prev => prev + 1);
    }
    setIsFavorite(!isFavorite);
  };

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingIndex = cart.findIndex((c: any) => c.id === item.id && c.spec === selectedSpec);
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({ ...item, quantity, spec: selectedSpec, addedAt: new Date().toISOString() });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    setShowCartModal(false);
    alert(language === 'zh' ? '已加入购物车！' : 'Added to cart!');
  };

  const handleBuy = () => {
    // 购买实物商品时检查收货信息是否完整
    if (pageType === 'product') {
      const receiverName = localStorage.getItem('receiverName');
      const receiverPhone = localStorage.getItem('receiverPhone');
      const addressProvince = localStorage.getItem('addressProvince');
      const addressCity = localStorage.getItem('addressCity');
      const addressDetail = localStorage.getItem('addressDetail');
      
      if (!receiverName || !receiverPhone || !addressProvince || !addressCity || !addressDetail) {
        alert(language === 'zh' 
          ? '购买实物商品需要填写收货信息，请先在个人中心设置中完善收件人姓名、联系电话和收货地址' 
          : language === 'en' 
          ? 'Please complete your shipping info (name, phone, address) in Profile Settings before purchasing physical products'
          : language === 'ko'
          ? '실물 상품 구매 전 프로필 설정에서 배송 정보를 완성해주세요'
          : 'Vui lòng hoàn thành thông tin giao hàng trong Cài đặt hồ sơ trước khi mua sản phẩm');
        navigate('/profile');
        return;
      }
    }
    
    setShowBuyModal(false);
    setShowPaymentModal(true);
  };

  const handlePayment = (method: 'pi' | 'balance') => {
    const totalPrice = item.price * quantity;
    
    // 余额支付时检查余额是否足够
    if (method === 'balance') {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const currentBalance = parseFloat(userInfo.balance || '0');
      
      if (currentBalance < totalPrice) {
        alert(language === 'zh' 
          ? `余额不足！当前余额: ${currentBalance}π，需要: ${totalPrice}π` 
          : language === 'en'
          ? `Insufficient balance! Current: ${currentBalance}π, Required: ${totalPrice}π`
          : language === 'ko'
          ? `잔액 부족! 현재: ${currentBalance}π, 필요: ${totalPrice}π`
          : `Số dư không đủ! Hiện tại: ${currentBalance}π, Cần: ${totalPrice}π`);
        return;
      }
      
      // 扣减余额
      const newBalance = (currentBalance - totalPrice).toFixed(2);
      userInfo.balance = newBalance;
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      
      // 同步更新 user 存储
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.balance = newBalance;
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const newOrder = {
      id: Date.now().toString(),
      item: { ...item, spec: selectedSpec },
      quantity,
      totalPrice,
      paymentMethod: method,
      status: 'paid',
      createdAt: new Date().toISOString(),
    };
    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));
    setShowPaymentModal(false);
    setShowOrderSuccessModal(true);
  };

  const getCurrentUserId = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).id : null;
  };

  const currentUserId = getCurrentUserId();

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleOpenChat = async () => {
    setShowMerchantChat(true);
    setChatLoading(true);
    
    try {
      // 获取商家用户ID（这里假设 item.merchantId 或 item.merchant?.userId 存在）
      const merchantUserId = item.merchantId || item.merchant?.userId;
      
      if (!merchantUserId) {
        // 如果没有真实商家ID，使用模拟聊天
        setChatLoading(false);
        return;
      }

      // 创建或获取聊天室
      const room = await chatApi.getOrCreateRoom(merchantUserId);
      setChatRoomId(room.id);

      // 获取历史消息
      const messages = await chatApi.getMessages(room.id);
      setChatMessages(messages);

      // 连接 Socket
      const token = localStorage.getItem('authToken');
      if (token) {
        socketService.connect(token);
        socketService.joinRoom(room.id);

        socketService.onNewMessage((message: ChatMessage) => {
          setChatMessages(prev => [...prev, message]);
          scrollToBottom();
        });
      }

      scrollToBottom();
    } catch (error) {
      console.error('Failed to open chat:', error);
    } finally {
      setChatLoading(false);
    }
  };

  const handleCloseChat = () => {
    setShowMerchantChat(false);
    if (chatRoomId) {
      socketService.leaveRoom(chatRoomId);
      socketService.offNewMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;
    
    if (chatRoomId) {
      // 使用真实聊天
      await socketService.sendMessage(chatRoomId, chatMessage.trim(), 'TEXT');
      setChatMessage('');
    } else {
      // 模拟聊天（没有真实商家时的降级方案）
      const now = new Date();
      const mockMessage: ChatMessage = {
        id: Date.now().toString(),
        roomId: 'mock',
        senderId: currentUserId || 'user',
        content: chatMessage,
        type: 'TEXT',
        isRead: true,
        createdAt: now.toISOString(),
        sender: { id: currentUserId || 'user', username: '我', avatar: undefined }
      };
      setChatMessages(prev => [...prev, mockMessage]);
      setChatMessage('');
      
      // 模拟商家回复
      setTimeout(() => {
        const replyMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          roomId: 'mock',
          senderId: 'merchant',
          content: language === 'zh' ? '您好！感谢您的咨询，请问有什么可以帮您？' : 'Hello! Thank you for your inquiry. How can I help you?',
          type: 'TEXT',
          isRead: true,
          createdAt: new Date().toISOString(),
          sender: { id: 'merchant', username: item.shop?.[language] || '商家', avatar: undefined }
        };
        setChatMessages(prev => [...prev, replyMessage]);
        scrollToBottom();
      }, 1000);
    }
  };

  const getActionButton = () => {
    switch (pageType) {
      case 'course': return { text: { zh: '立即报名', en: 'Enroll Now', ko: '지금 등록', vi: 'Đăng ký ngay' }, color: 'from-red-600 to-red-500' };
      case 'service': return { text: { zh: '立即预约', en: 'Book Now', ko: '지금 예약', vi: 'Đặt ngay' }, color: 'from-green-600 to-emerald-500' };
      case 'house': return { text: { zh: '预约看房', en: 'Schedule Visit', ko: '방문 예약', vi: 'Đặt lịch xem' }, color: 'from-amber-600 to-orange-500' };
      case 'detective': return { text: { zh: '立即咨询', en: 'Consult Now', ko: '지금 상담', vi: 'Tư vấn ngay' }, color: 'from-slate-600 to-gray-500' };
      case 'resource': return { text: { zh: '我要同求', en: 'Join Request', ko: '참여하기', vi: 'Tham gia' }, color: 'from-orange-600 to-red-500' };
      case 'invest': return { text: { zh: '立即投资', en: 'Invest Now', ko: '지금 투자', vi: 'Đầu tư ngay' }, color: 'from-purple-600 to-indigo-500' };
      default: return { text: { zh: '立即购买', en: 'Buy Now', ko: '지금 구매', vi: 'Mua ngay' }, color: 'from-red-600 to-red-500' };
    }
  };

  const actionButton = getActionButton();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-300 flex flex-col">
      <header className="bg-white/90 backdrop-blur-sm sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-sm font-bold text-gray-800">
            {language === 'zh' ? '商品详情' : language === 'en' ? 'Details' : language === 'ko' ? '상세 정보' : 'Chi tiết'}
          </h1>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Share2 className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-md w-full mx-auto overflow-auto pb-20">
        <div className="bg-gradient-to-br from-purple-100 to-pink-100 h-48 flex items-center justify-center">
          <span className="text-7xl">{item.icon}</span>
        </div>

        <div className="bg-white p-4 space-y-3">
          <div className="flex items-start justify-between">
            <h2 className="text-lg font-bold text-gray-800 flex-1">{item.title?.[language] || item.name?.[language] || item.resource?.[language] || '商品'}</h2>
            <span className="text-xl font-bold text-red-600">{item.price}π</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-bold">{item.rating || 4.8}</span>
            </div>
            <span>|</span>
            <span>{language === 'zh' ? '已售' : 'Sold'} {item.sales || 0}</span>
            <span>|</span>
            <span>{language === 'zh' ? '收藏' : 'Favs'} {favoriteCount}</span>
          </div>
        </div>

        <div className="bg-white mt-2 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Store className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">{item.shop?.[language] || '商家'}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Award className="w-3 h-3 text-purple-600" />
                  <span>{language === 'zh' ? '认证商家' : 'Verified'}</span>
                </div>
              </div>
            </div>
            <button className="px-3 py-1.5 border border-purple-600 text-purple-600 text-xs font-bold rounded-lg hover:bg-purple-50 transition-colors">
              {language === 'zh' ? '进店' : 'Visit'}
            </button>
          </div>
        </div>

        <div className="bg-white mt-2 p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-3">{language === 'zh' ? '服务保障' : 'Guarantees'}</h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Shield className="w-3.5 h-3.5 text-green-600" />
              <span>{language === 'zh' ? '平台担保' : 'Secured'}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>{language === 'zh' ? '极速响应' : 'Fast'}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Award className="w-3.5 h-3.5 text-purple-600" />
              <span>{language === 'zh' ? '品质保证' : 'Quality'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white mt-2 p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-3">{language === 'zh' ? '详情介绍' : 'Description'}</h3>
          <div className="text-sm text-gray-600 leading-relaxed">
            <p>{item.description?.[language] || (language === 'zh' ? '商家暂未上传详细介绍，请联系商家了解更多信息。' : 'No detailed description available.')}</p>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={handleOpenChat} className="flex flex-col items-center gap-0.5 px-3">
            <MessageCircle className="w-5 h-5 text-gray-500" />
            <span className="text-[10px] text-gray-500">{language === 'zh' ? '客服' : 'Chat'}</span>
          </button>
          <button onClick={() => setShowCartModal(true)} className="flex flex-col items-center gap-0.5 px-3">
            <ShoppingCart className="w-5 h-5 text-gray-500" />
            <span className="text-[10px] text-gray-500">{language === 'zh' ? '购物车' : 'Cart'}</span>
          </button>
          <button onClick={handleFavorite} className="flex flex-col items-center gap-0.5 px-3">
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
            <span className="text-[10px] text-gray-500">{language === 'zh' ? '收藏' : 'Fav'}</span>
          </button>
          <button onClick={() => setShowBuyModal(true)} className={`flex-1 py-2.5 bg-gradient-to-r ${actionButton.color} text-white text-sm font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all`}>
            {actionButton.text[language]}
          </button>
        </div>
      </div>

      {/* 购物车弹窗 - 选择规格数量 */}
      {showCartModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setShowCartModal(false)}>
          <div className="bg-white w-full max-w-md rounded-t-2xl p-4 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-20 h-20 bg-purple-100 rounded-lg flex items-center justify-center text-4xl">{item.icon}</div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">{item.title?.[language] || '商品'}</h3>
                <p className="text-red-600 font-bold text-lg">{item.price}π</p>
              </div>
              <button onClick={() => setShowCartModal(false)} className="p-1"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="mb-4">
              <p className="text-sm font-bold text-gray-700 mb-2">{language === 'zh' ? '规格' : 'Spec'}</p>
              <div className="flex flex-wrap gap-2">
                {specs.map((spec, idx) => (
                  <button key={idx} onClick={() => setSelectedSpec(spec[language])}
                    className={`px-3 py-1.5 rounded-lg text-sm border ${selectedSpec === spec[language] ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-gray-300 text-gray-600'}`}>
                    {spec[language]}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm font-bold text-gray-700 mb-2">{language === 'zh' ? '数量' : 'Qty'}</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                <span className="font-bold text-lg w-8 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><Plus className="w-4 h-4" /></button>
              </div>
            </div>
            <button onClick={handleAddToCart} className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-lg">
              {language === 'zh' ? '加入购物车' : 'Add to Cart'}
            </button>
          </div>
        </div>
      )}

      {/* 购买弹窗 - 确认参数 */}
      {showBuyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setShowBuyModal(false)}>
          <div className="bg-white w-full max-w-md rounded-t-2xl p-4 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-20 h-20 bg-purple-100 rounded-lg flex items-center justify-center text-4xl">{item.icon}</div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">{item.title?.[language] || '商品'}</h3>
                <p className="text-red-600 font-bold text-lg">{item.price}π</p>
              </div>
              <button onClick={() => setShowBuyModal(false)} className="p-1"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="mb-4">
              <p className="text-sm font-bold text-gray-700 mb-2">{language === 'zh' ? '规格' : 'Spec'}</p>
              <div className="flex flex-wrap gap-2">
                {specs.map((spec, idx) => (
                  <button key={idx} onClick={() => setSelectedSpec(spec[language])}
                    className={`px-3 py-1.5 rounded-lg text-sm border ${selectedSpec === spec[language] ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-gray-300 text-gray-600'}`}>
                    {spec[language]}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm font-bold text-gray-700 mb-2">{language === 'zh' ? '数量' : 'Qty'}</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                <span className="font-bold text-lg w-8 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><Plus className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="flex justify-between text-sm"><span className="text-gray-500">{language === 'zh' ? '商品金额' : 'Subtotal'}</span><span>{item.price}π × {quantity}</span></div>
              <div className="flex justify-between text-base font-bold mt-2"><span>{language === 'zh' ? '合计' : 'Total'}</span><span className="text-red-600">{item.price * quantity}π</span></div>
            </div>
            <button onClick={handleBuy} className={`w-full py-3 bg-gradient-to-r ${actionButton.color} text-white font-bold rounded-lg`}>
              {language === 'zh' ? '确认购买' : 'Confirm'}
            </button>
          </div>
        </div>
      )}

      {/* 支付方式选择弹窗 */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowPaymentModal(false)}>
          <div className="bg-white w-full max-w-sm rounded-2xl p-5" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-center mb-4">{language === 'zh' ? '选择支付方式' : 'Payment Method'}</h3>
            <div className="text-center mb-4">
              <p className="text-gray-500 text-sm">{language === 'zh' ? '支付金额' : 'Amount'}</p>
              <p className="text-2xl font-bold text-red-600">{item.price * quantity}π</p>
            </div>
            <div className="space-y-3">
              <button onClick={() => handlePayment('pi')} className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-lg flex items-center justify-center gap-2">
                <span className="text-xl">π</span> {language === 'zh' ? 'Pi钱包支付' : 'Pi Wallet'}
              </button>
              <button onClick={() => handlePayment('balance')} className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg">
                {language === 'zh' ? '余额支付' : 'Balance'}
              </button>
            </div>
            <button onClick={() => setShowPaymentModal(false)} className="w-full mt-3 py-2 text-gray-500 text-sm">{language === 'zh' ? '取消' : 'Cancel'}</button>
          </div>
        </div>
      )}

      {/* 订单成功弹窗 */}
      {showOrderSuccessModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <h3 className="text-lg font-bold mb-2">{language === 'zh' ? '支付成功！' : 'Payment Success!'}</h3>
            <p className="text-gray-500 text-sm mb-4">{language === 'zh' ? '订单已创建，商家将尽快处理' : 'Order created, merchant will process soon'}</p>
            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-left text-sm">
              <p><span className="text-gray-500">{language === 'zh' ? '商品：' : 'Item: '}</span>{item.title?.[language]}</p>
              <p><span className="text-gray-500">{language === 'zh' ? '规格：' : 'Spec: '}</span>{selectedSpec}</p>
              <p><span className="text-gray-500">{language === 'zh' ? '数量：' : 'Qty: '}</span>{quantity}</p>
              <p><span className="text-gray-500">{language === 'zh' ? '金额：' : 'Amount: '}</span><span className="text-red-600 font-bold">{item.price * quantity}π</span></p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowOrderSuccessModal(false); navigate('/profile'); }} className="flex-1 py-2.5 bg-purple-600 text-white font-bold rounded-lg">
                {language === 'zh' ? '查看订单' : 'View Orders'}
              </button>
              <button onClick={() => { setShowOrderSuccessModal(false); navigate(-1); }} className="flex-1 py-2.5 border border-gray-300 text-gray-600 font-bold rounded-lg">
                {language === 'zh' ? '继续购物' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 商家聊天窗口 */}
      {showMerchantChat && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={handleCloseChat}>
          <div className="bg-white w-full max-w-md h-[70vh] rounded-t-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Store className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">{item.shop?.[language] || '商家'}</p>
                  <p className="text-xs text-green-500">{language === 'zh' ? '在线' : 'Online'}</p>
                </div>
              </div>
              <button onClick={handleCloseChat}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatLoading ? (
                <div className="text-center text-gray-400">{language === 'zh' ? '加载中...' : 'Loading...'}</div>
              ) : (
                <>
                  <div className="text-center text-xs text-gray-400 mb-4">{language === 'zh' ? '欢迎咨询，商家将尽快回复您' : 'Welcome! Merchant will reply soon'}</div>
                  {chatMessages.map((msg) => {
                    const isMe = msg.senderId === currentUserId;
                    const time = new Date(msg.createdAt);
                    const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] px-3 py-2 rounded-lg ${isMe ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-[10px] mt-1 ${isMe ? 'text-purple-200' : 'text-gray-400'}`}>{timeStr}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
            <div className="p-4 border-t flex gap-2">
              <input type="text" value={chatMessage} onChange={e => setChatMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                placeholder={language === 'zh' ? '输入消息...' : 'Type message...'} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500" />
              <button onClick={handleSendMessage} className="px-4 py-2 bg-purple-600 text-white rounded-lg"><Send className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
