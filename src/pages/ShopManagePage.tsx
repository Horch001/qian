import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Store, Upload, Package, BarChart3, Edit2, Save, Plus, Image, ShoppingBag } from 'lucide-react';
import { Language, Translations } from '../types';
import { merchantApi } from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface ShopManagePageProps {
  language: Language;
  translations: Translations;
}

export const ShopManagePage: React.FC<ShopManagePageProps> = ({ language }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [merchant, setMerchant] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'products' | 'orders' | 'stats'>('info');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    shopName: '',
    description: '',
    logo: '',
    announcement: '',
    businessHours: '',
  });
  const [saving, setSaving] = useState(false);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  const getText = (obj: { [key: string]: string }) => obj[language] || obj.zh;

  // 根据路由路径获取页面标题
  const getPageTitle = () => {
    if (location.pathname === '/shop-info') {
      return getText({ zh: '店铺装修', en: 'Shop Info', ko: '상점 정보', vi: 'Thông tin' });
    } else if (location.pathname === '/shop-products') {
      return getText({ zh: '我的商品', en: 'My Products', ko: '내 상품', vi: 'Sản phẩm' });
    } else if (location.pathname === '/shop-orders') {
      return getText({ zh: '订单管理', en: 'Orders', ko: '주문 관리', vi: 'Đơn hàng' });
    } else if (location.pathname === '/shop-stats') {
      return getText({ zh: '店铺数据', en: 'Statistics', ko: '통계', vi: 'Thống kê' });
    }
    return getText({ zh: '店铺管理', en: 'Shop Management', ko: '상점 관리', vi: 'Quản lý cửa hàng' });
  };

  // 从路由state获取指定的店铺ID和tab
  const stateData = location.state as { merchantId?: string; tab?: string; autoEdit?: boolean } | null;

  useEffect(() => {
    // 根据路由路径自动设置tab
    if (location.pathname === '/shop-stats') {
      setActiveTab('stats');
    } else if (location.pathname === '/shop-products') {
      setActiveTab('products');
    } else if (location.pathname === '/shop-orders') {
      setActiveTab('orders');
    } else if (location.pathname === '/shop-info') {
      setActiveTab('info');
      // 如果传入了 autoEdit 参数，自动进入编辑模式
      if (stateData?.autoEdit) {
        setEditing(true);
      }
    } else if (stateData?.tab === 'stats') {
      setActiveTab('stats');
    } else if (stateData?.tab === 'products') {
      setActiveTab('products');
    } else if (stateData?.tab === 'orders') {
      setActiveTab('orders');
    } else if (stateData?.tab === 'info') {
      setActiveTab('info');
    }
    fetchMerchantData();
  }, [stateData?.merchantId, stateData?.tab, stateData?.autoEdit, location.pathname]);

  const fetchMerchantData = async () => {
    try {
      // 添加超时控制
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒超时
      
      try {
        // 如果指定了店铺ID，获取所有店铺然后找到对应的
        if (stateData?.merchantId) {
          const allMerchants = await merchantApi.getMyAllMerchants();
          const targetMerchant = allMerchants.find(m => m.id === stateData.merchantId);
          if (targetMerchant) {
            setMerchant(targetMerchant);
            setFormData({
              shopName: targetMerchant.shopName || '',
              description: targetMerchant.description || '',
              logo: targetMerchant.logo || '',
              announcement: targetMerchant.announcement || '',
              businessHours: targetMerchant.businessHours || '',
            });
            // 获取该店铺的商品列表
            const productsData = await merchantApi.getMyProducts();
            // 过滤出属于该店铺的商品
            const filteredProducts = productsData.items?.filter((p: any) => p.merchantId === stateData.merchantId) || [];
            setProducts(filteredProducts);
            setLoading(false);
            clearTimeout(timeoutId);
            return;
          }
        }
        
        // 默认获取第一个店铺
        const data = await merchantApi.getMyMerchant();
        if (data) {
          setMerchant(data);
          setFormData({
            shopName: data.shopName || '',
            description: data.description || '',
            logo: data.logo || '',
            announcement: data.announcement || '',
            businessHours: data.businessHours || '',
          });
          // 获取商品列表
          const productsData = await merchantApi.getMyProducts();
          setProducts(productsData.items || []);
        }
        clearTimeout(timeoutId);
      } catch (err: any) {
        if (err.name === 'AbortError') {
          alert(getText({ zh: '加载超时，请刷新重试', en: 'Loading timeout', ko: '로딩 시간 초과', vi: 'Hết thời gian tải' }));
        } else {
          throw err;
        }
      }
    } catch (error) {
      console.error('Failed to fetch merchant:', error);
      alert(getText({ zh: '加载失败，请重试', en: 'Loading failed', ko: '로딩 실패', vi: 'Tải thất bại' }));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await merchantApi.updateMyMerchant(formData);
      setMerchant({ ...merchant, ...formData });
      setEditing(false);
      alert(getText({ zh: '保存成功', en: 'Saved successfully', ko: '저장됨', vi: 'Đã lưu' }));
    } catch (error: any) {
      alert(error.message || getText({ zh: '保存失败', en: 'Save failed', ko: '저장 실패', vi: 'Lưu thất bại' }));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-600 to-pink-500 flex justify-center">
        <div className="w-full max-w-md flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-600 to-pink-500 flex justify-center">
        <div className="w-full max-w-md flex flex-col min-h-screen">
          <header className="p-4 flex items-center justify-center relative">
            <button onClick={() => navigate('/my-shops')} className="text-white absolute left-4">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-lg font-bold text-white">{getPageTitle()}</h1>
          </header>
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <Store size={64} className="text-white/50 mb-4" />
            <p className="text-white/80 mb-4">{getText({ zh: '您还没有店铺', en: 'You don\'t have a shop yet', ko: '아직 상점이 없습니다', vi: 'Bạn chưa có cửa hàng' })}</p>
            <button
              onClick={() => navigate('/join-store')}
              className="px-6 py-3 bg-white text-purple-600 rounded-full font-bold"
            >
              {getText({ zh: '立即入驻', en: 'Join Now', ko: '지금 입점', vi: 'Đăng ký ngay' })}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (merchant.status === 'PENDING') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-600 to-pink-500 flex justify-center">
        <div className="w-full max-w-md flex flex-col min-h-screen">
          <header className="p-4 flex items-center justify-center relative">
            <button onClick={() => navigate('/my-shops', { state: { expandShopId: merchant?.id } })} className="text-white absolute left-4">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-lg font-bold text-white">{getPageTitle()}</h1>
          </header>
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mb-4">
              <Store size={32} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{getText({ zh: '审核中', en: 'Under Review', ko: '심사 중', vi: 'Đang xét duyệt' })}</h2>
            <p className="text-white/80">{getText({ zh: '您的入驻申请正在审核中，请耐心等待', en: 'Your application is under review', ko: '신청서가 검토 중입니다', vi: 'Đơn đăng ký đang được xem xét' })}</p>
          </div>
        </div>
      </div>
    );
  }

  if (merchant.status === 'REJECTED') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-600 to-pink-500 flex justify-center">
        <div className="w-full max-w-md flex flex-col min-h-screen">
          <header className="p-4 flex items-center justify-center relative">
            <button onClick={() => navigate('/my-shops', { state: { expandShopId: merchant?.id } })} className="text-white absolute left-4">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-lg font-bold text-white">{getPageTitle()}</h1>
          </header>
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4">
              <Store size={32} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{getText({ zh: '审核未通过', en: 'Application Rejected', ko: '신청 거부됨', vi: 'Đơn bị từ chối' })}</h2>
            <p className="text-white/80 mb-4">{merchant.reviewNote || getText({ zh: '请重新提交申请', en: 'Please resubmit', ko: '다시 제출해주세요', vi: 'Vui lòng gửi lại' })}</p>
            <button
              onClick={() => navigate('/join-store')}
              className="px-6 py-3 bg-white text-purple-600 rounded-full font-bold"
            >
              {getText({ zh: '重新申请', en: 'Reapply', ko: '다시 신청', vi: 'Đăng ký lại' })}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 to-pink-500 flex justify-center">
      <div className="w-full max-w-md flex flex-col min-h-screen relative">
        {/* Header */}
        <header className="p-4 flex items-center justify-center relative">
          <button onClick={() => navigate('/my-shops', { state: { expandShopId: merchant?.id } })} className="text-white absolute left-4">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-white">{getPageTitle()}</h1>
        </header>



      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto pb-20">
        {activeTab === 'info' && (
          <div className="space-y-4">
            {/* 店铺信息 */}
            <div className="bg-white rounded-xl overflow-hidden">
              <div className="p-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center overflow-hidden relative">
                    {formData.logo ? (
                      <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Store size={32} className="text-purple-400" />
                    )}
                    {editing && (
                      <label className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                        <Upload size={20} className="text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 2 * 1024 * 1024) {
                                alert(getText({ zh: '图片大小不能超过2MB', en: 'Image size cannot exceed 2MB', ko: '이미지 크기는 2MB를 초과할 수 없습니다', vi: 'Kích thước ảnh không được vượt quá 2MB' }));
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                const base64 = e.target?.result as string;
                                setFormData({ ...formData, logo: base64 });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                  <div className="flex-1">
                    {editing ? (
                      <input
                        type="text"
                        value={formData.shopName}
                        onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder={getText({ zh: '店铺名称', en: 'Shop Name', ko: '상점 이름', vi: 'Tên cửa hàng' })}
                      />
                    ) : (
                      <h2 className="text-xl font-bold text-gray-800">{merchant.shopName}</h2>
                    )}
                    <p className="text-sm text-gray-500">⭐ {merchant.rating?.toFixed(1) || '5.0'} · {getText({ zh: '销量', en: 'Sales', ko: '판매', vi: 'Đã bán' })} {merchant.totalSales || 0}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="text-sm font-bold text-gray-700 mb-1 block">{getText({ zh: '店铺简介', en: 'Description', ko: '설명', vi: 'Mô tả' })}</label>
                  {editing ? (
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      rows={3}
                      placeholder={getText({ zh: '介绍您的店铺特色...', en: 'Describe your shop...', ko: '상점을 설명하세요...', vi: 'Mô tả cửa hàng...' })}
                    />
                  ) : (
                    <p className="text-gray-600 text-sm">{merchant.description || getText({ zh: '暂无简介', en: 'No description', ko: '설명 없음', vi: 'Chưa có mô tả' })}</p>
                  )}
                </div>

                <div className="mb-3">
                  <label className="text-sm font-bold text-gray-700 mb-1 block">{getText({ zh: '店铺公告', en: 'Announcement', ko: '공지', vi: 'Thông báo' })}</label>
                  {editing ? (
                    <textarea
                      value={formData.announcement}
                      onChange={(e) => setFormData({ ...formData, announcement: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      rows={2}
                      placeholder={getText({ zh: '发布重要通知...', en: 'Important notice...', ko: '중요 공지...', vi: 'Thông báo quan trọng...' })}
                    />
                  ) : (
                    <p className="text-gray-600 text-sm">{merchant.announcement || getText({ zh: '暂无公告', en: 'No announcement', ko: '공지 없음', vi: 'Chưa có thông báo' })}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">{getText({ zh: '营业时间', en: 'Hours', ko: '영업시간', vi: 'Giờ mở cửa' })}</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.businessHours}
                      onChange={(e) => setFormData({ ...formData, businessHours: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      placeholder="9:00-22:00"
                    />
                  ) : (
                    <p className="text-gray-600 text-sm">{merchant.businessHours || '-'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3">
              {editing ? (
                <>
                  <button
                    onClick={() => setEditing(false)}
                    className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold"
                  >
                    {getText({ zh: '取消', en: 'Cancel', ko: '취소', vi: 'Hủy' })}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-bold flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                    {saving ? getText({ zh: '保存中...', en: 'Saving...', ko: '저장 중...', vi: 'Đang lưu...' }) : getText({ zh: '保存', en: 'Save', ko: '저장', vi: 'Lưu' })}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-bold flex items-center justify-center gap-2"
                >
                  <Edit2 size={18} />
                  {getText({ zh: '编辑店铺', en: 'Edit Shop', ko: '상점 편집', vi: 'Chỉnh sửa' })}
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-4">
            {products.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                {getText({ zh: '暂无商品', en: 'No products yet', ko: '상품 없음', vi: 'Chưa có sản phẩm' })}
              </div>
            ) : (
              <div className="space-y-2">
                {products.map((product) => (
                  <div key={product.id} className="bg-white rounded-xl overflow-hidden">
                    <div className="p-3 flex gap-3 items-center relative">
                      {/* 左侧：商品图片 */}
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <span className="text-2xl">{product.icon || '📦'}</span>
                        )}
                      </div>
                      
                      {/* 中间：商品信息 */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 text-sm truncate">{product.title}</h3>
                        <p className="text-purple-600 font-bold text-sm">{product.price}π</p>
                        <p className="text-xs text-gray-500">
                          {getText({ zh: '库存', en: 'Stock', ko: '재고', vi: 'Kho' })}: {product.stock} · 
                          {getText({ zh: '销量', en: 'Sales', ko: '판매', vi: 'Đã bán' })}: {product.sales || 0}
                        </p>
                        <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${
                          product.status === 'ACTIVE' ? 'bg-green-100 text-green-600' :
                          product.status === 'SOLD_OUT' ? 'bg-gray-100 text-gray-600' :
                          product.status === 'INACTIVE' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {product.status === 'ACTIVE' ? getText({ zh: '已上架', en: 'Active', ko: '활성', vi: 'Đang bán' }) :
                           product.status === 'SOLD_OUT' ? getText({ zh: '已下架', en: 'Off Shelf', ko: '판매중지', vi: 'Đã gỡ' }) :
                           product.status === 'INACTIVE' ? getText({ zh: '待审核', en: 'Pending', ko: '대기', vi: 'Chờ duyệt' }) :
                           getText({ zh: '已删除', en: 'Deleted', ko: '삭제됨', vi: 'Đã xóa' })}
                        </span>
                      </div>
                      
                      {/* 右上角：展开按钮 */}
                      <button
                        onClick={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)}
                        className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedProduct === product.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* 展开的操作按钮（横向排列）*/}
                    {expandedProduct === product.id && (
                      <div className="px-3 pb-3 flex gap-2">
                        <button
                          onClick={() => navigate('/upload-product', { state: { merchantId: merchant.id, shopName: merchant.shopName, editProduct: product } })}
                          className="flex-1 py-2 bg-purple-500 text-white rounded text-xs font-bold hover:bg-purple-600 active:scale-95 transition-all"
                        >
                          {getText({ zh: '编辑', en: 'Edit', ko: '편집', vi: 'Sửa' })}
                        </button>
                        <button
                          onClick={() => navigate('/detail', { state: { item: product, pageType: 'product' } })}
                          className="flex-1 py-2 bg-blue-500 text-white rounded text-xs font-bold hover:bg-blue-600 active:scale-95 transition-all"
                        >
                          {getText({ zh: '查看', en: 'View', ko: '보기', vi: 'Xem' })}
                        </button>
                        {product.status === 'ACTIVE' ? (
                          <button
                            onClick={async () => {
                              if (confirm(getText({ zh: '确定要下架此商品吗？', en: 'Deactivate this product?', ko: '이 상품을 비활성화하시겠습니까?', vi: 'Ẩn sản phẩm này?' }))) {
                                try {
                                  await merchantApi.deactivateProduct(product.id);
                                  setProducts(prevProducts => 
                                    prevProducts.map(p => 
                                      p.id === product.id ? { ...p, status: 'SOLD_OUT' } : p
                                    )
                                  );
                                  alert(getText({ zh: '下架成功', en: 'Deactivated', ko: '비활성화됨', vi: 'Đã ẩn' }));
                                } catch (error: any) {
                                  alert(error.message || getText({ zh: '下架失败', en: 'Failed', ko: '실패', vi: 'Thất bại' }));
                                }
                              }
                            }}
                            className="flex-1 py-2 bg-yellow-500 text-white rounded text-xs font-bold hover:bg-yellow-600 active:scale-95 transition-all"
                          >
                            {getText({ zh: '下架', en: 'Hide', ko: '숨김', vi: 'Ẩn' })}
                          </button>
                        ) : product.status === 'SOLD_OUT' || product.status === 'INACTIVE' ? (
                          <button
                            onClick={async () => {
                              try {
                                await merchantApi.activateProduct(product.id);
                                setProducts(prevProducts => 
                                  prevProducts.map(p => 
                                    p.id === product.id ? { ...p, status: 'ACTIVE' } : p
                                  )
                                );
                                alert(getText({ zh: '上架成功', en: 'Activated', ko: '활성화됨', vi: 'Đã hiển thị' }));
                              } catch (error: any) {
                                alert(error.message || getText({ zh: '上架失败', en: 'Failed', ko: '실패', vi: 'Thất bại' }));
                              }
                            }}
                            className="flex-1 py-2 bg-green-500 text-white rounded text-xs font-bold hover:bg-green-600 active:scale-95 transition-all"
                          >
                            {getText({ zh: '上架', en: 'Show', ko: '表示', vi: 'Hiện' })}
                          </button>
                        ) : null}
                        <button
                          onClick={async () => {
                            if (confirm(getText({ zh: '确定要删除此商品吗？删除后无法恢复！', en: 'Delete permanently?', ko: '영구 삭제하시겠습니까?', vi: 'Xóa vĩnh viễn?' }))) {
                              try {
                                await merchantApi.deleteProduct(product.id);
                                alert(getText({ zh: '删除成功', en: 'Deleted', ko: '삭제됨', vi: 'Đã xóa' }));
                                fetchMerchantData();
                              } catch (error: any) {
                                alert(error.message || getText({ zh: '删除失败', en: 'Failed', ko: '실패', vi: 'Thất bại' }));
                              }
                            }
                          }}
                          className="flex-1 py-2 bg-red-500 text-white rounded text-xs font-bold hover:bg-red-600 active:scale-95 transition-all"
                        >
                          {getText({ zh: '删除', en: 'Delete', ko: '삭제', vi: 'Xóa' })}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
              {['ALL', 'PENDING', 'PAID', 'SHIPPED', 'COMPLETED', 'CANCELLED'].map((status) => (
                <button
                  key={status}
                  onClick={async () => {
                    try {
                      const ordersData = await merchantApi.getMyOrders();
                      // 筛选当前店铺的订单
                      const currentMerchantOrders = (ordersData || []).filter((o: any) => 
                        o.items?.some((item: any) => item.product?.merchantId === merchant.id)
                      );
                      
                      if (status === 'ALL') {
                        setOrders(currentMerchantOrders);
                      } else {
                        setOrders(currentMerchantOrders.filter((o: any) => o.orderStatus === status));
                      }
                    } catch (error: any) {
                      alert(error.message || getText({ zh: '加载订单失败', en: 'Failed to load orders', ko: '주문 로드 실패', vi: 'Tải đơn hàng thất bại' }));
                    }
                  }}
                  className="px-2.5 py-1.5 bg-white rounded-lg text-[11px] font-medium whitespace-nowrap hover:bg-purple-50 active:scale-95 transition-all flex-shrink-0"
                >
                  {status === 'ALL' ? getText({ zh: '全部', en: 'All', ko: '전체', vi: 'Tất cả' }) :
                   status === 'PENDING' ? getText({ zh: '待付款', en: 'Pending', ko: '대기', vi: 'Chờ' }) :
                   status === 'PAID' ? getText({ zh: '待发货', en: 'Paid', ko: '결제됨', vi: 'Đã trả' }) :
                   status === 'SHIPPED' ? getText({ zh: '已发货', en: 'Shipped', ko: '배송됨', vi: 'Đã gửi' }) :
                   status === 'COMPLETED' ? getText({ zh: '已完成', en: 'Done', ko: '완료', vi: 'Xong' }) :
                   getText({ zh: '已取消', en: 'Cancelled', ko: '취소됨', vi: 'Hủy' })}
                </button>
              ))}
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                {getText({ zh: '暂无订单', en: 'No orders yet', ko: '주문 없음', vi: 'Chưa có đơn hàng' })}
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-xl p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-sm text-gray-500">{getText({ zh: '订单号', en: 'Order No', ko: '주문 번호', vi: 'Mã đơn' })}: {order.orderNo}</p>
                        <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded">{order.orderStatus}</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-500">{getText({ zh: '买家', en: 'Buyer', ko: '구매자', vi: 'Người mua' })}:</span> {order.user?.username || '-'}</p>
                      <p><span className="text-gray-500">{getText({ zh: '金额', en: 'Amount', ko: '金额', vi: 'Số tiền' })}:</span> <span className="text-red-600 font-bold">{order.totalAmount}π</span></p>
                      {order.address ? (
                        <>
                          <p><span className="text-gray-500">{getText({ zh: '收件人', en: 'Receiver', ko: '수령인', vi: 'Người nhận' })}:</span> {order.address.receiverName} {order.address.receiverPhone}</p>
                          <p><span className="text-gray-500">{getText({ zh: '地址', en: 'Address', ko: '주소', vi: 'Địa chỉ' })}:</span> {order.address.province} {order.address.city} {order.address.district} {order.address.detail}</p>
                        </>
                      ) : (
                        <p className="text-xs text-orange-500">{getText({ zh: '⚠️ 旧订单无地址信息，请联系买家', en: '⚠️ No address, contact buyer', ko: '⚠️ 주소 없음, 구매자에게 연락', vi: '⚠️ Không có địa chỉ, liên hệ người mua' })}</p>
                      )}
                      <div className="pt-2 border-t">
                        <p className="text-gray-500 mb-1">{getText({ zh: '商品', en: 'Items', ko: '상품', vi: 'Sản phẩm' })}:</p>
                        {order.items?.map((item: any, idx: number) => (
                          <p key={idx} className="text-xs">• {item.product?.title || '商品'} x{item.quantity}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-4">
            {/* 核心数据 */}
            <div className="bg-white rounded-xl p-4">
              <h3 className="font-bold text-gray-800 mb-3">{getText({ zh: '核心数据', en: 'Key Metrics', ko: '핵심 데이터', vi: 'Dữ liệu chính' })}</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">{getText({ zh: '商品数', en: 'Products', ko: '상품', vi: 'Sản phẩm' })}</span>
                  <span className="font-bold text-purple-600">{products.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">{getText({ zh: '总销量', en: 'Sales', ko: '판매', vi: 'Đã bán' })}</span>
                  <span className="font-bold text-blue-600">{products.reduce((sum, p) => sum + (p.sales || 0), 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">{getText({ zh: '店铺评分', en: 'Rating', ko: '평점', vi: 'Đánh giá' })}</span>
                  <span className="font-bold text-yellow-600">⭐ {merchant.rating?.toFixed(1) || '5.0'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">{getText({ zh: '保证金', en: 'Deposit', ko: '보증금', vi: 'Cọc' })}</span>
                  <span className="font-bold text-green-600">{merchant.deposit || '0'}π</span>
                </div>
              </div>
            </div>

            {/* 商品状态 */}
            <div className="bg-white rounded-xl p-4">
              <h3 className="font-bold text-gray-800 mb-3">{getText({ zh: '商品状态', en: 'Product Status', ko: '상품 상태', vi: 'Trạng thái' })}</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">{getText({ zh: '在售商品', en: 'Active', ko: '판매 중', vi: 'Đang bán' })}</span>
                  <span className="font-bold text-green-600">{products.filter(p => p.status === 'ACTIVE').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">{getText({ zh: '已下架', en: 'Inactive', ko: '숨김', vi: 'Đã ẩn' })}</span>
                  <span className="font-bold text-yellow-600">{products.filter(p => p.status === 'INACTIVE').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">{getText({ zh: '库存不足', en: 'Low Stock', ko: '재고 부족', vi: 'Sắp hết' })}</span>
                  <span className="font-bold text-red-600">{products.filter(p => p.stock < 10).length}</span>
                </div>
              </div>
            </div>

            {/* 热销商品 */}
            <div className="bg-white rounded-xl p-4">
              <h3 className="font-bold text-gray-800 mb-3">{getText({ zh: '热销商品 TOP3', en: 'Top Products', ko: '인기 상품', vi: 'Bán chạy' })}</h3>
              <div className="space-y-2">
                {products
                  .sort((a, b) => (b.sales || 0) - (a.sales || 0))
                  .slice(0, 3)
                  .map((product, index) => (
                    <div key={product.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-400 text-white' :
                        index === 1 ? 'bg-gray-300 text-white' :
                        'bg-orange-300 text-white'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{product.title}</p>
                        <p className="text-xs text-gray-500">{getText({ zh: '销量', en: 'Sales', ko: '판매', vi: 'Bán' })}: {product.sales || 0}</p>
                      </div>
                      <p className="text-sm font-bold text-purple-600">{product.price}π</p>
                    </div>
                  ))}
                {products.length === 0 && (
                  <p className="text-center text-gray-400 text-sm py-4">{getText({ zh: '暂无数据', en: 'No data', ko: '데이터 없음', vi: 'Chưa có' })}</p>
                )}
              </div>
            </div>
          </div>
        )}
        </div>

        {/* 固定在底部的上传新商品按钮 - 仅在商品标签页显示 */}
        {activeTab === 'products' && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-purple-600 to-transparent pointer-events-none">
            <div className="max-w-md mx-auto pointer-events-auto">
              <button
                onClick={() => navigate('/upload-product', { state: { merchantId: merchant.id, shopName: merchant.shopName } })}
                className="w-full py-3 bg-white rounded-full flex items-center justify-center gap-2 text-purple-600 font-bold shadow-lg hover:bg-gray-50 active:scale-95 transition-all"
              >
                <Plus size={20} />
                {getText({ zh: '上传新商品', en: 'Upload Product', ko: '상품 업로드', vi: 'Tải lên sản phẩm' })}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
