/**
 * 图片压缩工具
 * 参考淘宝、京东等电商平台的图片处理策略
 */

export interface CompressOptions {
  maxWidth?: number;      // 最大宽度
  maxHeight?: number;     // 最大高度
  quality?: number;       // 压缩质量 0-1
  mimeType?: string;      // 输出格式
}

/**
 * 压缩图片文件
 * @param file 原始文件
 * @param options 压缩选项
 * @returns Base64 字符串
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<string> {
  const {
    maxWidth = 800,      // 列表页缩略图：800px
    maxHeight = 800,
    quality = 0.8,       // 80% 质量
    mimeType = 'image/jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // 计算压缩后的尺寸
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }
        
        // 创建 canvas 进行压缩
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('无法创建 canvas context'));
          return;
        }
        
        // 绘制图片
        ctx.drawImage(img, 0, 0, width, height);
        
        // 转换为 Base64
        const compressed = canvas.toDataURL(mimeType, quality);
        resolve(compressed);
      };
      
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
}

/**
 * 批量压缩图片
 */
export async function compressImages(
  files: File[],
  options: CompressOptions = {}
): Promise<string[]> {
  const promises = files.map(file => compressImage(file, options));
  return Promise.all(promises);
}

/**
 * 预设配置 - 极限压缩版本
 * 为了解决数据库Base64存储性能问题，大幅降低图片质量和尺寸
 */
export const COMPRESS_PRESETS = {
  // 缩略图：用于列表页（极限压缩）
  thumbnail: {
    maxWidth: 300,
    maxHeight: 300,
    quality: 0.5,  // 降低到50%
  },
  // 主图：用于详情页主图（大幅压缩）
  main: {
    maxWidth: 600,   // 从800降到600
    maxHeight: 600,
    quality: 0.6,    // 从0.8降到0.6
  },
  // 详情图：用于商品详情（大幅压缩）
  detail: {
    maxWidth: 800,   // 从1200降到800
    maxHeight: 800,
    quality: 0.65,   // 从0.85降到0.65
  },
};

/**
 * 获取压缩后的文件大小（估算）
 */
export function getCompressedSize(base64: string): number {
  // Base64 每个字符约 0.75 字节
  const base64Length = base64.replace(/^data:image\/\w+;base64,/, '').length;
  return Math.floor(base64Length * 0.75);
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}
