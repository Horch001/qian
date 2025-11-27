import React, { useState, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Star, BookOpen, Video, Sparkles, Award, ChevronDown } from 'lucide-react';
import { Language, Translations } from '../types';
import { SimpleSearchBar } from '../components/SimpleSearchBar';

export const CoursePagePage: React.FC = () => {
  const { language, translations } = useOutletContext<{ language: Language; translations: Translations }>();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('default');
  const navigate = useNavigate();

  const goToDetail = (course: any) => {
    navigate('/detail', { state: { item: { ...course, title: course.title }, pageType: 'course' } });
  };

  const courses = [
    {
      id: '1',
      title: { zh: '编程进阶课程', en: 'Programming Courses', ko: '프로그래밍 과정', vi: 'Khóa học lập trình' },
      icon: '💻',
      price: 199,
      rating: 4.9,
      sales: 3580,
      favorites: 2345,
      students: 12580,
      shop: { zh: '编程学院', en: 'Programming Academy', ko: '프로그래밍 아카데미', vi: 'Học viện lập trình' },
      level: { zh: '进阶', en: 'Advanced', ko: '고급', vi: 'Nâng cao' },
    },
    {
      id: '2',
      title: { zh: '设计创意训练营', en: 'Design Bootcamp', ko: '디자인 부트캠프', vi: 'Bootcamp thiết kế' },
      icon: '🎨',
      price: 299,
      rating: 4.8,
      sales: 2156,
      favorites: 1567,
      students: 8956,
      shop: { zh: '创意设计学院', en: 'Design Academy', ko: '디자인 아카데미', vi: 'Học viện thiết kế' },
      level: { zh: '专业', en: 'Professional', ko: '전문가', vi: 'Chuyên nghiệp' },
    },
    {
      id: '3',
      title: { zh: '英语口语训练', en: 'English Speaking', ko: '영어 말하기', vi: 'Nói tiếng Anh' },
      icon: '🌍',
      price: 99,
      rating: 4.7,
      sales: 5234,
      favorites: 3456,
      students: 15234,
      shop: { zh: '国际语言中心', en: 'Language Center', ko: '언어 센터', vi: 'Trung tâm ngôn ngữ' },
      level: { zh: '入门', en: 'Beginner', ko: '초급', vi: 'Cơ bản' },
    },
  ];

  const sortOptions = [
    { value: 'default', label: { zh: '默认排序', en: 'Default', ko: '기본', vi: 'Mặc định' } },
    { value: 'price_high', label: { zh: '价格从高到低', en: 'Price: High to Low', ko: '가격: 높은순', vi: 'Giá: Cao đến thấp' } },
    { value: 'price_low', label: { zh: '价格从低到高', en: 'Price: Low to High', ko: '가격: 낮은순', vi: 'Giá: Thấp đến cao' } },
    { value: 'sales', label: { zh: '销量优先', en: 'Best Selling', ko: '판매량순', vi: 'Bán chạy nhất' } },
    { value: 'deposit', label: { zh: '已缴纳保证金', en: 'Deposit Paid', ko: '보증금 납부', vi: 'Đã đặt cọc' } },
  ];

  const sortedCourses = useMemo(() => {
    const sorted = [...courses];
    switch (sortBy) {
      case 'price_high': return sorted.sort((a, b) => b.price - a.price);
      case 'price_low': return sorted.sort((a, b) => a.price - b.price);
      case 'sales': return sorted.sort((a, b) => b.sales - a.sales);
      default: return sorted;
    }
  }, [sortBy]);

  const features = [
    { icon: BookOpen, text: { zh: '实用课程', en: 'Practical Courses', ko: '실용 과정', vi: 'Khóa học thực tế' } },
    { icon: Video, text: { zh: '视频音频', en: 'Video & Audio', ko: '비디오 오디오', vi: 'Video & Audio' } },
    { icon: Sparkles, text: { zh: '应有尽有', en: 'Everything', ko: '모든 것', vi: 'Đầy đủ' } },
    { icon: Star, text: { zh: '精品课程', en: 'Premium', ko: '프리미엄', vi: 'Cao cấp' } },
  ];

  const getLevelColor = (level: string) => {
    if (level.includes('入门') || level.includes('Beginner')) return 'from-green-500 to-emerald-500';
    if (level.includes('进阶') || level.includes('Advanced')) return 'from-blue-500 to-cyan-500';
    if (level.includes('专业') || level.includes('Professional')) return 'from-purple-500 to-pink-500';
    return 'from-orange-500 to-red-500';
  };

  return (
    <div className="space-y-1">
      {/* 搜索框 */}
      <SimpleSearchBar language={language} translations={translations} />
      
      {/* 特色功能 */}
      <div className="grid grid-cols-4 gap-1.5">
        {features.map((feature, idx) => (
          <div key={idx} className="flex flex-col items-center gap-0.5 py-1">
            <feature.icon className="w-4 h-4 text-purple-600" strokeWidth={2.5} />
            <span className="text-[9px] text-gray-700 font-bold text-center leading-tight">{feature.text[language]}</span>
          </div>
        ))}
      </div>

      {/* 筛选下拉框 */}
      <div className="relative">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 appearance-none cursor-pointer focus:outline-none focus:border-purple-400"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label[language]}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      {/* 课程列表 */}
      <div className="space-y-2">
        {sortedCourses.map((course) => (
          <div
            key={course.id}
            onClick={() => goToDetail(course)}
            className={`group relative overflow-hidden rounded-xl p-2 transition-all duration-300 cursor-pointer
                       ${selectedCourse === course.id 
                         ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-purple-400 shadow-lg' 
                         : 'bg-white border border-purple-100 shadow-sm hover:shadow-lg hover:border-purple-300'}`}
          >
            {/* 等级标签 */}
            <div className={`absolute top-0 right-0 bg-gradient-to-r ${getLevelColor(course.level[language])} text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg rounded-tr-lg shadow-md`}>
              {course.level[language]}
            </div>
            
            <div className="flex gap-2 relative">
              <div className="w-14 h-14 flex items-center justify-center text-3xl flex-shrink-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg shadow-inner">
                {course.icon}
              </div>
              <div className="flex-1 min-w-0 flex flex-col pr-16">
                <h3 className="font-bold text-gray-800 text-sm mb-0.5 line-clamp-1">
                  {course.title[language]}
                </h3>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-red-600 font-bold text-base leading-none">{course.price}π</span>
                  <div className="flex gap-2">
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] text-gray-600 leading-none">{language === 'zh' ? '已售' : 'Sold'}</span>
                      <span className="text-[10px] text-gray-900 font-bold leading-none mt-0.5">{course.sales}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] text-gray-600 leading-none">{language === 'zh' ? '收藏' : 'Favs'}</span>
                      <span className="text-[10px] text-gray-900 font-bold leading-none mt-0.5">{course.favorites}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Award className="w-3 h-3 text-purple-600" />
                  <span>{course.shop[language]}</span>
                  <span className="flex items-center gap-0.5 text-yellow-600">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold">{course.rating}</span>
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); goToDetail(course); }}
              className="absolute bottom-1 right-1 px-3 py-1 bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold rounded-lg hover:from-red-700 hover:to-red-600 active:scale-95 transition-all shadow-md">
              {language === 'zh' ? '购买' : language === 'en' ? 'Buy' : language === 'ko' ? '구매' : 'Mua'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
