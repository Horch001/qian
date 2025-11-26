import React, { useState } from 'react';
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
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(true);

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  const handlePiLogin = async () => {
    setIsLoading(true);
    setError(null);
    setDebugLogs([]);

    try {
      // 检查 Pi SDK 是否存在
      addDebugLog('🔍 开始检查 Pi SDK...');
      addDebugLog(`window.Pi 存在: ${!!window.Pi}`);
      addDebugLog(`window.Pi 类型: ${typeof window.Pi}`);
      
      if (!window.Pi) {
        addDebugLog('❌ Pi SDK 未找到');
        throw new Error('PI_SDK_NOT_AVAILABLE');
      }

      addDebugLog('✅ Pi SDK 已找到');
      addDebugLog(`Pi.authenticate 类型: ${typeof window.Pi.authenticate}`);
      addDebugLog('🚀 开始调用 Pi.authenticate()...');
      
      // Pi SDK 真实认证
      const scopes = ['username', 'payments'];
      const authResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);

      addDebugLog('✅ 认证成功！');
      addDebugLog(`用户名: ${authResult?.user?.username || '未知'}`);

      if (authResult && authResult.user) {
        // 保存用户信息
        const userInfo = {
          username: authResult.user.username,
          uid: authResult.user.uid,
          accessToken: authResult.accessToken,
          isPiUser: true,
        };

        addDebugLog(`💾 保存用户信息: ${userInfo.username}`);

        // TODO: 将 accessToken 发送到后端验证
        // const verified = await fetch('/api/verify-pi-token', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ accessToken: authResult.accessToken })
        // });

        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        onLoginSuccess(userInfo);
        
        setShowSuccess(true);
        setIsLoading(false);
        
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        throw new Error('认证失败：未获取到用户信息');
      }
    } catch (err: any) {
      addDebugLog(`❌ 错误: ${err.message}`);
      
      // 如果是 Pi SDK 不可用，使用测试账号
      if (err.message === 'PI_SDK_NOT_AVAILABLE' || !window.Pi) {
        addDebugLog('⚠️ Pi SDK 不可用，使用测试账号');
        setIsTestAccount(true);
        
        setTimeout(() => {
          const testUserInfo = {
            username: 'TestUser',
            uid: 'test_' + Date.now(),
            email: 'test@example.com',
            balance: '0.00',
            isTestAccount: true,
          };

          localStorage.setItem('userInfo', JSON.stringify(testUserInfo));
          onLoginSuccess(testUserInfo);
          
          setShowSuccess(true);
          setIsTestAccount(false);
          setIsLoading(false);
          
          setTimeout(() => {
            navigate('/');
          }, 2000);
        }, 800);
      } else {
        // 其他错误
        setError(err.message || '登录失败，请重试');
        setIsLoading(false);
      }
    }
  };

  // Pi SDK 支付回调函数
  const onIncompletePaymentFound = (payment: any) => {
    console.log('Incomplete payment found:', payment);
    return payment.identifier;
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
                {getText({ zh: '如需使用完整服务，请在Pi开发者平台注册应用', en: 'Register your app at Pi Developer Portal for full features', ko: 'Pi 개발자 포털에서 앱을 등록하세요', vi: 'Đăng ký ứng dụng tại Pi Developer Portal' })}
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

          {/* 调试面板 */}
          {showDebug && debugLogs.length > 0 && (
            <div className="mt-6 p-4 bg-black/40 rounded-lg border border-white/20 backdrop-blur-md">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-bold text-white">🔧 调试信息</h3>
                <button
                  onClick={() => setShowDebug(false)}
                  className="text-xs text-white/60 hover:text-white"
                >
                  隐藏
                </button>
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {debugLogs.map((log, index) => (
                  <div key={index} className="text-xs text-white/80 font-mono break-all">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 显示调试按钮 */}
          {!showDebug && debugLogs.length > 0 && (
            <button
              onClick={() => setShowDebug(true)}
              className="mt-6 w-full py-2 px-4 text-center text-white/60 text-xs hover:text-white transition-colors"
            >
              显示调试信息
            </button>
          )}

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
