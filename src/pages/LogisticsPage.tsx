import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, Clock } from 'lucide-react';
import { Language, Translations } from '../types';

interface LogisticsPageProps {
  language: Language;
  translations: Translations;
}

interface LogisticsTrace {
  id: string;
  time: string;
  status: string;
  location?: string;
  description: string;
}

interface LogisticsInfo {
  id: string;
  company?: string;
  companyName?: string;
  trackingNo?: string;
  status?: string;
  lastUpdate?: string;
  traces: LogisticsTrace[];
}

export const LogisticsPage: React.FC<LogisticsPageProps> = ({ language, translations }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId } = location.state || {};
  
  const [logistics, setLogistics] = useState<LogisticsInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getText = (texts: { zh: string; en: string; ko: string; vi: string }) => texts[language];

  useEffect(() => {
    if (!orderId) {
      setError(getText({ zh: '订单信息不存在', en: 'Order not found', ko: '주문 정보 없음', vi: 'Không tìm thấy đơn hàng' }));
      setLoading(false);
      return;
    }

    const fetchLogistics = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const token = localStorage.getItem('authToken');
        
        const response = await fetch(`${API_URL}/api/v1/logistics/order/${orderId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setLogistics(data);
        } else {
          const errorData = await response.json();
          setError(errorData.message || getText({ zh: '获取物流信息失败', en: 'Failed to get logistics', ko: '물류 정보 가져오기 실패', vi: 'Lấy thông tin vận chuyển thất bại' }));
        }
      } catch (error) {
        console.error('获取物流信息失败:', error);
        setError(getText({ zh: '网络错误', en: 'Network error', ko: '네트워크 오류', vi: 'Lỗi mạng' }));
      } finally {
        setLoading(false);
      }
    };

    fetchLogistics();
  }, [orderId, language]);

  if (!orderId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-300 flex items-center justify-center">
        <p className="text-gray-600">{getText({ zh: '订单信息不存在', en: 'Order not found', ko: '주문 정보 없음', vi: 'Không tìm thấy đơn hàng' })}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-300 flex flex-col">
      <header className="bg-white/90 backdrop-blur-sm sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-sm font-bold text-gray-800">
            {getText({ zh: '物流信息', en: 'Logistics', ko: '배송 정보', vi: 'Thông tin vận chuyển' })}
          </h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="flex-1 max-w-md w-full mx-auto overflow-auto pb-4 p-4">
        {loading ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{getText({ zh: '加载中...', en: 'Loading...', ko: '로딩 중...', vi: 'Đang tải...' })}</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{error}</p>
          </div>
        ) : logistics ? (
          <>
            {/* 物流公司和运单号 */}
            <div className="bg-white rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <Package className="w-6 h-6 text-purple-600" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">{getText({ zh: '物流公司', en: 'Courier', ko: '택배사', vi: 'Công ty vận chuyển' })}</p>
                  <p className="font-bold text-gray-800">{logistics.companyName || logistics.company || getText({ zh: '未知', en: 'Unknown', ko: '알 수 없음', vi: 'Không xác định' })}</p>
                </div>
              </div>
              {logistics.trackingNo && (
                <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">{getText({ zh: '运单号', en: 'Tracking No', ko: '운송장 번호', vi: 'Mã vận đơn' })}</p>
                    <p className="font-mono text-sm text-gray-800">{logistics.trackingNo}</p>
                  </div>
                </div>
              )}
            </div>

            {/* 物流轨迹 */}
            {logistics.traces && logistics.traces.length > 0 ? (
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  {getText({ zh: '物流轨迹', en: 'Tracking History', ko: '배송 추적', vi: 'Lịch sử vận chuyển' })}
                </h3>
                <div className="space-y-4">
                  {logistics.traces.map((trace, index) => (
                    <div key={trace.id} className="flex gap-3">
                      {/* 时间线 */}
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
                        {index < logistics.traces.length - 1 && (
                          <div className="w-0.5 h-full bg-gray-200 my-1"></div>
                        )}
                      </div>
                      
                      {/* 内容 */}
                      <div className="flex-1 pb-4">
                        <p className={`text-sm font-bold ${index === 0 ? 'text-purple-600' : 'text-gray-800'}`}>
                          {trace.description}
                        </p>
                        {trace.location && (
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {trace.location}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(trace.time).toLocaleString(language === 'zh' ? 'zh-CN' : language === 'en' ? 'en-US' : language === 'ko' ? 'ko-KR' : 'vi-VN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-8 text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">{getText({ zh: '暂无物流信息', en: 'No tracking info', ko: '배송 정보 없음', vi: 'Chưa có thông tin vận chuyển' })}</p>
              </div>
            )}
          </>
        ) : null}
      </main>
    </div>
  );
};
