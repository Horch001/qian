import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    strictPort: false,
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    minify: 'esbuild',
    // 代码分割优化
    rollupOptions: {
      output: {
        manualChunks: {
          // 将 React 相关库单独打包
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // 将 socket.io 单独打包
          'socket': ['socket.io-client'],
          // 将 lucide-react 图标库单独打包
          'icons': ['lucide-react'],
        },
      },
    },
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 减小 chunk 大小警告阈值
    chunkSizeWarningLimit: 1000,
    // 启用 sourcemap（生产环境可选）
    sourcemap: false,
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'socket.io-client', 'lucide-react'],
  },
});

