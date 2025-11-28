import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, HelpCircle, ChevronRight, Headphones } from 'lucide-react';
import { Language, Translations } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Message {
  id: string;
  content: string;
  isFromAdmin: boolean;
  createdAt: string;
}

interface CustomerServicePageProps {
  language: Language;
  translations: Translations;
}

export const CustomerServicePage: React.FC<CustomerServicePageProps> = ({ language }) => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 常见问题
  const faqs = [
    { id: '1', question: { zh: '如何充值Pi币？', en: 'How to deposit Pi?', ko: 'Pi를 어떻게 충전하나요?', vi: 'Làm thế nào để nạp Pi?' }, answer: { zh: '点击个人中心的"充值"按钮，使用Pi钱包支付即可。', en: 'Click "Deposit" in profile and pay with Pi wallet.', ko: '프로필에서 "충전"을 클릭하고 Pi 지갑으로 결제하세요.', vi: 'Nhấp "Nạp tiền" trong hồ sơ và thanh toán bằng ví Pi.' } },
    { id: '2', question: { zh: '如何提现？', en: 'How to withdraw?', ko: '어떻게 출금하나요?', vi: 'Làm thế nào để rút tiền?' }, answer: { zh: '在设置中绑定Pi钱包地址，然后点击"提现"按钮。', en: 'Bind your Pi wallet in settings, then click "Withdraw".', ko: '설정에서 Pi 지갑을 연결한 후 "출금"을 클릭하세요.', vi: 'Liên kết ví Pi trong cài đặt, sau đó nhấp "Rút tiền".' } },
    { id: '3', question: { zh: '如何成为商家？', en: 'How to become a seller?', ko: '판매자가 되려면?', vi: 'Làm thế nào để trở thành người bán?' }, answer: { zh: '在"我的店铺"中点击"我要入驻"，填写信息提交审核。', en: 'Click "Join as Seller" in "My Store" and submit for review.', ko: '"내 상점"에서 "입점하기"를 클릭하세요.', vi: 'Nhấp "Đăng ký bán hàng" trong "Cửa hàng của tôi".' } },
  ];

  // 获取聊天历史
  const fetchChatHistory = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/v1/customer-service/history`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        setChatId(data.chatId || null);
      }
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatHistory();
    // 轮询新消息
    const interval = setInterval(fetchChatHistory, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 发送消息
  const handleSendMessage = async (content?: string) => {
    const msgContent = content || message.trim();
    if (!msgContent || sending) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      alert(language === 'zh' ? '请先登录' : 'Please login first');
      return;
    }

    setSending(true);
    setMessage('');

    // 乐观更新
    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      content: msgContent,
      isFromAdmin: false,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const response = await fetch(`${API_URL}/api/v1/customer-service/message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: msgContent }),
      });

      if (response.ok) {
        // 刷新消息列表
        await fetchChatHistory();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleFaqClick = (faq: typeof faqs[0]) => {
    handleSendMessage(faq.question[language]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-300 flex flex-col">
      <header className="bg-white/90 backdrop-blur-sm sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-sm font-bold text-purple-600 flex items-center gap-2">
            <Headphones className="w-4 h-4" />
            {language === 'zh' ? '在线客服' : 'Customer Service'}
          </h1>
          <div className="w-9"></div>
        </div>
      </header>

      <main className="flex-1 max-w-md w-full mx-auto overflow-auto pb-20">
        {/* 常见问题 */}
        {messages.length === 0 && (
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
        )}

        {/* 聊天消息 */}
        <div className="px-4 py-2 space-y-3">
          {loading ? (
            <div className="text-center py-8 text-gray-500">加载中...</div>
          ) : (
            <>
              {messages.length === 0 && (
                <div className="bg-white p-3 rounded-xl max-w-[80%]">
                  <p className="text-sm text-gray-800">
                    {language === 'zh' 
                      ? '您好！我是客服，有什么可以帮您？' 
                      : 'Hello! How can I help you?'}
                  </p>
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isFromAdmin ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] p-3 rounded-xl ${
                    msg.isFromAdmin 
                      ? 'bg-white text-gray-800' 
                      : 'bg-purple-600 text-white'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.isFromAdmin ? 'text-gray-400' : 'text-purple-200'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
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
            disabled={sending}
          />
          <button 
            onClick={() => handleSendMessage()}
            disabled={sending || !message.trim()}
            className="p-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
