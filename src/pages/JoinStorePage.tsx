import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Store, User, Building2, Package, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Language, Translations } from '../types';

interface JoinStorePageProps {
  language: Language;
  translations: Translations;
}

export const JoinStorePage: React.FC<JoinStorePageProps> = ({ language }) => {
  const navigate = useNavigate();
  const [userBalance, setUserBalance] = useState(0);
  const [formData, setFormData] = useState({
    storeName: '',
    category: '',
    businessType: 'personal', // personal or enterprise
    description: '',
    contactName: '',
    contactPhone: '',
    idNumber: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const getText = (obj: { [key: string]: string }) => obj[language] || obj.zh;

  // 入驻板块选项
  const categories = [
    { value: 'physical', label: { zh: '实体商城', en: 'Physical Mall', ko: '실물 쇼핑몰', vi: 'Trung tâm mua sắm' } },
    { value: 'virtual', label: { zh: '虚拟商城', en: 'Virtual Mall', ko: '가상 쇼핑몰', vi: 'Trung tâm ảo' } },
    { value: 'service', label: { zh: '上门服务', en: 'Home Service', ko: '방문 서비스', vi: 'Dịch vụ tận nhà' } },
    { value: 'offline', label: { zh: '线下娱乐', en: 'Offline Entertainment', ko: '오프라인 엔터테인먼트', vi: 'Giải trí ngoại tuyến' } },
    { value: 'course', label: { zh: '知识付费', en: 'Paid Courses', ko: '유료 강좌', vi: 'Khóa học trả phí' } },
    { value: 'detective', label: { zh: '私人侦探', en: 'Private Detective', ko: '사립 탐정', vi: 'Thám tử tư' } },
    { value: 'house', label: { zh: '房屋租赁', en: 'House Lease', ko: '주택 임대', vi: 'Cho thuê nhà' } },
  ];

  useEffect(() => {
    // 获取用户余额
    const piUser = localStorage.getItem('piUserInfo');
    const emailUser = localStorage.getItem('userInfo');
    const user = piUser ? JSON.parse(piUser) : emailUser ? JSON.parse(emailUser) : null;
    if (user) {
      setUserBalance(parseFloat(user.balance) || 0);
    }
  }, []);

  const handleSubmit = () => {
    setError('');
    
    // 检查余额
    if (userBalance < 1) {
      setError(getText({
        zh: '账户余额不足1π，无法申请入驻。请先充值以确认您拥有Pi主网钱包。',
        en: 'Balance less than 1π. Please deposit first to verify you have a Pi mainnet wallet.',
        ko: '잔액이 1π 미만입니다. Pi 메인넷 지갑을 확인하려면 먼저 충전하세요.',
        vi: 'Số dư dưới 1π. Vui lòng nạp tiền trước để xác minh bạn có ví Pi mainnet.'
      }));
      return;
    }

    // 验证表单
    if (!formData.storeName.trim()) {
      setError(getText({ zh: '请输入店铺名称', en: 'Please enter store name', ko: '상점 이름을 입력하세요', vi: 'Vui lòng nhập tên cửa hàng' }));
      return;
    }
    if (!formData.category) {
      setError(getText({ zh: '请选择入驻板块', en: 'Please select category', ko: '카테고리를 선택하세요', vi: 'Vui lòng chọn danh mục' }));
      return;
    }
    if (!formData.description.trim()) {
      setError(getText({ zh: '请描述您提供的商品或服务', en: 'Please describe your products/services', ko: '상품/서비스를 설명하세요', vi: 'Vui lòng mô tả sản phẩm/dịch vụ' }));
      return;
    }
    if (!formData.contactName.trim()) {
      setError(getText({ zh: '请输入联系人姓名', en: 'Please enter contact name', ko: '연락처 이름을 입력하세요', vi: 'Vui lòng nhập tên liên hệ' }));
      return;
    }
    if (!formData.contactPhone.trim()) {
      setError(getText({ zh: '请输入联系电话', en: 'Please enter contact phone', ko: '연락처 전화번호를 입력하세요', vi: 'Vui lòng nhập số điện thoại' }));
      return;
    }

    // 提交成功
    setShowSuccess(true);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-300 flex flex-col">
        <header className="bg-white/90 backdrop-blur-sm sticky top-0 z-40 border-b border-gray-200">
          <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
            <button onClick={() => navigate('/profile')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-sm font-bold text-purple-600">
              {getText({ zh: '申请结果', en: 'Application Result', ko: '신청 결과', vi: 'Kết quả đăng ký' })}
            </h1>
            <div className="w-9"></div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-lg">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {getText({ zh: '申请已提交', en: 'Application Submitted', ko: '신청 완료', vi: 'Đã gửi đăng ký' })}
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              {getText({ 
                zh: '您的入驻申请已提交成功，我们将在1-3个工作日内审核。审核结果将通过消息通知您。', 
                en: 'Your application has been submitted. We will review it within 1-3 business days. Results will be sent via message.',
                ko: '신청이 제출되었습니다. 1-3 영업일 내에 검토하겠습니다. 결과는 메시지로 알려드립니다.',
                vi: 'Đăng ký của bạn đã được gửi. Chúng tôi sẽ xem xét trong 1-3 ngày làm việc. Kết quả sẽ được gửi qua tin nhắn.'
              })}
            </p>
            <button
              onClick={() => navigate('/profile')}
              className="w-full py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors"
            >
              {getText({ zh: '返回个人中心', en: 'Back to Profile', ko: '프로필로 돌아가기', vi: 'Quay lại hồ sơ' })}
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-300 flex flex-col">
      <header className="bg-white/90 backdrop-blur-sm sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-sm font-bold text-purple-600">
            {getText({ zh: '商家入驻申请', en: 'Seller Application', ko: '판매자 신청', vi: 'Đăng ký bán hàng' })}
          </h1>
          <div className="w-9"></div>
        </div>
      </header>

      <main className="flex-1 max-w-md w-full mx-auto overflow-auto pb-24 p-4">
        {/* 余额提示 */}
        <div className={`rounded-xl p-4 mb-4 ${userBalance >= 1 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-start gap-3">
            <AlertCircle className={`w-5 h-5 mt-0.5 ${userBalance >= 1 ? 'text-green-600' : 'text-red-600'}`} />
            <div>
              <p className={`font-bold text-sm ${userBalance >= 1 ? 'text-green-800' : 'text-red-800'}`}>
                {getText({ zh: '当前余额', en: 'Current Balance', ko: '현재 잔액', vi: 'Số dư hiện tại' })}: {userBalance}π
              </p>
              <p className={`text-xs mt-1 ${userBalance >= 1 ? 'text-green-600' : 'text-red-600'}`}>
                {userBalance >= 1 
                  ? getText({ zh: '✓ 余额满足入驻条件', en: '✓ Balance meets requirements', ko: '✓ 잔액이 요구 사항을 충족합니다', vi: '✓ Số dư đáp ứng yêu cầu' })
                  : getText({ zh: '⚠️ 账户余额需≥1π才能申请入驻（用于验证Pi主网钱包）', en: '⚠️ Balance must be ≥1π to apply (to verify Pi mainnet wallet)', ko: '⚠️ 신청하려면 잔액이 ≥1π이어야 합니다', vi: '⚠️ Số dư phải ≥1π để đăng ký' })
                }
              </p>
            </div>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* 申请表单 */}
        <div className="bg-white rounded-xl p-4 space-y-4">
          {/* 店铺名称 */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 font-bold text-sm mb-2">
              <Store className="w-4 h-4" />
              {getText({ zh: '店铺名称', en: 'Store Name', ko: '상점 이름', vi: 'Tên cửa hàng' })} *
            </label>
            <input
              type="text"
              value={formData.storeName}
              onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
              placeholder={getText({ zh: '请输入店铺名称', en: 'Enter store name', ko: '상점 이름 입력', vi: 'Nhập tên cửa hàng' })}
              className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
          </div>

          {/* 入驻板块 */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 font-bold text-sm mb-2">
              <Package className="w-4 h-4" />
              {getText({ zh: '入驻板块', en: 'Category', ko: '카테고리', vi: 'Danh mục' })} *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            >
              <option value="">{getText({ zh: '请选择入驻板块', en: 'Select category', ko: '카테고리 선택', vi: 'Chọn danh mục' })}</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label[language]}</option>
              ))}
            </select>
          </div>

          {/* 主体类型 */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 font-bold text-sm mb-2">
              {formData.businessType === 'personal' ? <User className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
              {getText({ zh: '主体类型', en: 'Business Type', ko: '사업 유형', vi: 'Loại hình kinh doanh' })} *
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, businessType: 'personal' })}
                className={`flex-1 py-3 rounded-lg font-bold text-sm transition-colors ${
                  formData.businessType === 'personal' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <User className="w-4 h-4 inline mr-1" />
                {getText({ zh: '个人', en: 'Personal', ko: '개인', vi: 'Cá nhân' })}
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, businessType: 'enterprise' })}
                className={`flex-1 py-3 rounded-lg font-bold text-sm transition-colors ${
                  formData.businessType === 'enterprise' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Building2 className="w-4 h-4 inline mr-1" />
                {getText({ zh: '企业', en: 'Enterprise', ko: '기업', vi: 'Doanh nghiệp' })}
              </button>
            </div>
          </div>

          {/* 商品/服务描述 */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 font-bold text-sm mb-2">
              <FileText className="w-4 h-4" />
              {getText({ zh: '商品/服务描述', en: 'Products/Services', ko: '상품/서비스', vi: 'Sản phẩm/Dịch vụ' })} *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={getText({ zh: '请描述您将提供的商品或服务', en: 'Describe your products or services', ko: '상품 또는 서비스를 설명하세요', vi: 'Mô tả sản phẩm hoặc dịch vụ của bạn' })}
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-none"
            />
          </div>

          {/* 联系人姓名 */}
          <div>
            <label className="text-gray-700 font-bold text-sm mb-2 block">
              {getText({ zh: '联系人姓名', en: 'Contact Name', ko: '연락처 이름', vi: 'Tên liên hệ' })} *
            </label>
            <input
              type="text"
              value={formData.contactName}
              onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
              placeholder={getText({ zh: '请输入联系人姓名', en: 'Enter contact name', ko: '연락처 이름 입력', vi: 'Nhập tên liên hệ' })}
              className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
          </div>

          {/* 联系电话 */}
          <div>
            <label className="text-gray-700 font-bold text-sm mb-2 block">
              {getText({ zh: '联系电话', en: 'Contact Phone', ko: '연락처 전화', vi: 'Số điện thoại' })} *
            </label>
            <input
              type="tel"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              placeholder={getText({ zh: '请输入联系电话', en: 'Enter contact phone', ko: '연락처 전화 입력', vi: 'Nhập số điện thoại' })}
              className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
          </div>

          {/* 身份证号（可选） */}
          <div>
            <label className="text-gray-700 font-bold text-sm mb-2 block">
              {getText({ zh: '身份证号（选填）', en: 'ID Number (Optional)', ko: '신분증 번호 (선택)', vi: 'Số CMND (Tùy chọn)' })}
            </label>
            <input
              type="text"
              value={formData.idNumber}
              onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
              placeholder={getText({ zh: '请输入身份证号', en: 'Enter ID number', ko: '신분증 번호 입력', vi: 'Nhập số CMND' })}
              className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
          </div>
        </div>
      </main>

      {/* 底部提交按钮 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="max-w-md mx-auto px-4 py-3">
          <button
            onClick={handleSubmit}
            disabled={userBalance < 1}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {getText({ zh: '提交申请', en: 'Submit Application', ko: '신청 제출', vi: 'Gửi đăng ký' })}
          </button>
        </div>
      </div>
    </div>
  );
};
