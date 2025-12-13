import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Store, User, Building2, Package, FileText, AlertCircle, CheckCircle, Loader2, Mail, Upload, CreditCard, Shield } from 'lucide-react';
import { Language, Translations } from '../types';
import { merchantApi } from '../services/api';
import { ReviewRulesModal } from '../components/ReviewRulesModal';
import { eventsSocketService } from '../services/eventsSocket';

interface JoinStorePageProps {
  language: Language;
  translations: Translations;
}

export const JoinStorePage: React.FC<JoinStorePageProps> = ({ language }) => {
  const navigate = useNavigate();
  const [userBalance, setUserBalance] = useState(0);
  const [depositAmount, setDepositAmount] = useState(100); // 默认100π，从API获取
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
    logo: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);

  const getText = (obj: { [key: string]: string }) => obj[language] || obj.zh;

  // 入驻板块选项
  const categories = [
    { value: 'PHYSICAL', label: { zh: '实体商城', en: 'Physical Mall', ko: '실물 쇼핑몰', vi: 'Trung tâm mua sắm' } },
    { value: 'VIRTUAL', label: { zh: '虚拟商城', en: 'Virtual Mall', ko: '가상 쇼핑몰', vi: 'Trung tâm ảo' } },
    { value: 'SERVICE', label: { zh: '上门服务', en: 'Home Service', ko: '방문 서비스', vi: 'Dịch vụ tận nhà' } },
    { value: 'OFFLINE_PLAY', label: { zh: '线下陪玩', en: 'Offline Play', ko: '오프라인 플레이', vi: 'Chơi offline' } },
    { value: 'COURSE', label: { zh: '知识付费', en: 'Paid Courses', ko: '유료 강좌', vi: 'Khóa học trả phí' } },
    { value: 'DETECTIVE', label: { zh: '商业调查', en: 'Business Investigation', ko: '비즈니스 조사', vi: 'Điều tra kinh doanh' } },
    { value: 'CASUAL_GAME', label: { zh: '休闲游戏', en: 'Casual Games', ko: '캐주얼 게임', vi: 'Trò chơi giải trí' } },
  ];

  const needsVerification = false; // 不再要求实名认证

  useEffect(() => {
    // 获取系统设置中的保证金金额
    const fetchSettings = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${API_URL}/api/v1/system/settings`);
        if (response.ok) {
          const settings = await response.json();
          const deposit = parseFloat(settings.merchantDeposit) || 100;
          setDepositAmount(deposit);
        }
      } catch (err) {
        console.error('获取系统设置失败:', err);
        // 失败时使用默认值100
      }
    };
    
    fetchSettings();
    
    const piUser = localStorage.getItem('piUserInfo');
    const emailUser = localStorage.getItem('userInfo');
    const user = piUser ? JSON.parse(piUser) : emailUser ? JSON.parse(emailUser) : null;
    if (user) {
      const balance = parseFloat(user.balance) || 0;
      setUserBalance(balance);
    }
    
    // 自动填充邮箱（从单独的存储中读取）
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
    } else if (user?.email) {
      // 如果userEmail不存在，尝试从user对象读取
      setFormData(prev => ({ ...prev, email: user.email }));
    }
  }, []);

  // 当保证金金额或用户余额变化时，检查余额是否足够
  useEffect(() => {
    if (userBalance > 0 && depositAmount > 0 && userBalance < depositAmount) {
      setError(getText({ 
        zh: `余额不足！申请入驻需要${depositAmount}π保证金，您当前余额为${userBalance}π，请先充值`, 
        en: `Insufficient balance! ${depositAmount}π deposit required, your balance is ${userBalance}π`, 
        ko: `잔액 부족! ${depositAmount}π 보증금 필요, 현재 잔액 ${userBalance}π`, 
        vi: `Số dư không đủ! Cần ${depositAmount}π tiền đặt cọc, số dư hiện tại ${userBalance}π` 
      }));
    } else {
      // 余额足够时清除错误提示
      if (error.includes('余额不足') || error.includes('Insufficient balance')) {
        setError('');
      }
    }
  }, [userBalance, depositAmount]);

  // 🔥 监听WebSocket系统设置更新事件
  useEffect(() => {
    // 连接WebSocket
    const token = localStorage.getItem('token') || localStorage.getItem('piToken');
    if (token) {
      eventsSocketService.connect(token);
    }

    // 监听系统设置更新
    const handleSettingsUpdate = (settings: any) => {
      console.log('[JoinStorePage] 收到系统设置更新:', settings);
      const newDeposit = parseFloat(settings.merchantDeposit) || 100;
      if (newDeposit !== depositAmount) {
        setDepositAmount(newDeposit);
        console.log(`[JoinStorePage] 保证金金额已更新: ${depositAmount}π → ${newDeposit}π`);
      }
    };

    eventsSocketService.on('system:settings-updated', handleSettingsUpdate);

    // 清理
    return () => {
      eventsSocketService.off('system:settings-updated', handleSettingsUpdate);
    };
  }, [depositAmount]);


  const handleSubmit = async () => {
    setError('');
    setIsSubmitting(true);
    
    try {
      // 🔥 提交前重新获取最新的保证金金额
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const settingsResponse = await fetch(`${API_URL}/api/v1/system/settings`);
      let latestDepositAmount = depositAmount; // 默认使用当前值
      
      if (settingsResponse.ok) {
        const settings = await settingsResponse.json();
        latestDepositAmount = parseFloat(settings.merchantDeposit) || 100;
        
        // 如果保证金金额变了，更新显示
        if (latestDepositAmount !== depositAmount) {
          setDepositAmount(latestDepositAmount);
        }
      }
      
      // 检查余额（使用最新的保证金金额）
      if (userBalance < latestDepositAmount) {
        setError(getText({ 
          zh: `余额不足！申请入驻需要${latestDepositAmount}π保证金，您当前余额为${userBalance}π，请先充值`, 
          en: `Insufficient balance! ${latestDepositAmount}π deposit required, your balance is ${userBalance}π`, 
          ko: `잔액 부족! ${latestDepositAmount}π 보증금 필요, 현재 잔액 ${userBalance}π`, 
          vi: `Số dư không đủ! Cần ${latestDepositAmount}π tiền đặt cọc, số dư hiện tại ${userBalance}π` 
        }));
        setIsSubmitting(false);
        return;
      }
      
      if (!formData.storeName.trim()) {
        setError(getText({ zh: '请输入店铺名称', en: 'Please enter store name', ko: '상점 이름을 입력하세요', vi: 'Vui lòng nhập tên cửa hàng' }));
        setIsSubmitting(false);
        return;
      }
      if (!formData.category) {
        setError(getText({ zh: '请选择入驻板块', en: 'Please select category', ko: '카테고리를 선택하세요', vi: 'Vui lòng chọn danh mục' }));
        setIsSubmitting(false);
        return;
      }
      if (!formData.email.trim() || !formData.email.includes('@')) {
        setError(getText({ zh: '请输入有效的邮箱地址', en: 'Please enter valid email', ko: '유효한 이메일을 입력하세요', vi: 'Vui lòng nhập email hợp lệ' }));
        setIsSubmitting(false);
        return;
      }
      // 不再要求实名认证
      if (formData.businessType === 'enterprise' && !formData.businessLicense) {
        setError(getText({ zh: '企业入驻需要上传营业执照', en: 'Business license required for enterprise', ko: '기업은 사업자 등록증이 필요합니다', vi: 'Cần giấy phép kinh doanh cho doanh nghiệp' }));
        setIsSubmitting(false);
        return;
      }

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
        logo: formData.logo || undefined,
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
    <div className="bg-gradient-to-b from-purple-600 to-pink-500 min-h-screen">
      <div className="max-w-md mx-auto">
        <header className="p-4 flex items-center justify-center relative sticky top-0 bg-purple-600 z-10">
          <button onClick={() => navigate(-1)} className="text-white absolute left-4"><ArrowLeft size={24} /></button>
          <h1 className="text-lg font-bold text-white">{getText({ zh: '商家入驻申请', en: 'Seller Application', ko: '판매자 신청', vi: 'Đăng ký bán hàng' })}</h1>
        </header>

        <main className="p-4 pb-6">
        {error && <div className="bg-red-500/20 rounded-xl p-3 mb-4"><p className="text-white text-sm">{error}</p></div>}

        {/* 保证金提示 */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
          <h3 className="font-bold text-green-900 mb-2">💰 {getText({ zh: '保证金说明', en: 'Deposit Info', ko: '보증금 안내', vi: 'Thông tin đặt cọc' })}</h3>
          <div className="text-sm text-green-800 space-y-1">
            <p>• {getText({ zh: `提交申请时将扣除${depositAmount}π保证金`, en: `Submit will deduct ${depositAmount}π deposit`, ko: `제출 시 ${depositAmount}π 보증금 차감`, vi: `Gửi sẽ trừ ${depositAmount}π tiền đặt cọc` })}</p>
            <p>• {getText({ zh: '审核不通过：保证金立即原路退还', en: 'Rejected: deposit refunded immediately', ko: '거부됨: 보증금 즉시 환불', vi: 'Bị từ chối: hoàn tiền ngay lập tức' })}</p>
            <p>• {getText({ zh: '审核通过后：正常营业期间，只要没有未完成订单，随时可退', en: 'Approved: refundable anytime without pending orders', ko: '승인됨: 미완료 주문이 없으면 언제든지 환불 가능', vi: 'Được phê duyệt: có thể hoàn tiền bất cứ lúc nào không có đơn hàng đang chờ' })}</p>
            <p className="text-green-900 font-bold">• {getText({ zh: `您当前余额：${userBalance}π`, en: `Your balance: ${userBalance}π`, ko: `현재 잔액: ${userBalance}π`, vi: `Số dư của bạn: ${userBalance}π` })}</p>
          </div>
        </div>

        {/* AI自动审核提示 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 flex gap-3">
          <Shield className="text-blue-600 flex-shrink-0" size={24} />
          <div>
            <h3 className="font-bold text-blue-900 mb-1">{getText({ zh: 'AI自动审核', en: 'AI Auto Review', ko: 'AI 자동 심사', vi: 'Xét duyệt tự động AI' })}</h3>
            <p className="text-sm text-blue-800 mb-2">
              {getText({ zh: '本平台采用AI智能审核，符合规则的申请将在几分钟内自动通过', en: 'AI auto-review enabled, compliant applications approved in minutes', ko: 'AI 자동 심사 활성화, 규정 준수 신청은 몇 분 내에 승인됩니다', vi: 'Xét duyệt tự động AI được bật, đơn đăng ký tuân thủ được phê duyệt trong vài phút' })}
            </p>
            <button
              onClick={() => setShowRulesModal(true)}
              className="text-sm text-blue-600 font-bold underline"
            >
              {getText({ zh: '查看审核规则和违规处罚 →', en: 'View Rules & Penalties →', ko: '규칙 및 처벌 보기 →', vi: 'Xem quy tắc & hình phạt →' })}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 space-y-4">
          {/* 入驻板块 - 移到第一个 */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 font-bold text-sm mb-2"><Package className="w-4 h-4" />{getText({ zh: '入驻板块', en: 'Category', ko: '카테고리', vi: 'Danh mục' })} *</label>
            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm">
              <option value="">{getText({ zh: '请选择', en: 'Select', ko: '선택', vi: 'Chọn' })}</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label[language]}</option>
              ))}
            </select>

          </div>

          {/* 店铺名称 */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 font-bold text-sm mb-2"><Store className="w-4 h-4" />{getText({ zh: '店铺名称', en: 'Store Name', ko: '상점 이름', vi: 'Tên cửa hàng' })} *</label>
            <input type="text" value={formData.storeName} onChange={(e) => setFormData({ ...formData, storeName: e.target.value })} placeholder={getText({ zh: '请输入店铺名称', en: 'Enter store name', ko: '상점 이름 입력', vi: 'Nhập tên cửa hàng' })} className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm" />
          </div>

          {/* 店铺Logo */}
          <div>
            <label className="text-gray-700 font-bold text-sm mb-2 block">{getText({ zh: '店铺Logo', en: 'Store Logo', ko: '상점 로고', vi: 'Logo cửa hàng' })}</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              {formData.logo ? (
                <div className="relative">
                  <img src={formData.logo} alt="Logo" className="max-h-32 mx-auto rounded" />
                  <button onClick={() => setFormData({ ...formData, logo: '' })} className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 text-xs">×</button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">{getText({ zh: '点击上传店铺Logo', en: 'Upload logo', ko: '로고 업로드', vi: 'Tải logo' })}</p>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 2 * 1024 * 1024) {
                        alert(getText({ zh: '图片大小不能超过2MB', en: 'Image size cannot exceed 2MB', ko: '이미지 크기는 2MB를 초과할 수 없습니다', vi: 'Kích thước ảnh không được vượt quá 2MB' }));
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = (ev) => setFormData({ ...formData, logo: ev.target?.result as string });
                      reader.readAsDataURL(file);
                    }
                  }} />
                </label>
              )}
            </div>
          </div>

          {/* 邮箱 */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 font-bold text-sm mb-2"><Mail className="w-4 h-4" />{getText({ zh: '邮箱', en: 'Email', ko: '이메일', vi: 'Email' })} *</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="example@email.com" className="w-full px-4 py-3 bg-gray-100 rounded-lg text-sm" disabled />
            <p className="text-xs text-gray-500 mt-1">{getText({ zh: '已自动填充您的账号邮箱', en: 'Auto-filled from your account', ko: '계정에서 자동 입력됨', vi: 'Tự động điền từ tài khoản' })}</p>
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
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder={getText({ zh: '请描述您将提供的商品或服务（建议尽可能详细，有助于提高审核通过率）', en: 'Describe your products/services (detailed description recommended)', ko: '상품/서비스를 설명하세요 (자세한 설명 권장)', vi: 'Mô tả sản phẩm/dịch vụ (khuyến nghị mô tả chi tiết)' })} rows={3} className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm resize-none" />
            <p className="text-xs text-gray-500 mt-1">{getText({ zh: '💡 提示：描述越详细，AI审核通过率越高', en: '💡 Tip: More details = higher approval rate', ko: '💡 팁: 자세할수록 승인률이 높아집니다', vi: '💡 Mẹo: Chi tiết hơn = tỷ lệ phê duyệt cao hơn' })}</p>
          </div>

          {/* 联系人 */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 font-bold text-sm mb-2"><User className="w-4 h-4" />{getText({ zh: '联系人', en: 'Contact', ko: '연락처', vi: 'Liên hệ' })}</label>
            <input type="text" value={formData.contactName} onChange={(e) => setFormData({ ...formData, contactName: e.target.value })} className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm" />
          </div>

          {/* 联系电话 */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 font-bold text-sm mb-2"><FileText className="w-4 h-4" />{getText({ zh: '联系电话', en: 'Phone', ko: '전화', vi: 'Điện thoại' })}</label>
            <input type="tel" value={formData.contactPhone} onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })} className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm" />
          </div>

          {/* 提交按钮 */}
          <button onClick={handleSubmit} disabled={isSubmitting} className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-bold disabled:opacity-50 disabled:bg-gray-400 flex items-center justify-center gap-2">
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? getText({ zh: '提交中...', en: 'Submitting...', ko: '제출 중...', vi: 'Đang gửi...' }) : getText({ zh: '提交申请', en: 'Submit', ko: '제출', vi: 'Gửi' })}
          </button>
        </div>

        {/* 底部提示 */}
        <div className="mt-4 p-4 text-center text-white text-xs bg-purple-700/30 rounded-xl">
          <p>💡 {getText({ zh: '提示：提交申请后将进入AI智能审核流程', en: 'Tip: AI review after submission', ko: '팁: 제출 후 AI 심사', vi: 'Mẹo: Xét duyệt AI sau khi gửi' })}</p>
        </div>
      </main>
      </div>

      {/* 审核规则弹窗 */}
      <ReviewRulesModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
        type="merchant"
      />
    </div>
  );
};
