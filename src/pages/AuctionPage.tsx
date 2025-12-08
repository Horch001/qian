import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Language } from '../types';
import api from '../services/api';

interface AuctionPageProps {
  language: Language;
}

export const AuctionPage: React.FC<AuctionPageProps> = ({ language }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'ENDED'>('ALL');

  const translations = {
    title: { zh: '拍卖平台', en: 'Auction', ko: '경매', vi: 'Đấu giá' },
    all: { zh: '全部', en: 'All', ko: '전체', vi: 'Tất cả' },
    active: { zh: '进行中', en: 'Active', ko: '진행 중', vi: 'Đang diễn ra' },
    pending: { zh: '即将开始', en: 'Upcoming', ko: '곧 시작', vi: 'Sắp bắt đầu' },
    ended: { zh: '已结束', en: 'Ended', ko: '종료됨', vi: 'Đã kết thúc' },
    currentPrice: { zh: '当前价', en: 'Current', ko: '현재가', vi: 'Giá hiện tại' },
    startPrice: { zh: '起拍价', en: 'Start', ko: '시작가', vi: 'Giá khởi điểm' },
    deposit: { zh: '保证金', en: 'Deposit', ko: '보증금', vi: 'Tiền đặt cọc' },
    bids: { zh: '次出价', en: ' bids', ko: '입찰', vi: ' lượt đấu' },
    views: { zh: '次浏览', en: ' views', ko: '조회', vi: ' lượt xem' },
    endTime: { zh: '结束时间', en: 'Ends', ko: '종료 시간', vi: 'Kết thúc' },
    startTime: { zh: '开始时间', en: 'Starts', ko: '시작 시간', vi: 'Bắt đầu' },
    noData: { zh: '暂无拍卖', en: 'No auctions', ko: '경매 없음', vi: 'Không có đấu giá' },
  };

  const t = (key: keyof typeof translations) => translations[key][language];

  useEffect(() => {
    loadAuctions();
  }, [activeTab]);

  const loadAuctions = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 50 };
      if (activeTab !== 'ALL') {
        params.status = activeTab;
      }
      const response = await api.get('/auctions', { params });
      
      // 处理多种可能的数据结构
      const auctionData = response.data?.data || response.data || [];
      setAuctions(Array.isArray(auctionData) ? auctionData : []);
    } catch (error) {
      console.error('加载拍卖失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    const date = new Date(time);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    if (diff < 0) return t('ended');
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}${language === 'zh' ? '天' : 'd'}`;
    }
    
    return `${hours}${language === 'zh' ? '小时' : 'h'}${minutes}${language === 'zh' ? '分' : 'm'}`;
  };

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
          <h1 className="flex-1 text-center text-xl font-bold text-white">{t('title')}</h1>
          <button 
            onClick={() => navigate('/create-auction')}
            className="text-white"
            title={language === 'zh' ? '发布拍卖' : 'Create Auction'}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-4 pb-2">
          {(['ALL', 'ACTIVE', 'PENDING', 'ENDED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'text-white border-b-2 border-white'
                  : 'text-white/60'
              }`}
            >
              {t(tab.toLowerCase() as any)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : auctions.length === 0 ? (
          <div className="text-center py-20 text-white/60">{t('noData')}</div>
        ) : (
          <div className="space-y-3">
            {auctions.map((auction) => (
              <div
                key={auction.id}
                onClick={() => navigate(`/auction/${auction.id}`)}
                className="bg-white/10 backdrop-blur-md rounded-xl p-4 active:scale-95 transition-transform"
              >
                {/* Image */}
                {auction.images?.[0] && (
                  <img
                    src={auction.images[0]}
                    alt={auction.title}
                    className="w-full h-40 object-cover rounded-lg mb-3"
                  />
                )}

                {/* Title */}
                <h3 className="text-white font-medium mb-2 line-clamp-2">{auction.title}</h3>

                {/* Price Info */}
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-xs text-white/60">
                      {activeTab === 'PENDING' ? t('startPrice') : t('currentPrice')}
                    </div>
                    <div className="text-xl font-bold text-yellow-300">
                      π {auction.currentPrice}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-white/60">{t('deposit')}</div>
                    <div className="text-sm text-white">π {auction.deposit}</div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>{auction.bidCount}{t('bids')}</span>
                  <span>{auction.viewCount}{t('views')}</span>
                  <span>
                    {activeTab === 'PENDING' ? t('startTime') : t('endTime')}:{' '}
                    {formatTime(activeTab === 'PENDING' ? auction.startTime : auction.endTime)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
