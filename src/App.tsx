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
import { DetailPage } from './pages/DetailPage';
import { TreeHoleDetailPage } from './pages/TreeHoleDetailPage';
import { ResourceDetailPage } from './pages/ResourceDetailPage';
import { EscrowDetailPage } from './pages/EscrowDetailPage';
import { LinkDetailPage } from './pages/LinkDetailPage';
import { InvestDetailPage } from './pages/InvestDetailPage';
import { MessagesPage } from './pages/MessagesPage';
import { CartPage } from './pages/CartPage';
import { CustomerServicePage } from './pages/CustomerServicePage';
import { JoinStorePage } from './pages/JoinStorePage';
import { EscrowCreatePage } from './pages/EscrowCreatePage';
import { VentureCreatePage } from './pages/VentureCreatePage';
import './index.css';

const HomePage: React.FC<{ 
  language: Language; 
  onLanguageChange: (lang: Language) => void;
  isLoggedIn: boolean;
  onLogout: () => void;
  onLoginSuccess: (userInfo: any) => void;
}> = ({ language, onLanguageChange, isLoggedIn, onLogout, onLoginSuccess }) => {
  return (
    <div className="h-screen w-full bg-gradient-to-br from-[#7c3aed] via-[#a855f7] to-[#c084fc] font-sans text-white selection:bg-purple-300 overflow-hidden flex justify-center relative">
      {/* 背景光效装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-400/10 rounded-full blur-3xl"></div>
      </div>
      <div className="w-full max-w-md h-full flex flex-col relative shadow-2xl bg-transparent z-10">
        {/* Fixed Top Section */}
        <div className="flex-none z-20">
          <AnnouncementBar language={language} translations={TRANSLATIONS} />
          <Header language={language} translations={TRANSLATIONS} onLanguageChange={onLanguageChange} />
        </div>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto px-4 pb-2">
          <h2 className="text-sm font-bold text-white/95 mb-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)] px-1 tracking-tight">
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

  // Detail page routes
  if (location.pathname === '/detail') {
    return <DetailPage language={language} translations={TRANSLATIONS} />;
  }
  if (location.pathname === '/tree-hole-detail') {
    return <TreeHoleDetailPage language={language} translations={TRANSLATIONS} />;
  }
  if (location.pathname === '/resource-detail') {
    return <ResourceDetailPage language={language} translations={TRANSLATIONS} />;
  }
  if (location.pathname === '/escrow-detail') {
    return <EscrowDetailPage language={language} translations={TRANSLATIONS} />;
  }
  if (location.pathname === '/link-detail') {
    return <LinkDetailPage language={language} translations={TRANSLATIONS} />;
  }
  if (location.pathname === '/invest-detail') {
    return <InvestDetailPage language={language} translations={TRANSLATIONS} />;
  }

  // Messages page
  if (location.pathname === '/messages') {
    return <MessagesPage language={language} translations={TRANSLATIONS} />;
  }

  // Cart page
  if (location.pathname === '/cart') {
    return <CartPage language={language} translations={TRANSLATIONS} />;
  }

  // Customer service page
  if (location.pathname === '/customer-service') {
    return <CustomerServicePage language={language} translations={TRANSLATIONS} />;
  }

  // Join store page
  if (location.pathname === '/join-store') {
    return <JoinStorePage language={language} translations={TRANSLATIONS} />;
  }

  // Escrow create page
  if (location.pathname === '/escrow-create') {
    return <EscrowCreatePage language={language} translations={TRANSLATIONS} />;
  }

  // Venture create page
  if (location.pathname === '/venture-create') {
    return <VentureCreatePage language={language} translations={TRANSLATIONS} />;
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
