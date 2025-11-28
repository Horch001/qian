import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Store, Upload, Package, BarChart3, Edit2, Save, Plus, Image } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'products' | 'stats'>('info');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    shopName: '',
    description: '',
    logo: '',
    banner: '',
  });
  const [saving, setSaving] = useState(false);

  const getText = (obj: { [key: string]: string }) => obj[language] || obj.zh;

  // 从路由state获取指定的店铺ID和tab
  const stateData = location.state as { merchantId?: string; tab?: string } | null;

  useEffect(() => {
    // 如果指定了tab，切换到对应tab
    if (stateData?.tab === 'stats') {
      setActiveTab('stats');
    } else if (stateData?.tab === 'products') {
      setActiveTab('products');
    }
    fetchMerchantData();
  }, [stateData?.merchantId, stateData?.tab]);

  const fetchMerchantData = async () => {
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
            banner: targetMerchant.banner || '',
          });
          // 获取该店铺的商品列表
          const productsData = await merchantApi.getMyProducts();
          // 过滤出属于该店铺的商品
          const filteredProducts = productsData.items?.filter((p: any) => p.merchantId === stateData.merchantId) || [];
          setProducts(filteredProducts);
          setLoading(false);
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
          banner: data.banner || '',
        });
        // 获取商品列表
        const productsData = await merchantApi.getMyProducts();
        setProducts(productsData.items || []);
      }
    } catch (error) {
      console.error('Failed to fetch merchant:', error);
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
          <header className="bg-white/10 backdrop-blur-sm p-4 flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-white">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-lg font-bold text-white">{getText({ zh: '我的店铺', en: 'My Shop', ko: '내 상점', vi: 'Cửa hàng' })}</h1>
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
          <header className="bg-white/10 backdrop-blur-sm p-4 flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-white">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-lg font-bold text-white">{getText({ zh: '我的店铺', en: 'My Shop', ko: '내 상점', vi: 'Cửa hàng' })}</h1>
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
          <header className="bg-white/10 backdrop-blur-sm p-4 flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-white">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-lg font-bold text-white">{getText({ zh: '我的店铺', en: 'My Shop', ko: '내 상점', vi: 'Cửa hàng' })}</h1>
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
      <div className="w-full max-w-md flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white/10 backdrop-blur-sm p-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-white">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-white">{getText({ zh: '店铺管理', en: 'Shop Management', ko: '상점 관리', vi: 'Quản lý cửa hàng' })}</h1>
        </header>

        {/* Tabs */}
        <div className="flex bg-white/10 mx-4 mt-4 rounded-lg p-1">
        {[
          { key: 'info', label: { zh: '店铺装修', en: 'Shop Info', ko: '상점 정보', vi: 'Thông tin' }, icon: Edit2 },
          { key: 'products', label: { zh: '我的商品', en: 'Products', ko: '상품', vi: 'Sản phẩm' }, icon: Package },
          { key: 'stats', label: { zh: '数据统计', en: 'Stats', ko: '통계', vi: 'Thống kê' }, icon: BarChart3 },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-bold transition-colors ${
              activeTab === tab.key ? 'bg-white text-purple-600' : 'text-white/80'
            }`}
          >
            <tab.icon size={16} />
            {getText(tab.label)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {activeTab === 'info' && (
          <div className="space-y-4">
            {/* 店铺横幅 */}
            <div className="bg-white rounded-xl overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center relative">
                {formData.banner ? (
                  <img src={formData.banner} alt="Banner" className="w-full h-full object-cover" />
                ) : (
                  <Image size={32} className="text-white/50" />
                )}
                {editing && (
                  <button className="absolute bottom-2 right-2 bg-black/50 text-white px-3 py-1 rounded-full text-xs">
                    {getText({ zh: '更换横幅', en: 'Change Banner', ko: '배너 변경', vi: 'Đổi banner' })}
                  </button>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center overflow-hidden">
                    {formData.logo ? (
                      <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Store size={32} className="text-purple-400" />
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

                {editing ? (
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                    placeholder={getText({ zh: '店铺简介', en: 'Shop Description', ko: '상점 설명', vi: 'Mô tả cửa hàng' })}
                  />
                ) : (
                  <p className="text-gray-600">{merchant.description || getText({ zh: '暂无简介', en: 'No description', ko: '설명 없음', vi: 'Chưa có mô tả' })}</p>
                )}
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
            <button
              onClick={() => navigate('/upload-product', { state: { merchantId: merchant.id, shopName: merchant.shopName } })}
              className="w-full py-4 bg-white rounded-xl flex items-center justify-center gap-2 text-purple-600 font-bold"
            >
              <Plus size={20} />
              {getText({ zh: '上传新商品', en: 'Upload Product', ko: '상품 업로드', vi: 'Tải lên sản phẩm' })}
            </button>

            {products.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                {getText({ zh: '暂无商品', en: 'No products yet', ko: '상품 없음', vi: 'Chưa có sản phẩm' })}
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((product) => (
                  <div key={product.id} className="bg-white rounded-xl p-4 flex gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <span className="text-3xl">{product.icon || '📦'}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">{product.title}</h3>
                      <p className="text-purple-600 font-bold">{product.price}π</p>
                      <p className="text-sm text-gray-500">
                        {getText({ zh: '库存', en: 'Stock', ko: '재고', vi: 'Kho' })}: {product.stock} · 
                        {getText({ zh: '销量', en: 'Sales', ko: '판매', vi: 'Đã bán' })}: {product.sales || 0}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        product.status === 'ACTIVE' ? 'bg-green-100 text-green-600' :
                        product.status === 'INACTIVE' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {product.status === 'ACTIVE' ? getText({ zh: '已上架', en: 'Active', ko: '활성', vi: 'Đang bán' }) :
                         product.status === 'INACTIVE' ? getText({ zh: '待审核', en: 'Pending', ko: '대기 중', vi: 'Chờ duyệt' }) :
                         getText({ zh: '已下架', en: 'Inactive', ko: '비활성', vi: 'Đã ẩn' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-purple-600">{products.length}</p>
                <p className="text-gray-500 text-sm">{getText({ zh: '商品数', en: 'Products', ko: '상품 수', vi: 'Sản phẩm' })}</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-purple-600">{merchant.totalSales || 0}</p>
                <p className="text-gray-500 text-sm">{getText({ zh: '总销量', en: 'Total Sales', ko: '총 판매', vi: 'Tổng bán' })}</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-purple-600">{merchant.rating?.toFixed(1) || '5.0'}</p>
                <p className="text-gray-500 text-sm">{getText({ zh: '店铺评分', en: 'Rating', ko: '평점', vi: 'Đánh giá' })}</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-purple-600">{merchant.deposit || '0'}π</p>
                <p className="text-gray-500 text-sm">{getText({ zh: '保证金', en: 'Deposit', ko: '보증금', vi: 'Tiền cọc' })}</p>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
