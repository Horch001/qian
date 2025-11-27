import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { TrendingUp, Shield, Target, Users, Search, Info, Calendar, Award } from 'lucide-react';
import { Language, Translations } from '../types';

export const VentureCapitalPage: React.FC = () => {
  const { language, translations } = useOutletContext<{ language: Language; translations: Translations }>();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const navigate = useNavigate();

  const goToDetail = (project: any) => {
    navigate('/invest-detail', { state: { item: project } });
  };

  const projects = [
    {
      id: '1',
      name: { zh: 'AI智能助手项目', en: 'AI Assistant Project', ko: 'AI 어시스턴트 프로젝트', vi: 'Dự án trợ lý AI' },
      description: { zh: '基于深度学习的智能对话系统', en: 'AI dialogue system based on deep learning', ko: '딥러닝 기반 AI 대화 시스템', vi: 'Hệ thống đối thoại AI dựa trên học sâu' },
      icon: '🤖',
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
    },
    {
      id: '2',
      name: { zh: '电商平台开发', en: 'E-commerce Platform', ko: '전자상거래 플랫폼', vi: 'Nền tảng thương mại điện tử' },
      description: { zh: '跨境电商一站式解决方案', en: 'Cross-border e-commerce solution', ko: '국경 간 전자상거래 솔루션', vi: 'Giải pháp thương mại điện tử xuyên biên giới' },
      icon: '🛒',
      fundingGoal: 200000,
      currentFunding: 80000,
      minInvestment: 10000,
      stage: { zh: 'Pre-A轮', en: 'Pre-Series A', ko: 'Pre-A 라운드', vi: 'Vòng Pre-A' },
      investors: 12,
      progress: 40,
      creditScore: 88,
      deposit: 20000,
      deadline: '45天',
      milestones: 4,
      platformFee: 3,
      returnType: { zh: '股权代币+分红', en: 'Equity Token + Dividends', ko: '지분 토큰 + 배당', vi: 'Token cổ phần + Cổ tức' },
      buybackPeriod: { zh: '3年', en: '3 years', ko: '3년', vi: '3 năm' },
    },
    {
      id: '3',
      name: { zh: '在线教育平台', en: 'Online Education', ko: '온라인 교육', vi: 'Giáo dục trực tuyến' },
      description: { zh: 'K12在线教育智能辅导平台', en: 'K12 online education platform', ko: 'K12 온라인 교육 플랫폼', vi: 'Nền tảng giáo dục trực tuyến K12' },
      icon: '📚',
      fundingGoal: 150000,
      currentFunding: 120000,
      minInvestment: 8000,
      stage: { zh: 'B轮', en: 'Series B', ko: 'B 라운드', vi: 'Vòng B' },
      investors: 15,
      progress: 80,
      creditScore: 95,
      deposit: 15000,
      deadline: '15天',
      milestones: 3,
      platformFee: 3,
      returnType: { zh: '股权代币+分红', en: 'Equity Token + Dividends', ko: '지분 토큰 + 배당', vi: 'Token cổ phần + Cổ tức' },
      buybackPeriod: { zh: '3年', en: '3 years', ko: '3년', vi: '3 năm' },
    },
  ];

  const features = [
    { icon: Shield, text: { zh: '平台监管', en: 'Platform Supervision', ko: '플랫폼 감독', vi: 'Giám sát nền tảng' } },
    { icon: Target, text: { zh: '分阶段释放', en: 'Milestone Release', ko: '단계별 출시', vi: 'Phát hành theo giai đoạn' } },
    { icon: TrendingUp, text: { zh: '项目评估', en: 'Project Assessment', ko: '프로젝트 평가', vi: 'Đánh giá dự án' } },
    { icon: Users, text: { zh: '信用体系', en: 'Credit System', ko: '신용 시스템', vi: 'Hệ thống tín dụng' } },
  ];

  return (
    <div className="space-y-1">
      {/* 搜索框 */}
      <div className="relative w-full">
        <div className="relative flex items-center w-full rounded-lg border border-gray-400 bg-white shadow-sm transition-colors focus-within:border-purple-500">
          <input
            type="text"
            placeholder={translations.searchPlaceholder[language]}
            className="flex-1 py-2 px-3 pr-10 outline-none text-sm text-gray-700 bg-transparent placeholder-gray-400 h-9 rounded-lg"
          />
          <div className="absolute right-3 text-gray-500 pointer-events-none">
            <Search size={18} strokeWidth={2.5} />
          </div>
        </div>
      </div>

      {/* 特色功能 */}
      <div className="grid grid-cols-4 gap-1.5">
        {features.map((feature, idx) => (
          <div key={idx} className="flex flex-col items-center gap-0.5 py-1">
            <feature.icon className="w-4 h-4 text-purple-600" strokeWidth={2.5} />
            <span className="text-[9px] text-gray-700 font-bold text-center leading-tight">{feature.text[language]}</span>
          </div>
        ))}
      </div>

      {/* 说明卡片 */}
      <div className="space-y-1">
        <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[10px] text-blue-800 leading-relaxed mb-1">
                <span className="font-bold">{language === 'zh' ? '投资机制：' : 'Investment:'}</span>
                {language === 'zh' 
                  ? '投资资金由平台托管，按项目里程碑分阶段释放。投资人获得项目股权代币，代表持股比例。'
                  : 'Funds held in escrow, released by milestones. Investors receive equity tokens representing ownership.'}
              </p>
              <p className="text-[10px] text-blue-800 leading-relaxed">
                <span className="font-bold">{language === 'zh' ? '回报机制：' : 'Returns:'}</span>
                {language === 'zh' 
                  ? '①项目盈利时按股份自动分红 ②股权代币可在平台交易 ③3年后创业者按约定回购。不履行者扣除保证金+信用黑名单。'
                  : '①Auto dividends by shares ②Trade equity tokens ③Buyback after 3 years. Non-compliance: forfeit deposit + blacklist.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 项目列表 */}
      <div className="space-y-2">
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => goToDetail(project)}
            className={`group relative overflow-hidden rounded-xl p-2 transition-all duration-300 cursor-pointer bg-white
                       border ${selectedProject === project.id ? 'border-purple-400' : 'border-purple-100'}
                       shadow-sm hover:shadow-md active:shadow-sm`}
          >
            <div className="flex gap-2 relative pb-6">
              <div className="w-14 h-14 flex items-center justify-center text-3xl flex-shrink-0 bg-purple-50 rounded-lg">{project.icon}</div>
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="font-bold text-gray-800 text-sm line-clamp-1 flex-1">
                    {project.name[language]}
                  </h3>
                  <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold ml-2">
                    {project.stage[language]}
                  </span>
                </div>
                <p className="text-[10px] text-gray-600 mb-1 line-clamp-1">{project.description[language]}</p>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[10px] text-gray-600">
                    {language === 'zh' ? '目标' : 'Goal'}: <span className="font-bold text-gray-800">{project.fundingGoal.toLocaleString()}π</span>
                  </span>
                  <span className="text-[10px] text-gray-600">|</span>
                  <span className="text-[10px] text-gray-600">
                    {language === 'zh' ? '已筹' : 'Raised'}: <span className="font-bold text-green-600">{project.currentFunding.toLocaleString()}π</span>
                  </span>
                  <span className="text-[10px] text-gray-600">|</span>
                  <span className="text-[10px] text-gray-600">
                    {language === 'zh' ? '起投' : 'Min'}: <span className="font-bold text-blue-600">{project.minInvestment.toLocaleString()}π</span>
                  </span>
                </div>
                <div className="mb-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[9px] text-gray-600">{language === 'zh' ? '融资进度' : 'Progress'}</span>
                    <span className="text-[9px] font-bold text-purple-600">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 h-1.5 rounded-full transition-all" style={{ width: `${project.progress}%` }}></div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[9px] flex-wrap mb-1">
                  <span className="flex items-center gap-0.5 text-gray-600">
                    <Users className="w-3 h-3" />
                    {project.investors}人
                  </span>
                  <span className="flex items-center gap-0.5 text-gray-600">
                    <Award className="w-3 h-3" />
                    {language === 'zh' ? '信用' : 'Credit'}: <span className="font-bold text-green-600">{project.creditScore}</span>
                  </span>
                  <span className="flex items-center gap-0.5 text-gray-600">
                    <Shield className="w-3 h-3" />
                    {language === 'zh' ? '保证金' : 'Deposit'}: <span className="font-bold text-blue-600">{project.deposit.toLocaleString()}π</span>
                  </span>
                  <span className="flex items-center gap-0.5 text-gray-600">
                    <Target className="w-3 h-3" />
                    {project.milestones}{language === 'zh' ? '阶段' : ' stages'}
                  </span>
                  <span className="flex items-center gap-0.5 text-gray-600">
                    <Calendar className="w-3 h-3" />
                    {project.deadline}
                  </span>
                </div>
                <div className="bg-purple-50 rounded px-2 py-1 text-[9px] text-purple-700">
                  <span className="font-bold">{language === 'zh' ? '回报：' : 'Return:'}</span>
                  {project.returnType[language]} • {language === 'zh' ? '回购期' : 'Buyback'}: {project.buybackPeriod[language]}
                </div>
              </div>
            </div>
            <div className="absolute bottom-1 right-1 flex items-center gap-1">
              <span className="text-[9px] text-gray-500">
                {language === 'zh' ? '服务费' : 'Fee'}: {project.platformFee}%
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); goToDetail(project); }}
                className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 active:scale-95 transition-all">
                {language === 'zh' ? '投资' : language === 'en' ? 'Invest' : language === 'ko' ? '투자' : 'Đầu tư'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 发布项目按钮 */}
      <button className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold text-sm">
        {language === 'zh' ? '+ 发布融资项目（需缴纳保证金）' : language === 'en' ? '+ Post Funding Project (Deposit Required)' : language === 'ko' ? '+ 자금 조달 프로젝트 게시 (보증금 필요)' : '+ Đăng dự án (Cần đặt cọc)'}
      </button>
    </div>
  );
};
