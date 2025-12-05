import React, { useState, useMemo, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Users, Gem, ArrowLeftRight, DollarSign, Star, Flame, ChevronDown, Calendar, Loader2 } from 'lucide-react';
import { Language, Translations } from '../types';
import { SimpleSearchBar } from '../components/SimpleSearchBar';
import { resourceApi, ResourceRequest } from '../services/api';

export const SeekResourcesPage: React.FC = () => {
  const { language, translations } = useOutletContext<{ language: Language; translations: Translations }>();
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('default');
  const [requests, setRequests] = useState<ResourceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const navigate = useNavigate();

  const getText = (obj: { [key: string]: string }) => obj[language] || obj.zh;

  // 从后端加载数据
  useEffect(() => {
    const loadResources = async () => {
      try {
        setIsLoading(true);
        const data = await resourceApi.getResources({ sortBy, keyword: searchKeyword || undefined, limit: 50 });
        setRequests(data.items);
      } catch (error) {
        console.error('加载悬赏任务失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadResources();
  }, [sortBy, searchKeyword]);

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
  };

  const goToDetail = (request: ResourceRequest) => {
    navigate('/resource-detail', { 
      state: { 
        item: {
          ...request,
          resource: { zh: request.title, en: request.titleEn || request.title, ko: request.title, vi: request.title },
        } 
      } 
    });
  };

  // 计算截止时间
  const getDeadlineText = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffMs = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return getText({ zh: '已截止', en: 'Ended', ko: '종료됨', vi: 'Đã kết thúc' });
    if (diffDays === 1) return getText({ zh: '1天后', en: '1 day', ko: '1일', vi: '1 ngày' });
    return getText({ zh: `${diffDays}天后`, en: `${diffDays} days`, ko: `${diffDays}일`, vi: `${diffDays} ngày` });
  };

  const sortOptions = [
    { value: 'default', label: { zh: '默认排序', en: 'Default', ko: '기본', vi: 'Mặc định' } },
    { value: 'bidders_high', label: { zh: '出价人数从多到少', en: 'Bidders: High to Low', ko: '입찰자: 많은순', vi: 'Người đấu giá: Cao đến thấp' } },
    { value: 'bidders_low', label: { zh: '出价人数从少到多', en: 'Bidders: Low to High', ko: '입찰자: 적은순', vi: 'Người đấu giá: Thấp đến cao' } },
    { value: 'amount_high', label: { zh: '出价金额从高到低', en: 'Amount: High to Low', ko: '금액: 높은순', vi: 'Số tiền: Cao đến thấp' } },
    { value: 'amount_low', label: { zh: '出价金额从低到高', en: 'Amount: Low to High', ko: '금액: 낮은순', vi: 'Số tiền: Thấp đến cao' } },
  ];

  // 数据已在后端排序，这里直接使用
  const sortedRequests = requests;

  const features = [
    { icon: Gem, text: { zh: '稀缺资源', en: 'Rare Resources', ko: '희귀 자원', vi: 'Tài nguyên hiếm' } },
    { icon: ArrowLeftRight, text: { zh: '可供可求', en: 'Supply & Demand', ko: '공급 수요', vi: 'Cung cầu' } },
    { icon: DollarSign, text: { zh: '资金有保障', en: 'Secure Funds', ko: '안전한 자금', vi: 'Bảo vệ tiền' } },
    { icon: Star, text: { zh: '平台担保', en: 'Platform Guarantee', ko: '플랫폼 보증', vi: 'Bảo đảm nền tảng' } },
  ];

  return (
    <div className="space-y-1">
      <SimpleSearchBar language={language} translations={translations} onSearch={handleSearch} />
      
      <div className="grid grid-cols-4 gap-1.5">
        {features.map((feature, idx) => (
          <div key={idx} className="flex flex-col items-center gap-0.5 py-1">
            <feature.icon className="w-4 h-4 text-purple-600" strokeWidth={2.5} />
            <span className="text-[9px] text-gray-700 font-bold text-center leading-tight">{feature.text[language]}</span>
          </div>
        ))}
      </div>

      {/* 筛选下拉框 */}
      <div className="relative">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 appearance-none cursor-pointer focus:outline-none focus:border-purple-400"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label[language]}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
          <p className="mt-2 text-gray-600 text-sm">{getText({ zh: '加载中...', en: 'Loading...', ko: '로딩 중...', vi: 'Đang tải...' })}</p>
        </div>
      ) : sortedRequests.length === 0 ? (
        <div className="text-center py-10 text-gray-500">{getText({ zh: '暂无悬赏任务', en: 'No bounties', ko: '현상금 없음', vi: 'Không có truy nã' })}</div>
      ) : (
        <div className="space-y-2">
          {sortedRequests.map((request) => {
            const totalAmount = parseFloat(request.initiatorPrice) + parseFloat(request.totalBids);
            const isHot = request.bidderCount >= 5;
            
            return (
              <div
                key={request.id}
                onClick={() => goToDetail(request)}
                className={`group relative overflow-hidden rounded-xl p-2 transition-all duration-300 cursor-pointer
                           ${selectedRequest === request.id 
                             ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-400 shadow-lg' 
                             : 'bg-white border border-purple-100 shadow-sm hover:shadow-lg hover:border-yellow-300'}`}
              >
                {/* 热门标签 */}
                {isHot && (
                  <div className="absolute top-0 left-0 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-br-lg rounded-tl-lg shadow-md flex items-center gap-0.5 z-10">
                    <Flame className="w-2.5 h-2.5" />
                    {getText({ zh: '热门', en: 'Hot', ko: '인기', vi: 'Nóng' })}
                  </div>
                )}
                
                <div className="flex gap-2 relative">
                  <div className="w-14 h-14 flex items-center justify-center text-3xl flex-shrink-0 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg shadow-inner">
                    {request.icon || '📦'}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col pr-[70px]">
                    <h3 className="font-bold text-gray-800 text-sm mb-0.5 line-clamp-1">
                      {language === 'en' && request.titleEn ? request.titleEn : request.title}
                    </h3>
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] text-gray-500">{getText({ zh: '首价', en: 'Start', ko: '시작', vi: 'Bắt đầu' })}</span>
                          <span className="text-red-600 font-bold text-sm leading-none">{request.initiatorPrice}π</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] text-gray-500">{getText({ zh: '总价', en: 'Total', ko: '총액', vi: 'Tổng' })}</span>
                          <span className="text-green-600 font-bold text-sm leading-none">{totalAmount.toFixed(2)}π</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 ml-3">
                        <div className="flex flex-col items-center py-0.5">
                          <span className="text-[9px] text-orange-600 font-bold leading-none">{getText({ zh: '截止', en: 'Due', ko: '마감', vi: 'Hạn' })}</span>
                          <span className="flex items-center gap-0.5 text-[10px] text-orange-600 font-bold mt-0.5">
                            <Calendar className="w-2.5 h-2.5" />
                            {getDeadlineText(request.deadline)}
                          </span>
                        </div>
                        <div className="flex flex-col items-center bg-purple-50 rounded-lg px-2 py-0.5">
                          <span className="text-[9px] text-gray-500 leading-none">{getText({ zh: '出价人数', en: 'Bidders', ko: '입찰자', vi: 'Người đấu' })}</span>
                          <span className="flex items-center gap-0.5 text-[10px] text-purple-600 font-bold mt-0.5">
                            <Users className="w-2.5 h-2.5" />
                            {request.bidderCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-1/2 -translate-y-1/2 right-1 flex flex-col gap-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); goToDetail(request); }}
                      className="px-2 py-0.5 bg-gradient-to-r from-green-600 to-emerald-500 text-white text-[10px] font-bold rounded hover:from-green-700 hover:to-emerald-600 active:scale-95 transition-all shadow-sm">
                      {getText({ zh: '提供', en: 'Provide', ko: '제공', vi: 'Cung cấp' })}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); goToDetail(request); }}
                      className="px-2 py-0.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold rounded hover:from-orange-600 hover:to-red-600 active:scale-95 transition-all shadow-sm">
                      {getText({ zh: '想要', en: 'Want', ko: '원해요', vi: 'Muốn' })}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
