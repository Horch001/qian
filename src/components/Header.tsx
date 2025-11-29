import React, { useState, useRef, useEffect } from 'react';
import { Languages, Check } from 'lucide-react';
import { Store } from 'lucide-react';
import { Language, Translations } from '../types';
import { SearchBar } from './SearchBar';
import { statsApi } from '../services/api';

interface HeaderProps {
  language: Language;
  translations: Translations;
  onLanguageChange: (lang: Language) => void;
}

export const Header: React.FC<HeaderProps> = ({ language, translations, onLanguageChange }) => {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 获取在线人数
  useEffect(() => {
    const fetchOnlineCount = async () => {
      try {
        const data = await statsApi.getOnlineCount();
        setOnlineCount(data.onlineCount);
      } catch (error) {
        console.error('Failed to fetch online count:', error);
        // API失败时不使用模拟数据，保持为0显示"---"
        // 不修改当前值，如果之前有值则保留，否则显示"---"
      }
    };

    // 初始获取
    fetchOnlineCount();

    // 每30秒更新一次
    const interval = setInterval(fetchOnlineCount, 30000);

    return () => clearInterval(interval);
  }, []);

  const languages: Array<{ code: Language; label: string }> = [
    { code: 'zh', label: '中文' },
    { code: 'en', label: 'English' },
    { code: 'ko', label: '한국어' },
    { code: 'vi', label: 'Tiếng Việt' },
  ];

  const titleSizeClass = language === 'zh' ? 'text-2xl' : 'text-lg';

  return (
    <div className="px-4 pt-3 pb-4 flex flex-col items-center space-y-4 bg-transparent w-full">
      <div className="w-full relative flex justify-center items-center h-10">

        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center px-2 py-0.5 select-none">
          <span className="text-[8px] text-purple-900 scale-90 origin-bottom mb-[1px]">{translations.onlineUsers[language]}</span>
          <div className="flex items-center gap-1">
            <div className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
            </div>
            <span className="text-[10px] font-bold text-purple-900/90 tabular-nums leading-none">
              {onlineCount > 0 ? onlineCount.toLocaleString() : '---'}
            </span>
          </div>
        </div>

        <div className="relative flex items-center justify-center z-10">
          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center gap-0">
              <h1 className={`${titleSizeClass} font-extrabold bg-gradient-to-r from-purple-800 via-purple-300 to-purple-800 bg-clip-text text-transparent tracking-wide animate-shine leading-tight`}>
                {translations.platformTitle[language]}
              </h1>
              <svg className="w-full h-1" viewBox="0 0 200 4" preserveAspectRatio="none">
                <path d="M0,2 Q50,0 100,2 T200,2" fill="none" stroke="url(#gradient)" strokeWidth="2"/>
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.5"/>
                    <stop offset="50%" stopColor="#7c3aed" stopOpacity="1"/>
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.5"/>
                  </linearGradient>
                </defs>
              </svg>
              <div className="text-[23px] font-medium bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 bg-clip-text text-transparent animate-shine leading-tight">sczl.com</div>
            </div>
          </div>
        </div>

        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-50" ref={langRef}>
          <button 
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="h-6 w-6 flex items-center justify-center rounded-full border border-white/50 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] text-purple-900/80 hover:bg-white/60 active:scale-95 transition-all"
          >
            <Languages size={13} strokeWidth={2} />
          </button>

          {isLangOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white/95 backdrop-blur-xl rounded-lg border border-white/50 shadow-xl overflow-hidden z-50">
              <div className="flex flex-col">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onLanguageChange(lang.code);
                      setIsLangOpen(false);
                    }}
                    className="text-left px-2 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded flex items-center gap-1 transition-colors whitespace-nowrap"
                  >
                    <span>{lang.label}</span>
                    {language === lang.code && <Check size={10} className="text-purple-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <SearchBar language={language} translations={translations} />
    </div>
  );
};
