/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Pi Network SDK 类型声明
interface Window {
  piSDKReady?: boolean;
  Pi?: {
    init: (config: { version: string; sandbox?: boolean; appId?: string }) => void;
    authenticate: (
      scopes: string[],
      onIncompletePaymentFound: (payment: any) => void
    ) => Promise<{
      accessToken: string;
      user: {
        uid: string;
        username: string;
      };
    }>;
    createPayment: (
      paymentData: {
        amount: number;
        memo: string;
        metadata: Record<string, any>;
      },
      callbacks: {
        onReadyForServerApproval: (paymentId: string) => void;
        onReadyForServerCompletion: (paymentId: string, txid: string) => void;
        onCancel: (paymentId: string) => void;
        onError: (error: Error, payment?: any) => void;
      }
    ) => void;
  };
}
