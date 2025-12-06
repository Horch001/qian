import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Upload, AlertTriangle, X, ImagePlus, Store, Eye, Edit3, Save, Plus } from 'lucide-react';
import { Language, Translations } from '../types';
import { merchantApi, Merchant } from '../services/api';
import { compressImage, COMPRESS_PRESETS, formatFileSize, getCompressedSize, checkImageQuality } from '../utils/imageCompressor';

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    mainImage: '',
    subImages: [] as string[],
    detailImages: [] as string[],
    parameters: [] as { key: string; value: string }[],
  });

  const getText = (obj: { [key: string]: string }) => obj[language] || obj.zh;

  const categoryLabels: Record<string, { [key: string]: string }> = {
    PHYSICAL: { zh: '实体商城', en: 'Physical Mall', ko: '실물 쇼핑몰', vi: 'Trung tâm mua sắm' },
    VIRTUAL: { zh: '虚拟商城', en: 'Virtual Mall', ko: '가상 쇼핑몰', vi: 'Trung tâm ảo' },
    SERVICE: { zh: '上门服务', en: 'Home Service', ko: '방문 서비스', vi: 'Dịch vụ tận nhà' },
    OFFLINE_PLAY: { zh: '线下陪玩', en: 'Offline Play', ko: '오프라인 플레이', vi: 'Chơi offline' },
    COURSE: { zh: '知识付费', en: 'Paid Courses', ko: '유료 강좌', vi: 'Khóa học trả phí' },
    DETECTIVE: { zh: '商业调查', en: 'Business Investigation', ko: '비즈니스 조사', vi: 'Điều tra kinh doanh' },
    HOUSE_LEASE: { zh: '商业租赁', en: 'Commercial Lease', ko: '상업 임대', vi: 'Cho thuê thương mại' },
  };

  const stateData = location.state as { merchantId?: string; shopName?: string; editProduct?: any } | null;
  const isEditMode = !!stateData?.editProduct;

  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        const merchants = await merchantApi.getMyAllMerchants();
        const approvedMerchants = merchants.filter(m => m.status === 'APPROVED');
        setAllMerchants(approvedMerchants);
        
        if (stateData?.merchantId) {
          const targetMerchant = approvedMerchants.find(m => m.id === stateData.merchantId);
          if (targetMerchant) {
            setMerchant(targetMerchant);
            setSelectedMerchantId(targetMerchant.id);
          }
        } else if (approvedMerchants.length > 0) {
          setMerchant(approvedMerchants[0]);
          setSelectedMerchantId(approvedMerchants[0].id);
        }
        
        if (stateData?.editProduct) {
          const product = stateData.editProduct;
          const params = product.parameters ? Object.entries(product.parameters).map(([key, value]) => ({ key, value: String(value) })) : [];
          setFormData({
            title: product.title || '',
            description: product.description || '',
            price: product.price?.toString() || '',
            stock: product.stock?.toString() || '',
            mainImage: product.images?.[0] || '',
            subImages: product.images?.slice(1) || [],
            detailImages: product.detailImages || [],
            parameters: params,
          });
        }
      } catch (error) {
        console.error('Failed to fetch merchants:', error);
      }
    };
    fetchMerchants();
  }, [stateData?.merchantId, stateData?.editProduct]);

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
      const allImages = [formData.mainImage, ...formData.subImages];
      
      // 转换参数为对象格式
      const parametersObj = formData.parameters.reduce((acc, param) => {
        if (param.key.trim() && param.value.trim()) {
          acc[param.key.trim()] = param.value.trim();
        }
        return acc;
      }, {} as Record<string, string>);
      
      const productData = {
        merchantId: selectedMerchantId,
        title: formData.title,
        description: formData.description || undefined,
        price: formData.price,
        stock: parseInt(formData.stock),
        images: allImages,
        detailImages: formData.detailImages,
        parameters: Object.keys(parametersObj).length > 0 ? parametersObj : undefined,
      };
      
      if (isEditMode && stateData?.editProduct) {
        await merchantApi.updateProduct(stateData.editProduct.id, productData);
        alert(getText({ zh: '商品已更新，等待管理员审核', en: 'Product updated, pending review', ko: '상품이 업데이트되었습니다', vi: 'Sản phẩm đã cập nhật' }));
      } else {
        await merchantApi.uploadProduct(productData);
        alert(getText({ zh: '商品已提交，等待管理员审核', en: 'Product submitted, pending review', ko: '상품이 제출되었습니다', vi: 'Sản phẩm đã gửi' }));
      }
      
      navigate('/my-shops');
    } catch (error: any) {
      console.error(isEditMode ? '更新失败:' : '上传失败:', error);
      alert(error.message || getText({ 
        zh: isEditMode ? '更新失败，请重试' : '上传失败，请重试', 
        en: isEditMode ? 'Update failed' : 'Upload failed', 
        ko: isEditMode ? '업데이트 실패' : '업로드 실패', 
        vi: isEditMode ? 'Cập nhật thất bại' : 'Tải lên thất bại' 
      }));
    } finally {
      setLoading(false);
    }
  };

  if (!merchant || merchant.status !== 'APPROVED') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-600 to-pink-500 flex justify-center">
        <div className="w-full max-w-md flex flex-col min-h-screen">
          <header className="p-4 flex items-center justify-center relative">
            <button onClick={() => navigate(-1)} className="text-white absolute left-4"><ArrowLeft size={24} /></button>
            <h1 className="text-lg font-bold text-white">
              {isEditMode 
                ? getText({ zh: '编辑商品', en: 'Edit Product', ko: '상품 편집', vi: 'Chỉnh sửa sản phẩm' })
                : getText({ zh: '上传商品', en: 'Upload Product', ko: '상품 업로드', vi: 'Tải lên sản phẩm' })
              }
            </h1>
          </header>
          <div className="flex-1 flex items-center justify-center p-8 text-center">
            <div className="text-white">
              <AlertTriangle size={48} className="mx-auto mb-4 opacity-50" />
              <p>{getText({ zh: '您还不是商家或未通过审核', en: 'You are not a merchant or not approved', ko: '판매자가 아니거나 승인되지 않았습니다', vi: 'Bạn không phải là người bán' })}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const allImages = formData.mainImage ? [formData.mainImage, ...formData.subImages] : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-300 flex flex-col">
      {/* 顶部工具栏 */}
      <header className="bg-white/90 backdrop-blur-sm sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-sm font-bold text-gray-800">
            {isEditMode 
              ? getText({ zh: '编辑商品', en: 'Edit Product', ko: '상품 편집', vi: 'Chỉnh sửa' })
              : getText({ zh: '上传商品', en: 'Upload Product', ko: '상품 업로드', vi: 'Tải lên' })
            }
          </h1>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-sm font-bold rounded-lg disabled:opacity-50 flex items-center gap-1"
          >
            <Save size={16} />
            {loading ? getText({ zh: '保存中', en: 'Saving', ko: '저장 중', vi: 'Đang lưu' }) : getText({ zh: '保存', en: 'Save', ko: '저장', vi: 'Lưu' })}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-md w-full mx-auto overflow-auto pb-4">
        {/* 主图展示区 - 可编辑 */}
        <div className="bg-white w-full aspect-square flex items-center justify-center overflow-hidden relative group">
          {allImages.length > 0 ? (
            <>
              <img 
                src={allImages[currentImageIndex]} 
                alt="商品主图" 
                className="w-full h-full object-cover" 
              />
              {/* 编辑按钮 */}
              <label className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg cursor-pointer hover:bg-white transition-colors flex items-center gap-2 shadow-lg">
                <Edit3 size={16} className="text-purple-600" />
                <span className="text-sm font-bold text-purple-600">{getText({ zh: '更换', en: 'Change', ko: '변경', vi: 'Thay đổi' })}</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const compressed = await compressImage(file, COMPRESS_PRESETS.main);
                        if (currentImageIndex === 0) {
                          setFormData({ ...formData, mainImage: compressed });
                        } else {
                          const newSubImages = [...formData.subImages];
                          newSubImages[currentImageIndex - 1] = compressed;
                          setFormData({ ...formData, subImages: newSubImages });
                        }
                      } catch (error) {
                        alert(getText({ zh: '图片处理失败', en: 'Image processing failed', ko: '이미지 처리 실패', vi: 'Xử lý hình ảnh thất bại' }));
                      }
                    }
                  }} 
                />
              </label>
              {/* 图片尺寸建议 */}
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                <p className="text-white text-xs">{getText({ zh: '建议尺寸: 800x800 或 1000x1000', en: 'Recommended: 800x800 or 1000x1000', ko: '권장 크기: 800x800 또는 1000x1000', vi: 'Khuyến nghị: 800x800 hoặc 1000x1000' })}</p>
              </div>
            </>
          ) : (
            <label className="cursor-pointer flex flex-col items-center gap-3">
              <div className="w-20 h-20 bg-white/50 rounded-full flex items-center justify-center">
                <ImagePlus className="w-10 h-10 text-purple-400" />
              </div>
              <p className="text-purple-600 font-bold">{getText({ zh: '点击上传商品主图', en: 'Upload main image', ko: '메인 이미지 업로드', vi: 'Tải lên hình ảnh chính' })}</p>
              <p className="text-purple-500 text-sm">{getText({ zh: '建议尺寸: 800x800 或 1000x1000 (正方形)', en: 'Recommended: 800x800 or 1000x1000 (square)', ko: '권장: 800x800 또는 1000x1000 (정사각형)', vi: 'Khuyến nghị: 800x800 hoặc 1000x1000 (vuông)' })}</p>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      const compressed = await compressImage(file, COMPRESS_PRESETS.main);
                      setFormData({ ...formData, mainImage: compressed });
                    } catch (error) {
                      alert(getText({ zh: '图片处理失败', en: 'Image processing failed', ko: '이미지 처리 실패', vi: 'Xử lý hình ảnh thất bại' }));
                    }
                  }
                }} 
              />
            </label>
          )}
        </div>
        
        {/* 副图上传区 - 始终显示副图上传按钮 */}
        <div className="bg-white py-3 border-b">
          <div className="px-4 mb-2 flex items-center justify-between">
            <p className="text-xs font-bold text-gray-600">{getText({ zh: '副图 (最多8张)', en: 'Sub Images (Max 8)', ko: '서브 이미지 (최대 8장)', vi: 'Hình phụ (Tối đa 8)' })}</p>
            <p className="text-xs text-gray-400">{formData.subImages.length}/8</p>
          </div>
          <div className="flex gap-2 overflow-x-auto px-4" style={{ scrollbarWidth: 'thin' }}>
            {/* 主图缩略图 - 只在有主图时显示 */}
            {formData.mainImage && (
              <div 
                className={`w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer transition-all relative ${
                  currentImageIndex === 0 ? 'border-2 border-purple-600' : 'border border-gray-200'
                }`}
                onClick={() => setCurrentImageIndex(0)}
              >
                <img src={formData.mainImage} alt="主图" className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-purple-600 text-white text-[10px] text-center py-0.5">
                  {getText({ zh: '主图', en: 'Main', ko: '메인', vi: 'Chính' })}
                </div>
              </div>
            )}
            
            {/* 副图 */}
            {formData.subImages.map((img: string, idx: number) => (
              <div 
                key={idx} 
                className={`w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer transition-all relative ${
                  currentImageIndex === idx + 1 ? 'border-2 border-purple-600' : 'border border-gray-200'
                }`}
                onClick={() => setCurrentImageIndex(idx + 1)}
              >
                <img src={img} alt={`副图 ${idx + 1}`} className="w-full h-full object-cover" />
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    const newSubImages = [...formData.subImages];
                    newSubImages.splice(idx, 1);
                    setFormData({ ...formData, subImages: newSubImages });
                    if (currentImageIndex > idx) {
                      setCurrentImageIndex(Math.max(0, currentImageIndex - 1));
                    }
                  }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            
            {/* 添加副图按钮 - 始终显示 */}
            {formData.subImages.length < 8 && (
              <label className="w-16 h-16 flex-shrink-0 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors">
                <ImagePlus className="w-5 h-5 text-gray-400" />
                <span className="text-[10px] text-gray-500 mt-0.5">{getText({ zh: '副图', en: 'Sub', ko: '서브', vi: 'Phụ' })}</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file && formData.subImages.length < 8) {
                      try {
                        const compressed = await compressImage(file, COMPRESS_PRESETS.main);
                        setFormData({ ...formData, subImages: [...formData.subImages, compressed] });
                      } catch (error) {
                        console.error('图片压缩失败:', error);
                      }
                    }
                  }} 
                />
              </label>
            )}
          </div>
        </div>

        {/* 商品信息 - 统一表单样式 */}
        <div className="bg-white p-4 space-y-3">
          {/* 商品名称 */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-bold text-gray-700 w-20 flex-shrink-0">
              {getText({ zh: '商品名称', en: 'Name', ko: '상품명', vi: 'Tên' })}
            </label>
            <input 
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={getText({ zh: '请输入商品名称', en: 'Enter name', ko: '상품명 입력', vi: 'Nhập tên' })}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all"
            />
          </div>

          {/* 价格 */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-bold text-gray-700 w-20 flex-shrink-0">
              {getText({ zh: '商品价格', en: 'Price', ko: '가격', vi: 'Giá' })}
            </label>
            <div className="flex-1 relative">
              <input 
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg text-gray-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-red-600 font-bold">π</span>
            </div>
          </div>

          {/* 库存 */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-bold text-gray-700 w-20 flex-shrink-0">
              {getText({ zh: '库存数量', en: 'Stock', ko: '재고', vi: 'Kho' })}
            </label>
            <input 
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              placeholder="0"
              min="1"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* 商品参数 */}
        <div className="bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-700">{getText({ zh: '商品参数', en: 'Parameters', ko: '상품 매개변수', vi: 'Thông số' })}</h3>
            <button
              onClick={() => setFormData({ ...formData, parameters: [...formData.parameters, { key: '', value: '' }] })}
              className="flex items-center gap-1 px-3 py-1 text-xs text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
            >
              <Plus size={14} />
              {getText({ zh: '添加参数', en: 'Add', ko: '추가', vi: 'Thêm' })}
            </button>
          </div>
          
          {formData.parameters.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-sm">
              {getText({ zh: '暂无参数，点击上方按钮添加', en: 'No parameters, click above to add', ko: '매개변수 없음', vi: 'Chưa có thông số' })}
            </div>
          ) : (
            <div className="space-y-2">
              {formData.parameters.map((param, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={param.key}
                    onChange={(e) => {
                      const newParams = [...formData.parameters];
                      newParams[index].key = e.target.value;
                      setFormData({ ...formData, parameters: newParams });
                    }}
                    placeholder={getText({ zh: '参数名（如：品牌）', en: 'Name (e.g. Brand)', ko: '이름', vi: 'Tên' })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={param.value}
                    onChange={(e) => {
                      const newParams = [...formData.parameters];
                      newParams[index].value = e.target.value;
                      setFormData({ ...formData, parameters: newParams });
                    }}
                    placeholder={getText({ zh: '参数值（如：Apple）', en: 'Value (e.g. Apple)', ko: '값', vi: 'Giá trị' })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      const newParams = formData.parameters.filter((_, i) => i !== index);
                      setFormData({ ...formData, parameters: newParams });
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 店铺信息 */}
        <div className="bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center overflow-hidden">
                {merchant?.logo ? (
                  <img src={merchant.logo} alt="店铺Logo" className="w-full h-full object-cover" />
                ) : (
                  <Store className="w-5 h-5 text-purple-600" />
                )}
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">{merchant?.shopName}</p>
                <p className="text-xs text-gray-500">{categoryLabels[merchant.category]?.[language]}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 商品描述 - 可编辑 */}
        <div className="bg-white p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-3">{getText({ zh: '商品描述', en: 'Description', ko: '설명', vi: 'Mô tả' })}</h3>
          <textarea 
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder={getText({ zh: '请输入商品描述...', en: 'Enter description...', ko: '설명 입력...', vi: 'Nhập mô tả...' })}
            rows={4}
            className="w-full text-sm text-gray-600 leading-relaxed border border-gray-200 rounded-lg p-3 focus:border-purple-500 focus:outline-none resize-none"
          />
        </div>
        
        {/* 详情图展示和编辑 - 占满宽度 */}
        <div className="bg-white">
          <div className="p-4 pb-2">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-bold text-gray-700">{getText({ zh: '详情图', en: 'Detail Images', ko: '상세 이미지', vi: 'Hình ảnh chi tiết' })}</p>
                <p className="text-xs text-gray-400 mt-0.5">{getText({ zh: '建议宽度750px，高度不限', en: 'Width: 750px recommended', ko: '권장 너비: 750px', vi: 'Khuyến nghị rộng: 750px' })}</p>
              </div>
              <span className="text-xs text-gray-400">({formData.detailImages.length}/20)</span>
            </div>
            {formData.detailImages.map((img: string, idx: number) => (
              <div key={idx} className="relative w-full bg-gray-50 group">
                <img src={img} alt={`详情图 ${idx + 1}`} className="w-full h-auto" />
                <button 
                  onClick={() => {
                    const newImages = [...formData.detailImages];
                    newImages.splice(idx, 1);
                    setFormData({ ...formData, detailImages: newImages });
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          {formData.detailImages.length < 20 && (
            <div className="p-4 pt-2">
              <label className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors">
                  <ImagePlus className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">{getText({ zh: '添加详情图', en: 'Add detail image', ko: '상세 이미지 추가', vi: 'Thêm hình ảnh chi tiết' })}</span>
                  <span className="text-xs text-gray-400 mt-1">{getText({ zh: '宽度750px最佳', en: 'Width 750px best', ko: '너비 750px 최적', vi: 'Rộng 750px tốt nhất' })}</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file && formData.detailImages.length < 20) {
                        try {
                          const compressed = await compressImage(file, COMPRESS_PRESETS.detail);
                          setFormData({ ...formData, detailImages: [...formData.detailImages, compressed] });
                        } catch (error) {
                          console.error('图片压缩失败:', error);
                        }
                      }
                    }} 
                  />
                </label>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
