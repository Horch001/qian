import React, { useState, useEffect, useRef } from 'react';
import { isImageLoaded, preloadImage } from '../services/imagePreloader';

interface PreloadImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
  onClick?: () => void;
  loading?: 'lazy' | 'eager';
}

/**
 * 带预加载功能的图片组件
 * - 如果图片已预加载，立即显示
 * - 如果未预加载，显示占位符，加载完成后平滑过渡
 */
export const PreloadImage: React.FC<PreloadImageProps> = ({
  src,
  alt,
  className = '',
  fallback,
  onClick,
  loading = 'eager',
}) => {
  // 检查图片是否已经预加载
  const [isLoaded, setIsLoaded] = useState(() => isImageLoaded(src));
  const [showImage, setShowImage] = useState(() => isImageLoaded(src));
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!src) {
      setHasError(true);
      return;
    }

    // 如果已经加载过，直接显示
    if (isImageLoaded(src)) {
      setIsLoaded(true);
      setShowImage(true);
      return;
    }

    // 否则开始加载
    setIsLoaded(false);
    setShowImage(false);
    setHasError(false);
    
    preloadImage(src, 8000).then(success => {
      if (success) {
        setIsLoaded(true);
        // 短暂延迟后显示图片，确保过渡效果
        requestAnimationFrame(() => {
          setShowImage(true);
        });
      } else {
        setHasError(true);
      }
    });
  }, [src]);

  // 如果有错误或没有src，显示fallback
  if (hasError || !src) {
    return <>{fallback || <div className={className} style={{ background: '#f3f4f6' }} />}</>;
  }

  // 图片已加载且可以显示
  if (isLoaded && showImage) {
    return (
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-200`}
        onClick={onClick}
        loading={loading}
        style={{ opacity: 1 }}
      />
    );
  }

  // 图片加载中，显示渐变占位符
  return (
    <div className={`relative overflow-hidden ${className}`} onClick={onClick} style={{ minHeight: '1px' }}>
      {/* 渐变占位符 */}
      {fallback || (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 animate-pulse"
          style={{ borderRadius: 'inherit' }}
        />
      )}
      {/* 预加载图片（不可见） */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className="opacity-0 absolute inset-0 w-full h-full"
        onLoad={() => {
          setIsLoaded(true);
          requestAnimationFrame(() => setShowImage(true));
        }}
        onError={() => setHasError(true)}
        loading={loading}
      />
    </div>
  );
};

export default PreloadImage;
