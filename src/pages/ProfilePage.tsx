import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, Heart, ShoppingBag, MapPin, Wallet as WalletIcon, Store, MessageCircle, Package, Truck, Star, DollarSign, HeadphonesIcon, ChevronDown, ChevronUp, Wallet, ArrowDownUp } from 'lucide-react';
import { Language, Translations } from '../types';

interface ProfilePageProps {
  language: Language;
  translations: Translations;
  onLogout: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ language, translations, onLogout }) => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showFavoritesDetails, setShowFavoritesDetails] = useState(false);

  useEffect(() => {
    // 从 localStorage 获取用户信息
    const piUser = localStorage.getItem('piUserInfo');
    const emailUser = localStorage.getItem('userInfo');
    const user = piUser ? JSON.parse(piUser) : emailUser ? JSON.parse(emailUser) : null;
    
    if (user) {
      setUserInfo(user);
    }
    
    // 加载地址信息
    const savedShippingAddress = localStorage.getItem('shippingAddress');
    const savedWalletAddress = localStorage.getItem('walletAddress');
    if (savedShippingAddress) setShippingAddress(savedShippingAddress);
    if (savedWalletAddress) setWalletAddress(savedWalletAddress);
    
    setIsLoading(false);
  }, []);

  const getText = (obj: { [key: string]: string }) => obj[language] || obj.zh;

  const handleSaveSettings = () => {
    // 保存地址信息到 localStorage
    localStorage.setItem('shippingAddress', shippingAddress);
    localStorage.setItem('walletAddress', walletAddress);
    setShowSettings(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#7c3aed] via-[#a855f7] to-[#c084fc]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <p className="text-white">{getText({ zh: '加载中...', en: 'Loading...', ko: '로딩 중...', vi: 'Đang tải...' })}</p>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#7c3aed] via-[#a855f7] to-[#c084fc] px-4">
        <div className="text-center">
          <User className="w-16 h-16 text-white/60 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">
            {getText({ zh: '未登录', en: 'Not Logged In', ko: '로그인하지 않음', vi: 'Chưa đăng nhập' })}
          </h2>
          <p className="text-white/80 mb-6">
            {getText({ zh: '请先登录以使用个人中心', en: 'Please login to use profile', ko: '프로필을 사용하려면 로그인하세요', vi: 'Vui lòng đăng nhập để sử dụng' })}
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-white text-purple-600 rounded-lg font-bold hover:bg-gray-100 transition-colors"
          >
            {getText({ zh: '立即登录', en: 'Login Now', ko: '지금 로그인', vi: 'Đăng nhập ngay' })}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7c3aed] via-[#a855f7] to-[#c084fc]">
      {/* 用户头部信息 */}
      <div className="text-white pt-4 pb-6 px-4 relative">
        {/* 用户名 - 居中，与设置按钮同一水平线 */}
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            {userInfo.username || userInfo.email || getText({ zh: '用户', en: 'User', ko: '사용자', vi: 'Người dùng' })}
          </h1>
        </div>
        
        {/* 设置按钮 - 右上角，与用户名高度一致 */}
        <button 
          onClick={() => setShowSettings(true)}
          className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors backdrop-blur-md border border-white/30"
        >
          <Settings className="w-5 h-5 text-white" />
        </button>
        
        <div className="max-w-md mx-auto mt-6">
          {/* 账户余额 - 紧凑布局 */}
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-md border border-white/20">
            <div className="flex items-center justify-between gap-4">
              {/* 左侧余额信息 */}
              <button className="flex-1 text-left hover:bg-white/5 rounded-lg p-2 -m-2 transition-colors">
                <div className="text-white/80 text-sm mb-0.5">
                  {getText({ zh: '账户余额', en: 'Balance', ko: '잔액', vi: 'Số dư' })}
                </div>
                <div className="text-3xl font-bold text-yellow-400 leading-tight">
                  {userInfo.balance || '0.00'} <span className="text-xl">π</span>
                </div>
              </button>
              
              {/* 右侧充值提现按钮 - 上下结构，图标在左文字在右 */}
              <div className="flex flex-col gap-2">
                <button className="inline-flex items-center gap-2 py-1.5 px-3 hover:opacity-80 transition-all active:scale-95">
                  <Wallet size={18} className="text-yellow-400" strokeWidth={2} />
                  <span className="text-sm font-bold text-white tracking-wide">{getText({ zh: '充值', en: 'Deposit', ko: '충전', vi: 'Nạp tiền' })}</span>
                </button>
                <button className="inline-flex items-center gap-2 py-1.5 px-3 hover:opacity-80 transition-all active:scale-95">
                  <ArrowDownUp size={18} className="text-yellow-400" strokeWidth={2} />
                  <span className="text-sm font-bold text-white tracking-wide">{getText({ zh: '提现', en: 'Withdraw', ko: '출금', vi: 'Rút tiền' })}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        {/* 功能菜单 */}
        <div className="space-y-3">
          {/* 我的订单 */}
          <div className="bg-white/10 rounded-lg border border-white/20 backdrop-blur-md overflow-hidden">
            <button 
              onClick={() => setShowOrderDetails(!showOrderDetails)}
              className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors"
            >
              <ShoppingBag className="w-5 h-5 text-white" />
              <span className="font-bold text-white">{getText({ zh: '我的订单', en: 'My Orders', ko: '내 주문', vi: 'Đơn hàng của tôi' })}</span>
              <span className="ml-auto text-white/60">{showOrderDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</span>
            </button>
            
            {/* 订单状态卡片 */}
            {showOrderDetails && (
              <div className="grid grid-cols-5 gap-2 px-3 pb-3">
                <button className="flex flex-col items-center gap-1.5 py-2 px-1 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                  <DollarSign className="w-5 h-5 text-yellow-300" />
                  <span className="text-[10px] text-white font-medium">{getText({ zh: '待付款', en: 'Unpaid', ko: '미결제', vi: 'Chưa thanh toán' })}</span>
                </button>
                <button className="flex flex-col items-center gap-1.5 py-2 px-1 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                  <Package className="w-5 h-5 text-blue-300" />
                  <span className="text-[10px] text-white font-medium">{getText({ zh: '待发货', en: 'To Ship', ko: '배송대기', vi: 'Chờ gửi' })}</span>
                </button>
                <button className="flex flex-col items-center gap-1.5 py-2 px-1 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                  <Truck className="w-5 h-5 text-green-300" />
                  <span className="text-[10px] text-white font-medium">{getText({ zh: '待收货', en: 'Shipping', ko: '배송중', vi: 'Đang gửi' })}</span>
                </button>
                <button className="flex flex-col items-center gap-1.5 py-2 px-1 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                  <Star className="w-5 h-5 text-purple-300" />
                  <span className="text-[10px] text-white font-medium">{getText({ zh: '待评价', en: 'Review', ko: '리뷰', vi: 'Đánh giá' })}</span>
                </button>
                <button className="flex flex-col items-center gap-1.5 py-2 px-1 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                  <HeadphonesIcon className="w-5 h-5 text-orange-300" />
                  <span className="text-[10px] text-white font-medium">{getText({ zh: '售后', en: 'Service', ko: 'A/S', vi: 'Bảo hành' })}</span>
                </button>
              </div>
            )}
          </div>

          {/* 我的收藏 */}
          <div className="bg-white/10 rounded-lg border border-white/20 backdrop-blur-md overflow-hidden">
            <button 
              onClick={() => setShowFavoritesDetails(!showFavoritesDetails)}
              className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors"
            >
              <Heart className="w-5 h-5 text-white" />
              <span className="font-bold text-white">{getText({ zh: '我的收藏', en: 'My Favorites', ko: '내 즐겨찾기', vi: 'Yêu thích của tôi' })}</span>
              <span className="ml-auto text-white/60">{showFavoritesDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</span>
            </button>
            
            {/* 收藏分类 */}
            {showFavoritesDetails && (
              <div className="grid grid-cols-2 gap-2 px-3 pb-3">
                <button className="flex items-center justify-center gap-2 py-3 px-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                  <ShoppingBag className="w-5 h-5 text-pink-300" />
                  <span className="text-sm text-white font-bold">{getText({ zh: '收藏的商品', en: 'Products', ko: '제품', vi: 'Sản phẩm' })}</span>
                </button>
                <button className="flex items-center justify-center gap-2 py-3 px-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                  <Store className="w-5 h-5 text-cyan-300" />
                  <span className="text-sm text-white font-bold">{getText({ zh: '收藏的店铺', en: 'Stores', ko: '상점', vi: 'Cửa hàng' })}</span>
                </button>
              </div>
            )}
          </div>
          
          <button className="w-full flex items-center gap-3 p-4 bg-white/10 rounded-lg border border-white/20 hover:bg-white/20 transition-colors backdrop-blur-md">
            <Store className="w-5 h-5 text-white" />
            <span className="font-bold text-white">{getText({ zh: '我的店铺', en: 'My Store', ko: '내 상점', vi: 'Cửa hàng của tôi' })}</span>
            <span className="ml-auto text-white/60">→</span>
          </button>
          
          <button className="w-full flex items-center gap-3 p-4 bg-white/10 rounded-lg border border-white/20 hover:bg-white/20 transition-colors backdrop-blur-md">
            <MessageCircle className="w-5 h-5 text-white" />
            <span className="font-bold text-white">{getText({ zh: '联系客服', en: 'Contact Support', ko: '고객 지원', vi: 'Liên hệ hỗ trợ' })}</span>
            <span className="ml-auto text-white/60">→</span>
          </button>
        </div>

      </div>
      
      {/* 设置弹窗 */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowSettings(false)}>
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {getText({ zh: '设置', en: 'Settings', ko: '설정', vi: 'Cài đặt' })}
              </h2>
              <button onClick={() => setShowSettings(false)} className="text-white/80 hover:text-white text-2xl">×</button>
            </div>
            
            <div className="space-y-4">
              {/* 收货地址 */}
              <div>
                <label className="flex items-center gap-2 text-white font-bold mb-2">
                  <MapPin className="w-5 h-5" />
                  {getText({ zh: '收货地址', en: 'Shipping Address', ko: '배송 주소', vi: 'Địa chỉ giao hàng' })}
                </label>
                <textarea
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder={getText({ zh: '请输入收货地址', en: 'Enter shipping address', ko: '배송 주소를 입력하세요', vi: 'Nhập địa chỉ giao hàng' })}
                  className="w-full px-4 py-3 bg-white/90 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 resize-none"
                  rows={3}
                />
              </div>
              
              {/* 提现钱包地址 */}
              <div>
                <label className="flex items-center gap-2 text-white font-bold mb-2">
                  <WalletIcon className="w-5 h-5" />
                  {getText({ zh: '提现钱包地址', en: 'Wallet Address', ko: '지갑 주소', vi: 'Địa chỉ ví' })}
                </label>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder={getText({ zh: '请输入Pi钱包地址', en: 'Enter Pi wallet address', ko: 'Pi 지갑 주소를 입력하세요', vi: 'Nhập địa chỉ ví Pi' })}
                  className="w-full px-4 py-3 bg-white/90 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
              
              {/* 按钮 */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 py-3 px-4 bg-white/20 text-white rounded-lg font-bold hover:bg-white/30 transition-all active:scale-95"
                >
                  {getText({ zh: '取消', en: 'Cancel', ko: '취소', vi: 'Hủy' })}
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="flex-1 py-3 px-4 bg-white text-purple-600 rounded-lg font-bold hover:bg-gray-100 transition-all active:scale-95"
                >
                  {getText({ zh: '保存', en: 'Save', ko: '저장', vi: 'Lưu' })}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
