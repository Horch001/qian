import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Language, Translations } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface AfterSalePageProps {
  language: Language;
  translations: Translations;
}

export const AfterSalePage: React.FC<AfterSalePageProps> = ({ language }) => {
  const navigate = useNavigate();
  const [afterSales, setAfterSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'PROCESSING' | 'COMPLETED'>('ALL');

  const getText = (obj: { [key: string]: string }) => obj[language] || obj.zh;

  useEffect(() => {
    fetchAfterSales();
  }, []);

  const fetchAfterSales = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/v1/after-sales/merchant`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAfterSales(data || []);
      }
    } catch (error) {
      console.error('加载售后列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (id: string, agreed: boolean) => {
    const reply = prompt(getText({ 
      zh: agreed ? '请输入同意理由（可选）' : '请输入拒绝理由', 
      en: agreed ? 'Enter reason (optional)' : 'Enter rejection reason',
      ko: agreed ? '이유 입력 (선택)' : '거부 이유 입력',
      vi: agreed ? 'Nhập lý do (tùy chọn)' : 'Nhập lý do từ chối'
    }));
    
    if (!agreed && !reply) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/v1/after-sales/${id}/merchant-reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ agreed, reply: reply || '' }),
      });

      if (response.ok) {
        alert(getText({ zh: '操作成功', en: 'Success', ko: '성공', vi: 'Thành công' }));
        fetchAfterSales();
      } else {
        const error = await response.json();
        alert(error.message || getText({ zh: '操作失败', en: 'Failed', ko: '실패', vi: 'Thất bại' }));
      }
    } catch (error: any) {
      alert(error.message || getText({ zh: '操作失败', en: 'Failed', ko: '실패', vi: 'Thất bại' }));
    }
  };

  const handleConfirmReturn = async (id: string) => {
    if (!confirm(getText({ zh: '确认已收到退货？', en: 'Confirm received?', ko: '반품 확인?', vi: 'Xác nhận đã nhận?' }))) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/v1/after-sales/${id}/merchant-confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert(getText({ zh: '确认成功，系统将自动退款', en: 'Confirmed, refund processing', ko: '확인됨, 환불 처리 중', vi: 'Đã xác nhận, đang hoàn tiền' }));
        fetchAfterSales();
      } else {
        const error = await response.json();
        alert(error.message || getText({ zh: '操作失败', en: 'Failed', ko: '실패', vi: 'Thất bại' }));
      }
    } catch (error: any) {
      alert(error.message || getText({ zh: '操作失败', en: 'Failed', ko: '실패', vi: 'Thất bại' }));
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: any = {
      PENDING: { zh: '待处理', en: 'Pending', ko: '대기 중', vi: 'Chờ xử lý' },
      MERCHANT_AGREED: { zh: '已同意', en: 'Agreed', ko: '동의됨', vi: 'Đã đồng ý' },
      MERCHANT_REJECTED: { zh: '已拒绝', en: 'Rejected', ko: '거부됨', vi: 'Đã từ chối' },
      BUYER_SHIPPING: { zh: '买家退货中', en: 'Returning', ko: '반품 중', vi: 'Đang trả hàng' },
      MERCHANT_RECEIVED: { zh: '已收货', en: 'Received', ko: '수령됨', vi: 'Đã nhận' },
      REFUNDING: { zh: '退款中', en: 'Refunding', ko: '환불 중', vi: 'Đang hoàn tiền' },
      COMPLETED: { zh: '已完成', en: 'Completed', ko: '완료', vi: 'Hoàn tất' },
      CANCELLED: { zh: '已取消', en: 'Cancelled', ko: '취소됨', vi: 'Đã hủy' },
    };
    return getText(statusMap[status] || { zh: status, en: status, ko: status, vi: status });
  };

  const getTypeText = (type: string) => {
    const typeMap: any = {
      REFUND_ONLY: { zh: '仅退款', en: 'Refund Only', ko: '환불만', vi: 'Chỉ hoàn tiền' },
      RETURN_REFUND: { zh: '退货退款', en: 'Return & Refund', ko: '반품 환불', vi: 'Trả hàng hoàn tiền' },
      EXCHANGE: { zh: '换货', en: 'Exchange', ko: '교환', vi: 'Đổi hàng' },
    };
    return getText(typeMap[type] || { zh: type, en: type, ko: type, vi: type });
  };

  const filteredAfterSales = afterSales.filter(item => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'PENDING') return item.status === 'PENDING';
    if (activeTab === 'PROCESSING') return ['MERCHANT_AGREED', 'BUYER_SHIPPING', 'MERCHANT_RECEIVED', 'REFUNDING'].includes(item.status);
    if (activeTab === 'COMPLETED') return ['COMPLETED', 'CANCELLED', 'MERCHANT_REJECTED'].includes(item.status);
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-600 to-pink-500 flex justify-center">
        <div className="w-full max-w-md flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 to-pink-500 flex justify-center">
      <div className="w-full max-w-md flex flex-col min-h-screen">
        {/* Header */}
        <header className="p-4 flex items-center justify-center relative">
          <button onClick={() => navigate(-1)} className="text-white absolute left-4">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-white">
            {getText({ zh: '售后管理', en: 'After Sales', ko: '애프터 서비스', vi: 'Dịch vụ sau bán' })}
          </h1>
        </header>

        {/* Tabs */}
        <div className="px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {(['ALL', 'PENDING', 'PROCESSING', 'COMPLETED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? 'bg-white text-purple-600'
                    : 'bg-white/20 text-white'
                }`}
              >
                {tab === 'ALL' ? getText({ zh: '全部', en: 'All', ko: '전체', vi: 'Tất cả' }) :
                 tab === 'PENDING' ? getText({ zh: '待处理', en: 'Pending', ko: '대기', vi: 'Chờ' }) :
                 tab === 'PROCESSING' ? getText({ zh: '处理中', en: 'Processing', ko: '처리 중', vi: 'Đang xử lý' }) :
                 getText({ zh: '已完成', en: 'Completed', ko: '완료', vi: 'Hoàn tất' })}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-y-auto">
          {filteredAfterSales.length === 0 ? (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-white/50 mb-3" />
              <p className="text-white/70">
                {getText({ zh: '暂无售后申请', en: 'No after sales', ko: '애프터 서비스 없음', vi: 'Chưa có yêu cầu' })}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAfterSales.map((item) => (
                <div key={item.id} className="bg-white rounded-xl p-4">
                  {/* 头部 */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-sm font-bold text-gray-800">{getTypeText(item.type)}</p>
                      <p className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleString()}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      item.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600' :
                      item.status === 'COMPLETED' ? 'bg-green-100 text-green-600' :
                      item.status === 'MERCHANT_REJECTED' || item.status === 'CANCELLED' ? 'bg-red-100 text-red-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {getStatusText(item.status)}
                    </span>
                  </div>

                  {/* 订单信息 */}
                  <div className="mb-3 pb-3 border-b">
                    <p className="text-sm text-gray-600">
                      {getText({ zh: '订单号', en: 'Order', ko: '주문', vi: 'Đơn hàng' })}: {item.order?.orderNo}
                    </p>
                    <p className="text-sm text-gray-600">
                      {getText({ zh: '买家', en: 'Buyer', ko: '구매자', vi: 'Người mua' })}: {item.user?.username}
                    </p>
                    <p className="text-sm font-bold text-red-600">
                      {getText({ zh: '退款金额', en: 'Amount', ko: '금액', vi: 'Số tiền' })}: {item.amount}π
                    </p>
                  </div>

                  {/* 申请理由 */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">
                      {getText({ zh: '申请理由', en: 'Reason', ko: '이유', vi: 'Lý do' })}:
                    </p>
                    <p className="text-sm text-gray-700">{item.reason}</p>
                    {item.description && (
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    )}
                  </div>

                  {/* 商家回复 */}
                  {item.merchantReply && (
                    <div className="mb-3 p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-500 mb-1">
                        {getText({ zh: '商家回复', en: 'Reply', ko: '답변', vi: 'Phản hồi' })}:
                      </p>
                      <p className="text-sm text-gray-700">{item.merchantReply}</p>
                    </div>
                  )}

                  {/* 退货物流 */}
                  {item.returnLogistics && (
                    <div className="mb-3 p-2 bg-blue-50 rounded">
                      <p className="text-xs text-gray-500 mb-1">
                        {getText({ zh: '退货物流', en: 'Return Logistics', ko: '반품 물류', vi: 'Vận chuyển trả hàng' })}:
                      </p>
                      <p className="text-sm text-gray-700">
                        {item.returnLogistics.company} - {item.returnLogistics.trackingNo}
                      </p>
                    </div>
                  )}

                  {/* 操作按钮 */}
                  {item.status === 'PENDING' && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleReply(item.id, false)}
                        className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600"
                      >
                        {getText({ zh: '拒绝', en: 'Reject', ko: '거부', vi: 'Từ chối' })}
                      </button>
                      <button
                        onClick={() => handleReply(item.id, true)}
                        className="flex-1 py-2 bg-green-500 text-white rounded-lg text-sm font-bold hover:bg-green-600"
                      >
                        {getText({ zh: '同意', en: 'Agree', ko: '동의', vi: 'Đồng ý' })}
                      </button>
                    </div>
                  )}

                  {item.status === 'BUYER_SHIPPING' && (
                    <button
                      onClick={() => handleConfirmReturn(item.id)}
                      className="w-full py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700"
                    >
                      {getText({ zh: '确认收货', en: 'Confirm', ko: '확인', vi: 'Xác nhận' })}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
