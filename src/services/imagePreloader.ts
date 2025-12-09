/**
 * 图片预加载服务
 * 实现无缝图片显示，消除空白期
 * 
 * 策略：App启动时预加载所有板块的图片，用户进入时已准备好
 */

import { productApi, friendlyLinkApi, escrowApi } from './api';
import api from './api';

// 已加载的图片URL缓存（内存级别）
const loadedImages = new Set<string>();

// 正在加载的图片Promise缓存
const loadingPromises = new Map<string, Promise<boolean>>();

// 所有板块的商品分类类型
const ALL_CATEGORY_TYPES = [
  'PHYSICAL',      // 实物商城
  'VIRTUAL',       // 虚拟商城
  'SERVICE',       // 上门服务
  'OFFLINE_PLAY',  // 线下陪玩
  'COURSE',        // 知识付费
  'DETECTIVE',     // 商业调查
  'CASUAL_GAME',   // 休闲游戏
];

// 商品数据缓存（按分类类型存储）
const cachedProducts: Record<string, any[]> = {};

// 其他板块数据缓存
let cachedAuctions: any[] = [];
let cachedBounties: any[] = [];
let cachedFriendlyLinks: any[] = [];
let cachedEscrowTrades: any[] = [];

let isInitialized = false;

/**
 * 预加载单张图片
 */
export const preloadImage = (url: string, timeout = 8000): Promise<boolean> => {
  if (!url) return Promise.resolve(false);
  
  if (loadedImages.has(url)) {
    return Promise.resolve(true);
  }
  
  if (loadingPromises.has(url)) {
    return loadingPromises.get(url)!;
  }
  
  const promise = new Promise<boolean>((resolve) => {
    const img = new Image();
    let resolved = false;
    
    const cleanup = () => {
      if (!resolved) {
        resolved = true;
        loadingPromises.delete(url);
      }
    };
    
    img.onload = () => {
      loadedImages.add(url);
      cleanup();
      resolve(true);
    };
    
    img.onerror = () => {
      cleanup();
      resolve(false);
    };
    
    setTimeout(() => {
      if (!resolved) {
        cleanup();
        resolve(false);
      }
    }, timeout);
    
    img.src = url;
  });
  
  loadingPromises.set(url, promise);
  return promise;
};

/**
 * 批量预加载图片（等待全部完成）
 */
export const preloadImages = async (urls: string[], timeout = 8000): Promise<boolean[]> => {
  if (!urls || urls.length === 0) return [];
  const validUrls = urls.filter(url => url && typeof url === 'string');
  return Promise.all(validUrls.map(url => preloadImage(url, timeout)));
};

/**
 * 检查图片是否已加载
 */
export const isImageLoaded = (url: string): boolean => {
  return loadedImages.has(url);
};

/**
 * 检查所有图片是否已加载
 */
export const areAllImagesLoaded = (urls: string[]): boolean => {
  if (!urls || urls.length === 0) return true;
  return urls.every(url => !url || loadedImages.has(url));
};

/**
 * 预加载商品的所有图片（主图+副图+详情图）
 * 返回Promise，等待所有图片加载完成
 */
export const preloadProductImages = async (product: {
  images?: string[];
  detailImages?: string[];
}): Promise<boolean> => {
  const allImages: string[] = [];
  
  if (product.images && Array.isArray(product.images)) {
    allImages.push(...product.images);
  }
  
  if (product.detailImages && Array.isArray(product.detailImages)) {
    allImages.push(...product.detailImages);
  }
  
  if (allImages.length === 0) return true;
  
  const results = await preloadImages(allImages, 10000);
  const successCount = results.filter(r => r).length;
  console.log(`[ImagePreloader] 商品图片预加载: ${successCount}/${allImages.length}`);
  return successCount === allImages.length;
};

/**
 * 预加载商品列表的主图（等待全部完成）
 */
export const preloadProductListImages = async (products: Array<{ images?: string[] }>): Promise<boolean> => {
  const mainImages = products
    .map(p => p.images?.[0])
    .filter((url): url is string => !!url);
  
  if (mainImages.length === 0) return true;
  
  const results = await preloadImages(mainImages, 8000);
  const successCount = results.filter(r => r).length;
  console.log(`[ImagePreloader] 列表主图预加载: ${successCount}/${mainImages.length}`);
  return successCount === mainImages.length;
};

/**
 * 🔥 App启动时调用：预加载所有板块的数据和图片
 * 这样用户进入任何板块时，数据和图片都已准备好
 */
export const initializeProductCache = async (): Promise<void> => {
  if (isInitialized) return;
  isInitialized = true;
  
  console.log('[ImagePreloader] 开始预加载所有板块数据和图片...');
  
  const allImages: string[] = [];
  
  try {
    // 🔥 1. 并行获取所有商品板块
    const productRequests = ALL_CATEGORY_TYPES.map(type => 
      productApi.getProducts({ categoryType: type, limit: 20 })
        .then(res => ({ type, items: res.items || [] }))
        .catch(() => ({ type, items: [] }))
    );
    
    // 🔥 2. 并行获取其他板块（拍卖、悬赏、友情链接、担保交易）
    const otherRequests = [
      // 拍卖
      api.get('/auctions', { params: { limit: 50 } })
        .then(res => {
          const data = res.data?.data || res.data || [];
          cachedAuctions = Array.isArray(data) ? data : [];
          return cachedAuctions;
        })
        .catch(() => []),
      // 悬赏
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/v1/bounties`)
        .then(res => res.json())
        .then(data => {
          cachedBounties = Array.isArray(data) ? data : [];
          return cachedBounties;
        })
        .catch(() => []),
      // 友情链接
      friendlyLinkApi.getApprovedLinks()
        .then(data => {
          cachedFriendlyLinks = data || [];
          return cachedFriendlyLinks;
        })
        .catch(() => []),
      // 担保交易
      escrowApi.getTrades()
        .then(data => {
          cachedEscrowTrades = data || [];
          return cachedEscrowTrades;
        })
        .catch(() => []),
    ];
    
    // 并行执行所有请求
    const [productResults] = await Promise.all([
      Promise.all(productRequests),
      Promise.all(otherRequests),
    ]);
    
    // 存储商品数据到缓存
    let totalProducts = 0;
    productResults.forEach(({ type, items }) => {
      cachedProducts[type] = items;
      totalProducts += items.length;
    });
    
    console.log(`[ImagePreloader] 获取到数据:`);
    console.log(`  - 商品: ${totalProducts}个`);
    console.log(`  - 拍卖: ${cachedAuctions.length}个`);
    console.log(`  - 悬赏: ${cachedBounties.length}个`);
    console.log(`  - 友情链接: ${cachedFriendlyLinks.length}个`);
    console.log(`  - 担保交易: ${cachedEscrowTrades.length}个`);
    
    // 🔥 收集所有图片URL
    
    // 商品图片（主图+副图+详情图）
    Object.values(cachedProducts).flat().forEach(product => {
      if (product.images && Array.isArray(product.images)) {
        allImages.push(...product.images);
      }
      if (product.detailImages && Array.isArray(product.detailImages)) {
        allImages.push(...product.detailImages);
      }
    });
    
    // 拍卖图片
    cachedAuctions.forEach(auction => {
      if (auction.images && Array.isArray(auction.images)) {
        allImages.push(...auction.images);
      }
    });
    
    // 悬赏图片
    cachedBounties.forEach(bounty => {
      if (bounty.images && Array.isArray(bounty.images)) {
        allImages.push(...bounty.images);
      }
    });
    
    // 友情链接logo
    cachedFriendlyLinks.forEach(link => {
      if (link.logo) {
        allImages.push(link.logo);
      }
    });
    
    // 过滤有效URL并去重
    const validImages = [...new Set(allImages.filter(url => url && typeof url === 'string'))];
    
    if (validImages.length > 0) {
      console.log(`[ImagePreloader] 开始预加载 ${validImages.length} 张图片...`);
      
      // 并行预加载所有图片（不阻塞App启动）
      preloadImages(validImages, 30000).then(() => {
        console.log(`[ImagePreloader] 所有图片预加载完成: ${loadedImages.size}张`);
      });
    }
    
  } catch (error) {
    console.error('[ImagePreloader] 预加载失败:', error);
  }
};

/**
 * 获取缓存的商品数据
 */
export const getCachedProducts = (type: string): any[] => {
  return cachedProducts[type] || [];
};

/**
 * 更新缓存的商品数据
 */
export const updateCachedProducts = (type: string, products: any[]): void => {
  cachedProducts[type] = products;
};

/**
 * 获取缓存的拍卖数据
 */
export const getCachedAuctions = (): any[] => cachedAuctions;

/**
 * 获取缓存的悬赏数据
 */
export const getCachedBounties = (): any[] => cachedBounties;

/**
 * 获取缓存的友情链接数据
 */
export const getCachedFriendlyLinks = (): any[] => cachedFriendlyLinks;

/**
 * 获取缓存的担保交易数据
 */
export const getCachedEscrowTrades = (): any[] => cachedEscrowTrades;

/**
 * 检查是否已初始化
 */
export const isPreloaderInitialized = (): boolean => {
  return isInitialized;
};

/**
 * 获取预加载统计
 */
export const getPreloadStats = () => {
  const productCounts: Record<string, number> = {};
  Object.entries(cachedProducts).forEach(([type, items]) => {
    productCounts[type] = items.length;
  });
  return {
    loaded: loadedImages.size,
    loading: loadingPromises.size,
    products: productCounts,
  };
};

/**
 * 清除预加载缓存
 */
export const clearPreloadCache = () => {
  loadedImages.clear();
  loadingPromises.clear();
  Object.keys(cachedProducts).forEach(key => delete cachedProducts[key]);
  isInitialized = false;
};

export default {
  preloadImage,
  preloadImages,
  isImageLoaded,
  areAllImagesLoaded,
  preloadProductImages,
  preloadProductListImages,
  initializeProductCache,
  getCachedProducts,
  updateCachedProducts,
  getCachedAuctions,
  getCachedBounties,
  getCachedFriendlyLinks,
  getCachedEscrowTrades,
  isPreloaderInitialized,
  getPreloadStats,
  clearPreloadCache,
};
