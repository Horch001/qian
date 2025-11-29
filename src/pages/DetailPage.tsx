import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Star, Heart, Share2, ShoppingCart, MessageCircle, Clock, Shield, Award, Store, X, Plus, Minus, Send, Loader2 } from 'lucide-react';
import { Language, Translations } from '../types';
import { chatApi, ChatMessage, orderApi, authApi, userApi, favoriteApi } from '../services/api';
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
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 获取用户余额 - 优先从本地缓存获取，异步更新
  useEffect(() => {
    // 先从 localStorage 获取缓存的余额（立即显示）
    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      try {
        const user = JSON.parse(cachedUser);
        setUserBalance(parseFloat(user.balance || '0'));
      } catch (e) {
        // 忽略解析错误
      }
    }

    // 异步从后端获取最新余额（不阻塞页面渲染）
    const fetchBalance = async () => {
      try {
        const user = await authApi.getCurrentUser();
        const newBalance = parseFloat(user.balance || '0');
        setUserBalance(newBalance);
        // 更新本地缓存
        const cached = localStorage.getItem('user');
        if (cached) {
          const userData = JSON.parse(cached);
          userData.balance = user.balance;
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } catch (error) {
        console.error('获取余额失败:', error);
      }
    };
    
    // 延迟执行，不阻塞页面渲染
    setTimeout(fetchBalance, 100);
  }, []);
  
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

  const handleFavorite = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert(language === 'zh' ? '请先登录' : 'Please login first');
      return;
    }

    // 乐观更新 - 立即更新UI
    const wasIsFavorite = isFavorite;
    const prevCount = favoriteCount;
    
    setIsFavorite(!isFavorite);
    setFavoriteCount(prev => isFavorite ? Math.max(0, prev - 1) : prev + 1);

    try {
      if (wasIsFavorite) {
        // 取消收藏 - 调用后端API
        await favoriteApi.removeFavorite(item.id);
      } else {
        // 添加收藏 - 调用后端API
        await favoriteApi.addFavorite(item.id);
      }
      // 显示成功提示
      // 使用简单的方式显示成功反馈
      console.log(language === 'zh' ? '操作成功' : 'Success');
    } catch (error: any) {
      // 回滚UI状态
      setIsFavorite(wasIsFavorite);
      setFavoriteCount(prevCount);
      console.error('收藏操作失败:', error);
      alert(error.message || (language === 'zh' ? '操作失败' : 'Operation failed'));
    }
  };

  const [addingToCart, setAddingToCart] = useState(false);

  const handleAddToCart = async () => {
    // 检查用户是否登录
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert(language === 'zh' ? '请先登录' : 'Please login first');
      return;
    }

    // 乐观更新 - 立即显示成功反馈
    setAddingToCart(true);
    setShowCartModal(false);
    
    // 立即显示成功提示（乐观更新）
    alert(language === 'zh' ? '已加入购物车！' : 'Added to cart!');

    try {
      // 调用后端API添加到购物车
      await userApi.addToCart(item.id, quantity, selectedSpec);
    } catch (error: any) {
      console.error('添加购物车失败:', error);
      // 如果失败，显示错误提示
      alert(error.message || (language === 'zh' ? '添加失败，请重试' : 'Failed to add, please retry'));
    } finally {
      setAddingToCart(false);
    }
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

  const handlePayment = async (method: 'pi' | 'balance') => {
    const totalPrice = parseFloat(item.price) * quantity;
    
    // 余额支付时检查余额是否足够
    if (method === 'balance') {
      if (userBalance < totalPrice) {
        const confirmRecharge = confirm(
          language === 'zh' 
            ? `余额不足！当前余额: ${userBalance.toFixed(2)}π，需要: ${totalPrice.toFixed(2)}π\n\n是否使用Pi钱包支付？` 
            : `Insufficient balance! Current: ${userBalance.toFixed(2)}π, Required: ${totalPrice.toFixed(2)}π\n\nUse Pi Wallet instead?`
        );
        if (confirmRecharge) {
          handlePayment('pi');
        }
        return;
      }
    }

    // 防止重复点击
    if (paymentLoading) return;
    
    setPaymentLoading(true);
    
    try {
      // 创建真实订单
      const order = await orderApi.createOrder({
        items: [{
          productId: item.id,
          quantity: quantity,
          spec: selectedSpec,
        }],
      });

      if (method === 'balance') {
        // 余额支付 - 乐观更新模式
        // 1. 立即显示成功界面（不等待后端响应）
        setShowPaymentModal(false);
        setShowOrderSuccessModal(true);
        
        // 2. 立即更新本地余额（乐观更新）
        const newBalance = userBalance - totalPrice;
        setUserBalance(newBalance);
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.balance = newBalance.toFixed(8);
        localStorage.setItem('user', JSON.stringify(user));
        
        // 3. 立即更新本地订单缓存
        const cachedOrders = JSON.parse(localStorage.getItem('cachedOrders') || '[]');
        const newOrder = {
          id: order.id,
          orderNo: order.orderNo,
          item: {
            id: item.id,
            title: { zh: item.title?.[language] || item.title, en: item.title?.en || item.title },
            icon: item.icon || '📦',
            images: item.images || [],
          },
          quantity: quantity,
          totalPrice: totalPrice,
          paymentMethod: 'BALANCE',
          status: 'paid',
          createdAt: new Date().toISOString(),
        };
        cachedOrders.unshift(newOrder);
        localStorage.setItem('cachedOrders', JSON.stringify(cachedOrders));
        
        // 4. 异步调用后端完成支付（不阻塞UI）
        orderApi.payWithBalance(order.id).then(async () => {
          console.log('支付成功确认');
          // 异步更新最新余额
          try {
            const userProfile = await userApi.getProfile();
            const actualBalance = parseFloat(userProfile.balance) || 0;
            setUserBalance(actualBalance);
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            userData.balance = actualBalance.toFixed(8);
            localStorage.setItem('user', JSON.stringify(userData));
          } catch (error) {
            console.error('更新余额失败:', error);
          }
        }).catch((payError: any) => {
          // 支付失败，回滚UI状态
          console.error('支付失败:', payError);
          const errorMsg = payError.message || '';
          // 回滚余额
          setUserBalance(userBalance);
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          userData.balance = userBalance.toFixed(8);
          localStorage.setItem('user', JSON.stringify(userData));
          // 移除订单缓存
          const orders = JSON.parse(localStorage.getItem('cachedOrders') || '[]');
          const filtered = orders.filter((o: any) => o.id !== order.id);
          localStorage.setItem('cachedOrders', JSON.stringify(filtered));
          // 显示错误
          alert(errorMsg || (language === 'zh' ? '支付失败，请重试' : 'Payment failed, please retry'));
        });
      } else {
        // Pi钱包支付 - 调用Pi SDK
        if (typeof window !== 'undefined' && (window as any).Pi) {
          const Pi = (window as any).Pi;
          
          const payment = await Pi.createPayment({
            amount: totalPrice,
            memo: `购买商品: ${item.title?.[language] || item.title || '商品'}`,
            metadata: { orderId: order.id },
          }, {
            onReadyForServerApproval: async (paymentId: string) => {
              // 通知后端批准支付
              try {
                await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/v1/pi-payment/approve`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                  },
                  body: JSON.stringify({ paymentId, orderId: order.id }),
                });
              } catch (error) {
                console.error('批准支付失败:', error);
              }
            },
            onReadyForServerCompletion: async (paymentId: string, txid: string) => {
              // 通知后端完成支付
              try {
                await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/v1/pi-payment/complete`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                  },
                  body: JSON.stringify({ paymentId, txId: txid }),
                });
                setShowPaymentModal(false);
                setShowOrderSuccessModal(true);
              } catch (error) {
                console.error('完成支付失败:', error);
                alert(language === 'zh' ? '支付完成处理失败，请联系客服' : 'Payment completion failed, please contact support');
              }
            },
            onCancel: (paymentId: string) => {
              console.log('支付已取消:', paymentId);
              alert(language === 'zh' ? '支付已取消' : 'Payment cancelled');
            },
            onError: (error: any) => {
              console.error('支付错误:', error);
              alert(language === 'zh' ? '支付失败，请重试' : 'Payment failed, please try again');
            },
          });
        } else {
          // Pi SDK未加载，提示用户
          alert(language === 'zh' 
            ? 'Pi钱包未连接，请在Pi Browser中打开本应用' 
            : 'Pi Wallet not connected. Please open this app in Pi Browser');
        }
      }
    } catch (error: any) {
      console.error('创建订单失败:', error);
      alert(error.message || (language === 'zh' ? '创建订单失败' : 'Failed to create order'));
    } finally {
      setPaymentLoading(false);
    }
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
      // 获取商家用户ID
      const merchantUserId = item.merchantId || item.merchant?.userId || item.merchant?.id;
      
      // 检查用户是否登录
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert(language === 'zh' ? '请先登录' : 'Please login first');
        setChatLoading(false);
        setShowMerchantChat(false);
        return;
      }

      if (merchantUserId) {
        // 创建或获取聊天室
        const room = await chatApi.getOrCreateRoom(merchantUserId);
        setChatRoomId(room.id);

        // 获取历史消息
        const messages = await chatApi.getMessages(room.id);
        setChatMessages(messages);

        // 连接 Socket
        socketService.connect(token);
        socketService.joinRoom(room.id);

        socketService.onNewMessage((message: ChatMessage) => {
          setChatMessages(prev => [...prev, message]);
          scrollToBottom();
        });

        scrollToBottom();
      } else {
        // 如果没有商家ID，跳转到客服页面
        setShowMerchantChat(false);
        navigate('/customer-service');
      }
    } catch (error) {
      console.error('Failed to open chat:', error);
      // 出错时跳转到客服页面
      setShowMerchantChat(false);
      navigate('/customer-service');
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
      try {
        await socketService.sendMessage(chatRoomId, chatMessage.trim(), 'TEXT');
        setChatMessage('');
        scrollToBottom();
      } catch (error) {
        console.error('发送消息失败:', error);
        alert(language === 'zh' ? '发送失败，请重试' : 'Send failed, please retry');
      }
    } else {
      // 没有聊天室，提示用户
      alert(language === 'zh' ? '请先联系客服' : 'Please contact customer service');
      navigate('/customer-service');
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
        {/* 主图展示 */}
        <div className="bg-gradient-to-br from-purple-100 to-pink-100 h-64 flex items-center justify-center overflow-hidden">
          {item.images && item.images.length > 0 ? (
            <img src={item.images[0]} alt={item.title?.[language] || '商品'} className="w-full h-full object-cover" />
          ) : (
            <span className="text-7xl">{item.icon || '📦'}</span>
          )}
        </div>
        
        {/* 副图展示 */}
        {item.images && item.images.length > 1 && (
          <div className="bg-white p-3 border-b">
            <div className="flex gap-2 overflow-x-auto">
              {item.images.slice(1).map((img: string, idx: number) => (
                <div key={idx} className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
                  <img src={img} alt={`副图 ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

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
          
          {/* 商品描述文字 */}
          <div className="text-sm text-gray-600 leading-relaxed mb-4">
            <p>{item.description?.[language] || item.description || (language === 'zh' ? '商家暂未上传详细介绍，请联系商家了解更多信息。' : 'No detailed description available.')}</p>
          </div>
          
          {/* 详情图展示 */}
          {item.detailImages && item.detailImages.length > 0 && (
            <div className="space-y-2">
              {item.detailImages.map((img: string, idx: number) => (
                <div key={idx} className="w-full rounded-lg overflow-hidden">
                  <img src={img} alt={`详情图 ${idx + 1}`} className="w-full h-auto" />
                </div>
              ))}
            </div>
          )}
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
              <div className="w-20 h-20 bg-purple-100 rounded-lg overflow-hidden">
                {item.images && item.images.length > 0 ? (
                  <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">{item.icon || '📦'}</div>
                )}
              </div>
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
              <div className="w-20 h-20 bg-purple-100 rounded-lg overflow-hidden">
                {item.images && item.images.length > 0 ? (
                  <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">{item.icon || '📦'}</div>
                )}
              </div>
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
