import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import './index.css';

// 生产环境启用移动端调试工具（中文版）
if (import.meta.env.PROD) {
  import('vconsole').then(({ default: VConsole }) => {
    new VConsole({
      defaultPlugins: ['system', 'network', 'element', 'storage'],
      // 自定义按钮文字
      onReady: function() {
        // 修改标签页文字为中文
        const tabs = document.querySelectorAll('.vc-tab');
        const tabNames: { [key: string]: string } = {
          'Log': '日志',
          'System': '系统',
          'Network': '网络',
          'Element': '元素',
          'Storage': '存储'
        };
        
        tabs.forEach((tab: any) => {
          const text = tab.textContent?.trim();
          if (text && tabNames[text]) {
            tab.textContent = tabNames[text];
          }
        });

        // 修改子标签文字
        setTimeout(() => {
          const subTabs = document.querySelectorAll('.vc-subtab');
          const subTabNames: { [key: string]: string } = {
            'All': '全部',
            'Log': '日志',
            'Info': '信息',
            'Warn': '警告',
            'Error': '错误',
            'Cookies': 'Cookie',
            'LocalStorage': '本地存储',
            'SessionStorage': '会话存储'
          };
          
          subTabs.forEach((tab: any) => {
            const text = tab.textContent?.trim();
            if (text && subTabNames[text]) {
              tab.textContent = subTabNames[text];
            }
          });
        }, 100);
      }
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
