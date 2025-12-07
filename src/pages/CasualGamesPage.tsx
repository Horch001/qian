import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowLeft, Gamepad2, Trophy } from 'lucide-react';
import { Language, Translations } from '../types';

export const CasualGamesPage: React.FC = () => {
  const navigate = useNavigate();
  const { language, translations } = useOutletContext<{ language: Language; translations: Translations }>();

  const getText = (obj: { [key: string]: string }) => obj[language] || obj.zh;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 pb-20">
      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg">
        <div className="flex items-center justify-between p-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">
            {getText({ zh: '休闲游戏', en: 'Casual Games', ko: '캐주얼 게임', vi: 'Trò chơi giải trí' })}
          </h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* 游戏开发中提示 */}
      <div className="p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <Gamepad2 size={80} className="mx-auto text-purple-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {getText({ zh: '游戏开发中', en: 'Games Coming Soon', ko: '게임 개발 중', vi: 'Trò chơi đang phát triển' })}
          </h2>
          <p className="text-gray-600 mb-6">
            {getText({ 
              zh: '我们正在开发精彩的休闲游戏，敬请期待！', 
              en: 'We are developing exciting casual games, stay tuned!', 
              ko: '흥미진진한 캐주얼 게임을 개발 중입니다. 기대해 주세요!', 
              vi: 'Chúng tôi đang phát triển các trò chơi giải trí thú vị, hãy chờ đón!' 
            })}
          </p>

          {/* 即将推出的游戏预告 */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-4">
              <div className="text-4xl mb-2">🎮</div>
              <div className="text-sm font-bold text-gray-800">
                {getText({ zh: '斗地主', en: 'Dou Dizhu', ko: '투디주', vi: 'Đấu Địa Chủ' })}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {getText({ zh: '即将推出', en: 'Coming Soon', ko: '곧 출시', vi: 'Sắp ra mắt' })}
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl p-4">
              <div className="text-4xl mb-2">🃏</div>
              <div className="text-sm font-bold text-gray-800">
                {getText({ zh: '炸金花', en: 'Zhajinhua', ko: '자진화', vi: 'Zhajinhua' })}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {getText({ zh: '即将推出', en: 'Coming Soon', ko: '곧 출시', vi: 'Sắp ra mắt' })}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-4">
              <div className="text-4xl mb-2">🎯</div>
              <div className="text-sm font-bold text-gray-800">
                {getText({ zh: '消消乐', en: 'Match 3', ko: '매치 3', vi: 'Xếp hình' })}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {getText({ zh: '即将推出', en: 'Coming Soon', ko: '곧 출시', vi: 'Sắp ra mắt' })}
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-4">
              <div className="text-4xl mb-2">🏃</div>
              <div className="text-sm font-bold text-gray-800">
                {getText({ zh: '跑酷游戏', en: 'Parkour', ko: '파쿠르', vi: 'Chạy parkour' })}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {getText({ zh: '即将推出', en: 'Coming Soon', ko: '곧 출시', vi: 'Sắp ra mắt' })}
              </div>
            </div>
          </div>

          {/* 排行榜预告 */}
          <div className="mt-8 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="text-yellow-600" size={24} />
              <span className="font-bold text-gray-800">
                {getText({ zh: '排行榜系统', en: 'Leaderboard', ko: '리더보드', vi: 'Bảng xếp hạng' })}
              </span>
            </div>
            <p className="text-xs text-gray-600">
              {getText({ 
                zh: '与全球玩家竞技，赢取丰厚奖励', 
                en: 'Compete with players worldwide for rewards', 
                ko: '전 세계 플레이어와 경쟁하여 보상 획득', 
                vi: 'Cạnh tranh với người chơi toàn cầu để nhận phần thưởng' 
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
