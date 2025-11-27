import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, Clock, DollarSign, Search, Info, AlertCircle } from 'lucide-react';
import { Language, Translations } from '../types';

export const EscrowTradePage: React.FC = () => {
  const { language, translations } = useOutletContext<{ language: Language; translations: Translations }>();
  const [selectedTrade, setSelectedTrade] = useState<string | null>(null);
  const navigate = useNavigate();

  const goToDetail = (trade: any) => {
    navigate('/escrow-detail', { state: { item: trade } });
  };

  const trades = [
    {
      id: '1',
      title: { zh: '网站开发项目', en: 'Website Development', ko: '웹사이트 개발', vi: 'Phát triển website' },
      description: { zh: '企业官网设计与开发', en: 'Corporate website design & development', ko: '기업 웹사이트 디자인 및 개발', vi: 'Thiết kế và phát triển website doanh nghiệp' },
      icon: '💻',
      amount: 5000,
      platformFee: 150,
      status: { zh: '等待付款', en: 'Awaiting Payment', ko: '결제 대기', vi: 'Chờ thanh toán' },
      statusCode: 'awaiting',
      buyer: { zh: '买家A', en: 'Buyer A', ko: '구매자 A', vi: 'Người mua A' },
      seller: { zh: '卖家B', en: 'Seller B', ko: '판매자 B', vi: 'Người bán B' },
      time: '2小时前',
      deadline: '7天',
    },
    {
      id: '2',
      title: { zh: '设计服务', en: 'Design Service', ko: '디자인 서비스', vi: 'Dịch vụ thiết kế' },
      description: { zh: 'UI/UX界面设计', en: 'UI/UX interface design', ko: 'UI/UX 인터페이스 디자인', vi: 'Thiết kế giao diện UI/UX' },
      icon: '🎨',
      amount: 3000,
      platformFee: 90,
      status: { zh: '进行中', en: 'In Progress', ko: '진행 중', vi: 'Đang tiến hành' },
      statusCode: 'progress',
      buyer: { zh: '买家C', en: 'Buyer C', ko: '구매자 C', vi: 'Người mua C' },
      seller: { zh: '卖家D', en: 'Seller D', ko: '판매자 D', vi: 'Người bán D' },
      time: '1天前',
      deadline: '5天',
    },
    {
      id: '3',
      title: { zh: '软件定制', en: 'Custom Software', ko: '맞춤 소프트웨어', vi: 'Phần mềm tùy chỉnh' },
      description: { zh: '企业管理系统定制开发', en: 'Custom ERP system development', ko: '맞춤형 ERP 시스템 개발', vi: 'Phát triển hệ thống ERP tùy chỉnh' },
      icon: '⚙️',
      amount: 8000,
      platformFee: 240,
      status: { zh: '待确认', en: 'Pending Confirm', ko: '확인 대기', vi: 'Chờ xác nhận' },
      statusCode: 'pending',
      buyer: { zh: '买家E', en: 'Buyer E', ko: '구매자 E', vi: 'Người mua E' },
      seller: { zh: '卖家F', en: 'Seller F', ko: '판매자 F', vi: 'Người bán F' },
      time: '3天前',
      deadline: '2天',
      hasDispute: false,
    },
    {
      id: '5',
      title: { zh: '视频剪辑服务', en: 'Video Editing', ko: '비디오 편집', vi: 'Chỉnh sửa video' },
      description: { zh: '宣传片剪辑制作', en: 'Promotional video editing', ko: '홍보 영상 편집', vi: 'Chỉnh sửa video quảng cáo' },
      icon: '🎬',
      amount: 2500,
      platformFee: 75,
      status: { zh: '仲裁中', en: 'In Arbitration', ko: '중재 중', vi: 'Đang trọng tài' },
      statusCode: 'arbitration',
      buyer: { zh: '买家I', en: 'Buyer I', ko: '구매자 I', vi: 'Người mua I' },
      seller: { zh: '卖家J', en: 'Seller J', ko: '판매자 J', vi: 'Người bán J' },
      time: '6天前',
      deadline: '仲裁中',
      hasDispute: true,
      disputeReason: { zh: '质量不符', en: 'Quality issue', ko: '품질 문제', vi: 'Vấn đề chất lượng' },
    },
    {
      id: '4',
      title: { zh: '翻译服务', en: 'Translation Service', ko: '번역 서비스', vi: 'Dịch vụ dịch thuật' },
      description: { zh: '技术文档中英互译', en: 'Technical document translation', ko: '기술 문서 번역', vi: 'Dịch tài liệu kỹ thuật' },
      icon: '📝',
      amount: 1500,
      platformFee: 45,
      status: { zh: '已完成', en: 'Completed', ko: '완료됨', vi: 'Đã hoàn thành' },
      statusCode: 'completed',
      buyer: { zh: '买家G', en: 'Buyer G', ko: '구매자 G', vi: 'Người mua G' },
      seller: { zh: '卖家H', en: 'Seller H', ko: '판매자 H', vi: 'Người bán H' },
      time: '5天前',
      deadline: '-',
    },
  ];

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
      <div className="space-y-2">
        {trades.map((trade) => (
          <div
            key={trade.id}
            onClick={() => goToDetail(trade)}
            className={`group relative overflow-hidden rounded-xl p-2 transition-all duration-300 cursor-pointer bg-white
                       border ${selectedTrade === trade.id ? 'border-purple-400' : 'border-purple-100'}
                       shadow-sm hover:shadow-md active:shadow-sm`}
          >
            <div className="flex gap-2 relative pb-6">
              <div className="w-14 h-14 flex items-center justify-center text-3xl flex-shrink-0 bg-purple-50 rounded-lg">{trade.icon}</div>
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="font-bold text-gray-800 text-sm line-clamp-1 flex-1">
                    {trade.title[language]}
                  </h3>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-bold ml-2 ${getStatusColor(trade.statusCode)}`}>
                    {trade.status[language]}
                  </span>
                </div>
                <p className="text-[10px] text-gray-600 mb-1 line-clamp-1">{trade.description[language]}</p>
                <div className="flex items-start justify-between mb-1">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-red-600 font-bold text-base leading-none">{trade.amount.toLocaleString()}π</span>
                    <span className="text-[9px] text-gray-500">
                      {language === 'zh' ? '服务费' : 'Fee'}: {trade.platformFee}π (3%)
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] text-gray-600 leading-none">{language === 'zh' ? '买家' : 'Buyer'}</span>
                      <span className="text-[10px] text-gray-900 font-bold leading-none mt-0.5">{trade.buyer[language]}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] text-gray-600 leading-none">{language === 'zh' ? '卖家' : 'Seller'}</span>
                      <span className="text-[10px] text-gray-900 font-bold leading-none mt-0.5">{trade.seller[language]}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[9px] text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{trade.time}</span>
                  {trade.deadline !== '-' && trade.deadline !== '仲裁中' && (
                    <>
                      <span>•</span>
                      <AlertCircle className="w-3 h-3" />
                      <span>{language === 'zh' ? '剩余' : 'Left'}: {trade.deadline}</span>
                    </>
                  )}
                </div>
                {trade.hasDispute && (
                  <div className="mt-1 bg-red-50 rounded px-2 py-1 text-[9px] text-red-700 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span className="font-bold">{language === 'zh' ? '纠纷：' : 'Dispute:'}</span>
                    <span>{trade.disputeReason?.[language]}</span>
                    <span>• {language === 'zh' ? '仲裁费5%' : 'Arbitration fee 5%'}</span>
                  </div>
                )}
              </div>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); goToDetail(trade); }}
              className="absolute bottom-1 right-1 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 active:scale-95 transition-all">
              {language === 'zh' ? '查看详情' : language === 'en' ? 'View Details' : language === 'ko' ? '세부정보 보기' : 'Xem chi tiết'}
            </button>
          </div>
        ))}
      </div>

      {/* 创建交易按钮 */}
      <button className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold text-sm">
        {language === 'zh' ? '+ 创建担保交易' : language === 'en' ? '+ Create Escrow Trade' : language === 'ko' ? '+ 에스크로 거래 생성' : '+ Tạo giao dịch ký quỹ'}
      </button>
    </div>
  );
};
