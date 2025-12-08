import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Language } from '../types';
import api from '../services/api';
import eventsSocketService from '../services/eventsSocket';

interface AuctionDetailPageProps {
  language: Language;
}

export const AuctionDetailPage: React.FC<AuctionDetailPageProps> = ({ language }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auction, setAuction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [showBidModal, setShowBidModal] = useState(false);

  const translations = {
    back: { zh: '返回', en: 'Back', ko: '뒤로', vi: 'Quay lại' },
    currentPrice: { zh: '当前价', en: 'Current Price', ko: '현재가', vi: 'Giá hiện tại' },
    startPrice: { zh: '起拍价', en: 'Start Price', ko: '시작가', vi: 'Giá khởi điểm' },
    deposit: { zh: '保证金', en: 'Deposit', ko: '보증금', vi: 'Tiền đặt cọc' },
    increment: { zh: '加价幅度', en: 'Increment', ko: '입찰 단위', vi: 'Bước giá' },
    endTime: { zh: '结束时间', en: 'End Time', ko: '종료 시간', vi: 'Thời gian kết thúc' },
    bids: { zh: '出价记录', en: 'Bid History', ko: '입찰 기록', vi: 'Lịch sử đấu giá' },
    description: { zh: '商品描述', en: 'Description', ko: '상품 설명', vi: 'Mô tả' },
    payDeposit: { zh: '缴纳保证金', en: 'Pay Deposit', ko: '보증금 납부', vi: 'Đặt cọc' },
    placeBid: { zh: '出价', en: 'Place Bid', ko: '입찰', vi: 'Đấu giá' },
    pay: { zh: '立即支付', en: 'Pay Now', ko: '지불', vi: 'Thanh toán' },
    minBid: { zh: '最低出价', en: 'Min Bid', ko: '최소 입찰가', vi: 'Giá tối thiểu' },
    confirmBid: { zh: '确认出价', en: 'Confirm', ko: '확인', vi: 'Xác nhận' },
    cancel: { zh: '取消', en: 'Cancel', ko: '취소', vi: 'Hủy' },
    winner: { zh: '您已中标！', en: 'You won!', ko: '낙찰!', vi: 'Bạn đã thắng!' },
    ended: { zh: '已结束', en: 'Ended', ko: '종료됨', vi: 'Đã kết thúc' },
    notStarted: { zh: '未开始', en: 'Not Started', ko: '시작 전', vi: 'Chưa bắt đầu' },
  };

  const t = (key: keyof typeof translations) => translations[key][language];

  useEffect(() => {
    loadAuction();

    // 监听实时更新
    eventsSocketService.on('auction:updated', (data: any) => {
      if (data.auctionId === id) {
        setAuction((prev: any) => ({
          ...prev,
          currentPrice: data.currentPrice,
          bidCount: data.bidCount,
        }));
      }
    });

    return () => {
      eventsSocketService.off('auction:updated');
    };
  }, [id]);

  const loadAuction = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/auctions/${id}`);
      setAuction(response.data);
      
      // 设置默认出价（当前价 + 加价幅度）
      const minBid = parseFloat(response.data.currentPrice) + parseFloat(response.data.bidIncrement);
      setBidAmount(minBid.toString());
    } catch (error) {
      console.error('加载拍卖详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayDeposit = async () => {
    try {
      await api.post(`/auctions/${id}/deposit`);
      alert(language === 'zh' ? '保证金缴纳成功' : 'Deposit paid successfully');
      loadAuction();
    } catch (error: any) {
      alert(error.response?.data?.message || '操作失败');
    }
  };

  const handlePlaceBid = async () => {
    try {
      await api.post(`/auctions/${id}/bid`, {
        bidAmount: parseFloat(bidAmount),
      });
      setShowBidModal(false);
      alert(language === 'zh' ? '出价成功' : 'Bid placed successfully');
      loadAuction();
    } catch (error: any) {
      alert(error.response?.data?.message || '出价失败');
    }
  };

  const handlePay = async () => {
    try {
      await api.post(`/auctions/${id}/pay`);
      alert(language === 'zh' ? '支付成功' : 'Payment successful');
      navigate('/profile');
    } catch (error: any) {
      alert(error.response?.data?.message || '支付失败');
    }
  };

  const formatTime = (time: string) => {
    return new Date(time).toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-600 to-pink-500 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-600 to-pink-500 flex items-center justify-center">
        <div className="text-white">拍卖不存在</div>
      </div>
    );
  }

  const isWinner = auction.status === 'ENDED' && auction.winnerId === localStorage.getItem('userId');
  const canBid = auction.status === 'ACTIVE' && auction.hasDeposit;
  const needDeposit = auction.status === 'ACTIVE' && !auction.hasDeposit;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 to-pink-500 pb-20">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center px-4 py-3">
          <button onClick={() => navigate(-1)} className="text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="flex-1 text-center text-xl font-bold text-white">{t('back')}</h1>
          <div className="w-6"></div>
        </div>
      </div>

      {/* Images */}
      {auction.images?.length > 0 && (
        <div className="overflow-x-auto flex gap-2 px-4 py-4">
          {auction.images.map((img: string, idx: number) => (
            <img
              key={idx}
              src={img}
              alt={`${auction.title} ${idx + 1}`}
              className="h-60 rounded-lg object-cover"
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="px-4 space-y-4">
        {/* Title */}
        <h2 className="text-2xl font-bold text-white">{auction.title}</h2>

        {/* Winner Badge */}
        {isWinner && (
          <div className="bg-yellow-400 text-purple-900 px-4 py-2 rounded-lg font-bold text-center">
            🎉 {t('winner')}
          </div>
        )}

        {/* Price Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-white/60">{t('currentPrice')}</div>
              <div className="text-2xl font-bold text-yellow-300">π {auction.currentPrice}</div>
            </div>
            <div>
              <div className="text-xs text-white/60">{t('deposit')}</div>
              <div className="text-lg text-white">π {auction.deposit}</div>
            </div>
            <div>
              <div className="text-xs text-white/60">{t('startPrice')}</div>
              <div className="text-sm text-white">π {auction.startPrice}</div>
            </div>
            <div>
              <div className="text-xs text-white/60">{t('increment')}</div>
              <div className="text-sm text-white">π {auction.bidIncrement}</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="text-xs text-white/60">{t('endTime')}</div>
            <div className="text-sm text-white">{formatTime(auction.endTime)}</div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
          <h3 className="text-white font-medium mb-2">{t('description')}</h3>
          <p className="text-white/80 text-sm whitespace-pre-wrap">{auction.description}</p>
        </div>

        {/* Bid History */}
        {auction.bids?.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
            <h3 className="text-white font-medium mb-3">{t('bids')}</h3>
            <div className="space-y-2">
              {auction.bids.map((bid: any, idx: number) => (
                <div key={bid.id} className="flex items-center justify-between text-sm">
                  <span className="text-white/60">#{idx + 1}</span>
                  <span className="text-yellow-300 font-medium">π {bid.bidAmount}</span>
                  <span className="text-white/60 text-xs">
                    {new Date(bid.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      {auction.status === 'ACTIVE' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-md p-4">
          <div className="max-w-md mx-auto">
            {needDeposit ? (
              <button
                onClick={handlePayDeposit}
                className="w-full bg-yellow-400 text-purple-900 py-3 rounded-lg font-bold"
              >
                {t('payDeposit')} (π {auction.deposit})
              </button>
            ) : canBid ? (
              <button
                onClick={() => setShowBidModal(true)}
                className="w-full bg-yellow-400 text-purple-900 py-3 rounded-lg font-bold"
              >
                {t('placeBid')}
              </button>
            ) : null}
          </div>
        </div>
      )}

      {isWinner && auction.status === 'ENDED' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-md p-4">
          <div className="max-w-md mx-auto">
            <button
              onClick={handlePay}
              className="w-full bg-yellow-400 text-purple-900 py-3 rounded-lg font-bold"
            >
              {t('pay')} (π {auction.currentPrice})
            </button>
          </div>
        </div>
      )}

      {/* Bid Modal */}
      {showBidModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">{t('placeBid')}</h3>
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-2">
                {t('minBid')}: π {parseFloat(auction.currentPrice) + parseFloat(auction.bidIncrement)}
              </label>
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                step={auction.bidIncrement}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowBidModal(false)}
                className="flex-1 py-2 border rounded-lg"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handlePlaceBid}
                className="flex-1 py-2 bg-purple-600 text-white rounded-lg font-medium"
              >
                {t('confirmBid')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
