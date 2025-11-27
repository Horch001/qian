import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, Heart, ShoppingBag, MapPin, Wallet as WalletIcon, Store, MessageCircle, Package, Truck, Star, DollarSign, HeadphonesIcon, ChevronDown, ChevronUp, Wallet, ArrowDownUp, Mail, Upload, BarChart3, PlusCircle, Edit3, Phone } from 'lucide-react';
import { Language, Translations } from '../types';
import { LOCATION_DATA } from '../constants/locations';

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
  const [showStoreDetails, setShowStoreDetails] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  
  // 设置相关状态
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [walletLocked, setWalletLocked] = useState(false);
  const [walletError, setWalletError] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameLastModified, setUsernameLastModified] = useState<string | null>(null);
  const [isMerchant, setIsMerchant] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [favoritesList, setFavoritesList] = useState<any[]>([]);
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [expandedFavorite, setExpandedFavorite] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    // 从 localStorage 获取用户信息
    const piUser = localStorage.getItem('piUserInfo');
    const emailUser = localStorage.getItem('userInfo');
    const user = piUser ? JSON.parse(piUser) : emailUser ? JSON.parse(emailUser) : null;
    
    if (user) {
      setUserInfo(user);
      setUsername(user.username || '');
    }
    
    // 加载地址信息
    const savedShippingAddress = localStorage.getItem('shippingAddress');
    const savedWalletAddress = localStorage.getItem('walletAddress');
    const savedEmail = localStorage.getItem('userEmail');
    const savedProvince = localStorage.getItem('addressProvince');
    const savedCity = localStorage.getItem('addressCity');
    const savedDistrict = localStorage.getItem('addressDistrict');
    const savedDetail = localStorage.getItem('addressDetail');
    const savedWalletLocked = localStorage.getItem('walletLocked');
    const savedUsername = localStorage.getItem('customUsername');
    
    if (savedShippingAddress) setShippingAddress(savedShippingAddress);
    if (savedWalletAddress) setWalletAddress(savedWalletAddress);
    if (savedEmail) setEmail(savedEmail);
    if (savedProvince) setSelectedProvince(savedProvince);
    if (savedCity) setSelectedCity(savedCity);
    if (savedDistrict) setSelectedDistrict(savedDistrict);
    if (savedDetail) setDetailAddress(savedDetail);
    if (savedWalletLocked === 'true') setWalletLocked(true);
    if (savedUsername) setUsername(savedUsername);
    
    const savedUsernameLastModified = localStorage.getItem('usernameLastModified');
    if (savedUsernameLastModified) setUsernameLastModified(savedUsernameLastModified);
    
    const savedIsMerchant = localStorage.getItem('isMerchant');
    if (savedIsMerchant === 'true') setIsMerchant(true);
    
    const savedReceiverName = localStorage.getItem('receiverName');
    const savedReceiverPhone = localStorage.getItem('receiverPhone');
    if (savedReceiverName) setReceiverName(savedReceiverName);
    if (savedReceiverPhone) setReceiverPhone(savedReceiverPhone);
    
    // 加载收藏和订单统计
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    setFavoritesList(favorites);
    setOrdersList(orders);
    setFavoritesCount(favorites.length);
    setOrdersCount(orders.length);
    
    setIsLoading(false);
  }, []);
  
  // 监听localStorage变化，实时更新统计
  useEffect(() => {
    const handleStorageChange = () => {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      setFavoritesList(favorites);
      setOrdersList(orders);
      setFavoritesCount(favorites.length);
      setOrdersCount(orders.length);
    };
    
    window.addEventListener('storage', handleStorageChange);
    // 每次页面获得焦点时也刷新
    window.addEventListener('focus', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  const getText = (obj: { [key: string]: string }) => obj[language] || obj.zh;

  // 检查用户名是否可以修改（每月一次）
  const canModifyUsername = (() => {
    if (!usernameLastModified) return true;
    const lastModified = new Date(usernameLastModified);
    const now = new Date();
    const nextMonth = new Date(lastModified.getFullYear(), lastModified.getMonth() + 1, lastModified.getDate());
    return now >= nextMonth;
  })();

  const nextUsernameModifyDate = usernameLastModified 
    ? new Date(new Date(usernameLastModified).getFullYear(), new Date(usernameLastModified).getMonth() + 1, new Date(usernameLastModified).getDate()).toLocaleDateString()
    : '';

  // 获取省份列表
  const provinces = LOCATION_DATA[0]?.regions.map(r => r.name) || [];
  
  // 获取城市列表
  const cities = selectedProvince 
    ? LOCATION_DATA[0]?.regions.find(r => r.name === selectedProvince)?.cities || []
    : [];

  // 验证Pi钱包地址格式（大写字母和数字组合）
  const validateWalletAddress = (address: string): boolean => {
    const piWalletRegex = /^[A-Z0-9]+$/;
    return piWalletRegex.test(address) && address.length >= 20;
  };

  const handleWalletChange = (value: string) => {
    const upperValue = value.toUpperCase();
    setWalletAddress(upperValue);
    if (upperValue && !validateWalletAddress(upperValue)) {
      setWalletError(getText({ 
        zh: 'Pi钱包地址必须是大写字母和数字组合，至少20位', 
        en: 'Pi wallet must be uppercase letters and numbers, at least 20 characters',
        ko: 'Pi 지갑은 대문자와 숫자 조합이어야 합니다',
        vi: 'Ví Pi phải là chữ hoa và số, ít nhất 20 ký tự'
      }));
    } else {
      setWalletError('');
    }
  };

  const handleSaveSettings = () => {
    // 商家必须填写邮箱
    if (isMerchant && !email.trim()) {
      alert(getText({ zh: '商家必须填写邮箱地址', en: 'Email is required for merchants', ko: '판매자는 이메일이 필요합니다', vi: 'Email là bắt buộc đối với người bán' }));
      return;
    }
    
    // 验证钱包地址
    if (walletAddress && !validateWalletAddress(walletAddress)) {
      setWalletError(getText({ 
        zh: 'Pi钱包地址格式不正确', 
        en: 'Invalid Pi wallet address format',
        ko: '잘못된 Pi 지갑 주소 형식',
        vi: 'Định dạng địa chỉ ví Pi không hợp lệ'
      }));
      return;
    }
    
    // 组合完整地址
    const fullAddress = `${selectedProvince} ${selectedCity} ${selectedDistrict} ${detailAddress}`.trim();
    
    // 检查用户名是否有变化，如果有变化则记录修改时间
    const savedUsername = localStorage.getItem('customUsername');
    if (username !== savedUsername && username.trim()) {
      if (!canModifyUsername) {
        alert(getText({ zh: '本月已修改过用户名，请下月再试', en: 'Username already modified this month', ko: '이번 달에 이미 수정됨', vi: 'Đã sửa tháng này' }));
        return;
      }
      const now = new Date().toISOString();
      localStorage.setItem('usernameLastModified', now);
      setUsernameLastModified(now);
    }
    
    // 保存地址信息到 localStorage
    localStorage.setItem('shippingAddress', fullAddress);
    localStorage.setItem('walletAddress', walletAddress);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('addressProvince', selectedProvince);
    localStorage.setItem('addressCity', selectedCity);
    localStorage.setItem('addressDistrict', selectedDistrict);
    localStorage.setItem('addressDetail', detailAddress);
    localStorage.setItem('customUsername', username);
    localStorage.setItem('receiverName', receiverName);
    localStorage.setItem('receiverPhone', receiverPhone);
    
    // 更新用户信息中的用户名
    if (userInfo) {
      const updatedUser = { ...userInfo, username };
      setUserInfo(updatedUser);
      if (localStorage.getItem('piUserInfo')) {
        localStorage.setItem('piUserInfo', JSON.stringify(updatedUser));
      } else {
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      }
    }
    
    setShippingAddress(fullAddress);
    setShowSettings(false);
  };

  const handleWithdraw = () => {
    if (!walletAddress) {
      alert(getText({ 
        zh: '请先在设置中绑定提现钱包地址', 
        en: 'Please bind wallet address in settings first',
        ko: '먼저 설정에서 지갑 주소를 연결하세요',
        vi: 'Vui lòng liên kết địa chỉ ví trong cài đặt trước'
      }));
      setShowSettings(true);
      return;
    }
    setShowWithdrawModal(true);
  };

  const handleConfirmWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      alert(getText({ zh: '请输入有效的提现金额', en: 'Please enter a valid amount', ko: '유효한 금액을 입력하세요', vi: 'Vui lòng nhập số tiền hợp lệ' }));
      return;
    }
    if (amount > (userInfo?.balance || 0)) {
      alert(getText({ zh: '余额不足', en: 'Insufficient balance', ko: '잔액 부족', vi: 'Số dư không đủ' }));
      return;
    }
    
    // 首次提现成功后锁定钱包地址
    if (!walletLocked) {
      setWalletLocked(true);
      localStorage.setItem('walletLocked', 'true');
    }
    
    alert(getText({ 
      zh: `提现申请已提交！\n提现金额：${amount}π\n钱包地址：${walletAddress}\n\n温馨提示：\n• 提现仅在工作日处理\n• 人工审核，最迟12小时到账`, 
      en: `Withdrawal submitted!\nAmount: ${amount}π\nWallet: ${walletAddress}\n\nNote:\n• Processed on business days only\n• Manual review, up to 12 hours`,
      ko: `출금 신청 완료!\n금액: ${amount}π\n지갑: ${walletAddress}\n\n참고:\n• 영업일에만 처리\n• 수동 검토, 최대 12시간`,
      vi: `Đã gửi yêu cầu rút tiền!\nSố tiền: ${amount}π\nVí: ${walletAddress}\n\nLưu ý:\n• Chỉ xử lý vào ngày làm việc\n• Xét duyệt thủ công, tối đa 12 giờ`
    }));
    setShowWithdrawModal(false);
    setWithdrawAmount('');
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
                <button 
                  onClick={handleWithdraw}
                  className="inline-flex items-center gap-2 py-1.5 px-3 hover:opacity-80 transition-all active:scale-95"
                >
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
              {ordersCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{ordersCount}</span>
              )}
              <span className="ml-auto text-white/60">{showOrderDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</span>
            </button>
            
            {/* 订单状态卡片 */}
            {showOrderDetails && (
              <div className="px-3 pb-3 space-y-2">
                <div className="grid grid-cols-5 gap-2">
                  <button className="flex flex-col items-center gap-1.5 py-2 px-1 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                    <DollarSign className="w-5 h-5 text-yellow-300" />
                    <span className="text-[10px] text-white font-medium">{getText({ zh: '待付款', en: 'Unpaid', ko: '미결제', vi: 'Chưa thanh toán' })}</span>
                  </button>
                  <button className="flex flex-col items-center gap-1.5 py-2 px-1 bg-white/10 rounded-lg hover:bg-white/20 transition-colors relative">
                    <Package className="w-5 h-5 text-blue-300" />
                    <span className="text-[10px] text-white font-medium">{getText({ zh: '待发货', en: 'To Ship', ko: '배송대기', vi: 'Chờ gửi' })}</span>
                    {ordersCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center">{ordersCount}</span>}
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
                {/* 订单列表 */}
                {ordersList.length > 0 && (
                  <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                    {ordersList.map((order: any, idx: number) => (
                      <div key={order.id || idx} className="bg-white/10 rounded-lg overflow-hidden">
                        <button 
                          onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                          className="w-full p-2 flex items-center gap-2 hover:bg-white/5 transition-colors"
                        >
                          <span className="text-2xl">{order.item?.icon || '📦'}</span>
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-white text-xs font-medium truncate">{order.item?.title?.[language] || order.item?.name?.[language] || '商品'}</p>
                            <p className="text-white/60 text-[10px]">{order.item?.spec} × {order.quantity}</p>
                          </div>
                          <span className="text-yellow-400 font-bold text-sm">{order.totalPrice}π</span>
                          <ChevronDown className={`w-4 h-4 text-white/60 transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`} />
                        </button>
                        {/* 展开的订单详情 */}
                        {expandedOrder === order.id && (
                          <div className="px-3 pb-3 pt-1 border-t border-white/10 space-y-2">
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                              <div>
                                <span className="text-white/50">{getText({ zh: '订单编号', en: 'Order ID', ko: '주문 번호', vi: 'Mã đơn' })}</span>
                                <p className="text-white font-mono">{order.id}</p>
                              </div>
                              <div>
                                <span className="text-white/50">{getText({ zh: '下单时间', en: 'Order Time', ko: '주문 시간', vi: 'Thời gian' })}</span>
                                <p className="text-white">{new Date(order.createdAt).toLocaleString()}</p>
                              </div>
                              <div>
                                <span className="text-white/50">{getText({ zh: '支付方式', en: 'Payment', ko: '결제 방법', vi: 'Thanh toán' })}</span>
                                <p className="text-white">{order.paymentMethod === 'pi' ? 'Pi钱包' : getText({ zh: '余额支付', en: 'Balance', ko: '잔액', vi: 'Số dư' })}</p>
                              </div>
                              <div>
                                <span className="text-white/50">{getText({ zh: '订单状态', en: 'Status', ko: '상태', vi: 'Trạng thái' })}</span>
                                <p className="text-green-400">{getText({ zh: '已支付', en: 'Paid', ko: '결제 완료', vi: 'Đã thanh toán' })}</p>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-2">
                              <button className="flex-1 py-1.5 bg-white/20 text-white text-[10px] font-bold rounded-lg hover:bg-white/30">
                                {getText({ zh: '联系商家', en: 'Contact', ko: '연락', vi: 'Liên hệ' })}
                              </button>
                              <button className="flex-1 py-1.5 bg-purple-500 text-white text-[10px] font-bold rounded-lg hover:bg-purple-600">
                                {getText({ zh: '查看物流', en: 'Track', ko: '배송 추적', vi: 'Theo dõi' })}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
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
              {favoritesCount > 0 && (
                <span className="text-white/60 text-xs">({favoritesCount})</span>
              )}
              <span className="ml-auto text-white/60">{showFavoritesDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</span>
            </button>
            
            {/* 收藏分类和列表 */}
            {showFavoritesDetails && (
              <div className="px-3 pb-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button className="flex items-center justify-center gap-2 py-3 px-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors relative">
                    <ShoppingBag className="w-5 h-5 text-pink-300" />
                    <span className="text-sm text-white font-bold">{getText({ zh: '收藏的商品', en: 'Products', ko: '제품', vi: 'Sản phẩm' })}</span>
                    {favoritesCount > 0 && <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center">{favoritesCount}</span>}
                  </button>
                  <button className="flex items-center justify-center gap-2 py-3 px-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                    <Store className="w-5 h-5 text-cyan-300" />
                    <span className="text-sm text-white font-bold">{getText({ zh: '收藏的店铺', en: 'Stores', ko: '상점', vi: 'Cửa hàng' })}</span>
                  </button>
                </div>
                {/* 收藏列表 */}
                {favoritesList.length > 0 && (
                  <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                    {favoritesList.map((fav: any, idx: number) => (
                      <div key={fav.id || idx} className="bg-white/10 rounded-lg overflow-hidden">
                        <button 
                          onClick={() => setExpandedFavorite(expandedFavorite === fav.id ? null : fav.id)}
                          className="w-full p-2 flex items-center gap-2 hover:bg-white/5 transition-colors"
                        >
                          <span className="text-2xl">{fav.icon || '📦'}</span>
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-white text-xs font-medium truncate">{fav.title?.[language] || fav.name?.[language] || '商品'}</p>
                            <p className="text-white/60 text-[10px]">{fav.shop?.[language] || ''}</p>
                          </div>
                          <span className="text-yellow-400 font-bold text-sm">{fav.price}π</span>
                          <ChevronDown className={`w-4 h-4 text-white/60 transition-transform ${expandedFavorite === fav.id ? 'rotate-180' : ''}`} />
                        </button>
                        {/* 展开的商品详情 */}
                        {expandedFavorite === fav.id && (
                          <div className="px-3 pb-3 pt-1 border-t border-white/10 space-y-2">
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                              <div>
                                <span className="text-white/50">{getText({ zh: '商品评分', en: 'Rating', ko: '평점', vi: 'Đánh giá' })}</span>
                                <p className="text-yellow-400 flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-yellow-400" />
                                  {fav.rating || 4.8}
                                </p>
                              </div>
                              <div>
                                <span className="text-white/50">{getText({ zh: '已售数量', en: 'Sold', ko: '판매량', vi: 'Đã bán' })}</span>
                                <p className="text-white">{fav.sales || 0}</p>
                              </div>
                              <div>
                                <span className="text-white/50">{getText({ zh: '收藏人数', en: 'Favorites', ko: '즐겨찾기', vi: 'Yêu thích' })}</span>
                                <p className="text-white">{fav.favorites || 0}</p>
                              </div>
                              <div>
                                <span className="text-white/50">{getText({ zh: '收藏时间', en: 'Added', ko: '추가됨', vi: 'Đã thêm' })}</span>
                                <p className="text-white">{fav.addedAt ? new Date(fav.addedAt).toLocaleDateString() : '-'}</p>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-2">
                              <button 
                                onClick={() => navigate('/detail', { state: { item: fav, pageType: 'product' } })}
                                className="flex-1 py-1.5 bg-purple-500 text-white text-[10px] font-bold rounded-lg hover:bg-purple-600"
                              >
                                {getText({ zh: '查看详情', en: 'View', ko: '보기', vi: 'Xem' })}
                              </button>
                              <button 
                                onClick={() => {
                                  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
                                  const newFavorites = favorites.filter((f: any) => f.id !== fav.id);
                                  localStorage.setItem('favorites', JSON.stringify(newFavorites));
                                  setFavoritesList(newFavorites);
                                  setFavoritesCount(newFavorites.length);
                                  setExpandedFavorite(null);
                                }}
                                className="flex-1 py-1.5 bg-red-500/80 text-white text-[10px] font-bold rounded-lg hover:bg-red-600"
                              >
                                {getText({ zh: '取消收藏', en: 'Remove', ko: '삭제', vi: 'Xóa' })}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {favoritesList.length === 0 && (
                  <p className="text-white/50 text-xs text-center py-2">{getText({ zh: '暂无收藏', en: 'No favorites yet', ko: '즐겨찾기 없음', vi: 'Chưa có yêu thích' })}</p>
                )}
              </div>
            )}
          </div>
          
          {/* 我的店铺 */}
          <div className="bg-white/10 rounded-lg border border-white/20 backdrop-blur-md overflow-hidden">
            <button 
              onClick={() => setShowStoreDetails(!showStoreDetails)}
              className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors"
            >
              <Store className="w-5 h-5 text-white" />
              <span className="font-bold text-white">{getText({ zh: '我的店铺', en: 'My Store', ko: '내 상점', vi: 'Cửa hàng của tôi' })}</span>
              <span className="ml-auto text-white/60">{showStoreDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</span>
            </button>
            
            {/* 店铺功能按钮 */}
            {showStoreDetails && (
              <div className="grid grid-cols-2 gap-2 px-3 pb-3">
                <button 
                  onClick={() => navigate('/join-store')}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <PlusCircle className="w-5 h-5 text-green-300" />
                  <span className="text-sm text-white font-bold">{getText({ zh: '我要入驻', en: 'Join', ko: '입점하기', vi: 'Đăng ký' })}</span>
                </button>
                <button className="flex items-center justify-center gap-2 py-3 px-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                  <Upload className="w-5 h-5 text-blue-300" />
                  <span className="text-sm text-white font-bold">{getText({ zh: '上传商品', en: 'Upload', ko: '업로드', vi: 'Tải lên' })}</span>
                </button>
                <button className="flex items-center justify-center gap-2 py-3 px-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                  <ShoppingBag className="w-5 h-5 text-yellow-300" />
                  <span className="text-sm text-white font-bold">{getText({ zh: '我的商品', en: 'Products', ko: '내 상품', vi: 'Sản phẩm' })}</span>
                </button>
                <button className="flex items-center justify-center gap-2 py-3 px-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                  <BarChart3 className="w-5 h-5 text-purple-300" />
                  <span className="text-sm text-white font-bold">{getText({ zh: '店铺数据', en: 'Analytics', ko: '분석', vi: 'Phân tích' })}</span>
                </button>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => navigate('/customer-service')}
            className="w-full flex items-center gap-3 p-4 bg-white/10 rounded-lg border border-white/20 hover:bg-white/20 transition-colors backdrop-blur-md"
          >
            <MessageCircle className="w-5 h-5 text-white" />
            <span className="font-bold text-white">{getText({ zh: '联系客服', en: 'Contact Support', ko: '고객 지원', vi: 'Liên hệ hỗ trợ' })}</span>
            <span className="ml-auto text-white/60">→</span>
          </button>
        </div>

      </div>
      
      {/* 设置弹窗 */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowSettings(false)}>
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {getText({ zh: '设置', en: 'Settings', ko: '설정', vi: 'Cài đặt' })}
              </h2>
              <button onClick={() => setShowSettings(false)} className="text-white/80 hover:text-white text-2xl">×</button>
            </div>
            
            <div className="space-y-4">
              {/* 用户名 */}
              <div>
                <label className="flex items-center gap-2 text-white font-bold mb-2">
                  <Edit3 className="w-5 h-5" />
                  {getText({ zh: '用户名', en: 'Username', ko: '사용자 이름', vi: 'Tên người dùng' })}
                  {usernameLastModified && (
                    <span className="text-xs text-yellow-200">
                      ({getText({ zh: '每月可修改一次', en: 'Once per month', ko: '월 1회 수정 가능', vi: 'Một lần mỗi tháng' })})
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    const value = e.target.value;
                    // 只允许数字、大小写字母和中文
                    if (/^[a-zA-Z0-9\u4e00-\u9fa5]*$/.test(value)) {
                      setUsername(value);
                      setUsernameError('');
                    } else {
                      setUsernameError(getText({ zh: '只能输入数字、字母和中文', en: 'Only letters, numbers and Chinese allowed', ko: '문자, 숫자, 중국어만 허용', vi: 'Chỉ cho phép chữ cái, số và tiếng Trung' }));
                    }
                  }}
                  disabled={!canModifyUsername}
                  placeholder={getText({ zh: '请输入用户名（数字、字母、中文）', en: 'Enter username (letters, numbers, Chinese)', ko: '사용자 이름 입력 (문자, 숫자, 중국어)', vi: 'Nhập tên (chữ cái, số, tiếng Trung)' })}
                  className="w-full px-4 py-3 bg-white/90 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {usernameError && (
                  <p className="text-yellow-200 text-xs mt-1">{usernameError}</p>
                )}
                {!canModifyUsername && (
                  <p className="text-yellow-200 text-xs mt-1">
                    {getText({ zh: '本月已修改过用户名，下次可修改时间：', en: 'Username modified this month. Next available: ', ko: '이번 달에 이미 수정됨. 다음 수정 가능: ', vi: 'Đã sửa tháng này. Lần tiếp theo: ' })}
                    {nextUsernameModifyDate}
                  </p>
                )}
              </div>
              
              {/* 邮箱设置 */}
              <div>
                <label className="flex items-center gap-2 text-white font-bold mb-2">
                  <Mail className="w-5 h-5" />
                  {getText({ zh: '邮箱设置', en: 'Email', ko: '이메일', vi: 'Email' })}
                  {isMerchant && <span className="text-red-300 text-xs">*{getText({ zh: '必填', en: 'Required', ko: '필수', vi: 'Bắt buộc' })}</span>}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={getText({ zh: '请输入邮箱地址', en: 'Enter email address', ko: '이메일 주소를 입력하세요', vi: 'Nhập địa chỉ email' })}
                  className="w-full px-4 py-3 bg-white/90 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                {!isMerchant && (
                  <p className="text-white/60 text-xs mt-1">
                    {getText({ zh: '普通用户可选填', en: 'Optional for regular users', ko: '일반 사용자는 선택 사항', vi: 'Tùy chọn cho người dùng thường' })}
                  </p>
                )}
              </div>
              
              {/* 收件人信息 */}
              <div>
                <label className="flex items-center gap-2 text-white font-bold mb-2">
                  <User className="w-5 h-5" />
                  {getText({ zh: '收件人姓名', en: 'Receiver Name', ko: '수령인 이름', vi: 'Tên người nhận' })}
                  <span className="text-yellow-200 text-xs">({getText({ zh: '购买实物商品时必填', en: 'Required for physical products', ko: '실물 상품 구매 시 필수', vi: 'Bắt buộc khi mua hàng thực' })})</span>
                </label>
                <input
                  type="text"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  placeholder={getText({ zh: '请输入收件人姓名', en: 'Enter receiver name', ko: '수령인 이름을 입력하세요', vi: 'Nhập tên người nhận' })}
                  className="w-full px-4 py-3 bg-white/90 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
              
              {/* 联系电话 */}
              <div>
                <label className="flex items-center gap-2 text-white font-bold mb-2">
                  <Phone className="w-5 h-5" />
                  {getText({ zh: '联系电话', en: 'Phone Number', ko: '전화번호', vi: 'Số điện thoại' })}
                  <span className="text-yellow-200 text-xs">({getText({ zh: '购买实物商品时必填', en: 'Required for physical products', ko: '실물 상품 구매 시 필수', vi: 'Bắt buộc khi mua hàng thực' })})</span>
                </label>
                <input
                  type="tel"
                  value={receiverPhone}
                  onChange={(e) => setReceiverPhone(e.target.value)}
                  placeholder={getText({ zh: '请输入联系电话', en: 'Enter phone number', ko: '전화번호를 입력하세요', vi: 'Nhập số điện thoại' })}
                  className="w-full px-4 py-3 bg-white/90 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
              
              {/* 收货地址 - 省市区下拉框 */}
              <div>
                <label className="flex items-center gap-2 text-white font-bold mb-2">
                  <MapPin className="w-5 h-5" />
                  {getText({ zh: '收货地址', en: 'Shipping Address', ko: '배송 주소', vi: 'Địa chỉ giao hàng' })}
                  <span className="text-yellow-200 text-xs">({getText({ zh: '购买实物商品时必填', en: 'Required for physical products', ko: '실물 상품 구매 시 필수', vi: 'Bắt buộc khi mua hàng thực' })})</span>
                </label>
                
                {/* 省份选择 */}
                <select
                  value={selectedProvince}
                  onChange={(e) => {
                    setSelectedProvince(e.target.value);
                    setSelectedCity('');
                    setSelectedDistrict('');
                  }}
                  className="w-full px-4 py-3 bg-white/90 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 mb-2"
                >
                  <option value="">{getText({ zh: '请选择省份', en: 'Select Province', ko: '지역 선택', vi: 'Chọn tỉnh' })}</option>
                  {provinces.map(province => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
                
                {/* 城市选择 */}
                <select
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setSelectedDistrict('');
                  }}
                  disabled={!selectedProvince}
                  className="w-full px-4 py-3 bg-white/90 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 mb-2 disabled:opacity-50"
                >
                  <option value="">{getText({ zh: '请选择城市/区', en: 'Select City', ko: '도시 선택', vi: 'Chọn thành phố' })}</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                
                {/* 详细地址 */}
                <input
                  type="text"
                  value={detailAddress}
                  onChange={(e) => setDetailAddress(e.target.value)}
                  placeholder={getText({ zh: '请输入详细地址（街道、门牌号等）', en: 'Enter detailed address', ko: '상세 주소를 입력하세요', vi: 'Nhập địa chỉ chi tiết' })}
                  className="w-full px-4 py-3 bg-white/90 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
              
              {/* 提现钱包地址 */}
              <div>
                <label className="flex items-center gap-2 text-white font-bold mb-2">
                  <WalletIcon className="w-5 h-5" />
                  {getText({ zh: '提现钱包地址', en: 'Wallet Address', ko: '지갑 주소', vi: 'Địa chỉ ví' })}
                  {walletLocked && (
                    <span className="text-xs bg-red-500 px-2 py-0.5 rounded">
                      {getText({ zh: '已锁定', en: 'Locked', ko: '잠김', vi: 'Đã khóa' })}
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => handleWalletChange(e.target.value)}
                  disabled={walletLocked}
                  placeholder={getText({ zh: 'Pi钱包地址（大写字母+数字），必须与充值地址一致', en: 'Pi wallet (uppercase + numbers), must match deposit address', ko: 'Pi 지갑 (대문자+숫자), 충전 주소와 일치해야 함', vi: 'Ví Pi (chữ hoa + số), phải khớp với địa chỉ nạp' })}
                  className="w-full px-4 py-3 bg-white/90 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                />
                {walletError && (
                  <p className="text-yellow-200 text-xs mt-1">{walletError}</p>
                )}
                {walletLocked && (
                  <p className="text-yellow-200 text-xs mt-1">
                    {getText({ zh: '首次提现成功后钱包地址不可更改', en: 'Wallet address cannot be changed after first withdrawal', ko: '첫 출금 후 지갑 주소 변경 불가', vi: 'Không thể thay đổi địa chỉ ví sau lần rút tiền đầu tiên' })}
                  </p>
                )}
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
      
      {/* 提现弹窗 */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowWithdrawModal(false)}>
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {getText({ zh: '提现', en: 'Withdraw', ko: '출금', vi: 'Rút tiền' })}
              </h2>
              <button onClick={() => setShowWithdrawModal(false)} className="text-white/80 hover:text-white text-2xl">×</button>
            </div>
            
            <div className="space-y-4">
              {/* 当前余额 */}
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-white/80 text-sm">{getText({ zh: '当前余额', en: 'Current Balance', ko: '현재 잔액', vi: 'Số dư hiện tại' })}</p>
                <p className="text-3xl font-bold text-yellow-400">{userInfo?.balance || '0.00'} π</p>
              </div>
              
              {/* 提现金额 */}
              <div>
                <label className="text-white font-bold mb-2 block">
                  {getText({ zh: '提现金额', en: 'Withdraw Amount', ko: '출금 금액', vi: 'Số tiền rút' })}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-white/90 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-xl font-bold"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">π</span>
                </div>
              </div>
              
              {/* 钱包地址显示 */}
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-white/80 text-xs mb-1">{getText({ zh: '提现钱包地址', en: 'Wallet Address', ko: '지갑 주소', vi: 'Địa chỉ ví' })}</p>
                <p className="text-white font-mono text-sm break-all">{walletAddress}</p>
              </div>
              
              {/* 提示信息 */}
              <div className="bg-yellow-500/20 rounded-lg p-3 border border-yellow-400/30">
                <p className="text-yellow-200 text-xs leading-relaxed">
                  {getText({ 
                    zh: '⚠️ 温馨提示：\n• 提现仅在工作日处理\n• 人工审核处理，最迟12小时到账\n• 请确保钱包地址正确', 
                    en: '⚠️ Note:\n• Withdrawals processed on business days only\n• Manual review, up to 12 hours\n• Please verify wallet address',
                    ko: '⚠️ 참고:\n• 영업일에만 출금 처리\n• 수동 검토, 최대 12시간\n• 지갑 주소를 확인하세요',
                    vi: '⚠️ Lưu ý:\n• Chỉ xử lý rút tiền vào ngày làm việc\n• Xét duyệt thủ công, tối đa 12 giờ\n• Vui lòng xác minh địa chỉ ví'
                  })}
                </p>
              </div>
              
              {/* 按钮 */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 py-3 px-4 bg-white/20 text-white rounded-lg font-bold hover:bg-white/30 transition-all active:scale-95"
                >
                  {getText({ zh: '取消', en: 'Cancel', ko: '취소', vi: 'Hủy' })}
                </button>
                <button
                  onClick={handleConfirmWithdraw}
                  className="flex-1 py-3 px-4 bg-white text-purple-600 rounded-lg font-bold hover:bg-gray-100 transition-all active:scale-95"
                >
                  {getText({ zh: '确认提现', en: 'Confirm', ko: '확인', vi: 'Xác nhận' })}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
