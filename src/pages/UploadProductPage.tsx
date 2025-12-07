import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Upload, AlertTriangle, X, ImagePlus, Store, Eye, Edit3, Save, Plus, MapPin, Check } from 'lucide-react';
import { Language, Translations } from '../types';
import { merchantApi, Merchant } from '../services/api';
import { compressImage, COMPRESS_PRESETS, formatFileSize, getCompressedSize, checkImageQuality } from '../utils/imageCompressor';
import { LOCATION_DATA } from '../constants/locations';

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
  const [showServiceAreaModal, setShowServiceAreaModal] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    mainImage: '',
    subImages: [] as string[],
    detailImages: [] as string[],
    parameters: [] as { key: string; value: string }[],
    serviceAreas: {} as Record<string, string[]>,
    serviceNationwide: false,
  });

  const getText = (obj: { [key: string]: string }) => obj[language] || obj.zh;

  const categoryLabels: Record<string, { [key: string]: string }> = {
    PHYSICAL: { zh: '实体商城', en: 'Physical Mall', ko: '실물 쇼핑몰', vi: 'Trung tâm mua sắm' },
    VIRTUAL: { zh: '虚拟商城', en: 'Virtual Mall', ko: '가상 쇼핑몰', vi: 'Trung tâm ảo' },
    SERVICE: { zh: '上门服务', en: 'Home Service', ko: '방문 서비스', vi: 'Dịch vụ tận nhà' },
    OFFLINE_PLAY: { zh: '线下陪玩', en: 'Offline Play', ko: '오프라인 플레이', vi: 'Chơi offline' },
    COURSE: { zh: '知识付费', en: 'Paid Courses', ko: '유료 강좌', vi: 'Khóa học trả phí' },
    DETECTIVE: { zh: '商业调查', en: 'Business Investigation', ko: '비즈니스 조사', vi: 'Điều tra kinh doanh' },
    CASUAL_GAME: { zh: '休闲游戏', en: 'Casual Games', ko: '캐주얼 게임', vi: 'Trò chơi giải trí' },
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
            serviceAreas: product.serviceAreas || {},
            serviceNationwide: product.serviceNationwide || false,
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
        serviceAreas: Object.keys(formData.serviceAreas).length > 0 ? formData.serviceAreas : undefined,
        serviceNationwide: formData.serviceNationwide,
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
        {/* 主图展示区 */}
        <div className="bg-white w-full aspect-square flex items-center justify-center overflow-hidden relative group">
          {formData.mainImage ? (
            <>
              <img 
                src={formData.mainImage} 
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
                        setFormData({ ...formData, mainImage: compressed });
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
              <p className="text-purple-600 font-bold">{getText({ zh: '点击上传商品主图', en: 'Upload main image', ko: '메인 이미지 업로드', vi: 'Tải lên hình chính' })}</p>
              <p className="text-purple-500 text-sm">{getText({ zh: '支持JPG、PNG格式', en: 'JPG, PNG supported', ko: 'JPG, PNG 지원', vi: 'Hỗ trợ JPG, PNG' })}</p>
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
        
        {/* 副图上传区 */}
        <div className="bg-white py-3 border-b">
          <div className="px-4 mb-2 flex items-center justify-between">
            <p className="text-xs font-bold text-gray-600">{getText({ zh: '副图 (最多8张)', en: 'Sub Images (Max 8)', ko: '서브 이미지 (최대 8장)', vi: 'Hình phụ (Tối đa 8)' })}</p>
            <p className="text-xs text-gray-400">{formData.subImages.length}/8</p>
          </div>
          <div className="flex gap-2 overflow-x-auto px-4" style={{ scrollbarWidth: 'thin' }}>
            {/* 副图列表 */}
            {formData.subImages.map((img, idx) => (
              <div 
                key={idx} 
                className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden relative border border-gray-200"
              >
                <img src={img} alt={`副图 ${idx + 1}`} className="w-full h-full object-cover" />
                <button 
                  onClick={() => {
                    const newSubImages = formData.subImages.filter((_, i) => i !== idx);
                    setFormData({ ...formData, subImages: newSubImages });
                  }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            
            {/* 添加副图按钮 */}
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
                        setFormData({ 
                          ...formData, 
                          subImages: [...formData.subImages, compressed] 
                        });
                      } catch (error) {
                        console.error('图片压缩失败:', error);
                        alert(getText({ zh: '图片处理失败', en: 'Image processing failed', ko: '이미지 처리 실패', vi: 'Xử lý hình ảnh thất bại' }));
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

        {/* 服务区域选择 - 仅针对上门服务和线下陪玩 */}
        {(merchant?.category === 'SERVICE' || merchant?.category === 'OFFLINE_PLAY') && (
          <div className="bg-white p-4">
            <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
              <MapPin size={16} className="text-purple-600" />
              {getText({ zh: '服务区域', en: 'Service Area', ko: '서비스 지역', vi: 'Khu vực dịch vụ' })}
            </h3>
            
            {/* 全国服务选项 */}
            <label className="flex items-center gap-2 mb-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.serviceNationwide}
                onChange={(e) => {
                  setFormData({ 
                    ...formData, 
                    serviceNationwide: e.target.checked,
                    serviceAreas: e.target.checked ? {} : formData.serviceAreas
                  });
                }}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="text-sm text-gray-700">
                {getText({ zh: '全国服务', en: 'Nationwide Service', ko: '전국 서비스', vi: 'Dịch vụ toàn quốc' })}
              </span>
            </label>

            {!formData.serviceNationwide && (
              <>
                {/* 已选择的服务区域 */}
                {Object.keys(formData.serviceAreas).length > 0 && (
                  <div className="mb-3 space-y-2">
                    {Object.entries(formData.serviceAreas).map(([province, cities]) => (
                      <div key={province} className="bg-purple-50 rounded-lg p-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-purple-900">{province}</span>
                          <button
                            onClick={() => {
                              const newAreas = { ...formData.serviceAreas };
                              delete newAreas[province];
                              setFormData({ ...formData, serviceAreas: newAreas });
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {cities.map(city => (
                            <span key={city} className="text-xs bg-white px-2 py-1 rounded text-gray-700">
                              {city}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 添加服务区域按钮 */}
                <button
                  type="button"
                  onClick={() => setShowServiceAreaModal(true)}
                  className="w-full py-2 border-2 border-dashed border-purple-300 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  {getText({ zh: '添加服务区域', en: 'Add Service Area', ko: '서비스 지역 추가', vi: 'Thêm khu vực dịch vụ' })}
                </button>
              </>
            )}
          </div>
        )}
        
        {/* 详情图展示和编辑 */}
        <div className="bg-white">
          <div className="p-4 pb-2">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-bold text-gray-700">{getText({ zh: '详情图', en: 'Detail Images', ko: '상세 이미지', vi: 'Hình chi tiết' })}</p>
                <p className="text-xs text-gray-400 mt-0.5">{getText({ zh: '建议宽度750px', en: 'Width 750px recommended', ko: '너비 750px 권장', vi: 'Rộng 750px khuyến nghị' })}</p>
              </div>
              <span className="text-xs text-gray-400">({formData.detailImages.length}/20)</span>
            </div>
            {formData.detailImages.map((img, idx) => (
              <div key={idx} className="relative w-full bg-gray-50 group mb-2">
                <img src={img} alt={`详情图 ${idx + 1}`} className="w-full h-auto" />
                <button 
                  onClick={() => {
                    const newImages = formData.detailImages.filter((_, i) => i !== idx);
                    setFormData({ ...formData, detailImages: newImages });
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
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
                <span className="text-sm text-gray-500">{getText({ zh: '添加详情图', en: 'Add Detail Image', ko: '상세 이미지 추가', vi: 'Thêm hình chi tiết' })}</span>
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
                        setFormData({ 
                          ...formData, 
                          detailImages: [...formData.detailImages, compressed] 
                        });
                      } catch (error) {
                        console.error('图片压缩失败:', error);
                        alert(getText({ zh: '图片处理失败', en: 'Image processing failed', ko: '이미지 처리 실패', vi: 'Xử lý hình ảnh thất bại' }));
                      }
                    }
                  }} 
                />
              </label>
            </div>
          )}
        </div>
      </main>

      {/* 服务区域选择模态框 */}
      {showServiceAreaModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-gray-800">
                {getText({ zh: '选择服务区域', en: 'Select Service Area', ko: '서비스 지역 선택', vi: 'Chọn khu vực dịch vụ' })}
              </h3>
              <button onClick={() => {
                setShowServiceAreaModal(false);
                setSelectedProvince('');
                setSelectedCities([]);
              }} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {!selectedProvince ? (
                /* 选择省份 */
                <div className="space-y-2">
                  {LOCATION_DATA[0]?.regions.map(region => (
                    <button
                      key={region.name}
                      onClick={() => setSelectedProvince(region.name)}
                      className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-700">{region.name}</span>
                    </button>
                  ))}
                </div>
              ) : (
                /* 选择城市 */
                <div>
                  <button
                    onClick={() => {
                      setSelectedProvince('');
                      setSelectedCities([]);
                    }}
                    className="mb-3 text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
                  >
                    ← {getText({ zh: '返回选择省份', en: 'Back to provinces', ko: '지역 선택으로 돌아가기', vi: 'Quay lại chọn tỉnh' })}
                  </button>
                  <div className="space-y-2">
                    {LOCATION_DATA[0]?.regions
                      .find(r => r.name === selectedProvince)
                      ?.cities.map(city => (
                        <label
                          key={city}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-purple-50 rounded-lg cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedCities.includes(city)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCities([...selectedCities, city]);
                              } else {
                                setSelectedCities(selectedCities.filter(c => c !== city));
                              }
                            }}
                            className="w-4 h-4 text-purple-600 rounded"
                          />
                          <span className="text-sm text-gray-700">{city}</span>
                          {selectedCities.includes(city) && (
                            <Check size={14} className="ml-auto text-purple-600" />
                          )}
                        </label>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {selectedProvince && selectedCities.length > 0 && (
              <div className="p-4 border-t">
                <button
                  onClick={() => {
                    setFormData({
                      ...formData,
                      serviceAreas: {
                        ...formData.serviceAreas,
                        [selectedProvince]: selectedCities,
                      },
                    });
                    setShowServiceAreaModal(false);
                    setSelectedProvince('');
                    setSelectedCities([]);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
                >
                  {getText({ zh: '确认添加', en: 'Confirm', ko: '확인', vi: 'Xác nhận' })}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
