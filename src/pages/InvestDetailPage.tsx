import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, Users, TrendingUp, Shield, Target, Calendar, Award, CheckCircle, MessageCircle, Info, DollarSign } from 'lucide-react';
import { Language, Translations } from '../types';

interface InvestDetailPageProps {
  language: Language;
  translations: Translations;
}

export const InvestDetailPage: React.FC<InvestDetailPageProps> = ({ language }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isFavorite, setIsFavorite] = useState(false);
  
  const item = location.state?.item || {
    id: '1',
    name: { zh: '投资项目', en: 'Investment Project', ko: '투자 프로젝트', vi: 'Dự án đầu tư' },
    description: { zh: '项目描述', en: 'Project description', ko: '프로젝트 설명', vi: 'Mô tả dự án' },
    icon: '🚀',
    fundingGoal: 100000,
    currentFunding: 45000,
    minInvestment: 5000,
    stage: { zh: 'A轮', en: 'Series A', ko: 'A 라운드', vi: 'Vòng A' },
    investors: 8,
    progress: 45,
    creditScore: 92,
    deposit: 10000,
    deadline: '30天',
    milestones: 3,
    platformFee: 3,
    returnType: { zh: '股权代币+分红', en: 'Equity Token + Dividends', ko: '지분 토큰 + 배당', vi: 'Token cổ phần + Cổ tức' },
    buybackPeriod: { zh: '3年', en: '3 years', ko: '3년', vi: '3 năm' },
  };

  const milestoneList = [
    { id: 1, title: { zh: '产品开发', en: 'Product Dev', ko: '제품 개발', vi: 'Phát triển SP' }, percent: 30, done: true },
    { id: 2, title: { zh: '市场推广', en: 'Marketing', ko: '마케팅', vi: 'Marketing' }, percent: 40, done: false },
    { id: 3, title: { zh: '规模扩张', en: 'Scaling', ko: '확장', vi: 'Mở rộng' }, percent: 30, done: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-indigo-100 flex flex-col">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-sm font-bold text-purple-600">
            {language === 'zh' ? '项目详情' : language === 'en' ? 'Project Detail' : language === 'ko' ? '프로젝트 상세' : 'Chi tiết dự án'}
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
        {/* 项目图标和基本信息 */}
        <div className="bg-gradient-to-br from-purple-200 to-indigo-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center">
              <span className="text-3xl">{item.icon}</span>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-800 mb-1">{item.name?.[language]}</h2>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-purple-500 text-white text-xs font-bold rounded">{item.stage?.[language]}</span>
                <span className="text-xs text-gray-600 flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  {language === 'zh' ? '信用' : 'Credit'}: {item.creditScore}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 融资进度 */}
        <div className="bg-white p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-gray-700">{language === 'zh' ? '融资进度' : 'Funding Progress'}</span>
            <span className="text-sm text-purple-600 font-bold">{item.progress}%</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-3">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${item.progress}%` }}
            ></div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-gray-500">{language === 'zh' ? '目标金额' : 'Goal'}</p>
              <p className="font-bold text-gray-800">{item.fundingGoal?.toLocaleString()}π</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">{language === 'zh' ? '已筹金额' : 'Raised'}</p>
              <p className="font-bold text-green-600">{item.currentFunding?.toLocaleString()}π</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">{language === 'zh' ? '起投金额' : 'Min'}</p>
              <p className="font-bold text-blue-600">{item.minInvestment?.toLocaleString()}π</p>
            </div>
          </div>
        </div>

        {/* 关键信息 */}
        <div className="bg-white mt-2 p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-purple-600" />
                <span className="text-xs text-gray-500">{language === 'zh' ? '投资人数' : 'Investors'}</span>
              </div>
              <p className="font-bold text-purple-600">{item.investors} {language === 'zh' ? '人' : ''}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-gray-500">{language === 'zh' ? '剩余时间' : 'Remaining'}</span>
              </div>
              <p className="font-bold text-blue-600">{item.deadline}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-xs text-gray-500">{language === 'zh' ? '保证金' : 'Deposit'}</span>
              </div>
              <p className="font-bold text-green-600">{item.deposit?.toLocaleString()}π</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-orange-600" />
                <span className="text-xs text-gray-500">{language === 'zh' ? '服务费' : 'Fee'}</span>
              </div>
              <p className="font-bold text-orange-600">{item.platformFee}%</p>
            </div>
          </div>
        </div>

        {/* 里程碑 */}
        <div className="bg-white mt-2 p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-600" />
            {language === 'zh' ? '资金释放里程碑' : 'Milestones'}
          </h3>
          <div className="space-y-2">
            {milestoneList.map((milestone) => (
              <div key={milestone.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${milestone.done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                  {milestone.done ? <CheckCircle className="w-4 h-4" /> : milestone.id}
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${milestone.done ? 'text-green-600 font-bold' : 'text-gray-600'}`}>{milestone.title[language]}</p>
                </div>
                <span className="text-xs text-gray-500">{milestone.percent}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* 回报机制 */}
        <div className="bg-white mt-2 p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            {language === 'zh' ? '回报机制' : 'Returns'}
          </h3>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 mb-3">
            <p className="text-sm text-gray-700">
              <span className="font-bold text-green-600">{item.returnType?.[language]}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {language === 'zh' ? `回购期：${item.buybackPeriod?.[language]}` : `Buyback: ${item.buybackPeriod?.[language]}`}
            </p>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
              <span>{language === 'zh' ? '项目盈利时按股份自动分红' : 'Auto dividends when profitable'}</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
              <span>{language === 'zh' ? '股权代币可在平台交易' : 'Equity tokens tradable on platform'}</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
              <span>{language === 'zh' ? '不履行回购将扣除保证金并列入黑名单' : 'Non-compliance: forfeit deposit + blacklist'}</span>
            </div>
          </div>
        </div>

        {/* 项目描述 */}
        <div className="bg-white mt-2 p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
            <Info className="w-4 h-4 text-purple-600" />
            {language === 'zh' ? '项目介绍' : 'Description'}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">{item.description?.[language]}</p>
          <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              {language === 'zh' ? '更多项目资料由创业者上传' : 'More details uploaded by entrepreneur'}
            </p>
          </div>
        </div>
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <button className="flex flex-col items-center gap-0.5 px-3">
            <MessageCircle className="w-5 h-5 text-gray-500" />
            <span className="text-[10px] text-gray-500">{language === 'zh' ? '咨询' : 'Ask'}</span>
          </button>
          <div className="flex-1">
            <button className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all">
              {language === 'zh' ? '立即投资' : language === 'en' ? 'Invest Now' : language === 'ko' ? '지금 투자' : 'Đầu tư ngay'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
