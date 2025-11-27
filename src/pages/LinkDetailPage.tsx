import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Share2, Globe, ExternalLink, Shield, Clock, Users, Star, Info } from 'lucide-react';
import { Language, Translations } from '../types';

interface LinkDetailPageProps {
  language: Language;
  translations: Translations;
}

export const LinkDetailPage: React.FC<LinkDetailPageProps> = ({ language }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const item = location.state?.item || {
    name: { zh: '合作网站', en: 'Partner Site', ko: '파트너 사이트', vi: 'Trang đối tác' },
    url: '#',
    icon: '🌐',
    color: 'from-blue-500 to-cyan-500',
    description: { zh: '这是合作网站的介绍', en: 'This is the partner site description', ko: '파트너 사이트 설명입니다', vi: 'Đây là mô tả trang đối tác' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-indigo-100 flex flex-col">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-sm font-bold text-blue-600">
            {language === 'zh' ? '链接详情' : language === 'en' ? 'Link Detail' : language === 'ko' ? '링크 상세' : 'Chi tiết liên kết'}
          </h1>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Share2 className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-md w-full mx-auto overflow-auto pb-24">
        {/* 网站图标和名称 */}
        <div className={`bg-gradient-to-br ${item.color || 'from-blue-200 to-indigo-200'} p-6 flex flex-col items-center`}>
          <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-4">
            <span className="text-4xl">{item.icon}</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2 drop-shadow-md">{item.name?.[language]}</h2>
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <Globe className="w-4 h-4" />
            <span>{language === 'zh' ? '合作伙伴' : 'Partner'}</span>
          </div>
        </div>

        {/* 网站信息 */}
        <div className="bg-white p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600" />
            {language === 'zh' ? '网站介绍' : 'About'}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {item.description?.[language] || (language === 'zh' ? '该网站由申请人上传介绍内容，平台已审核通过。' : 'Site description uploaded by applicant and verified by platform.')}
          </p>
        </div>

        {/* 网站预览区域 */}
        <div className="bg-white mt-2 p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600" />
            {language === 'zh' ? '网站预览' : 'Preview'}
          </h3>
          <div className="bg-gray-100 rounded-lg p-8 flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
            <span className="text-5xl mb-3">{item.icon}</span>
            <p className="text-sm text-gray-500 text-center mb-3">
              {language === 'zh' ? '网站预览内容由申请人上传' : 'Preview content uploaded by applicant'}
            </p>
            <div className="w-full h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
              <p className="text-xs text-gray-500">{language === 'zh' ? '网站截图/介绍图片' : 'Site screenshot/images'}</p>
            </div>
          </div>
        </div>

        {/* 认证信息 */}
        <div className="bg-white mt-2 p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-600" />
            {language === 'zh' ? '认证信息' : 'Verification'}
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">{language === 'zh' ? '平台审核' : 'Platform Verified'}</span>
              <span className="text-sm font-bold text-green-600 flex items-center gap-1">
                <Shield className="w-4 h-4" />
                {language === 'zh' ? '已通过' : 'Passed'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">{language === 'zh' ? '合作时间' : 'Partner Since'}</span>
              <span className="text-sm text-gray-800">2024-01-01</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">{language === 'zh' ? '访问量' : 'Visits'}</span>
              <span className="text-sm text-gray-800">12,580</span>
            </div>
          </div>
        </div>

        {/* 用户评价 */}
        <div className="bg-white mt-2 p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            {language === 'zh' ? '用户评价' : 'Reviews'}
          </h3>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className={`w-4 h-4 ${i <= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="text-sm font-bold text-gray-800">4.0</span>
            <span className="text-xs text-gray-500">(128 {language === 'zh' ? '评价' : 'reviews'})</span>
          </div>
          <p className="text-xs text-gray-500">{language === 'zh' ? '评价内容由用户提交' : 'Reviews submitted by users'}</p>
        </div>
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <a 
            href={item.url || '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            {language === 'zh' ? '访问网站' : language === 'en' ? 'Visit Site' : language === 'ko' ? '사이트 방문' : 'Truy cập'}
          </a>
        </div>
      </div>
    </div>
  );
};
