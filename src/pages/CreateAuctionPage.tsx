import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Language } from '../types';
import api from '../services/api';
import { compressImage } from '../utils/imageCompressor';

interface CreateAuctionPageProps {
  language: Language;
}

export const CreateAuctionPage: React.FC<CreateAuctionPageProps> = ({ language }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startPrice: '',
    reservePrice: '',
    bidIncrement: '',
    deposit: '',
    startTime: '',
    endTime: '',
  });

  const translations = {
    title: { zh: '发布拍卖', en: 'Create Auction', ko: '경매 등록', vi: 'Tạo đấu giá' },
    auctionTitle: { zh: '拍卖标题', en: 'Title', ko: '제목', vi: 'Tiêu đề' },
    description: { zh: '商品描述', en: 'Description', ko: '설명', vi: 'Mô tả' },
    images: { zh: '商品图片', en: 'Images', ko: '이미지', vi: 'Hình ảnh' },
    startPrice: { zh: '起拍价 (π)', en: 'Start Price', ko: '시작가', vi: 'Giá khởi điểm' },
    reservePrice: { zh: '保留价 (π)', en: 'Reserve Price', ko: '최저가', vi: 'Giá dự trữ' },
    bidIncrement: { zh: '加价幅度 (π)', en: 'Bid Increment', ko: '입찰 단위', vi: 'Bước giá' },
    deposit: { zh: '保证金 (π)', en: 'Deposit', ko: '보증금', vi: 'Tiền cọc' },
    startTime: { zh: '开始时间', en: 'Start Time', ko: '시작 시간', vi: 'Thời gian bắt đầu' },
    endTime: { zh: '结束时间', en: 'End Time', ko: '종료 시간', vi: 'Thời gian kết thúc' },
    submit: { zh: '发布拍卖', en: 'Publish', ko: '등록', vi: 'Đăng' },
    uploading: { zh: '上传中...', en: 'Uploading...', ko: '업로드 중...', vi: 'Đang tải...' },
    addImage: { zh: '添加图片', en: 'Add Image', ko: '이미지 추가', vi: 'Thêm ảnh' },
    optional: { zh: '（可选）', en: '(Optional)', ko: '(선택)', vi: '(Tùy chọn)' },
    reservePriceHint: { zh: '低于此价格将流拍', en: 'Below this price will fail', ko: '이 가격 이하는 유찰', vi: 'Dưới giá này sẽ thất bại' },
  };

  const t = (key: keyof typeof translations) => translations[key][language];

  // 检查用户是否是商家
  useEffect(() => {
    const checkMerchant = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role !== 'MERCHANT' && user.role !== 'ADMIN') {
          alert(language === 'zh' ? '只有商家才能发布拍卖，请先申请成为商家' : 'Only merchants can create auctions');
          navigate('/join-store');
          return;
        }
        setChecking(false);
      } catch (error) {
        console.error('检查商家权限失败:', error);
        setChecking(false);
      }
    };
    checkMerchant();
  }, [language, navigate]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // 压缩图片（直接返回 base64，不需要上传到服务器）
        const compressedBase64 = await compressImage(file, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.8,
        });

        uploadedUrls.push(compressedBase64);
      }

      setImages([...images, ...uploadedUrls]);
    } catch (error: any) {
      alert(language === 'zh' ? '图片处理失败' : 'Image processing failed');
      console.error('图片压缩失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证
    if (!formData.title.trim()) {
      alert(language === 'zh' ? '请输入拍卖标题' : 'Please enter title');
      return;
    }

    if (!formData.description.trim()) {
      alert(language === 'zh' ? '请输入商品描述' : 'Please enter description');
      return;
    }

    if (images.length === 0) {
      alert(language === 'zh' ? '请至少上传一张图片' : 'Please upload at least one image');
      return;
    }

    if (!formData.startPrice || parseFloat(formData.startPrice) <= 0) {
      alert(language === 'zh' ? '请输入有效的起拍价' : 'Please enter valid start price');
      return;
    }

    if (!formData.bidIncrement || parseFloat(formData.bidIncrement) <= 0) {
      alert(language === 'zh' ? '请输入有效的加价幅度' : 'Please enter valid bid increment');
      return;
    }

    if (!formData.deposit || parseFloat(formData.deposit) <= 0) {
      alert(language === 'zh' ? '请输入有效的保证金' : 'Please enter valid deposit');
      return;
    }

    if (!formData.startTime) {
      alert(language === 'zh' ? '请选择开始时间' : 'Please select start time');
      return;
    }

    if (!formData.endTime) {
      alert(language === 'zh' ? '请选择结束时间' : 'Please select end time');
      return;
    }

    // 验证时间
    const startTime = new Date(formData.startTime);
    const endTime = new Date(formData.endTime);
    const now = new Date();

    if (startTime < now) {
      alert(language === 'zh' ? '开始时间不能早于当前时间' : 'Start time cannot be earlier than now');
      return;
    }

    if (endTime <= startTime) {
      alert(language === 'zh' ? '结束时间必须晚于开始时间' : 'End time must be later than start time');
      return;
    }

    setLoading(true);
    try {
      console.log('提交拍卖数据:', {
        title: formData.title,
        description: formData.description,
        images,
        startPrice: parseFloat(formData.startPrice),
        reservePrice: formData.reservePrice ? parseFloat(formData.reservePrice) : null,
        bidIncrement: parseFloat(formData.bidIncrement),
        deposit: parseFloat(formData.deposit),
        startTime: formData.startTime,
        endTime: formData.endTime,
      });

      await api.post('/auctions', {
        title: formData.title,
        description: formData.description,
        images,
        startPrice: parseFloat(formData.startPrice),
        reservePrice: formData.reservePrice ? parseFloat(formData.reservePrice) : null,
        bidIncrement: parseFloat(formData.bidIncrement),
        deposit: parseFloat(formData.deposit),
        startTime: formData.startTime,
        endTime: formData.endTime,
      });

      alert(language === 'zh' ? '拍卖发布成功！' : 'Auction created successfully!');
      navigate('/venture-capital');
    } catch (error: any) {
      console.error('发布拍卖失败:', error);
      const errorMsg = error.response?.data?.message || error.message || '发布失败';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-600 to-pink-500 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 to-pink-500 pb-20">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center px-4 py-3">
          <button onClick={() => navigate(-1)} className="text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="flex-1 text-center text-xl font-bold text-white">{t('title')}</h1>
          <div className="w-6"></div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4">
        {/* 标题 */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
          <label className="block text-white text-sm font-medium mb-2">{t('auctionTitle')}</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder={language === 'zh' ? '例如：iPhone 15 Pro Max 256GB 全新未拆封' : 'e.g. iPhone 15 Pro Max 256GB'}
            className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:border-white"
          />
        </div>

        {/* 描述 */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
          <label className="block text-white text-sm font-medium mb-2">{t('description')}</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder={language === 'zh' ? '详细描述商品的状况、配件、购买时间等信息...' : 'Describe the item...'}
            rows={5}
            className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:border-white resize-none"
          />
        </div>

        {/* 图片上传 */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
          <label className="block text-white text-sm font-medium mb-2">{t('images')}</label>
          <div className="grid grid-cols-3 gap-2">
            {images.map((img, index) => (
              <div key={index} className="relative aspect-square">
                <img src={img} alt="" className="w-full h-full object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
            {images.length < 6 && (
              <label className="aspect-square border-2 border-dashed border-white/50 rounded-lg flex items-center justify-center cursor-pointer hover:border-white">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={loading}
                />
                <div className="text-center">
                  <svg className="w-8 h-8 text-white/70 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <div className="text-xs text-white/70 mt-1">{t('addImage')}</div>
                </div>
              </label>
            )}
          </div>
        </div>

        {/* 价格信息 */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 space-y-3">
          <div>
            <label className="block text-white text-sm font-medium mb-2">{t('startPrice')}</label>
            <input
              type="number"
              step="0.01"
              value={formData.startPrice}
              onChange={(e) => setFormData({ ...formData, startPrice: e.target.value })}
              placeholder="1000"
              className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:border-white"
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">
              {t('reservePrice')} {t('optional')}
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.reservePrice}
              onChange={(e) => setFormData({ ...formData, reservePrice: e.target.value })}
              placeholder="1500"
              className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:border-white"
            />
            <div className="text-xs text-white/60 mt-1">{t('reservePriceHint')}</div>
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">{t('bidIncrement')}</label>
            <input
              type="number"
              step="0.01"
              value={formData.bidIncrement}
              onChange={(e) => setFormData({ ...formData, bidIncrement: e.target.value })}
              placeholder="100"
              className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:border-white"
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">{t('deposit')}</label>
            <input
              type="number"
              step="0.01"
              value={formData.deposit}
              onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
              placeholder="200"
              className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:border-white"
            />
          </div>
        </div>

        {/* 时间设置 */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 space-y-3">
          <div>
            <label className="block text-white text-sm font-medium mb-2">{t('startTime')}</label>
            <input
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:border-white"
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">{t('endTime')}</label>
            <input
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:border-white"
            />
          </div>
        </div>

        {/* 提交按钮 */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-400 text-purple-900 py-3 rounded-lg font-bold disabled:opacity-50"
        >
          {loading ? t('uploading') : t('submit')}
        </button>
      </form>
    </div>
  );
};
