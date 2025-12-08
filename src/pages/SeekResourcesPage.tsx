import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Users, Gem, ArrowLeftRight, DollarSign, Star, ChevronDown, Loader2, Plus } from 'lucide-react';
import { Language, Translations } from '../types';
import { SimpleSearchBar } from '../components/SimpleSearchBar';

interface Bounty {
  id: string;
  type: 'RESOURCE' | 'TASK';
  title: string;
  description: string;
  reward: string;
  status: string;
  images: string[];
  createdAt: string;
  user: {
    id: string;
    username: string;
    avatar?: string;
  };
  _count: {
    applications: number;
  };
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const SeekResourcesPage: React.FC = () => {
  const { language, translations } = useOutletContext<{ language: Language; translations: Translations }>();
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'ALL' | 'RESOURCE' | 'TASK'>('ALL');
  const [sortBy, setSortBy] = useState<'latest' | 'reward'>('latest');
  const navigate = useNavigate();

  const getText = (obj: { [key: string]: string }) => obj[language] || obj.zh;

  useEffect(() => {
    loadBounties();
  }, [filterType, sortBy]);

  const loadBounties = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filterType !== 'ALL') params.append('type', filterType);
      params.append('sortBy', sortBy);

      const response = await fetch(`${API_URL}/api/v1/bounties?${params}`);
      if (!response.ok) throw new Error('加载失败');
      
      const data = await response.json();
      setBounties(data);
    } catch (error) {
      console.error('加载悬赏失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const goToDetail = (id: string) => {
    navigate(`/bounty/${id}`);
  };

  const goToPublish = () => {
    navigate('/publish-bounty');
  };

  const features = [
    { icon: Gem, text: { zh: '稀缺资源', en: 'Rare Resources', ko: '희귀 자원', vi: 'Tài nguyên hiếm' } },
    { icon: ArrowLeftRight, text: { zh: '可供可求', en: 'Supply & Demand', ko: '공급 수요', vi: 'Cung cầu' } },
    { icon: DollarSign, text: { zh: '资金有保障', en: 'Secure Funds', ko: '안전한 자금', vi: 'Bảo vệ tiền' } },
    { icon: Star, text: { zh: '平台担保', en: 'Platform Guarantee', ko: '플랫폼 보증', vi: 'Bảo đảm nền tảng' } },
  ];

  const typeFilters = [
    { value: 'ALL', label: { zh: '全部', en: 'All', ko: '전체', vi: 'Tất cả' } },
    { value: 'RESOURCE', label: { zh: '资源悬赏', en: 'Resources', ko: '자원', vi: 'Tài nguyên' } },
    { value: 'TASK', label: { zh: '任务悬赏', en: 'Tasks', ko: '작업', vi: 'Nhiệm vụ' } },
  ];

  const sortOptions = [
    { value: 'latest', label: { zh: '最新发布', en: 'Latest', ko: '최신', vi: 'Mới nhất' } },
    { value: 'reward', label: { zh: '赏金最高', en: 'Highest Reward', ko: '최고 보상', vi: 'Thưởng cao nhất' } },
  ];

  const getStatusText = (status: string) => {
    const statusMap: any = {
      OPEN: { zh: '开放中', en: 'Open', ko: '오픈', vi: 'Mở', color: 'text-green-600' },
      IN_PROGRESS: { zh: '进行中', en: 'In Progress', ko: '진행 중', vi: 'Đang thực hiện', color: 'text-blue-600' },
      SUBMITTED: { zh: '已提交', en: 'Submitted', ko: '제출됨', vi: 'Đã gửi', color: 'text-purple-600' },
      COMPLETED: { zh: '已完成', en: 'Completed', ko: '완료', vi: 'Hoàn thành', color: 'text-gray-600' },
      CANCELLED: { zh: '已取消', en: 'Cancelled', ko: '취소됨', vi: 'Đã hủy', color: 'text-gray-400' },
    };
    return statusMap[status] || statusMap.OPEN;
  };

  const getTypeIcon = (type: string) => {
    return type === 'RESOURCE' ? '📦' : '📋';
  };

  return (
    <div className="space-y-1 pb-20">
      <SimpleSearchBar language={language} translations={translations} onSearch={() => {}} />
      
      <div className="grid grid-cols-4 gap-1.5">
        {features.map((feature, idx) => (
          <div key={idx} className="flex flex-col items-center gap-0.5 py-1">
            <feature.icon className="w-4 h-4 text-purple-600" strokeWidth={2.5} />
            <span className="text-[9px] text-gray-700 font-bold text-center leading-tight">{feature.text[language]}</span>
          </div>
        ))}
      </div>

      {/* 类型筛选 */}
      <div className="flex gap-2">
        {typeFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setFilterType(filter.value as any)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              filterType === filter.value
                ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {filter.label[language]}
          </button>
        ))}
      </div>

      {/* 排序下拉框 */}
      <div className="relative">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
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
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          <p className="mt-2 text-gray-600 text-sm">{getText({ zh: '加载中...', en: 'Loading...', ko: '로딩 중...', vi: 'Đang tải...' })}</p>
        </div>
      ) : bounties.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          {getText({ zh: '暂无悬赏任务', en: 'No bounties', ko: '현상금 없음', vi: 'Không có truy nã' })}
        </div>
      ) : (
        <div className="space-y-2">
          {bounties.map((bounty) => {
            const statusInfo = getStatusText(bounty.status);
            
            return (
              <div
                key={bounty.id}
                onClick={() => goToDetail(bounty.id)}
                className="group relative overflow-hidden rounded-xl p-3 bg-white border border-purple-100 shadow-sm hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer"
              >
                <div className="flex gap-3">
                  <div className="w-12 h-12 flex items-center justify-center text-2xl flex-shrink-0 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
                    {getTypeIcon(bounty.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-bold text-gray-800 text-sm line-clamp-1 flex-1">
                        {bounty.title}
                      </h3>
                      <span className={`text-xs font-medium ml-2 ${statusInfo.color}`}>
                        {statusInfo[language]}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                      {bounty.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xs text-gray-500">{getText({ zh: '赏金', en: 'Reward', ko: '보상', vi: 'Thưởng' })}</span>
                          <span className="text-orange-600 font-bold text-base">{bounty.reward}π</span>
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Users className="w-3 h-3" />
                          <span>{bounty._count.applications}</span>
                          <span>{getText({ zh: '人申请', en: 'applied', ko: '명 신청', vi: 'đã nộp' })}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <span>{bounty.user.username}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 发布悬赏按钮 */}
      <button
        onClick={goToPublish}
        className="fixed bottom-20 right-4 w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-50"
      >
        <Plus className="w-6 h-6" strokeWidth={3} />
      </button>
    </div>
  );
};
