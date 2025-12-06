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
 * 预设配置 - 优化版本
 * 使用本地文件存储后，可以提高图片质量，改善用户体验
 */
export const COMPRESS_PRESETS = {
  // 缩略图：用于列表页
  thumbnail: {
    maxWidth: 400,
    maxHeight: 400,
    quality: 0.75,
  },
  // 主图：用于详情页主图（高清）
  main: {
    maxWidth: 1200,   // 提高到1200px
    maxHeight: 1200,
    quality: 0.85,    // 提高到85%
  },
  // 详情图：用于商品详情（高清）
  detail: {
    maxWidth: 1200,   // 提高到1200px
    maxHeight: 1200,
    quality: 0.85,    // 提高到85%
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

/**
 * 图片质量检测结果
 */
export interface ImageQualityResult {
  isValid: boolean;
  width: number;
  height: number;
  warnings: string[];
  errors: string[];
}

/**
 * 检测图片质量
 * 参考电商平台标准：主图建议800x800以上，最小不低于400x400
 */
export async function checkImageQuality(
  file: File,
  type: 'main' | 'sub' | 'detail' = 'main'
): Promise<ImageQualityResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const { width, height } = img;
        const warnings: string[] = [];
        const errors: string[] = [];
        
        // 尺寸检测标准
        const standards = {
          main: { min: 400, recommended: 800, name: '主图' },
          sub: { min: 400, recommended: 800, name: '副图' },
          detail: { min: 480, recommended: 750, name: '详情图' }
        };
        
        const standard = standards[type];
        
        // 检测最小尺寸（硬性要求）
        if (width < standard.min || height < standard.min) {
          errors.push(`${standard.name}尺寸过小！当前${width}x${height}，最小要求${standard.min}x${standard.min}`);
        }
        
        // 检测推荐尺寸（建议）
        if (width < standard.recommended || height < standard.recommended) {
          warnings.push(`${standard.name}建议尺寸${standard.recommended}x${standard.recommended}以上，当前${width}x${height}可能影响展示效果`);
        }
        
        // 检测宽高比（主图和副图建议正方形）
        if (type === 'main' || type === 'sub') {
          const ratio = width / height;
          if (ratio < 0.8 || ratio > 1.2) {
            warnings.push(`${standard.name}建议使用正方形图片（1:1），当前比例${ratio.toFixed(2)}:1`);
          }
        }
        
        // 检测文件大小
        if (file.size > 5 * 1024 * 1024) {
          warnings.push(`图片文件过大（${formatFileSize(file.size)}），上传可能较慢`);
        }
        
        resolve({
          isValid: errors.length === 0,
          width,
          height,
          warnings,
          errors
        });
      };
      
      img.onerror = () => {
        resolve({
          isValid: false,
          width: 0,
          height: 0,
          warnings: [],
          errors: ['图片格式错误或已损坏']
        });
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      resolve({
        isValid: false,
        width: 0,
        height: 0,
        warnings: [],
        errors: ['文件读取失败']
      });
    };
    
    reader.readAsDataURL(file);
  });
}
