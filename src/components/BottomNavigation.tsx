import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, LogOut, User, LogIn, Mail, ShoppingCart } from 'lucide-react';
import { Language, Translations } from '../types';
import { authApi, userApi } from '../services/api';

interface BottomNavigationProps {
  language: Language;
  translations: Translations;
  isLoggedIn: boolean;
  onLogout: () => void;
  onLoginSuccess?: (userInfo: any) => void;
}

// Window.Pi 类型已在 vite-env.d.ts 中声明

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ language, translations, isLoggedIn, onLogout, onLoginSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isTestAccount, setIsTestAccount] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // 获取真实的未读消息数
  useEffect(() => {
    const fetchCounts = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setUnreadMessageCount(0);
        return;
      }
      
      try {
        const unreadData = await userApi.getUnreadNotificationCount().catch(() => ({ count: 0 }));
        setUnreadMessageCount(unreadData.count || 0);
      } catch (error) {
        console.error('Failed to fetch counts:', error);
        setUnreadMessageCount(0);
      }
    };

    if (isLoggedIn) {
      fetchCounts();
      // 每30秒刷新一次
      const interval = setInterval(fetchCounts, 30000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  // 检测是否在Pi浏览器环境（不依赖 SDK 是否加载）
  const isPiBrowser = () => {
    // 检查 userAgent（Pi Browser 的 userAgent 包含 "PiBrowser"）
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('pibrowser')) {
      return true;
    }
    // 检查是否在 Pi 域名下运行
    const hostname = window.location.hostname;
    if (hostname.includes('minepi.com')) {
      return true;
    }
    // 检查 SDK 是否存在
    if (window.Pi && typeof window.Pi.authenticate === 'function') {
      return true;
    }
    return false;
  };

  // 等待 Pi SDK 加载完成
  const waitForPiSDK = (maxWait = 3000): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Pi && typeof window.Pi.authenticate === 'function') {
        resolve(true);
        return;
      }
      
      const startTime = Date.now();
      const checkInterval = setInterval(() => {
        if (window.Pi && typeof window.Pi.authenticate === 'function') {
          clearInterval(checkInterval);
          resolve(true);
        } else if (Date.now() - startTime > maxWait) {
          clearInterval(checkInterval);
          resolve(false);
        }
      }, 100);
    });
  };

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

    // 检查是否是本地开发环境
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    console.log('Login attempt - isLocalhost:', isLocalhost, 'hasPiSDK:', !!window.Pi);

    // 本地开发环境，使用测试账号
    if (isLocalhost) {
      console.log('Development mode: using test account');
      try {
        const testPiUid = 'dev_test_user_001';
        const data = await authApi.piLogin({
          piUid: testPiUid,
          accessToken: 'dev_test_token',
          username: 'DevTestUser',
        });
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        const displayUsername = data.user.username && /^[\w\u4e00-\u9fa5]+$/.test(data.user.username) 
          ? data.user.username 
          : 'DevTestUser';
        const testUserInfo = { 
          ...data.user, 
          username: displayUsername,
          isTestAccount: true, 
          balance: data.user.balance || '1000' 
        };
        localStorage.setItem('userInfo', JSON.stringify(testUserInfo));
        localStorage.setItem('piUserInfo', JSON.stringify(testUserInfo));
        onLoginSuccess?.(testUserInfo);
        setIsTestAccount(true);
        console.log('Test account login successful:', testUserInfo);
      } catch (error: any) {
        console.error('Backend login failed, using local test account:', error);
        const testUserInfo = {
          id: 'local_dev_test_' + Date.now(),
          username: 'LocalTestUser',
          uid: 'local_test_' + Date.now(),
          email: 'dev@test.com',
          balance: '1000',
          isTestAccount: true,
        };
        localStorage.setItem('userInfo', JSON.stringify(testUserInfo));
        localStorage.setItem('piUserInfo', JSON.stringify(testUserInfo));
        localStorage.setItem('user', JSON.stringify(testUserInfo));
        onLoginSuccess?.(testUserInfo);
        setIsTestAccount(true);
      }
      setIsLoggingIn(false);
      return;
    }
    
    // 生产环境：等待 Pi SDK 加载
    console.log('Production mode: waiting for Pi SDK...');
    const sdkReady = await waitForPiSDK(8000); // 增加等待时间到8秒
    
    if (!sdkReady) {
      setLoginError(getText({ 
        zh: 'Pi SDK 加载失败，请刷新页面重试', 
        en: 'Pi SDK failed to load, please refresh', 
        ko: 'Pi SDK 로드 실패, 새로고침하세요', 
        vi: 'Pi SDK tải thất bại, vui lòng làm mới' 
      }, language));
      setIsLoggingIn(false);
      return;
    }

    // SDK 加载成功，开始登录
    console.log('Pi SDK loaded successfully, starting authentication...');
    try {
      const scopes = ['username', 'payments'];
      const authResult = await window.Pi.authenticate(scopes, async (payment: any) => {
        console.log('Found incomplete payment during login:', payment.identifier);
      });

      if (authResult && authResult.user) {
        // 调用后端 API 完成登录
        const data = await authApi.piLogin({
          piUid: authResult.user.uid,
          accessToken: authResult.accessToken,
          username: authResult.user.username,
        });
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        const userInfo = { ...data.user, isPiUser: true, balance: data.user.balance || '0.00' };
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        localStorage.setItem('piUserInfo', JSON.stringify(userInfo));
        onLoginSuccess?.(userInfo);
        console.log('Pi login successful:', userInfo);
      } else {
        throw new Error(getText({ 
          zh: '认证失败：未获取到用户信息', 
          en: 'Authentication failed: No user info', 
          ko: '인증 실패: 사용자 정보 없음', 
          vi: 'Xác thực thất bại: Không có thông tin người dùng' 
        }, language));
      }
    } catch (err: any) {
      console.error('Pi authentication error:', err);
      setLoginError(err.message || getText({ 
        zh: 'Pi 登录失败', 
        en: 'Pi login failed', 
        ko: 'Pi 로그인 실패', 
        vi: 'Đăng nhập Pi thất bại' 
      }, language));
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
              <span className="text-[10px] font-bold text-white tracking-wide">{getText({ zh: '购物车', en: 'Cart', ko: '장바구니', vi: 'Giỏ hàng' }, language)}</span>
            </button>

            <button 
              onClick={() => setShowLogoutConfirm(true)}
              className="inline-flex flex-col items-center justify-center gap-[2px] py-1 w-[72px] group active:scale-95 transition-all hover:opacity-80">
              <LogOut size={20} className="text-white" strokeWidth={2.5} />
              <span className="text-[10px] font-bold text-white tracking-wide">{getText({ zh: '退出', en: 'Logout', ko: '로그아웃', vi: 'Đăng xuất' }, language)}</span>
            </button>
          </div>
          
          {/* 退出确认弹窗 */}
          {showLogoutConfirm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowLogoutConfirm(false)}>
              <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-gray-800 text-center mb-2">
                  {getText({ zh: '确认退出', en: 'Confirm Logout', ko: '로그아웃 확인', vi: 'Xác nhận đăng xuất' }, language)}
                </h3>
                <p className="text-gray-500 text-sm text-center mb-6">
                  {getText({ zh: '确定要退出登录吗？', en: 'Are you sure you want to logout?', ko: '정말 로그아웃하시겠습니까?', vi: 'Bạn có chắc muốn đăng xuất?' }, language)}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-all"
                  >
                    {getText({ zh: '取消', en: 'Cancel', ko: '취소', vi: 'Hủy' }, language)}
                  </button>
                  <button
                    onClick={() => {
                      setShowLogoutConfirm(false);
                      onLogout();
                    }}
                    className="flex-1 py-2.5 px-4 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-all"
                  >
                    {getText({ zh: '确认退出', en: 'Logout', ko: '로그아웃', vi: 'Đăng xuất' }, language)}
                  </button>
                </div>
              </div>
            </div>
          )}
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
            onClick={() => setShowLogoutConfirm(true)}
            className="w-20 flex flex-col items-center justify-center gap-[2px] py-1.5 group active:scale-95 transition-all hover:opacity-80">
            <LogOut size={20} className="text-white" strokeWidth={2.5} />
            <span className="text-[10px] font-bold text-white tracking-wide">{getText({ zh: '退出', en: 'Logout', ko: '로그아웃', vi: 'Đăng xuất' }, language)}</span>
          </button>
        </div>
        
        {/* 退出确认弹窗 */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowLogoutConfirm(false)}>
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-gray-800 text-center mb-2">
                {getText({ zh: '确认退出', en: 'Confirm Logout', ko: '로그아웃 확인', vi: 'Xác nhận đăng xuất' }, language)}
              </h3>
              <p className="text-gray-500 text-sm text-center mb-6">
                {getText({ zh: '确定要退出登录吗？', en: 'Are you sure you want to logout?', ko: '정말 로그아웃하시겠습니까?', vi: 'Bạn có chắc muốn đăng xuất?' }, language)}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-all"
                >
                  {getText({ zh: '取消', en: 'Cancel', ko: '취소', vi: 'Hủy' }, language)}
                </button>
                <button
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    onLogout();
                  }}
                  className="flex-1 py-2.5 px-4 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-all"
                >
                  {getText({ zh: '确认退出', en: 'Logout', ko: '로그아웃', vi: 'Đăng xuất' }, language)}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

const getText = (obj: { [key: string]: string }, lang: Language = 'zh') => obj[lang] || obj.zh;
