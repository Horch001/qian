import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Language } from './types';
import { TRANSLATIONS } from './constants/translations';
import { CATEGORIES } from './constants/categories';
import { Header } from './components/Header';
import { AnnouncementBar } from './components/AnnouncementBar';
import { BottomNavigation } from './components/BottomNavigation';
import { CategoryCard } from './components/CategoryCard';
import { Layout } from './pages/Layout';
import eventsSocketService from './services/eventsSocket';
import './index.css';

// 懒加载页面组件（按需加载，减少首屏加载时间）
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const PhysicalMallPage = lazy(() => import('./pages/PhysicalMallPage').then(m => ({ default: m.PhysicalMallPage })));
const VirtualMallPage = lazy(() => import('./pages/VirtualMallPage').then(m => ({ default: m.VirtualMallPage })));
const HomeServicePage = lazy(() => import('./pages/HomeServicePage').then(m => ({ default: m.HomeServicePage })));
const OfflinePlaYPage = lazy(() => import('./pages/OfflinePlayPage').then(m => ({ default: m.OfflinePlaYPage })));
const CoursePagePage = lazy(() => import('./pages/CoursePagePage').then(m => ({ default: m.CoursePagePage })));
const PrivateDetectivePage = lazy(() => import('./pages/PrivateDetectivePage').then(m => ({ default: m.PrivateDetectivePage })));
const PrivateTreeHolePage = lazy(() => import('./pages/PrivateTreeHolePage').then(m => ({ default: m.PrivateTreeHolePage })));
const HouseLeasePage = lazy(() => import('./pages/HouseLeasePage').then(m => ({ default: m.HouseLeasePage })));
const VentureCapitalPage = lazy(() => import('./pages/VentureCapitalPage').then(m => ({ default: m.VentureCapitalPage })));
const EscrowTradePage = lazy(() => import('./pages/EscrowTradePage').then(m => ({ default: m.EscrowTradePage })));
const FriendlyLinksPage = lazy(() => import('./pages/FriendlyLinksPage').then(m => ({ default: m.FriendlyLinksPage })));
const SeekResourcesPage = lazy(() => import('./pages/SeekResourcesPage').then(m => ({ default: m.SeekResourcesPage })));
const DetailPage = lazy(() => import('./pages/DetailPage').then(m => ({ default: m.DetailPage })));
const TreeHoleDetailPage = lazy(() => import('./pages/TreeHoleDetailPage').then(m => ({ default: m.TreeHoleDetailPage })));
const ResourceDetailPage = lazy(() => import('./pages/ResourceDetailPage').then(m => ({ default: m.ResourceDetailPage })));
const EscrowDetailPage = lazy(() => import('./pages/EscrowDetailPage').then(m => ({ default: m.EscrowDetailPage })));
const LinkDetailPage = lazy(() => import('./pages/LinkDetailPage').then(m => ({ default: m.LinkDetailPage })));
const InvestDetailPage = lazy(() => import('./pages/InvestDetailPage').then(m => ({ default: m.InvestDetailPage })));
const MessagesPage = lazy(() => import('./pages/MessagesPage').then(m => ({ default: m.MessagesPage })));
const CartPage = lazy(() => import('./pages/CartPage').then(m => ({ default: m.CartPage })));
const CustomerServicePage = lazy(() => import('./pages/CustomerServicePage').then(m => ({ default: m.CustomerServicePage })));
const JoinStorePage = lazy(() => import('./pages/JoinStorePage').then(m => ({ default: m.JoinStorePage })));
const EscrowCreatePage = lazy(() => import('./pages/EscrowCreatePage').then(m => ({ default: m.EscrowCreatePage })));
const VentureCreatePage = lazy(() => import('./pages/VentureCreatePage').then(m => ({ default: m.VentureCreatePage })));
const ChatListPage = lazy(() => import('./pages/ChatListPage'));
const ChatRoomPage = lazy(() => import('./pages/ChatRoomPage'));
const ShopManagePage = lazy(() => import('./pages/ShopManagePage').then(m => ({ default: m.ShopManagePage })));
const UploadProductPage = lazy(() => import('./pages/UploadProductPage').then(m => ({ default: m.UploadProductPage })));
const NotificationDetailPage = lazy(() => import('./pages/NotificationDetailPage').then(m => ({ default: m.NotificationDetailPage })));
const SearchResultPage = lazy(() => import('./pages/SearchResultPage').then(m => ({ default: m.SearchResultPage })));
const MyShopsPage = lazy(() => import('./pages/MyShopsPage').then(m => ({ default: m.MyShopsPage })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));

// 加载中组件
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-pink-100">
    <div className="flex flex-col items-center gap-3">
      <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      <p className="text-sm text-purple-600 font-medium">加载中...</p>
    </div>
  </div>
);

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
      <Suspense fallback={<LoadingFallback />}>
        <div className="h-screen w-full bg-gradient-to-br from-[#7c3aed] via-[#a855f7] to-[#c084fc] font-sans text-white overflow-hidden flex justify-center relative">
          <div className="w-full max-w-md h-full flex flex-col relative shadow-2xl z-10">
            <main className="flex-1 overflow-y-auto">
              <ProfilePage language={language} translations={TRANSLATIONS} onLogout={handleLogout} />
            </main>
            <div className="flex-none z-20">
              <BottomNavigation language={language} translations={TRANSLATIONS} isLoggedIn={!!userInfo} onLogout={handleLogout} onLoginSuccess={handleLoginSuccess} />
            </div>
          </div>
        </div>
      </Suspense>
    );
  }

  // Detail page routes
  if (location.pathname === '/detail') {
    return <Suspense fallback={<LoadingFallback />}><DetailPage language={language} translations={TRANSLATIONS} /></Suspense>;
  }
  if (location.pathname === '/tree-hole-detail') {
    return <Suspense fallback={<LoadingFallback />}><TreeHoleDetailPage language={language} translations={TRANSLATIONS} /></Suspense>;
  }
  if (location.pathname === '/resource-detail') {
    return <Suspense fallback={<LoadingFallback />}><ResourceDetailPage language={language} translations={TRANSLATIONS} /></Suspense>;
  }
  if (location.pathname === '/escrow-detail') {
    return <Suspense fallback={<LoadingFallback />}><EscrowDetailPage language={language} translations={TRANSLATIONS} /></Suspense>;
  }
  if (location.pathname === '/link-detail') {
    return <Suspense fallback={<LoadingFallback />}><LinkDetailPage language={language} translations={TRANSLATIONS} /></Suspense>;
  }
  if (location.pathname === '/invest-detail') {
    return <Suspense fallback={<LoadingFallback />}><InvestDetailPage language={language} translations={TRANSLATIONS} /></Suspense>;
  }

  // Messages page
  if (location.pathname === '/messages') {
    return <Suspense fallback={<LoadingFallback />}><MessagesPage language={language} translations={TRANSLATIONS} /></Suspense>;
  }

  // Cart page
  if (location.pathname === '/cart') {
    return <Suspense fallback={<LoadingFallback />}><CartPage language={language} translations={TRANSLATIONS} /></Suspense>;
  }

  // Customer service page
  if (location.pathname === '/customer-service') {
    return <Suspense fallback={<LoadingFallback />}><CustomerServicePage language={language} translations={TRANSLATIONS} /></Suspense>;
  }

  // Join store page
  if (location.pathname === '/join-store') {
    return <Suspense fallback={<LoadingFallback />}><JoinStorePage language={language} translations={TRANSLATIONS} /></Suspense>;
  }

  // Escrow create page
  if (location.pathname === '/escrow-create') {
    return <Suspense fallback={<LoadingFallback />}><EscrowCreatePage language={language} translations={TRANSLATIONS} /></Suspense>;
  }

  // Venture create page
  if (location.pathname === '/venture-create') {
    return <Suspense fallback={<LoadingFallback />}><VentureCreatePage language={language} translations={TRANSLATIONS} /></Suspense>;
  }

  // Chat list page
  if (location.pathname === '/chat') {
    return <Suspense fallback={<LoadingFallback />}><ChatListPage /></Suspense>;
  }

  // Chat room page
  if (location.pathname.startsWith('/chat/')) {
    return <Suspense fallback={<LoadingFallback />}><ChatRoomPage /></Suspense>;
  }

  // Shop manage page
  if (location.pathname === '/shop-manage') {
    return <Suspense fallback={<LoadingFallback />}><ShopManagePage language={language} translations={TRANSLATIONS} /></Suspense>;
  }

  // Upload product page
  if (location.pathname === '/upload-product') {
    return <Suspense fallback={<LoadingFallback />}><UploadProductPage language={language} translations={TRANSLATIONS} /></Suspense>;
  }

  // Notification detail page
  if (location.pathname === '/notification-detail') {
    return <Suspense fallback={<LoadingFallback />}><NotificationDetailPage language={language} translations={TRANSLATIONS} /></Suspense>;
  }

  // Search result page
  if (location.pathname === '/search') {
    return <Suspense fallback={<LoadingFallback />}><SearchResultPage language={language} translations={TRANSLATIONS} /></Suspense>;
  }

  // My shops page
  if (location.pathname === '/my-shops') {
    return <Suspense fallback={<LoadingFallback />}><MyShopsPage language={language} translations={TRANSLATIONS} /></Suspense>;
  }

  // Checkout page
  if (location.pathname === '/checkout') {
    return <Suspense fallback={<LoadingFallback />}><CheckoutPage language={language} translations={TRANSLATIONS} /></Suspense>;
  }

  // Detail pages layout
  return (
    <Suspense fallback={<LoadingFallback />}>
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
    </Suspense>
  );
};
