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
import ChatListPage from './pages/ChatListPage';
import ChatRoomPage from './pages/ChatRoomPage';
import { ShopManagePage } from './pages/ShopManagePage';
import { UploadProductPage } from './pages/UploadProductPage';
import { NotificationDetailPage } from './pages/NotificationDetailPage';
import { SearchResultPage } from './pages/SearchResultPage';
import { MyShopsPage } from './pages/MyShopsPage';
import { CheckoutPage } from './pages/CheckoutPage';
import eventsSocketService from './services/eventsSocket';
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

  // 实时事件连接
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token && userInfo) {
      eventsSocketService.connect(token);

      eventsSocketService.on('balance:updated', ({ balance }) => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.balance = balance;
        localStorage.setItem('user', JSON.stringify(user));
        window.dispatchEvent(new Event('balanceUpdated'));
      });

      eventsSocketService.on('cart:updated', (cart) => {
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }));
      });

      eventsSocketService.on('order:updated', (order) => {
        window.dispatchEvent(new CustomEvent('orderUpdated', { detail: order }));
      });

      eventsSocketService.on('favorite:updated', (data) => {
        window.dispatchEvent(new CustomEvent('favoriteUpdated', { detail: data }));
      });

      eventsSocketService.on('product:updated', (product) => {
        window.dispatchEvent(new CustomEvent('product:updated', { detail: product }));
      });
    }

    return () => {
      eventsSocketService.disconnect();
    };
  }, [userInfo]);

  // 心跳功能 - 记录用户在线状态
  useEffect(() => {
    const sendHeartbeat = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        await fetch(`${apiUrl}/api/v1/stats/heartbeat`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        });
      } catch (error) {
        // 静默失败
      }
    };

    // 立即发送一次心跳
    if (userInfo) {
      sendHeartbeat();
    }

    // 每分钟发送一次心跳
    const interval = setInterval(() => {
      if (userInfo) {
        sendHeartbeat();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [userInfo]);

  const handleLoginSuccess = (info: any) => {
    setUserInfo(info);
  };

  const handleLogout = () => {
    // 清除所有用户信息
    localStorage.removeItem('piUserInfo');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // 清除缓存数据（防止下一个用户看到）
    localStorage.removeItem('cachedOrders');
    localStorage.removeItem('cachedFavorites');
    localStorage.removeItem('cachedUserId');
    localStorage.removeItem('cachedCart');
    
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

  // Chat pages moved to Routes below

  // Shop manage pages
  if (location.pathname === '/shop-manage' || location.pathname === '/shop-info' || location.pathname === '/shop-products' || location.pathname === '/shop-orders' || location.pathname === '/shop-stats') {
    return <ShopManagePage language={language} translations={TRANSLATIONS} />;
  }

  // Upload product page
  if (location.pathname === '/upload-product') {
    return <UploadProductPage language={language} translations={TRANSLATIONS} />;
  }

  // Notification detail page
  if (location.pathname === '/notification-detail') {
    return <NotificationDetailPage language={language} translations={TRANSLATIONS} />;
  }

  // Search result page
  if (location.pathname === '/search') {
    return <SearchResultPage language={language} translations={TRANSLATIONS} />;
  }

  // My shops page
  if (location.pathname === '/my-shops') {
    return <MyShopsPage language={language} translations={TRANSLATIONS} />;
  }

  // Checkout page
  if (location.pathname === '/checkout') {
    return <CheckoutPage language={language} translations={TRANSLATIONS} />;
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
        <Route path="/merchant/:id" element={
          <React.Suspense fallback={<div className="min-h-screen bg-gradient-to-b from-purple-600 to-pink-500 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>}>
            {React.createElement(
              React.lazy(() => import('./pages/MerchantDetailPage').then(m => ({ default: m.MerchantDetailPage }))),
              { language, translations: TRANSLATIONS }
            )}
          </React.Suspense>
        } />
        <Route path="/chat" element={<ChatListPage />} />
        <Route path="/chat/:roomId" element={<ChatRoomPage />} />
      </Route>
    </Routes>
  );
};
