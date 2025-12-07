import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Package, Truck } from 'lucide-react';
import { Language, Translations } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface AfterSaleDetailPageProps {
  language: Language;
  translations: Translations;
}

export const AfterSaleDetailPage: React.FC<AfterSaleDetailPageProps> = ({ language }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const afterSaleId = location.state?.afterSaleId;
  
  const [afterSale, setAfterSale] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLogisticsForm, setShowLogisticsForm] = useState(false);
  const [logisticsData, setLogisticsData] = useState({
    returnCompany: '',
    returnTrackingNo: ''
  });

  const getText = (obj: { [key: string]: string }) => obj[language] || obj.zh;

  useEffect(() => {
    if (afterSaleId) {
      fetchAfterSaleDetail();
    }
  }, [afterSaleId]);

  const fetchAfterSaleDetail = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/v1/after-sales/${afterSaleId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setAfterSale(data);
      } else {
        alert(getText({ zh: '获取售后详情失败', en: 'Failed to load', ko: '로드 실패', vi: 'Tải thất bại' }));
        navigate(-1);
      }
    } catch (error) {
      console.error('获取售后详情失败:', error);
      alert(getText({ zh: '获取售后详情失败', en: 'Failed to load', ko: '로드 실패', vi: 'Tải thất bại' }));
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitLogistics = async () => {
    if (!logisticsData.returnCompany.trim() || !logisticsData.returnTrackingNo.trim()) {
      alert(getText({ zh: '请填写完整的物流信息', en: 'Please fill in logistics info', ko: '물류 정보를 입력하세요', vi: 'Vui lòng điền thông tin vận chuyển' }));
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/v1/after-sales/${afterSaleId}/buyer-return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(logisticsData),
      });

      if (response.ok) {
        alert(getText({ zh: '物流信息已提交', en: 'Submitted', ko: '제출됨', vi: 'Đã gửi' }));
        setShowLogisticsForm(false);
        fetchAfterSaleDetail();
      } else {
        const error = await response.json();
        alert(error.message || getText({ zh: '提交失败', en: 'Failed', ko: '실패', vi: 'Thất bại' }));
      }
    } catch (error: any) {
      alert(error.message || getText({ zh: '提交失败', en: 'Failed', ko: '실패', vi: 'Thất bại' }));
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: any = {
      PENDING: { zh: '待商家处理', en: 'Pending', ko: '대기 중', vi: 'Chờ xử lý' },
      MERCHANT_AGREED: { zh: '商家已同意', en: 'Agreed', ko: '동의됨', vi: 'Đã đồng ý' },
      MERCHANT_REJECTED: { zh: '商家已拒绝', en: 'Rejected', ko: '거부됨', vi: 'Đã từ chối' },
      BUYER_SHIPPING: { zh: '退货中', en: 'Returning', ko: '반품 중', vi: 'Đang trả hàng' },
      MERCHANT_RECEIVED: { zh: '商家已收货', en: 'Received', ko: '수령됨', vi: 'Đã nhận' },
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-600 to-pink-500 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!afterSale) {
    return null;
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
            {getText({ zh: '售后详情', en: 'After Sale Detail', ko: '애프터 서비스 상세', vi: 'Chi tiết dịch vụ' })}
          </h1>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {/* 状态卡片 */}
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">{getText({ zh: '售后状态', en: 'Status', ko: '상태', vi: 'Trạng thái' })}</span>
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
              afterSale.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600' :
              afterSale.status === 'COMPLETED' ? 'bg-green-100 text-green-600' :
              afterSale.status === 'MERCHANT_REJECTED' ? 'bg-red-100 text-red-600' :
              'bg-blue-100 text-blue-600'
            }`}>
              {getStatusText(afterSale.status)}
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">{getText({ zh: '售后类型', en: 'Type', ko: '유형', vi: 'Loại' })}</span>
              <span className="font-medium">{getTypeText(afterSale.type)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{getText({ zh: '退款金额', en: 'Amount', ko: '금액', vi: 'Số tiền' })}</span>
              <span className="font-bold text-red-600">{Number(afterSale.amount).toFixed(2)}π</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{getText({ zh: '申请时间', en: 'Apply Time', ko: '신청 시간', vi: 'Thời gian' })}</span>
              <span>{new Date(afterSale.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* 申请理由 */}
        <div className="bg-white rounded-lg p-4">
          <h3 className="text-sm font-bold text-gray-800 mb-2">
            {getText({ zh: '申请理由', en: 'Reason', ko: '이유', vi: 'Lý do' })}
          </h3>
          <p className="text-sm text-gray-700">{afterSale.reason}</p>
          {afterSale.description && (
            <p className="text-sm text-gray-600 mt-2">{afterSale.description}</p>
          )}
        </div>

        {/* 商家回复 */}
        {afterSale.merchantReply && (
          <div className="bg-white rounded-lg p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-2">
              {getText({ zh: '商家回复', en: 'Merchant Reply', ko: '판매자 답변', vi: 'Phản hồi' })}
            </h3>
            <p className="text-sm text-gray-700">{afterSale.merchantReply}</p>
          </div>
        )}

        {/* 退货地址（商家同意退货退款后显示） */}
        {afterSale.status === 'MERCHANT_AGREED' && afterSale.type === 'RETURN_REFUND' && afterSale.returnAddress && (
          <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Package className="text-blue-600" size={20} />
              <h3 className="text-sm font-bold text-blue-800">
                {getText({ zh: '退货地址', en: 'Return Address', ko: '반품 주소', vi: 'Địa chỉ trả hàng' })}
              </h3>
            </div>
            <div className="space-y-1 text-sm">
              <p className="font-medium text-gray-800">
                {afterSale.returnContact} {afterSale.returnPhone}
              </p>
              <p className="text-gray-700">{afterSale.returnAddress}</p>
            </div>
          </div>
        )}

        {/* 填写物流单号按钮 */}
        {afterSale.status === 'MERCHANT_AGREED' && afterSale.type === 'RETURN_REFUND' && !afterSale.returnTrackingNo && (
          <button
            onClick={() => setShowLogisticsForm(true)}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg flex items-center justify-center gap-2"
          >
            <Truck size={20} />
            {getText({ zh: '填写物流单号', en: 'Fill Tracking No', ko: '운송장 번호 입력', vi: 'Điền mã vận đơn' })}
          </button>
        )}

        {/* 物流信息（已填写后显示） */}
        {afterSale.returnTrackingNo && (
          <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
            <div className="flex items-center gap-2 mb-3">
              <Truck className="text-green-600" size={20} />
              <h3 className="text-sm font-bold text-green-800">
                {getText({ zh: '物流信息', en: 'Logistics Info', ko: '물류 정보', vi: 'Thông tin vận chuyển' })}
              </h3>
            </div>
            <div className="space-y-1 text-sm">
              <p className="text-gray-700">
                <span className="text-gray-500">{getText({ zh: '物流公司', en: 'Company', ko: '택배사', vi: 'Công ty' })}:</span> {afterSale.returnCompany}
              </p>
              <p className="text-gray-700">
                <span className="text-gray-500">{getText({ zh: '运单号', en: 'Tracking No', ko: '운송장 번호', vi: 'Mã vận đơn' })}:</span> {afterSale.returnTrackingNo}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 物流填写弹窗 */}
      {showLogisticsForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-4 border-b">
              <h3 className="text-lg font-bold text-gray-800">
                {getText({ zh: '填写物流信息', en: 'Fill Logistics Info', ko: '물류 정보 입력', vi: 'Điền thông tin vận chuyển' })}
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getText({ zh: '物流公司', en: 'Logistics Company', ko: '택배사', vi: 'Công ty vận chuyển' })}
                </label>
                <input
                  type="text"
                  value={logisticsData.returnCompany}
                  onChange={(e) => setLogisticsData({ ...logisticsData, returnCompany: e.target.value })}
                  placeholder={getText({ zh: '请输入物流公司名称', en: 'Enter company name', ko: '택배사 이름 입력', vi: 'Nhập tên công ty' })}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getText({ zh: '运单号', en: 'Tracking Number', ko: '운송장 번호', vi: 'Mã vận đơn' })}
                </label>
                <input
                  type="text"
                  value={logisticsData.returnTrackingNo}
                  onChange={(e) => setLogisticsData({ ...logisticsData, returnTrackingNo: e.target.value })}
                  placeholder={getText({ zh: '请输入运单号', en: 'Enter tracking number', ko: '운송장 번호 입력', vi: 'Nhập mã vận đơn' })}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
            <div className="p-4 border-t flex gap-3">
              <button
                onClick={() => setShowLogisticsForm(false)}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg"
              >
                {getText({ zh: '取消', en: 'Cancel', ko: '취소', vi: 'Hủy' })}
              </button>
              <button
                onClick={handleSubmitLogistics}
                className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold"
              >
                {getText({ zh: '提交', en: 'Submit', ko: '제출', vi: 'Gửi' })}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
