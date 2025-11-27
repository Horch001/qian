import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Share2, Shield, Clock, AlertCircle, CheckCircle, Users, FileText, MessageCircle, DollarSign } from 'lucide-react';
import { Language, Translations } from '../types';

interface EscrowDetailPageProps {
  language: Language;
  translations: Translations;
}

export const EscrowDetailPage: React.FC<EscrowDetailPageProps> = ({ language }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const item = location.state?.item || {
    id: '1',
    title: { zh: '交易项目', en: 'Trade Project', ko: '거래 프로젝트', vi: 'Dự án giao dịch' },
    description: { zh: '项目描述', en: 'Project description', ko: '프로젝트 설명', vi: 'Mô tả dự án' },
    icon: '💼',
    amount: 5000,
    platformFee: 150,
    status: { zh: '进行中', en: 'In Progress', ko: '진행 중', vi: 'Đang tiến hành' },
    statusCode: 'progress',
    buyer: { zh: '买家A', en: 'Buyer A', ko: '구매자 A', vi: 'Người mua A' },
    seller: { zh: '卖家B', en: 'Seller B', ko: '판매자 B', vi: 'Người bán B' },
    time: '2小时前',
    deadline: '7天',
  };

  const getStatusColor = (statusCode: string) => {
    switch (statusCode) {
      case 'awaiting': return 'bg-orange-100 text-orange-600';
      case 'progress': return 'bg-blue-100 text-blue-600';
      case 'pending': return 'bg-purple-100 text-purple-600';
      case 'completed': return 'bg-green-100 text-green-600';
      case 'arbitration': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // 交易流程步骤
  const steps = [
    { id: 1, title: { zh: '买家付款', en: 'Buyer Pays', ko: '구매자 결제', vi: 'Người mua thanh toán' }, done: true },
    { id: 2, title: { zh: '卖家交付', en: 'Seller Delivers', ko: '판매자 배송', vi: 'Người bán giao hàng' }, done: item.statusCode !== 'awaiting' },
    { id: 3, title: { zh: '买家确认', en: 'Buyer Confirms', ko: '구매자 확인', vi: 'Người mua xác nhận' }, done: item.statusCode === 'completed' },
    { id: 4, title: { zh: '交易完成', en: 'Completed', ko: '완료', vi: 'Hoàn thành' }, done: item.statusCode === 'completed' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-emerald-100 flex flex-col">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-sm font-bold text-green-600">
            {language === 'zh' ? '交易详情' : language === 'en' ? 'Trade Detail' : language === 'ko' ? '거래 상세' : 'Chi tiết giao dịch'}
          </h1>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Share2 className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-md w-full mx-auto overflow-auto pb-24">
        {/* 交易图标和状态 */}
        <div className="bg-gradient-to-br from-green-200 to-emerald-200 p-6 flex flex-col items-center">
          <span className="text-6xl mb-3">{item.icon}</span>
          <h2 className="text-lg font-bold text-gray-800 mb-2">{item.title?.[language]}</h2>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(item.statusCode)}`}>
            {item.status?.[language]}
          </span>
        </div>

        {/* 金额信息 */}
        <div className="bg-white p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">{language === 'zh' ? '交易金额' : 'Amount'}</p>
              <p className="text-xl font-bold text-green-600">{item.amount?.toLocaleString()}π</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">{language === 'zh' ? '服务费(3%)' : 'Fee(3%)'}</p>
              <p className="text-xl font-bold text-purple-600">{item.platformFee}π</p>
            </div>
          </div>
        </div>

        {/* 交易双方 */}
        <div className="bg-white mt-2 p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-green-600" />
            {language === 'zh' ? '交易双方' : 'Parties'}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">{language === 'zh' ? '买家' : 'Buyer'}</p>
              <p className="font-bold text-blue-600">{item.buyer?.[language]}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">{language === 'zh' ? '卖家' : 'Seller'}</p>
              <p className="font-bold text-orange-600">{item.seller?.[language]}</p>
            </div>
          </div>
        </div>

        {/* 交易流程 */}
        <div className="bg-white mt-2 p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-green-600" />
            {language === 'zh' ? '交易流程' : 'Process'}
          </h3>
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${step.done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                  {step.done ? <CheckCircle className="w-5 h-5" /> : step.id}
                </div>
                <p className={`text-[10px] text-center ${step.done ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
                  {step.title[language]}
                </p>
                {idx < steps.length - 1 && (
                  <div className={`absolute h-0.5 w-full ${step.done ? 'bg-green-500' : 'bg-gray-200'}`} style={{ top: '16px', left: '50%' }}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 项目描述 */}
        <div className="bg-white mt-2 p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-3">{language === 'zh' ? '项目描述' : 'Description'}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{item.description?.[language]}</p>
        </div>

        {/* 时间信息 */}
        <div className="bg-white mt-2 p-4">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{language === 'zh' ? '创建时间' : 'Created'}</span>
            </div>
            <span className="text-sm text-gray-800">{item.time}</span>
          </div>
          {item.deadline && item.deadline !== '-' && (
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                <span>{language === 'zh' ? '剩余时间' : 'Remaining'}</span>
              </div>
              <span className="text-sm font-bold text-orange-600">{item.deadline}</span>
            </div>
          )}
        </div>

        {/* 平台保障 */}
        <div className="bg-white mt-2 p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-600" />
            {language === 'zh' ? '平台保障' : 'Guarantees'}
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>{language === 'zh' ? '资金由平台托管，确认后释放' : 'Funds held until confirmation'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>{language === 'zh' ? '争议可申请平台仲裁' : 'Disputes can be arbitrated'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>{language === 'zh' ? '全程交易记录可追溯' : 'Full transaction history'}</span>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <button 
            onClick={() => navigate('/chat', { state: { targetUser: item.sellerId || item.buyerId, targetName: item.seller?.[language] || item.buyer?.[language] } })}
            className="flex flex-col items-center gap-0.5 px-3"
          >
            <MessageCircle className="w-5 h-5 text-gray-500" />
            <span className="text-[10px] text-gray-500">{language === 'zh' ? '联系' : 'Contact'}</span>
          </button>
          <div className="flex-1 flex gap-2">
            {item.statusCode === 'progress' && (
              <>
                <button className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all">
                  {language === 'zh' ? '申请仲裁' : 'Arbitrate'}
                </button>
                <button className="flex-1 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all">
                  {language === 'zh' ? '确认收货' : 'Confirm'}
                </button>
              </>
            )}
            {item.statusCode === 'awaiting' && (
              <button className="flex-1 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all">
                {language === 'zh' ? '立即付款' : 'Pay Now'}
              </button>
            )}
            {item.statusCode === 'completed' && (
              <button className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all">
                {language === 'zh' ? '评价交易' : 'Rate'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
