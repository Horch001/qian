import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Upload, AlertTriangle, X, ImagePlus, Store } from 'lucide-react';
import { Language, Translations } from '../types';
import { merchantApi, Merchant } from '../services/api';
import { compressImage, COMPRESS_PRESETS, formatFileSize, getCompressedSize } from '../utils/imageCompressor';

interface UploadProductPageProps {
  language: Language;
  translations: Translations;
}

export const UploadProductPage: React.FC<UploadProductPageProps> = ({ language }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [merchant, setMerchant] = useState<any>(null);
  const [allMerchants, setAllMerchants] = useState<Merchant[]>([]);
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    mainImage: '', // 主图
    subImages: [] as string[], // 副图（最多4张）
    detailImages: [] as string[], // 详情图（最多5张）
  });

  const getText = (obj: { [key: string]: string }) => obj[language] || obj.zh;

  const categoryLabels: Record<string, { [key: string]: string }> = {
    PHYSICAL: { zh: '实体商城', en: 'Physical Mall', ko: '실물 쇼핑몰', vi: 'Trung tâm mua sắm' },
    VIRTUAL: { zh: '虚拟商城', en: 'Virtual Mall', ko: '가상 쇼핑몰', vi: 'Trung tâm ảo' },
    SERVICE: { zh: '上门服务', en: 'Home Service', ko: '방문 서비스', vi: 'Dịch vụ tận nhà' },
    OFFLINE_PLAY: { zh: '线下陪玩', en: 'Offline Play', ko: '오프라인 플레이', vi: 'Chơi offline' },
    COURSE: { zh: '知识付费', en: 'Paid Courses', ko: '유료 강좌', vi: 'Khóa học trả phí' },
    DETECTIVE: { zh: '私人侦探', en: 'Private Detective', ko: '사립 탐정', vi: 'Thám tử tư' },
    HOUSE_LEASE: { zh: '房屋租赁', en: 'House Lease', ko: '주택 임대', vi: 'Cho thuê nhà' },
  };

  // 从路由state获取指定的店铺ID
  const stateData = location.state as { merchantId?: string; shopName?: string } | null;

  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        // 获取所有店铺
        const merchants = await merchantApi.getMyAllMerchants();
        const approvedMerchants = merchants.filter(m => m.status === 'APPROVED');
        setAllMerchants(approvedMerchants);
        
        // 如果从路由传入了店铺ID，使用它
        if (stateData?.merchantId) {
          const targetMerchant = approvedMerchants.find(m => m.id === stateData.merchantId);
          if (targetMerchant) {
            setMerchant(targetMerchant);
            setSelectedMerchantId(targetMerchant.id);
            return;
          }
        }
        
        // 否则使用第一个已通过的店铺
        if (approvedMerchants.length > 0) {
          setMerchant(approvedMerchants[0]);
          setSelectedMerchantId(approvedMerchants[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch merchants:', error);
      }
    };
    fetchMerchants();
  }, [stateData?.merchantId]);

  // 切换店铺
  const handleMerchantChange = (merchantId: string) => {
    const selected = allMerchants.find(m => m.id === merchantId);
    if (selected) {
      setMerchant(selected);
      setSelectedMerchantId(merchantId);
    }
  };


  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      alert(getText({ zh: '请输入商品名称', en: 'Please enter product name', ko: '상품명을 입력하세요', vi: 'Vui lòng nhập tên sản phẩm' }));
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      alert(getText({ zh: '请输入有效价格', en: 'Please enter valid price', ko: '유효한 가격을 입력하세요', vi: 'Vui lòng nhập giá hợp lệ' }));
      return;
    }
    if (!formData.stock || parseInt(formData.stock) <= 0) {
      alert(getText({ zh: '请输入真实库存数量', en: 'Please enter real stock quantity', ko: '실제 재고 수량을 입력하세요', vi: 'Vui lòng nhập số lượng tồn kho thực' }));
      return;
    }
    if (!formData.mainImage) {
      alert(getText({ zh: '请上传商品主图', en: 'Please upload main image', ko: '메인 이미지를 업로드하세요', vi: 'Vui lòng tải lên hình ảnh chính' }));
      return;
    }

    setLoading(true);
    try {
      // 组合所有图片：主图在第一位，副图在后面
      const allImages = [formData.mainImage, ...formData.subImages];
      
      // 分批上传优化：先提交基本信息，图片异步上传
      const productData = {
        merchantId: selectedMerchantId,
        title: formData.title,
        description: formData.description || undefined,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        images: allImages,
        detailImages: formData.detailImages,
      };
      
      // 使用 Promise 立即发送请求，不等待响应
      const uploadPromise = merchantApi.uploadProduct(productData);
      
      // 立即显示成功提示并跳转，后台继续上传
      alert(getText({ zh: '商品正在提交中，请稍候...', en: 'Submitting product...', ko: '상품 제출 중...', vi: 'Đang gửi sản phẩm...' }));
      navigate('/my-shops');
      
      // 后台完成上传
      await uploadPromise;
    } catch (error: any) {
      console.error('上传失败:', error);
      alert(error.message || getText({ zh: '上传失败，请重试', en: 'Upload failed', ko: '업로드 실패', vi: 'Tải lên thất bại' }));
    } finally {
      setLoading(false);
    }
  };

  if (!merchant || merchant.status !== 'APPROVED') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-600 to-pink-500 flex justify-center">
        <div className="w-full max-w-md flex flex-col min-h-screen">
          <header className="bg-white/10 backdrop-blur-sm p-4 flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-white"><ArrowLeft size={24} /></button>
            <h1 className="text-lg font-bold text-white">{getText({ zh: '上传商品', en: 'Upload Product', ko: '상품 업로드', vi: 'Tải lên sản phẩm' })}</h1>
          </header>
          <div className="flex-1 flex items-center justify-center p-8 text-center">
            <div className="text-white">
              <AlertTriangle size={48} className="mx-auto mb-4 opacity-50" />
              <p>{getText({ zh: '您还不是商家或未通过审核', en: 'You are not a merchant or not approved', ko: '판매자가 아니거나 승인되지 않았습니다', vi: 'Bạn không phải là người bán hoặc chưa được phê duyệt' })}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 to-pink-500 flex justify-center">
      <div className="w-full max-w-md flex flex-col min-h-screen">
        <header className="bg-white/10 backdrop-blur-sm p-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-white"><ArrowLeft size={24} /></button>
          <h1 className="text-lg font-bold text-white">{getText({ zh: '上传商品', en: 'Upload Product', ko: '상품 업로드', vi: 'Tải lên sản phẩm' })}</h1>
        </header>

        <div className="flex-1 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-4 space-y-4">
          {/* 商品主图 */}
          <div>
            <label className="block text-gray-700 font-bold mb-2">{getText({ zh: '商品主图', en: 'Main Image', ko: '메인 이미지', vi: 'Hình ảnh chính' })} *</label>
            <p className="text-gray-500 text-xs mb-2">{getText({ zh: '主图将显示在商品列表和详情页顶部（自动压缩优化）', en: 'Main image (auto-compressed)', ko: '메인 이미지 (자동 압축)', vi: 'Hình ảnh chính (tự động nén)' })}</p>
            <div className="border-2 border-dashed border-purple-300 rounded-lg p-4 text-center bg-purple-50">
              {formData.mainImage ? (
                <div className="relative inline-block">
                  <img src={formData.mainImage} alt="Main" className="max-h-40 mx-auto rounded" />
                  <button onClick={() => setFormData({ ...formData, mainImage: '' })} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"><X size={14} /></button>
                  <p className="text-xs text-gray-500 mt-2">{formatFileSize(getCompressedSize(formData.mainImage))}</p>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Upload className="w-10 h-10 text-purple-400 mx-auto mb-2" />
                  <p className="text-purple-600 text-sm font-bold">{getText({ zh: '点击上传主图', en: 'Upload main image', ko: '메인 이미지 업로드', vi: 'Tải lên hình ảnh chính' })}</p>
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const compressed = await compressImage(file, COMPRESS_PRESETS.main);
                        setFormData({ ...formData, mainImage: compressed });
                      } catch (error) {
                        console.error('图片压缩失败:', error);
                        alert(getText({ zh: '图片处理失败，请重试', en: 'Image processing failed', ko: '이미지 처리 실패', vi: 'Xử lý hình ảnh thất bại' }));
                      }
                    }
                  }} />
                </label>
              )}
            </div>
          </div>

          {/* 商品副图 */}
          <div>
            <label className="block text-gray-700 font-bold mb-2">{getText({ zh: '商品副图', en: 'Additional Images', ko: '추가 이미지', vi: 'Hình ảnh phụ' })} <span className="text-gray-400 font-normal text-sm">({getText({ zh: '最多4张', en: 'Max 4', ko: '최대 4장', vi: 'Tối đa 4' })})</span></label>
            <p className="text-gray-500 text-xs mb-2">{getText({ zh: '副图将显示在详情页下方，展示商品更多细节', en: 'Additional images will be shown below main image in detail page', ko: '추가 이미지는 상세 페이지 하단에 표시됩니다', vi: 'Hình ảnh phụ sẽ hiển thị bên dưới hình ảnh chính' })}</p>
            <div className="grid grid-cols-4 gap-2">
              {formData.subImages.map((img, idx) => (
                <div key={idx} className="relative aspect-square">
                  <img src={img} alt={`Sub ${idx + 1}`} className="w-full h-full object-cover rounded-lg" />
                  <button onClick={() => {
                    const newImages = [...formData.subImages];
                    newImages.splice(idx, 1);
                    setFormData({ ...formData, subImages: newImages });
                  }} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"><X size={12} /></button>
                </div>
              ))}
              {formData.subImages.length < 4 && (
                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors">
                  <ImagePlus className="w-6 h-6 text-gray-400" />
                  <span className="text-xs text-gray-400 mt-1">{getText({ zh: '添加', en: 'Add', ko: '추가', vi: 'Thêm' })}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file && formData.subImages.length < 4) {
                      try {
                        const compressed = await compressImage(file, COMPRESS_PRESETS.main);
                        setFormData({ ...formData, subImages: [...formData.subImages, compressed] });
                      } catch (error) {
                        console.error('图片压缩失败:', error);
                      }
                    }
                  }} />
                </label>
              )}
            </div>
          </div>

          {/* 商品名称 */}
          <div>
            <label className="block text-gray-700 font-bold mb-2">{getText({ zh: '商品名称', en: 'Product Name', ko: '상품명', vi: 'Tên sản phẩm' })} *</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder={getText({ zh: '请输入商品名称', en: 'Enter product name', ko: '상품명 입력', vi: 'Nhập tên sản phẩm' })} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
          </div>

          {/* 选择店铺（多店铺时显示） */}
          {allMerchants.length > 1 && (
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                <Store className="w-4 h-4 inline mr-1" />
                {getText({ zh: '选择店铺', en: 'Select Shop', ko: '상점 선택', vi: 'Chọn cửa hàng' })} *
              </label>
              <select
                value={selectedMerchantId}
                onChange={(e) => handleMerchantChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
              >
                {allMerchants.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.shopName} ({categoryLabels[m.category || '']?.[language] || m.category})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 商品分类 - 固定为入驻板块 */}
          <div>
            <label className="block text-gray-700 font-bold mb-2">{getText({ zh: '商品分类', en: 'Category', ko: '카테고리', vi: 'Danh mục' })}</label>
            <div className="px-4 py-3 bg-gray-100 rounded-lg text-gray-600">
              {categoryLabels[merchant.category]?.[language] || merchant.category}
              <span className="text-xs text-gray-400 ml-2">({getText({ zh: '根据入驻板块自动设置', en: 'Auto-set by your shop category', ko: '상점 카테고리에 따라 자동 설정', vi: 'Tự động đặt theo danh mục cửa hàng' })})</span>
            </div>
          </div>

          {/* 价格 */}
          <div>
            <label className="block text-gray-700 font-bold mb-2">{getText({ zh: '售价 (π)', en: 'Price (π)', ko: '가격 (π)', vi: 'Giá (π)' })} *</label>
            <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="0.00" step="0.01" min="0" className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
          </div>

          {/* 库存 */}
          <div>
            <label className="block text-gray-700 font-bold mb-2">{getText({ zh: '库存数量', en: 'Stock', ko: '재고', vi: 'Kho' })} *</label>
            <input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} placeholder={getText({ zh: '请输入真实库存', en: 'Enter real stock', ko: '실제 재고 입력', vi: 'Nhập kho thực' })} min="1" className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
            <p className="text-orange-500 text-xs mt-1 flex items-center gap-1"><AlertTriangle size={12} />{getText({ zh: '请填写真实库存，用户购买后无货将被罚款', en: 'Enter real stock. Penalty for out-of-stock after purchase', ko: '실제 재고를 입력하세요. 구매 후 품절 시 벌금', vi: 'Nhập kho thực. Phạt nếu hết hàng sau khi mua' })}</p>
          </div>

          {/* 商品描述 */}
          <div>
            <label className="block text-gray-700 font-bold mb-2">{getText({ zh: '商品描述', en: 'Description', ko: '설명', vi: 'Mô tả' })}</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder={getText({ zh: '请输入商品描述', en: 'Enter description', ko: '설명 입력', vi: 'Nhập mô tả' })} rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none" />
          </div>

          {/* 详情图 */}
          <div>
            <label className="block text-gray-700 font-bold mb-2">{getText({ zh: '详情图', en: 'Detail Images', ko: '상세 이미지', vi: 'Hình ảnh chi tiết' })} <span className="text-gray-400 font-normal text-sm">({getText({ zh: '最多5张', en: 'Max 5', ko: '최대 5장', vi: 'Tối đa 5' })})</span></label>
            <p className="text-gray-500 text-xs mb-2">{getText({ zh: '详情图将显示在商品详情介绍区域', en: 'Detail images will be shown in product description area', ko: '상세 이미지는 상품 설명 영역에 표시됩니다', vi: 'Hình ảnh chi tiết sẽ hiển thị trong phần mô tả sản phẩm' })}</p>
            <div className="grid grid-cols-5 gap-2">
              {formData.detailImages.map((img, idx) => (
                <div key={idx} className="relative aspect-square">
                  <img src={img} alt={`Detail ${idx + 1}`} className="w-full h-full object-cover rounded-lg" />
                  <button onClick={() => {
                    const newImages = [...formData.detailImages];
                    newImages.splice(idx, 1);
                    setFormData({ ...formData, detailImages: newImages });
                  }} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"><X size={12} /></button>
                </div>
              ))}
              {formData.detailImages.length < 5 && (
                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors">
                  <ImagePlus className="w-5 h-5 text-gray-400" />
                  <span className="text-[10px] text-gray-400 mt-1">{getText({ zh: '添加', en: 'Add', ko: '추가', vi: 'Thêm' })}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file && formData.detailImages.length < 5) {
                      try {
                        const compressed = await compressImage(file, COMPRESS_PRESETS.detail);
                        setFormData({ ...formData, detailImages: [...formData.detailImages, compressed] });
                      } catch (error) {
                        console.error('图片压缩失败:', error);
                      }
                    }
                  }} />
                </label>
              )}
            </div>
          </div>

            {/* 提交按钮 */}
            <button onClick={handleSubmit} disabled={loading} className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50">
              <Upload size={20} />
              {loading ? getText({ zh: '提交中...', en: 'Submitting...', ko: '제출 중...', vi: 'Đang gửi...' }) : getText({ zh: '提交审核', en: 'Submit for Review', ko: '검토 제출', vi: 'Gửi xét duyệt' })}
            </button>

            <p className="text-center text-gray-500 text-sm">{getText({ zh: '商品提交后需要管理员审核', en: 'Products need admin review', ko: '상품은 관리자 검토가 필요합니다', vi: 'Sản phẩm cần được quản trị viên xét duyệt' })}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
