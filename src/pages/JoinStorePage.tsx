import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Store, User, Building2, Package, FileText, AlertCircle, CheckCircle, Loader2, Mail, Upload, CreditCard } from 'lucide-react';
import { Language, Translations } from '../types';
import { merchantApi } from '../services/api';

interface JoinStorePageProps {
  language: Language;
  translations: Translations;
}

export const JoinStorePage: React.FC<JoinStorePageProps> = ({ language }) => {
  const navigate = useNavigate();
  const [userBalance, setUserBalance] = useState(0);
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    storeName: '',
    category: '',
    businessType: 'personal',
    description: '',
    contactName: '',
    contactPhone: '',
    email: '',
    realName: '',
    idCard: '',
    idCardImage: '',
    businessLicense: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getText = (obj: { [key: string]: string }) => obj[language] || obj.zh;

  // 入驻板块选项
  const categories = [
    { value: 'PHYSICAL', label: { zh: '实体商城', en: 'Physical Mall', ko: '실물 쇼핑몰', vi: 'Trung tâm mua sắm' } },
    { value: 'VIRTUAL', label: { zh: '虚拟商城', en: 'Virtual Mall', ko: '가상 쇼핑몰', vi: 'Trung tâm ảo' } },
    { value: 'SERVICE', label: { zh: '上门服务', en: 'Home Service', ko: '방문 서비스', vi: 'Dịch vụ tận nhà' }, needsVerification: true },
    { value: 'OFFLINE_PLAY', label: { zh: '线下陪玩', en: 'Offline Play', ko: '오프라인 플레이', vi: 'Chơi offline' }, needsVerification: true },
    { value: 'COURSE', label: { zh: '知识付费', en: 'Paid Courses', ko: '유료 강좌', vi: 'Khóa học trả phí' } },
    { value: 'DETECTIVE', label: { zh: '私人侦探', en: 'Private Detective', ko: '사립 탐정', vi: 'Thám tử tư' } },
    { value: 'HOUSE_LEASE', label: { zh: '房屋租赁', en: 'House Lease', ko: '주택 임대', vi: 'Cho thuê nhà' } },
  ];

  const needsVerification = ['SERVICE', 'OFFLINE_PLAY'].includes(formData.category);

  useEffect(() => {
    const piUser = localStorage.getItem('piUserInfo');
    const emailUser = localStorage.getItem('userInfo');
    const user = piUser ? JSON.parse(piUser) : emailUser ? JSON.parse(emailUser) : null;
    if (user) setUserBalance(parseFloat(user.balance) || 0);
  }, []);


  const handleSubmit = async () => {
    setError('');
    if (userBalance < 1) {
      setError(getText({ zh: '账户余额不足1π，无法申请入驻', en: 'Balance less than 1π', ko: '잔액이 1π 미만입니다', vi: 'Số dư dưới 1π' }));
      return;
    }
    if (!formData.storeName.trim()) {
      setError(getText({ zh: '请输入店铺名称', en: 'Please enter store name', ko: '상점 이름을 입력하세요', vi: 'Vui lòng nhập tên cửa hàng' }));
      return;
    }
    if (!formData.category) {
      setError(getText({ zh: '请选择入驻板块', en: 'Please select category', ko: '카테고리를 선택하세요', vi: 'Vui lòng chọn danh mục' }));
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError(getText({ zh: '请输入有效的邮箱地址', en: 'Please enter valid email', ko: '유효한 이메일을 입력하세요', vi: 'Vui lòng nhập email hợp lệ' }));
      return;
    }
    if (needsVerification) {
      if (!formData.realName.trim()) {
        setError(getText({ zh: '上门服务/线下陪玩需要填写真实姓名', en: 'Real name required for this category', ko: '이 카테고리에는 실명이 필요합니다', vi: 'Cần tên thật cho danh mục này' }));
        return;
      }
      if (!formData.idCard.trim()) {
        setError(getText({ zh: '请填写身份证号', en: 'Please enter ID number', ko: '신분증 번호를 입력하세요', vi: 'Vui lòng nhập số CMND' }));
        return;
      }
      if (!formData.idCardImage) {
        setError(getText({ zh: '请上传身份证正面照片', en: 'Please upload ID card image', ko: '신분증 사진을 업로드하세요', vi: 'Vui lòng tải lên ảnh CMND' }));
        return;
      }
    }
    if (formData.businessType === 'enterprise' && !formData.businessLicense) {
      setError(getText({ zh: '企业入驻需要上传营业执照', en: 'Business license required for enterprise', ko: '기업은 사업자 등록증이 필요합니다', vi: 'Cần giấy phép kinh doanh cho doanh nghiệp' }));
      return;
    }

    setIsSubmitting(true);
    try {
      await merchantApi.apply({
        shopName: formData.storeName,
        description: formData.description,
        contactName: formData.contactName,
        contactPhone: formData.contactPhone,
        category: formData.category,
        businessType: formData.businessType,
        email: formData.email,
        realName: formData.realName || undefined,
        idCard: formData.idCard || undefined,
        idCardImage: formData.idCardImage || undefined,
        businessLicense: formData.businessLicense || undefined,
      });
      setShowSuccess(true);
    } catch (err: any) {
      setError(err.message || getText({ zh: '提交失败，请重试', en: 'Submit failed', ko: '제출 실패', vi: 'Gửi thất bại' }));
    } finally {
      setIsSubmitting(false);
    }
  };


  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-600 to-pink-500 flex justify-center">
        <div className="w-full max-w-md flex flex-col min-h-screen">
          <header className="bg-white/10 backdrop-blur-sm p-4 flex items-center gap-4">
            <button onClick={() => navigate('/profile')} className="text-white"><ArrowLeft size={24} /></button>
            <h1 className="text-lg font-bold text-white">{getText({ zh: '申请结果', en: 'Result', ko: '결과', vi: 'Kết quả' })}</h1>
          </header>
          <main className="flex-1 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-8 w-full text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">{getText({ zh: '申请已提交', en: 'Submitted', ko: '제출됨', vi: 'Đã gửi' })}</h2>
              <p className="text-gray-600 text-sm mb-6">{getText({ zh: '我们将在1-3个工作日内审核，结果将通过消息通知您', en: 'We will review within 1-3 days', ko: '1-3일 내에 검토하겠습니다', vi: 'Chúng tôi sẽ xem xét trong 1-3 ngày' })}</p>
              <button onClick={() => navigate('/profile')} className="w-full py-3 bg-purple-600 text-white rounded-lg font-bold">{getText({ zh: '返回', en: 'Back', ko: '돌아가기', vi: 'Quay lại' })}</button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 to-pink-500 flex justify-center">
      <div className="w-full max-w-md flex flex-col min-h-screen">
        <header className="bg-white/10 backdrop-blur-sm p-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-white"><ArrowLeft size={24} /></button>
          <h1 className="text-lg font-bold text-white">{getText({ zh: '商家入驻申请', en: 'Seller Application', ko: '판매자 신청', vi: 'Đăng ký bán hàng' })}</h1>
        </header>

        <main className="flex-1 overflow-auto pb-24 p-4">
        {/* 余额提示 */}
        <div className={`rounded-xl p-3 mb-4 ${userBalance >= 1 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
          <p className="text-white text-sm">{getText({ zh: '当前余额', en: 'Balance', ko: '잔액', vi: 'Số dư' })}: {userBalance}π {userBalance >= 1 ? '✓' : '(需≥1π)'}</p>
        </div>

        {error && <div className="bg-red-500/20 rounded-xl p-3 mb-4"><p className="text-white text-sm">{error}</p></div>}

        <div className="bg-white rounded-xl p-4 space-y-4">
          {/* 店铺名称 */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 font-bold text-sm mb-2"><Store className="w-4 h-4" />{getText({ zh: '店铺名称', en: 'Store Name', ko: '상점 이름', vi: 'Tên cửa hàng' })} *</label>
            <input type="text" value={formData.storeName} onChange={(e) => setFormData({ ...formData, storeName: e.target.value })} placeholder={getText({ zh: '请输入店铺名称', en: 'Enter store name', ko: '상점 이름 입력', vi: 'Nhập tên cửa hàng' })} className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm" />
          </div>

          {/* 入驻板块 */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 font-bold text-sm mb-2"><Package className="w-4 h-4" />{getText({ zh: '入驻板块', en: 'Category', ko: '카테고리', vi: 'Danh mục' })} *</label>
            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm">
              <option value="">{getText({ zh: '请选择', en: 'Select', ko: '선택', vi: 'Chọn' })}</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label[language]}</option>
              ))}
            </select>
            {needsVerification && <p className="text-orange-500 text-xs mt-1">{getText({ zh: '⚠️ 该板块需要实名认证', en: '⚠️ This category requires ID verification', ko: '⚠️ 이 카테고리는 신원 확인이 필요합니다', vi: '⚠️ Danh mục này cần xác minh danh tính' })}</p>}
          </div>

          {/* 邮箱 */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 font-bold text-sm mb-2"><Mail className="w-4 h-4" />{getText({ zh: '邮箱', en: 'Email', ko: '이메일', vi: 'Email' })} *</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="example@email.com" className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm" />
          </div>

          {/* 主体类型 */}
          <div>
            <label className="text-gray-700 font-bold text-sm mb-2 block">{getText({ zh: '主体类型', en: 'Business Type', ko: '사업 유형', vi: 'Loại hình' })} *</label>
            <div className="flex gap-3">
              <button type="button" onClick={() => setFormData({ ...formData, businessType: 'personal' })} className={`flex-1 py-3 rounded-lg font-bold text-sm ${formData.businessType === 'personal' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}><User className="w-4 h-4 inline mr-1" />{getText({ zh: '个人', en: 'Personal', ko: '개인', vi: 'Cá nhân' })}</button>
              <button type="button" onClick={() => setFormData({ ...formData, businessType: 'enterprise' })} className={`flex-1 py-3 rounded-lg font-bold text-sm ${formData.businessType === 'enterprise' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}><Building2 className="w-4 h-4 inline mr-1" />{getText({ zh: '企业', en: 'Enterprise', ko: '기업', vi: 'Doanh nghiệp' })}</button>
            </div>
          </div>


          {/* 实名认证信息 - 上门服务/线下陪玩需要 */}
          {needsVerification && (
            <>
              <div>
                <label className="flex items-center gap-2 text-gray-700 font-bold text-sm mb-2"><CreditCard className="w-4 h-4" />{getText({ zh: '真实姓名', en: 'Real Name', ko: '실명', vi: 'Tên thật' })} *</label>
                <input type="text" value={formData.realName} onChange={(e) => setFormData({ ...formData, realName: e.target.value })} placeholder={getText({ zh: '请输入真实姓名', en: 'Enter real name', ko: '실명 입력', vi: 'Nhập tên thật' })} className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-gray-700 font-bold text-sm mb-2 block">{getText({ zh: '身份证号', en: 'ID Number', ko: '신분증 번호', vi: 'Số CMND' })} *</label>
                <input type="text" value={formData.idCard} onChange={(e) => setFormData({ ...formData, idCard: e.target.value })} placeholder={getText({ zh: '请输入身份证号', en: 'Enter ID number', ko: '신분증 번호 입력', vi: 'Nhập số CMND' })} className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-gray-700 font-bold text-sm mb-2 block">{getText({ zh: '身份证正面照片', en: 'ID Card Image', ko: '신분증 사진', vi: 'Ảnh CMND' })} *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {formData.idCardImage ? (
                    <div className="relative">
                      <img src={formData.idCardImage} alt="ID Card" className="max-h-32 mx-auto rounded" />
                      <button onClick={() => setFormData({ ...formData, idCardImage: '' })} className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 text-xs">×</button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">{getText({ zh: '点击上传', en: 'Click to upload', ko: '클릭하여 업로드', vi: 'Nhấp để tải lên' })}</p>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => setFormData({ ...formData, idCardImage: ev.target?.result as string });
                          reader.readAsDataURL(file);
                        }
                      }} />
                    </label>
                  )}
                </div>
              </div>
            </>
          )}

          {/* 营业执照 - 企业需要 */}
          {formData.businessType === 'enterprise' && (
            <div>
              <label className="text-gray-700 font-bold text-sm mb-2 block">{getText({ zh: '营业执照', en: 'Business License', ko: '사업자 등록증', vi: 'Giấy phép kinh doanh' })} *</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                {formData.businessLicense ? (
                  <div className="relative">
                    <img src={formData.businessLicense} alt="License" className="max-h-32 mx-auto rounded" />
                    <button onClick={() => setFormData({ ...formData, businessLicense: '' })} className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 text-xs">×</button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">{getText({ zh: '点击上传营业执照', en: 'Upload business license', ko: '사업자 등록증 업로드', vi: 'Tải lên giấy phép' })}</p>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => setFormData({ ...formData, businessLicense: ev.target?.result as string });
                        reader.readAsDataURL(file);
                      }
                    }} />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* 商品/服务描述 */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 font-bold text-sm mb-2"><FileText className="w-4 h-4" />{getText({ zh: '商品/服务描述', en: 'Description', ko: '설명', vi: 'Mô tả' })}</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder={getText({ zh: '请描述您将提供的商品或服务', en: 'Describe your products/services', ko: '상품/서비스를 설명하세요', vi: 'Mô tả sản phẩm/dịch vụ' })} rows={3} className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm resize-none" />
          </div>

          {/* 联系人 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-700 font-bold text-sm mb-2 block">{getText({ zh: '联系人', en: 'Contact', ko: '연락처', vi: 'Liên hệ' })}</label>
              <input type="text" value={formData.contactName} onChange={(e) => setFormData({ ...formData, contactName: e.target.value })} className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-gray-700 font-bold text-sm mb-2 block">{getText({ zh: '电话', en: 'Phone', ko: '전화', vi: 'Điện thoại' })}</label>
              <input type="tel" value={formData.contactPhone} onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })} className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm" />
            </div>
          </div>
        </div>
      </main>

        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/90 backdrop-blur-sm border-t p-4">
          <button onClick={handleSubmit} disabled={userBalance < 1 || isSubmitting} className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-bold disabled:opacity-50 flex items-center justify-center gap-2">
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? getText({ zh: '提交中...', en: 'Submitting...', ko: '제출 중...', vi: 'Đang gửi...' }) : getText({ zh: '提交申请', en: 'Submit', ko: '제출', vi: 'Gửi' })}
          </button>
        </div>
      </div>
    </div>
  );
};
