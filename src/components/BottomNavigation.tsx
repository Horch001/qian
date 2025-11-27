import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, LogOut, User, LogIn, Mail, ShoppingCart } from 'lucide-react';
import { Language, Translations } from '../types';
import { authApi } from '../services/api';

interface BottomNavigationProps {
  language: Language;
  translations: Translations;
  isLoggedIn: boolean;
  onLogout: () => void;
  onLoginSuccess?: (userInfo: any) => void;
}

declare global {
  interface Window {
    Pi?: any;
  }
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ language, translations, isLoggedIn, onLogout, onLoginSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isTestAccount, setIsTestAccount] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  // 监听消息和购物车数量变化
  useEffect(() => {
    const updateCounts = () => {
      const unread = parseInt(localStorage.getItem('unreadMessageCount') || '0');
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setUnreadMessageCount(unread || 3); // 默认显示3条未读
      setCartCount(cart.length);
    };
    
    updateCounts();
    window.addEventListener('storage', updateCounts);
    window.addEventListener('focus', updateCounts);
    
    return () => {
      window.removeEventListener('storage', updateCounts);
      window.removeEventListener('focus', updateCounts);
    };
  }, []);

  // 检测是否在Pi浏览器环境
  const isPiBrowser = () => {
    // 方法1: 检查 Pi SDK 是否存在且可用
    if (window.Pi && typeof window.Pi.authenticate === 'function') {
      return true;
    }
    // 方法2: 检查 userAgent（Pi Browser 的 userAgent 包含 "PiBrowser"）
    const userAgent = navigator.userAgent;
    if (userAgent.includes('PiBrowser') || userAgent.toLowerCase().includes('pibrowser')) {
      return true;
    }
    // 方法3: 检查是否在 Pi 域名下运行（app-cdn.minepi.com 或 sandbox.minepi.com）
    const hostname = window.location.hostname;
    if (hostname.includes('minepi.com')) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    // 加载 Pi Network SDK
    if (!window.Pi && !isLoggedIn) {
      const script = document.createElement('script');
      script.src = 'https://sdk.minepi.com/pi-sdk.js';
      script.async = true;
      script.onload = () => {
        if (window.Pi) {
          window.Pi.init({ version: '2.0', appId: 'sichouzhilu' });
        }
      };
      document.body.appendChild(script);
    }
  }, [isLoggedIn]);

  // 检查是否已有登录信息
  useEffect(() => {
    if (!isLoggedIn) {
      const existingUser = localStorage.getItem('userInfo');
      if (existingUser) {
        try {
          const user = JSON.parse(existingUser);
          onLoginSuccess?.(user);
          if (user.isTestAccount) {
            setIsTestAccount(true);
          }
        } catch (e) {
          console.error('解析用户信息失败:', e);
        }
      }
    }
  }, [isLoggedIn, onLoginSuccess]);

  const handlePiLogin = async () => {
    setIsLoggingIn(true);
    setLoginError(null);

    // 优先尝试使用 Pi SDK 登录
    if (window.Pi && typeof window.Pi.authenticate === 'function') {
      console.log('检测到 Pi SDK，使用真实登录');
      try {
        const scopes = ['username', 'payments'];
        const authResult = await window.Pi.authenticate(scopes, (payment: any) => {
          return payment.identifier;
        });

        if (authResult && authResult.user) {
          // 调用后端 API 完成登录
          try {
            const data = await authApi.piLogin({
              piUid: authResult.user.uid,
              accessToken: authResult.accessToken,
              username: authResult.user.username,
            });
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            const userInfo = { ...data.user, isPiUser: true, balance: data.user.balance || '0.00' };
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
            onLoginSuccess?.(userInfo);
          } catch (apiError) {
            console.error('后端API调用失败，使用本地存储:', apiError);
            // 后端不可用时，仍然保存用户信息
            const userInfo = {
              username: authResult.user.username,
              uid: authResult.user.uid,
              accessToken: authResult.accessToken,
              isPiUser: true,
              balance: '0.00',
            };
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
            onLoginSuccess?.(userInfo);
          }
        } else {
          throw new Error('认证失败：未获取到用户信息');
        }
        setIsLoggingIn(false);
        return;
      } catch (err: any) {
        console.error('Pi SDK 登录错误:', err);
        setLoginError(err.message || 'Pi 登录失败');
        setIsLoggingIn(false);
        return;
      }
    }

    // Pi SDK 不可用，检查是否在 Pi 浏览器环境
    const inPiBrowser = isPiBrowser();
    console.log('Pi SDK 不可用，isPiBrowser:', inPiBrowser, 'userAgent:', navigator.userAgent);

    if (inPiBrowser) {
      // 在 Pi 浏览器但 SDK 未加载，等待加载
      setLoginError('Pi SDK 正在加载，请稍后重试');
      setIsLoggingIn(false);
      return;
    }

    // 非 Pi 浏览器环境，使用测试账号
    console.log('非 Pi 浏览器环境，使用测试账号');
    try {
      const testPiUid = 'test_user_' + Math.random().toString(36).substring(7);
      const data = await authApi.piLogin({
        piUid: testPiUid,
        accessToken: 'test_token',
        username: 'TestUser',
      });
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      const testUserInfo = { ...data.user, isTestAccount: true, balance: '0.00' };
      localStorage.setItem('userInfo', JSON.stringify(testUserInfo));
      onLoginSuccess?.(testUserInfo);
      setIsTestAccount(true);
    } catch (error) {
      console.error('后端API调用失败，使用本地模拟:', error);
      const testUserInfo = {
        id: 'local_test_' + Date.now(),
        username: 'TestUser',
        uid: 'test_' + Date.now(),
        email: 'test@example.com',
        balance: '0.00',
        isTestAccount: true,
      };
      localStorage.setItem('userInfo', JSON.stringify(testUserInfo));
      localStorage.setItem('user', JSON.stringify(testUserInfo));
      onLoginSuccess?.(testUserInfo);
      setIsTestAccount(true);
    }
    setIsLoggingIn(false);
  };

  // 未登录且在首页 - 仅显示登录按钮
  if (!isLoggedIn && isHomePage) {
    return (
      <div className="w-full bg-transparent py-2 px-4">
        <div className="flex flex-col items-center justify-center max-w-md mx-auto gap-2">
          {/* 错误提示 */}
          {loginError && (
            <div className="w-full px-3 py-2 bg-red-500/30 border border-red-400/50 rounded-lg text-center">
              <span className="text-xs font-bold text-red-200">{loginError}</span>
            </div>
          )}

          {/* 登录按钮或加载状态 */}
          {isLoggingIn ? (
            <div className="inline-flex items-center justify-center gap-2 py-3 px-4">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span className="text-xs font-bold text-white">
                {getText({ zh: '登录中...', en: 'Logging in...', ko: '로그인 중...', vi: 'Đang đăng nhập...' }, language)}
              </span>
            </div>
          ) : (
            <button 
              onClick={handlePiLogin}
              disabled={isLoggingIn}
              className="inline-flex items-center justify-center gap-1 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 disabled:opacity-50 active:scale-95 transition-all">
              <span className="text-xs font-bold bg-gradient-to-r from-yellow-600 via-yellow-200 to-yellow-600 bg-clip-text text-transparent tracking-wide animate-shine">PI</span>
              <span className="text-xs font-bold bg-gradient-to-r from-purple-400 via-pink-200 to-purple-400 bg-clip-text text-transparent tracking-wide animate-shine">
                {getText({ zh: '登录', en: 'Login', ko: '로그인', vi: 'Đăng nhập' }, language)}
              </span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // 已登录
  if (isLoggedIn) {
    const isProfilePage = location.pathname === '/profile';
    
    // 在首页 - 只显示个人中心按钮
    if (isHomePage) {
      return (
        <div className="w-full bg-transparent py-2 px-4">
          <div className="flex justify-center items-center max-w-md mx-auto">
            <button 
              onClick={() => navigate('/profile')}
              className="inline-flex flex-col items-center justify-center gap-0.5 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 group active:scale-95 transition-all hover:bg-white/20">
              <User size={18} className="text-yellow-400" strokeWidth={2} />
              <span className="text-[9px] font-bold bg-gradient-to-r from-purple-400 via-pink-200 to-purple-400 bg-clip-text text-transparent tracking-wide animate-shine">{translations.profile[language]}</span>
            </button>
          </div>
        </div>
      );
    }
    
    // 在个人中心页面 - 显示主页、消息、购物车和退出按钮
    if (isProfilePage) {
      return (
        <div className="w-full bg-transparent">
          <div className="flex justify-between items-center max-w-md mx-auto px-4 py-1.5">
            <button 
              onClick={() => navigate('/')}
              className="inline-flex flex-col items-center justify-center gap-[2px] py-1 w-[72px] group active:scale-95 transition-all hover:opacity-80">
              <Home size={20} className="text-white fill-white/20" strokeWidth={2} />
              <span className="text-[10px] font-bold text-white tracking-wide">{translations.home[language]}</span>
            </button>
            
            <button 
              onClick={() => navigate('/messages')}
              className="inline-flex flex-col items-center justify-center gap-[2px] py-1 w-[72px] group active:scale-95 transition-all hover:opacity-80 relative">
              <Mail size={20} className="text-white" strokeWidth={2} />
              {unreadMessageCount > 0 && (
                <span className="absolute -top-1 right-3 min-w-[16px] h-4 bg-red-500 rounded-full flex items-center justify-center px-1">
                  <span className="text-white text-[10px] font-bold">{unreadMessageCount > 99 ? '99+' : unreadMessageCount}</span>
                </span>
              )}
              <span className="text-[10px] font-bold text-white tracking-wide">{getText({ zh: '消息', en: 'Messages', ko: '메시지', vi: 'Tin nhắn' }, language)}</span>
            </button>
            
            <button 
              onClick={() => navigate('/cart')}
              className="inline-flex flex-col items-center justify-center gap-[2px] py-1 w-[72px] group active:scale-95 transition-all hover:opacity-80 relative">
              <ShoppingCart size={20} className="text-white" strokeWidth={2} />
              {cartCount > 0 && (
                <span className="absolute -top-1 right-3 min-w-[16px] h-4 bg-red-500 rounded-full flex items-center justify-center px-1">
                  <span className="text-white text-[10px] font-bold">{cartCount > 99 ? '99+' : cartCount}</span>
                </span>
              )}
              <span className="text-[10px] font-bold text-white tracking-wide">{getText({ zh: '购物车', en: 'Cart', ko: '장바구니', vi: 'Giỏ hàng' }, language)}</span>
            </button>

            <button 
              onClick={onLogout}
              className="inline-flex flex-col items-center justify-center gap-[2px] py-1 w-[72px] group active:scale-95 transition-all hover:opacity-80">
              <LogOut size={20} className="text-white" strokeWidth={2.5} />
              <span className="text-[10px] font-bold text-white tracking-wide">{getText({ zh: '退出', en: 'Logout', ko: '로그아웃', vi: 'Đăng xuất' }, language)}</span>
            </button>
          </div>
        </div>
      );
    }
    
    // 在其他页面 - 显示主页、个人中心和退出按钮
    return (
      <div className="w-full py-2 px-4">
        <div className="flex justify-evenly items-center max-w-md mx-auto gap-2">
          <button 
            onClick={() => navigate('/')}
            className="w-20 flex flex-col items-center justify-center gap-[2px] py-1.5 group active:scale-95 transition-all hover:opacity-80">
            <Home size={20} className="text-white fill-white/20" strokeWidth={2} />
            <span className="text-[10px] font-bold text-white tracking-wide">{translations.home[language]}</span>
          </button>

          <button 
            onClick={() => navigate('/profile')}
            className="w-20 flex flex-col items-center justify-center gap-[2px] py-1.5 group active:scale-95 transition-all hover:opacity-80">
            <User size={20} className="text-white fill-white/20" strokeWidth={2} />
            <span className="text-[10px] font-bold text-white tracking-wide">{translations.profile[language]}</span>
          </button>

          <button 
            onClick={onLogout}
            className="w-20 flex flex-col items-center justify-center gap-[2px] py-1.5 group active:scale-95 transition-all hover:opacity-80">
            <LogOut size={20} className="text-white" strokeWidth={2.5} />
            <span className="text-[10px] font-bold text-white tracking-wide">{getText({ zh: '退出', en: 'Logout', ko: '로그아웃', vi: 'Đăng xuất' }, language)}</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
};

const getText = (obj: { [key: string]: string }, lang: Language = 'zh') => obj[lang] || obj.zh;
