import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, AlertCircle, CheckCircle } from 'lucide-react';
import { Language, Translations } from '../types';

interface LoginPageProps {
  language: Language;
  translations: Translations;
  onLoginSuccess: (userInfo: any) => void;
}

declare global {
  interface Window {
    Pi?: any;
  }
}

export const LoginPage: React.FC<LoginPageProps> = ({ language, translations, onLoginSuccess }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isTestAccount, setIsTestAccount] = useState(false);

  useEffect(() => {
    // 加载 Pi Network SDK
    if (!window.Pi) {
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
  }, []);

  const isPiBrowser = () => {
    // 检查是否在 Pi 浏览器中
    return !!(window.Pi && window.Pi.request && typeof window.Pi.request === 'function');
  };

  const handleTestLogin = () => {
    setIsLoading(true);
    setError(null);
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
      onLoginSuccess(testUserInfo);
      
      // 显示成功提示
      setShowSuccess(true);
      setIsTestAccount(false);
      
      // 2秒后自动返回首页
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }, 800); // 模拟800ms的登录延迟
  };

  const handlePiLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    // 检查是否在 Pi 浏览器中
    if (!isPiBrowser()) {
      // 不在Pi浏览器中，直接使用测试账号登录
      handleTestLogin();
      return;
    }

    try {
      if (window.Pi) {
        // 请求用户认证
        const scopes = ['wallet', 'username', 'payments'];
        const userInfo = await window.Pi.authenticate(scopes, () => {
          console.log('Pi Network 认证成功');
        });

        // 保存用户信息
        localStorage.setItem('piUserInfo', JSON.stringify(userInfo));
        onLoginSuccess(userInfo);
        
        // 显示成功提示
        setShowSuccess(true);
        
        // 2秒后自动返回首页
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        throw new Error('Pi Network SDK 未加载');
      }
    } catch (err: any) {
      setError(err.message || '登录失败，请重试');
      console.error('Pi Network 登录错误:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getText = (obj: { [key: string]: string }) => obj[language] || obj.zh;

  // 显示成功提示
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#7c3aed] via-[#a855f7] to-[#c084fc] flex items-center justify-center px-4">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4 animate-pulse" />
          <h1 className="text-2xl font-bold text-white mb-2">
            {getText({ zh: '登录成功！', en: 'Login Successful!', ko: '로그인 성공!', vi: 'Đăng nhập thành công!' })}
          </h1>
          <p className="text-gray-100 mb-4">
            {getText({ zh: '正在返回首页选择服务...', en: 'Returning to home page...', ko: '홈페이지로 돌아가는 중...', vi: 'Quay lại trang chủ...' })}
          </p>
          <div className="text-sm text-gray-300">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7c3aed] via-[#a855f7] to-[#c084fc] flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* 标题 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">📱 {getText({ zh: '登录', en: 'Login', ko: '로그인', vi: 'Đăng nhập' })}</h1>
            <p className="text-gray-100">
              {getText({ zh: '使用 Pi Network 账号登录丝绸之路平台', en: 'Login with your Pi Network account', ko: 'Pi Network 계정으로 로그인', vi: 'Đăng nhập bằng tài khoản Pi Network' })}
            </p>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-800">{getText({ zh: '登录失败', en: 'Login Failed', ko: '로그인 실패', vi: 'Đăng nhập thất bại' })}</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* 测试账号提示 */}
          {isTestAccount && (
            <div className="mb-4 px-4 py-3 bg-blue-500/20 border border-blue-400/30 rounded-lg text-center animate-fade-in">
              <p className="text-sm font-bold text-blue-200 mb-1">
                {getText({ zh: '正在使用测试账号登录', en: 'Logging in with test account', ko: '테스트 계정으로 로그인 중', vi: 'Đang đăng nhập bằng tài khoản thử nghiệm' })}
              </p>
              <p className="text-xs text-blue-300/80">
                {getText({ zh: '如需使用完整服务，请使用Pi浏览器进行登录', en: 'For full features, please use Pi Browser to login', ko: '전체 기능을 사용하려면 Pi 브라우저에서 로그인하세요', vi: 'Để sử dụng đầy đủ tính năng, vui lòng đăng nhập qua trình duyệt Pi' })}
              </p>
            </div>
          )}

          {/* Pi Network 登录按钮或连接动画 */}
          {isLoading ? (
            <div className="flex justify-center">
              <div className="inline-flex items-center justify-center gap-3 py-4 px-6 rounded-lg bg-gradient-to-r from-purple-400/50 to-pink-400/50 backdrop-blur-md border border-purple-300/50">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" style={{ animationDuration: '0.6s' }}></div>
                <span className="text-sm font-bold text-white tracking-wide">
                  {getText({ zh: '正在登录...', en: 'Logging in...', ko: '로그인 중...', vi: 'Đang đăng nhập...' })}
                </span>
              </div>
            </div>
          ) : (
            <button
              onClick={handlePiLogin}
              disabled={isLoading}
              className="w-full py-4 px-4 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-lg font-bold shadow-lg hover:shadow-xl hover:from-purple-300 hover:to-pink-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center gap-3"
            >
              <LogIn className="w-5 h-5" />
              <span>
                {getText({ zh: '使用 Pi Network 登录', en: 'Login with Pi Network', ko: 'Pi Network로 로그인', vi: 'Đăng nhập bằng Pi Network' })}
              </span>
            </button>
          )}

          {/* 免责声明 */}
          <div className="mt-8 p-4 bg-white/20 rounded-lg border border-white/30 backdrop-blur-md">
            <p className="text-xs text-white/90">
              {getText({
                zh: '💡 我们不会存储你的私钥或种子短语。所有登录均通过官方 Pi Network SDK 进行，确保资金安全。',
                en: '💡 We never store your private keys. All logins are through official Pi Network SDK.',
                ko: '💡 개인 키를 저장하지 않습니다. 공식 SDK를 사용합니다.',
                vi: '💡 Chúng tôi không lưu trữ khóa cá nhân của bạn. Tất cả đều qua SDK chính thức.',
              })}
            </p>
          </div>

          {/* 返回首页 */}
          <button
            onClick={() => navigate('/')}
            className="mt-6 w-full py-2 px-4 text-center text-white font-bold hover:text-gray-100 transition-colors"
          >
            ← {getText({ zh: '返回首页', en: 'Back Home', ko: '홈으로 돌아가기', vi: 'Quay lại trang chủ' })}
          </button>
        </div>
      </div>
    </div>
  );
};
