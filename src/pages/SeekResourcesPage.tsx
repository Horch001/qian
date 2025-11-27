import React, { useState, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Users, Gem, ArrowLeftRight, DollarSign, Star, Flame, ChevronDown, Clock, Calendar } from 'lucide-react';
import { Language, Translations } from '../types';
import { SimpleSearchBar } from '../components/SimpleSearchBar';

export const SeekResourcesPage: React.FC = () => {
  const { language, translations } = useOutletContext<{ language: Language; translations: Translations }>();
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('default');
  const navigate = useNavigate();

  const goToDetail = (request: any) => {
    navigate('/resource-detail', { state: { item: request } });
  };

  const requests = [
    {
      id: '1',
      resource: { zh: '稀缺电子书资源', en: 'Rare E-book', ko: '희귀 전자책', vi: 'Sách điện tử hiếm' },
      icon: '📚',
      initiatorPrice: 50,
      totalBidders: 12,
      additionalBids: 30,
      status: { zh: '求购中', en: 'Seeking', ko: '구매 중', vi: 'Đang tìm' },
      hot: true,
      publishTime: { zh: '2天前', en: '2 days ago', ko: '2일 전', vi: '2 ngày trước' },
      deadline: { zh: '5天后截止', en: '5 days left', ko: '5일 남음', vi: 'Còn 5 ngày' },
    },
    {
      id: '2',
      resource: { zh: '专业软件激活码', en: 'Software License', ko: '소프트웨어 라이선스', vi: 'Giấy phép phần mềm' },
      icon: '💻',
      initiatorPrice: 100,
      totalBidders: 8,
      additionalBids: 50,
      status: { zh: '求购中', en: 'Seeking', ko: '구매 중', vi: 'Đang tìm' },
      hot: false,
      publishTime: { zh: '1周前', en: '1 week ago', ko: '1주 전', vi: '1 tuần trước' },
      deadline: { zh: '3天后截止', en: '3 days left', ko: '3일 남음', vi: 'Còn 3 ngày' },
    },
    {
      id: '3',
      resource: { zh: '设计素材包', en: 'Design Assets', ko: '디자인 자산', vi: 'Tài sản thiết kế' },
      icon: '🎨',
      initiatorPrice: 30,
      totalBidders: 1,
      additionalBids: 0,
      status: { zh: '求购中', en: 'Seeking', ko: '구매 중', vi: 'Đang tìm' },
      hot: false,
      publishTime: { zh: '3小时前', en: '3 hours ago', ko: '3시간 전', vi: '3 giờ trước' },
      deadline: { zh: '7天后截止', en: '7 days left', ko: '7일 남음', vi: 'Còn 7 ngày' },
    },
  ];

  const sortOptions = [
    { value: 'default', label: { zh: '默认排序', en: 'Default', ko: '기본', vi: 'Mặc định' } },
    { value: 'bidders_high', label: { zh: '出价人数从多到少', en: 'Bidders: High to Low', ko: '입찰자: 많은순', vi: 'Người đấu giá: Cao đến thấp' } },
    { value: 'bidders_low', label: { zh: '出价人数从少到多', en: 'Bidders: Low to High', ko: '입찰자: 적은순', vi: 'Người đấu giá: Thấp đến cao' } },
    { value: 'amount_high', label: { zh: '出价金额从高到低', en: 'Amount: High to Low', ko: '금액: 높은순', vi: 'Số tiền: Cao đến thấp' } },
    { value: 'amount_low', label: { zh: '出价金额从低到高', en: 'Amount: Low to High', ko: '금액: 낮은순', vi: 'Số tiền: Thấp đến cao' } },
  ];

  const sortedRequests = useMemo(() => {
    const sorted = [...requests];
    switch (sortBy) {
      case 'bidders_high': return sorted.sort((a, b) => b.totalBidders - a.totalBidders);
      case 'bidders_low': return sorted.sort((a, b) => a.totalBidders - b.totalBidders);
      case 'amount_high': return sorted.sort((a, b) => (b.initiatorPrice + b.additionalBids) - (a.initiatorPrice + a.additionalBids));
      case 'amount_low': return sorted.sort((a, b) => (a.initiatorPrice + a.additionalBids) - (b.initiatorPrice + b.additionalBids));
      default: return sorted;
    }
  }, [sortBy]);

  const features = [
    { icon: Gem, text: { zh: '稀缺资源', en: 'Rare Resources', ko: '희귀 자원', vi: 'Tài nguyên hiếm' } },
    { icon: ArrowLeftRight, text: { zh: '可供可求', en: 'Supply & Demand', ko: '공급 수요', vi: 'Cung cầu' } },
    { icon: DollarSign, text: { zh: '资金有保障', en: 'Secure Funds', ko: '안전한 자금', vi: 'Bảo vệ tiền' } },
    { icon: Star, text: { zh: '平台担保', en: 'Platform Guarantee', ko: '플랫폼 보증', vi: 'Bảo đảm nền tảng' } },
  ];

  return (
    <div className="space-y-1">
      <SimpleSearchBar language={language} translations={translations} />
      
      <div className="grid grid-cols-4 gap-1.5">
        {features.map((feature, idx) => (
          <div key={idx} className="flex flex-col items-center gap-0.5 py-1">
            <feature.icon className="w-4 h-4 text-purple-600" strokeWidth={2.5} />
            <span className="text-[9px] text-gray-700 font-bold text-center leading-tight">{feature.text[language]}</span>
          </div>
        ))}
      </div>

      {/* 筛选下拉框 */}
      <div className="relative">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 appearance-none cursor-pointer focus:outline-none focus:border-purple-400"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label[language]}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
      
      <div className="space-y-2">
        {sortedRequests.map((request) => (
          <div
            key={request.id}
            onClick={() => goToDetail(request)}
            className={`group relative overflow-hidden rounded-xl p-2 transition-all duration-300 cursor-pointer
                       ${selectedRequest === request.id 
                         ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-400 shadow-lg' 
                         : 'bg-white border border-purple-100 shadow-sm hover:shadow-lg hover:border-yellow-300'}`}
          >
            {/* 热门标签 */}
            {request.hot && (
              <div className="absolute top-0 left-0 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-br-lg rounded-tl-lg shadow-md flex items-center gap-0.5 z-10">
                <Flame className="w-2.5 h-2.5" />
                {language === 'zh' ? '热门' : 'Hot'}
              </div>
            )}
            
            <div className="flex gap-2 relative">
              <div className="w-14 h-14 flex items-center justify-center text-3xl flex-shrink-0 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg shadow-inner">
                {request.icon}
              </div>
              <div className="flex-1 min-w-0 flex flex-col pr-[70px]">
                <h3 className="font-bold text-gray-800 text-sm mb-0.5 line-clamp-1">
                  {request.resource[language]}
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-gray-500">{language === 'zh' ? '首价' : 'Start'}</span>
                      <span className="text-red-600 font-bold text-sm leading-none">{request.initiatorPrice}π</span>
                      <span className="text-[9px] text-gray-500 ml-3">{language === 'zh' ? '发布' : 'Posted'}</span>
                      <span className="flex items-center gap-0.5 text-[9px] text-gray-500">
                        <Clock className="w-3 h-3" />
                        {request.publishTime[language]}
                      </span>
                      <span className="flex items-center gap-0.5 text-[9px] text-orange-600 font-bold ml-1">
                        <Calendar className="w-3 h-3" />
                        {request.deadline[language]}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-gray-500">{language === 'zh' ? '总价' : 'Total'}</span>
                      <span className="text-green-600 font-bold text-sm leading-none">{request.initiatorPrice + request.additionalBids}π</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center bg-purple-50 rounded-lg px-2 py-1">
                    <span className="text-[8px] text-gray-500 leading-none">{language === 'zh' ? '出价人数' : 'Bidders'}</span>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      <Users className="w-3 h-3 text-purple-600" />
                      <span className="text-sm text-purple-600 font-bold leading-none">{request.totalBidders}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute top-1/2 -translate-y-1/2 right-1 flex flex-col gap-1">
                <button 
                  onClick={(e) => { e.stopPropagation(); goToDetail(request); }}
                  className="px-2 py-0.5 bg-gradient-to-r from-green-600 to-emerald-500 text-white text-[10px] font-bold rounded hover:from-green-700 hover:to-emerald-600 active:scale-95 transition-all shadow-sm">
                  {language === 'zh' ? '提供' : language === 'en' ? 'Provide' : language === 'ko' ? '제공' : 'Cung cấp'}
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); goToDetail(request); }}
                  className="px-2 py-0.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold rounded hover:from-orange-600 hover:to-red-600 active:scale-95 transition-all shadow-sm">
                  {language === 'zh' ? '想要' : language === 'en' ? 'Want' : language === 'ko' ? '원해요' : 'Muốn'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
