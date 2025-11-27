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

export function usePiPayment(options: UsePiPaymentOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // 处理未完成的支付
  const handleIncompletePayment = useCallback(async (payment: PiPaymentDTO) => {
    console.log('Found incomplete payment:', payment);
    
    if (payment.status.developer_approved && payment.transaction?.txid) {
      // 支付已批准且有交易ID，需要完成
      try {
        await piPaymentApi.completePayment(payment.identifier, payment.transaction.txid);
        console.log('Completed incomplete payment');
      } catch (err) {
        console.error('Failed to complete incomplete payment:', err);
      }
    } else if (!payment.status.developer_approved) {
      // 支付未批准，需要批准
      try {
        await piPaymentApi.approvePayment(payment.identifier);
        console.log('Approved incomplete payment');
      } catch (err) {
        console.error('Failed to approve incomplete payment:', err);
      }
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
              
              // 使用 .then() 而不是 await，保持回调同步返回
              piPaymentApi.approvePayment(paymentId)
                .then(() => {
                  console.log('Payment approved successfully');
                  // 异步创建本地记录（不阻塞）
                  const info = paymentPromiseRef.current;
                  if (info) {
                    piPaymentApi.createPayment({
                      paymentId,
                      amount: info.amount,
                      type: info.type,
                      orderId: info.orderId,
                      memo: info.memo,
                    }).catch(err => {
                      console.warn('Create payment record failed (non-blocking):', err);
                    });
                  }
                })
                .catch((err: any) => {
                  console.error('Server approval failed:', err);
                  setError(err.message || '服务端批准失败');
                  setIsLoading(false);
                  options.onError?.(err.message || '服务端批准失败');
                  // 注意：这里不能 reject，因为 Pi SDK 会继续处理
                });
            },

            // 用户完成支付后
            // 同样保持同步
            onReadyForServerCompletion: (paymentId: string, txid: string) => {
              console.log('Ready for server completion:', paymentId, txid);
              
              piPaymentApi.completePayment(paymentId, txid)
                .then((result) => {
                  console.log('Payment completed:', result);
                  setIsLoading(false);
                  options.onSuccess?.(result);
                  paymentPromiseRef.current?.resolve(result);
                })
                .catch((err: any) => {
                  console.error('Server completion failed:', err);
                  setError(err.message || '完成支付失败');
                  setIsLoading(false);
                  options.onError?.(err.message || '完成支付失败');
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
              
              setIsLoading(false);
              setError(null);
              options.onCancel?.();
              paymentPromiseRef.current?.reject(new Error('用户取消支付'));
            },

            // 错误处理
            onError: (err: Error, payment?: PiPaymentDTO) => {
              console.error('Payment error:', err, payment);
              setError(err.message || '支付出错');
              setIsLoading(false);
              options.onError?.(err.message);
              paymentPromiseRef.current?.reject(err);
            },
          }
        );
      });
    } catch (err: any) {
      setError(err.message || '支付失败');
      setIsLoading(false);
      options.onError?.(err.message);
      throw err;
    }
  }, [initPiSDK, handleIncompletePayment, options]);

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

  return {
    isLoading,
    error,
    createPayment,
    recharge,
    payOrder,
    payDeposit,
  };
}

export default usePiPayment;
