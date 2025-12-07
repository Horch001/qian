import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Language, CategoryItem } from '../types';

interface CategoryCardProps {
  item: CategoryItem;
  language: Language;
}

// 路由映射
const categoryRoutes: Record<string, string> = {
  '1': '/physical-mall',
  '2': '/virtual-mall',
  '3': '/home-service',
  '4': '/offline-play',
  '5': '/courses',
  '6': '/detective',
  '7': '/tree-hole',
  '8': '/venture-capital',
  '9': '/escrow-trade',
  '10': '/seek-resources',
  '11': '/casual-games',
  '12': '/friendly-links',
};

export const CategoryCard: React.FC<CategoryCardProps> = ({ item, language }) => {
  const navigate = useNavigate();
  const Icon = item.icon;
  const titleSizeClass = language === 'zh' ? 'text-[13px]' : 'text-[11px]';

  const handleClick = () => {
    const route = categoryRoutes[item.id];
    if (route) {
      navigate(route);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="group relative overflow-hidden rounded-2xl px-2.5 pt-2.5 pb-2 transition-all duration-300 cursor-pointer flex flex-col gap-2
                    bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl
                    border border-white/20
                    shadow-[0_4px_20px_rgba(0,0,0,0.15),0_1px_3px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.2)]
                    hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.2),0_2px_6px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.3)]
                    hover:border-white/30
                    active:translate-y-0 active:shadow-[0_2px_10px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.15)]">
      
      {/* 背景光效 */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-pink-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
      
      {/* 顶部高光 */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
      
      <div className="flex items-center gap-1.5 relative z-10">
        <Icon className={`w-4 h-4 ${item.iconColor || 'text-gray-50'} flex-shrink-0`} 
              strokeWidth={2.5}
              style={{
                filter: 'drop-shadow(0 1px 0 rgba(255,255,255,0.5)) drop-shadow(0 2px 3px rgba(0,0,0,0.8)) drop-shadow(1px 1px 0 rgba(139,92,246,0.4)) drop-shadow(2px 2px 0 rgba(139,92,246,0.2))'
              }} />
        <h3 className={`font-extrabold text-white ${titleSizeClass} tracking-wide leading-none pt-0.5`}
            style={{
              textShadow: '0 1px 0 rgba(255,255,255,0.4), 0 2px 3px rgba(0,0,0,0.8), 0 0 0 rgba(139,92,246,0.5), 1px 1px 0 rgba(139,92,246,0.3), 2px 2px 0 rgba(139,92,246,0.2), 3px 3px 0 rgba(139,92,246,0.1)',
            }}>
          {item.title[language]}
        </h3>
      </div>

      <p className="text-[10px] text-gray-300 leading-tight font-normal text-left line-clamp-3 overflow-hidden relative z-10 drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
        {item.description[language]}
      </p>

      {/* 底部渐变遮罩 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent pointer-events-none rounded-2xl"></div>
    </div>
  );
};
