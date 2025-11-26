import React from 'react';
import { Search } from 'lucide-react';
import { Language, Translations } from '../types';

interface SimpleSearchBarProps {
  language: Language;
  translations: Translations;
}

export const SimpleSearchBar: React.FC<SimpleSearchBarProps> = ({ language, translations }) => {
  return (
    <div className="relative w-full">
      <div className="relative flex items-center w-full rounded-lg border border-gray-400 bg-white shadow-sm transition-colors focus-within:border-purple-500">
        <input
          type="text"
          placeholder={translations.searchPlaceholder[language]}
          className="flex-1 py-2 px-3 pr-10 outline-none text-sm text-gray-700 bg-transparent placeholder-gray-400 h-9 rounded-lg"
        />
        <div className="absolute right-3 text-gray-500 pointer-events-none">
          <Search size={18} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
};
