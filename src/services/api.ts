// API 基础配置
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// 获取存储的 token
const getToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// 通用请求方法
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '请求失败' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// ==================== 认证 API ====================

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    username: string;
    avatar?: string;
    balance: string;
    role: string;
  };
  token: string;
}

export const authApi = {
  // 邮箱注册
  register: (data: { email: string; password: string; username?: string }) =>
    request<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 邮箱登录
  login: (data: { email: string; password: string }) =>
    request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Pi Network 登录
  piLogin: (data: { piUid: string; accessToken: string; username?: string }) =>
    request<LoginResponse>('/auth/pi-login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 获取当前用户
  getCurrentUser: () => request<LoginResponse['user']>('/auth/me'),
};

// ==================== 用户 API ====================

export interface Address {
  id: string;
  receiverName: string;
  receiverPhone: string;
  province: string;
  city: string;
  district?: string;
  detail: string;
  isDefault: boolean;
}

export const userApi = {
  // 更新个人资料
  updateProfile: (data: { username?: string; avatar?: string }) =>
    request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 获取收货地址列表
  getAddresses: () => request<Address[]>('/users/addresses'),

  // 添加收货地址
  createAddress: (data: Omit<Address, 'id'>) =>
    request<Address>('/users/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 更新收货地址
  updateAddress: (id: string, data: Partial<Address>) =>
    request<Address>(`/users/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 删除收货地址
  deleteAddress: (id: string) =>
    request(`/users/addresses/${id}`, { method: 'DELETE' }),

  // 绑定钱包
  bindWallet: (piAddress: string) =>
    request('/users/wallet', {
      method: 'POST',
      body: JSON.stringify({ piAddress }),
    }),

  // 获取钱包信息
  getWallet: () => request('/users/wallet'),
};

// ==================== 商品 API ====================

export interface Product {
  id: string;
  title: string;
  titleEn?: string;
  description?: string;
  price: string;
  originalPrice?: string;
  stock: number;
  sales: number;
  rating: number;
  icon?: string;
  images: string[];
  merchant: {
    id: string;
    shopName: string;
    rating: number;
  };
  category: {
    id: string;
    name: string;
    type: string;
  };
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Category {
  id: string;
  name: string;
  nameEn?: string;
  icon?: string;
  type: string;
  sortOrder: number;
}

export const productApi = {
  // 获取商品列表
  getProducts: (params?: {
    categoryId?: string;
    categoryType?: string;
    keyword?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return request<ProductListResponse>(`/products${query ? `?${query}` : ''}`);
  },

  // 获取商品详情
  getProduct: (id: string) => request<Product>(`/products/${id}`),

  // 获取分类列表
  getCategories: (type?: string) => {
    const query = type ? `?type=${type}` : '';
    return request<Category[]>(`/products/categories${query}`);
  },
};

// ==================== 订单 API ====================

export interface Order {
  id: string;
  orderNo: string;
  totalAmount: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  items: {
    id: string;
    quantity: number;
    price: string;
    product: Product;
  }[];
}

export const orderApi = {
  // 获取订单列表
  getOrders: (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return request<Order[]>(`/orders${query}`);
  },

  // 获取订单详情
  getOrder: (id: string) => request<Order>(`/orders/${id}`),

  // 创建订单
  createOrder: (data: {
    items: { productId: string; quantity: number; spec?: string }[];
    addressId?: string;
  }) =>
    request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 取消订单
  cancelOrder: (id: string) =>
    request(`/orders/${id}/cancel`, { method: 'PUT' }),

  // 确认收货
  confirmOrder: (id: string) =>
    request(`/orders/${id}/confirm`, { method: 'PUT' }),
};

// ==================== 收藏 API ====================

export const favoriteApi = {
  // 获取收藏列表
  getFavorites: () => request<Product[]>('/favorites'),

  // 添加收藏
  addFavorite: (productId: string) =>
    request('/favorites', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    }),

  // 取消收藏
  removeFavorite: (productId: string) =>
    request(`/favorites/${productId}`, { method: 'DELETE' }),
};

// ==================== Pi 支付 API ====================

export type PiPaymentType = 'ORDER' | 'RECHARGE' | 'DEPOSIT' | 'ESCROW';
export type PiPaymentStatus = 'CREATED' | 'APPROVED' | 'COMPLETED' | 'CANCELLED' | 'FAILED';

export interface PiPayment {
  id: string;
  paymentId: string;
  txId?: string;
  userId: string;
  orderId?: string;
  amount: string;
  memo?: string;
  type: PiPaymentType;
  status: PiPaymentStatus;
  createdAt: string;
  completedAt?: string;
}

export const piPaymentApi = {
  // 创建支付记录
  createPayment: (data: {
    paymentId: string;
    amount: number;
    type: PiPaymentType;
    orderId?: string;
    memo?: string;
  }) =>
    request<PiPayment>('/pi-payment/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 批准支付
  approvePayment: (paymentId: string) =>
    request<PiPayment>('/pi-payment/approve', {
      method: 'POST',
      body: JSON.stringify({ paymentId }),
    }),

  // 完成支付
  completePayment: (paymentId: string, txId: string) =>
    request<PiPayment>('/pi-payment/complete', {
      method: 'POST',
      body: JSON.stringify({ paymentId, txId }),
    }),

  // 取消支付
  cancelPayment: (paymentId: string) =>
    request(`/pi-payment/cancel/${paymentId}`, { method: 'POST' }),

  // 获取支付详情
  getPayment: (paymentId: string) =>
    request<PiPayment>(`/pi-payment/${paymentId}`),

  // 获取用户支付记录
  getUserPayments: (type?: PiPaymentType) => {
    const query = type ? `?type=${type}` : '';
    return request<PiPayment[]>(`/pi-payment${query}`);
  },
};

// 导出所有 API
export const api = {
  auth: authApi,
  user: userApi,
  product: productApi,
  order: orderApi,
  favorite: favoriteApi,
  piPayment: piPaymentApi,
};

export default api;

// ==================== 聊天 API ====================

export interface ChatRoom {
  id: string;
  userId: string;
  merchantId: string;
  lastMessage?: string;
  lastMessageAt?: string;
  user: {
    id: string;
    username: string;
    avatar?: string;
  };
  merchantUser: {
    id: string;
    username: string;
    avatar?: string;
    merchant?: {
      shopName: string;
      logo?: string;
    };
  };
  messages?: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'PRODUCT' | 'ORDER';
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    username: string;
    avatar?: string;
  };
}

export const chatApi = {
  // 获取聊天室列表
  getRooms: () => request<ChatRoom[]>('/chat/rooms'),

  // 创建或获取与商家的聊天室
  getOrCreateRoom: (merchantId: string) =>
    request<ChatRoom>(`/chat/rooms/${merchantId}`, { method: 'POST' }),

  // 获取聊天记录
  getMessages: (roomId: string, page = 1, limit = 50) =>
    request<ChatMessage[]>(`/chat/rooms/${roomId}/messages?page=${page}&limit=${limit}`),

  // 标记消息已读
  markAsRead: (roomId: string) =>
    request(`/chat/rooms/${roomId}/read`, { method: 'POST' }),

  // 获取未读消息数
  getUnreadCount: () => request<{ count: number }>('/chat/unread'),
};
