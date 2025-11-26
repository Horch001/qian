import React, { useState, useRef, useEffect } from 'react';
import { Volume2, X } from 'lucide-react';
import { Language, Translations } from '../types';

interface AnnouncementBarProps {
  language: Language;
  translations: Translations;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ language, translations }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const announcementText = translations.announcement[language];

  return (
    <>
      <div 
        onClick={() => setIsModalOpen(true)}
        className="w-full bg-purple-900/5 backdrop-blur-sm border-b border-purple-900/5 h-7 flex items-center overflow-hidden px-3 cursor-pointer active:bg-purple-900/10 transition-colors"
      >
        <div className="flex items-center gap-1.5 text-yellow-300 z-10 bg-transparent pr-2 shrink-0">
          <Volume2 size={14} strokeWidth={2.5} className="fill-yellow-300/40" />
        </div>
        <div className="flex-1 relative h-full flex items-center overflow-hidden">
          <div className="whitespace-nowrap animate-marquee text-[11px] font-bold text-yellow-300 tracking-wide">
            {announcementText}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>
          
          <div className="relative w-full max-w-sm bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2 text-yellow-600">
                <Volume2 size={18} />
                <h3 className="font-bold text-lg text-gray-900">{translations.systemNotice[language]}</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="text-sm text-gray-700 leading-relaxed">
              {announcementText}
            </div>

            <button 
              onClick={() => setIsModalOpen(false)}
              className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm transition-colors shadow-lg shadow-purple-500/30"
            >
              {translations.iKnow[language]}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
