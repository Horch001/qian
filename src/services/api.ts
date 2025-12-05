// API 基础配置
const getApiBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  // 确保 URL 以 /api/v1 结尾
  if (url.endsWith('/api/v1')) return url;
  if (url.endsWith('/')) return `${url}api/v1`;
  return `${url}/api/v1`;
};
const API_BASE_URL = getApiBaseUrl();

// 获取服务器基础URL（不含/api/v1）- 从环境变量读取
const getServerBaseUrl = () => {
  // 优先使用 VITE_API_URL 环境变量
  const url = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  return url.replace(/\/api\/v1$/, '').replace(/\/$/, '');
};

// 处理图片URL（兼容Base64和文件URL）- 动态从环境变量获取
const processImageUrl = (imageUrl: string | undefined | null): string => {
  if (!imageUrl) return '';
  // 如果是Base64，直接返回
  if (imageUrl.startsWith('data:image/')) return imageUrl;
  // 如果是完整URL，直接返回
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
  // 如果是相对路径，拼接服务器地址（动态获取）
  if (imageUrl.startsWith('/uploads/')) {
    const serverBaseUrl = getServerBaseUrl();
    return `${serverBaseUrl}${imageUrl}`;
  }
  return imageUrl;
};

// 处理商品对象中的图片URL
const processProductImages = (product: any): any => {
  if (!product) return product;
  return {
    ...product,
    images: product.images?.map((img: string) => processImageUrl(img)) || [],
    detailImages: product.detailImages?.map((img: string) => processImageUrl(img)) || [],
    icon: product.icon,
  };
};

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
  // 获取个人资料
  getProfile: () => request<{ id: string; username: string; email?: string; avatar?: string; balance: string; role: string }>('/users/profile'),

  // 更新个人资料
  updateProfile: (data: { username?: string; avatar?: string; email?: string }) =>
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

  // 申请提现
  withdraw: (amount: number) =>
    request<{ message: string; withdrawal: any }>('/users/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),

  // 获取提现记录
  getWithdrawals: () => request<any[]>('/users/withdrawals'),

  // 获取通知列表
  getNotifications: () => request<any[]>('/users/notifications'),

  // 获取未读通知数
  getUnreadNotificationCount: () => request<{ count: number }>('/users/notifications/unread-count'),

  // 标记通知为已读
  markNotificationAsRead: (id: string) =>
    request(`/users/notifications/${id}/read`, { method: 'PUT' }),

  // 标记所有通知为已读
  markAllNotificationsAsRead: () =>
    request('/users/notifications/read-all', { method: 'PUT' }),

  // 获取余额变动记录
  getBalanceHistory: () => request<any[]>('/users/balance-history'),

  // 购物车相关
  getCartItems: () => request<any[]>('/users/cart'),

  addToCart: (productId: string, quantity: number, spec?: string) =>
    request('/users/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity, spec }),
    }),

  updateCartItem: (cartItemId: string, quantity: number) =>
    request(`/users/cart/${cartItemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),

  removeFromCart: (cartItemId: string) =>
    request(`/users/cart/${cartItemId}`, { method: 'DELETE' }),

  clearCart: () => request('/users/cart', { method: 'DELETE' }),

  getCartCount: () => request<{ count: number }>('/users/cart/count'),
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
  favorites: number; // 收藏数
  rating: number;
  icon?: string;
  images: string[];
  detailImages?: string[]; // 详情图
  merchantId?: string;
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
  getProducts: async (params?: {
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
    const response = await request<ProductListResponse>(`/products${query ? `?${query}` : ''}`);
    // 处理图片URL
    return {
      ...response,
      items: response.items.map(processProductImages),
    };
  },

  // 搜索商品
  searchProducts: (params: {
    keyword: string;
    categoryType?: string;
    city?: string;
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    return request<ProductListResponse>(`/products/search?${searchParams.toString()}`);
  },

  // 获取商品详情
  getProduct: async (id: string) => {
    const product = await request<Product>(`/products/${id}`);
    return processProductImages(product);
  },

  // 获取分类列表
  getCategories: (type?: string) => {
    const query = type ? `?type=${type}` : '';
    return request<Category[]>(`/products/categories${query}`);
  },

  // 搜索建议 - 快速返回匹配的商品
  searchSuggestions: (keyword: string, limit = 10) =>
    request<Array<{ id: string; title: string; titleEn?: string; icon?: string; price: string; images?: string[] }>>(
      `/products/search/suggestions?keyword=${encodeURIComponent(keyword)}&limit=${limit}`
    ),
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

  // 余额支付
  payWithBalance: (orderId: string) =>
    request<Order>(`/orders/${orderId}/pay-balance`, { method: 'POST' }),

  // 取消订单
  cancelOrder: (id: string) =>
    request(`/orders/${id}/cancel`, { method: 'PUT' }),

  // 删除订单（仅已退款订单）
  deleteOrder: (id: string) =>
    request(`/orders/${id}/delete`, { method: 'PUT' }),

  // 确认收货
  confirmOrder: (id: string) =>
    request(`/orders/${id}/confirm`, { method: 'PUT' }),

  // 申请退款（未收货）
  refundOrder: (id: string) =>
    request<{ refundAmount: number }>(`/orders/${id}/refund`, { method: 'POST' }),

  // 申请退货退款（已收货）
  refundReturnOrder: (id: string) =>
    request(`/orders/${id}/refund-return`, { method: 'POST' }),
};

// ==================== 收藏 API ====================

export const favoriteApi = {
  // 获取收藏列表
  getFavorites: () => request<Product[]>('/favorites'),

  // 添加收藏
  addFavorite: (productId: string) =>
    request(`/favorites/${productId}`, { method: 'POST' }),

  // 取消收藏
  removeFavorite: (productId: string) =>
    request(`/favorites/${productId}`, { method: 'DELETE' }),

  // 检查是否已收藏
  checkFavorite: (productId: string) =>
    request<{ isFavorite: boolean }>(`/favorites/${productId}/check`),
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

  // 同步支付状态（从 Pi API 获取最新状态）
  syncPaymentStatus: (paymentId: string) =>
    request<PiPayment>(`/pi-payment/sync/${paymentId}`, { method: 'POST' }),

  // 恢复所有未完成的支付
  recoverIncompletePayments: () =>
    request('/pi-payment/recover-incomplete', { method: 'POST' }),
};

// ==================== 商家 API ====================

export interface Merchant {
  id: string;
  userId: string;
  shopName: string;
  description?: string;
  logo?: string;
  banner?: string;
  deposit: string;
  rating: number;
  totalSales: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  category?: string;
  reviewNote?: string;
  announcement?: string;
  contactPhone?: string;
  businessHours?: string;
  createdAt: string;
}

export interface MerchantApplication {
  shopName: string;
  description?: string;
  contactName?: string;
  contactPhone?: string;
  category: string;
  businessType?: string;
  email: string;
  realName?: string;
  idCard?: string;
  idCardImage?: string;
  businessLicense?: string;
  logo?: string;
}

export interface ProductUpload {
  merchantId?: string; // 店铺ID（多店铺时指定）
  title: string;
  description?: string;
  price: number | string; // 支持字符串避免浮点数精度问题
  stock: number;
  image?: string;
  images?: string[];
  detailImages?: string[]; // 详情图
}

export const merchantApi = {
  // 申请入驻商家
  apply: (data: MerchantApplication) =>
    request<Merchant>('/merchants/apply', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 获取我的商家信息（第一个已通过的）
  getMyMerchant: () => request<Merchant | null>('/merchants/my'),

  // 获取我的所有店铺
  getMyAllMerchants: () => request<Merchant[]>('/merchants/my/all'),

  // 更新商家信息
  updateMyMerchant: (data: Partial<MerchantApplication>) =>
    request<Merchant>('/merchants/my', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 上传商品
  uploadProduct: (data: ProductUpload) =>
    request<Product>('/merchants/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 获取我的商品列表
  getMyProducts: async (page = 1, limit = 20) => {
    const response = await request<ProductListResponse>(`/merchants/products?page=${page}&limit=${limit}`);
    return {
      ...response,
      items: response.items.map(processProductImages),
    };
  },

  // 更新商品
  updateProduct: (id: string, data: Partial<ProductUpload>) =>
    request<Product>(`/merchants/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 下架商品
  deactivateProduct: (id: string) =>
    request<Product>(`/merchants/products/${id}/deactivate`, {
      method: 'PUT',
    }),

  // 上架商品
  activateProduct: (id: string) =>
    request<Product>(`/merchants/products/${id}/activate`, {
      method: 'PUT',
    }),

  // 删除商品
  deleteProduct: (id: string) =>
    request(`/merchants/products/${id}`, {
      method: 'DELETE',
    }),

  // 获取商家详情
  getMerchant: (id: string) => request<Merchant>(`/merchants/${id}`),

  // 获取商家商品列表
  getMerchantProducts: (id: string, page = 1, limit = 20) =>
    request<ProductListResponse>(`/merchants/${id}/products?page=${page}&limit=${limit}`),

  // 获取商家订单列表
  getMyOrders: (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return request<any[]>(`/merchants/my/orders${query}`);
  },

  // 删除店铺
  deleteMerchant: (merchantId: string) =>
    request(`/merchants/${merchantId}`, {
      method: 'DELETE',
    }),
};

// ==================== 统计 API ====================

export interface PlatformStats {
  onlineCount: number;
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalMerchants: number;
}

export const statsApi = {
  // 获取在线人数
  getOnlineCount: () => request<{ onlineCount: number }>('/stats/online'),

  // 获取平台统计数据
  getPlatformStats: () => request<PlatformStats>('/stats/platform'),

  // 用户心跳（记录在线状态）
  heartbeat: () => request('/stats/heartbeat', { method: 'POST' }),
};

// ==================== 公告 API ====================

export interface Announcement {
  id: string;
  title: string;
  titleEn?: string;
  titleKo?: string;
  titleVi?: string;
  content?: string;
  contentEn?: string;
  contentKo?: string;
  contentVi?: string;
  type: 'INFO' | 'WARNING' | 'PROMOTION' | 'MAINTENANCE';
  link?: string;
  isActive: boolean;
  sortOrder: number;
  startAt: string;
  endAt?: string;
  createdAt: string;
}

export const announcementApi = {
  // 获取首页滚动公告
  getHomepageAnnouncement: () =>
    request<Announcement | null>('/announcements/homepage'),

  // 获取当前有效的公告列表
  getActiveAnnouncements: () =>
    request<Announcement[]>('/announcements/active'),
};

// 导出所有 API
export const api = {
  auth: authApi,
  user: userApi,
  product: productApi,
  order: orderApi,
  favorite: favoriteApi,
  piPayment: piPaymentApi,
  stats: statsApi,
  merchant: merchantApi,
  announcement: announcementApi,
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
    merchants?: Array<{
      shopName: string;
      logo?: string;
    }>;
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

  // 获取聊天室详情
  getRoomById: (roomId: string) => request<ChatRoom>(`/chat/rooms/${roomId}`),

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

// ==================== 树洞 API ====================

export interface TreeHole {
  id: string;
  content: string;
  isAnonymous: boolean;
  likes: number;
  createdAt: string;
  user?: {
    id: string;
    username: string;
  };
  _count?: {
    comments: number;
  };
}

export interface TreeHoleComment {
  id: string;
  content: string;
  isAnonymous: boolean;
  createdAt: string;
  user?: {
    id: string;
    username: string;
  };
}

export const treeHoleApi = {
  // 获取树洞列表
  getTreeHoles: (page = 1, limit = 20) =>
    request<{ items: TreeHole[]; total: number; page: number; limit: number }>(`/tree-hole?page=${page}&limit=${limit}`),

  // 获取树洞详情
  getTreeHole: (id: string) =>
    request<TreeHole & { comments: TreeHoleComment[] }>(`/tree-hole/${id}`),

  // 发布树洞
  createTreeHole: (data: { content: string; isAnonymous?: boolean }) =>
    request<TreeHole>('/tree-hole', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 评论树洞
  commentTreeHole: (id: string, data: { content: string; isAnonymous?: boolean }) =>
    request<TreeHoleComment>(`/tree-hole/${id}/comment`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 点赞树洞
  likeTreeHole: (id: string) =>
    request(`/tree-hole/${id}/like`, { method: 'POST' }),
};

// ==================== 求资源 API ====================

export interface ResourceRequest {
  id: string;
  title: string;
  titleEn?: string;
  description?: string;
  icon?: string;
  initiatorPrice: string;
  totalBids: string;
  bidderCount: number;
  status: string;
  deadline: string;
  createdAt: string;
  user?: {
    id: string;
    username: string;
  };
}

export const resourceApi = {
  // 获取求资源列表
  getResources: (params?: { sortBy?: string; keyword?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    const query = searchParams.toString();
    return request<{ items: ResourceRequest[]; total: number }>(`/resources${query ? `?${query}` : ''}`);
  },

  // 获取求资源详情
  getResource: (id: string) => request<ResourceRequest>(`/resource/${id}`),

  // 创建求资源
  createResource: (data: {
    title: string;
    titleEn?: string;
    description?: string;
    icon?: string;
    initiatorPrice: number;
    deadline: string;
  }) =>
    request<ResourceRequest>('/resource', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 出价（同求）
  bidResource: (id: string, amount: number) =>
    request(`/resource/${id}/bid`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),
};

// ==================== 友情链接 API ====================

export interface FriendlyLink {
  id: string;
  name: string;
  nameEn?: string;
  url: string;
  logo?: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}

export const friendlyLinkApi = {
  // 获取友情链接列表
  getLinks: () => request<FriendlyLink[]>('/friendly-links'),

  // 申请友情链接
  applyLink: (data: { name: string; url: string; description?: string }) =>
    request('/friendly-links/apply', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ==================== 担保交易 API ====================

export interface EscrowTrade {
  id: string;
  tradeNo: string;
  title: string;
  description?: string;
  amount: string;
  status: string;
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
  buyer: {
    id: string;
    username: string;
  };
  seller?: {
    id: string;
    username: string;
  };
}

export const escrowApi = {
  // 获取担保交易列表
  getTrades: (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return request<EscrowTrade[]>(`/escrow${query}`);
  },

  // 获取我的担保交易
  getMyTrades: () => request<EscrowTrade[]>('/escrow/mine'),

  // 获取担保交易详情
  getTrade: (id: string) => request<EscrowTrade>(`/escrow/${id}`),

  // 创建担保交易
  createTrade: (data: { title: string; description?: string; amount: number }) =>
    request<EscrowTrade>('/escrow', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 接单
  acceptTrade: (id: string) =>
    request(`/escrow/${id}/accept`, { method: 'POST' }),

  // 付款
  payTrade: (id: string) =>
    request(`/escrow/${id}/pay`, { method: 'POST' }),

  // 交付
  deliverTrade: (id: string) =>
    request(`/escrow/${id}/deliver`, { method: 'POST' }),

  // 确认完成
  completeTrade: (id: string) =>
    request(`/escrow/${id}/complete`, { method: 'POST' }),
};

// ==================== 售后管理 API ====================

export interface AfterSale {
  id: string;
  orderNo: string;
  orderId: string;
  userId: string;
  merchantId: string;
  type: 'REFUND_ONLY' | 'RETURN_REFUND' | 'EXCHANGE';
  reason: string;
  description?: string;
  images?: string[];
  amount: string;
  status: string;
  merchantReply?: string;
  returnLogistics?: {
    company: string;
    trackingNo: string;
  };
  createdAt: string;
  user?: {
    id: string;
    username: string;
  };
  order?: {
    orderNo: string;
  };
}

export const afterSaleApi = {
  // 买家申请售后
  createAfterSale: (data: {
    orderId: string;
    type: 'REFUND_ONLY' | 'RETURN_REFUND' | 'EXCHANGE';
    reason: string;
    description?: string;
    images?: string[];
    amount: number;
  }) =>
    request<AfterSale>('/after-sales', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 获取我的售后申请（买家）
  getMyAfterSales: () => request<AfterSale[]>('/after-sales/my'),

  // 获取商家的售后申请
  getMerchantAfterSales: (merchantId?: string) => {
    const query = merchantId ? `?merchantId=${merchantId}` : '';
    return request<AfterSale[]>(`/after-sales/merchant${query}`);
  },

  // 获取售后详情
  getAfterSale: (id: string) => request<AfterSale>(`/after-sales/${id}`),

  // 商家回复售后
  merchantReply: (id: string, data: { agreed: boolean; reply?: string }) =>
    request(`/after-sales/${id}/merchant-reply`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 买家填写退货物流
  buyerReturn: (id: string, data: { returnCompany: string; returnTrackingNo: string }) =>
    request(`/after-sales/${id}/buyer-return`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 商家确认收货
  merchantConfirm: (id: string) =>
    request(`/after-sales/${id}/merchant-confirm`, { method: 'POST' }),

  // 取消售后申请
  cancelAfterSale: (id: string) =>
    request(`/after-sales/${id}/cancel`, { method: 'PUT' }),
};

// ==================== 商家结算 API ====================

export interface MerchantAccount {
  id: string;
  merchantId: string;
  availableBalance: string;
  frozenBalance: string;
  totalIncome: string;
  totalWithdrawn: string;
}

export interface Settlement {
  id: string;
  merchantId: string;
  orderId: string;
  orderNo: string;
  amount: string;
  platformFee: string;
  actualAmount: string;
  status: string;
  createdAt: string;
  settledAt?: string;
  order?: {
    orderNo: string;
  };
}

export interface MerchantWithdrawal {
  id: string;
  merchantId: string;
  amount: string;
  fee: string;
  actualAmount: string;
  status: string;
  piAddress?: string;
  txId?: string;
  rejectReason?: string;
  createdAt: string;
  processedAt?: string;
}

export const settlementApi = {
  // 获取商家账户信息
  getAccount: () => request<MerchantAccount>('/settlement/account'),

  // 获取结算统计
  getStats: () =>
    request<{
      pendingCount: number;
      pendingAmount: string;
      monthlyIncome: string;
      monthlyFee: string;
      monthlyOrders: number;
      recentSettlements: Settlement[];
      recentWithdrawals: MerchantWithdrawal[];
      pendingWithdrawals: number;
      approvedWithdrawals: number;
      rejectedWithdrawals: number;
    }>('/settlement/stats'),

  // 申请提现
  createWithdrawal: (data: { amount: number; piAddress: string }) =>
    request<MerchantWithdrawal>('/settlement/withdrawal', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 获取提现列表（管理员）
  getWithdrawals: (page = 1, limit = 20, status?: string) => {
    const query = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) query.append('status', status);
    return request<{ items: MerchantWithdrawal[]; total: number }>(`/settlement/withdrawals?${query}`);
  },

  // 处理提现（管理员）
  processWithdrawal: (id: string, data: { approved: boolean; txId?: string; rejectReason?: string }) =>
    request(`/settlement/withdrawals/${id}/process`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
