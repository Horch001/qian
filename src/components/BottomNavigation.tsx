import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, LogOut, User, LogIn, Mail, ShoppingCart } from 'lucide-react';
import { Language, Translations } from '../types';

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

  const isPiBrowser = () => {
    // 检查是否在 Pi 浏览器中
    return !!(window.Pi && window.Pi.request && typeof window.Pi.request === 'function');
  };

  const handleTestLogin = () => {
    setIsLoggingIn(true);
    setLoginError(null);
    setIsTestAccount(true);

    // 模拟登录延迟
    setTimeout(() => {
      // 创建测试账号信息
      const testUserInfo = {
        username: 'TestUser',
        uid: 'test_' + Date.now(),
        email: 'test@example.com',
        balance: '0.00',
        isTestAccount: true,
      };

      // 保存用户信息（使用 userInfo 而不是 piUserInfo，以区分测试账号）
      localStorage.setItem('userInfo', JSON.stringify(testUserInfo));
      onLoginSuccess?.(testUserInfo);
      setIsLoggingIn(false);
      setIsTestAccount(false);
    }, 800); // 模拟800ms的登录延迟
  };

  const handlePiLogin = async () => {
    setLoginError(null);
    setIsLoggingIn(true);
    
    // 检查是否在 Pi 浏览器中
    if (!isPiBrowser()) {
      // 不在Pi浏览器中，直接使用测试账号登录
      handleTestLogin();
      return;
    }

    try {
      if (window.Pi) {
        const scopes = ['wallet', 'username', 'payments'];
        const userInfo = await window.Pi.authenticate(scopes, () => {
          console.log('Pi Network 认证成功');
        });

        localStorage.setItem('piUserInfo', JSON.stringify(userInfo));
        onLoginSuccess?.(userInfo);
        setIsLoggingIn(false);
      }
    } catch (err: any) {
      console.error('Pi Network 登录错误:', err);
      setLoginError(err.message || getText({ zh: '登录失败，请重试', en: 'Login failed, please try again', ko: '로그인 실패, 다시 시도하세요', vi: 'Đăng nhập thất bại, vui lòng thử lại' }, language));
      setIsLoggingIn(false);
    }
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

          {/* 测试账号提示 */}
          {isTestAccount && (
            <div className="w-full mb-2 px-3 py-2 bg-transparent text-center animate-fade-in">
              <p className="text-xs font-bold text-blue-200 mb-1">
                {getText({ zh: '正在使用测试账号登录', en: 'Logging in with test account', ko: '테스트 계정으로 로그인 중', vi: 'Đang đăng nhập bằng tài khoản thử nghiệm' }, language)}
              </p>
              <p className="text-[10px] text-blue-300/80">
                {getText({ zh: '如需使用完整服务，请使用Pi浏览器进行登录', en: 'For full features, please use Pi Browser to login', ko: '전체 기능을 사용하려면 Pi 브라우저에서 로그인하세요', vi: 'Để sử dụng đầy đủ tính năng, vui lòng đăng nhập qua trình duyệt Pi' }, language)}
              </p>
            </div>
          )}

          {/* 登录按钮或连接动画 */}
          {isLoggingIn ? (
            <div className="inline-flex items-center justify-center gap-3 py-4 px-6 bg-transparent">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" style={{ animationDuration: '0.6s' }}></div>
              <span className="text-sm font-bold text-white tracking-wide">
                {getText({ zh: '正在登录...', en: 'Logging in...', ko: '로그인 중...', vi: 'Đang đăng nhập...' }, language)}
              </span>
            </div>
          ) : (
            <button 
              onClick={handlePiLogin}
              disabled={isLoggingIn}
              className="inline-flex items-center justify-center gap-1 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all">
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
              className="inline-flex flex-col items-center justify-center gap-[2px] py-1 w-[72px] group active:scale-95 transition-all hover:opacity-80">
              <Mail size={20} className="text-white" strokeWidth={2} />
              <span className="text-[10px] font-bold text-white tracking-wide">{getText({ zh: '消息', en: 'Messages', ko: '메시지', vi: 'Tin nhắn' }, language)}</span>
            </button>
            
            <button 
              className="inline-flex flex-col items-center justify-center gap-[2px] py-1 w-[72px] group active:scale-95 transition-all hover:opacity-80">
              <ShoppingCart size={20} className="text-white" strokeWidth={2} />
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
