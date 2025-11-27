import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, Users, TrendingUp, Clock, Shield, MessageCircle, Send, Gem, CheckCircle, Calendar } from 'lucide-react';
import { Language, Translations } from '../types';

interface ResourceDetailPageProps {
  language: Language;
  translations: Translations;
}

export const ResourceDetailPage: React.FC<ResourceDetailPageProps> = ({ language }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isFavorite, setIsFavorite] = useState(false);
  
  const item = location.state?.item || {
    id: '1',
    resource: { zh: '稀缺资源', en: 'Rare Resource', ko: '희귀 자원', vi: 'Tài nguyên hiếm' },
    icon: '📚',
    initiatorPrice: 50,
    totalBidders: 12,
    additionalBids: 30,
    status: { zh: '求购中', en: 'Seeking', ko: '구매 중', vi: 'Đang tìm' },
  };

  // 模拟同求者列表
  const bidders = [
    { id: '1', amount: 10, time: '2小时前' },
    { id: '2', amount: 5, time: '3小时前' },
    { id: '3', amount: 15, time: '5小时前' },
  ];

  const totalAmount = item.initiatorPrice + (item.additionalBids || 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 to-orange-100 flex flex-col">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-sm font-bold text-orange-600">
            {language === 'zh' ? '资源详情' : language === 'en' ? 'Resource Detail' : language === 'ko' ? '리소스 상세' : 'Chi tiết tài nguyên'}
          </h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsFavorite(!isFavorite)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Share2 className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-md w-full mx-auto overflow-auto pb-24">
        {/* 资源图标区域 */}
        <div className="bg-gradient-to-br from-yellow-200 to-orange-200 h-40 flex items-center justify-center">
          <span className="text-7xl">{item.icon}</span>
        </div>

        {/* 资源信息 */}
        <div className="bg-white p-4 space-y-3">
          <div className="flex items-start justify-between">
            <h2 className="text-lg font-bold text-gray-800 flex-1">
              {item.resource?.[language] || item.title?.[language] || '资源'}
            </h2>
            <div className="flex items-center gap-1 bg-orange-100 px-2 py-1 rounded-lg">
              <Gem className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-bold text-orange-600">{item.status?.[language]}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">{language === 'zh' ? '发起价格' : 'Start Price'}</p>
              <p className="text-xl font-bold text-red-600">{item.initiatorPrice}π</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">{language === 'zh' ? '当前总价' : 'Total Price'}</p>
              <p className="text-xl font-bold text-green-600">{totalAmount}π</p>
            </div>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-gray-600">{language === 'zh' ? '同求人数' : 'Bidders'}</span>
            </div>
            <span className="font-bold text-purple-600">{item.totalBidders} {language === 'zh' ? '人' : ''}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{language === 'zh' ? '发布时间' : 'Posted'}</span>
            </div>
            <span className="text-sm text-gray-600">{item.publishTime?.[language] || '-'}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-gray-600">{language === 'zh' ? '截止时间' : 'Deadline'}</span>
            </div>
            <span className="text-sm font-bold text-orange-600">{item.deadline?.[language] || '-'}</span>
          </div>
        </div>

        {/* 同求者列表 */}
        <div className="bg-white mt-2 p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-600" />
            {language === 'zh' ? '同求者列表' : 'Bidders List'}
          </h3>
          <div className="space-y-2">
            {bidders.map((bidder, idx) => (
              <div key={bidder.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-600">
                    #{idx + 1}
                  </div>
                  <span className="text-sm text-gray-600">{language === 'zh' ? '匿名用户' : 'Anonymous'}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">+{bidder.amount}π</p>
                  <p className="text-[10px] text-gray-400">{bidder.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 平台保障 */}
        <div className="bg-white mt-2 p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-3">{language === 'zh' ? '平台保障' : 'Guarantees'}</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>{language === 'zh' ? '资金由平台托管，交易完成后释放' : 'Funds held by platform until completion'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>{language === 'zh' ? '资源不符可申请退款' : 'Refund available if resource not matched'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>{language === 'zh' ? '提供者需通过平台审核' : 'Providers verified by platform'}</span>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <button 
            onClick={() => navigate('/chat', { state: { targetUser: item.userId, targetName: language === 'zh' ? '发布者' : 'Publisher' } })}
            className="flex flex-col items-center gap-0.5 px-3"
          >
            <MessageCircle className="w-5 h-5 text-gray-500" />
            <span className="text-[10px] text-gray-500">{language === 'zh' ? '咨询' : 'Ask'}</span>
          </button>
          <div className="flex-1 flex gap-2">
            <button className="flex-1 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all">
              {language === 'zh' ? '我来提供' : language === 'en' ? 'I Can Provide' : language === 'ko' ? '제공하기' : 'Tôi cung cấp'}
            </button>
            <button className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all">
              {language === 'zh' ? '我也想要' : language === 'en' ? 'I Want Too' : language === 'ko' ? '나도 원해요' : 'Tôi cũng muốn'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
