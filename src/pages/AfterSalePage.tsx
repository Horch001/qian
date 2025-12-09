import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { Language, Translations } from '../types';
import eventsSocketService from '../services/eventsSocket';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// 获取服务器基础URL（用于图片）
const getServerBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL || 
    (window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://h.toupiao.pro');
  return url.replace(/\/api\/v1$/, '').replace(/\/$/, '');
};

// 处理图片URL（兼容Base64和文件URL）
const processImageUrl = (imageUrl: string | undefined | null): string => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('data:image/')) return imageUrl;
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
  if (imageUrl.startsWith('/uploads/')) {
    const serverBaseUrl = getServerBaseUrl();
    return `${serverBaseUrl}${imageUrl}`;
  }
  return imageUrl;
};

interface AfterSalePageProps {
  language: Language;
  translations: Translations;
}

export const AfterSalePage: React.FC<AfterSalePageProps> = ({ language }) => {
  const navigate = useNavigate();
  const [afterSales, setAfterSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'COMPLETED' | 'REJECTED'>('PENDING');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const getText = (obj: { [key: string]: string }) => obj[language] || obj.zh;

  useEffect(() => {
    fetchAfterSales();

    // 🔥 监听订单更新（售后也是订单的一部分）
    const handleOrderUpdate = (order: any) => {
      console.log('[AfterSalePage] 收到订单更新:', order);
      // 如果订单有售后，重新加载售后列表
      if (order.hasActiveAfterSale || order.afterSales) {
        fetchAfterSales();
      }
    };

    eventsSocketService.on('order:updated', handleOrderUpdate);

    return () => {
      eventsSocketService.off('order:updated', handleOrderUpdate);
    };
  }, []);

  const fetchAfterSales = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      // 获取所有商家的售后订单
      const merchantsResponse = await fetch(`${API_URL}/api/v1/merchants/my/all`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!merchantsResponse.ok) {
        alert('获取商家信息失败');
        setLoading(false);
        return;
      }
      
      const merchants = await merchantsResponse.json();
      
      if (!merchants || merchants.length === 0) {
        alert('您还不是商家，无法查看售后管理');
        setLoading(false);
        return;
      }
      
      // 获取所有商家的售后订单，并附加店铺信息
      const allAfterSales: any[] = [];
      for (const merchant of merchants) {
        const response = await fetch(`${API_URL}/api/v1/after-sales/merchant?merchantId=${merchant.id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        
        if (response.ok) {
          const data = await response.json();
          // 给每个售后订单附加店铺名称和logo，并处理图片URL
          const dataWithShop = (data || []).map((item: any) => ({
            ...item,
            shopName: merchant.shopName,
            shopLogo: processImageUrl(merchant.logo),
            order: item.order ? {
              ...item.order,
              items: item.order.items?.map((orderItem: any) => ({
                ...orderItem,
                product: orderItem.product ? {
                  ...orderItem.product,
                  images: orderItem.product.images?.map((img: string) => processImageUrl(img)) || [],
                } : orderItem.product,
              })) || [],
            } : item.order,
          }));
          allAfterSales.push(...dataWithShop);
        }
      }
      
      // 按创建时间倒序排序
      allAfterSales.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setAfterSales(allAfterSales);
    } catch (error) {
      console.error('加载售后列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedAfterSale, setSelectedAfterSale] = useState<any>(null);
  const [replyData, setReplyData] = useState({
    agreed: true,
    reply: '',
    returnAddress: '',
    returnContact: '',
    returnPhone: ''
  });

  const handleReply = async (item: any, agreed: boolean) => {
    setSelectedAfterSale(item);
    setReplyData({
      agreed,
      reply: '',
      returnAddress: '',
      returnContact: '',
      returnPhone: ''
    });
    setShowReplyModal(true);
  };

  const handleSubmitReply = async () => {
    if (!replyData.agreed && !replyData.reply.trim()) {
      alert(getText({ zh: '拒绝时必须填写理由', en: 'Reason required', ko: '이유 필요', vi: 'Cần lý do' }));
      return;
    }

    // 如果同意退货退款，必须填写退货地址
    if (replyData.agreed && selectedAfterSale.type === 'RETURN_REFUND') {
      if (!replyData.returnAddress.trim() || !replyData.returnContact.trim() || !replyData.returnPhone.trim()) {
        alert(getText({ zh: '退货退款需要填写退货地址、联系人和电话', en: 'Return address required', ko: '반품 주소 필요', vi: 'Cần địa chỉ trả hàng' }));
        return;
      }
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/v1/after-sales/${selectedAfterSale.id}/merchant-reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(replyData),
      });

      if (response.ok) {
        alert(getText({ zh: '操作成功', en: 'Success', ko: '성공', vi: 'Thành công' }));
        setShowReplyModal(false);
        setSelectedAfterSale(null);
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
    if (activeTab === 'COMPLETED') return ['COMPLETED', 'MERCHANT_AGREED', 'BUYER_SHIPPING', 'MERCHANT_RECEIVED', 'REFUNDING'].includes(item.status);
    if (activeTab === 'REJECTED') return ['MERCHANT_REJECTED', 'CANCELLED'].includes(item.status);
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
            {(['ALL', 'PENDING', 'COMPLETED', 'REJECTED'] as const).map((tab) => (
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
                 tab === 'COMPLETED' ? getText({ zh: '已完成', en: 'Completed', ko: '완료', vi: 'Hoàn tất' }) :
                 getText({ zh: '已拒绝', en: 'Rejected', ko: '거부됨', vi: 'Đã từ chối' })}
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
            <div className="space-y-2">
              {filteredAfterSales.map((item) => {
                const isExpanded = expandedCards.has(item.id);
                const toggleExpand = () => {
                  const newExpanded = new Set(expandedCards);
                  if (isExpanded) {
                    newExpanded.delete(item.id);
                  } else {
                    newExpanded.add(item.id);
                  }
                  setExpandedCards(newExpanded);
                };

                return (
                  <div key={item.id} className="bg-white rounded-lg p-3">
                    {/* 头部：店铺logo + 店铺名 + 状态 + 展开按钮 */}
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2 flex-1">
                        {item.shopLogo ? (
                          <img src={item.shopLogo} alt={item.shopName} className="w-5 h-5 rounded object-cover" />
                        ) : (
                          <span className="text-base">📦</span>
                        )}
                        <span className="text-xs font-bold text-purple-600">{item.shopName}</span>
                        <span className="text-xs text-gray-500">·</span>
                        <span className="text-xs text-gray-600">{getTypeText(item.type)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          item.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600' :
                          item.status === 'COMPLETED' ? 'bg-green-100 text-green-600' :
                          item.status === 'MERCHANT_REJECTED' || item.status === 'CANCELLED' ? 'bg-red-100 text-red-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {getStatusText(item.status)}
                        </span>
                        <button onClick={toggleExpand} className="text-gray-500 hover:text-gray-700">
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      </div>
                    </div>

                    {/* 商品简要信息 - 始终显示 */}
                    {!isExpanded && item.order?.items && item.order.items.length > 0 && (
                      <div className="ml-7 space-y-1">
                        <div className="flex justify-between items-center text-xs text-gray-600">
                          <span className="truncate flex-1">
                            {item.order.items[0].product?.title || getText({ zh: '商品', en: 'Product', ko: '상품', vi: 'Sản phẩm' })}
                          </span>
                          <span className="font-bold text-red-600 ml-2">
                            {Number(item.order.items[0].price).toFixed(2)}π
                          </span>
                        </div>
                        {/* 物流信息快速预览 */}
                        {item.returnCompany && item.returnTrackingNo && (
                          <div className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                            🚚 {item.returnCompany}: {item.returnTrackingNo}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 详细信息 - 展开时显示 */}
                    {isExpanded && (
                      <div className="border-t">
                        {item.order?.items && item.order.items.length > 0 ? (
                    <div className="flex gap-2 border-b py-1">
                      {item.order.items[0].product?.images?.[0] && (
                        <img 
                          src={item.order.items[0].product.images[0]} 
                          alt={item.order.items[0].product.title} 
                          className="w-16 h-16 object-cover rounded" 
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.order.items[0].product?.title || getText({ zh: '商品', en: 'Product', ko: '상품', vi: 'Sản phẩm' })}
                        </p>
                        <p className="text-xs text-red-500 font-bold">
                          {Number(item.order.items[0].price).toFixed(2)}π × {item.order.items[0].quantity}
                          {item.order.items.length > 1 && ` 等${item.order.items.length}件`}
                        </p>
                        <p className="text-xs text-gray-600">
                          {getText({ zh: '买家', en: 'Buyer', ko: '구매자', vi: 'Người mua' })}: {item.buyerName || getText({ zh: '未知', en: 'Unknown', ko: '알 수 없음', vi: 'Không rõ' })}
                        </p>
                        {item.order?.address && (
                          <>
                            <p className="text-xs text-gray-500">
                              {getText({ zh: '收货人', en: 'Receiver', ko: '수령인', vi: 'Người nhận' })}: {item.order.address.receiverName} {item.order.address.receiverPhone}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {getText({ zh: '地址', en: 'Address', ko: '주소', vi: 'Địa chỉ' })}: {item.order.address.province} {item.order.address.city} {item.order.address.district} {item.order.address.detail}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="border-b py-1 pl-[4.5rem]">
                      <p className="text-xs text-gray-500">{getText({ zh: '买家', en: 'Buyer', ko: '구매자', vi: 'Người mua' })}: {item.buyerName || getText({ zh: '未知', en: 'Unknown', ko: '알 수 없음', vi: 'Không rõ' })}</p>
                      <p className="text-xs text-gray-400">{getText({ zh: '商品信息已删除', en: 'Product deleted', ko: '상품 삭제됨', vi: 'Sản phẩm đã xóa' })}</p>
                    </div>
                  )}
                  {!item.order?.address && item.order?.items && item.order.items.length > 0 && (
                    <div className="border-b py-1 pl-[4.5rem]">
                      <p className="text-xs text-orange-500">{getText({ zh: '⚠️ 无地址信息', en: '⚠️ No address', ko: '⚠️ 주소 없음', vi: '⚠️ Không có địa chỉ' })}</p>
                    </div>
                  )}
                  <div className="border-b py-1 pl-[4.5rem]">
                    <p className="text-xs text-gray-500">
                      <span className="text-gray-500">{getText({ zh: '退款理由', en: 'Refund Reason', ko: '환불 이유', vi: 'Lý do hoàn tiền' })}:</span>
                      <span className="text-gray-700"> {item.reason}</span>
                      {item.description && <span className="text-gray-600"> {item.description}</span>}
                    </p>
                  </div>
                  {item.merchantReply && (
                    <div className="border-b py-1 pl-[4.5rem]">
                      <p className="text-xs text-gray-500">
                        <span className="text-gray-500">{getText({ zh: '商家回复', en: 'Merchant Reply', ko: '판매자 답변', vi: 'Phản hồi người bán' })}:</span>
                        <span className="text-gray-700"> {item.merchantReply}</span>
                      </p>
                    </div>
                  )}
                  {/* 退货地址（商家同意退货退款后显示） */}
                  {item.returnAddress && (
                    <div className="border-b py-2 pl-[4.5rem] bg-blue-50 rounded">
                      <p className="text-xs text-blue-800 font-bold mb-1">
                        📦 {getText({ zh: '退货地址', en: 'Return Address', ko: '반품 주소', vi: 'Địa chỉ trả hàng' })}
                      </p>
                      <p className="text-xs text-gray-800 font-medium">
                        {item.returnContact} {item.returnPhone}
                      </p>
                      <p className="text-xs text-gray-700 mt-0.5">
                        {item.returnAddress}
                      </p>
                    </div>
                  )}
                  {/* 退货物流信息（买家填写后显示） */}
                  {item.returnCompany && item.returnTrackingNo && (
                    <div className="border-b py-2 pl-[4.5rem] bg-green-50 rounded">
                      <p className="text-xs text-green-800 font-bold mb-1">
                        🚚 {getText({ zh: '买家退货物流', en: 'Return Logistics', ko: '반품 물류', vi: 'Vận chuyển trả hàng' })}
                      </p>
                      <p className="text-xs text-gray-800 font-medium">
                        {getText({ zh: '物流公司', en: 'Company', ko: '택배사', vi: 'Công ty' })}: {item.returnCompany}
                      </p>
                      <p className="text-xs text-gray-800 font-medium mt-0.5">
                        {getText({ zh: '运单号', en: 'Tracking', ko: '운송장', vi: 'Mã vận đơn' })}: {item.returnTrackingNo}
                      </p>
                    </div>
                  )}

                        <div className="border-b py-1 pl-[4.5rem]">
                          <p className="text-xs text-gray-500">
                            {getText({ zh: '下单时间', en: 'Order Time', ko: '주문 시간', vi: 'Thời gian đặt' })}: {item.order?.createdAt ? new Date(item.order.createdAt).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}
                          </p>
                        </div>
                        <div className="border-b py-1 pl-[4.5rem]">
                          <p className="text-xs text-gray-500">
                            {getText({ zh: '申请时间', en: 'Apply Time', ko: '신청 시간', vi: 'Thời gian yêu cầu' })}: {new Date(item.createdAt).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {item.merchantRepliedAt && (
                          <div className="border-b py-1 pl-[4.5rem]">
                            <p className="text-xs text-gray-500">
                              {getText({ zh: '处理时间', en: 'Process Time', ko: '처리 시간', vi: 'Thời gian xử lý' })}: {new Date(item.merchantRepliedAt).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        )}
                        <div className="border-b py-1 pl-[4.5rem]">
                          <p className="text-xs text-gray-500">
                            {getText({ zh: '订单号', en: 'Order', ko: '주문번호', vi: 'Đơn hàng' })}: {item.orderNo}
                          </p>
                        </div>

                        {item.status === 'PENDING' && (
                          <div className="flex gap-2 py-1">
                            <button
                              onClick={() => handleReply(item, false)}
                              className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600"
                            >
                              {getText({ zh: '拒绝', en: 'Reject', ko: '거부', vi: 'Từ chối' })}
                            </button>
                            <button
                              onClick={() => handleReply(item, true)}
                              className="flex-1 py-2 bg-green-500 text-white rounded-lg text-sm font-bold hover:bg-green-600"
                            >
                              {getText({ zh: '同意', en: 'Agree', ko: '동의', vi: 'Đồng ý' })}
                            </button>
                          </div>
                        )}

                        {item.status === 'BUYER_SHIPPING' && (
                          <div className="py-1">
                            <button
                              onClick={() => handleConfirmReturn(item.id)}
                              className="w-full py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700"
                            >
                              {getText({ zh: '确认收货', en: 'Confirm', ko: '확인', vi: 'Xác nhận' })}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 回复弹窗 */}
      {showReplyModal && selectedAfterSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b sticky top-0 bg-white">
              <h3 className="text-lg font-bold text-gray-800">
                {replyData.agreed 
                  ? getText({ zh: '同意售后', en: 'Agree', ko: '동의', vi: 'Đồng ý' })
                  : getText({ zh: '拒绝售后', en: 'Reject', ko: '거부', vi: 'Từ chối' })}
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {/* 退货地址信息（仅退货退款时显示） */}
              {replyData.agreed && selectedAfterSale.type === 'RETURN_REFUND' && (
                <div className="space-y-3 bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">
                    {getText({ zh: '请填写退货地址信息', en: 'Return Address', ko: '반품 주소', vi: 'Địa chỉ trả hàng' })}
                  </p>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {getText({ zh: '联系人', en: 'Contact', ko: '연락처', vi: 'Liên hệ' })} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={replyData.returnContact}
                      onChange={(e) => setReplyData({ ...replyData, returnContact: e.target.value })}
                      placeholder={getText({ zh: '请输入联系人姓名', en: 'Enter name', ko: '이름 입력', vi: 'Nhập tên' })}
                      className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {getText({ zh: '联系电话', en: 'Phone', ko: '전화', vi: 'Điện thoại' })} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={replyData.returnPhone}
                      onChange={(e) => setReplyData({ ...replyData, returnPhone: e.target.value })}
                      placeholder={getText({ zh: '请输入联系电话', en: 'Enter phone', ko: '전화 입력', vi: 'Nhập SĐT' })}
                      className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {getText({ zh: '退货地址', en: 'Address', ko: '주소', vi: 'Địa chỉ' })} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={replyData.returnAddress}
                      onChange={(e) => setReplyData({ ...replyData, returnAddress: e.target.value })}
                      placeholder={getText({ zh: '请输入完整的退货地址', en: 'Enter address', ko: '주소 입력', vi: 'Nhập địa chỉ' })}
                      rows={2}
                      className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {replyData.agreed 
                    ? getText({ zh: '回复内容（可选）', en: 'Reply (optional)', ko: '답변 (선택)', vi: 'Phản hồi (tùy chọn)' })
                    : getText({ zh: '拒绝理由（必填）', en: 'Reason (required)', ko: '이유 (필수)', vi: 'Lý do (bắt buộc)' })}
                </label>
                <textarea
                  value={replyData.reply}
                  onChange={(e) => setReplyData({ ...replyData, reply: e.target.value })}
                  placeholder={getText({ zh: '请输入...', en: 'Enter...', ko: '입력...', vi: 'Nhập...' })}
                  rows={3}
                  className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
            <div className="p-4 border-t flex gap-2">
              <button
                onClick={() => {
                  setShowReplyModal(false);
                  setSelectedAfterSale(null);
                }}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium"
              >
                {getText({ zh: '取消', en: 'Cancel', ko: '취소', vi: 'Hủy' })}
              </button>
              <button
                onClick={handleSubmitReply}
                className={`flex-1 py-2 text-white rounded-lg text-sm font-bold ${
                  replyData.agreed ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {getText({ zh: '确认', en: 'Confirm', ko: '확인', vi: 'Xác nhận' })}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
