import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Globe, ChevronDown, ChevronUp, Link2, Shield, Users, Star, ExternalLink, Loader2, Upload, Clock, DollarSign } from 'lucide-react';
import { Language, Translations } from '../types';
import { friendlyLinkApi, FriendlyLink } from '../services/api';

type DurationType = 'ONE_WEEK' | 'ONE_MONTH' | 'ONE_QUARTER' | 'ONE_YEAR';

export const FriendlyLinksPage: React.FC = () => {
  const { language } = useOutletContext<{ language: Language; translations: Translations }>();
  const [isApplyExpanded, setIsApplyExpanded] = useState(false);
  const [siteName, setSiteName] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [logo, setLogo] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState<DurationType>('ONE_MONTH');
  const [links, setLinks] = useState<FriendlyLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prices, setPrices] = useState<Record<DurationType, number>>({
    ONE_WEEK: 10,
    ONE_MONTH: 30,
    ONE_QUARTER: 80,
    ONE_YEAR: 300,
  });
  const navigate = useNavigate();

  const getText = (obj: { [key: string]: string }) => obj[language] || obj.zh;

  // 从后端加载友情链接和价格
  useEffect(() => {
    const loadData = async () => {
      try {
        const [linksData, pricesData] = await Promise.all([
          friendlyLinkApi.getApprovedLinks(),
          friendlyLinkApi.getPrices(),
        ]);
        setLinks(linksData);
        setPrices(pricesData);
      } catch (error) {
        console.error('加载数据失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
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

  // 上传logo
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${apiUrl}/api/v1/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      setLogo(data.url);
    } catch (error) {
      alert(getText({ zh: '上传失败', en: 'Upload failed', ko: '업로드 실패', vi: 'Tải lên thất bại' }));
    }
  };

  // 提交申请
  const handleApply = async () => {
    if (!siteName.trim() || !siteUrl.trim()) {
      alert(getText({ zh: '请填写网站名称和网址', en: 'Please fill in site name and URL', ko: '사이트 이름과 URL을 입력하세요', vi: 'Vui lòng điền tên và URL' }));
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      alert(getText({ zh: '请先登录', en: 'Please login first', ko: '먼저 로그인하세요', vi: 'Vui lòng đăng nhập' }));
      return;
    }

    setIsSubmitting(true);
    try {
      const application: any = await friendlyLinkApi.createApplication({
        websiteName: siteName,
        websiteUrl: siteUrl,
        logo,
        description,
        duration,
      });

      // 创建成功后跳转到支付确认
      const price = prices[duration];
      const confirmPay = confirm(
        getText({ 
          zh: `申请已创建！\n展示时长：${getDurationText(duration)}\n费用：${price}π\n\n是否立即支付？`, 
          en: `Application created!\nDuration: ${getDurationText(duration)}\nPrice: ${price}π\n\nPay now?`,
          ko: `신청이 생성되었습니다!\n기간: ${getDurationText(duration)}\n가격: ${price}π\n\n지금 결제하시겠습니까?`,
          vi: `Đã tạo đơn!\nThời gian: ${getDurationText(duration)}\nGiá: ${price}π\n\nThanh toán ngay?`
        })
      );

      if (confirmPay) {
        await friendlyLinkApi.payApplication(application.id);
        alert(getText({ zh: '支付成功！等待管理员审核', en: 'Payment successful! Pending review', ko: '결제 성공! 검토 대기 중', vi: 'Thanh toán thành công! Chờ xét duyệt' }));
      } else {
        alert(getText({ zh: '申请已保存，可稍后在个人中心支付', en: 'Application saved, pay later in profile', ko: '신청이 저장되었습니다', vi: 'Đã lưu đơn' }));
      }

      // 重置表单
      setSiteName('');
      setSiteUrl('');
      setLogo('');
      setDescription('');
      setDuration('ONE_MONTH');
      setIsApplyExpanded(false);
    } catch (error: any) {
      alert(error.message || getText({ zh: '申请失败', en: 'Application failed', ko: '신청 실패', vi: 'Gửi đơn thất bại' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 获取时长文本
  const getDurationText = (dur: DurationType) => {
    const texts = {
      ONE_WEEK: { zh: '一周', en: '1 Week', ko: '1주', vi: '1 tuần' },
      ONE_MONTH: { zh: '一月', en: '1 Month', ko: '1개월', vi: '1 tháng' },
      ONE_QUARTER: { zh: '一季度', en: '3 Months', ko: '3개월', vi: '3 tháng' },
      ONE_YEAR: { zh: '一年', en: '1 Year', ko: '1년', vi: '1 năm' },
    };
    return getText(texts[dur]);
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
    <div className="space-y-1 pb-20">
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
      <div>
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
      </div>

      {/* 底部申请友链区域 - 固定在底部 */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-4 pb-2 bg-gradient-to-b from-transparent via-blue-200 to-blue-300 pt-4">
        <div className="bg-white rounded-xl border-2 border-purple-200 overflow-hidden shadow-lg">
        {!isApplyExpanded ? (
          <button
            onClick={() => setIsApplyExpanded(true)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all group"
          >
            <span className="font-bold text-purple-600 flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              {getText({ zh: '申请友链', en: 'Apply Link', ko: '링크 신청', vi: 'Đăng ký liên kết' })}
            </span>
            <ChevronDown className="w-5 h-5 text-purple-600 group-hover:translate-y-0.5 transition-transform" />
          </button>
        ) : (
          <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-purple-600" />
                {getText({ zh: '申请友链', en: 'Apply Link', ko: '링크 신청', vi: 'Đăng ký liên kết' })}
              </h3>
              <button
                onClick={() => setIsApplyExpanded(false)}
                className="text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-lg p-1 transition-all"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
            </div>

            {/* 网站名称 */}
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder={getText({ zh: '网站名称', en: 'Site name', ko: '사이트 이름', vi: 'Tên trang web' })}
              className="w-full px-3 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm bg-white shadow-inner"
            />

            {/* 网站地址 */}
            <input
              type="text"
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              placeholder={getText({ zh: '网站地址 (https://...)', en: 'Website URL', ko: '웹사이트 URL', vi: 'URL trang web' })}
              className="w-full px-3 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm bg-white shadow-inner"
            />

            {/* Logo上传 */}
            <div>
              <label className="block text-xs text-gray-600 mb-1 flex items-center gap-1">
                <Upload className="w-3 h-3" />
                {getText({ zh: '网站Logo (可选)', en: 'Logo (optional)', ko: '로고 (선택)', vi: 'Logo (tùy chọn)' })}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="w-full text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white file:cursor-pointer hover:file:bg-purple-700"
              />
              {logo && (
                <div className="mt-2 flex items-center gap-2">
                  <img src={logo} alt="Logo" className="w-10 h-10 rounded-lg object-cover border-2 border-purple-200" />
                  <button onClick={() => setLogo('')} className="text-xs text-red-500 hover:text-red-700">
                    {getText({ zh: '删除', en: 'Remove', ko: '삭제', vi: 'Xóa' })}
                  </button>
                </div>
              )}
            </div>

            {/* 网站描述 */}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={getText({ zh: '网站描述 (可选)', en: 'Description (optional)', ko: '설명 (선택)', vi: 'Mô tả (tùy chọn)' })}
              rows={2}
              className="w-full px-3 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm bg-white shadow-inner resize-none"
            />

            {/* 展示时长选择 */}
            <div>
              <label className="block text-xs text-gray-600 mb-2 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {getText({ zh: '展示时长', en: 'Duration', ko: '기간', vi: 'Thời gian' })}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['ONE_WEEK', 'ONE_MONTH', 'ONE_QUARTER', 'ONE_YEAR'] as DurationType[]).map((dur) => (
                  <button
                    key={dur}
                    onClick={() => setDuration(dur)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                      duration === dur
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-white text-gray-700 border-2 border-purple-200 hover:border-purple-400'
                    }`}
                  >
                    <div>{getDurationText(dur)}</div>
                    <div className="text-[10px] flex items-center justify-center gap-0.5 mt-0.5">
                      <DollarSign className="w-2.5 h-2.5" />
                      {prices[dur]}π
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 费用说明 */}
            <div className="bg-purple-100 rounded-lg p-2 text-xs text-purple-800">
              <div className="flex items-center gap-1 font-bold">
                <DollarSign className="w-3 h-3" />
                {getText({ zh: '费用', en: 'Price', ko: '가격', vi: 'Giá' })}: {prices[duration]}π
              </div>
              <div className="text-[10px] mt-1 text-purple-600">
                {getText({ zh: '支付后等待管理员审核通过即可展示', en: 'Display after admin approval', ko: '관리자 승인 후 표시', vi: 'Hiển thị sau khi được duyệt' })}
              </div>
            </div>

            {/* 提交按钮 */}
            <button 
              onClick={handleApply}
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-bold text-sm shadow-md hover:shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
};
