import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, Clock, DollarSign, Search, Info, AlertCircle, Loader2 } from 'lucide-react';
import { Language, Translations } from '../types';
import { escrowApi, EscrowTrade } from '../services/api';

export const EscrowTradePage: React.FC = () => {
  const { language, translations } = useOutletContext<{ language: Language; translations: Translations }>();
  const [selectedTrade, setSelectedTrade] = useState<string | null>(null);
  const [trades, setTrades] = useState<EscrowTrade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const getText = (obj: { [key: string]: string }) => obj[language] || obj.zh;

  // 从后端加载数据
  useEffect(() => {
    const loadTrades = async () => {
      try {
        const data = await escrowApi.getTrades();
        setTrades(data);
      } catch (error) {
        console.error('加载担保交易失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTrades();
  }, []);

  const goToDetail = (trade: EscrowTrade) => {
    navigate('/escrow-detail', { 
      state: { 
        item: {
          ...trade,
          title: { zh: trade.title, en: trade.title, ko: trade.title, vi: trade.title },
          description: { zh: trade.description || '', en: trade.description || '', ko: trade.description || '', vi: trade.description || '' },
        } 
      } 
    });
  };

  // 格式化时间
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return getText({ zh: '刚刚', en: 'Just now', ko: '방금', vi: 'Vừa xong' });
    if (diffHours < 24) return getText({ zh: `${diffHours}小时前`, en: `${diffHours}h ago`, ko: `${diffHours}시간 전`, vi: `${diffHours} giờ trước` });
    if (diffDays < 7) return getText({ zh: `${diffDays}天前`, en: `${diffDays}d ago`, ko: `${diffDays}일 전`, vi: `${diffDays} ngày trước` });
    return date.toLocaleDateString();
  };

  // 获取状态显示
  const getStatusDisplay = (status: string) => {
    const statusMap: { [key: string]: { text: { [key: string]: string }; code: string } } = {
      'PENDING': { text: { zh: '等待接单', en: 'Awaiting', ko: '대기 중', vi: 'Chờ đợi' }, code: 'awaiting' },
      'ACCEPTED': { text: { zh: '已接单', en: 'Accepted', ko: '수락됨', vi: 'Đã chấp nhận' }, code: 'progress' },
      'PAID': { text: { zh: '已付款', en: 'Paid', ko: '결제됨', vi: 'Đã thanh toán' }, code: 'progress' },
      'DELIVERED': { text: { zh: '已交付', en: 'Delivered', ko: '배송됨', vi: 'Đã giao' }, code: 'pending' },
      'COMPLETED': { text: { zh: '已完成', en: 'Completed', ko: '완료됨', vi: 'Đã hoàn thành' }, code: 'completed' },
      'DISPUTED': { text: { zh: '仲裁中', en: 'Disputed', ko: '분쟁 중', vi: 'Tranh chấp' }, code: 'arbitration' },
      'CANCELLED': { text: { zh: '已取消', en: 'Cancelled', ko: '취소됨', vi: 'Đã hủy' }, code: 'cancelled' },
    };
    return statusMap[status] || { text: { zh: status, en: status, ko: status, vi: status }, code: 'default' };
  };

  const features = [
    { icon: Shield, text: { zh: '平台担保', en: 'Platform Guarantee', ko: '플랫폼 보증', vi: 'Bảo đảm nền tảng' } },
    { icon: DollarSign, text: { zh: '资金托管', en: 'Fund Escrow', ko: '자금 보관', vi: 'Ký quỹ' } },
    { icon: CheckCircle, text: { zh: '安全交易', en: 'Safe Trade', ko: '안전 거래', vi: 'Giao dịch an toàn' } },
    { icon: Clock, text: { zh: '快速结算', en: 'Fast Settlement', ko: '빠른 정산', vi: 'Thanh toán nhanh' } },
  ];

  const getStatusColor = (statusCode: string) => {
    switch (statusCode) {
      case 'awaiting': return 'text-orange-600 bg-orange-50';
      case 'progress': return 'text-blue-600 bg-blue-50';
      case 'pending': return 'text-purple-600 bg-purple-50';
      case 'completed': return 'text-green-600 bg-green-50';
      case 'arbitration': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

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
        <div className="bg-green-50 rounded-lg p-2 border border-green-200">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[10px] text-green-800 leading-relaxed mb-1">
                <span className="font-bold">{language === 'zh' ? '交易流程：' : 'Process:'}</span>
                {language === 'zh' 
                  ? '①买家付款到平台托管 ②卖家交付商品/服务 ③买家确认收货 ④平台释放资金给卖家。'
                  : '①Buyer pays to platform ②Seller delivers ③Buyer confirms ④Platform releases funds.'}
              </p>
              <p className="text-[10px] text-green-800 leading-relaxed">
                <span className="font-bold">{language === 'zh' ? '纠纷处理：' : 'Disputes:'}</span>
                {language === 'zh' 
                  ? '如有争议，双方提交证据，平台仲裁员7天内判定。仲裁费5%从交易金额扣除。可申诉一次。'
                  : 'Submit evidence, arbitrator decides in 7 days. 5% arbitration fee. One appeal allowed.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 交易列表 */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          <p className="mt-2 text-gray-600 text-sm">{getText({ zh: '加载中...', en: 'Loading...', ko: '로딩 중...', vi: 'Đang tải...' })}</p>
        </div>
      ) : trades.length === 0 ? (
        <div className="text-center py-10 text-gray-500">{getText({ zh: '暂无担保交易', en: 'No escrow trades', ko: '에스크로 거래 없음', vi: 'Không có giao dịch ký quỹ' })}</div>
      ) : (
        <div className="space-y-2">
          {trades.map((trade) => {
            const statusInfo = getStatusDisplay(trade.status);
            const amount = parseFloat(trade.amount);
            const platformFee = (amount * 0.03).toFixed(2);
            
            return (
              <div
                key={trade.id}
                onClick={() => goToDetail(trade)}
                className={`group relative overflow-hidden rounded-xl p-2 transition-all duration-300 cursor-pointer bg-white
                           border ${selectedTrade === trade.id ? 'border-purple-400' : 'border-purple-100'}
                           shadow-sm hover:shadow-md active:shadow-sm`}
              >
                <div className="flex gap-2 relative pb-6">
                  <div className="w-14 h-14 flex items-center justify-center text-3xl flex-shrink-0 bg-purple-50 rounded-lg">🤝</div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="font-bold text-gray-800 text-sm line-clamp-1 flex-1">
                        {trade.title}
                      </h3>
                      <span className={`text-[9px] px-2 py-0.5 rounded font-bold ml-2 ${getStatusColor(statusInfo.code)}`}>
                        {statusInfo.text[language]}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-600 mb-1 line-clamp-1">{trade.description || getText({ zh: '暂无描述', en: 'No description', ko: '설명 없음', vi: 'Không có mô tả' })}</p>
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-red-600 font-bold text-base leading-none">{amount.toLocaleString()}π</span>
                        <span className="text-[9px] text-gray-500">
                          {getText({ zh: '服务费', en: 'Fee', ko: '수수료', vi: 'Phí' })}: {platformFee}π (3%)
                        </span>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <span className="text-[9px] text-gray-600 leading-none">{getText({ zh: '买家', en: 'Buyer', ko: '구매자', vi: 'Người mua' })}</span>
                          <span className="text-[10px] text-gray-900 font-bold leading-none mt-0.5">{trade.buyer?.username || '-'}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[9px] text-gray-600 leading-none">{getText({ zh: '卖家', en: 'Seller', ko: '판매자', vi: 'Người bán' })}</span>
                          <span className="text-[10px] text-gray-900 font-bold leading-none mt-0.5">{trade.seller?.username || getText({ zh: '待接单', en: 'Pending', ko: '대기 중', vi: 'Chờ đợi' })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(trade.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); goToDetail(trade); }}
                  className="absolute bottom-1 right-1 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 active:scale-95 transition-all">
                  {getText({ zh: '查看详情', en: 'View Details', ko: '세부정보 보기', vi: 'Xem chi tiết' })}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 创建交易按钮 */}
      <button 
        onClick={() => navigate('/escrow-create')}
        className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold text-sm"
      >
        {language === 'zh' ? '+ 创建担保交易' : language === 'en' ? '+ Create Escrow Trade' : language === 'ko' ? '+ 에스크로 거래 생성' : '+ Tạo giao dịch ký quỹ'}
      </button>
    </div>
  );
};
