import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Language, Translations } from '../types';

interface SimpleSearchBarProps {
  language: Language;
  translations: Translations;
  categoryType?: string; // 板块类型，用于限定搜索范围
  onSearch?: (keyword: string) => void; // 自定义搜索回调
}

export const SimpleSearchBar: React.FC<SimpleSearchBarProps> = ({ 
  language, 
  translations, 
  categoryType,
  onSearch 
}) => {
  const [keyword, setKeyword] = useState('');

  const handleSearch = () => {
    const trimmedKeyword = keyword.trim();
    if (!trimmedKeyword) return;
    
    if (onSearch) {
      // 使用自定义搜索回调
      onSearch(trimmedKeyword);
    } else {
      // 默认跳转到搜索结果页
      const params = new URLSearchParams({ keyword: trimmedKeyword });
      if (categoryType) {
        params.append('categoryType', categoryType);
      }
      window.location.href = `/search?${params.toString()}`;
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative flex items-center w-full rounded-lg border border-gray-400 bg-white shadow-sm transition-colors focus-within:border-purple-500">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder={translations.searchPlaceholder[language]}
          className="flex-1 py-2 px-3 pr-10 outline-none text-sm text-gray-700 bg-transparent placeholder-gray-400 h-9 rounded-lg"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />
        <button 
          onClick={handleSearch}
          className="absolute right-3 text-gray-500 hover:text-purple-600 transition-colors"
        >
          <Search size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};
