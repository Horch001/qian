import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Info } from 'lucide-react';
import { Language, Translations } from '../types';

interface EscrowCreatePageProps {
  language: Language;
  translations: Translations;
}

export const EscrowCreatePage: React.FC<EscrowCreatePageProps> = ({ language, translations }) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [deadline, setDeadline] = useState('7');
  const [sellerUsername, setSellerUsername] = useState('');

  const getText = (obj: { [key: string]: string }) => obj[language] || obj.zh;

  const handleSubmit = () => {
    if (!title.trim()) {
      alert(getText({ zh: '请输入交易标题', en: 'Please enter trade title', ko: '거래 제목을 입력하세요', vi: 'Vui lòng nhập tiêu đề' }));
      return;
    }
    if (!description.trim()) {
      alert(getText({ zh: '请输入交易详情', en: 'Please enter trade details', ko: '거래 세부 정보를 입력하세요', vi: 'Vui lòng nhập chi tiết' }));
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      alert(getText({ zh: '请输入有效的交易金额', en: 'Please enter valid amount', ko: '유효한 금액을 입력하세요', vi: 'Vui lòng nhập số tiền hợp lệ' }));
      return;
    }
    if (!sellerUsername.trim()) {
      alert(getText({ zh: '请输入卖家用户名', en: 'Please enter seller username', ko: '판매자 사용자 이름을 입력하세요', vi: 'Vui lòng nhập tên người bán' }));
      return;
    }

    // 保存交易到localStorage
    const trades = JSON.parse(localStorage.getItem('escrowTrades') || '[]');
    const newTrade = {
      id: Date.now().toString(),
      title,
      description,
      amount: parseFloat(amount),
      platformFee: Math.round(parseFloat(amount) * 0.03),
      deadline: `${deadline}天`,
      seller: sellerUsername,
      status: 'awaiting',
      createdAt: new Date().toISOString(),
    };
    trades.push(newTrade);
    localStorage.setItem('escrowTrades', JSON.stringify(trades));

    alert(getText({ zh: '担保交易创建成功！', en: 'Escrow trade created!', ko: '에스크로 거래가 생성되었습니다!', vi: 'Đã tạo giao dịch ký quỹ!' }));
    navigate('/escrow-trade');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-300 flex flex-col">
      <header className="bg-white/90 backdrop-blur-sm sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-sm font-bold text-gray-800">
            {getText({ zh: '创建担保交易', en: 'Create Escrow Trade', ko: '에스크로 거래 생성', vi: 'Tạo giao dịch ký quỹ' })}
          </h1>
          <div className="w-9"></div>
        </div>
      </header>

      <main className="flex-1 max-w-md w-full mx-auto p-4 space-y-4">
        {/* 说明卡片 */}
        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
          <div className="flex items-start gap-2">
            <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-purple-800 mb-1">
                {getText({ zh: '平台担保交易', en: 'Platform Escrow', ko: '플랫폼 에스크로', vi: 'Ký quỹ nền tảng' })}
              </p>
              <p className="text-xs text-purple-700">
                {getText({ 
                  zh: '资金由平台托管，交易完成后自动释放给卖家，保障双方权益。', 
                  en: 'Funds held by platform, released to seller after completion.',
                  ko: '플랫폼이 자금을 보관하고 완료 후 판매자에게 지급합니다.',
                  vi: 'Tiền được nền tảng giữ, chuyển cho người bán sau khi hoàn thành.'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* 表单 */}
        <div className="bg-white rounded-xl p-4 space-y-4 shadow-sm">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              {getText({ zh: '交易标题', en: 'Trade Title', ko: '거래 제목', vi: 'Tiêu đề giao dịch' })}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={getText({ zh: '请输入交易标题', en: 'Enter trade title', ko: '거래 제목 입력', vi: 'Nhập tiêu đề' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              {getText({ zh: '担保详情', en: 'Trade Details', ko: '거래 세부 정보', vi: 'Chi tiết giao dịch' })}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={getText({ zh: '请详细描述交易内容、要求、交付标准等', en: 'Describe trade content, requirements, delivery standards', ko: '거래 내용, 요구 사항, 배송 기준 설명', vi: 'Mô tả nội dung, yêu cầu, tiêu chuẩn giao hàng' })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              {getText({ zh: '交易金额 (π)', en: 'Amount (π)', ko: '금액 (π)', vi: 'Số tiền (π)' })}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
            />
            {amount && parseFloat(amount) > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {getText({ zh: '平台服务费', en: 'Platform fee', ko: '플랫폼 수수료', vi: 'Phí nền tảng' })}: {Math.round(parseFloat(amount) * 0.03)}π (3%)
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              {getText({ zh: '卖家用户名', en: 'Seller Username', ko: '판매자 사용자 이름', vi: 'Tên người bán' })}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              value={sellerUsername}
              onChange={(e) => {
                const value = e.target.value;
                if (/^[a-zA-Z0-9\u4e00-\u9fa5]*$/.test(value)) {
                  setSellerUsername(value);
                }
              }}
              placeholder={getText({ zh: '请输入卖家用户名', en: 'Enter seller username', ko: '판매자 사용자 이름 입력', vi: 'Nhập tên người bán' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              {getText({ zh: '交付期限', en: 'Deadline', ko: '마감일', vi: 'Hạn chót' })}
            </label>
            <select
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
            >
              <option value="3">3 {getText({ zh: '天', en: 'days', ko: '일', vi: 'ngày' })}</option>
              <option value="7">7 {getText({ zh: '天', en: 'days', ko: '일', vi: 'ngày' })}</option>
              <option value="14">14 {getText({ zh: '天', en: 'days', ko: '일', vi: 'ngày' })}</option>
              <option value="30">30 {getText({ zh: '天', en: 'days', ko: '일', vi: 'ngày' })}</option>
            </select>
          </div>
        </div>

        {/* 提示信息 */}
        <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-800">
              {getText({ 
                zh: '创建后需要支付交易金额到平台托管账户，卖家确认后开始交易。如有纠纷，平台将进行仲裁。', 
                en: 'After creation, pay to platform escrow. Trade starts after seller confirms. Platform arbitrates disputes.',
                ko: '생성 후 플랫폼 에스크로에 지불하세요. 판매자 확인 후 거래가 시작됩니다.',
                vi: 'Sau khi tạo, thanh toán vào ký quỹ. Giao dịch bắt đầu sau khi người bán xác nhận.'
              })}
            </p>
          </div>
        </div>

        {/* 提交按钮 */}
        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all"
        >
          {getText({ zh: '创建担保交易', en: 'Create Escrow Trade', ko: '에스크로 거래 생성', vi: 'Tạo giao dịch ký quỹ' })}
        </button>
      </main>
    </div>
  );
};
