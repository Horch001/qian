import { useState, useCallback, useRef } from 'react';
import { piPaymentApi, PiPaymentType } from '../services/api';

// Pi SDK 类型定义
interface PiSDK {
  init: (config: { version: string; sandbox?: boolean }) => void;
  authenticate: (
    scopes: string[],
    onIncompletePaymentFound: (payment: PiPaymentDTO) => void
  ) => Promise<AuthResult>;
  createPayment: (
    paymentData: PaymentData,
    callbacks: PaymentCallbacks
  ) => Promise<PiPaymentDTO>;  // createPayment 返回 Promise
}

interface AuthResult {
  accessToken: string;
  user: {
    uid: string;
    username: string;
  };
}

interface PaymentData {
  amount: number;
  memo: string;
  metadata: Record<string, any>;
}

interface PiPaymentDTO {
  identifier: string;
  user_uid: string;
  amount: number;
  memo: string;
  metadata: Record<string, any>;
  status: {
    developer_approved: boolean;
    transaction_verified: boolean;
    developer_completed: boolean;
    cancelled: boolean;
    user_cancelled: boolean;
  };
  transaction: {
    txid: string;
    verified: boolean;
    _link: string;
  } | null;
}

// 根据 Pi 官方文档，回调函数签名
interface PaymentCallbacks {
  onReadyForServerApproval: (paymentId: string) => void;  // 必须同步，不能是 async
  onReadyForServerCompletion: (paymentId: string, txid: string) => void;  // 必须同步
  onCancel: (paymentId: string) => void;
  onError: (error: Error, payment?: PiPaymentDTO) => void;
}

interface UsePiPaymentOptions {
  onSuccess?: (payment: any) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

// 支付阶段状态
export type PaymentStage = 
  | 'idle'           // 空闲
  | 'authenticating' // 正在认证
  | 'approving'      // 等待服务器批准
  | 'waiting_user'   // 等待用户在钱包确认
  | 'confirming'     // 等待区块链确认
  | 'completing'     // 正在完成支付
  | 'success'        // 支付成功
  | 'error';         // 支付失败

export function usePiPayment(options: UsePiPaymentOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStage, setPaymentStage] = useState<PaymentStage>('idle');
  
  // 使用 ref 存储 options，避免回调函数因为 options 变化而失效
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // 获取 Pi SDK 实例
  const getPiSDK = useCallback((): PiSDK => {
    if (!window.Pi) {
      throw new Error('Pi SDK 未加载，请在 Pi Browser 中打开');
    }
    return window.Pi as PiSDK;
  }, []);

  // 初始化 Pi SDK（如果尚未初始化）
  const initPiSDK = useCallback(() => {
    // Pi SDK 已在 index.html 中初始化，这里只是确保它存在
    getPiSDK();
  }, [getPiSDK]);

  // 处理未完成的支付（Pi SDK 会在 authenticate 时自动检测）
  const handleIncompletePayment = useCallback(async (payment: PiPaymentDTO) => {
    console.log('Found incomplete payment:', payment);
    console.log('Payment status:', JSON.stringify(payment.status));
    console.log('Transaction:', JSON.stringify(payment.transaction));
    
    try {
      if (payment.status.developer_completed) {
        // 已经完成，无需处理
        console.log('Payment already completed on server');
        return;
      }
      
      if (payment.status.cancelled || payment.status.user_cancelled) {
        // 已取消，无需处理
        console.log('Payment was cancelled');
        return;
      }
      
      if (payment.status.developer_approved && payment.transaction?.txid) {
        // 支付已批准且有交易ID，需要完成（这是最常见的恢复场景）
        console.log('Completing incomplete payment with txid:', payment.transaction.txid);
        const result = await piPaymentApi.completePayment(payment.identifier, payment.transaction.txid);
        console.log('Completed incomplete payment:', result);
        // 通知用户
        alert(`检测到未完成的支付，已自动完成！金额: ${payment.amount} π`);
      } else if (!payment.status.developer_approved) {
        // 支付未批准，需要先批准
        console.log('Approving incomplete payment');
        await piPaymentApi.approvePayment(payment.identifier);
        console.log('Approved incomplete payment, waiting for user to complete in wallet');
      } else if (payment.status.developer_approved && !payment.transaction?.txid) {
        // 已批准但没有交易ID，说明用户还没在钱包确认
        console.log('Payment approved but not yet confirmed by user');
      }
    } catch (err: any) {
      console.error('Failed to handle incomplete payment:', err);
      // 不要抛出错误，让用户可以继续使用应用
    }
  }, []);

  // 用于存储 Promise 的 resolve/reject，以便在回调中使用
  const paymentPromiseRef = useRef<{
    resolve: (value: any) => void;
    reject: (reason: any) => void;
    amount: number;
    type: PiPaymentType;
    orderId?: string;
    memo: string;
  } | null>(null);

  // 发起支付
  const createPayment = useCallback(async (
    amount: number,
    type: PiPaymentType,
    memo: string,
    metadata: Record<string, any> = {},
    orderId?: string,
  ) => {
    setIsLoading(true);
    setError(null);
    setPaymentStage('authenticating');

    try {
      initPiSDK();
      const Pi = getPiSDK();

      // 先进行 Pi 认证
      await Pi.authenticate(
        ['payments'],
        handleIncompletePayment
      );

      // 创建支付 - 使用 Promise 包装，但回调函数保持同步
      return new Promise((resolve, reject) => {
        // 保存 Promise 的 resolve/reject 和支付信息，供回调使用
        paymentPromiseRef.current = { resolve, reject, amount, type, orderId, memo };

        Pi.createPayment(
          {
            amount,
            memo,
            metadata: { ...metadata, type, orderId },
          },
          {
            // 服务端批准阶段
            // 重要：根据 Pi 官方文档，此回调必须是同步的！
            // 不能使用 async/await，否则会导致支付超时
            onReadyForServerApproval: (paymentId: string) => {
              console.log('Ready for server approval:', paymentId);
              setPaymentStage('approving');
              
              const info = paymentPromiseRef.current;
              
              // 先创建本地记录，再调用 approve（顺序很重要）
              // 使用 Promise 链保持同步返回
              const createPromise = info 
                ? piPaymentApi.createPayment({
                    paymentId,
                    amount: info.amount,
                    type: info.type,
                    orderId: info.orderId,
                    memo: info.memo,
                  }).catch(err => {
                    console.warn('Create payment record failed:', err);
                    // 即使创建失败也继续 approve
                  })
                : Promise.resolve();
              
              createPromise.then(() => {
                // 调用 Pi API 批准支付（这是最关键的步骤）
                return piPaymentApi.approvePayment(paymentId);
              })
              .then(() => {
                console.log('Payment approved successfully');
                // 批准成功后，等待用户在钱包确认，然后等待区块链确认
                setPaymentStage('confirming');
              })
              .catch((err: any) => {
                console.error('Server approval failed:', err);
                setError(err.message || '服务端批准失败');
                setPaymentStage('error');
                setIsLoading(false);
                optionsRef.current.onError?.(err.message || '服务端批准失败');
              });
            },

            // 用户完成支付后
            // 同样保持同步
            onReadyForServerCompletion: (paymentId: string, txid: string) => {
              console.log('Ready for server completion:', paymentId, txid);
              console.log('Calling backend complete API...');
              setPaymentStage('completing');
              
              piPaymentApi.completePayment(paymentId, txid)
                .then((result) => {
                  console.log('Payment completed successfully:', result);
                  setPaymentStage('success');
                  setIsLoading(false);
                  optionsRef.current.onSuccess?.(result);
                  paymentPromiseRef.current?.resolve(result);
                })
                .catch((err: any) => {
                  console.error('Server completion failed:', err);
                  setError(err.message || '完成支付失败');
                  setPaymentStage('error');
                  setIsLoading(false);
                  optionsRef.current.onError?.(err.message || '完成支付失败');
                  paymentPromiseRef.current?.reject(err);
                });
            },

            // 用户取消
            onCancel: (paymentId: string) => {
              console.log('Payment cancelled:', paymentId);
              
              // 异步取消记录，不阻塞
              piPaymentApi.cancelPayment(paymentId).catch(err => {
                console.error('Cancel payment record failed:', err);
              });
              
              setPaymentStage('idle');
              setIsLoading(false);
              setError(null);
              optionsRef.current.onCancel?.();
              paymentPromiseRef.current?.reject(new Error('用户取消支付'));
            },

            // 错误处理
            onError: (err: Error, payment?: PiPaymentDTO) => {
              console.error('Payment error:', err, payment);
              setError(err.message || '支付出错');
              setPaymentStage('error');
              setIsLoading(false);
              optionsRef.current.onError?.(err.message);
              paymentPromiseRef.current?.reject(err);
            },
          }
        );
      });
    } catch (err: any) {
      setError(err.message || '支付失败');
      setPaymentStage('error');
      setIsLoading(false);
      optionsRef.current.onError?.(err.message);
      throw err;
    }
  }, [initPiSDK, getPiSDK, handleIncompletePayment]);

  // 充值
  const recharge = useCallback((amount: number) => {
    return createPayment(amount, 'RECHARGE', `充值 ${amount} π`);
  }, [createPayment]);

  // 订单支付
  const payOrder = useCallback((orderId: string, amount: number, orderNo: string) => {
    return createPayment(
      amount,
      'ORDER',
      `订单支付 #${orderNo}`,
      { orderNo },
      orderId
    );
  }, [createPayment]);

  // 商家保证金
  const payDeposit = useCallback((amount: number) => {
    return createPayment(amount, 'DEPOSIT', `商家保证金 ${amount} π`);
  }, [createPayment]);

  // 手动检查并恢复未完成的支付
  const checkIncompletePayments = useCallback(async () => {
    try {
      initPiSDK();
      const Pi = getPiSDK();
      
      console.log('Manually checking for incomplete payments...');
      
      // 重新认证会触发 onIncompletePaymentFound 回调
      await Pi.authenticate(['payments'], handleIncompletePayment);
      
      console.log('Incomplete payment check completed');
    } catch (err: any) {
      console.error('Failed to check incomplete payments:', err);
    }
  }, [initPiSDK, getPiSDK, handleIncompletePayment]);

  return {
    isLoading,
    error,
    paymentStage,
    createPayment,
    recharge,
    payOrder,
    payDeposit,
    checkIncompletePayments, // 导出手动检查功能
  };
}

export default usePiPayment;
