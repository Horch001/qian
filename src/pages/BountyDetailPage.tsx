import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowLeft, User, Calendar, Users, CheckCircle, XCircle, Send, Loader2 } from 'lucide-react';
import { Language, Translations } from '../types';

interface Bounty {
  id: string;
  type: 'RESOURCE' | 'TASK';
  title: string;
  description: string;
  reward: string;
  status: string;
  images: string[];
  createdAt: string;
  submittedAt?: string;
  submissionNote?: string;
  submissionFiles?: string[];
  user: {
    id: string;
    username: string;
    avatar?: string;
  };
  acceptedUser?: {
    id: string;
    username: string;
    avatar?: string;
  };
  applications?: Array<{
    id: string;
    message?: string;
    status: string;
    createdAt: string;
    user: {
      id: string;
      username: string;
      avatar?: string;
    };
  }>;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const BountyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useOutletContext<{ language: Language; translations: Translations }>();
  const [bounty, setBounty] = useState<Bounty | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [applyMessage, setApplyMessage] = useState('');
  const [submissionNote, setSubmissionNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const getText = (obj: { [key: string]: string }) => obj[language] || obj.zh;

  useEffect(() => {
    loadBounty();
    loadCurrentUser();
  }, [id]);

  const loadCurrentUser = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${API_URL}/api/v1/users/profile`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentUserId(data.id);
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  };

  const loadBounty = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_URL}/api/v1/bounties/${id}`, { headers });
      if (!response.ok) throw new Error('加载失败');
      
      const data = await response.json();
      setBounty(data);
    } catch (error) {
      console.error('加载悬赏详情失败:', error);
      alert(getText({ zh: '加载失败', en: 'Load failed', ko: '로드 실패', vi: 'Tải thất bại' }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async () => {
    if (!applyMessage.trim()) {
      alert(getText({ zh: '请输入申请说明', en: 'Please enter message', ko: '메시지를 입력하세요', vi: 'Vui lòng nhập tin nhắn' }));
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert(getText({ zh: '请先登录', en: 'Please login', ko: '로그인하세요', vi: 'Vui lòng đăng nhập' }));
        return;
      }

      const response = await fetch(`${API_URL}/api/v1/bounties/${id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: applyMessage }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      alert(getText({ zh: '申请成功', en: 'Applied successfully', ko: '신청 성공', vi: 'Nộp thành công' }));
      setApplyMessage('');
      loadBounty();
    } catch (error: any) {
      alert(error.message || getText({ zh: '申请失败', en: 'Apply failed', ko: '신청 실패', vi: 'Nộp thất bại' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptApplication = async (applicationId: string) => {
    if (!confirm(getText({ zh: '确定选择此人接单？', en: 'Accept this application?', ko: '이 신청을 수락하시겠습니까?', vi: 'Chấp nhận đơn này?' }))) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/v1/bounties/${id}/accept-application`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ applicationId }),
      });

      if (!response.ok) throw new Error('操作失败');

      alert(getText({ zh: '已选择接单者', en: 'Accepted', ko: '수락됨', vi: 'Đã chấp nhận' }));
      loadBounty();
    } catch (error) {
      alert(getText({ zh: '操作失败', en: 'Failed', ko: '실패', vi: 'Thất bại' }));
    }
  };

  const handleSubmit = async () => {
    if (!submissionNote.trim()) {
      alert(getText({ zh: '请输入提交说明', en: 'Please enter note', ko: '메모를 입력하세요', vi: 'Vui lòng nhập ghi chú' }));
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/v1/bounties/${id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ note: submissionNote }),
      });

      if (!response.ok) throw new Error('提交失败');

      alert(getText({ zh: '提交成功', en: 'Submitted', ko: '제출됨', vi: 'Đã gửi' }));
      loadBounty();
    } catch (error) {
      alert(getText({ zh: '提交失败', en: 'Submit failed', ko: '제출 실패', vi: 'Gửi thất bại' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async () => {
    if (!confirm(getText({ zh: '确认完成并支付赏金？', en: 'Confirm and pay?', ko: '확인하고 지불하시겠습니까?', vi: 'Xác nhận và thanh toán?' }))) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/v1/bounties/${id}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('操作失败');

      alert(getText({ zh: '已确认完成', en: 'Completed', ko: '완료됨', vi: 'Hoàn thành' }));
      loadBounty();
    } catch (error) {
      alert(getText({ zh: '操作失败', en: 'Failed', ko: '실패', vi: 'Thất bại' }));
    }
  };

  const handleCancel = async () => {
    if (!confirm(getText({ zh: '确定取消悬赏？赏金将退还', en: 'Cancel bounty?', ko: '현상금을 취소하시겠습니까?', vi: 'Hủy truy nã?' }))) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/v1/bounties/${id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: '发布者取消' }),
      });

      if (!response.ok) throw new Error('取消失败');

      alert(getText({ zh: '已取消', en: 'Cancelled', ko: '취소됨', vi: 'Đã hủy' }));
      navigate(-1);
    } catch (error: any) {
      alert(error.message || getText({ zh: '取消失败', en: 'Cancel failed', ko: '취소 실패', vi: 'Hủy thất bại' }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (!bounty) {
    return (
      <div className="p-4 text-center text-gray-500">
        {getText({ zh: '悬赏不存在', en: 'Not found', ko: '찾을 수 없음', vi: 'Không tìm thấy' })}
      </div>
    );
  }

  const isPublisher = currentUserId === bounty.user.id;
  const isAcceptor = currentUserId === bounty.acceptedUser?.id;
  const canApply = bounty.status === 'OPEN' && !isPublisher;
  const canSubmit = bounty.status === 'IN_PROGRESS' && isAcceptor;
  const canComplete = bounty.status === 'SUBMITTED' && isPublisher;
  const canCancel = bounty.status === 'OPEN' && isPublisher;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 to-pink-500 text-white p-4 flex items-center gap-3 shadow-md">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">{getText({ zh: '悬赏详情', en: 'Bounty Detail', ko: '현상금 세부정보', vi: 'Chi tiết truy nã' })}</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* 基本信息 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-800">{bounty.title}</h2>
            <span className="px-3 py-1 bg-orange-100 text-orange-600 text-sm font-bold rounded-full">
              {bounty.reward}π
            </span>
          </div>
          
          <p className="text-gray-600 text-sm mb-4 whitespace-pre-wrap">{bounty.description}</p>
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{bounty.user.username}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(bounty.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* 接单者信息 */}
        {bounty.acceptedUser && (
          <div className="bg-blue-50 rounded-xl p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-2">
              {getText({ zh: '接单者', en: 'Acceptor', ko: '수락자', vi: 'Người nhận' })}
            </h3>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-700">{bounty.acceptedUser.username}</span>
            </div>
          </div>
        )}

        {/* 提交的成果 */}
        {bounty.status === 'SUBMITTED' && bounty.submissionNote && (
          <div className="bg-green-50 rounded-xl p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-2">
              {getText({ zh: '提交的成果', en: 'Submission', ko: '제출물', vi: 'Bài nộp' })}
            </h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{bounty.submissionNote}</p>
          </div>
        )}

        {/* 申请列表（仅发布者可见） */}
        {isPublisher && bounty.applications && bounty.applications.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              {getText({ zh: '申请列表', en: 'Applications', ko: '신청 목록', vi: 'Danh sách đơn' })}
              <span className="text-purple-600">({bounty.applications.length})</span>
            </h3>
            <div className="space-y-2">
              {bounty.applications.map((app) => (
                <div key={app.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">{app.user.username}</span>
                    </div>
                    {app.status === 'PENDING' && bounty.status === 'OPEN' && (
                      <button
                        onClick={() => handleAcceptApplication(app.id)}
                        className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600"
                      >
                        {getText({ zh: '选择TA', en: 'Accept', ko: '수락', vi: 'Chấp nhận' })}
                      </button>
                    )}
                    {app.status === 'ACCEPTED' && (
                      <span className="text-xs text-green-600 font-medium">
                        {getText({ zh: '已选择', en: 'Accepted', ko: '수락됨', vi: 'Đã chấp nhận' })}
                      </span>
                    )}
                  </div>
                  {app.message && (
                    <p className="text-xs text-gray-600">{app.message}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 申请接单 */}
        {canApply && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 mb-3">
              {getText({ zh: '申请接单', en: 'Apply', ko: '신청', vi: 'Nộp đơn' })}
            </h3>
            <textarea
              value={applyMessage}
              onChange={(e) => setApplyMessage(e.target.value)}
              placeholder={getText({ zh: '说明你的优势...', en: 'Your advantages...', ko: '당신의 장점...', vi: 'Ưu điểm của bạn...' })}
              className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:border-purple-400"
              rows={4}
            />
            <button
              onClick={handleApply}
              disabled={isSubmitting}
              className="w-full mt-3 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {getText({ zh: '提交申请', en: 'Submit', ko: '제출', vi: 'Gửi' })}
            </button>
          </div>
        )}

        {/* 提交成果 */}
        {canSubmit && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 mb-3">
              {getText({ zh: '提交成果', en: 'Submit Work', ko: '작업 제출', vi: 'Nộp công việc' })}
            </h3>
            <textarea
              value={submissionNote}
              onChange={(e) => setSubmissionNote(e.target.value)}
              placeholder={getText({ zh: '描述你完成的内容...', en: 'Describe your work...', ko: '작업 설명...', vi: 'Mô tả công việc...' })}
              className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:border-purple-400"
              rows={4}
            />
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full mt-3 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
              {getText({ zh: '提交成果', en: 'Submit', ko: '제출', vi: 'Gửi' })}
            </button>
          </div>
        )}

        {/* 确认完成 */}
        {canComplete && (
          <button
            onClick={handleComplete}
            className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-bold rounded-lg hover:opacity-90 flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            {getText({ zh: '确认完成并支付', en: 'Confirm & Pay', ko: '확인 및 지불', vi: 'Xác nhận & Thanh toán' })}
          </button>
        )}

        {/* 取消悬赏 */}
        {canCancel && (
          <button
            onClick={handleCancel}
            className="w-full py-3 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600 flex items-center justify-center gap-2"
          >
            <XCircle className="w-5 h-5" />
            {getText({ zh: '取消悬赏', en: 'Cancel', ko: '취소', vi: 'Hủy' })}
          </button>
        )}
      </div>
    </div>
  );
};
