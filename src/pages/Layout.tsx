import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Translations, Language } from '../types';

interface LayoutProps {
  language: Language;
  translations: Translations;
}

const PAGE_TITLES: Record<string, { zh: string; en: string; ko: string; vi: string }> = {
  '/physical-mall': { zh: '实物商城', en: 'Physical Mall', ko: '실물 쇼핑몰', vi: 'Trung tâm mua sắm' },
  '/virtual-mall': { zh: '虚拟商城', en: 'Virtual Mall', ko: '가상 쇼핑몰', vi: 'Trung tâm ảo' },
  '/home-service': { zh: '上门服务', en: 'Home Service', ko: '방문 서비스', vi: 'Dịch vụ tại nhà' },
  '/offline-play': { zh: '线下陪玩', en: 'Offline Play', ko: '오프라인 플레이', vi: 'Chơi ngoại tuyến' },
  '/courses': { zh: '精品课程', en: 'Courses', ko: '강좌', vi: 'Khóa học' },
  '/detective': { zh: '私家侦探', en: 'Detective', ko: '탐정', vi: 'Thám tử' },
  '/tree-hole': { zh: '私密树洞', en: 'Tree Hole', ko: '트리 홀', vi: 'Lỗ cây' },
  '/house-lease': { zh: '房屋租赁', en: 'House Lease', ko: '주택 임대', vi: 'Cho thuê nhà' },
  '/venture-capital': { zh: '风险投资', en: 'Venture Capital', ko: '벤처 캐피탈', vi: 'Vốn mạo hiểm' },
  '/escrow-trade': { zh: '担保交易', en: 'Escrow Trade', ko: '에스크로 거래', vi: 'Giao dịch ký quỹ' },
  '/friendly-links': { zh: '友情链接', en: 'Friendly Links', ko: '우호 링크', vi: 'Liên kết hữu nghị' },
  '/seek-resources': { zh: '求资源', en: 'Seek Resources', ko: '리소스 찾기', vi: 'Tìm tài nguyên' },
};

export const Layout: React.FC<LayoutProps> = ({ language, translations }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const pageTitle = PAGE_TITLES[location.pathname]?.[language] || translations.platformTitle[language];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-300 flex flex-col">
      {/* Header with back button */}
      <header className="bg-gradient-to-b from-blue-200 to-blue-300 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-center relative">
          <button
            onClick={() => navigate('/')}
            className="absolute left-4 p-2 hover:bg-blue-100/50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-purple-600" />
          </button>
          <h1 className="text-base font-bold text-purple-600">
            {pageTitle}
          </h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-0.5 overflow-auto bg-blue-200">
        <Outlet context={{ language, translations }} />
      </main>
    </div>
  );
};
