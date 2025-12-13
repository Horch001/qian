import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet, TrendingUp, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Language, Translations } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface SettlementPageProps {
  language: Language;
  translations: Translations;
}

export const SettlementPage: React.FC<SettlementPageProps> = ({ language }) => {
  const navigate = useNavigate();
  const [account, setAccount] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [piAddress, setPiAddress] = useState('');
  const [withdrawFeeRate, setWithdrawFeeRate] = useState(3); // 提现手续费率（默认3%）

  const getText = (obj: { [key: string]: string }) => obj[language] || obj.zh;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      const [accountRes, statsRes, settingsRes] = await Promise.all([
        fetch(`${API_URL}/api/v1/settlement/account`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/v1/settlement/stats`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/v1/system/settings`),
      ]);

      if (accountRes.ok) {
        const accountData = await accountRes.json();
        setAccount(accountData);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        if (settings.withdrawFee !== undefined) {
          setWithdrawFeeRate(Number(settings.withdrawFee));
        }
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      alert(getText({ zh: '请输入有效金额', en: 'Invalid amount', ko: '유효하지 않은 금액', vi: 'Số tiền không hợp lệ' }));
      return;
    }

    if (!piAddress.trim()) {
      alert(getText({ zh: '请输入Pi钱包地址', en: 'Enter Pi address', ko: 'Pi 주소 입력', vi: 'Nhập địa chỉ Pi' }));
      return;
    }

    if (amount > parseFloat(account?.availableBalance || '0')) {
      alert(getText({ zh: '余额不足', en: 'Insufficient balance', ko: '잔액 부족', vi: 'Số dư không đủ' }));
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/v1/settlement/withdrawal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ amount, piAddress }),
      });

      if (response.ok) {
        alert(getText({ zh: '提现申请已提交', en: 'Withdrawal submitted', ko: '출금 신청됨', vi: 'Đã gửi yêu cầu rút tiền' }));
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        setPiAddress('');
        fetchData();
      } else {
        const error = await response.json();
        alert(error.message || getText({ zh: '提现失败', en: 'Failed', ko: '실패', vi: 'Thất bại' }));
      }
    } catch (error: any) {
      alert(error.message || getText({ zh: '提现失败', en: 'Failed', ko: '실패', vi: 'Thất bại' }));
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 to-pink-500 flex justify-center">
      <div className="w-full max-w-md flex flex-col min-h-screen">
        {/* Header */}
        <header className="p-4 flex items-center justify-center relative">
          <button onClick={() => navigate(-1)} className="text-white absolute left-4">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-white">
            {getText({ zh: '结算中心', en: 'Settlement', ko: '정산 센터', vi: 'Trung tâm thanh toán' })}
          </h1>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {/* 账户余额卡片 */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Wallet size={24} />
              <span className="text-sm opacity-90">
                {getText({ zh: '账户余额', en: 'Balance', ko: '잔액', vi: 'Số dư' })}
              </span>
            </div>
            <div className="text-4xl font-bold mb-6">
              {account?.availableBalance || '0'} π
            </div>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="w-full py-3 bg-white text-purple-600 rounded-lg font-bold hover:bg-gray-50"
            >
              {getText({ zh: '申请提现', en: 'Withdraw', ko: '출금', vi: 'Rút tiền' })}
            </button>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-orange-500" />
                <span className="text-xs text-gray-500">
                  {getText({ zh: '冻结余额', en: 'Frozen', ko: '동결', vi: 'Đóng băng' })}
                </span>
              </div>
              <p className="text-xl font-bold text-gray-800">{account?.frozenBalance || '0'}π</p>
            </div>

            <div className="bg-white rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} className="text-green-500" />
                <span className="text-xs text-gray-500">
                  {getText({ zh: '累计收入', en: 'Total Income', ko: '총 수입', vi: 'Tổng thu nhập' })}
                </span>
              </div>
              <p className="text-xl font-bold text-gray-800">{account?.totalIncome || '0'}π</p>
            </div>

            <div className="bg-white rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={16} className="text-blue-500" />
                <span className="text-xs text-gray-500">
                  {getText({ zh: '累计提现', en: 'Total Withdrawn', ko: '총 출금', vi: 'Tổng rút' })}
                </span>
              </div>
              <p className="text-xl font-bold text-gray-800">{account?.totalWithdrawn || '0'}π</p>
            </div>

            <div className="bg-white rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={16} className="text-purple-500" />
                <span className="text-xs text-gray-500">
                  {getText({ zh: '待结算', en: 'Pending', ko: '대기 중', vi: 'Chờ thanh toán' })}
                </span>
              </div>
              <p className="text-xl font-bold text-gray-800">{stats?.pendingCount || 0}</p>
            </div>
          </div>

          {/* 结算记录 */}
          <div className="bg-white rounded-xl p-4">
            <h3 className="font-bold text-gray-800 mb-3">
              {getText({ zh: '最近结算', en: 'Recent Settlements', ko: '최근 정산', vi: 'Thanh toán gần đây' })}
            </h3>
            {stats?.recentSettlements && stats.recentSettlements.length > 0 ? (
              <div className="space-y-2">
                {stats.recentSettlements.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {getText({ zh: '订单结算', en: 'Order Settlement', ko: '주문 정산', vi: 'Thanh toán đơn hàng' })}
                      </p>
                      <p className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">+{item.amount}π</p>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        item.status === 'COMPLETED' ? 'bg-green-100 text-green-600' :
                        item.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {item.status === 'COMPLETED' ? getText({ zh: '已结算', en: 'Settled', ko: '정산됨', vi: 'Đã thanh toán' }) :
                         item.status === 'PENDING' ? getText({ zh: '待结算', en: 'Pending', ko: '대기', vi: 'Chờ' }) :
                         getText({ zh: '处理中', en: 'Processing', ko: '처리 중', vi: 'Đang xử lý' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-4 text-sm">
                {getText({ zh: '暂无记录', en: 'No records', ko: '기록 없음', vi: 'Chưa có bản ghi' })}
              </p>
            )}
          </div>

          {/* 提现记录 */}
          <div className="bg-white rounded-xl p-4">
            <h3 className="font-bold text-gray-800 mb-3">
              {getText({ zh: '提现记录', en: 'Withdrawal History', ko: '출금 기록', vi: 'Lịch sử rút tiền' })}
            </h3>
            {stats?.recentWithdrawals && stats.recentWithdrawals.length > 0 ? (
              <div className="space-y-2">
                {stats.recentWithdrawals.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {getText({ zh: '提现申请', en: 'Withdrawal', ko: '출금', vi: 'Rút tiền' })}
                      </p>
                      <p className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-600">-{item.amount}π</p>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        item.status === 'COMPLETED' ? 'bg-green-100 text-green-600' :
                        item.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600' :
                        item.status === 'REJECTED' ? 'bg-red-100 text-red-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {item.status === 'COMPLETED' ? getText({ zh: '已完成', en: 'Completed', ko: '완료', vi: 'Hoàn tất' }) :
                         item.status === 'PENDING' ? getText({ zh: '审核中', en: 'Pending', ko: '대기', vi: 'Chờ duyệt' }) :
                         item.status === 'REJECTED' ? getText({ zh: '已拒绝', en: 'Rejected', ko: '거부됨', vi: 'Đã từ chối' }) :
                         getText({ zh: '处理中', en: 'Processing', ko: '처리 중', vi: 'Đang xử lý' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-4 text-sm">
                {getText({ zh: '暂无记录', en: 'No records', ko: '기록 없음', vi: 'Chưa có bản ghi' })}
              </p>
            )}
          </div>
        </div>

        {/* 提现弹窗 */}
        {showWithdrawModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md">
              <div className="p-4 border-b">
                <h3 className="text-lg font-bold text-gray-800">
                  {getText({ zh: '申请提现', en: 'Withdraw', ko: '출금 신청', vi: 'Rút tiền' })}
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {getText({ zh: '提现金额', en: 'Amount', ko: '금액', vi: 'Số tiền' })}
                  </label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {getText({ zh: '可用余额', en: 'Available', ko: '사용 가능', vi: 'Có sẵn' })}: {account?.availableBalance || '0'}π
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {getText({ zh: 'Pi钱包地址', en: 'Pi Address', ko: 'Pi 주소', vi: 'Địa chỉ Pi' })}
                  </label>
                  <input
                    type="text"
                    value={piAddress}
                    onChange={(e) => setPiAddress(e.target.value)}
                    placeholder="GXXX..."
                    className="w-full p-3 border rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {getText({ zh: `提现手续费${withdrawFeeRate}%，预计1-3个工作日到账`, en: `${withdrawFeeRate}% fee, 1-3 days`, ko: `수수료 ${withdrawFeeRate}%, 1-3일`, vi: `Phí ${withdrawFeeRate}%, 1-3 ngày` })}
                </p>
              </div>
              <div className="p-4 border-t flex gap-3">
                <button
                  onClick={() => {
                    setShowWithdrawModal(false);
                    setWithdrawAmount('');
                    setPiAddress('');
                  }}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  {getText({ zh: '取消', en: 'Cancel', ko: '취소', vi: 'Hủy' })}
                </button>
                <button
                  onClick={handleWithdraw}
                  className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  {getText({ zh: '确认提现', en: 'Confirm', ko: '확인', vi: 'Xác nhận' })}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
