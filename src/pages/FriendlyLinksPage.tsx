import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Globe, ChevronDown, ChevronUp, Link2, Shield, Users, Star, ExternalLink, Loader2 } from 'lucide-react';
import { Language, Translations } from '../types';
import { friendlyLinkApi, FriendlyLink } from '../services/api';

export const FriendlyLinksPage: React.FC = () => {
  const { language } = useOutletContext<{ language: Language; translations: Translations }>();
  const [isApplyExpanded, setIsApplyExpanded] = useState(false);
  const [siteName, setSiteName] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [links, setLinks] = useState<FriendlyLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const getText = (obj: { [key: string]: string }) => obj[language] || obj.zh;

  // 从后端加载友情链接
  useEffect(() => {
    const loadLinks = async () => {
      try {
        const data = await friendlyLinkApi.getLinks();
        setLinks(data);
      } catch (error) {
        console.error('加载友情链接失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadLinks();
  }, []);

  const goToDetail = (link: FriendlyLink) => {
    navigate('/link-detail', { 
      state: { 
        item: {
          ...link,
          name: { zh: link.name, en: link.nameEn || link.name, ko: link.name, vi: link.name },
        } 
      } 
    });
  };

  // 提交申请
  const handleApply = async () => {
    if (!siteName.trim() || !siteUrl.trim()) {
      alert(getText({ zh: '请填写完整信息', en: 'Please fill in all fields', ko: '모든 필드를 입력하세요', vi: 'Vui lòng điền đầy đủ thông tin' }));
      return;
    }

    setIsSubmitting(true);
    try {
      await friendlyLinkApi.applyLink({ name: siteName, url: siteUrl });
      alert(getText({ zh: '申请已提交，等待审核', en: 'Application submitted, pending review', ko: '신청이 제출되었습니다', vi: 'Đã gửi đơn, chờ xét duyệt' }));
      setSiteName('');
      setSiteUrl('');
      setIsApplyExpanded(false);
    } catch (error: any) {
      alert(error.message || getText({ zh: '申请失败', en: 'Application failed', ko: '신청 실패', vi: 'Gửi đơn thất bại' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 获取随机颜色
  const getColor = (index: number) => {
    const colors = [
      'from-blue-500 to-cyan-500',
      'from-pink-500 to-rose-500',
      'from-purple-500 to-indigo-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-amber-500',
    ];
    return colors[index % colors.length];
  };

  const features = [
    { icon: Link2, text: { zh: '优质链接', en: 'Quality Links', ko: '품질 링크', vi: 'Liên kết chất lượng' } },
    { icon: Shield, text: { zh: '安全可靠', en: 'Safe & Secure', ko: '안전 신뢰', vi: 'An toàn tin cậy' } },
    { icon: Users, text: { zh: '互惠互利', en: 'Mutual Benefit', ko: '상호 이익', vi: 'Lợi ích chung' } },
    { icon: Star, text: { zh: '精选推荐', en: 'Featured', ko: '추천', vi: 'Nổi bật' } },
  ];

  return (
    <div className="space-y-1">
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
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          <p className="mt-2 text-gray-600 text-sm">{getText({ zh: '加载中...', en: 'Loading...', ko: '로딩 중...', vi: 'Đang tải...' })}</p>
        </div>
      ) : links.length === 0 ? (
        <div className="text-center py-10 text-gray-500">{getText({ zh: '暂无友情链接', en: 'No links yet', ko: '링크 없음', vi: 'Chưa có liên kết' })}</div>
      ) : (
        <div className="space-y-2">
          {links.map((link, idx) => (
            <div 
              key={link.id} 
              onClick={() => goToDetail(link)}
              className="group block bg-white rounded-xl p-3 border border-purple-100 hover:border-transparent hover:shadow-lg transition-all duration-300 cursor-pointer relative overflow-hidden"
            >
              {/* 悬停渐变背景 */}
              <div className={`absolute inset-0 bg-gradient-to-r ${getColor(idx)} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              <div className="flex items-center gap-3 relative">
                <div className="w-12 h-12 flex items-center justify-center text-2xl bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg shadow-inner group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                  {link.logo ? (
                    <img src={link.logo} alt={link.name} className="w-full h-full object-cover" />
                  ) : (
                    '🔗'
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800 text-sm group-hover:text-purple-600 transition-colors">
                    {language === 'en' && link.nameEn ? link.nameEn : link.name}
                  </p>
                  <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                    <Globe className="w-3 h-3" />
                    <span>{getText({ zh: '合作伙伴', en: 'Partner', ko: '파트너', vi: 'Đối tác' })}</span>
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-purple-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </div>
          ))}
        </div>
      )}

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
            <button 
              onClick={handleApply}
              disabled={isSubmitting}
              className="mt-3 w-full px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:from-red-700 hover:to-red-600 font-bold text-sm shadow-md hover:shadow-lg active:scale-95 transition-all disabled:opacity-50"
            >
              {isSubmitting 
                ? getText({ zh: '提交中...', en: 'Submitting...', ko: '제출 중...', vi: 'Đang gửi...' })
                : getText({ zh: '提交申请', en: 'Submit', ko: '제출', vi: 'Gửi' })
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
