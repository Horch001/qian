import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, MapPin, ChevronDown, ChevronRight, ArrowLeft, Check, Globe, Loader2 } from 'lucide-react';
import { Language, Translations, Country, Region } from '../types';
import { LOCATION_DATA } from '../constants/locations';
import { productApi } from '../services/api';

interface SearchSuggestion {
  id: string;
  title: string;
  titleEn?: string;
  icon?: string;
  price: string;
  images?: string[];
}

interface SearchBarProps {
  language: Language;
  translations: Translations;
}

export const SearchBar: React.FC<SearchBarProps> = ({ language, translations }) => {
  const [selectedCity, setSelectedCity] = useState('NATIONWIDE');
  const [isOpen, setIsOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<number | null>(null);

  const [viewLevel, setViewLevel] = useState<'COUNTRY' | 'REGION' | 'CITY'>('COUNTRY');
  const [currentCountry, setCurrentCountry] = useState<Country | null>(null);
  const [currentRegion, setCurrentRegion] = useState<Region | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const china = LOCATION_DATA.find(c => c.name === '中国') || null;
      setViewLevel('REGION');
      setCurrentCountry(china);
      setCurrentRegion(null);
    }
  }, [isOpen]);

  const handleBack = () => {
    if (viewLevel === 'CITY') {
      setViewLevel('REGION');
      setCurrentRegion(null);
    } else if (viewLevel === 'REGION') {
      setViewLevel('COUNTRY');
      setCurrentCountry(null);
    }
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setIsOpen(false);
  };

  // 防抖搜索建议
  const fetchSuggestions = useCallback(async (keyword: string) => {
    if (keyword.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const results = await productApi.searchSuggestions(keyword, 8);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  // 处理搜索输入变化 - 300ms防抖
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchKeyword(value);

    // 清除之前的定时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // 设置新的防抖定时器
    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  // 处理搜索 - 使用 React Router 导航避免白屏
  const handleSearch = (keyword?: string) => {
    const searchTerm = keyword || searchKeyword.trim();
    if (searchTerm) {
      setShowSuggestions(false);
      // 使用 history API 进行导航，避免页面刷新
      const url = `/search?keyword=${encodeURIComponent(searchTerm)}&city=${encodeURIComponent(selectedCity)}`;
      window.history.pushState({}, '', url);
      window.dispatchEvent(new PopStateEvent('popstate'));
      // 强制刷新当前路由
      window.location.assign(url);
    }
  };

  // 选择建议项 - 直接跳转到商品详情
  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    setSearchKeyword(language === 'en' && suggestion.titleEn ? suggestion.titleEn : suggestion.title);
    setShowSuggestions(false);
    // 直接跳转到搜索结果
    const url = `/search?keyword=${encodeURIComponent(suggestion.title)}&city=${encodeURIComponent(selectedCity)}`;
    window.location.assign(url);
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // 点击外部关闭建议
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto z-30" ref={dropdownRef}>
      <div className="relative flex items-center w-full rounded-lg border border-gray-400 bg-white shadow-sm transition-colors focus-within:border-purple-500">
        
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 pl-3 pr-2 h-9 cursor-pointer group hover:bg-gray-50 rounded-l-lg transition-colors shrink-0"
        >
          <MapPin size={14} className="text-purple-600" strokeWidth={2.5} />
          <span className="text-[13px] font-bold text-gray-700 truncate max-w-[4.5rem]">
            {selectedCity === 'NATIONWIDE' ? translations.nationwide[language] : selectedCity}
          </span>
          <ChevronDown 
            size={12} 
            className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
            strokeWidth={2.5}
          />
        </button>

        <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>

        <div className="flex-1 relative" ref={searchInputRef}>
          <input
            type="text"
            value={searchKeyword}
            onChange={handleSearchInputChange}
            placeholder={translations.searchPlaceholder[language]}
            className="w-full py-1.5 pr-10 outline-none text-sm text-gray-700 bg-transparent placeholder-gray-400 h-full min-w-0"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
          />

          {/* 搜索建议下拉框 */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-80 overflow-y-auto z-50">
              {isLoadingSuggestions ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                </div>
              ) : (
                suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="w-full px-3 py-2 flex items-center gap-3 hover:bg-purple-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {suggestion.images && suggestion.images.length > 0 ? (
                        <img src={suggestion.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg">{suggestion.icon || '📦'}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 truncate">
                        {language === 'en' && suggestion.titleEn ? suggestion.titleEn : suggestion.title}
                      </p>
                      <p className="text-xs text-red-500 font-bold">{suggestion.price}π</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <button 
          className="absolute right-3 text-gray-500 hover:text-purple-600 transition-colors"
          onClick={() => handleSearch()}
        >
          <Search size={18} strokeWidth={2.5} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-48 bg-white/95 backdrop-blur-xl rounded-lg border border-white/50 shadow-xl overflow-hidden max-h-[60vh] flex flex-col">
          
          <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2 bg-purple-50/50 flex-none">
            {viewLevel !== 'COUNTRY' ? (
              <button onClick={handleBack} className="p-0.5 hover:bg-purple-100 rounded text-purple-700">
                <ArrowLeft size={14} strokeWidth={2.5} />
              </button>
            ) : (
              <Globe size={14} className="text-purple-400" />
            )}
            <span className="text-[11px] font-bold text-purple-900 truncate">
              {viewLevel === 'COUNTRY' && translations.selectCountry[language]}
              {viewLevel === 'REGION' && currentCountry?.name}
              {viewLevel === 'CITY' && `${currentRegion?.name}`}
            </span>
          </div>

          <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-purple-200 p-1">
            
            <div className="flex flex-col">
              <button
                onClick={() => handleCitySelect('NATIONWIDE')}
                className="w-full text-left px-3 py-2 text-[12px] font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded flex items-center justify-between"
              >
                <span>🌍 {translations.nationwide[language]}</span>
                {selectedCity === 'NATIONWIDE' && <Check size={12} className="text-purple-600" />}
              </button>
            </div>

            {viewLevel === 'COUNTRY' && (
              <div className="flex flex-col">
                {LOCATION_DATA.map((country) => (
                  <button
                    key={country.name}
                    onClick={() => {
                      setCurrentCountry(country);
                      setViewLevel('REGION');
                    }}
                    className="w-full text-left px-3 py-2 text-[12px] font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded flex items-center justify-between"
                  >
                    <span>{country.name}</span>
                    <ChevronRight size={12} className="text-gray-400" />
                  </button>
                ))}
              </div>
            )}

            {viewLevel === 'REGION' && currentCountry && (
              <div className="flex flex-col">
                {currentCountry.regions.map((region) => (
                  <button
                    key={region.name}
                    onClick={() => {
                      setCurrentRegion(region);
                      setViewLevel('CITY');
                    }}
                    className="w-full text-left px-3 py-2 text-[12px] font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded flex items-center justify-between"
                  >
                    <span>{region.name}</span>
                    <ChevronRight size={12} className="text-gray-400" />
                  </button>
                ))}
              </div>
            )}

            {viewLevel === 'CITY' && currentRegion && (
              <div className="flex flex-col">
                {currentRegion.cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => handleCitySelect(city)}
                    className="w-full text-left px-3 py-2 text-[12px] font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded flex items-center justify-between"
                  >
                    <span>{city}</span>
                    {selectedCity === city && <Check size={12} className="text-purple-600" strokeWidth={3} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
