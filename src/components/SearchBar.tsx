import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, ChevronDown, ChevronRight, ArrowLeft, Check, Globe } from 'lucide-react';
import { Language, Translations, Country, Region } from '../types';
import { LOCATION_DATA } from '../constants/locations';

interface SearchBarProps {
  language: Language;
  translations: Translations;
}

export const SearchBar: React.FC<SearchBarProps> = ({ language, translations }) => {
  const [selectedCity, setSelectedCity] = useState('NATIONWIDE');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

        <input
          type="text"
          placeholder={translations.searchPlaceholder[language]}
          className="flex-1 py-1.5 pr-10 outline-none text-sm text-gray-700 bg-transparent placeholder-gray-400 h-full min-w-0"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const input = e.target as HTMLInputElement;
              const keyword = input.value.trim();
              if (keyword) {
                // 全局搜索 - 跳转到搜索结果页面
                window.location.href = `/search?keyword=${encodeURIComponent(keyword)}&city=${encodeURIComponent(selectedCity)}`;
              }
            }
          }}
        />

        <button 
          className="absolute right-3 text-gray-500 hover:text-purple-600 transition-colors"
          onClick={() => {
            const input = document.querySelector('input[type="text"]') as HTMLInputElement;
            const keyword = input?.value?.trim();
            if (keyword) {
              window.location.href = `/search?keyword=${encodeURIComponent(keyword)}&city=${encodeURIComponent(selectedCity)}`;
            }
          }}
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
