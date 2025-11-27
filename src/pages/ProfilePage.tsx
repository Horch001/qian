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
    
    const savedReceiverName = localStorage.getItem('receiverName');
    const savedReceiverPhone = localStorage.getItem('receiverPhone');
    if (savedReceiverName) setReceiverName(savedReceiverName);
    if (savedReceiverPhone) setReceiverPhone(savedReceiverPhone);
    
    setIsLoading(false);
  }, []);

  const getText = (obj: { [key: string]: string }) => obj[language] || obj.zh;

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
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={getText({ zh: '请输入用户名', en: 'Enter username', ko: '사용자 이름을 입력하세요', vi: 'Nhập tên người dùng' })}
                  className="w-full px-4 py-3 bg-white/90 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
              
              {/* 邮箱设置 */}
              <div>
                <label className="flex items-center gap-2 text-white font-bold mb-2">
                  <Mail className="w-5 h-5" />
                  {getText({ zh: '邮箱设置', en: 'Email', ko: '이메일', vi: 'Email' })}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={getText({ zh: '请输入邮箱地址', en: 'Enter email address', ko: '이메일 주소를 입력하세요', vi: 'Nhập địa chỉ email' })}
                  className="w-full px-4 py-3 bg-white/90 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
              
              {/* 收件人信息 */}
              <div>
                <label className="flex items-center gap-2 text-white font-bold mb-2">
                  <User className="w-5 h-5" />
                  {getText({ zh: '收件人姓名', en: 'Receiver Name', ko: '수령인 이름', vi: 'Tên người nhận' })}
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
                  placeholder={getText({ zh: '请输入Pi钱包地址（大写字母+数字）', en: 'Enter Pi wallet (uppercase + numbers)', ko: 'Pi 지갑 주소 입력 (대문자+숫자)', vi: 'Nhập ví Pi (chữ hoa + số)' })}
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
                <p className="text-white/70 text-xs mt-1">
                  {getText({ zh: '提示：钱包地址必须与充值地址一致', en: 'Note: Must match deposit wallet address', ko: '참고: 충전 지갑 주소와 일치해야 합니다', vi: 'Lưu ý: Phải khớp với địa chỉ ví nạp tiền' })}
                </p>
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
