import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { Language, Translations } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface MerchantAfterSalePageProps {
  language: Language;
  translations: Translations;
}

export const MerchantAfterSalePage: React.FC<MerchantAfterSalePageProps> = ({ language }) => {
  const navigate = useNavigate();
  const [afterSales, setAfterSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedAfterSale, setSelectedAfterSale] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState('');

  const getText = (texts: { zh: string; en: string; ko: string; vi: string }) => texts[language];

  useEffect(() => {
    fetchAfterSales();
  }, []);

  const fetchAfterSales = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const merchantId = localStorage.getItem('currentMerchantId');
      
      const response = await fetch(`${API_URL}/api/v1/after-sales/merchant?merchantId=${merchantId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAfterSales(data);
      }
    } catch (error) {
      console.error('获取售后列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (agreed: boolean) => {
    if (!selectedAfterSale) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/v1/after-sales/${selectedAfterSale.id}/merchant-reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          agreed,
          reply: replyText,
        }),
      });

      if (response.ok) {
        alert(getText({ 
          zh: agreed ? '已同意售后申请' : '已拒绝售后申请', 
          en: agreed ? 'Approved' : 'Rejected', 
          ko: agreed ? '승인됨' : '거부됨', 
          vi: agreed ? 'Đã chấp nhận' : 'Đã từ chối' 
        }));
        setShowReplyModal(false);
        setShowDetailModal(false);
        setReplyText('');
        fetchAfterSales();
      }
    } catch (error) {
      console.error('回复失败:', error);
      alert(getText({ zh: '操作失败', en: 'Failed', ko: '실패', vi: 'Thất bại' }));
    }
  };

  const handleConfirmReturn = async () => {
    if (!selectedAfterSale) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/v1/after-sales/${selectedAfterSale.id}/merchant-confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert(getText({ zh: '已确认收货，退款处理中', en: 'Confirmed', ko: '확인됨', vi: 'Đã xác nhận' }));
        setShowDetailModal(false);
        fetchAfterSales();
      }
    } catch (error) {
      console.error('确认收货失败:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      PENDING: 'bg-yellow-100 text-yellow-600',
      MERCHANT_AGREED: 'bg-green-100 text-green-600',
      MERCHANT_REJECTED: 'bg-red-100 text-red-600',
      BUYER_SHIPPING: 'bg-blue-100 text-blue-600',
      MERCHANT_RECEIVED: 'bg-purple-100 text-purple-600',
      REFUNDING: 'bg-orange-100 text-orange-600',
      COMPLETED: 'bg-gray-100 text-gray-600',
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  const getStatusText = (status: string) => {
    const texts: any = {
      PENDING: getText({ zh: '待处理', en: 'Pending', ko: '대기 중', vi: 'Chờ xử lý' }),
      MERCHANT_AGREED: getText({ zh: '已同意', en: 'Agreed', ko: '동의함', vi: 'Đã đồng ý' }),
      MERCHANT_REJECTED: getText({ zh: '已拒绝', en: 'Rejected', ko: '거부됨', vi: 'Đã từ chối' }),
      BUYER_SHIPPING: getText({ zh: '买家退货中', en: 'Returning', ko: '반품 중', vi: 'Đang trả hàng' }),
      MERCHANT_RECEIVED: getText({ zh: '已收货', en: 'Received', ko: '수령됨', vi: 'Đã nhận' }),
      REFUNDING: getText({ zh: '退款中', en: 'Refunding', ko: '환불 중', vi: 'Đang hoàn tiền' }),
      COMPLETED: getText({ zh: '已完成', en: 'Completed', ko: '완료', vi: 'Hoàn thành' }),
    };
    return texts[status] || status;
  };

  const filteredAfterSales = selectedStatus === 'ALL' 
    ? afterSales 
    : afterSales.filter(item => item.status === selectedStatus);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">
            {getText({ zh: '售后管理', en: 'After Sales', ko: '애프터 서비스', vi: 'Dịch vụ sau bán' })}
          </h1>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          {['ALL', 'PENDING', 'MERCHANT_AGREED', 'BUYER_SHIPPING', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                selectedStatus === status
                  ? 'bg-white text-purple-600'
                  : 'bg-white/20 text-white'
              }`}
            >
              {status === 'ALL' ? getText({ zh: '全部', en: 'All', ko: '전체', vi: 'Tất cả' }) : getStatusText(status)}
            </button>
          ))}
        </div>
      </div>

      {/* After Sales List */}
      <div className="p-4 space-y-3">
        {filteredAfterSales.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Package size={48} className="mx-auto mb-2 opacity-50" />
            <p>{getText({ zh: '暂无售后申请', en: 'No after sales', ko: '애프터 서비스 없음', vi: 'Không có dịch vụ' })}</p>
          </div>
        ) : (
          filteredAfterSales.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setSelectedAfterSale(item);
                setShowDetailModal(true);
              }}
              className="bg-white rounded-lg p-4 shadow-sm active:bg-gray-50"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm text-gray-500">
                    {getText({ zh: '订单号', en: 'Order', ko: '주문', vi: 'Đơn hàng' })}: {item.orderNo}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${getStatusColor(item.status)}`}>
                  {getStatusText(item.status)}
                </span>
              </div>

              <div className="border-t pt-2 mt-2">
                <p className="text-sm font-medium text-gray-800">{item.reason}</p>
                {item.description && (
                  <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                )}
                <p className="text-sm font-bold text-purple-600 mt-2">
                  {getText({ zh: '退款金额', en: 'Refund', ko: '환불', vi: 'Hoàn tiền' })}: {item.amount}π
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedAfterSale && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white rounded-t-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b sticky top-0 bg-white">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">
                  {getText({ zh: '售后详情', en: 'Details', ko: '세부정보', vi: 'Chi tiết' })}
                </h3>
                <button onClick={() => setShowDetailModal(false)} className="text-gray-400">
                  <XCircle size={24} />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Status */}
              <div>
                <span className={`px-3 py-1.5 rounded-lg text-sm ${getStatusColor(selectedAfterSale.status)}`}>
                  {getStatusText(selectedAfterSale.status)}
                </span>
              </div>

              {/* Order Info */}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">
                  {getText({ zh: '订单号', en: 'Order', ko: '주문', vi: 'Đơn hàng' })}: {selectedAfterSale.orderNo}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {getText({ zh: '申请时间', en: 'Time', ko: '시간', vi: 'Thời gian' })}: {new Date(selectedAfterSale.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Reason */}
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  {getText({ zh: '申请原因', en: 'Reason', ko: '이유', vi: 'Lý do' })}
                </p>
                <p className="text-base font-medium">{selectedAfterSale.reason}</p>
                {selectedAfterSale.description && (
                  <p className="text-sm text-gray-600 mt-2">{selectedAfterSale.description}</p>
                )}
              </div>

              {/* Amount */}
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  {getText({ zh: '退款金额', en: 'Refund Amount', ko: '환불 금액', vi: 'Số tiền hoàn' })}
                </p>
                <p className="text-2xl font-bold text-purple-600">{selectedAfterSale.amount}π</p>
              </div>

              {/* Images */}
              {selectedAfterSale.images && selectedAfterSale.images.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">
                    {getText({ zh: '凭证图片', en: 'Images', ko: '이미지', vi: 'Hình ảnh' })}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedAfterSale.images.map((img: string, idx: number) => (
                      <img key={idx} src={img} alt="" className="w-full h-24 object-cover rounded" />
                    ))}
                  </div>
                </div>
              )}

              {/* Tracking Info */}
              {selectedAfterSale.returnTrackingNo && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-blue-800 mb-1">
                    {getText({ zh: '退货物流', en: 'Return Tracking', ko: '반품 추적', vi: 'Theo dõi trả hàng' })}
                  </p>
                  <p className="text-sm text-blue-600">{selectedAfterSale.returnCompany}</p>
                  <p className="text-sm text-blue-600">{selectedAfterSale.returnTrackingNo}</p>
                </div>
              )}

              {/* Merchant Reply */}
              {selectedAfterSale.merchantReply && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-800 mb-1">
                    {getText({ zh: '商家回复', en: 'Reply', ko: '답변', vi: 'Trả lời' })}
                  </p>
                  <p className="text-sm text-gray-600">{selectedAfterSale.merchantReply}</p>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2 pt-4">
                {selectedAfterSale.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => setShowReplyModal(true)}
                      className="w-full py-3 bg-green-600 text-white rounded-lg font-medium"
                    >
                      {getText({ zh: '同意售后', en: 'Approve', ko: '승인', vi: 'Chấp nhận' })}
                    </button>
                    <button
                      onClick={() => {
                        setShowReplyModal(true);
                      }}
                      className="w-full py-3 bg-red-600 text-white rounded-lg font-medium"
                    >
                      {getText({ zh: '拒绝售后', en: 'Reject', ko: '거부', vi: 'Từ chối' })}
                    </button>
                  </>
                )}

                {selectedAfterSale.status === 'BUYER_SHIPPING' && (
                  <button
                    onClick={handleConfirmReturn}
                    className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium"
                  >
                    {getText({ zh: '确认收货', en: 'Confirm Receipt', ko: '수령 확인', vi: 'Xác nhận nhận hàng' })}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-4">
            <h3 className="text-lg font-bold mb-4">
              {getText({ zh: '回复买家', en: 'Reply', ko: '답변', vi: 'Trả lời' })}
            </h3>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={getText({ zh: '输入回复内容（可选）', en: 'Reply (optional)', ko: '답변 (선택사항)', vi: 'Trả lời (tùy chọn)' })}
              className="w-full p-3 border rounded-lg resize-none"
              rows={4}
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowReplyModal(false)}
                className="flex-1 py-2 border rounded-lg"
              >
                {getText({ zh: '取消', en: 'Cancel', ko: '취소', vi: 'Hủy' })}
              </button>
              <button
                onClick={() => handleReply(false)}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg"
              >
                {getText({ zh: '拒绝', en: 'Reject', ko: '거부', vi: 'Từ chối' })}
              </button>
              <button
                onClick={() => handleReply(true)}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg"
              >
                {getText({ zh: '同意', en: 'Approve', ko: '승인', vi: 'Chấp nhận' })}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
