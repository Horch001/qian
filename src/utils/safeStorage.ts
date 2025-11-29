/**
 * 安全的 localStorage 操作工具
 * 处理配额超限、解析错误等异常情况
 */

export const safeStorage = {
  /**
   * 安全地获取缓存数据
   */
  getItem<T>(key: string): T | null {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;
      return JSON.parse(cached) as T;
    } catch (error) {
      console.warn(`读取缓存失败 [${key}]:`, error);
      // 清除损坏的缓存
      try {
        localStorage.removeItem(key);
      } catch (e) {
        // 忽略清除错误
      }
      return null;
    }
  },

  /**
   * 安全地设置缓存数据
   * 自动处理配额超限，清理旧缓存后重试
   */
  setItem(key: string, value: any): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error: any) {
      console.warn(`缓存写入失败 [${key}]:`, error.message);
      
      // 如果是配额超限，清理旧缓存后重试
      if (error.name === 'QuotaExceededError') {
        try {
          this.clearOldCache(key);
          localStorage.setItem(key, JSON.stringify(value));
          console.log('清理旧缓存后写入成功');
          return true;
        } catch (retryError) {
          console.error('清理缓存后仍然失败，禁用缓存');
          return false;
        }
      }
      return false;
    }
  },

  /**
   * 清理旧缓存
   * 保留当前 key，删除其他同类缓存
   */
  clearOldCache(currentKey: string) {
    const prefix = currentKey.split(':')[0]; // 例如 "products"
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix + ':') && key !== currentKey) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        // 忽略删除错误
      }
    });
    
    console.log(`已清理 ${keysToRemove.length} 个旧缓存`);
  },

  /**
   * 移除缓存
   */
  removeItem(key: string) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`删除缓存失败 [${key}]:`, error);
    }
  },

  /**
   * 清空所有缓存
   */
  clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('清空缓存失败:', error);
    }
  },
};
