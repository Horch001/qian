import { useState, useCallback } from 'react';
import { piPaymentApi, PiPaymentType } from '../services/api';

// Pi SDK 类型定义（使用 any 避免与其他声明冲突）
interface PiSDK {
  init: (config: { version: string; sandbox?: boolean }) => void;
  authenticate: (
    scopes: string[],
    onIncompletePaymentFound: (payment: PiPaymentDTO) => void
  ) => Promise<AuthResult>;
  createPayment: (
    paymentData: PaymentData,
    callbacks: PaymentCallbacks
  ) => void;
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

interface PaymentCallbacks {
  onReadyForServerApproval: (paymentId: string) => void;
  onReadyForServerCompletion: (paymentId: string, txid: string) => void;
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

  // 初始化 Pi SDK
  const initPiSDK = useCallback(() => {
    const Pi = getPiSDK();
    Pi.init({ version: '2.0', sandbox: false });
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

      // 创建支付
      return new Promise((resolve, reject) => {
        Pi.createPayment(
          {
            amount,
            memo,
            metadata: { ...metadata, type, orderId },
          },
          {
            // 服务端批准阶段
            onReadyForServerApproval: async (paymentId: string) => {
              console.log('Ready for server approval:', paymentId);
              try {
                // 1. 在后端创建支付记录
                await piPaymentApi.createPayment({
                  paymentId,
                  amount,
                  type,
                  orderId,
                  memo,
                });

                // 2. 批准支付
                await piPaymentApi.approvePayment(paymentId);
                console.log('Payment approved');
              } catch (err: any) {
                console.error('Server approval failed:', err);
                setError(err.message || '服务端批准失败');
                reject(err);
              }
            },

            // 用户完成支付后
            onReadyForServerCompletion: async (paymentId: string, txid: string) => {
              console.log('Ready for server completion:', paymentId, txid);
              try {
                const result = await piPaymentApi.completePayment(paymentId, txid);
                console.log('Payment completed:', result);
                setIsLoading(false);
                options.onSuccess?.(result);
                resolve(result);
              } catch (err: any) {
                console.error('Server completion failed:', err);
                setError(err.message || '完成支付失败');
                setIsLoading(false);
                reject(err);
              }
            },

            // 用户取消
            onCancel: async (paymentId: string) => {
              console.log('Payment cancelled:', paymentId);
              try {
                await piPaymentApi.cancelPayment(paymentId);
              } catch (err) {
                console.error('Cancel payment record failed:', err);
              }
              setIsLoading(false);
              setError(null);
              options.onCancel?.();
              reject(new Error('用户取消支付'));
            },

            // 错误处理
            onError: (err: Error, payment?: PiPaymentDTO) => {
              console.error('Payment error:', err, payment);
              setError(err.message || '支付出错');
              setIsLoading(false);
              options.onError?.(err.message);
              reject(err);
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
