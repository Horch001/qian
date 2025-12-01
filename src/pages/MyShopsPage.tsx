import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Store, Plus, Package, BarChart3, Upload, ChevronRight, Loader2, CheckCircle, Clock, XCircle, Edit3 } from 'lucide-react';
import { Language, Translations } from '../types';
import { merchantApi, Merchant } from '../services/api';

interface MyShopsPageProps {
  language: Language;
  translations: Translations;
}

// 板块名称映射
const categoryNames: { [key: string]: { zh: string; en: string; ko: string; vi: string } } = {
  PHYSICAL: { zh: '实体商城', en: 'Physical Mall', ko: '실물 쇼핑몰', vi: 'Trung tâm mua sắm' },
  VIRTUAL: { zh: '虚拟商城', en: 'Virtual Mall', ko: '가상 쇼핑몰', vi: 'Trung tâm ảo' },
  SERVICE: { zh: '上门服务', en: 'Home Service', ko: '방문 서비스', vi: 'Dịch vụ tận nhà' },
  OFFLINE_PLAY: { zh: '线下陪玩', en: 'Offline Play', ko: '오프라인 플레이', vi: 'Chơi offline' },
  COURSE: { zh: '知识付费', en: 'Paid Courses', ko: '유료 강좌', vi: 'Khóa học trả phí' },
  DETECTIVE: { zh: '私人侦探', en: 'Private Detective', ko: '사립 탐정', vi: 'Thám tử tư' },
  HOUSE_LEASE: { zh: '房屋租赁', en: 'House Lease', ko: '주택 임대', vi: 'Cho thuê nhà' },
};

export const MyShopsPage: React.FC<MyShopsPageProps> = ({ language }) => {
  const navigate = useNavigate();
  const [shops, setShops] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState<string | null>(null);

  const getText = (obj: { [key: string]: string }) => obj[language] || obj.zh;

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const data = await merchantApi.getMyAllMerchants();
      setShops(data || []);
    } catch (error) {
      console.error('Failed to fetch shops:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return getText({ zh: '已通过', en: 'Approved', ko: '승인됨', vi: 'Đã duyệt' });
      case 'PENDING':
        return getText({ zh: '审核中', en: 'Pending', ko: '대기 중', vi: 'Đang chờ' });
      case 'REJECTED':
        return getText({ zh: '已拒绝', en: 'Rejected', ko: '거부됨', vi: 'Bị từ chối' });
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-600 to-pink-500 flex justify-center">
        <div className="w-full max-w-md flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 to-pink-500 flex justify-center">
      <div className="w-full max-w-md flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white/10 backdrop-blur-sm p-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-white">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-white">{getText({ zh: '我的店铺', en: 'My Shops', ko: '내 상점', vi: 'Cửa hàng của tôi' })}</h1>
        </header>

        <main className="flex-1 p-4 overflow-y-auto">
        {/* 入驻新板块按钮 */}
        <button
          onClick={() => navigate('/join-store')}
          className="w-full mb-4 py-4 bg-white rounded-xl flex items-center justify-center gap-2 text-purple-600 font-bold shadow-lg"
        >
          <Plus size={20} />
          {getText({ zh: '入驻新板块', en: 'Join New Category', ko: '새 카테고리 입점', vi: 'Đăng ký danh mục mới' })}
        </button>

        {shops.length === 0 ? (
          <div className="text-center py-12">
            <Store size={64} className="text-white/30 mx-auto mb-4" />
            <p className="text-white/70">{getText({ zh: '您还没有店铺', en: 'You don\'t have any shops yet', ko: '아직 상점이 없습니다', vi: 'Bạn chưa có cửa hàng nào' })}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {shops.map((shop) => (
              <div key={shop.id} className="bg-white rounded-xl overflow-hidden shadow-lg">
                {/* 店铺信息 */}
                <button
                  onClick={() => setSelectedShop(selectedShop === shop.id ? null : shop.id)}
                  className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center overflow-hidden">
                    {shop.logo ? (
                      <img src={shop.logo} alt={shop.shopName} className="w-full h-full object-cover" />
                    ) : (
                      <Store size={28} className="text-purple-500" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-800">{shop.shopName}</h3>
                      {getStatusIcon(shop.status)}
                    </div>
                    <p className="text-sm text-gray-500">
                      {getText(categoryNames[shop.category || ''] || { zh: shop.category || '', en: shop.category || '', ko: shop.category || '', vi: shop.category || '' })}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span>⭐ {shop.rating?.toFixed(1) || '5.0'}</span>
                      <span>{getText({ zh: '销量', en: 'Sales', ko: '판매', vi: 'Đã bán' })} {shop.totalSales || 0}</span>
                      <span className={`px-2 py-0.5 rounded-full ${
                        shop.status === 'APPROVED' ? 'bg-green-100 text-green-600' :
                        shop.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {getStatusText(shop.status)}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${selectedShop === shop.id ? 'rotate-90' : ''}`} />
                </button>

                {/* 展开的操作菜单 */}
                {selectedShop === shop.id && shop.status === 'APPROVED' && (
                  <div className="border-t border-gray-100 p-3 bg-gray-50">
                    <div className="grid grid-cols-4 gap-2">
                      <button
                        onClick={() => navigate('/shop-manage', { state: { merchantId: shop.id, tab: 'info' } })}
                        className="flex flex-col items-center gap-1 py-3 px-2 bg-white rounded-lg hover:bg-purple-50 transition-colors"
                      >
                        <Edit3 className="w-5 h-5 text-green-500" />
                        <span className="text-xs text-gray-700 font-medium">{getText({ zh: '店铺装修', en: 'Edit', ko: '편집', vi: 'Chỉnh sửa' })}</span>
                      </button>
                      <button
                        onClick={() => navigate('/upload-product', { state: { merchantId: shop.id, shopName: shop.shopName } })}
                        className="flex flex-col items-center gap-1 py-3 px-2 bg-white rounded-lg hover:bg-purple-50 transition-colors"
                      >
                        <Upload className="w-5 h-5 text-blue-500" />
                        <span className="text-xs text-gray-700 font-medium">{getText({ zh: '上传商品', en: 'Upload', ko: '업로드', vi: 'Tải lên' })}</span>
                      </button>
                      <button
                        onClick={() => navigate('/shop-manage', { state: { merchantId: shop.id, tab: 'products' } })}
                        className="flex flex-col items-center gap-1 py-3 px-2 bg-white rounded-lg hover:bg-purple-50 transition-colors"
                      >
                        <Package className="w-5 h-5 text-yellow-500" />
                        <span className="text-xs text-gray-700 font-medium">{getText({ zh: '我的商品', en: 'Products', ko: '상품', vi: 'Sản phẩm' })}</span>
                      </button>
                      <button
                        onClick={() => navigate('/shop-manage', { state: { merchantId: shop.id, tab: 'stats' } })}
                        className="flex flex-col items-center gap-1 py-3 px-2 bg-white rounded-lg hover:bg-purple-50 transition-colors"
                      >
                        <BarChart3 className="w-5 h-5 text-purple-500" />
                        <span className="text-xs text-gray-700 font-medium">{getText({ zh: '店铺数据', en: 'Stats', ko: '통계', vi: 'Thống kê' })}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 审核中/被拒绝的提示 */}
                {selectedShop === shop.id && shop.status === 'PENDING' && (
                  <div className="border-t border-gray-100 p-4 bg-yellow-50">
                    <p className="text-sm text-yellow-700">
                      {getText({ zh: '您的入驻申请正在审核中，请耐心等待', en: 'Your application is under review', ko: '신청서가 검토 중입니다', vi: 'Đơn đăng ký đang được xem xét' })}
                    </p>
                  </div>
                )}

                {selectedShop === shop.id && shop.status === 'REJECTED' && (
                  <div className="border-t border-gray-100 p-4 bg-red-50">
                    <p className="text-sm text-red-700 mb-2">
                      {shop.reviewNote || getText({ zh: '您的入驻申请未通过审核', en: 'Your application was rejected', ko: '신청이 거부되었습니다', vi: 'Đơn đăng ký bị từ chối' })}
                    </p>
                    <button
                      onClick={() => navigate('/join-store')}
                      className="text-sm text-red-600 font-bold underline"
                    >
                      {getText({ zh: '重新申请', en: 'Reapply', ko: '다시 신청', vi: 'Đăng ký lại' })}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        </main>
      </div>
    </div>
  );
};
