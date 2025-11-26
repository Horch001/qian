import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Globe, ChevronDown, ChevronUp, Link2, Shield, Users, Star, ExternalLink } from 'lucide-react';
import { Language, Translations } from '../types';

export const FriendlyLinksPage: React.FC = () => {
  const { language } = useOutletContext<{ language: Language; translations: Translations }>();
  const [isApplyExpanded, setIsApplyExpanded] = useState(false);
  const [siteName, setSiteName] = useState('');
  const [siteUrl, setSiteUrl] = useState('');

  const links = [
    { name: { zh: '技术社区', en: 'Tech Community', ko: '기술 커뮤니티', vi: 'Cộng đồng công nghệ' }, url: '#', icon: '💻', color: 'from-blue-500 to-cyan-500' },
    { name: { zh: '创意设计', en: 'Design Hub', ko: '디자인 허브', vi: 'Hub thiết kế' }, url: '#', icon: '🎨', color: 'from-pink-500 to-rose-500' },
    { name: { zh: '商业合作', en: 'Business Partner', ko: '비즈니스 파트너', vi: 'Đối tác kinh doanh' }, url: '#', icon: '💼', color: 'from-purple-500 to-indigo-500' },
    { name: { zh: '教育平台', en: 'Education Platform', ko: '교육 플랫폼', vi: 'Nền tảng giáo dục' }, url: '#', icon: '📚', color: 'from-green-500 to-emerald-500' },
    { name: { zh: '开发者工具', en: 'Developer Tools', ko: '개발자 도구', vi: 'Công cụ phát triển' }, url: '#', icon: '🔧', color: 'from-orange-500 to-amber-500' },
  ];

  const features = [
    { icon: Link2, text: { zh: '优质链接', en: 'Quality Links', ko: '품질 링크', vi: 'Liên kết chất lượng' } },
    { icon: Shield, text: { zh: '安全可靠', en: 'Safe & Secure', ko: '안전 신뢰', vi: 'An toàn tin cậy' } },
    { icon: Users, text: { zh: '互惠互利', en: 'Mutual Benefit', ko: '상호 이익', vi: 'Lợi ích chung' } },
    { icon: Star, text: { zh: '精选推荐', en: 'Featured', ko: '추천', vi: 'Nổi bật' } },
  ];

  return (
    <div className="space-y-2">
      {/* 特色功能 */}
      <div className="grid grid-cols-4 gap-1.5">
        {features.map((feature, idx) => (
          <div key={idx} className="flex flex-col items-center gap-0.5 py-1">
            <feature.icon className="w-4 h-4 text-purple-600" strokeWidth={2.5} />
            <span className="text-[9px] text-gray-700 font-bold text-center leading-tight">{feature.text[language]}</span>
          </div>
        ))}
      </div>

      {/* 链接列表 */}
      <div className="space-y-2">
        {links.map((link, idx) => (
          <a 
            key={idx} 
            href={link.url} 
            className="group block bg-white rounded-xl p-3 border border-purple-100 hover:border-transparent hover:shadow-lg transition-all duration-300 cursor-pointer relative overflow-hidden"
          >
            {/* 悬停渐变背景 */}
            <div className={`absolute inset-0 bg-gradient-to-r ${link.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
            
            <div className="flex items-center gap-3 relative">
              <div className="w-12 h-12 flex items-center justify-center text-2xl bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg shadow-inner group-hover:scale-110 transition-transform duration-300">
                {link.icon}
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-800 text-sm group-hover:text-purple-600 transition-colors">{link.name[language]}</p>
                <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                  <Globe className="w-3 h-3" />
                  <span>{language === 'zh' ? '合作伙伴' : 'Partner'}</span>
                </p>
              </div>
              <ExternalLink className="w-4 h-4 text-purple-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
            </div>
          </a>
        ))}
      </div>

      {/* 申请友链区域 */}
      <div className="bg-white rounded-xl border-2 border-purple-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
        {!isApplyExpanded ? (
          <button
            onClick={() => setIsApplyExpanded(true)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all group"
          >
            <span className="font-bold text-purple-600 flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              {language === 'zh' ? '申请友链' : language === 'en' ? 'Apply Link' : language === 'ko' ? '링크 신청' : 'Đăng ký liên kết'}
            </span>
            <ChevronDown className="w-5 h-5 text-purple-600 group-hover:translate-y-0.5 transition-transform" />
          </button>
        ) : (
          <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-purple-600" />
                {language === 'zh' ? '申请友链' : language === 'en' ? 'Apply Link' : language === 'ko' ? '링크 신청' : 'Đăng ký liên kết'}
              </h3>
              <button
                onClick={() => setIsApplyExpanded(false)}
                className="text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-lg p-1 transition-all"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
            </div>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder={language === 'zh' ? '网站名称' : language === 'en' ? 'Site name' : language === 'ko' ? '사이트 이름' : 'Tên trang web'}
              className="w-full px-3 py-2 border-2 border-purple-200 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm bg-white shadow-inner"
            />
            <input
              type="text"
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              placeholder="URL"
              className="w-full px-3 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm bg-white shadow-inner"
            />
            <button className="mt-3 w-full px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:from-red-700 hover:to-red-600 font-bold text-sm shadow-md hover:shadow-lg active:scale-95 transition-all">
              {language === 'zh' ? '提交申请' : language === 'en' ? 'Submit' : language === 'ko' ? '제출' : 'Gửi'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
