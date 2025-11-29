import React from 'react';
import { getImageUrl } from '../utils/imageHelper';

interface ProductImageProps {
  src: string | undefined | null;
  alt: string;
  className?: string;
  fallbackIcon?: string;
}

/**
 * 商品图片组件
 * 自动处理Base64和文件URL两种格式
 */
export const ProductImage: React.FC<ProductImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  fallbackIcon = '📦' 
}) => {
  const imageUrl = getImageUrl(src);

  if (!imageUrl) {
    return (
      <div className={`flex items-center justify-center text-3xl ${className}`}>
        {fallbackIcon}
      </div>
    );
  }

  return (
    <img 
      src={imageUrl} 
      alt={alt} 
      className={className}
      onError={(e) => {
        // 图片加载失败时显示fallback
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        if (target.parentElement) {
          target.parentElement.innerHTML = `<div class="flex items-center justify-center text-3xl w-full h-full">${fallbackIcon}</div>`;
        }
      }}
    />
  );
};
