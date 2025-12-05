import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, Heart, ShoppingBag, MapPin, Wallet as WalletIcon, Store, MessageCircle, Package, Truck, Star, DollarSign, HeadphonesIcon, ChevronDown, ChevronUp, Wallet, ArrowDownUp, Mail, Upload, BarChart3, PlusCircle, Edit3, Phone, Lock, Building2 } from 'lucide-react';
import { Language, Translations } from '../types';
import { LOCATION_DATA } from '../constants/locations';
import { usePiPayment } from '../hooks/usePiPayment';
import { orderApi, authApi, userApi, chatApi, favoriteApi } from '../services/api';
import eventsSocketService from '../services/eventsSocket';

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
  const [isEditingSettings, setIsEditingSettings] = useState(false); // 是否处于编辑模式
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // 是否有未保存的更改
  const [shippingAddress, setShippingAddress] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isWalletBound, setIsWalletBound] = useState(false); // 钱包是否已绑定（从后端加载）
  const [isWalletInputFocused, setIsWalletInputFocused] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showFavoritesDetails, setShowFavoritesDetails] = useState(false);
  const [showStoreDetails, setShowStoreDetails] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [showBalanceHistory, setShowBalanceHistory] = useState(false);
  const [balanceHistory, setBalanceHistory] = useState<any[]>([]);
  const [balanceHistoryPage, setBalanceHistoryPage] = useState(1);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  
  // 自定义弹窗状态
  const [toast, setToast] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
    amount?: string;
  }>({ show: false, type: 'success', title: '', message: '' });
  
  // 显示自定义弹窗
  const showToast = (type: 'success' | 'error' | 'info', title: string, message: string, amount?: string) => {
    setToast({ show: true, type, title, message, amount });
  };
  
  // 关闭弹窗
  const closeToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };
  
  // Pi 支付 hook
  const { recharge, isLoading: isPaymentLoading, error: paymentError, paymentStage } = usePiPayment({
    onSuccess: (result) => {
      // 充值成功，更新余额
      const newBalance = (parseFloat(userInfo?.balance || '0') + parseFloat(rechargeAmount)).toFixed(2);
      const updatedUser = { ...userInfo, balance: newBalance };
      setUserInfo(updatedUser);
      
      // 更新 localStorage
      if (localStorage.getItem('piUserInfo')) {
        localStorage.setItem('piUserInfo', JSON.stringify(updatedUser));
      } else {
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      }
      
      // 记录余额变动历史
      const history = JSON.parse(localStorage.getItem('balanceHistory') || '[]');
      history.unshift({
        type: 'add',
        amount: rechargeAmount,
        reason: getText({ zh: 'Pi钱包充值', en: 'Pi Wallet Deposit', ko: 'Pi 지갑 충전', vi: 'Nạp tiền từ ví Pi' }),
        time: new Date().toISOString(),
      });
      localStorage.setItem('balanceHistory', JSON.stringify(history.slice(0, 100))); // 最多保留100条
      
      const amount = rechargeAmount;
      setShowRechargeModal(false);
      setRechargeAmount('');
      
      // 获取最新钱包信息，检查是否是首次绑定
      userApi.getWallet().then((wallet: any) => {
        if (wallet && wallet.piAddress) {
          // 显示充值成功弹窗，包含钱包地址信息
          const successModal = document.createElement('div');
          successModal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-start justify-center p-4 pt-32';
          successModal.innerHTML = `
            <div class="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-8 max-w-sm w-full shadow-2xl animate-[scale-in_0.3s_ease-out] relative">
              <button class="absolute top-6 right-6 text-white/80 hover:text-white text-3xl leading-none" onclick="this.closest('.fixed').remove()">×</button>
              <div class="flex flex-col items-center text-center space-y-4">
                <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 class="text-2xl font-bold text-white">${getText({ zh: '充值成功！', en: 'Recharge Successful!', ko: '충전 성공!', vi: 'Nạp tiền thành công!' })}</h3>
                <div class="space-y-3 text-white/90 w-full">
                  <p class="text-lg"><span class="text-white/70">${getText({ zh: '充值金额', en: 'Amount', ko: '금액', vi: 'Số tiền' })}：</span><span class="font-bold">${amount}π</span></p>
                  <div class="text-sm">
                    <p class="text-white/70 mb-2">${getText({ zh: '已自动绑定钱包地址', en: 'Wallet address auto-bound', ko: '지갑 주소 자동 연결됨', vi: 'Địa chỉ ví đã tự động liên kết' })}</p>
                    <p class="font-mono text-xs break-keep whitespace-nowrap overflow-x-auto" title="${wallet.piAddress}">${wallet.piAddress}</p>
                  </div>
                </div>
              </div>
            </div>
          `;
          document.body.appendChild(successModal);
          successModal.addEventListener('click', (e) => {
            if (e.target === successModal) successModal.remove();
          });
        } else {
          // 没有钱包信息，显示简单提示
          showToast(
            'success',
            getText({ zh: '充值成功', en: 'Recharge Successful', ko: '충전 성공', vi: 'Nạp tiền thành công' }),
            getText({ zh: '已到账', en: 'Added to balance', ko: '잔액에 추가됨', vi: 'Đã thêm vào số dư' }),
            `${amount}π`
          );
        }
      }).catch(() => {
        // 获取钱包信息失败，显示简单提示
        showToast(
          'success',
          getText({ zh: '充值成功', en: 'Recharge Successful', ko: '충전 성공', vi: 'Nạp tiền thành công' }),
          getText({ zh: '已到账', en: 'Added to balance', ko: '잔액에 추가됨', vi: 'Đã thêm vào số dư' }),
          `${amount}π`
        );
      });
    },
    onError: (error) => {
      showToast(
        'error',
        getText({ zh: '充值失败', en: 'Recharge Failed', ko: '충전 실패', vi: 'Nạp tiền thất bại' }),
        error
      );
    },
    onCancel: () => {
      // 用户取消，不做任何处理
    }
  });
  
  // 设置相关状态
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressStep, setAddressStep] = useState<'province' | 'city' | 'district'>('province');

  const [walletError, setWalletError] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  
  // 保存原始值，用于取消编辑时恢复
  const [originalSettings, setOriginalSettings] = useState({
    email: '',
    username: '',
    walletAddress: '',
    receiverName: '',
    receiverPhone: '',
    selectedProvince: '',
    selectedCity: '',
    selectedDistrict: '',
    detailAddress: ''
  });
  const [receiverNameError, setReceiverNameError] = useState('');
  const [receiverPhoneError, setReceiverPhoneError] = useState('');
  const [detailAddressError, setDetailAddressError] = useState('');
  const [usernameLastModified, setUsernameLastModified] = useState<string | null>(null);
  const [isMerchant, setIsMerchant] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [favoritesList, setFavoritesList] = useState<any[]>([]);
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [expandedFavorite, setExpandedFavorite] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [selectedOrderTab, setSelectedOrderTab] = useState<'all' | 'unpaid' | 'pending' | 'shipping' | 'review' | 'aftersale'>('all');

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

    const savedUsername = localStorage.getItem('customUsername');
    
    if (savedShippingAddress) setShippingAddress(savedShippingAddress);
    if (savedWalletAddress) setWalletAddress(savedWalletAddress);
    if (savedEmail) setEmail(savedEmail);
    if (savedProvince) setSelectedProvince(savedProvince);
    if (savedCity) setSelectedCity(savedCity);
    if (savedDistrict) setSelectedDistrict(savedDistrict);
    if (savedDetail) setDetailAddress(savedDetail);

    if (savedUsername) setUsername(savedUsername);
    
    const savedUsernameLastModified = localStorage.getItem('usernameLastModified');
    if (savedUsernameLastModified) setUsernameLastModified(savedUsernameLastModified);
    
    const savedIsMerchant = localStorage.getItem('isMerchant');
    if (savedIsMerchant === 'true') {
      setIsMerchant(true);
      console.log('[ProfilePage] 从localStorage加载商家身份: true');
    } else {
      console.log('[ProfilePage] 从localStorage加载商家身份: false');
    }
    
    const savedReceiverName = localStorage.getItem('receiverName');
    const savedReceiverPhone = localStorage.getItem('receiverPhone');
    if (savedReceiverName) setReceiverName(savedReceiverName);
    if (savedReceiverPhone) setReceiverPhone(savedReceiverPhone);
    
    // 获取当前用户ID，用于验证缓存数据
    const currentUserId = user?.id || localStorage.getItem('authToken')?.substring(0, 20);
    const cachedUserId = localStorage.getItem('cachedUserId');
    
    // 如果用户ID不匹配，清除旧缓存（防止数据串用户）
    if (currentUserId && cachedUserId && currentUserId !== cachedUserId) {
      console.log('用户已切换，清除旧缓存');
      localStorage.removeItem('cachedFavorites');
      localStorage.removeItem('cachedOrders');
    }
    
    // 保存当前用户ID
    if (currentUserId) {
      localStorage.setItem('cachedUserId', currentUserId);
    }

    // 先从本地缓存加载数据（立即显示）- 仅当用户ID匹配时
    const cachedFavorites = localStorage.getItem('cachedFavorites');
    if (cachedFavorites && currentUserId === cachedUserId) {
      try {
        const parsed = JSON.parse(cachedFavorites);
        setFavoritesList(parsed);
        setFavoritesCount(parsed.length);
      } catch (e) {
        // 忽略解析错误
      }
    }

    // 不再从localStorage读取缓存的订单，直接从后端加载

    // 从后端加载收藏（异步更新）
    const loadFavorites = async () => {
      try {
        const favorites = await favoriteApi.getFavorites();
        // 转换格式以兼容现有UI
        const formattedFavorites = favorites.map((fav: any) => ({
          id: fav.product?.id || fav.id,
          title: { zh: fav.product?.title, en: fav.product?.titleEn || fav.product?.title },
          icon: fav.product?.icon || '📦',
          images: fav.product?.images || [],
          price: fav.product?.price,
          rating: fav.product?.rating || 5.0,
          sales: fav.product?.sales || 0,
          favorites: fav.product?.favorites || 0,
          shop: { zh: fav.product?.merchant?.shopName || '商家', en: fav.product?.merchant?.shopNameEn || fav.product?.merchant?.shopName || 'Shop' },
          addedAt: fav.createdAt,
        }));
        setFavoritesList(formattedFavorites);
        setFavoritesCount(formattedFavorites.length);
        
        // 缓存到本地（不包含图片数据，避免超出存储限制）
        try {
          const cacheData = formattedFavorites.map(fav => ({
            ...fav,
            images: [] // 不缓存图片，减少存储空间
          }));
          localStorage.setItem('cachedFavorites', JSON.stringify(cacheData));
        } catch (cacheError) {
          console.warn('缓存收藏列表失败（存储空间不足），跳过缓存:', cacheError);
          // 清理旧缓存
          localStorage.removeItem('cachedFavorites');
        }
      } catch (error) {
        console.error('加载收藏失败:', error);
        // 如果没有缓存数据，才清空
        if (!cachedFavorites) {
          setFavoritesList([]);
          setFavoritesCount(0);
        }
      }
    };
    loadFavorites();
    
    // 从后端加载订单（异步更新）
    const loadOrders = async () => {
      try {
        const orders = await orderApi.getOrders();
        
        // 转换订单格式以兼容现有UI
        const formattedOrders = orders.map((order: any) => ({
          id: order.id,
          orderNo: order.orderNo,
          item: order.items?.[0]?.product ? {
            id: order.items[0].product.id,
            title: { zh: order.items[0].product.title, en: order.items[0].product.titleEn || order.items[0].product.title },
            icon: order.items[0].product.icon || '📦',
            // 只保存第一张图片，减少存储空间
            images: order.items[0].product.images?.slice(0, 1) || [],
          } : { title: { zh: '商品' }, icon: '📦' },
          quantity: order.items?.[0]?.quantity || 1,
          totalPrice: parseFloat(order.totalAmount),
          paymentMethod: order.paymentMethod,
          status: order.orderStatus?.toLowerCase() || 'pending',
          createdAt: order.createdAt,
          // 保留售后状态标记
          hasActiveAfterSale: order.hasActiveAfterSale || false,
          afterSale: order.afterSale || null,
        }));
        
        setOrdersList(formattedOrders);
        setOrdersCount(formattedOrders.length);
        
        // 不再缓存订单到localStorage，避免存储空间超限
        // 订单数据直接从后端获取
      } catch (error) {
        console.error('加载订单失败:', error);
        // 加载失败时显示空列表
        setOrdersList([]);
        setOrdersCount(0);
      }
    };
    loadOrders();
    
    // 从后端获取最新用户信息和钱包信息
    const loadBackendData = async () => {
      try {
        // 并行加载用户信息、钱包信息和收货地址
        const [userData, wallet, addresses] = await Promise.all([
          authApi.getCurrentUser().catch(err => {
            console.error('获取用户信息失败:', err);
            return null;
          }),
          userApi.getWallet().catch(err => {
            console.error('获取钱包信息失败:', err);
            return null;
          }) as Promise<{ piAddress?: string; isLocked?: boolean } | null>,
          userApi.getAddresses().catch(err => {
            console.error('获取收货地址失败:', err);
            return [];
          })
        ]);

        if (userData) {
          setUserInfo((prev: any) => ({ ...prev, balance: userData.balance }));
          // 如果后端有邮箱数据，更新到前端状态
          if (userData.email) {
            setEmail(userData.email);
          }
          // 如果后端有用户名数据，更新到前端状态
          if (userData.username) {
            setUsername(userData.username);
          }
          // 获取密码状态
          setHasPassword(userData.hasPassword || false);
          setPasswordEnabled(userData.passwordEnabled || false);
          // 🔥 从后端获取商家身份
          console.log('[ProfilePage] 后端返回用户角色:', userData.role);
          if (userData.role === 'MERCHANT') {
            setIsMerchant(true);
            localStorage.setItem('isMerchant', 'true');
            console.log('[ProfilePage] 设置商家身份: true');
          } else {
            setIsMerchant(false);
            localStorage.setItem('isMerchant', 'false');
            console.log('[ProfilePage] 设置商家身份: false');
          }
        }

        // 加载默认收货地址
        if (addresses && addresses.length > 0) {
          const defaultAddress = addresses.find((addr: any) => addr.isDefault) || addresses[0];
          if (defaultAddress) {
            setReceiverName(defaultAddress.receiverName || '');
            setReceiverPhone(defaultAddress.receiverPhone || '');
            setSelectedProvince(defaultAddress.province || '');
            setSelectedCity(defaultAddress.city || '');
            setSelectedDistrict(defaultAddress.district || '');
            setDetailAddress(defaultAddress.detail || '');
          }
        }

        if (wallet) {
          // 如果钱包地址存在且不为空，则设置
          if (wallet.piAddress && wallet.piAddress.trim() !== '') {
            setWalletAddress(wallet.piAddress);
            setIsWalletBound(true); // 标记为已绑定
            localStorage.setItem('walletAddress', wallet.piAddress);
          } else {
            // 如果钱包地址为空（管理员解绑后），清空本地缓存和state
            setWalletAddress('');
            setIsWalletBound(false); // 标记为未绑定
            localStorage.removeItem('walletAddress');
          }
        } else {
          // 如果钱包不存在，也清空本地缓存
          setWalletAddress('');
          setIsWalletBound(false);
          localStorage.removeItem('walletAddress');
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadBackendData();
  }, []);
  
  // 刷新收藏列表的函数
  const refreshFavorites = useCallback(async () => {
    try {
      const favorites = await favoriteApi.getFavorites();
      const formattedFavorites = favorites.map((fav: any) => ({
        id: fav.product?.id || fav.id,
        title: { zh: fav.product?.title, en: fav.product?.titleEn || fav.product?.title },
        icon: fav.product?.icon || '📦',
        images: fav.product?.images || [],
        price: fav.product?.price,
        rating: fav.product?.rating || 5.0,
        sales: fav.product?.sales || 0,
        favorites: fav.product?.favorites || 0,
        shop: { zh: fav.product?.merchant?.shopName || '商家', en: fav.product?.merchant?.shopNameEn || fav.product?.merchant?.shopName || 'Shop' },
        addedAt: fav.createdAt,
      }));
      setFavoritesList(formattedFavorites);
      setFavoritesCount(formattedFavorites.length);
      
      // 更新本地缓存（不包含图片）
      try {
        const cacheData = formattedFavorites.map(fav => ({
          ...fav,
          images: []
        }));
        localStorage.setItem('cachedFavorites', JSON.stringify(cacheData));
      } catch (cacheError) {
        console.warn('缓存收藏列表失败，跳过缓存');
        localStorage.removeItem('cachedFavorites');
      }
    } catch (error) {
      console.error('刷新收藏失败:', error);
    }
  }, []);

  // 刷新订单列表的函数
  const refreshOrders = useCallback(async () => {
    try {
      const orders = await orderApi.getOrders();
      const formattedOrders = orders.map((order: any) => ({
        id: order.id,
        orderNo: order.orderNo,
        item: order.items?.[0]?.product ? {
          id: order.items[0].product.id,
          title: { zh: order.items[0].product.title, en: order.items[0].product.titleEn || order.items[0].product.title },
          icon: order.items[0].product.icon || '📦',
          images: order.items[0].product.images,
        } : { title: { zh: '商品' }, icon: '📦' },
        quantity: order.items?.[0]?.quantity || 1,
        totalPrice: parseFloat(order.totalAmount),
        paymentMethod: order.paymentMethod,
        status: order.orderStatus?.toLowerCase() || 'pending',
        createdAt: order.createdAt,
        // 保留售后状态标记
        hasActiveAfterSale: order.hasActiveAfterSale || false,
        afterSale: order.afterSale || null,
      }));
      setOrdersList(formattedOrders);
      setOrdersCount(formattedOrders.length);
      // 不再缓存订单到localStorage
    } catch (error) {
      console.error('刷新订单失败:', error);
    }
  }, []);

  // 页面获得焦点时重新加载收藏列表
  useEffect(() => {
    window.addEventListener('focus', refreshFavorites);
    return () => window.removeEventListener('focus', refreshFavorites);
  }, [refreshFavorites]);

  // WebSocket实时监听收藏和订单更新
  useEffect(() => {
    // 监听收藏更新
    const handleFavoriteUpdate = () => {
      console.log('[ProfilePage] Favorite updated via WebSocket');
      refreshFavorites();
    };

    // 监听订单更新 - 优化版：直接更新订单列表
    const handleOrderUpdate = (updatedOrder: any) => {
      console.log('[ProfilePage] Order updated via WebSocket:', updatedOrder);
      
      if (!updatedOrder || !updatedOrder.id) {
        // 如果没有订单数据，则刷新整个列表
        refreshOrders();
        return;
      }

      // 🔥 直接更新订单列表，无需重新请求API
      setOrdersList(prev => {
        const existingIndex = prev.findIndex(o => o.id === updatedOrder.id);
        
        if (existingIndex >= 0) {
          // 更新现有订单
          const newList = [...prev];
          newList[existingIndex] = {
            ...newList[existingIndex],
            ...updatedOrder,
            status: updatedOrder.orderStatus || updatedOrder.status,
            paymentStatus: updatedOrder.paymentStatus,
          };
          return newList;
        } else {
          // 新订单，添加到列表开头
          const formattedOrder = {
            id: updatedOrder.id,
            orderNo: updatedOrder.orderNo,
            totalAmount: updatedOrder.totalAmount,
            status: updatedOrder.orderStatus || updatedOrder.status,
            paymentStatus: updatedOrder.paymentStatus,
            createdAt: updatedOrder.createdAt,
            paidAt: updatedOrder.paidAt,
            items: updatedOrder.items || [],
          };
          return [formattedOrder, ...prev];
        }
      });
    };

    // 监听购物车更新
    const handleCartUpdate = () => {
      console.log('[ProfilePage] Cart updated via WebSocket');
      // 可以在这里更新购物车数量
    };

    // 钱包更新事件处理
    const handleWalletUpdate = (wallet: any) => {
      console.log('[Wallet] Received wallet update:', wallet);
      if (wallet.piAddress && wallet.piAddress.trim() !== '') {
        // 钱包绑定
        setWalletAddress(wallet.piAddress);
        setIsWalletBound(true);
        localStorage.setItem('walletAddress', wallet.piAddress);
      } else {
        // 钱包解绑（管理员操作）
        setWalletAddress('');
        setIsWalletBound(false);
        localStorage.removeItem('walletAddress');
      }
    };

    eventsSocketService.on('favorite:updated', handleFavoriteUpdate);
    eventsSocketService.on('order:updated', handleOrderUpdate);
    eventsSocketService.on('cart:updated', handleCartUpdate);
    eventsSocketService.on('wallet:updated', handleWalletUpdate);

    return () => {
      eventsSocketService.off('favorite:updated', handleFavoriteUpdate);
      eventsSocketService.off('order:updated', handleOrderUpdate);
      eventsSocketService.off('cart:updated', handleCartUpdate);
      eventsSocketService.off('wallet:updated', handleWalletUpdate);
    };
  }, [refreshFavorites, refreshOrders]);

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
  
  // 获取区列表（暂时为空，后续可扩展）
  // 对于大城市如广州、深圳等，可以在这里添加区级数据
  const districts: string[] = selectedCity ? (() => {
    // 这里可以根据城市返回对应的区
    const cityDistricts: Record<string, string[]> = {
      '广州': ['天河区', '越秀区', '海珠区', '荔湾区', '白云区', '黄埔区', '番禺区', '花都区', '南沙区', '增城区', '从化区'],
      '深圳': ['福田区', '罗湖区', '南山区', '宝安区', '龙岗区', '盐田区', '龙华区', '坪山区', '光明区', '大鹏新区'],
      '北京市': ['东城区', '西城区', '朝阳区', '丰台区', '石景山区', '海淀区', '门头沟区', '房山区', '通州区', '顺义区', '昌平区', '大兴区', '怀柔区', '平谷区', '密云区', '延庆区'],
      '上海市': ['黄浦区', '徐汇区', '长宁区', '静安区', '普陀区', '虹口区', '杨浦区', '闵行区', '宝山区', '嘉定区', '浦东新区', '金山区', '松江区', '青浦区', '奉贤区', '崇明区'],
      '天津市': ['和平区', '河东区', '河西区', '南开区', '河北区', '红桥区', '东丽区', '西青区', '津南区', '北辰区', '武清区', '宝坻区', '滨海新区', '宁河区', '静海区', '蓟州区'],
      '重庆市': ['渝中区', '大渡口区', '江北区', '沙坪坝区', '九龙坡区', '南岸区', '北碚区', '渝北区', '巴南区', '涪陵区', '綦江区', '大足区', '长寿区', '江津区', '合川区', '永川区', '南川区', '璧山区', '铜梁区', '潼南区', '荣昌区', '开州区', '梁平区', '武隆区'],
    };
    return cityDistricts[selectedCity] || [];
  })() : [];

  // 验证Pi钱包地址格式（必须56位，大写字母和数字组合）
  const validateWalletAddress = (address: string): boolean => {
    const piWalletRegex = /^[A-Z0-9]{56}$/;
    return piWalletRegex.test(address);
  };

  // 格式化钱包地址显示（用于提现弹窗和成功提示，保留前后各部分，中间用省略号）
  const formatWalletAddressShort = (address: string): string => {
    if (!address || address.length < 30) return address;
    // 显示前15位和后15位，中间用...代替
    return `${address.substring(0, 15)}...${address.substring(address.length - 15)}`;
  };

  // 格式化钱包地址显示（用于个人中心设置，字体较大，显示前后各10位）
  const formatWalletAddressLarge = (address: string): string => {
    if (!address || address.length < 20) return address;
    // 显示前10位和后10位，中间用10个省略号
    return `${address.substring(0, 10)}..........${address.substring(address.length - 10)}`;
  };

  const handleWalletChange = (value: string) => {
    const upperValue = value.toUpperCase();
    // 只允许大写字母和数字
    if (/^[A-Z0-9]*$/.test(upperValue)) {
      setWalletAddress(upperValue);
      // 只有当长度正好是56位时才清除错误，否则不显示错误（让用户继续输入）
      if (upperValue.length === 56) {
        setWalletError('');
      } else if (upperValue.length > 56) {
        // 超过56位时显示错误
        setWalletError(getText({ 
          zh: 'Pi钱包地址必须是56位', 
          en: 'Pi wallet address must be 56 characters',
          ko: 'Pi 지갑 주소는 56자여야 합니다',
          vi: 'Địa chỉ ví Pi phải có 56 ký tự'
        }));
      } else {
        // 少于56位时不显示错误，让用户继续输入
        setWalletError('');
      }
    }
    // 不符合规则的字符不会被输入
  };

  const handleEmailChange = (value: string) => {
    const lowerValue = value.toLowerCase();
    // 只允许小写字母、数字和邮箱符号
    if (/^[a-z0-9@._-]*$/.test(lowerValue)) {
      setEmail(lowerValue);
      setEmailError('');
    }
    // 不符合规则的字符不会被输入，所以不需要显示错误
  };

  const handleReceiverNameChange = (value: string) => {
    // 允许所有输入，包括拼音输入法的中间状态
    setReceiverName(value);
    // 不允许全是数字
    if (value && /^\d+$/.test(value)) {
      setReceiverNameError(getText({ 
        zh: '不能全是数字', 
        en: 'Cannot be all numbers',
        ko: '모두 숫자일 수 없습니다',
        vi: 'Không thể toàn số'
      }));
    } else {
      setReceiverNameError('');
    }
  };

  const handleReceiverPhoneChange = (value: string) => {
    // 只允许数字，最多11位
    const numericValue = value.replace(/\D/g, ''); // 移除所有非数字字符
    if (numericValue.length <= 11) {
      setReceiverPhone(numericValue);
      setReceiverPhoneError('');
    }
  };

  const handleDetailAddressChange = (value: string) => {
    // 允许所有输入，包括拼音输入法的中间状态
    setDetailAddress(value);
    setDetailAddressError('');
    // 只在保存时验证
  };

  const handleSaveSettings = async () => {
    // 商家必须填写邮箱
    if (isMerchant && !email.trim()) {
      alert(getText({ zh: '商家必须填写邮箱地址', en: 'Email is required for merchants', ko: '판매자는 이메일이 필요합니다', vi: 'Email là bắt buộc đối với người bán' }));
      return;
    }
    
    // 钱包地址由充值自动绑定，无需验证
    
    // 组合完整地址
    const fullAddress = `${selectedProvince} ${selectedCity} ${selectedDistrict} ${detailAddress}`.trim();
    
    // 保存用户名和邮箱到后端数据库
    try {
      const profileData: { username?: string; email?: string } = {};
      if (username.trim()) {
        profileData.username = username;
      }
      if (email.trim()) {
        profileData.email = email;
      }
      
      if (Object.keys(profileData).length > 0) {
        await userApi.updateProfile(profileData);
      }
    } catch (error: any) {
      alert(error.message || getText({ zh: '保存失败', en: 'Failed to save', ko: '저장 실패', vi: 'Lưu thất bại' }));
      return;
    }
    
    // 保存用户名到本地（兼容旧逻辑）
    if (username.trim()) {
      localStorage.setItem('customUsername', username);
    }
    
    // 钱包地址只能通过充值自动绑定，保存设置时不处理钱包地址
    
    // 保存地址信息到数据库
    if (receiverName && receiverPhone && selectedProvince && selectedCity && detailAddress) {
      try {
        // 先获取现有地址列表
        const addresses = await userApi.getAddresses();
        const defaultAddress = addresses.find((addr: any) => addr.isDefault);
        
        const addressData = {
          receiverName,
          receiverPhone,
          province: selectedProvince,
          city: selectedCity,
          district: selectedDistrict,
          detail: detailAddress,
          isDefault: true, // 设为默认地址
        };
        
        if (defaultAddress) {
          // 更新现有默认地址
          await userApi.updateAddress(defaultAddress.id, addressData);
        } else {
          // 创建新地址
          await userApi.createAddress(addressData);
        }
      } catch (error) {
        console.error('保存地址失败:', error);
      }
    }
    
    // 同时保存到 localStorage（兼容旧逻辑）
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
    
    // 显示保存成功提示
    alert(getText({ 
      zh: '✅ 保存成功！', 
      en: '✅ Saved successfully!', 
      ko: '✅ 저장되었습니다!', 
      vi: '✅ Đã lưu thành công!' 
    }));
    
    setShowSettings(false);
  };

  const handleWithdraw = async () => {
    // 先从后端获取最新钱包信息
    try {
      const latestWallet = await userApi.getWallet() as { piAddress?: string; isLocked?: boolean } | null;
      
      if (!latestWallet || !latestWallet.piAddress || latestWallet.piAddress.trim() === '') {
        // 钱包未绑定
        if (isMerchant) {
          alert(getText({ 
            zh: '钱包地址未绑定。请先进行一笔任意金额的充值（如0.01π），系统将自动绑定您的钱包地址。', 
            en: 'Wallet not bound. Please make a deposit of any amount (e.g. 0.01π) to auto-bind your wallet.',
            ko: '지갑이 연결되지 않았습니다. 임의 금액(예: 0.01π)을 입금하여 지갑을 자동으로 연결하세요.',
            vi: 'Ví chưa được liên kết. Vui lòng nạp bất kỳ số tiền nào (ví dụ: 0.01π) để tự động liên kết ví.'
          }));
        } else {
          alert(getText({ 
            zh: '钱包地址未绑定。请先充值，系统将自动绑定您的钱包地址。', 
            en: 'Wallet not bound. Please deposit first to auto-bind your wallet.',
            ko: '지갑이 연결되지 않았습니다. 먼저 충전하여 지갑을 자동으로 연결하세요.',
            vi: 'Ví chưa được liên kết. Vui lòng nạp tiền trước để tự động liên kết ví.'
          }));
        }
        // 同步更新state
        setWalletAddress('');
        setIsWalletBound(false);
        localStorage.removeItem('walletAddress');
        return;
      }
      
      // 同步更新state为最新钱包地址
      setWalletAddress(latestWallet.piAddress);
      setIsWalletBound(true);
      localStorage.setItem('walletAddress', latestWallet.piAddress);
      
      // 打开提现弹窗
      setShowWithdrawModal(true);
    } catch (error) {
      console.error('获取钱包信息失败:', error);
      alert(getText({ 
        zh: '获取钱包信息失败，请重试', 
        en: 'Failed to get wallet info, please try again',
        ko: '지갑 정보 가져오기 실패, 다시 시도하세요',
        vi: 'Lấy thông tin ví thất bại, vui lòng thử lại'
      }));
    }
  };

  const handleConfirmWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      alert(getText({ zh: '请输入有效的提现金额', en: 'Please enter a valid amount', ko: '유효한 금액을 입력하세요', vi: 'Vui lòng nhập số tiền hợp lệ' }));
      return;
    }
    if (amount > (userInfo?.balance || 0)) {
      alert(getText({ zh: '余额不足', en: 'Insufficient balance', ko: '잔액 부족', vi: 'Số dư không đủ' }));
      return;
    }
    
    // 验证钱包地址是否已绑定
    if (!walletAddress) {
      if (isMerchant) {
        alert(getText({ 
          zh: '钱包地址未绑定。请先进行一笔任意金额的充值（如0.01π），系统将自动绑定您的钱包地址。', 
          en: 'Wallet not bound. Please make a deposit of any amount (e.g. 0.01π) to auto-bind your wallet.',
          ko: '지갑이 연결되지 않았습니다. 임의 금액(예: 0.01π)을 입금하여 지갑을 자동으로 연결하세요.',
          vi: 'Ví chưa được liên kết. Vui lòng nạp bất kỳ số tiền nào (ví dụ: 0.01π) để tự động liên kết ví.'
        }));
      } else {
        alert(getText({ 
          zh: '钱包地址未绑定。请先充值，系统将自动绑定您的钱包地址。', 
          en: 'Wallet not bound. Please deposit first to auto-bind your wallet.',
          ko: '지갑이 연결되지 않았습니다. 먼저 충전하여 지갑을 자동으로 연결하세요.',
          vi: 'Ví chưa được liên kết. Vui lòng nạp tiền trước để tự động liên kết ví.'
        }));
      }
      return;
    }
    
    try {
      // 重新从后端获取最新的钱包信息，确保使用最新的钱包地址
      const latestWallet = await userApi.getWallet() as { piAddress?: string; isLocked?: boolean } | null;
      
      // 检查后端钱包地址是否存在且不为空
      if (!latestWallet || !latestWallet.piAddress || latestWallet.piAddress.trim() === '') {
        alert(getText({ 
          zh: '钱包地址未绑定。请先充值，系统将自动绑定您的钱包地址。', 
          en: 'Wallet not bound. Please deposit first to auto-bind your wallet.',
          ko: '지갑이 연결되지 않았습니다. 먼저 충전하여 지갑을 자동으로 연결하세요.',
          vi: 'Ví chưa được liên kết. Vui lòng nạp tiền trước để tự động liên kết ví.'
        }));
        return;
      }
      
      // 调用后端API提交提现申请
      await userApi.withdraw(amount);
      
      // 从后端重新获取最新余额
      try {
        const userData = await authApi.getCurrentUser();
        if (userData) {
          setUserInfo((prev: any) => ({ ...prev, balance: userData.balance }));
          // 同步更新 localStorage
          const storageKey = localStorage.getItem('piUserInfo') ? 'piUserInfo' : 'userInfo';
          const storedUser = JSON.parse(localStorage.getItem(storageKey) || '{}');
          localStorage.setItem(storageKey, JSON.stringify({ ...storedUser, balance: userData.balance }));
        }
      } catch (error) {
        console.error('获取最新余额失败:', error);
      }
      
      // 显示成功提示
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      
      // 显示成功弹窗
      const successModal = document.createElement('div');
      successModal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-start justify-center p-4 pt-32';

      successModal.innerHTML = `
        <div class="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-8 max-w-sm w-full shadow-2xl animate-[scale-in_0.3s_ease-out] relative">
          <button class="absolute top-6 right-6 text-white/80 hover:text-white text-3xl leading-none" onclick="this.closest('.fixed').remove()">×</button>
          <div class="flex flex-col items-center text-center space-y-4">
            <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-white">${getText({ zh: '提现申请已提交！', en: 'Withdrawal Submitted!', ko: '출금 신청 완료!', vi: 'Đã gửi yêu cầu rút tiền!' })}</h3>
            <div class="space-y-3 text-white/90 w-full">
              <p class="text-lg"><span class="text-white/70">${getText({ zh: '提现金额', en: 'Amount', ko: '금额', vi: 'Số tiền' })}：</span><span class="font-bold">${amount}π</span></p>
              <p class="text-lg"><span class="text-white/70">${getText({ zh: '到账金额', en: 'Received', ko: '수령 금액', vi: 'Số tiền nhận' })}：</span><span class="font-bold">${(amount * 0.97).toFixed(2)}π</span></p>
              <div class="text-sm">
                <p class="text-white/70 mb-1">${getText({ zh: '钱包地址', en: 'Wallet', ko: '지갑', vi: 'Ví' })}</p>
                <p class="font-mono text-sm break-all" title="${latestWallet.piAddress}">${formatWalletAddressShort(latestWallet.piAddress)}</p>
              </div>
              <p class="text-xs text-white/60 mt-2">${getText({ zh: '请在余额明细中查看处理状态', en: 'Check balance history for status', ko: '잔액 내역에서 처리 상태 확인', vi: 'Kiểm tra lịch sử số dư để xem trạng thái' })}</p>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(successModal);
      successModal.addEventListener('click', (e) => {
        if (e.target === successModal) successModal.remove();
      });
    } catch (error: any) {
      alert(error.message || getText({ zh: '提现申请失败', en: 'Withdrawal failed', ko: '출금 실패', vi: 'Rút tiền thất bại' }));
    }
  };

  // 取消订单
  const handleCancelOrder = async (order: any) => {
    const confirmMsg = getText({
      zh: '确认取消此订单？',
      en: 'Cancel this order?',
      ko: '이 주문을 취소하시겠습니까?',
      vi: 'Hủy đơn hàng này?'
    });
    
    if (confirm(confirmMsg)) {
      try {
        await orderApi.cancelOrder(order.id);
        setOrdersList(prev => prev.map(o => o.id === order.id ? { ...o, status: 'cancelled' } : o));
        alert(getText({ zh: '订单已取消', en: 'Order cancelled', ko: '주문 취소됨', vi: 'Đơn hàng đã hủy' }));
      } catch (error: any) {
        alert(error.message || getText({ zh: '取消失败', en: 'Cancel failed', ko: '취소 실패', vi: 'Hủy thất bại' }));
      }
    }
  };

  // 支付待付款订单
  const handlePayOrder = async (order: any) => {
    // 检查余额
    const balance = parseFloat(userInfo?.balance || '0');
    if (balance >= order.totalPrice) {
      const confirmMsg = getText({
        zh: `确认使用余额支付 ${order.totalPrice}π？`,
        en: `Pay ${order.totalPrice}π with balance?`,
        ko: `잔액으로 ${order.totalPrice}π 결제하시겠습니까?`,
        vi: `Thanh toán ${order.totalPrice}π bằng số dư?`
      });
      
      if (confirm(confirmMsg)) {
        try {
          await orderApi.payWithBalance(order.id);
          
          // 更新余额
          const userData = await authApi.getCurrentUser();
          if (userData) {
            const updatedUser = { ...userInfo, balance: userData.balance };
            setUserInfo(updatedUser);
            if (localStorage.getItem('piUserInfo')) {
              localStorage.setItem('piUserInfo', JSON.stringify(updatedUser));
            } else {
              localStorage.setItem('userInfo', JSON.stringify(updatedUser));
            }
          }
          
          setOrdersList(prev => prev.map(o => o.id === order.id ? { ...o, status: 'paid' } : o));
          alert(getText({ zh: '支付成功', en: 'Payment successful', ko: '결제 성공', vi: 'Thanh toán thành công' }));
        } catch (error: any) {
          alert(error.message || getText({ zh: '支付失败', en: 'Payment failed', ko: '결제 실패', vi: 'Thanh toán thất bại' }));
        }
      }
    } else {
      alert(getText({
        zh: `余额不足！当前余额: ${balance.toFixed(2)}π，需要: ${order.totalPrice}π`,
        en: `Insufficient balance! Current: ${balance.toFixed(2)}π, Required: ${order.totalPrice}π`,
        ko: `잔액 부족! 현재: ${balance.toFixed(2)}π, 필요: ${order.totalPrice}π`,
        vi: `Số dư không đủ! Hiện tại: ${balance.toFixed(2)}π, Cần: ${order.totalPrice}π`
      }));
    }
  };

  // 处理退款/退货
  const handleRefund = async (order: any, needReturn: boolean) => {
    const orderDate = new Date(order.createdAt);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 7) {
      alert(getText({ zh: '已超过7天无理由退款期限', en: 'The 7-day refund period has expired', ko: '7일 환불 기간이 만료되었습니다', vi: 'Thời hạn hoàn tiền 7 ngày đã hết' }));
      return;
    }

    if (needReturn) {
      // 已收货 - 需要退货，等待商家确认
      const confirmMsg = getText({
        zh: `确认申请退货退款？\n\n退款金额：${order.totalPrice}π\n\n请将商品寄回商家，商家确认收货后将退款到您的账户余额。\n\n注意：运费需自理`,
        en: `Confirm return & refund?\n\nRefund: ${order.totalPrice}π\n\nPlease return the item. Refund will be processed after merchant confirms receipt.\n\nNote: Shipping cost is on you`,
        ko: `반품 환불을 신청하시겠습니까?\n\n환불: ${order.totalPrice}π\n\n상품을 반송해주세요. 판매자 확인 후 환불됩니다.\n\n참고: 배송비는 본인 부담`,
        vi: `Xác nhận trả hàng hoàn tiền?\n\nHoàn tiền: ${order.totalPrice}π\n\nVui lòng gửi trả hàng. Hoàn tiền sau khi người bán xác nhận.\n\nLưu ý: Phí vận chuyển tự chịu`
      });
      
      if (confirm(confirmMsg)) {
        const reason = prompt(getText({
          zh: '请输入退货原因：',
          en: 'Please enter return reason:',
          ko: '반품 사유를 입력하세요:',
          vi: 'Nhập lý do trả hàng:'
        }));
        
        if (!reason || !reason.trim()) {
          alert(getText({ zh: '请输入退货原因', en: 'Please enter reason', ko: '사유를 입력하세요', vi: 'Vui lòng nhập lý do' }));
          return;
        }
        
        try {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
          const token = localStorage.getItem('authToken');
          
          const response = await fetch(`${API_URL}/api/v1/after-sales`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              orderId: order.id,
              type: 'RETURN_REFUND',
              reason: reason.trim(),
              amount: parseFloat(order.totalPrice),
            }),
          });
          
          if (response.ok) {
            alert(getText({ 
              zh: '退货申请已提交，等待商家审核', 
              en: 'Return request submitted, waiting for merchant review', 
              ko: '반품 신청이 제출되었습니다. 판매자 검토 대기 중', 
              vi: 'Yêu cầu trả hàng đã gửi, chờ người bán xem xét' 
            }));
            // 刷新订单列表
            refreshOrders();
          } else {
            const error = await response.json();
            throw new Error(error.message);
          }
        } catch (error: any) {
          alert(error.message || getText({ zh: '申请失败', en: 'Request failed', ko: '신청 실패', vi: 'Yêu cầu thất bại' }));
        }
      }
    } else {
      // 未收货 - 申请售后（仅退款）
      const reason = prompt(getText({
        zh: '请输入退款原因：',
        en: 'Please enter refund reason:',
        ko: '환불 사유를 입력하세요:',
        vi: 'Nhập lý do hoàn tiền:'
      }));
      
      if (!reason || !reason.trim()) {
        alert(getText({ zh: '请输入退款原因', en: 'Please enter reason', ko: '사유를 입력하세요', vi: 'Vui lòng nhập lý do' }));
        return;
      }
      
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const token = localStorage.getItem('authToken');
        
        const response = await fetch(`${API_URL}/api/v1/after-sales`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            orderId: order.id,
            type: 'REFUND_ONLY',
            reason: reason.trim(),
            amount: parseFloat(order.totalPrice),
          }),
        });
        
        if (response.ok) {
          alert(getText({ 
            zh: '退款申请已提交，等待商家审核', 
            en: 'Refund request submitted, waiting for merchant review', 
            ko: '환불 신청이 제출되었습니다. 판매자 검토 대기 중', 
            vi: 'Yêu cầu hoàn tiền đã gửi, chờ người bán xem xét' 
          }));
          // 刷新订单列表
          refreshOrders();
        } else {
          const error = await response.json();
          throw new Error(error.message);
        }
      } catch (error: any) {
        alert(error.message || getText({ zh: '申请失败', en: 'Request failed', ko: '신청 실패', vi: 'Yêu cầu thất bại' }));
      }
    }
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
    navigate('/');
    return null;
  }

  // 保留原来的未登录界面代码作为备用
  const _unusedLoginPrompt = (
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7c3aed] via-[#a855f7] to-[#c084fc]">
      {/* 用户头部信息 */}
      <div className="text-white pt-4 pb-6 px-4 relative">
        {/* 用户名 - 居中，与设置按钮同一水平线 */}
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            {(() => {
              // 过滤掉无法显示的字符（如果用户名只包含特殊字符则显示默认值）
              const displayName = userInfo.username || userInfo.email || '';
              const cleanName = displayName.replace(/[^\w\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af@._-]/g, '');
              return cleanName || getText({ zh: '用户', en: 'User', ko: '사용자', vi: 'Người dùng' });
            })()}
          </h1>
        </div>
        
        {/* 设置按钮 - 右上角，与用户名高度一致 */}
        <button 
          onClick={() => {
            // 保存当前值作为原始值
            setOriginalSettings({
              email,
              username,
              walletAddress,
              receiverName,
              receiverPhone,
              selectedProvince,
              selectedCity,
              selectedDistrict,
              detailAddress
            });
            setIsEditingSettings(false); // 打开时默认为只读模式
            setShowSettings(true);
          }}
          className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors backdrop-blur-md border border-white/30"
        >
          <Settings className="w-5 h-5 text-white" />
        </button>
        
        <div className="max-w-md mx-auto mt-6">
          {/* 账户余额 - 紧凑布局 */}
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-md border border-white/20">
            <div className="flex items-center justify-between gap-4">
              {/* 左侧余额信息 - 点击显示明细 */}
              <button 
                onClick={async () => {
                  // 从后端加载余额明细和最新余额
                  try {
                    const [history, userData] = await Promise.all([
                      userApi.getBalanceHistory(),
                      authApi.getCurrentUser()
                    ]);
                    
                    setBalanceHistory(history.map((item: any) => ({
                      type: item.type === 'RECHARGE' || item.type === 'REFUND' || item.type === 'INCOME' ? 'add' : 'subtract',
                      amount: item.amount,
                      reason: item.reason,
                      time: item.createdAt,
                      withdrawalStatus: item.withdrawalStatus,
                    })));
                    
                    // 更新余额
                    if (userData) {
                      setUserInfo((prev: any) => ({ ...prev, balance: userData.balance }));
                      const storageKey = localStorage.getItem('piUserInfo') ? 'piUserInfo' : 'userInfo';
                      const storedUser = JSON.parse(localStorage.getItem(storageKey) || '{}');
                      localStorage.setItem(storageKey, JSON.stringify({ ...storedUser, balance: userData.balance }));
                    }
                  } catch (error) {
                    console.error('加载余额明细失败:', error);
                    // 降级到localStorage
                    const history = JSON.parse(localStorage.getItem('balanceHistory') || '[]');
                    setBalanceHistory(history);
                  }
                  setShowBalanceHistory(true);
                }}
                className="flex-1 text-left hover:bg-white/5 rounded-lg p-2 -m-2 transition-colors"
              >
                <div className="text-white/80 text-sm mb-0.5 flex items-center gap-1">
                  {getText({ zh: '账户余额', en: 'Balance', ko: '잔액', vi: 'Số dư' })}
                  <span className="text-[10px] text-white/50">({getText({ zh: '点击查看明细', en: 'Tap for details', ko: '상세 보기', vi: 'Xem chi tiết' })})</span>
                </div>
                <div className="text-3xl font-bold text-yellow-400 leading-tight">
                  {userInfo.balance || '0.00'} <span className="text-xl">π</span>
                </div>
              </button>
              
              {/* 右侧充值提现按钮 - 上下结构，图标在左文字在右 */}
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => setShowRechargeModal(true)}
                  className="inline-flex items-center gap-2 py-1.5 px-3 hover:opacity-80 transition-all active:scale-95"
                >
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
                <span className="text-white/60 text-xs">({ordersCount})</span>
              )}
              <span className="ml-auto text-white/60">{showOrderDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</span>
            </button>
            
            {/* 订单状态卡片 */}
            {showOrderDetails && (
              <div className="px-3 pb-3 space-y-2">
                <div className="grid grid-cols-6 gap-1.5">
                  <button 
                    onClick={() => setSelectedOrderTab('all')}
                    className={`flex flex-col items-center gap-1 py-2 px-0.5 rounded-lg transition-colors relative ${selectedOrderTab === 'all' ? 'bg-white/30 ring-1 ring-white/50' : 'bg-white/10 hover:bg-white/20'}`}
                  >
                    <ShoppingBag className="w-5 h-5 text-white" />
                    <span className="text-[9px] text-white font-medium">{getText({ zh: '全部', en: 'All', ko: '전체', vi: 'Tất cả' })}</span>
                  </button>
                  <button 
                    onClick={() => setSelectedOrderTab('unpaid')}
                    className={`flex flex-col items-center gap-1 py-2 px-0.5 rounded-lg transition-colors relative ${selectedOrderTab === 'unpaid' ? 'bg-white/30 ring-1 ring-white/50' : 'bg-white/10 hover:bg-white/20'}`}
                  >
                    <DollarSign className="w-5 h-5 text-yellow-300" />
                    <span className="text-[9px] text-white font-medium">{getText({ zh: '待付款', en: 'Unpaid', ko: '미결제', vi: 'Chờ TT' })}</span>
                    {(() => { const c = ordersList.filter((o: any) => o.status === 'pending' && !o.hasActiveAfterSale).length; return c > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center">{c}</span>; })()}
                  </button>
                  <button 
                    onClick={() => setSelectedOrderTab('pending')}
                    className={`flex flex-col items-center gap-1 py-2 px-0.5 rounded-lg transition-colors relative ${selectedOrderTab === 'pending' ? 'bg-white/30 ring-1 ring-white/50' : 'bg-white/10 hover:bg-white/20'}`}
                  >
                    <Package className="w-5 h-5 text-blue-300" />
                    <span className="text-[9px] text-white font-medium">{getText({ zh: '待发货', en: 'To Ship', ko: '배송대기', vi: 'Chờ gửi' })}</span>
                    {(() => { const c = ordersList.filter((o: any) => o.status === 'paid' && !o.hasActiveAfterSale).length; return c > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center">{c}</span>; })()}
                  </button>
                  <button 
                    onClick={() => setSelectedOrderTab('shipping')}
                    className={`flex flex-col items-center gap-1 py-2 px-0.5 rounded-lg transition-colors relative ${selectedOrderTab === 'shipping' ? 'bg-white/30 ring-1 ring-white/50' : 'bg-white/10 hover:bg-white/20'}`}
                  >
                    <Truck className="w-5 h-5 text-green-300" />
                    <span className="text-[9px] text-white font-medium">{getText({ zh: '待收货', en: 'Shipping', ko: '배송중', vi: 'Đang gửi' })}</span>
                    {(() => { const c = ordersList.filter((o: any) => o.status === 'shipped' && !o.hasActiveAfterSale).length; return c > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center">{c}</span>; })()}
                  </button>
                  <button 
                    onClick={() => setSelectedOrderTab('review')}
                    className={`flex flex-col items-center gap-1 py-2 px-0.5 rounded-lg transition-colors relative ${selectedOrderTab === 'review' ? 'bg-white/30 ring-1 ring-white/50' : 'bg-white/10 hover:bg-white/20'}`}
                  >
                    <Star className="w-5 h-5 text-purple-300" />
                    <span className="text-[9px] text-white font-medium">{getText({ zh: '待评价', en: 'Review', ko: '리뷰', vi: 'Đánh giá' })}</span>
                    {(() => { const c = ordersList.filter((o: any) => o.status === 'completed' && !o.reviewed && !o.hasActiveAfterSale).length; return c > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center">{c}</span>; })()}
                  </button>
                  <button 
                    onClick={() => setSelectedOrderTab('aftersale')}
                    className={`flex flex-col items-center gap-1 py-2 px-0.5 rounded-lg transition-colors relative ${selectedOrderTab === 'aftersale' ? 'bg-white/30 ring-1 ring-white/50' : 'bg-white/10 hover:bg-white/20'}`}
                  >
                    <HeadphonesIcon className="w-5 h-5 text-orange-300" />
                    <span className="text-[9px] text-white font-medium">{getText({ zh: '售后', en: 'Service', ko: 'A/S', vi: 'Bảo hành' })}</span>
                    {(() => { const c = ordersList.filter((o: any) => o.hasActiveAfterSale || o.status === 'refunded' || o.status === 'refunding').length; return c > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center">{c}</span>; })()}
                  </button>
                </div>
                {/* 订单列表 */}
                {(() => {
                  const filteredOrders = ordersList.filter((o: any) => {
                    switch (selectedOrderTab) {
                      case 'unpaid': return o.status === 'pending' && !o.hasActiveAfterSale;
                      case 'pending': return o.status === 'paid' && !o.hasActiveAfterSale;
                      case 'shipping': return o.status === 'shipped' && !o.hasActiveAfterSale;
                      case 'review': return o.status === 'completed' && !o.reviewed && !o.hasActiveAfterSale;
                      case 'aftersale': return o.hasActiveAfterSale || o.status === 'refunded' || o.status === 'refunding';
                      default: return true;
                    }
                  });
                  return filteredOrders.length > 0 && (
                  <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                    {filteredOrders.map((order: any, idx: number) => (
                      <div key={order.id || idx} className="bg-white/10 rounded-lg overflow-hidden">
                        <button 
                          onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                          className="w-full p-2 flex items-center gap-2 hover:bg-white/5 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                            {order.item?.images?.[0] ? (
                              <img src={order.item.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xl">{order.item?.icon || '📦'}</div>
                            )}
                          </div>
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
                                <p className={order.status === 'refunded' ? 'text-gray-400' : order.status === 'refunding' ? 'text-orange-400' : order.status === 'cancelled' ? 'text-gray-400' : order.status === 'pending' ? 'text-yellow-400' : 'text-green-400'}>
                                  {order.status === 'pending' ? getText({ zh: '待付款', en: 'Pending Payment', ko: '결제 대기', vi: 'Chờ thanh toán' })
                                    : order.status === 'paid' ? getText({ zh: '待发货', en: 'Paid', ko: '결제 완료', vi: 'Đã thanh toán' })
                                    : order.status === 'shipped' ? getText({ zh: '已发货', en: 'Shipped', ko: '배송됨', vi: 'Đã gửi' })
                                    : order.status === 'completed' ? getText({ zh: '已完成', en: 'Completed', ko: '완료', vi: 'Hoàn thành' })
                                    : order.status === 'refunding' ? getText({ zh: '退款中', en: 'Refunding', ko: '환불 중', vi: 'Đang hoàn tiền' })
                                    : order.status === 'refunded' ? getText({ zh: '已退款', en: 'Refunded', ko: '환불됨', vi: 'Đã hoàn tiền' })
                                    : order.status === 'cancelled' ? getText({ zh: '已取消', en: 'Cancelled', ko: '취소됨', vi: 'Đã hủy' })
                                    : getText({ zh: '未知', en: 'Unknown', ko: '알 수 없음', vi: 'Không xác định' })}
                                </p>
                              </div>
                            </div>
                            {/* 七天无理由退款提示 */}
                            {order.status !== 'refunded' && order.status !== 'refunding' && order.status !== 'cancelled' && order.status !== 'pending' && (() => {
                              const daysDiff = Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                              const daysLeft = 7 - daysDiff;
                              return daysLeft > 0 && <div className="text-[10px] text-yellow-300 bg-yellow-500/10 px-2 py-1 rounded">{getText({ zh: `七天无理由退款，剩余 ${daysLeft} 天`, en: `7-day refund, ${daysLeft} days left`, ko: `7일 환불, ${daysLeft}일 남음`, vi: `Hoàn tiền 7 ngày, còn ${daysLeft} ngày` })}</div>;
                            })()}
                            {/* 待付款订单操作 */}
                            {order.status === 'pending' && (
                              <div className="flex gap-2 mt-2">
                                <button 
                                  onClick={() => handleCancelOrder(order)}
                                  className="flex-1 py-1.5 bg-gray-500/80 text-white text-[10px] font-bold rounded-lg hover:bg-gray-600"
                                >
                                  {getText({ zh: '取消订单', en: 'Cancel', ko: '취소', vi: 'Hủy' })}
                                </button>
                                <button 
                                  onClick={() => handlePayOrder(order)}
                                  className="flex-1 py-1.5 bg-green-500 text-white text-[10px] font-bold rounded-lg hover:bg-green-600"
                                >
                                  {getText({ zh: '立即支付', en: 'Pay Now', ko: '지금 결제', vi: 'Thanh toán' })}
                                </button>
                              </div>
                            )}
                            {/* 已付款订单操作 */}
                            {order.status !== 'pending' && order.status !== 'cancelled' && order.status !== 'refunded' && order.status !== 'refunding' && (
                              <div className="flex gap-2 mt-2">
                                <button className="flex-1 py-1.5 bg-white/20 text-white text-[10px] font-bold rounded-lg hover:bg-white/30">
                                  {getText({ zh: '联系商家', en: 'Contact', ko: '연락', vi: 'Liên hệ' })}
                                </button>
                                {/* 查看物流按钮 - 已发货和已完成订单可查看 */}
                                {(order.status === 'shipped' || order.status === 'completed') && (
                                  <button 
                                    onClick={() => {
                                      navigate('/logistics', { 
                                        state: { orderId: order.id } 
                                      });
                                    }}
                                    className="flex-1 py-1.5 bg-purple-500 text-white text-[10px] font-bold rounded-lg hover:bg-purple-600"
                                  >
                                    {getText({ zh: '查看物流', en: 'Track', ko: '배송 추적', vi: 'Theo dõi' })}
                                  </button>
                                )}
                                {/* 确认收货按钮 - 仅已发货订单显示 */}
                                {order.status === 'shipped' && (
                                  <button 
                                    onClick={async () => {
                                      if (!confirm(getText({ zh: '确认收货？', en: 'Confirm receipt?', ko: '수령 확인?', vi: 'Xác nhận nhận hàng?' }))) {
                                        return;
                                      }
                                      try {
                                        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                                        const token = localStorage.getItem('authToken');
                                        const response = await fetch(`${API_URL}/api/v1/orders/${order.id}/confirm`, {
                                          method: 'POST',
                                          headers: {
                                            'Authorization': `Bearer ${token}`,
                                          },
                                        });
                                        if (response.ok) {
                                          alert(getText({ zh: '确认收货成功！', en: 'Confirmed!', ko: '확인됨!', vi: 'Đã xác nhận!' }));
                                          window.location.reload();
                                        } else {
                                          const error = await response.json();
                                          alert(error.message || getText({ zh: '操作失败', en: 'Failed', ko: '실패', vi: 'Thất bại' }));
                                        }
                                      } catch (error) {
                                        alert(getText({ zh: '操作失败', en: 'Failed', ko: '실패', vi: 'Thất bại' }));
                                      }
                                    }}
                                    className="flex-1 py-1.5 bg-green-500 text-white text-[10px] font-bold rounded-lg hover:bg-green-600"
                                  >
                                    {getText({ zh: '确认收货', en: 'Confirm', ko: '수령 확인', vi: 'Xác nhận' })}
                                  </button>
                                )}
                                {/* 评价商品按钮 */}
                                {order.status === 'completed' && !order.reviewed && (
                                  <button 
                                    onClick={() => {
                                      navigate('/review', { 
                                        state: { 
                                          order: order,
                                          item: order.items[0]
                                        } 
                                      });
                                    }}
                                    className="flex-1 py-1.5 bg-yellow-500 text-white text-[10px] font-bold rounded-lg hover:bg-yellow-600"
                                  >
                                    {getText({ zh: '评价商品', en: 'Review', ko: '상품 리뷰', vi: 'Đánh giá SP' })}
                                  </button>
                                )}
                                {/* 评价商家按钮 */}
                                {order.status === 'completed' && !order.merchantReviewed && (
                                  <button 
                                    onClick={() => {
                                      navigate('/merchant-review', { 
                                        state: { 
                                          order: order,
                                          merchantId: order.items[0]?.product?.merchantId,
                                          merchantName: order.items[0]?.product?.merchant?.shopName
                                        } 
                                      });
                                    }}
                                    className="flex-1 py-1.5 bg-green-500 text-white text-[10px] font-bold rounded-lg hover:bg-green-600"
                                  >
                                    {getText({ zh: '评价商家', en: 'Review Shop', ko: '판매자 리뷰', vi: 'Đánh giá shop' })}
                                  </button>
                                )}
                              </div>
                            )}
                            {/* 退款/退货按钮 */}
                            {order.status !== 'refunded' && order.status !== 'refunding' && order.status !== 'cancelled' && order.status !== 'pending' && (() => {
                              const daysDiff = Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                              if (daysDiff > 7) return null;
                              const isCompleted = order.status === 'completed';
                              return (
                                <div className="flex gap-2 mt-1">
                                  {!isCompleted ? (
                                    <button onClick={() => handleRefund(order, false)} className="flex-1 py-1.5 bg-red-500/80 text-white text-[10px] font-bold rounded-lg hover:bg-red-600">
                                      {getText({ zh: '申请退款', en: 'Refund', ko: '환불', vi: 'Hoàn tiền' })}
                                    </button>
                                  ) : (
                                    <button onClick={() => handleRefund(order, true)} className="flex-1 py-1.5 bg-orange-500/80 text-white text-[10px] font-bold rounded-lg hover:bg-orange-600">
                                      {getText({ zh: '退货退款', en: 'Return & Refund', ko: '반품 환불', vi: 'Trả hàng hoàn tiền' })}
                                    </button>
                                  )}
                                </div>
                              );
                            })()}
                            {/* 删除订单按钮 - 仅已退款订单显示 */}
                            {order.status === 'refunded' && (
                              <div className="flex gap-2 mt-1">
                                <button 
                                  onClick={async () => {
                                    if (!confirm(getText({ zh: '确认删除此订单？', en: 'Delete this order?', ko: '이 주문을 삭제하시겠습니까?', vi: 'Xóa đơn hàng này?' }))) {
                                      return;
                                    }
                                    try {
                                      await orderApi.deleteOrder(order.id);
                                      setOrdersList(prev => prev.filter(o => o.id !== order.id));
                                      setOrdersCount(prev => prev - 1);
                                      alert(getText({ zh: '订单已删除', en: 'Order deleted', ko: '주문 삭제됨', vi: 'Đã xóa đơn hàng' }));
                                    } catch (error: any) {
                                      alert(error.message || getText({ zh: '删除失败', en: 'Delete failed', ko: '삭제 실패', vi: 'Xóa thất bại' }));
                                    }
                                  }}
                                  className="flex-1 py-1.5 bg-gray-500/80 text-white text-[10px] font-bold rounded-lg hover:bg-gray-600"
                                >
                                  {getText({ zh: '删除订单', en: 'Delete', ko: '삭제', vi: 'Xóa' })}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )})()}
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
            
            {/* 收藏列表 */}
            {showFavoritesDetails && (
              <div className="px-3 pb-3 space-y-2">
                {/* 收藏列表 */}
                {favoritesList.length > 0 && (
                  <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                    {favoritesList.map((fav: any, idx: number) => (
                      <div key={fav.id || idx} className="bg-white/10 rounded-lg overflow-hidden">
                        <button 
                          onClick={() => setExpandedFavorite(expandedFavorite === fav.id ? null : fav.id)}
                          className="w-full p-2 flex items-center gap-2 hover:bg-white/5 transition-colors"
                        >
                          <div className="w-10 h-10 flex-shrink-0 bg-white/10 rounded-lg overflow-hidden">
                            {fav.images && fav.images.length > 0 ? (
                              <img src={fav.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="w-full h-full flex items-center justify-center text-xl">{fav.icon || '📦'}</span>
                            )}
                          </div>
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
                                onClick={async () => {
                                  try {
                                    await favoriteApi.removeFavorite(fav.id);
                                    const newFavorites = favoritesList.filter((f: any) => f.id !== fav.id);
                                    setFavoritesList(newFavorites);
                                    setFavoritesCount(newFavorites.length);
                                    setExpandedFavorite(null);
                                  } catch (error: any) {
                                    console.error('取消收藏失败:', error);
                                    alert(error.message || getText({ zh: '操作失败', en: 'Failed', ko: '실패', vi: 'Thất bại' }));
                                  }
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
          
          {/* 管理后台 */}
          <div className="bg-white/10 rounded-lg border border-white/20 backdrop-blur-md overflow-hidden">
            <button 
              onClick={() => setShowStoreDetails(!showStoreDetails)}
              className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors"
            >
              <BarChart3 className="w-5 h-5 text-white" />
              <span className="font-bold text-white">{getText({ zh: '管理后台', en: 'Management', ko: '관리', vi: 'Quản lý' })}</span>
              <span className="ml-auto text-white/60">{showStoreDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</span>
            </button>
            
            {/* 管理后台功能按钮 */}
            {showStoreDetails && (
              <div className="flex flex-col gap-2 px-3 pb-3">
                <button 
                  onClick={() => navigate('/my-shops')}
                  className="flex items-center justify-center gap-3 py-3 px-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <Building2 className="w-5 h-5 text-cyan-300" />
                  <span className="text-sm text-white font-bold">{getText({ zh: '我的店铺', en: 'My Shops', ko: '내 상점', vi: 'Cửa hàng' })}</span>
                </button>
                <button 
                  onClick={() => navigate('/join-store')}
                  className="flex items-center justify-center gap-3 py-3 px-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <PlusCircle className="w-5 h-5 text-green-300" />
                  <span className="text-sm text-white font-bold">{getText({ zh: '我要入驻', en: 'Join', ko: '입점하기', vi: 'Đăng ký' })}</span>
                </button>
                <button 
                  onClick={() => navigate('/shop-orders', { state: { merchantId: 'all' } })}
                  className="flex items-center justify-center gap-3 py-3 px-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <ShoppingBag className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-white font-bold">{getText({ zh: '订单管理', en: 'Orders', ko: '주문', vi: 'Đơn' })}</span>
                </button>
                <button 
                  onClick={() => navigate('/after-sale')}
                  className="flex items-center justify-center gap-3 py-3 px-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <HeadphonesIcon className="w-5 h-5 text-orange-300" />
                  <span className="text-sm text-white font-bold">{getText({ zh: '售后管理', en: 'After Sales', ko: '애프터 서비스', vi: 'Dịch vụ' })}</span>
                </button>
                <button 
                  onClick={() => navigate('/settlement')}
                  className="flex items-center justify-center gap-3 py-3 px-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <DollarSign className="w-5 h-5 text-green-300" />
                  <span className="text-sm text-white font-bold">{getText({ zh: '结算中心', en: 'Settlement', ko: '정산', vi: 'Thanh toán' })}</span>
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center md:p-4" onClick={() => {
          // 检查是否有未保存的更改
          const hasChanges = 
            email !== originalSettings.email ||
            username !== originalSettings.username ||
            receiverName !== originalSettings.receiverName ||
            receiverPhone !== originalSettings.receiverPhone ||
            selectedProvince !== originalSettings.selectedProvince ||
            selectedCity !== originalSettings.selectedCity ||
            selectedDistrict !== originalSettings.selectedDistrict ||
            detailAddress !== originalSettings.detailAddress;

          if (hasChanges && isEditingSettings) {
            if (confirm(getText({ zh: '有未保存的更改，是否保存？', en: 'Save changes?', ko: '변경 사항을 저장하시겠습니까?', vi: 'Lưu thay đổi?' }))) {
              handleSaveSettings();
            } else {
              // 恢复原始值
              setEmail(originalSettings.email);
              setUsername(originalSettings.username);
              setWalletAddress(originalSettings.walletAddress);
              setReceiverName(originalSettings.receiverName);
              setReceiverPhone(originalSettings.receiverPhone);
              setSelectedProvince(originalSettings.selectedProvince);
              setSelectedCity(originalSettings.selectedCity);
              setSelectedDistrict(originalSettings.selectedDistrict);
              setDetailAddress(originalSettings.detailAddress);
              setIsEditingSettings(false);
              setShowSettings(false);
            }
          } else {
            setIsEditingSettings(false);
            setShowSettings(false);
          }
        }}>
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-full md:max-w-md rounded-2xl max-h-[90vh] flex flex-col relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => {
              // 检查是否有未保存的更改
              const hasChanges = 
                email !== originalSettings.email ||
                username !== originalSettings.username ||
                receiverName !== originalSettings.receiverName ||
                receiverPhone !== originalSettings.receiverPhone ||
                selectedProvince !== originalSettings.selectedProvince ||
                selectedCity !== originalSettings.selectedCity ||
                selectedDistrict !== originalSettings.selectedDistrict ||
                detailAddress !== originalSettings.detailAddress;

              if (hasChanges && isEditingSettings) {
                if (confirm(getText({ zh: '有未保存的更改，是否保存？', en: 'Save changes?', ko: '변경 사항을 저장하시겠습니까?', vi: 'Lưu thay đổi?' }))) {
                  handleSaveSettings();
                } else {
                  // 恢复原始值
                  setEmail(originalSettings.email);
                  setUsername(originalSettings.username);
                  setWalletAddress(originalSettings.walletAddress);
                  setReceiverName(originalSettings.receiverName);
                  setReceiverPhone(originalSettings.receiverPhone);
                  setSelectedProvince(originalSettings.selectedProvince);
                  setSelectedCity(originalSettings.selectedCity);
                  setSelectedDistrict(originalSettings.selectedDistrict);
                  setDetailAddress(originalSettings.detailAddress);
                  setIsEditingSettings(false);
                  setShowSettings(false);
                }
              } else {
                setIsEditingSettings(false);
                setShowSettings(false);
              }
            }} className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl leading-none">×</button>
            <div className="flex items-center justify-center py-4 border-b border-white/20">
              <h2 className="text-xl font-bold text-white">
                {getText({ zh: '设置', en: 'Settings', ko: '설정', vi: 'Cài đặt' })}
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {/* 用户名 */}
              <div className="flex items-center gap-2">
                <label className="text-white text-sm font-bold whitespace-nowrap flex items-center gap-1.5 w-20">
                  <Edit3 className="w-4 h-4" />
                  {getText({ zh: '用户名', en: 'Username', ko: '사용자 이름', vi: 'Tên người dùng' })}
                </label>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                    }}
                    placeholder={getText({ zh: '请输入用户名', en: 'Enter username', ko: '사용자 이름 입력', vi: 'Nhập tên' })}
                    className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-sm ${
                      isEditingSettings ? 'bg-white/90 text-gray-800' : 'bg-white/50 text-gray-500'
                    }`}
                    readOnly={!isEditingSettings}
                  />
                </div>
              </div>
              
              {/* 邮箱设置 */}
              <div className="flex items-center gap-2">
                <label className="text-white text-sm font-bold whitespace-nowrap flex items-center gap-1.5 w-20">
                  <Mail className="w-5 h-5" />
                  {getText({ zh: '邮箱设置', en: 'Email', ko: '이메일', vi: 'Email' })}
                </label>
                <div className="flex-1 relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder={getText({ zh: '请输入邮箱地址', en: 'Enter email', ko: '이메일 입력', vi: 'Nhập email' })}
                    className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-sm ${
                      isEditingSettings ? 'bg-white/90 text-gray-800' : 'bg-white/50 text-gray-500'
                    }`}
                    readOnly={!isEditingSettings}
                  />

                  {emailError && (
                    <div className="absolute left-0 -top-8 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                      {emailError}
                    </div>
                  )}
                </div>
              </div>

              {/* 登录密码设置 - 商家专用 */}
              <div className="flex items-center gap-2">
                <label className="text-white text-sm font-bold whitespace-nowrap flex items-center gap-1.5 w-20">
                  <Lock className="w-4 h-4" />
                  {getText({ zh: '登录密码', en: 'Password', ko: '비밀번호', vi: 'Mật khẩu' })}
                </label>
                <div className="flex-1 relative">
                  <button
                    onClick={() => {
                      if (!isEditingSettings) return;
                      if (!isMerchant) {
                        alert(getText({ zh: '此功能仅限商家使用', en: 'Merchant only', ko: '판매자 전용', vi: 'Chỉ dành cho người bán' }));
                        return;
                      }
                      setNewPassword('');
                      setShowPasswordModal(true);
                    }}
                    disabled={!isEditingSettings || !isMerchant}
                    className={`w-full px-3 py-2 rounded-lg text-sm text-left ${
                      hasPassword ? 'pr-16' : ''
                    } ${
                      isEditingSettings && isMerchant
                        ? 'bg-white/90 text-gray-800 hover:bg-white cursor-pointer' 
                        : 'bg-white/50 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {getText({ zh: '商家专用', en: 'Merchant Only', ko: '판매자 전용', vi: 'Dành cho người bán' })}
                  </button>
                  {hasPassword && (
                    <button
                      onClick={async () => {
                        if (!isEditingSettings) return;
                        const newState = !passwordEnabled;
                        try {
                          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                          const token = localStorage.getItem('authToken');
                          const res = await fetch(`${API_URL}/api/v1/auth/toggle-password`, {
                            method: 'POST',
                            headers: {
                              'Authorization': `Bearer ${token}`,
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ enabled: newState }),
                          });
                          if (res.ok) {
                            setPasswordEnabled(newState);
                            showToast(
                              'success',
                              getText({
                                zh: newState ? '密码已启用' : '密码已禁用',
                                en: newState ? 'Password Enabled' : 'Password Disabled',
                                ko: newState ? '비밀번호 활성화' : '비밀번호 비활성화',
                                vi: newState ? 'Đã bật mật khẩu' : 'Đã tắt mật khẩu'
                              }),
                              getText({
                                zh: newState ? '现在可以使用密码登录桌面端管理后台' : '桌面端无法使用密码登录，需要时请在手机端启用',
                                en: newState ? 'You can now login on desktop' : 'Desktop login disabled',
                                ko: newState ? '데스크톱에서 로그인 가능' : '데스크톱 로그인 비활성화',
                                vi: newState ? 'Có thể đăng nhập trên máy tính' : 'Đăng nhập máy tính bị tắt'
                              })
                            );
                          }
                        } catch (error) {
                          console.error('切换密码状态失败:', error);
                        }
                      }}
                      disabled={!isEditingSettings}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded text-xs font-bold transition-colors ${
                        passwordEnabled 
                          ? 'bg-green-500 text-white' 
                          : 'bg-red-500 text-white'
                      } ${!isEditingSettings && 'opacity-50'}`}
                    >
                      {passwordEnabled ? '✓ 已启用' : '✕ 已禁用'}
                    </button>
                  )}
                </div>
              </div>
              
              {/* 收件人信息 */}
              <div className="flex items-center gap-2">
                <label className="text-white text-sm font-bold whitespace-nowrap flex items-center gap-1.5 w-20">
                  <User className="w-4 h-4" />
                  {getText({ zh: '收件人', en: 'Receiver', ko: '수령인', vi: 'Người nhận' })}
                </label>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={receiverName}
                    onChange={(e) => handleReceiverNameChange(e.target.value)}
                    placeholder={getText({ zh: '请输入收件人姓名', en: 'Enter receiver name', ko: '수령인 이름을 입력하세요', vi: 'Nhập tên người nhận' })}
                    className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-sm ${
                      isEditingSettings ? 'bg-white/90 text-gray-800' : 'bg-white/50 text-gray-500'
                    }`}
                    readOnly={!isEditingSettings}
                  />

                  {receiverNameError && (
                    <div className="absolute left-0 -top-8 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                      {receiverNameError}
                    </div>
                  )}
                </div>
              </div>
              
              {/* 联系电话 */}
              <div className="flex items-center gap-2">
                <label className="text-white text-sm font-bold whitespace-nowrap flex items-center gap-1.5 w-20">
                  <Phone className="w-4 h-4" />
                  {getText({ zh: '联系电话', en: 'Phone Number', ko: '전화번호', vi: 'Số điện thoại' })}
                </label>
                <div className="flex-1 relative">
                  <input
                    type="tel"
                    value={receiverPhone}
                    onChange={(e) => handleReceiverPhoneChange(e.target.value)}
                    placeholder={getText({ zh: '请输入联系电话', en: 'Enter phone number', ko: '전화번호를 입력하세요', vi: 'Nhập số điện thoại' })}
                    className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-sm ${
                      isEditingSettings ? 'bg-white/90 text-gray-800' : 'bg-white/50 text-gray-500'
                    }`}
                    readOnly={!isEditingSettings}
                  />

                  {receiverPhoneError && (
                    <div className="absolute left-0 -top-8 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                      {receiverPhoneError}
                    </div>
                  )}
                </div>
              </div>
              
              {/* 收货地址 - 点击打开地址选择弹窗 */}
              <div className="flex items-center gap-2">
                <label className="text-white text-sm font-bold whitespace-nowrap flex items-center gap-1.5 w-20">
                  <MapPin className="w-4 h-4" />
                  {getText({ zh: '收货地址', en: 'Shipping Address', ko: '배송 주소', vi: 'Địa chỉ giao hàng' })}
                </label>
                <button
                  onClick={() => {
                    if (isEditingSettings) {
                      setShowAddressModal(true);
                      setAddressStep('province');
                    }
                  }}
                  disabled={!isEditingSettings}
                  className={`flex-1 px-3 py-2 rounded-lg text-left text-sm ${
                    isEditingSettings 
                      ? 'bg-white/90 text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer' 
                      : 'bg-white/50 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {selectedProvince && selectedCity ? 
                    `${selectedProvince} ${selectedCity} ${selectedDistrict || ''}`.trim() : 
                    getText({ zh: '请选择地址', en: 'Select address', ko: '주소 선택', vi: 'Chọn địa chỉ' })
                  }
                </button>
              </div>
              
              {/* 详细地址输入 */}
              {selectedCity && (
                <div className="flex items-center gap-2">
                  <label className="text-white text-sm font-bold whitespace-nowrap opacity-0 flex items-center gap-1.5 w-20">
                    <MapPin className="w-5 h-5" />
                    {getText({ zh: '收货地址', en: 'Shipping Address', ko: '배송 주소', vi: 'Địa chỉ giao hàng' })}
                  </label>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={detailAddress}
                      onChange={(e) => handleDetailAddressChange(e.target.value)}
                      placeholder={getText({ zh: '请输入详细地址（街道、门牌号等）', en: 'Enter detailed address', ko: '상세 주소를 입력하세요', vi: 'Nhập địa chỉ chi tiết' })}
                      className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-sm ${
                        isEditingSettings ? 'bg-white/90 text-gray-800' : 'bg-white/50 text-gray-500'
                      }`}
                      readOnly={!isEditingSettings}
                    />
                    {detailAddressError && (
                      <div className="absolute left-0 -top-8 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                        {detailAddressError}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* 钱包地址 */}
              <div className="relative">
                <label className="flex items-center gap-1.5 text-white text-sm font-bold mb-2">
                  <WalletIcon className="w-4 h-4" />
                  {getText({ zh: '钱包地址', en: 'Wallet Address', ko: '지갑 주소', vi: 'Địa chỉ ví' })}
                </label>
                {isWalletBound ? (
                  // 已绑定钱包地址，显示为只读，带悬浮提示
                  <div 
                    className="w-full px-2 py-1.5 bg-white/50 text-yellow-600 rounded-lg text-sm font-mono cursor-not-allowed relative group"
                    title={getText({ zh: '已自动绑定付款钱包地址，非特殊情况不支持变更', en: 'Auto-bound to payment wallet, changes not supported except in special cases', ko: '결제 지갑에 자동 연결됨, 특별한 경우를 제외하고 변경 불가', vi: 'Tự động liên kết ví thanh toán, không hỗ trợ thay đổi trừ trường hợp đặc biệt' })}
                  >
                    {formatWalletAddressLarge(walletAddress)}
                    {/* 悬浮提示 */}
                    <div className="absolute left-0 -top-16 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {getText({ zh: '已自动绑定付款钱包地址，非特殊情况不支持变更', en: 'Auto-bound to payment wallet, changes not supported', ko: '결제 지갑에 자동 연결됨, 변경 불가', vi: 'Tự động liên kết ví thanh toán, không hỗ trợ thay đổi' })}
                      <div className="absolute left-4 -bottom-1 w-2 h-2 bg-gray-800 transform rotate-45"></div>
                    </div>
                  </div>
                ) : (
                  // 未绑定，显示只读提示
                  <div className="w-full px-3 py-2 bg-white/50 text-gray-500 rounded-lg text-sm text-center">
                    {getText({ zh: '充值任意金额，系统自动绑定钱包地址', en: 'Deposit any amount to auto-bind wallet', ko: '임의 금액 충전 시 지갑 자동 연결', vi: 'Nạp bất kỳ số tiền nào để tự động liên kết ví' })}
                  </div>
                )}
                {!isWalletBound && walletAddress && walletAddress.length < 56 && (
                  <p className="text-white/70 text-xs mt-1">
                    {getText({ zh: `已输入 ${walletAddress.length}/56 位`, en: `Entered ${walletAddress.length}/56 chars`, ko: `${walletAddress.length}/56자 입력됨`, vi: `Đã nhập ${walletAddress.length}/56 ký tự` })}
                  </p>
                )}
                {walletError && (
                  <div className="absolute left-0 -top-8 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                    {walletError}
                  </div>
                )}
              </div>
              
            </div>
            
            {/* 按钮 - 固定在底部 */}
            <div className="flex justify-center gap-3 px-4 py-3 border-t border-white/20 bg-gradient-to-br from-purple-500 to-pink-500">
              {!isEditingSettings ? (
                <button
                  onClick={() => setIsEditingSettings(true)}
                  className="w-24 py-2.5 bg-white text-purple-600 rounded-lg font-bold hover:bg-gray-100 transition-all active:scale-95"
                >
                  {getText({ zh: '修改', en: 'Edit', ko: '수정', vi: 'Sửa' })}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      // 恢复原始值
                      setEmail(originalSettings.email);
                      setUsername(originalSettings.username);
                      setWalletAddress(originalSettings.walletAddress);
                      setReceiverName(originalSettings.receiverName);
                      setReceiverPhone(originalSettings.receiverPhone);
                      setSelectedProvince(originalSettings.selectedProvince);
                      setSelectedCity(originalSettings.selectedCity);
                      setSelectedDistrict(originalSettings.selectedDistrict);
                      setDetailAddress(originalSettings.detailAddress);
                      setIsEditingSettings(false);
                    }}
                    className="w-28 py-2.5 bg-white/30 text-white rounded-lg font-bold hover:bg-white/40 transition-all active:scale-95"
                  >
                    {getText({ zh: '取消', en: 'Cancel', ko: '취소', vi: 'Hủy' })}
                  </button>
                  <button
                    onClick={() => {
                      handleSaveSettings();
                      setIsEditingSettings(false);
                    }}
                    className="w-28 py-2.5 bg-white text-purple-600 rounded-lg font-bold hover:bg-gray-100 transition-all active:scale-95"
                  >
                    {getText({ zh: '保存', en: 'Save', ko: '저장', vi: 'Lưu' })}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* 地址选择弹窗 */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setShowAddressModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* 标题栏 */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold text-gray-800">{getText({ zh: '所在地区', en: 'Location', ko: '위치', vi: 'Vị trí' })}</h3>
              <button onClick={() => setShowAddressModal(false)} className="text-gray-500 hover:text-gray-800 text-2xl">×</button>
            </div>
            
            {/* 选择层级标签 */}
            <div className="flex border-b">
              <button
                onClick={() => setAddressStep('province')}
                className={`flex-1 py-3 text-center ${addressStep === 'province' ? 'text-purple-600 border-b-2 border-purple-600 font-bold' : 'text-gray-500'}`}
              >
                {selectedProvince || getText({ zh: '请选择', en: 'Select', ko: '선택', vi: 'Chọn' })}
              </button>
              {selectedProvince && (
                <button
                  onClick={() => setAddressStep('city')}
                  className={`flex-1 py-3 text-center ${addressStep === 'city' ? 'text-purple-600 border-b-2 border-purple-600 font-bold' : 'text-gray-500'}`}
                >
                  {selectedCity || getText({ zh: '请选择', en: 'Select', ko: '선택', vi: 'Chọn' })}
                </button>
              )}
              {selectedCity && districts.length > 0 && (
                <button
                  onClick={() => setAddressStep('district')}
                  className={`flex-1 py-3 text-center ${addressStep === 'district' ? 'text-purple-600 border-b-2 border-purple-600 font-bold' : 'text-gray-500'}`}
                >
                  {selectedDistrict || getText({ zh: '请选择', en: 'Select', ko: '선택', vi: 'Chọn' })}
                </button>
              )}
            </div>
            
            {/* 选项列表 */}
            <div className="flex-1 overflow-y-auto">
              {addressStep === 'province' && (
                <div>
                  {provinces.map(province => (
                    <button
                      key={province}
                      onClick={() => {
                        setSelectedProvince(province);
                        setSelectedCity('');
                        setSelectedDistrict('');
                        setAddressStep('city');
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 ${selectedProvince === province ? 'text-purple-600 font-bold' : 'text-gray-800'}`}
                    >
                      {province}
                    </button>
                  ))}
                </div>
              )}
              
              {addressStep === 'city' && (
                <div>
                  {cities.map(city => (
                    <button
                      key={city}
                      onClick={() => {
                        setSelectedCity(city);
                        setSelectedDistrict('');
                        // 检查这个城市是否有区数据
                        const cityDistricts: Record<string, string[]> = {
                          '广州': ['天河区', '越秀区', '海珠区', '荔湾区', '白云区', '黄埔区', '番禺区', '花都区', '南沙区', '增城区', '从化区'],
                          '深圳': ['福田区', '罗湖区', '南山区', '宝安区', '龙岗区', '盐田区', '龙华区', '坪山区', '光明区', '大鹏新区'],
                          '北京市': ['东城区', '西城区', '朝阳区', '丰台区', '石景山区', '海淀区', '门头沟区', '房山区', '通州区', '顺义区', '昌平区', '大兴区', '怀柔区', '平谷区', '密云区', '延庆区'],
                          '上海市': ['黄浦区', '徐汇区', '长宁区', '静安区', '普陀区', '虹口区', '杨浦区', '闵行区', '宝山区', '嘉定区', '浦东新区', '金山区', '松江区', '青浦区', '奉贤区', '崇明区'],
                          '天津市': ['和平区', '河东区', '河西区', '南开区', '河北区', '红桥区', '东丽区', '西青区', '津南区', '北辰区', '武清区', '宝坻区', '滨海新区', '宁河区', '静海区', '蓟州区'],
                          '重庆市': ['渝中区', '大渡口区', '江北区', '沙坪坝区', '九龙坡区', '南岸区', '北碚区', '渝北区', '巴南区', '涪陵区', '綦江区', '大足区', '长寿区', '江津区', '合川区', '永川区', '南川区', '璧山区', '铜梁区', '潼南区', '荣昌区', '开州区', '梁平区', '武隆区'],
                        };
                        const hasDistricts = cityDistricts[city] && cityDistricts[city].length > 0;
                        if (hasDistricts) {
                          setAddressStep('district');
                        } else {
                          setShowAddressModal(false);
                        }
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 ${selectedCity === city ? 'text-purple-600 font-bold' : 'text-gray-800'}`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
              
              {addressStep === 'district' && districts.length > 0 && (
                <div>
                  {districts.map(district => (
                    <button
                      key={district}
                      onClick={() => {
                        setSelectedDistrict(district);
                        setShowAddressModal(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 ${selectedDistrict === district ? 'text-purple-600 font-bold' : 'text-gray-800'}`}
                    >
                      {district}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* 提现弹窗 */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowWithdrawModal(false)}>
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 max-w-md w-full shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowWithdrawModal(false)} className="absolute top-6 right-6 text-white/80 hover:text-white text-3xl leading-none">×</button>
            <div className="flex items-center justify-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {getText({ zh: '提现', en: 'Withdraw', ko: '출금', vi: 'Rút tiền' })}
              </h2>
            </div>
            
            <div className="space-y-4">
              {/* 当前余额 */}
              <div className="flex items-center gap-2">
                <span className="text-white/80 text-sm">{getText({ zh: '当前余额', en: 'Current Balance', ko: '현재 잔액', vi: 'Số dư hiện tại' })}</span>
                <span className="text-2xl font-bold text-yellow-400">{userInfo?.balance || '0.00'} π</span>
              </div>
              
              {/* 提现金额 */}
              <div className="relative">
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder={getText({ zh: '请在此输入提现金额', en: 'Enter withdrawal amount', ko: '출금 금액을 입력하세요', vi: 'Nhập số tiền rút' })}
                  className="w-full px-4 py-2 bg-white/90 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-lg placeholder:font-normal"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">π</span>
              </div>
              
              {/* 钱包地址显示 */}
              <div>
                <p className="text-white/80 text-xs mb-1">{getText({ zh: '钱包地址', en: 'Wallet Address', ko: '지갑 주소', vi: 'Địa chỉ ví' })}</p>
                <p className="text-white font-mono text-sm break-all w-full" title={walletAddress}>
                  {formatWalletAddressShort(walletAddress)}
                </p>
              </div>
              
              {/* 提示信息 */}
              <div className="flex items-start gap-2">
                <span className="text-yellow-300 text-base flex-shrink-0">⚠️</span>
                <div className="text-white/80 text-xs leading-relaxed flex-1 space-y-1">
                  <div className="flex items-center gap-1">
                    <span className="text-white/60">·</span>
                    <span>{getText({ zh: 'pi钱包没有自动批量结算功能', en: 'Pi wallet has no automatic batch settlement', ko: 'Pi 지갑에 자동 일괄 결제 기능 없음', vi: 'Ví Pi không có chức năng thanh toán hàng loạt tự động' })}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-white/60">·</span>
                    <span>{getText({ zh: '提现将由人工处理', en: 'Withdrawals processed manually', ko: '출금은 수동으로 처리됨', vi: 'Rút tiền được xử lý thủ công' })}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-white/60">·</span>
                    <span>{getText({ zh: '到账时间：12小时之内', en: 'Arrival time: within 12 hours', ko: '도착 시간: 12시간 이내', vi: 'Thời gian đến: trong vòng 12 giờ' })}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-white/60">·</span>
                    <span>{getText({ zh: '提现手续费：3%', en: 'Withdrawal fee: 3%', ko: '출금 수수료: 3%', vi: 'Phí rút tiền: 3%' })}</span>
                  </div>
                </div>
              </div>
              
              {/* 按钮 */}
              <div className="flex justify-center pt-2">
                <button
                  onClick={handleConfirmWithdraw}
                  className="py-3 px-6 bg-white text-purple-600 rounded-lg font-bold hover:bg-gray-100 transition-all active:scale-95"
                >
                  {getText({ zh: '确认提现', en: 'Confirm', ko: '确认', vi: 'Xác nhận' })}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 充值弹窗 */}
      {showRechargeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowRechargeModal(false)}>
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 max-w-md w-full shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowRechargeModal(false)} className="absolute top-6 right-6 text-white/80 hover:text-white text-3xl leading-none">×</button>
            <div className="flex items-center justify-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {getText({ zh: '充值', en: 'Deposit', ko: '충전', vi: 'Nạp tiền' })}
              </h2>
            </div>
            
            <div className="space-y-4">
              {/* 充值金额 */}
              <div className="relative">
                <input
                  type="number"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                  placeholder={getText({ zh: '请在此处输入需要充值的金额', en: 'Enter amount to deposit', ko: '충전할 금액을 입력하세요', vi: 'Nhập số tiền cần nạp' })}
                  min="0.01"
                  step="0.01"
                  className="w-full px-4 py-2 bg-white/90 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-lg placeholder:font-normal"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">π</span>
              </div>
              
              {/* 提示信息 */}
              <div className="flex items-start gap-2">
                <span className="text-yellow-300 text-base flex-shrink-0">⚠️</span>
                <div className="text-white/80 text-xs leading-relaxed flex-1 space-y-1">
                  <div className="flex items-center gap-1">
                    <span className="text-white/60">·</span>
                    <span>{getText({ zh: '点击确认后将调用官方API接口唤醒pi钱包', en: 'After confirmation, the official API will wake up Pi wallet', ko: '확인 후 공식 API가 Pi 지갑을 깨웁니다', vi: 'Sau khi xác nhận, API chính thức sẽ đánh thức ví Pi' })}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-white/60">·</span>
                    <span>{getText({ zh: '输入助记词或识别指纹完成支付', en: 'Enter mnemonic or fingerprint to complete payment', ko: '니모닉 또는 지문을 입력하여 결제 완료', vi: 'Nhập cụm từ ghi nhớ hoặc vân tay để thanh toán' })}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-white/60">·</span>
                    <span>{getText({ zh: '输入助记词或者识别指纹后请勿退出或刷新界面', en: 'Do not exit or refresh after entering mnemonic or fingerprint', ko: '니모닉 또는 지문 입력 후 종료하거나 새로고침하지 마세요', vi: 'Không thoát hoặc làm mới sau khi nhập' })}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-white/60">·</span>
                    <span>{getText({ zh: '如果误点击了刷新钱包余额已转出', en: 'If accidentally refreshed, wallet balance transferred', ko: '실수로 새로고침하여 지갑 잔액이 이체됨', vi: 'Nếu vô tình làm mới, số dư ví đã chuyển' })}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-white/60">·</span>
                    <span>{getText({ zh: '充值金额未到账请联系客服处理', en: 'Recharge not received, please contact customer service', ko: '충전이 도착하지 않은 경우 고객 서비스에 문의하세요', vi: 'Chưa nhận được nạp tiền, vui lòng liên hệ dịch vụ khách hàng' })}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-white/60">·</span>
                    <span>{getText({ zh: '充值比例1:1，即时到账', en: 'Recharge ratio 1:1, instant arrival', ko: '충전 비율 1:1, 즉시 도착', vi: 'Tỷ lệ nạp 1:1, đến ngay' })}</span>
                  </div>
                </div>
              </div>
              

              
              {/* 错误提示 */}
              {paymentError && (
                <div className="bg-red-500/20 rounded-lg p-3 border border-red-400/30">
                  <p className="text-red-200 text-xs">{paymentError}</p>
                </div>
              )}
              
              {/* 按钮 */}
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => {
                    const amount = parseFloat(rechargeAmount);
                    if (!amount || amount <= 0) {
                      alert(getText({ zh: '请输入有效的充值金额', en: 'Please enter a valid amount', ko: '유효한 금액을 입력하세요', vi: 'Vui lòng nhập số tiền hợp lệ' }));
                      return;
                    }
                    
                    // 开发模式：模拟充值成功
                    if (import.meta.env.VITE_DEV_MODE === 'true') {
                      const newBalance = (parseFloat(userInfo?.balance || '0') + amount).toFixed(2);
                      const updatedUser = { ...userInfo, balance: newBalance };
                      setUserInfo(updatedUser);
                      
                      // 更新 localStorage
                      if (localStorage.getItem('piUserInfo')) {
                        localStorage.setItem('piUserInfo', JSON.stringify(updatedUser));
                      } else {
                        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
                      }
                      
                      // 记录余额变动历史
                      const history = JSON.parse(localStorage.getItem('balanceHistory') || '[]');
                      history.unshift({
                        type: 'add',
                        amount: rechargeAmount,
                        reason: getText({ zh: '开发模式充值', en: 'Dev Mode Deposit', ko: '개발 모드 충전', vi: 'Nạp tiền chế độ dev' }),
                        time: new Date().toISOString(),
                      });
                      localStorage.setItem('balanceHistory', JSON.stringify(history.slice(0, 100)));
                      
                      setShowRechargeModal(false);
                      setRechargeAmount('');
                      showToast(
                        'success',
                        getText({ zh: '充值成功', en: 'Recharge Successful', ko: '충전 성공', vi: 'Nạp tiền thành công' }),
                        getText({ zh: '已到账（开发模式）', en: 'Added to balance (Dev Mode)', ko: '잔액에 추가됨 (개발 모드)', vi: 'Đã thêm vào số dư (Dev Mode)' }),
                        `${amount}π`
                      );
                      return;
                    }
                    
                    recharge(amount);
                  }}
                  disabled={isPaymentLoading || !rechargeAmount}
                  className="py-3 px-6 bg-white text-purple-600 rounded-lg font-bold hover:bg-gray-100 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isPaymentLoading && paymentStage === 'authenticating' && (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-600 border-t-transparent"></div>
                  )}
                  {isPaymentLoading && paymentStage === 'authenticating'
                    ? getText({ zh: '正在验证身份...', en: 'Authenticating...', ko: '인증 중...', vi: 'Đang xác thực...' })
                    : getText({ zh: '确认充值', en: 'Confirm', ko: '确认', vi: 'Xác nhận' })
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 余额明细弹窗 */}
      {showBalanceHistory && (() => {
        const pageSize = 20;
        const totalPages = Math.ceil(balanceHistory.length / pageSize);
        const startIndex = (balanceHistoryPage - 1) * pageSize;
        const currentItems = balanceHistory.slice(startIndex, startIndex + pageSize);
        
        return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center" onClick={() => { setShowBalanceHistory(false); setBalanceHistoryPage(1); }}>
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-full h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 pb-3">
                <div className="flex-1"></div>
                <h2 className="text-xl font-bold text-white">
                  {getText({ zh: '余额明细', en: 'Balance History', ko: '잔액 내역', vi: 'Lịch sử số dư' })}
                </h2>
                <div className="flex-1 flex justify-end">
                  <button onClick={() => { setShowBalanceHistory(false); setBalanceHistoryPage(1); }} className="text-white/80 hover:text-white text-2xl">×</button>
                </div>
              </div>
              
              {/* 当前余额 */}
              <div className="bg-white/10 mx-4 rounded-lg p-3 mb-3 flex items-center justify-center gap-1">
                <p className="text-white/80 text-sm">{getText({ zh: '当前余额', en: 'Current Balance', ko: '현재 잔액', vi: 'Số dư hiện tại' })}</p>
                <p className="text-3xl font-bold text-yellow-400">{userInfo?.balance || '0.00'} π</p>
              </div>
              
              {/* 明细列表 */}
              <div className="flex-1 overflow-y-auto px-4 space-y-2 mb-3">
                {balanceHistory.length > 0 ? (
                  currentItems.map((item: any, index: number) => {
                    const getStatusText = (status: string) => {
                      const statusMap: any = {
                        'PENDING': { zh: '处理中', en: 'Processing', ko: '처리 중', vi: 'Đang xử lý', color: 'text-yellow-300' },
                        'COMPLETED': { zh: '已完成', en: 'Completed', ko: '완료됨', vi: 'Đã hoàn thành', color: 'text-yellow-300' },
                        'FAILED': { zh: '已拒绝', en: 'Rejected', ko: '거부됨', vi: 'Đã từ chối', color: 'text-yellow-300' },
                      };
                      return statusMap[status] || { zh: status, en: status, ko: status, vi: status, color: 'text-white/60' };
                    };
                    
                    return (
                      <div key={startIndex + index} className="bg-white/10 rounded-lg p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <p className="text-sm font-medium text-white break-words">
                                {(() => {
                                  const reason = item.reason || getText({ zh: '余额变动', en: 'Balance Change', ko: '잔액 변동', vi: 'Thay đổi số dư' });
                                  // 如果是被拒绝的提现申请，分割原因文本（支持中英文冒号）
                                  if (item.withdrawalStatus === 'FAILED' && (reason.includes('：') || reason.includes(':'))) {
                                    const separator = reason.includes('：') ? '：' : ':';
                                    const parts = reason.split(separator);
                                    return (
                                      <>
                                        {parts[0]}{separator}<span className="text-yellow-400 font-bold">{parts.slice(1).join(separator)}</span>
                                      </>
                                    );
                                  }
                                  return reason;
                                })()}
                              </p>
                              {item.withdrawalStatus && (
                                <span className={`text-xs ${getStatusText(item.withdrawalStatus).color}`}>
                                  {getText(getStatusText(item.withdrawalStatus))}
                                </span>
                              )}
                            </div>
                            <p className="text-white/60 text-xs">{item.time ? new Date(item.time).toLocaleString() : '-'}</p>
                          </div>
                          <div className={`text-sm font-bold ${item.type === 'add' ? 'text-green-400' : 'text-yellow-400'}`}>
                            {item.type === 'add' ? '+' : '-'}{item.amount}π
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <p className="text-white/60 text-sm">{getText({ zh: '暂无余额变动记录', en: 'No balance history', ko: '잔액 내역 없음', vi: 'Không có lịch sử số dư' })}</p>
                  </div>
                )}
              </div>
              
              {/* 分页控制和总记录数 - 固定在底部 */}
              {balanceHistory.length > 0 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-white/20 flex-shrink-0">
                  <p className="text-white/50 text-xs">
                    {getText({ zh: `共 ${balanceHistory.length} 条记录`, en: `Total ${balanceHistory.length} records`, ko: `총 ${balanceHistory.length}개 기록`, vi: `Tổng ${balanceHistory.length} bản ghi` })}
                  </p>
                  
                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setBalanceHistoryPage(p => Math.max(1, p - 1))}
                        disabled={balanceHistoryPage === 1}
                        className="px-3 py-1.5 bg-white/20 text-white text-sm rounded-lg disabled:opacity-40 hover:bg-white/30 transition-colors"
                      >
                        {getText({ zh: '上一页', en: 'Prev', ko: '이전', vi: 'Trước' })}
                      </button>
                      <span className="text-white text-sm px-2">
                        {balanceHistoryPage} / {totalPages}
                      </span>
                      <button
                        onClick={() => setBalanceHistoryPage(p => Math.min(totalPages, p + 1))}
                        disabled={balanceHistoryPage === totalPages}
                        className="px-3 py-1.5 bg-white/20 text-white text-sm rounded-lg disabled:opacity-40 hover:bg-white/30 transition-colors"
                      >
                        {getText({ zh: '下一页', en: 'Next', ko: '다음', vi: 'Sau' })}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })()}
      
      {/* 自定义成功/错误弹窗 */}
      {toast.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={closeToast}>
          <div 
            className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 max-w-sm w-full shadow-2xl transform transition-all duration-300 scale-100 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={closeToast} className="absolute top-6 right-6 text-white/80 hover:text-white text-3xl leading-none">×</button>
            
            {/* 图标 */}
            <div className="flex justify-center mb-4">
              {toast.type === 'success' ? (
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : toast.type === 'error' ? (
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              ) : (
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* 标题 */}
            <h3 className="text-2xl font-bold text-white text-center mb-2">
              {toast.title}
            </h3>
            
            {/* 金额（如果有） */}
            {toast.amount && (
              <div className="text-center mb-3">
                <span className="text-4xl font-bold text-yellow-300">{toast.amount}</span>
              </div>
            )}
            
            {/* 消息 */}
            <p className="text-white/90 text-center mb-6">
              {toast.message}
            </p>
          </div>
        </div>
      )}

      {/* 密码修改弹窗 */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowPasswordModal(false)}>
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-4 text-center">
              {getText({ zh: '设置登录密码', en: 'Set Password', ko: '비밀번호 설정', vi: 'Đặt mật khẩu' })}
            </h3>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={getText({ zh: '请输入新密码（至少6位）', en: 'Enter password (min 6 chars)', ko: '비밀번호 입력 (최소 6자)', vi: 'Nhập mật khẩu (tối thiểu 6 ký tự)' })}
              className="w-full px-4 py-3 bg-white/90 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 py-2.5 bg-white/30 text-white rounded-lg font-bold hover:bg-white/40 transition-all"
              >
                {getText({ zh: '取消', en: 'Cancel', ko: '취소', vi: 'Hủy' })}
              </button>
              <button
                onClick={async () => {
                  if (!newPassword) return;
                  
                  if (newPassword.length < 6) {
                    alert(getText({ zh: '密码长度至少6位', en: 'Min 6 characters', ko: '최소 6자', vi: 'Tối thiểu 6 ký tự' }));
                    return;
                  }
                  
                  try {
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                    const token = localStorage.getItem('authToken');
                    
                    const response = await fetch(`${API_URL}/api/v1/auth/set-password`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                      },
                      body: JSON.stringify({ password: newPassword }),
                    });
                    
                    if (response.ok) {
                      setShowPasswordModal(false);
                      setNewPassword('');
                      setHasPassword(true);
                      setPasswordEnabled(true); // 设置密码后自动启用
                      alert(getText({ zh: '密码设置成功！密码已自动启用，可用于桌面端登录', en: 'Password set and enabled!', ko: '비밀번호 설정 및 활성화 완료!', vi: 'Đặt và bật mật khẩu thành công!' }));
                    } else {
                      const error = await response.json();
                      alert(error.message || getText({ zh: '设置失败', en: 'Failed', ko: '실패', vi: 'Thất bại' }));
                    }
                  } catch (error: any) {
                    alert(error.message || getText({ zh: '设置失败', en: 'Failed', ko: '실패', vi: 'Thất bại' }));
                  }
                }}
                className="flex-1 py-2.5 bg-white text-purple-600 rounded-lg font-bold hover:bg-gray-100 transition-all"
              >
                {getText({ zh: '确定', en: 'Confirm', ko: '확인', vi: 'Xác nhận' })}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
