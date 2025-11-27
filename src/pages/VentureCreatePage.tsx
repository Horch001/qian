import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Info, Target } from 'lucide-react';
import { Language, Translations } from '../types';

interface VentureCreatePageProps {
  language: Language;
  translations: Translations;
}

export const VentureCreatePage: React.FC<VentureCreatePageProps> = ({ language }) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fundingGoal, setFundingGoal] = useState('');
  const [minInvestment, setMinInvestment] = useState('');
  const [deposit, setDeposit] = useState('');
  const [stage, setStage] = useState('pre-a');
  const [milestones, setMilestones] = useState('3');
  const [deadline, setDeadline] = useState('30');

  const getText = (obj: { [key: string]: string }) => obj[language] || obj.zh;

  const handleSubmit = () => {
    if (!name.trim()) {
      alert(getText({ zh: '请输入项目名称', en: 'Please enter project name', ko: '프로젝트 이름을 입력하세요', vi: 'Vui lòng nhập tên dự án' }));
      return;
    }
    if (!description.trim()) {
      alert(getText({ zh: '请输入项目描述', en: 'Please enter project description', ko: '프로젝트 설명을 입력하세요', vi: 'Vui lòng nhập mô tả dự án' }));
      return;
    }
    if (!fundingGoal || parseFloat(fundingGoal) <= 0) {
      alert(getText({ zh: '请输入有效的融资目标', en: 'Please enter valid funding goal', ko: '유효한 자금 목표를 입력하세요', vi: 'Vui lòng nhập mục tiêu huy động hợp lệ' }));
      return;
    }
    if (!deposit || parseFloat(deposit) <= 0) {
      alert(getText({ zh: '请输入保证金金额', en: 'Please enter deposit amount', ko: '보증금을 입력하세요', vi: 'Vui lòng nhập số tiền đặt cọc' }));
      return;
    }

    alert(getText({ zh: '融资项目发布成功！请等待平台审核。', en: 'Project submitted! Please wait for review.', ko: '프로젝트가 제출되었습니다! 검토를 기다려 주세요.', vi: 'Dự án đã được gửi! Vui lòng chờ xét duyệt.' }));
    navigate('/venture-capital');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-300 flex flex-col">
      <header className="bg-white/90 backdrop-blur-sm sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-sm font-bold text-gray-800">
            {getText({ zh: '发布融资项目', en: 'Post Funding Project', ko: '자금 조달 프로젝트 게시', vi: 'Đăng dự án huy động vốn' })}
          </h1>
          <div className="w-9"></div>
        </div>
      </header>

      <main className="flex-1 max-w-md w-full mx-auto p-4 space-y-4">
        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
          <div className="flex items-start gap-2">
            <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-purple-800 mb-1">
                {getText({ zh: '平台监管融资', en: 'Platform Supervised Funding', ko: '플랫폼 감독 자금 조달', vi: 'Huy động vốn có giám sát' })}
              </p>
              <p className="text-xs text-purple-700">
                {getText({ zh: '资金按里程碑分阶段释放，保障投资人权益。需缴纳保证金，项目完成后退还。', en: 'Funds released by milestones. Deposit required, refunded after completion.', ko: '자금은 마일스톤별로 지급됩니다. 보증금 필요, 완료 후 환불.', vi: 'Tiền được giải ngân theo giai đoạn. Cần đặt cọc, hoàn trả sau khi hoàn thành.' })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 space-y-4 shadow-sm">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              {getText({ zh: '项目名称', en: 'Project Name', ko: '프로젝트 이름', vi: 'Tên dự án' })}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder={getText({ zh: '请输入项目名称', en: 'Enter project name', ko: '프로젝트 이름 입력', vi: 'Nhập tên dự án' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500" />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              {getText({ zh: '项目描述', en: 'Description', ko: '설명', vi: 'Mô tả' })}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
              placeholder={getText({ zh: '详细描述项目内容、商业模式、团队背景等', en: 'Describe project, business model, team background', ko: '프로젝트, 비즈니스 모델, 팀 배경 설명', vi: 'Mô tả dự án, mô hình kinh doanh, đội ngũ' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {getText({ zh: '融资目标 (π)', en: 'Funding Goal (π)', ko: '자금 목표 (π)', vi: 'Mục tiêu (π)' })}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input type="number" value={fundingGoal} onChange={(e) => setFundingGoal(e.target.value)} placeholder="100000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {getText({ zh: '最低投资 (π)', en: 'Min Investment (π)', ko: '최소 투자 (π)', vi: 'Đầu tư tối thiểu (π)' })}
              </label>
              <input type="number" value={minInvestment} onChange={(e) => setMinInvestment(e.target.value)} placeholder="5000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {getText({ zh: '融资轮次', en: 'Funding Stage', ko: '자금 조달 단계', vi: 'Vòng gọi vốn' })}
              </label>
              <select value={stage} onChange={(e) => setStage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500">
                <option value="seed">{getText({ zh: '种子轮', en: 'Seed', ko: '시드', vi: 'Vòng hạt giống' })}</option>
                <option value="pre-a">{getText({ zh: 'Pre-A轮', en: 'Pre-Series A', ko: 'Pre-A', vi: 'Pre-A' })}</option>
                <option value="a">{getText({ zh: 'A轮', en: 'Series A', ko: 'A 라운드', vi: 'Vòng A' })}</option>
                <option value="b">{getText({ zh: 'B轮', en: 'Series B', ko: 'B 라운드', vi: 'Vòng B' })}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {getText({ zh: '里程碑阶段', en: 'Milestones', ko: '마일스톤', vi: 'Giai đoạn' })}
              </label>
              <select value={milestones} onChange={(e) => setMilestones(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500">
                <option value="2">2 {getText({ zh: '阶段', en: 'stages', ko: '단계', vi: 'giai đoạn' })}</option>
                <option value="3">3 {getText({ zh: '阶段', en: 'stages', ko: '단계', vi: 'giai đoạn' })}</option>
                <option value="4">4 {getText({ zh: '阶段', en: 'stages', ko: '단계', vi: 'giai đoạn' })}</option>
                <option value="5">5 {getText({ zh: '阶段', en: 'stages', ko: '단계', vi: 'giai đoạn' })}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {getText({ zh: '保证金 (π)', en: 'Deposit (π)', ko: '보증금 (π)', vi: 'Đặt cọc (π)' })}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input type="number" value={deposit} onChange={(e) => setDeposit(e.target.value)} placeholder="10000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {getText({ zh: '融资期限', en: 'Deadline', ko: '마감일', vi: 'Hạn chót' })}
              </label>
              <select value={deadline} onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500">
                <option value="15">15 {getText({ zh: '天', en: 'days', ko: '일', vi: 'ngày' })}</option>
                <option value="30">30 {getText({ zh: '天', en: 'days', ko: '일', vi: 'ngày' })}</option>
                <option value="45">45 {getText({ zh: '天', en: 'days', ko: '일', vi: 'ngày' })}</option>
                <option value="60">60 {getText({ zh: '天', en: 'days', ko: '일', vi: 'ngày' })}</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-800">
              {getText({ zh: '发布后需支付保证金，项目成功完成后全额退还。如未按约定履行，保证金将用于赔偿投资人。', en: 'Deposit required after posting, fully refunded upon completion. Non-compliance results in forfeiture.', ko: '게시 후 보증금 필요, 완료 시 전액 환불. 미이행 시 몰수.', vi: 'Cần đặt cọc sau khi đăng, hoàn trả đầy đủ khi hoàn thành. Vi phạm sẽ bị tịch thu.' })}
            </p>
          </div>
        </div>

        <button onClick={handleSubmit}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all">
          {getText({ zh: '提交审核', en: 'Submit for Review', ko: '검토 제출', vi: 'Gửi xét duyệt' })}
        </button>
      </main>
    </div>
  );
};
