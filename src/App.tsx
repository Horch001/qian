import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Language } from './types';
import { TRANSLATIONS } from './constants/translations';
import { CATEGORIES } from './constants/categories';
import { Header } from './components/Header';
import { AnnouncementBar } from './components/AnnouncementBar';
import { BottomNavigation } from './components/BottomNavigation';
import { CategoryCard } from './components/CategoryCard';
import { Layout } from './pages/Layout';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { PhysicalMallPage } from './pages/PhysicalMallPage';
import { VirtualMallPage } from './pages/VirtualMallPage';
import { HomeServicePage } from './pages/HomeServicePage';
import { OfflinePlaYPage } from './pages/OfflinePlayPage';
import { CoursePagePage } from './pages/CoursePagePage';
import { PrivateDetectivePage } from './pages/PrivateDetectivePage';
import { PrivateTreeHolePage } from './pages/PrivateTreeHolePage';
import { HouseLeasePage } from './pages/HouseLeasePage';
import { VentureCapitalPage } from './pages/VentureCapitalPage';
import { EscrowTradePage } from './pages/EscrowTradePage';
import { FriendlyLinksPage } from './pages/FriendlyLinksPage';
import { SeekResourcesPage } from './pages/SeekResourcesPage';
import './index.css';

const HomePage: React.FC<{ 
  language: Language; 
  onLanguageChange: (lang: Language) => void;
  isLoggedIn: boolean;
  onLogout: () => void;
  onLoginSuccess: (userInfo: any) => void;
}> = ({ language, onLanguageChange, isLoggedIn, onLogout, onLoginSuccess }) => {
  const [debugInfo, setDebugInfo] = React.useState<string[]>([]);
  const [showDebug, setShowDebug] = React.useState(true);

  React.useEffect(() => {
    const logs: string[] = [];
    logs.push(`⏰ 时间: ${new Date().toLocaleString()}`);
    logs.push(`🌐 User Agent: ${navigator.userAgent}`);
    logs.push(`📱 平台: ${navigator.platform}`);
    logs.push(`-------------------`);
    logs.push(`🔍 检查 window.Pi...`);
    logs.push(`window.Pi 存在: ${!!window.Pi}`);
    logs.push(`window.Pi 类型: ${typeof window.Pi}`);
    
    if (window.Pi) {
      logs.push(`✅ Pi SDK 已加载！`);
      logs.push(`Pi 对象: ${JSON.stringify(Object.keys(window.Pi))}`);
      logs.push(`Pi.authenticate 存在: ${!!window.Pi.authenticate}`);
      logs.push(`Pi.authenticate 类型: ${typeof window.Pi.authenticate}`);
    } else {
      logs.push(`❌ Pi SDK 未加载`);
      logs.push(`⚠️ 可能原因:`);
      logs.push(`1. 不在 Pi 浏览器中`);
      logs.push(`2. SDK 脚本加载失败`);
      logs.push(`3. SDK 初始化未完成`);
    }
    
    setDebugInfo(logs);
  }, []);

  return (
    <div className="h-screen w-full bg-gradient-to-br from-[#7c3aed] via-[#a855f7] to-[#c084fc] font-sans text-white selection:bg-purple-300 overflow-hidden flex justify-center relative">
      {/* 全局调试面板 - 固定在顶部 */}
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-red-600 border-b-4 border-yellow-400 shadow-2xl">
        <div className="max-w-4xl mx-auto p-2">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-sm font-bold text-white">🔧 Pi SDK 状态检测</h3>
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="text-sm text-white font-bold px-3 py-1 bg-yellow-500 rounded hover:bg-yellow-400"
            >
              {showDebug ? '▲ 收起' : '▼ 展开'}
            </button>
          </div>
          {showDebug && (
            <div className="bg-black/95 rounded p-2 max-h-96 overflow-y-auto">
              {debugInfo.map((log, index) => (
                <div key={index} className="text-xs text-green-300 font-mono break-all leading-relaxed py-0.5">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* 背景光效装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-400/10 rounded-full blur-3xl"></div>
      </div>
      <div className="w-full max-w-md h-full flex flex-col relative shadow-2xl bg-transparent z-10" style={{ paddingTop: showDebug ? '200px' : '60px' }}>
        {/* Fixed Top Section */}
        <div className="flex-none z-20">
          <AnnouncementBar language={language} translations={TRANSLATIONS} />
          <Header language={language} translations={TRANSLATIONS} onLanguageChange={onLanguageChange} />
        </div>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto px-4 pb-2">
          <h2 className="text-xl font-bold text-white/95 mb-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)] px-1 tracking-tight">
            {TRANSLATIONS.allCategories[language]}
          </h2>
          
          <div className="grid grid-cols-3 gap-2.5 pb-2">
            {CATEGORIES.map((category) => (
              <CategoryCard key={category.id} item={category} language={language} />
            ))}
          </div>
        </main>

        {/* Fixed Bottom Navigation */}
        <div className="flex-none z-20">
          <BottomNavigation language={language} translations={TRANSLATIONS} isLoggedIn={isLoggedIn} onLogout={onLogout} onLoginSuccess={onLoginSuccess} />
        </div>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('preferredLanguage') as Language | null;
      return saved || 'zh';
    }
    return 'zh';
  });
  const [userInfo, setUserInfo] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('preferredLanguage', language);
  }, [language]);

  useEffect(() => {
    // 检查是否已登录
    const piUser = localStorage.getItem('piUserInfo');
    const emailUser = localStorage.getItem('userInfo');
    if (piUser || emailUser) {
      setUserInfo(piUser ? JSON.parse(piUser) : JSON.parse(emailUser));
    }
  }, []);

  const handleLoginSuccess = (info: any) => {
    setUserInfo(info);
  };

  const handleLogout = () => {
    // 清除所有用户信息
    localStorage.removeItem('piUserInfo');
    localStorage.removeItem('userInfo');
    setUserInfo(null);
    // 返回首页
    navigate('/');
  };

  // Home page route
  if (location.pathname === '/') {
    return <HomePage language={language} onLanguageChange={setLanguage} isLoggedIn={!!userInfo} onLogout={handleLogout} onLoginSuccess={handleLoginSuccess} />;
  }

  // Login page
  if (location.pathname === '/login') {
    return <LoginPage language={language} translations={TRANSLATIONS} onLoginSuccess={handleLoginSuccess} />;
  }

  // Profile page
  if (location.pathname === '/profile') {
    return (
      <div className="h-screen w-full bg-gradient-to-br from-[#7c3aed] via-[#a855f7] to-[#c084fc] font-sans text-white overflow-hidden flex justify-center relative">
        <div className="w-full max-w-md h-full flex flex-col relative shadow-2xl z-10">
          {/* Scrollable Main Content */}
          <main className="flex-1 overflow-y-auto">
            <ProfilePage language={language} translations={TRANSLATIONS} onLogout={handleLogout} />
          </main>
          {/* Fixed Bottom Navigation */}
          <div className="flex-none z-20">
            <BottomNavigation language={language} translations={TRANSLATIONS} isLoggedIn={!!userInfo} onLogout={handleLogout} onLoginSuccess={handleLoginSuccess} />
          </div>
        </div>
      </div>
    );
  }

  // Detail pages layout
  return (
    <Routes>
      <Route element={<Layout language={language} translations={TRANSLATIONS} />}>
        <Route path="/physical-mall" element={<PhysicalMallPage />} />
        <Route path="/virtual-mall" element={<VirtualMallPage />} />
        <Route path="/home-service" element={<HomeServicePage />} />
        <Route path="/offline-play" element={<OfflinePlaYPage />} />
        <Route path="/courses" element={<CoursePagePage />} />
        <Route path="/detective" element={<PrivateDetectivePage />} />
        <Route path="/tree-hole" element={<PrivateTreeHolePage />} />
        <Route path="/house-lease" element={<HouseLeasePage />} />
        <Route path="/venture-capital" element={<VentureCapitalPage />} />
        <Route path="/escrow-trade" element={<EscrowTradePage />} />
        <Route path="/friendly-links" element={<FriendlyLinksPage />} />
        <Route path="/seek-resources" element={<SeekResourcesPage />} />
      </Route>
    </Routes>
  );
};
