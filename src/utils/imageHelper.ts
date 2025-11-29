/**
 * 图片URL处理工具
 * 兼容Base64和文件URL两种格式
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * 获取完整的图片URL
 * @param imageUrl 图片URL（可能是Base64或相对路径）
 * @returns 完整的图片URL
 */
export function getImageUrl(imageUrl: string | undefined | null): string {
  if (!imageUrl) {
    return ''; // 返回空字符串，让组件显示默认图标
  }

  // 如果是Base64格式，直接返回
  if (imageUrl.startsWith('data:image/')) {
    return imageUrl;
  }

  // 如果是完整URL（http/https），直接返回
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // 如果是相对路径（/uploads/...），拼接服务器地址
  if (imageUrl.startsWith('/uploads/')) {
    // 确保API_BASE_URL不以/结尾
    const baseUrl = API_BASE_URL.replace(/\/api\/v1$/, '').replace(/\/$/, '');
    return `${baseUrl}${imageUrl}`;
  }

  // 其他情况，尝试拼接
  const baseUrl = API_BASE_URL.replace(/\/api\/v1$/, '').replace(/\/$/, '');
  return `${baseUrl}/${imageUrl}`;
}

/**
 * 批量处理图片URL
 * @param images 图片URL数组
 * @returns 处理后的完整URL数组
 */
export function getImageUrls(images: string[] | undefined | null): string[] {
  if (!images || images.length === 0) {
    return [];
  }
  return images.map(img => getImageUrl(img));
}

/**
 * 获取第一张图片URL
 * @param images 图片URL数组
 * @returns 第一张图片的完整URL
 */
export function getFirstImageUrl(images: string[] | undefined | null): string {
  if (!images || images.length === 0) {
    return '';
  }
  return getImageUrl(images[0]);
}
