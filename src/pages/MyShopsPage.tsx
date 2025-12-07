import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Store, Plus, Package, BarChart3, Upload, Loader2, Edit3, ShoppingBag, Trash2 } from 'lucide-react';
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
  DETECTIVE: { zh: '商业调查', en: 'Business Investigation', ko: '비즈니스 조사', vi: 'Điều tra kinh doanh' },
  HOUSE_LEASE: { zh: '商业租赁', en: 'Commercial Lease', ko: '상업 임대', vi: 'Cho thuê thương mại' },
};

export const MyShopsPage: React.FC<MyShopsPageProps> = ({ language }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [shops, setShops] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [shopStats, setShopStats] = useState<{ [key: string]: { productCount: number; orderCount: number } }>({});
  const [deletingShop, setDeletingShop] = useState<string | null>(null);

  const getText = (obj: { [key: string]: string }) => obj[language] || obj.zh;

  useEffect(() => {
    fetchShops();
    // 如果从其他页面返回，自动展开指定的店铺
    const stateData = location.state as { expandShopId?: string } | null;
    if (stateData?.expandShopId) {
      setSelectedShop(stateData.expandShopId);
    }
  }, [location.state]);

  const fetchShops = async () => {
    try {
      const data = await merchantApi.getMyAllMerchants();
      setShops(data || []);
      setLoading(false); // 先显示店铺列表
      
      // 异步获取每个店铺的商品和订单数量（不阻塞页面显示）
      if (data && data.length > 0) {
        const stats: { [key: string]: { productCount: number; orderCount: number } } = {};
        for (const shop of data) {
          try {
            const [productsData, ordersData] = await Promise.all([
              merchantApi.getMyProducts().catch(() => ({ items: [] })),
              merchantApi.getMyOrders().catch(() => [])
            ]);
            const shopProducts = productsData.items?.filter((p: any) => p.merchantId === shop.id) || [];
            const shopOrders = (ordersData || []).filter((o: any) => o.merchantId === shop.id);
            stats[shop.id] = {
              productCount: shopProducts.length,
              orderCount: shopOrders.length
            };
          } catch (error) {
            console.error(`Failed to fetch stats for shop ${shop.id}:`, error);
            stats[shop.id] = { productCount: 0, orderCount: 0 };
          }
        }
        setShopStats(stats);
      }
    } catch (error) {
      console.error('获取店铺列表失败:', error);
      setLoading(false);
    }
  };



  const handleDeleteShop = async (shopId: string, shopName: string) => {
    const confirmText = getText({ 
      zh: `确定要删除店铺"${shopName}"吗？删除后无法恢复！`, 
      en: `Delete shop "${shopName}"? This cannot be undone!`, 
      ko: `"${shopName}" 상점을 삭제하시겠습니까? 복구할 수 없습니다!`, 
      vi: `Xóa cửa hàng "${shopName}"? Không thể khôi phục!` 
    });
    
    if (!window.confirm(confirmText)) {
      return;
    }

    setDeletingShop(shopId);
    try {
      await merchantApi.deleteMerchant(shopId);
      alert(getText({ zh: '店铺已删除', en: 'Shop deleted', ko: '상점이 삭제되었습니다', vi: 'Đã xóa cửa hàng' }));
      fetchShops(); // 刷新列表
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || getText({ zh: '删除失败', en: 'Delete failed', ko: '삭제 실패', vi: 'Xóa thất bại' });
      alert(errorMsg);
    } finally {
      setDeletingShop(null);
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
        <header className="p-4 flex items-center justify-center relative">
          <button onClick={() => navigate('/profile')} className="text-white absolute left-4">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-white">{getText({ zh: '我的店铺', en: 'My Shops', ko: '내 상점', vi: 'Cửa hàng của tôi' })}</h1>
        </header>

        <main className="flex-1 px-2 overflow-y-auto pb-4">
        {shops.length === 0 ? (
          <div className="text-center py-12">
            <Store size={64} className="text-white/30 mx-auto mb-4" />
            <p className="text-white/70">{getText({ zh: '您还没有店铺', en: 'You don\'t have any shops yet', ko: '아직 상점이 없습니다', vi: 'Bạn chưa có cửa hàng nào' })}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {shops.filter(shop => shop.status !== 'SUSPENDED').map((shop) => (
              <div key={shop.id} className="bg-white rounded-xl overflow-hidden shadow-lg relative">
                {/* 左上角45度斜放板块标签 - 丝带效果 */}
                <div className="absolute top-0 left-0 w-20 h-20 overflow-hidden">
                  <div className="absolute top-[6px] -left-[36px] w-28 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 text-yellow-400 text-[11px] font-bold py-[5px] text-center transform rotate-[-45deg] shadow-[0_2px_8px_rgba(0,0,0,0.3)] leading-tight border-y border-purple-700/30" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                    {getText(categoryNames[shop.category || ''] || { zh: '未分类', en: 'Uncategorized', ko: '미分류', vi: 'Chưa phân loại' })}
                  </div>
                </div>
                
                {/* 右上角展开按钮 */}
                <button
                  onClick={() => setSelectedShop(selectedShop === shop.id ? null : shop.id)}
                  className="absolute top-3 right-3 z-10 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${selectedShop === shop.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* 店铺信息 - 整体居中 */}
                <div className="py-4 pl-6 pr-4 flex items-center gap-2">
                  <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                    {shop.logo ? (
                      <img src={shop.logo} alt={shop.shopName} className="w-full h-full object-cover" />
                    ) : (
                      <Store size={28} className="text-purple-500" />
                    )}
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800">{shop.shopName}</h3>
                    <div className="flex items-center justify-between mt-1 text-xs text-gray-400">
                      <div className="flex items-center gap-3">
                        <span className="text-orange-500 font-medium">{getText({ zh: '评分', en: 'Rating', ko: '평점', vi: 'Điểm' })} {shop.rating?.toFixed(1) || '5.0'}</span>
                        <span>{getText({ zh: '销量', en: 'Sales', ko: '판매', vi: 'Bán' })} {shop.totalSales || 0}</span>
                        <span>{getText({ zh: '商品', en: 'Items', ko: '상품', vi: 'SP' })} {shopStats[shop.id]?.productCount || 0}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                        shop.status === 'REJECTED' ? 'bg-red-100 text-red-600' :
                        shop.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600' :
                        (shopStats[shop.id]?.productCount || 0) > 0 ? 'bg-blue-100 text-blue-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {shop.status === 'REJECTED' ? getText({ zh: '已拒绝', en: 'Rejected', ko: '거부됨', vi: 'Bị từ chối' }) :
                         shop.status === 'PENDING' ? getText({ zh: '审核中', en: 'Pending', ko: '대기 중', vi: 'Đang chờ' }) :
                         (shopStats[shop.id]?.productCount || 0) > 0 ? getText({ zh: '营业中', en: 'Open', ko: '영업 중', vi: 'Đang mở' }) :
                         getText({ zh: '已通过', en: 'Approved', ko: '승인됨', vi: 'Đã duyệt' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 展开的操作菜单 */}
                {selectedShop === shop.id && shop.status === 'APPROVED' && (
                  <div className="border-t border-gray-100 p-2 bg-gray-50">
                    <div className="grid grid-cols-5 gap-1.5">
                      <button
                        onClick={() => navigate('/shop-info', { state: { merchantId: shop.id, autoEdit: true } })}
                        className="flex flex-col items-center gap-1 py-2.5 px-0.5 bg-white rounded-lg hover:bg-purple-50 transition-colors"
                      >
                        <Edit3 className="w-5 h-5 text-green-500" />
                        <span className="text-[9px] text-gray-700 font-medium leading-tight">{getText({ zh: '店铺装修', en: 'Edit', ko: '편집', vi: 'Sửa' })}</span>
                      </button>
                      <button
                        onClick={() => navigate('/upload-product', { state: { merchantId: shop.id, shopName: shop.shopName } })}
                        className="flex flex-col items-center gap-1 py-2.5 px-0.5 bg-white rounded-lg hover:bg-purple-50 transition-colors"
                      >
                        <Upload className="w-5 h-5 text-blue-500" />
                        <span className="text-[9px] text-gray-700 font-medium leading-tight">{getText({ zh: '上传商品', en: 'Upload', ko: '업로드', vi: 'Tải' })}</span>
                      </button>
                      <button
                        onClick={() => navigate('/shop-products', { state: { merchantId: shop.id } })}
                        className="flex flex-col items-center gap-1 py-2.5 px-0.5 bg-white rounded-lg hover:bg-purple-50 transition-colors relative"
                      >
                        {(shopStats[shop.id]?.productCount || 0) > 0 && (
                          <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[8px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                            {shopStats[shop.id]?.productCount || 0}
                          </span>
                        )}
                        <Package className="w-5 h-5 text-yellow-500" />
                        <span className="text-[9px] text-gray-700 font-medium leading-tight">{getText({ zh: '我的商品', en: 'Products', ko: '상품', vi: 'Hàng' })}</span>
                      </button>
                      <button
                        onClick={() => navigate('/shop-stats', { state: { merchantId: shop.id } })}
                        className="flex flex-col items-center gap-1 py-2.5 px-0.5 bg-white rounded-lg hover:bg-purple-50 transition-colors"
                      >
                        <BarChart3 className="w-5 h-5 text-purple-500" />
                        <span className="text-[9px] text-gray-700 font-medium leading-tight">{getText({ zh: '店铺数据', en: 'Stats', ko: '통계', vi: 'Số' })}</span>
                      </button>
                      <button
                        onClick={() => handleDeleteShop(shop.id, shop.shopName)}
                        disabled={deletingShop === shop.id}
                        className="flex flex-col items-center gap-1 py-2.5 px-0.5 bg-white rounded-lg hover:bg-red-50 transition-colors"
                      >
                        {deletingShop === shop.id ? (
                          <Loader2 className="w-5 h-5 animate-spin text-red-500" />
                        ) : (
                          <Trash2 className="w-5 h-5 text-red-500" />
                        )}
                        <span className="text-[9px] text-gray-700 font-medium leading-tight">{getText({ zh: '删除店铺', en: 'Delete', ko: '삭제', vi: 'Xóa' })}</span>
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

        {/* 底部入驻按钮 */}
        <div className="p-4 flex justify-center">
          <button
            onClick={() => navigate('/join-store')}
            className="px-6 py-3 bg-white rounded-full flex items-center gap-2 text-purple-600 font-bold shadow-lg hover:bg-gray-50 active:scale-95 transition-all"
          >
            <Plus size={18} />
            {getText({ zh: '入驻', en: 'Join', ko: '입점', vi: 'Đăng ký' })}
          </button>
        </div>
      </div>
    </div>
  );
};
