import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Store, User, Clock } from 'lucide-react';
import { Language, Translations } from '../types';

interface MessagesPageProps {
  language: Language;
  translations: Translations;
}

export const MessagesPage: React.FC<MessagesPageProps> = ({ language }) => {
  const navigate = useNavigate();

  // 模拟对话历史
  const conversations = [
    { id: '1', name: { zh: '官方客服', en: 'Support', ko: '고객지원', vi: 'Hỗ trợ' }, avatar: '🎧', lastMessage: { zh: '您好，有什么可以帮您？', en: 'Hello, how can I help?', ko: '안녕하세요, 무엇을 도와드릴까요?', vi: 'Xin chào, tôi có thể giúp gì?' }, time: '10:30', unread: 1, isOfficial: true },
    { id: '2', name: { zh: '系统通知', en: 'System', ko: '시스템', vi: 'Hệ thống' }, avatar: '🔔', lastMessage: { zh: '您的提现申请已处理完成', en: 'Your withdrawal has been processed', ko: '출금 신청이 처리되었습니다', vi: 'Yêu cầu rút tiền đã được xử lý' }, time: '09:15', unread: 2, isOfficial: true },
    { id: '3', name: { zh: '品质生活馆', en: 'Quality Store', ko: '품질 상점', vi: 'Cửa hàng chất lượng' }, avatar: '🏪', lastMessage: { zh: '您的订单已发货，快递单号：SF1234567890', en: 'Your order has been shipped, tracking: SF1234567890', ko: '주문이 발송되었습니다, 운송장: SF1234567890', vi: 'Đơn hàng đã được gửi, mã vận đơn: SF1234567890' }, time: { zh: '昨天', en: 'Yesterday', ko: '어제', vi: 'Hôm qua' }, unread: 0, isOfficial: false },
    { id: '4', name: { zh: '科技数码店', en: 'Tech Store', ko: '기술 상점', vi: 'Cửa hàng công nghệ' }, avatar: '💻', lastMessage: { zh: '感谢您的购买！期待您的好评~', en: 'Thank you for your purchase! Looking forward to your review~', ko: '구매해 주셔서 감사합니다! 리뷰 부탁드립니다~', vi: 'Cảm ơn bạn đã mua hàng! Mong nhận được đánh giá của bạn~' }, time: { zh: '3天前', en: '3 days ago', ko: '3일 전', vi: '3 ngày trước' }, unread: 0, isOfficial: false },
    { id: '5', name: { zh: '温馨家居店', en: 'Cozy Home', ko: '아늑한 홈', vi: 'Nhà ấm cúng' }, avatar: '🏠', lastMessage: { zh: '亲，您咨询的商品已经补货啦', en: 'Hi, the item you asked about is back in stock', ko: '안녕하세요, 문의하신 상품이 재입고되었습니다', vi: 'Xin chào, sản phẩm bạn hỏi đã có hàng trở lại' }, time: { zh: '5天前', en: '5 days ago', ko: '5일 전', vi: '5 ngày trước' }, unread: 0, isOfficial: false },
    { id: '6', name: { zh: '订单助手', en: 'Order Assistant', ko: '주문 도우미', vi: 'Trợ lý đơn hàng' }, avatar: '📦', lastMessage: { zh: '您有一笔订单即将超时，请及时确认收货', en: 'You have an order about to expire, please confirm receipt', ko: '주문이 곧 만료됩니다. 수령을 확인해 주세요', vi: 'Bạn có đơn hàng sắp hết hạn, vui lòng xác nhận nhận hàng' }, time: { zh: '1周前', en: '1 week ago', ko: '1주 전', vi: '1 tuần trước' }, unread: 0, isOfficial: true },
    { id: '7', name: { zh: '优惠活动', en: 'Promotions', ko: '프로모션', vi: 'Khuyến mãi' }, avatar: '🎁', lastMessage: { zh: '双十一大促开始啦！全场商品低至5折', en: 'Big sale starts! Up to 50% off on all items', ko: '빅세일 시작! 전 상품 최대 50% 할인', vi: 'Khuyến mãi lớn bắt đầu! Giảm đến 50% tất cả sản phẩm' }, time: { zh: '2周前', en: '2 weeks ago', ko: '2주 전', vi: '2 tuần trước' }, unread: 0, isOfficial: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-300 flex flex-col">
      <header className="bg-white/90 backdrop-blur-sm sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-sm font-bold text-purple-600">
            {language === 'zh' ? '消息' : language === 'en' ? 'Messages' : language === 'ko' ? '메시지' : 'Tin nhắn'}
          </h1>
          <div className="w-9"></div>
        </div>
      </header>

      <main className="flex-1 max-w-md w-full mx-auto overflow-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <MessageCircle className="w-12 h-12 mb-3 text-gray-300" />
            <p>{language === 'zh' ? '暂无消息' : 'No messages'}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {conversations.map((conv) => (
              <div 
                key={conv.id}
                onClick={() => conv.isOfficial ? navigate('/customer-service') : null}
                className="flex items-center gap-3 p-4 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl">
                    {conv.avatar}
                  </div>
                  {conv.isOfficial && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-[10px]">✓</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-gray-800 text-sm truncate">{conv.name[language]}</h3>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {typeof conv.time === 'object' ? conv.time[language] : conv.time}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{typeof conv.lastMessage === 'object' ? conv.lastMessage[language] : conv.lastMessage}</p>
                </div>
                {conv.unread > 0 && (
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold">{conv.unread}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
