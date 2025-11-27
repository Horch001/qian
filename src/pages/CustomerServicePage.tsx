import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, HelpCircle, MessageCircle, ChevronRight, User, Headphones } from 'lucide-react';
import { Language, Translations } from '../types';

interface CustomerServicePageProps {
  language: Language;
  translations: Translations;
}

export const CustomerServicePage: React.FC<CustomerServicePageProps> = ({ language }) => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [showHumanService, setShowHumanService] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{type: 'user' | 'bot', content: string}>>([
    { type: 'bot', content: language === 'zh' ? '您好！我是智能客服小助手，请问有什么可以帮您？' : 'Hello! I\'m the AI assistant. How can I help you?' }
  ]);

  // 常见问题
  const faqs = [
    { id: '1', question: { zh: '如何充值Pi币？', en: 'How to deposit Pi?', ko: 'Pi를 어떻게 충전하나요?', vi: 'Làm thế nào để nạp Pi?' }, answer: { zh: '点击个人中心的"充值"按钮，复制平台钱包地址，在Pi浏览器中转账即可。充值到账时间一般为5-30分钟。', en: 'Click "Deposit" in profile, copy the platform wallet address, and transfer in Pi Browser. Usually arrives in 5-30 minutes.', ko: '프로필에서 "충전"을 클릭하고 플랫폼 지갑 주소를 복사한 후 Pi 브라우저에서 전송하세요. 보통 5-30분 내에 도착합니다.', vi: 'Nhấp vào "Nạp tiền" trong hồ sơ, sao chép địa chỉ ví nền tảng và chuyển trong Pi Browser. Thường đến trong 5-30 phút.' } },
    { id: '2', question: { zh: '如何提现？', en: 'How to withdraw?', ko: '어떻게 출금하나요?', vi: 'Làm thế nào để rút tiền?' }, answer: { zh: '在设置中绑定您的Pi钱包地址（必须是大写字母和数字组合），然后点击"提现"按钮，输入金额即可。\n\n⚠️ 重要提示：\n• 提现仅在工作日处理\n• 人工审核，最迟12小时到账\n• 首次提现成功后钱包地址不可更改\n• 钱包地址必须与充值地址一致', en: 'Bind your Pi wallet in settings (uppercase letters and numbers), then click "Withdraw" and enter the amount.\n\n⚠️ Important:\n• Processed on business days only\n• Manual review, up to 12 hours\n• Wallet cannot be changed after first withdrawal\n• Must match deposit wallet', ko: '설정에서 Pi 지갑을 연결한 후 "출금"을 클릭하고 금액을 입력하세요.\n\n⚠️ 중요:\n• 영업일에만 처리\n• 수동 검토, 최대 12시간\n• 첫 출금 후 지갑 변경 불가', vi: 'Liên kết ví Pi trong cài đặt, sau đó nhấp "Rút tiền" và nhập số tiền.\n\n⚠️ Quan trọng:\n• Chỉ xử lý vào ngày làm việc\n• Xét duyệt thủ công, tối đa 12 giờ' } },
    { id: '3', question: { zh: '订单多久发货？', en: 'When will my order ship?', ko: '주문은 언제 배송되나요?', vi: 'Đơn hàng sẽ được gửi khi nào?' }, answer: { zh: '一般情况下，商家会在24小时内发货。如超时未发货，可申请退款。虚拟商品通常即时发货。', en: 'Usually merchants ship within 24 hours. You can request a refund if not shipped on time. Virtual items are usually delivered instantly.', ko: '일반적으로 판매자는 24시간 이내에 배송합니다. 가상 상품은 보통 즉시 배송됩니다.', vi: 'Thông thường người bán sẽ gửi hàng trong vòng 24 giờ. Sản phẩm ảo thường được giao ngay.' } },
    { id: '4', question: { zh: '如何申请退款？', en: 'How to request refund?', ko: '환불은 어떻게 신청하나요?', vi: 'Làm thế nào để yêu cầu hoàn tiền?' }, answer: { zh: '在"我的订单"中找到对应订单，点击"申请售后"，选择退款原因即可。退款将在1-3个工作日内处理。', en: 'Find the order in "My Orders", click "After-sales Service", and select the refund reason. Refunds are processed within 1-3 business days.', ko: '"내 주문"에서 주문을 찾아 "A/S 신청"을 클릭하세요. 환불은 1-3 영업일 내에 처리됩니다.', vi: 'Tìm đơn hàng trong "Đơn hàng của tôi", nhấp "Dịch vụ sau bán hàng". Hoàn tiền được xử lý trong 1-3 ngày làm việc.' } },
    { id: '5', question: { zh: '如何成为商家？', en: 'How to become a seller?', ko: '판매자가 되려면 어떻게 하나요?', vi: 'Làm thế nào để trở thành người bán?' }, answer: { zh: '在"我的店铺"中点击"我要入驻"，填写店铺信息并缴纳保证金即可开店。入驻审核一般1-2个工作日。', en: 'Click "Join as Seller" in "My Store", fill in store info and pay the deposit to open your store. Review takes 1-2 business days.', ko: '"내 상점"에서 "입점하기"를 클릭하고 상점 정보를 입력하세요. 심사는 1-2 영업일 소요됩니다.', vi: 'Nhấp "Đăng ký bán hàng" trong "Cửa hàng của tôi". Xét duyệt mất 1-2 ngày làm việc.' } },
    { id: '6', question: { zh: '忘记密码怎么办？', en: 'Forgot password?', ko: '비밀번호를 잊었어요?', vi: 'Quên mật khẩu?' }, answer: { zh: '如果您使用Pi账号登录，请在Pi浏览器中重置密码。如果使用邮箱登录，请点击登录页面的"忘记密码"链接。', en: 'If you use Pi account, reset password in Pi Browser. If using email, click "Forgot Password" on login page.', ko: 'Pi 계정을 사용하는 경우 Pi 브라우저에서 비밀번호를 재설정하세요. 이메일을 사용하는 경우 로그인 페이지에서 "비밀번호 찾기"를 클릭하세요.', vi: 'Nếu dùng tài khoản Pi, đặt lại mật khẩu trong Pi Browser. Nếu dùng email, nhấp "Quên mật khẩu" trên trang đăng nhập.' } },
    { id: '7', question: { zh: '如何修改收货地址？', en: 'How to change shipping address?', ko: '배송 주소를 어떻게 변경하나요?', vi: 'Làm thế nào để thay đổi địa chỉ giao hàng?' }, answer: { zh: '在个人中心点击设置按钮，可以修改收货地址。已发货的订单无法修改地址，请联系商家协商。', en: 'Click settings in profile to change shipping address. Cannot change address for shipped orders, please contact the seller.', ko: '프로필에서 설정을 클릭하여 배송 주소를 변경하세요. 발송된 주문은 주소 변경이 불가능합니다.', vi: 'Nhấp cài đặt trong hồ sơ để thay đổi địa chỉ. Không thể thay đổi địa chỉ cho đơn hàng đã gửi.' } },
    { id: '8', question: { zh: '平台收取多少手续费？', en: 'What are the platform fees?', ko: '플랫폼 수수료는 얼마인가요?', vi: 'Phí nền tảng là bao nhiêu?' }, answer: { zh: '买家购物不收取任何手续费。商家入驻需缴纳保证金，交易成功后平台收取2%的服务费。', en: 'No fees for buyers. Sellers pay a deposit to join and 2% service fee on successful transactions.', ko: '구매자는 수수료가 없습니다. 판매자는 보증금과 거래 성공 시 2% 서비스 수수료를 지불합니다.', vi: 'Người mua không mất phí. Người bán đặt cọc và trả 2% phí dịch vụ khi giao dịch thành công.' } },
  ];

  const handleFaqClick = (faq: typeof faqs[0]) => {
    setChatHistory(prev => [
      ...prev,
      { type: 'user', content: faq.question[language] },
      { type: 'bot', content: faq.answer[language] }
    ]);
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    // 检查是否匹配常见问题关键词
    const matchedFaq = faqs.find(faq => {
      const question = faq.question[language].toLowerCase();
      const userMsg = message.toLowerCase();
      return question.includes(userMsg) || userMsg.includes(question.slice(0, 4));
    });
    
    if (matchedFaq) {
      setChatHistory(prev => [
        ...prev,
        { type: 'user', content: message },
        { type: 'bot', content: matchedFaq.answer[language] }
      ]);
    } else {
      setChatHistory(prev => [
        ...prev,
        { type: 'user', content: message },
        { type: 'bot', content: language === 'zh' 
          ? '感谢您的反馈！您的问题已记录，如需进一步帮助，请点击下方"联系人工客服"按钮，我们的客服人员将在工作时间内为您解答。\n\n工作时间：周一至周五 9:00-18:00' 
          : language === 'en'
          ? 'Thank you for your feedback! Your question has been recorded. For further assistance, please click "Contact Human Support" below. Our staff will help you during business hours.\n\nBusiness hours: Mon-Fri 9:00-18:00'
          : language === 'ko'
          ? '피드백 감사합니다! 질문이 기록되었습니다. 추가 도움이 필요하시면 아래 "인간 지원 연락"을 클릭하세요.\n\n영업 시간: 월-금 9:00-18:00'
          : 'Cảm ơn phản hồi của bạn! Câu hỏi đã được ghi nhận. Để được hỗ trợ thêm, vui lòng nhấp "Liên hệ hỗ trợ" bên dưới.\n\nGiờ làm việc: Thứ 2-6 9:00-18:00'
        }
      ]);
      setShowHumanService(true);
    }
    setMessage('');
  };

  const handleContactHumanSupport = () => {
    // 模拟跳转到人工客服
    setChatHistory(prev => [
      ...prev,
      { type: 'bot', content: language === 'zh' 
        ? '🎧 正在为您转接人工客服，请稍候...\n\n您也可以通过以下方式联系我们：\n📧 邮箱：support@pimarket.com\n💬 工作时间：周一至周五 9:00-18:00\n\n客服人员将尽快回复您的消息！' 
        : language === 'en'
        ? '🎧 Connecting you to human support, please wait...\n\nYou can also contact us via:\n📧 Email: support@pimarket.com\n💬 Hours: Mon-Fri 9:00-18:00\n\nOur staff will reply as soon as possible!'
        : language === 'ko'
        ? '🎧 인간 지원에 연결 중입니다. 잠시만 기다려 주세요...\n\n다음을 통해서도 연락하실 수 있습니다:\n📧 이메일: support@pimarket.com\n💬 시간: 월-금 9:00-18:00'
        : '🎧 Đang kết nối bạn với hỗ trợ, vui lòng đợi...\n\nBạn cũng có thể liên hệ qua:\n📧 Email: support@pimarket.com\n💬 Giờ: Thứ 2-6 9:00-18:00'
      }
    ]);
    setShowHumanService(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-300 flex flex-col">
      <header className="bg-white/90 backdrop-blur-sm sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-sm font-bold text-purple-600">
            {language === 'zh' ? '客服中心' : language === 'en' ? 'Support' : language === 'ko' ? '고객지원' : 'Hỗ trợ'}
          </h1>
          <div className="w-9"></div>
        </div>
      </header>

      <main className="flex-1 max-w-md w-full mx-auto overflow-auto pb-32">
        {/* 常见问题 */}
        <div className="bg-white m-4 rounded-xl p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-purple-600" />
            {language === 'zh' ? '常见问题' : 'FAQ'}
          </h3>
          <div className="space-y-2">
            {faqs.map((faq) => (
              <button
                key={faq.id}
                onClick={() => handleFaqClick(faq)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-purple-50 transition-colors text-left"
              >
                <span className="text-sm text-gray-700">{faq.question[language]}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            ))}
          </div>
        </div>

        {/* 对话历史 */}
        <div className="px-4 space-y-3">
          {chatHistory.map((chat, idx) => (
            <div key={idx} className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-xl ${chat.type === 'user' ? 'bg-purple-600 text-white' : 'bg-white text-gray-800'}`}>
                <p className="text-sm">{chat.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 人工客服按钮 */}
        {showHumanService && (
          <div className="px-4 mt-4">
            <button 
              onClick={handleContactHumanSupport}
              className="w-full flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all"
            >
              <Headphones className="w-5 h-5" />
              {language === 'zh' ? '联系人工客服' : language === 'en' ? 'Contact Human Support' : language === 'ko' ? '인간 지원 연락' : 'Liên hệ hỗ trợ'}
            </button>
          </div>
        )}
      </main>

      {/* 输入框 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={language === 'zh' ? '输入您的问题...' : 'Type your question...'}
            className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button 
            onClick={handleSendMessage}
            className="p-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full hover:opacity-90 active:scale-95 transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
