import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Language, Translations } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const PublishBountyPage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useOutletContext<{ language: Language; translations: Translations }>();
  const [type, setType] = useState<'RESOURCE' | 'TASK'>('RESOURCE');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reward, setReward] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getText = (obj: { [key: string]: string }) => obj[language] || obj.zh;

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert(getText({ zh: '请输入标题', en: 'Please enter title', ko: '제목을 입력하세요', vi: 'Vui lòng nhập tiêu đề' }));
      return;
    }

    if (!description.trim()) {
      alert(getText({ zh: '请输入描述', en: 'Please enter description', ko: '설명을 입력하세요', vi: 'Vui lòng nhập mô tả' }));
      return;
    }

    const rewardNum = parseFloat(reward);
    if (!reward || isNaN(rewardNum) || rewardNum <= 0) {
      alert(getText({ zh: '请输入有效的赏金', en: 'Please enter valid reward', ko: '유효한 보상을 입력하세요', vi: 'Vui lòng nhập thưởng hợp lệ' }));
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert(getText({ zh: '请先登录', en: 'Please login', ko: '로그인하세요', vi: 'Vui lòng đăng nhập' }));
        return;
      }

      const response = await fetch(`${API_URL}/api/v1/bounties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          type,
          title,
          description,
          reward: rewardNum,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      alert(getText({ zh: '发布成功', en: 'Published', ko: '게시됨', vi: 'Đã đăng' }));
      navigate('/seek-resources');
    } catch (error: any) {
      alert(error.message || getText({ zh: '发布失败', en: 'Publish failed', ko: '게시 실패', vi: 'Đăng thất bại' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 to-pink-500 text-white p-4 flex items-center gap-3 shadow-md">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">{getText({ zh: '发布悬赏', en: 'Publish Bounty', ko: '현상금 게시', vi: 'Đăng truy nã' })}</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* 类型选择 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="block text-sm font-bold text-gray-800 mb-3">
            {getText({ zh: '悬赏类型', en: 'Type', ko: '유형', vi: 'Loại' })}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setType('RESOURCE')}
              className={`py-3 rounded-lg font-bold transition-all ${
                type === 'RESOURCE'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              📦 {getText({ zh: '资源悬赏', en: 'Resource', ko: '자원', vi: 'Tài nguyên' })}
            </button>
            <button
              onClick={() => setType('TASK')}
              className={`py-3 rounded-lg font-bold transition-all ${
                type === 'TASK'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              📋 {getText({ zh: '任务悬赏', en: 'Task', ko: '작업', vi: 'Nhiệm vụ' })}
            </button>
          </div>
        </div>

        {/* 标题 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="block text-sm font-bold text-gray-800 mb-2">
            {getText({ zh: '标题', en: 'Title', ko: '제목', vi: 'Tiêu đề' })}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={getText({ 
              zh: type === 'RESOURCE' ? '例如：寻找某某资源' : '例如：需要帮忙做某事',
              en: type === 'RESOURCE' ? 'e.g., Looking for...' : 'e.g., Need help with...',
              ko: type === 'RESOURCE' ? '예: ...를 찾고 있습니다' : '예: ...에 도움이 필요합니다',
              vi: type === 'RESOURCE' ? 'VD: Đang tìm...' : 'VD: Cần giúp đỡ...'
            })}
            className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
            maxLength={100}
          />
        </div>

        {/* 描述 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="block text-sm font-bold text-gray-800 mb-2">
            {getText({ zh: '详细描述', en: 'Description', ko: '설명', vi: 'Mô tả' })}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={getText({ 
              zh: '详细描述你的需求...',
              en: 'Describe your needs...',
              ko: '필요 사항을 설명하세요...',
              vi: 'Mô tả nhu cầu của bạn...'
            })}
            className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:border-purple-400"
            rows={6}
            maxLength={1000}
          />
          <div className="text-xs text-gray-400 text-right mt-1">
            {description.length}/1000
          </div>
        </div>

        {/* 赏金 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="block text-sm font-bold text-gray-800 mb-2">
            {getText({ zh: '赏金（π）', en: 'Reward (π)', ko: '보상 (π)', vi: 'Thưởng (π)' })}
          </label>
          <input
            type="number"
            value={reward}
            onChange={(e) => setReward(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
          />
          <p className="text-xs text-gray-500 mt-2">
            {getText({ 
              zh: '赏金将被托管，完成后自动支付给接单者',
              en: 'Reward will be held in escrow and paid upon completion',
              ko: '보상은 에스크로에 보관되며 완료 시 지급됩니다',
              vi: 'Thưởng sẽ được giữ trong ký quỹ và thanh toán khi hoàn thành'
            })}
          </p>
        </div>

        {/* 提交按钮 */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
        >
          {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
          {getText({ zh: '发布悬赏', en: 'Publish', ko: '게시', vi: 'Đăng' })}
        </button>

        <p className="text-xs text-gray-500 text-center">
          {getText({ 
            zh: '发布后赏金将从余额中扣除并托管',
            en: 'Reward will be deducted from balance after publishing',
            ko: '게시 후 보상이 잔액에서 차감됩니다',
            vi: 'Thưởng sẽ được khấu trừ từ số dư sau khi đăng'
          })}
        </p>
      </div>
    </div>
  );
};
