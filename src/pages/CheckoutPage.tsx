import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin, CreditCard, Wallet, CheckCircle, Loader2 } from 'lucide-react';
import { Language, Translations } from '../types';
import { orderApi, userApi } from '../services/api';

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  spec?: string;
  product: {
    id: string;
    title: string;
    titleEn?: string;
    icon?: string;
    images: string[];
    price: string;
    productType?: string;
  };
}

interface CheckoutPageProps {
  language: Language;
  translations: Translations;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ language }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [items, setItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'balance' | 'pi'>('balance');
  const [userBalance, setUserBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // 收货地址
  const [address, setAddress] = useState({
    name: '',
    phone: '',
    province: '',
    city: '',
    detail: '',
  });

  const getText = (obj: { [key: string]: string }) => obj[language] || obj.zh;

  useEffect(() => {
    // 从路由状态获取选中的商品
    const state = location.state as { items?: CartItem[] };
    if (state?.items && state.items.length > 0) {
      setItems(state.items);
    } else {
      // 没有商品，返回购物车
      navigate('/cart');
    }

    // 加载用户余额和地址
    const loadUserInfo = async () => {
      try {
        const profile = await userApi.getProfile();
        setUserBalance(parseFloat(profile.balance) || 0);
      } catch (error) {
        console.error('加载用户信息失败:', error);
      }
    };
    loadUserInfo();

    // 从localStorage加载地址
    setAddress({
      name: localStorage.getItem('receiverName') || '',
      phone: localStorage.getItem('receiverPhone') || '',
      province: localStorage.getItem('addressProvince') || '',
      city: localStorage.getItem('addressCity') || '',
      detail: localStorage.getItem('addressDetail') || '',
    });
  }, [location.state, navigate]);


  // 检查是否有实物商品需要地址
  const hasPhysicalProduct = items.some(item => 
    item.product.productType === 'physical' || !item.product.productType
  );

  const totalPrice = items.reduce((sum, item) => sum + parseFloat(item.product.price) * item.quantity, 0);

  const handlePayment = async () => {
    // 防止重复点击
    if (isPaymentProcessing) {
      console.log('支付正在处理中，请勿重复点击');
      return;
    }

    // 检查实物商品地址
    if (hasPhysicalProduct) {
      if (!address.name || !address.phone || !address.province || !address.city || !address.detail) {
        alert(getText({ 
          zh: '请先完善收货地址', 
          en: 'Please complete shipping address', 
          ko: '배송 주소를 입력해주세요', 
          vi: 'Vui lòng nhập địa chỉ giao hàng' 
        }));
        navigate('/profile');
        return;
      }
    }

    // 余额支付检查
    if (paymentMethod === 'balance' && userBalance < totalPrice) {
      const confirmPi = confirm(getText({
        zh: `余额不足！当前余额: ${userBalance.toFixed(2)}π，需要: ${totalPrice.toFixed(2)}π\n\n是否使用Pi钱包支付？`,
        en: `Insufficient balance! Current: ${userBalance.toFixed(2)}π, Required: ${totalPrice.toFixed(2)}π\n\nUse Pi Wallet instead?`,
        ko: `잔액 부족! 현재: ${userBalance.toFixed(2)}π, 필요: ${totalPrice.toFixed(2)}π\n\nPi 지갑으로 결제하시겠습니까?`,
        vi: `Số dư không đủ! Hiện tại: ${userBalance.toFixed(2)}π, Cần: ${totalPrice.toFixed(2)}π\n\nSử dụng ví Pi?`
      }));
      if (confirmPi) {
        setPaymentMethod('pi');
        return;
      }
      return;
    }

    // 设置支付锁和加载状态
    setIsPaymentProcessing(true);
    setIsLoading(true);

    try {
      // 创建订单
      const order = await orderApi.createOrder({
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          spec: item.spec,
        })),
      });

      if (paymentMethod === 'balance') {
        // 余额支付
        try {
          await orderApi.payWithBalance(order.id);
          
          // 更新余额
          const profile = await userApi.getProfile();
          const newBalance = parseFloat(profile.balance) || 0;
          setUserBalance(newBalance);
          
          // 更新localStorage
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          user.balance = newBalance.toFixed(8);
          localStorage.setItem('user', JSON.stringify(user));

          // 清空购物车中已购买的商品
          for (const item of items) {
            try {
              await userApi.removeFromCart(item.id);
            } catch (e) {
              // 忽略错误
            }
          }

          setShowSuccessModal(true);
        } catch (payError: any) {
          const errorMsg = payError.message || '';
          if (errorMsg.includes('余额不足') || errorMsg.includes('Insufficient')) {
            const confirmPi = confirm(getText({
              zh: '余额不足，是否使用Pi钱包支付？',
              en: 'Insufficient balance. Use Pi Wallet instead?',
              ko: '잔액 부족. Pi 지갑으로 결제하시겠습니까?',
              vi: 'Số dư không đủ. Sử dụng ví Pi?'
            }));
            if (confirmPi) {
              // 使用Pi钱包支付同一订单
              await handlePiPayment(order.id, totalPrice);
              return; // Pi 支付会在回调中解除锁
            }
          } else {
            alert(errorMsg || getText({ zh: '支付失败', en: 'Payment failed', ko: '결제 실패', vi: 'Thanh toán thất bại' }));
          }
        }
      } else {
        // Pi钱包支付 - 不在这里解除锁，在回调中解除
        await handlePiPayment(order.id, totalPrice);
        return; // Pi 支付会在回调中解除锁
      }
    } catch (error: any) {
      console.error('创建订单失败:', error);
      alert(error.message || getText({ zh: '创建订单失败', en: 'Failed to create order', ko: '주문 생성 실패', vi: 'Tạo đơn hàng thất bại' }));
    } finally {
      // 只有余额支付才在这里解除锁
      if (paymentMethod === 'balance') {
        setIsLoading(false);
        setIsPaymentProcessing(false);
      }
    }
  };


  const handlePiPayment = async (orderId: string, amount: number) => {
    if (typeof window !== 'undefined' && (window as any).Pi) {
      const Pi = (window as any).Pi;
      
      try {
        await Pi.createPayment({
          amount: amount,
          memo: getText({ zh: '购物车结算', en: 'Cart Checkout', ko: '장바구니 결제', vi: 'Thanh toán giỏ hàng' }),
          metadata: { orderId },
        }, {
          onReadyForServerApproval: async (paymentId: string) => {
            try {
              await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/v1/pi-payment/approve`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: JSON.stringify({ paymentId, orderId }),
              });
            } catch (error) {
              console.error('批准支付失败:', error);
            }
          },
          onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            try {
              await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/v1/pi-payment/complete`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: JSON.stringify({ paymentId, txId: txid }),
              });
              
              // 清空购物车
              for (const item of items) {
                try {
                  await userApi.removeFromCart(item.id);
                } catch (e) {}
              }
              
              setShowSuccessModal(true);
            } catch (error) {
              console.error('完成支付失败:', error);
              alert(getText({ zh: '支付完成处理失败，请联系客服', en: 'Payment completion failed, please contact support', ko: '결제 완료 처리 실패, 고객센터에 문의하세요', vi: 'Xử lý thanh toán thất bại, vui lòng liên hệ hỗ trợ' }));
            } finally {
              // Pi 支付完成后解除锁
              setIsLoading(false);
              setIsPaymentProcessing(false);
            }
          },
          onCancel: () => {
            alert(getText({ zh: '支付已取消', en: 'Payment cancelled', ko: '결제 취소됨', vi: 'Thanh toán đã hủy' }));
            // 取消时解除锁
            setIsLoading(false);
            setIsPaymentProcessing(false);
          },
          onError: (error: any) => {
            console.error('支付错误:', error);
            alert(getText({ zh: '支付失败，请重试', en: 'Payment failed, please try again', ko: '결제 실패, 다시 시도해주세요', vi: 'Thanh toán thất bại, vui lòng thử lại' }));
            // 错误时解除锁
            setIsLoading(false);
            setIsPaymentProcessing(false);
          },
        });
      } catch (error) {
        console.error('Pi支付错误:', error);
        // 异常时解除锁
        setIsLoading(false);
        setIsPaymentProcessing(false);
      }
    } else {
      alert(getText({ 
        zh: 'Pi钱包未连接，请在Pi Browser中打开本应用', 
        en: 'Pi Wallet not connected. Please open this app in Pi Browser',
        ko: 'Pi 지갑이 연결되지 않았습니다. Pi Browser에서 앱을 열어주세요',
        vi: 'Ví Pi chưa kết nối. Vui lòng mở ứng dụng trong Pi Browser'
      }));
      // 未连接时解除锁
      setIsLoading(false);
      setIsPaymentProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-purple-200 flex flex-col">
      <header className="bg-white/90 backdrop-blur-sm sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-sm font-bold text-purple-600">
            {getText({ zh: '确认订单', en: 'Confirm Order', ko: '주문 확인', vi: 'Xác nhận đơn hàng' })}
          </h1>
          <div className="w-9"></div>
        </div>
      </header>

      <main className="flex-1 max-w-md w-full mx-auto overflow-auto pb-32 p-4 space-y-4">
        {/* 收货地址 */}
        {hasPhysicalProduct && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-purple-600" />
              <span className="font-bold text-gray-800">
                {getText({ zh: '收货地址', en: 'Shipping Address', ko: '배송 주소', vi: 'Địa chỉ giao hàng' })}
              </span>
            </div>
            {address.name ? (
              <div className="text-sm text-gray-600">
                <p className="font-medium">{address.name} {address.phone}</p>
                <p>{address.province} {address.city} {address.detail}</p>
              </div>
            ) : (
              <button 
                onClick={() => navigate('/profile')}
                className="text-sm text-purple-600 hover:underline"
              >
                {getText({ zh: '请设置收货地址', en: 'Set shipping address', ko: '배송 주소 설정', vi: 'Đặt địa chỉ giao hàng' })}
              </button>
            )}
          </div>
        )}


        {/* 商品列表 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3">
            {getText({ zh: '商品清单', en: 'Items', ko: '상품 목록', vi: 'Danh sách sản phẩm' })}
          </h3>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-14 h-14 bg-purple-50 rounded-lg flex items-center justify-center text-2xl overflow-hidden">
                  {item.product.images?.[0] ? (
                    <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    item.product.icon || '📦'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-800 text-sm truncate">
                    {language === 'en' && item.product.titleEn ? item.product.titleEn : item.product.title}
                  </h4>
                  {item.spec && <p className="text-xs text-gray-400">{item.spec}</p>}
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-red-600 font-bold">{item.product.price}π</span>
                    <span className="text-gray-400 text-sm">x{item.quantity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 支付方式 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3">
            {getText({ zh: '支付方式', en: 'Payment Method', ko: '결제 방법', vi: 'Phương thức thanh toán' })}
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => setPaymentMethod('balance')}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
                paymentMethod === 'balance' ? 'border-purple-600 bg-purple-50' : 'border-gray-200'
              }`}
            >
              <Wallet className={`w-5 h-5 ${paymentMethod === 'balance' ? 'text-purple-600' : 'text-gray-400'}`} />
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-800">
                  {getText({ zh: '余额支付', en: 'Balance', ko: '잔액 결제', vi: 'Thanh toán bằng số dư' })}
                </p>
                <p className="text-xs text-gray-400">
                  {getText({ zh: `可用余额: ${userBalance.toFixed(2)}π`, en: `Available: ${userBalance.toFixed(2)}π`, ko: `사용 가능: ${userBalance.toFixed(2)}π`, vi: `Khả dụng: ${userBalance.toFixed(2)}π` })}
                </p>
              </div>
              {paymentMethod === 'balance' && <CheckCircle className="w-5 h-5 text-purple-600" />}
            </button>
            <button
              onClick={() => setPaymentMethod('pi')}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
                paymentMethod === 'pi' ? 'border-purple-600 bg-purple-50' : 'border-gray-200'
              }`}
            >
              <CreditCard className={`w-5 h-5 ${paymentMethod === 'pi' ? 'text-purple-600' : 'text-gray-400'}`} />
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-800">
                  {getText({ zh: 'Pi钱包', en: 'Pi Wallet', ko: 'Pi 지갑', vi: 'Ví Pi' })}
                </p>
                <p className="text-xs text-gray-400">
                  {getText({ zh: '使用Pi Network支付', en: 'Pay with Pi Network', ko: 'Pi Network로 결제', vi: 'Thanh toán bằng Pi Network' })}
                </p>
              </div>
              {paymentMethod === 'pi' && <CheckCircle className="w-5 h-5 text-purple-600" />}
            </button>
          </div>
        </div>
      </main>

      {/* 底部结算栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-500">{getText({ zh: '合计：', en: 'Total: ', ko: '합계: ', vi: 'Tổng: ' })}</span>
            <span className="text-xl font-bold text-red-600">{totalPrice.toFixed(2)}π</span>
          </div>
          <button 
            onClick={handlePayment}
            disabled={isLoading || isPaymentProcessing}
            className="px-8 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-sm font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isPaymentProcessing 
              ? getText({ zh: '支付处理中...', en: 'Processing...', ko: '처리 중...', vi: 'Đang xử lý...' })
              : getText({ zh: '立即支付', en: 'Pay Now', ko: '지금 결제', vi: 'Thanh toán ngay' })
            }
          </button>
        </div>
      </div>

      {/* 成功弹窗 */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              {getText({ zh: '支付成功', en: 'Payment Successful', ko: '결제 성공', vi: 'Thanh toán thành công' })}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {getText({ zh: '您的订单已创建成功', en: 'Your order has been created', ko: '주문이 생성되었습니다', vi: 'Đơn hàng của bạn đã được tạo' })}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/profile')}
                className="flex-1 py-2 bg-purple-600 text-white rounded-lg font-medium"
              >
                {getText({ zh: '查看订单', en: 'View Orders', ko: '주문 보기', vi: 'Xem đơn hàng' })}
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium"
              >
                {getText({ zh: '继续购物', en: 'Continue', ko: '계속 쇼핑', vi: 'Tiếp tục' })}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
