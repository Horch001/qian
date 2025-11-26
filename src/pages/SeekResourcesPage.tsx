import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Users, TrendingUp, Gem, ArrowLeftRight, DollarSign, Star, Flame } from 'lucide-react';
import { Language, Translations } from '../types';
import { SimpleSearchBar } from '../components/SimpleSearchBar';

export const SeekResourcesPage: React.FC = () => {
  const { language, translations } = useOutletContext<{ language: Language; translations: Translations }>();
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);

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
    },
  ];

  const features = [
    { icon: Gem, text: { zh: '稀缺资源', en: 'Rare Resources', ko: '희귀 자원', vi: 'Tài nguyên hiếm' } },
    { icon: ArrowLeftRight, text: { zh: '可供可求', en: 'Supply & Demand', ko: '공급 수요', vi: 'Cung cầu' } },
    { icon: DollarSign, text: { zh: '资金有保障', en: 'Secure Funds', ko: '안전한 자금', vi: 'Bảo vệ tiền' } },
    { icon: Star, text: { zh: '平台担保', en: 'Platform Guarantee', ko: '플랫폼 보증', vi: 'Bảo đảm nền tảng' } },
  ];

  return (
    <div className="space-y-2">
      <SimpleSearchBar language={language} translations={translations} />
      
      <div className="grid grid-cols-4 gap-1.5">
        {features.map((feature, idx) => (
          <div key={idx} className="flex flex-col items-center gap-0.5 py-1">
            <feature.icon className="w-4 h-4 text-purple-600" strokeWidth={2.5} />
            <span className="text-[9px] text-gray-700 font-bold text-center leading-tight">{feature.text[language]}</span>
          </div>
        ))}
      </div>
      
      <div className="space-y-2">
        {requests.map((request) => (
          <div
            key={request.id}
            onClick={() => setSelectedRequest(request.id)}
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
            
            <div className="flex gap-2 relative pb-8 pt-6">
              <div className="w-14 h-14 flex items-center justify-center text-3xl flex-shrink-0 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg shadow-inner">
                {request.icon}
              </div>
              <div className="flex-1 min-w-0 flex flex-col">
                <h3 className="font-bold text-gray-800 text-sm mb-0.5 line-clamp-1">
                  {request.resource[language]}
                </h3>
                <div className="flex items-start justify-between mb-1">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-gray-600">{language === 'zh' ? '发起价' : 'Start'}</span>
                      <span className="text-red-600 font-bold text-sm">{request.initiatorPrice}π</span>
                    </div>
                    {request.additionalBids > 0 && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-green-600" />
                        <span className="text-[9px] text-gray-600">{language === 'zh' ? '总价' : 'Total'}</span>
                        <span className="text-green-600 font-bold text-sm">{request.initiatorPrice + request.additionalBids}π</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-center bg-purple-50 rounded-lg px-2 py-1">
                    <span className="text-[9px] text-gray-600 leading-none">{language === 'zh' ? '同求' : 'Bidders'}</span>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      <Users className="w-3 h-3 text-purple-600" />
                      <span className="text-[10px] text-gray-900 font-bold leading-none">{request.totalBidders}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-1 flex-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((request.totalBidders / 20) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-[9px] text-orange-600 font-bold">{request.status[language]}</span>
                </div>
              </div>
            </div>
            <div className="absolute bottom-1 right-1 flex gap-1">
              <button className="px-3 py-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-bold rounded-lg hover:from-green-700 hover:to-emerald-700 active:scale-95 transition-all shadow-md">
                {language === 'zh' ? '提供' : language === 'en' ? 'Provide' : language === 'ko' ? '제공' : 'Cung cấp'}
              </button>
              <button className="px-3 py-1 bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold rounded-lg hover:from-red-700 hover:to-red-600 active:scale-95 transition-all shadow-md">
                {language === 'zh' ? '同求' : language === 'en' ? 'Join' : language === 'ko' ? '참여' : 'Tham gia'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
