import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowLeft, User, Calendar, DollarSign, Shield, AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Language, Translations } from '../types';
import { escrowApi, EscrowTrade } from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const EscrowDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useOutletContext<{ language: Language; translations: Translations }>();
  const [trade, setTrade] = useState<EscrowTrade | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [showDisputeForm, setShowDisputeForm] = useState(false);

  const getText = (obj: { [key: string]: string }) => obj[language] || obj.zh;

  useEffect(() => {
    loadTrade();
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

  const loadTrade = async () => {
    try {
      setIsLoading(true);
      const data = await escrowApi.getTrade(id!);
      setTrade(data);
    } catch (error) {
      console.error('加载交易详情失败:', error);
      alert(getText({ zh: '加载失败', en: 'Load failed', ko: '로드 실패', vi: 'Tải thất bại' }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!confirm(getText({ zh: '确定接单？', en: 'Accept order?', ko: '주문을 수락하시겠습니까?', vi: 'Chấp nhận đơn hàng?' }))) return;

    try {
      setIsSubmitting(true);
      await escrowApi.acceptTrade(id!);
      alert(getText({ zh: '接单成功', en: 'Accepted', ko: '수락됨', vi: 'Đã chấp nhận' }));
      loadTrade();
    } catch (error: any) {
      alert(error.message || getText({ zh: '操作失败', en: 'Failed', ko: '실패', vi: 'Thất bại' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePay = async () => {
    if (!confirm(getText({ zh: '确定付款？资金将托管到平台', en: 'Confirm payment?', ko: '결제를 확인하시겠습니까?', vi: 'Xác nhận thanh toán?' }))) return;

    try {
      setIsSubmitting(true);
      await escrowApi.payTrade(id!);
      alert(getText({ zh: '付款成功', en: 'Paid', ko: '결제됨', vi: 'Đã thanh toán' }));
      loadTrade();
    } catch (error: any) {
      alert(error.message || getText({ zh: '付款失败', en: 'Payment failed', ko: '결제 실패', vi: 'Thanh toán thất bại' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeliver = async () => {
    if (!confirm(getText({ zh: '确定已交付？', en: 'Confirm delivery?', ko: '배송을 확인하시겠습니까?', vi: 'Xác nhận giao hàng?' }))) return;

    try {
      setIsSubmitting(true);
      await escrowApi.deliverTrade(id!);
      alert(getText({ zh: '已标记为交付', en: 'Delivered', ko: '배송됨', vi: 'Đã giao' }));
      loadTrade();
    } catch (error: any) {
      alert(error.message || getText({ zh: '操作失败', en: 'Failed', ko: '실패', vi: 'Thất bại' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async () => {
    if (!confirm(getText({ zh: '确认完成？资金将释放给卖家', en: 'Confirm completion?', ko: '완료를 확인하시겠습니까?', vi: 'Xác nhận hoàn thành?' }))) return;

    try {
      setIsSubmitting(true);
      await escrowApi.completeTrade(id!);
      alert(getText({ zh: '交易已完成', en: 'Completed', ko: '완료됨', vi: 'Đã hoàn thành' }));
      loadTrade();
    } catch (error: any) {
      alert(error.message || getText({ zh: '操作失败', en: 'Failed', ko: '실패', vi: 'Thất bại' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm(getText({ zh: '确定取消交易？', en: 'Cancel trade?', ko: '거래를 취소하시겠습니까?', vi: 'Hủy giao dịch?' }))) return;

    try {
      setIsSubmitting(true);
      await escrowApi.cancelTrade(id!, '用户取消');
      alert(getText({ zh: '已取消', en: 'Cancelled', ko: '취소됨', vi: 'Đã hủy' }));
      navigate(-1);
    } catch (error: any) {
      alert(error.message || getText({ zh: '取消失败', en: 'Cancel failed', ko: '취소 실패', vi: 'Hủy thất bại' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateDispute = async () => {
    if (!disputeReason.trim()) {
      alert(getText({ zh: '请输入纠纷原因', en: 'Please enter reason', ko: '이유를 입력하세요', vi: 'Vui lòng nhập lý do' }));
      return;
    }

    try {
      setIsSubmitting(true);
      await escrowApi.createDispute(id!, { reason: disputeReason });
      alert(getText({ zh: '纠纷已提交，等待管理员处理', en: 'Dispute submitted', ko: '분쟁이 제출되었습니다', vi: 'Đã gửi tranh chấp' }));
      setShowDisputeForm(false);
      loadTrade();
    } catch (error: any) {
      alert(error.message || getText({ zh: '提交失败', en: 'Submit failed', ko: '제출 실패', vi: 'Gửi thất bại' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (!trade) {
    return (
      <div className="p-4 text-center text-gray-500">
        {getText({ zh: '交易不存在', en: 'Not found', ko: '찾을 수 없음', vi: 'Không tìm thấy' })}
      </div>
    );
  }

  const isBuyer = currentUserId === trade.buyer.id;
  const isSeller = currentUserId === trade.seller?.id;
  const canAccept = trade.status === 'PENDING' && !isBuyer && !isSeller;
  const canPay = trade.status === 'ACCEPTED' && isBuyer;
  const canDeliver = trade.status === 'PAID' && isSeller;
  const canComplete = trade.status === 'DELIVERED' && isBuyer;
  const canCancel = (trade.status === 'PENDING' || trade.status === 'ACCEPTED') && (isBuyer || isSeller);
  const canDispute = (trade.status === 'PAID' || trade.status === 'DELIVERED') && (isBuyer || isSeller);

  const statusMap: any = {
    PENDING: { text: { zh: '等待接单', en: 'Awaiting', ko: '대기 중', vi: 'Chờ đợi' }, color: 'bg-orange-100 text-orange-600' },
    ACCEPTED: { text: { zh: '已接单', en: 'Accepted', ko: '수락됨', vi: 'Đã chấp nhận' }, color: 'bg-blue-100 text-blue-600' },
    PAID: { text: { zh: '已付款', en: 'Paid', ko: '결제됨', vi: 'Đã thanh toán' }, color: 'bg-green-100 text-green-600' },
    DELIVERED: { text: { zh: '已交付', en: 'Delivered', ko: '배송됨', vi: 'Đã giao' }, color: 'bg-purple-100 text-purple-600' },
    COMPLETED: { text: { zh: '已完成', en: 'Completed', ko: '완료됨', vi: 'Đã hoàn thành' }, color: 'bg-gray-100 text-gray-600' },
    DISPUTED: { text: { zh: '纠纷中', en: 'Disputed', ko: '분쟁 중', vi: 'Tranh chấp' }, color: 'bg-red-100 text-red-600' },
    CANCELLED: { text: { zh: '已取消', en: 'Cancelled', ko: '취소됨', vi: 'Đã hủy' }, color: 'bg-gray-100 text-gray-400' },
  };

  const statusInfo = statusMap[trade.status] || statusMap.PENDING;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 to-pink-500 text-white p-4 flex items-center gap-3 shadow-md">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">{getText({ zh: '担保交易详情', en: 'Escrow Detail', ko: '에스크로 세부정보', vi: 'Chi tiết ký quỹ' })}</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* 基本信息 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-800">{trade.title}</h2>
            <span className={`px-3 py-1 text-sm font-bold rounded-full ${statusInfo.color}`}>
              {statusInfo.text[language]}
            </span>
          </div>
          
          <p className="text-gray-600 text-sm mb-4 whitespace-pre-wrap">{trade.description || getText({ zh: '暂无描述', en: 'No description', ko: '설명 없음', vi: 'Không có mô tả' })}</p>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-orange-600" />
              <span className="text-2xl font-bold text-orange-600">{trade.amount}π</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{getText({ zh: '买家', en: 'Buyer', ko: '구매자', vi: 'Người mua' })}:</span>
              <span className="font-medium text-gray-800">{trade.buyer.username}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{getText({ zh: '卖家', en: 'Seller', ko: '판매자', vi: 'Người bán' })}:</span>
              <span className="font-medium text-gray-800">{trade.seller?.username || getText({ zh: '待接单', en: 'Pending', ko: '대기 중', vi: 'Chờ đợi' })}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{getText({ zh: '创建时间', en: 'Created', ko: '생성 시간', vi: 'Thời gian tạo' })}:</span>
              <span className="text-gray-800">{new Date(trade.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* 流程说明 */}
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-blue-900 mb-2">
                {getText({ zh: '交易流程', en: 'Process', ko: '프로세스', vi: 'Quy trình' })}
              </h3>
              <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                <li>{getText({ zh: '卖家接单', en: 'Seller accepts', ko: '판매자 수락', vi: 'Người bán chấp nhận' })}</li>
                <li>{getText({ zh: '买家付款到平台托管', en: 'Buyer pays to escrow', ko: '구매자 에스크로 결제', vi: 'Người mua thanh toán ký quỹ' })}</li>
                <li>{getText({ zh: '卖家交付商品/服务', en: 'Seller delivers', ko: '판매자 배송', vi: 'Người bán giao hàng' })}</li>
                <li>{getText({ zh: '买家确认收货', en: 'Buyer confirms', ko: '구매자 확인', vi: 'Người mua xác nhận' })}</li>
                <li>{getText({ zh: '平台释放资金给卖家', en: 'Platform releases funds', ko: '플랫폼 자금 해제', vi: 'Nền tảng giải phóng tiền' })}</li>
              </ol>
            </div>
          </div>
        </div>

        {/* 纠纷表单 */}
        {showDisputeForm && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 mb-3">
              {getText({ zh: '发起纠纷', en: 'Create Dispute', ko: '분쟁 생성', vi: 'Tạo tranh chấp' })}
            </h3>
            <textarea
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder={getText({ zh: '请详细描述纠纷原因...', en: 'Describe the issue...', ko: '문제를 설명하세요...', vi: 'Mô tả vấn đề...' })}
              className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:border-purple-400"
              rows={4}
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleCreateDispute}
                disabled={isSubmitting}
                className="flex-1 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {getText({ zh: '提交纠纷', en: 'Submit', ko: '제출', vi: 'Gửi' })}
              </button>
              <button
                onClick={() => setShowDisputeForm(false)}
                className="flex-1 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300"
              >
                {getText({ zh: '取消', en: 'Cancel', ko: '취소', vi: 'Hủy' })}
              </button>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="space-y-2">
          {canAccept && (
            <button
              onClick={handleAccept}
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
              {getText({ zh: '接单', en: 'Accept', ko: '수락', vi: 'Chấp nhận' })}
            </button>
          )}

          {canPay && (
            <button
              onClick={handlePay}
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <DollarSign className="w-5 h-5" />}
              {getText({ zh: '付款', en: 'Pay', ko: '결제', vi: 'Thanh toán' })}
            </button>
          )}

          {canDeliver && (
            <button
              onClick={handleDeliver}
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
              {getText({ zh: '确认交付', en: 'Deliver', ko: '배송', vi: 'Giao hàng' })}
            </button>
          )}

          {canComplete && (
            <button
              onClick={handleComplete}
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
              {getText({ zh: '确认完成', en: 'Complete', ko: '완료', vi: 'Hoàn thành' })}
            </button>
          )}

          {canDispute && !showDisputeForm && (
            <button
              onClick={() => setShowDisputeForm(true)}
              className="w-full py-3 bg-yellow-500 text-white font-bold rounded-lg hover:bg-yellow-600 flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-5 h-5" />
              {getText({ zh: '发起纠纷', en: 'Dispute', ko: '분쟁', vi: 'Tranh chấp' })}
            </button>
          )}

          {canCancel && (
            <button
              onClick={handleCancel}
              disabled={isSubmitting}
              className="w-full py-3 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
              {getText({ zh: '取消交易', en: 'Cancel', ko: '취소', vi: 'Hủy' })}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
