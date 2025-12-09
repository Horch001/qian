/**
 * 预加载商品数据的Hook
 * 优先使用App启动时预加载的缓存数据
 */

import { useState, useEffect } from 'react';
import { productApi, Product } from '../services/api';
import { 
  getCachedProducts, 
  updateCachedProducts, 
  preloadProductListImages,
  preloadProductImages 
} from '../services/imagePreloader';

interface UsePreloadedProductsOptions {
  categoryType: string;
  sortBy?: string;
  keyword?: string;
  province?: string;
  city?: string;
  limit?: number;
}

export const usePreloadedProducts = (options: UsePreloadedProductsOptions) => {
  const { categoryType, sortBy = 'default', keyword, province, city, limit = 20 } = options;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // 如果是默认排序且没有筛选条件，优先使用预加载缓存
        const isDefaultQuery = sortBy === 'default' && !keyword && !province && !city;
        const cachedProducts = getCachedProducts(categoryType);
        
        if (isDefaultQuery && cachedProducts.length > 0) {
          // 直接使用缓存数据（图片已预加载）
          setProducts(cachedProducts);
          setLoading(false);
          console.log(`[usePreloadedProducts] ${categoryType} 使用预加载缓存: ${cachedProducts.length}个`);
          
          // 后台预加载所有商品的详情图
          cachedProducts.forEach(product => {
            preloadProductImages(product);
          });
          return;
        }
        
        // 有筛选条件时请求新数据
        setLoading(true);
        setError(null);
        
        const response = await productApi.getProducts({
          categoryType,
          sortBy: sortBy === 'default' ? undefined : sortBy,
          keyword: keyword || undefined,
          province: province || undefined,
          city: city || undefined,
          limit,
        });
        
        const productList = response.items || [];
        
        // 等待主图加载完成后再显示
        if (productList.length > 0) {
          await preloadProductListImages(productList);
        }
        
        setProducts(productList);
        setLoading(false);
        
        // 更新缓存（仅默认查询）
        if (isDefaultQuery) {
          updateCachedProducts(categoryType, productList);
        }
        
        // 后台预加载详情图
        productList.forEach(product => {
          preloadProductImages(product);
        });
        
      } catch (err: any) {
        console.error(`获取${categoryType}商品失败:`, err);
        setError(err.message || '获取数据失败');
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryType, sortBy, keyword, province, city, limit]);

  // 监听WebSocket商品更新
  useEffect(() => {
    const handleProductUpdate = (updatedProduct: any) => {
      setProducts(prevProducts => {
        if (updatedProduct.status === 'SOLD_OUT' || updatedProduct.status === 'INACTIVE' || updatedProduct.status === 'DELETED') {
          return prevProducts.filter(p => p.id !== updatedProduct.id);
        }
        if (updatedProduct.status === 'ACTIVE') {
          const exists = prevProducts.some(p => p.id === updatedProduct.id);
          if (!exists && updatedProduct.category?.type === categoryType) {
            return [updatedProduct, ...prevProducts];
          }
          return prevProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p);
        }
        return prevProducts;
      });
    };

    window.addEventListener('product:updated', ((e: CustomEvent) => {
      handleProductUpdate(e.detail);
    }) as EventListener);

    return () => {
      window.removeEventListener('product:updated', handleProductUpdate as any);
    };
  }, [categoryType]);

  return { products, loading, error, setProducts };
};

export default usePreloadedProducts;
